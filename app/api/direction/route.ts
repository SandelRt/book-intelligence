import { createClient } from '@/lib/supabase/server'
import { getWriterDNASummary } from '@/lib/dna/preferences'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { chapterContent, chapterTitle, manuscriptTitle, genre, trigger } = await req.json()

  const dna = await getWriterDNASummary(user.id, supabase)

  const styleContext = dna.style
    ? `The writer tends to use ${dna.style.avg_sentence_len.toFixed(0)}-word sentences on average. Their vocab richness score is ${(dna.style.vocab_richness * 100).toFixed(0)}%. Dominant tone signals: ${Object.entries(dna.style.tone_markers as Record<string, number>).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([k]) => k).join(', ') || 'neutral'}.`
    : ''

  const recentDislikes = dna.recentAnnotations
    .filter((a) => a.label === 'did_not_work')
    .slice(0, 3)
    .map((a) => a.note || a.selection_text || '')
    .filter(Boolean)
    .join('\n- ')

  const triggerContext = {
    idle: "The writer has been inactive for a while — they may be stuck or unsure how to continue.",
    delete_loop: "The writer has been deleting the same passage repeatedly — they're not happy with what's on the page.",
    manual: "The writer explicitly asked for help — they feel stuck.",
  }[trigger as string] ?? ''

  const systemPrompt = `You are a warm, supportive writing partner. You help novelists find their way forward when they're stuck — never preachy, never generic. You know their story and you know them.

${styleContext}
${recentDislikes ? `Things this writer has marked as "didn't work" recently:\n- ${recentDislikes}` : ''}

Always offer exactly 3 options at different levels of invasiveness:
1. A structural zoom-out (where are they in the arc, what beat comes next)
2. An alternative angle (different approach to the current scene)
3. A small concrete starting point (a sentence or image to react to)

Keep each option to 2-3 sentences. Be specific to their story — never give generic writing advice. Sound like a friend, not an AI.`

  const userPrompt = `${triggerContext}

Book: "${manuscriptTitle}"${genre ? ` (${genre})` : ''}
Chapter: "${chapterTitle}"

What they have so far in this chapter:
---
${chapterContent ? chapterContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 1500) : '(blank — nothing written yet)'}
---

Give them 3 ways forward. Be specific, warm, brief.`

  const anthropicKey = process.env.ANTHROPIC_API_KEY
  if (!anthropicKey) {
    return new Response('No AI API key found.', { status: 500 })
  }

  const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': anthropicKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
      stream: true
    })
  })

  if (!anthropicRes.ok) {
    const errorBody = await anthropicRes.text()
    console.error('Anthropic API Error:', errorBody)
    return new Response('AI API Error', { status: 500 })
  }

  let fullText = ''
  
  const readableStream = new ReadableStream({
    async start(controller) {
      if (!anthropicRes.body) return
      
      const reader = anthropicRes.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.slice(6)
              if (dataStr === '[DONE]') continue
              try {
                const event = JSON.parse(dataStr)
                if (event.type === 'content_block_delta' && event.delta?.text) {
                  fullText += event.delta.text
                  // We yield plain text to the client so the frontend logic remains untouched!
                  controller.enqueue(new TextEncoder().encode(event.delta.text))
                }
              } catch (e) {
                // Ignore parse errors on partial chunks
              }
            }
          }
        }
        
        controller.close()
        
        // Fire and forget store
        supabase.from('ai_suggestions').insert({
          user_id: user.id,
          type: 'direction',
          prompt_context: `chapter: ${chapterTitle}`,
          suggestion_text: fullText,
          model: 'claude-3-haiku-20240307',
        }).then(() => {})

      } catch (e) {
        controller.error(e)
      }
    }
  })

  return new Response(readableStream)
}
