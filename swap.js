const fs = require('fs')
const path = require('path')

const files = [
  'app/api/beats/route.ts',
  'app/api/direction/route.ts',
  'app/api/generic/route.ts',
  'app/api/references/search/route.ts'
]

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8')
  
  // Replace import and init
  content = content.replace("import Anthropic from '@anthropic-ai/sdk'", "import { GoogleGenAI } from '@google/genai'")
  content = content.replace("const anthropic = new Anthropic()", "const ai = new GoogleGenAI({})")
  
  // Specific replacements
  if (file.includes('beats')) {
    content = content.replace(/const msg = await anthropic\.messages\.create\(\{[\s\S]*?\}\)/, `const msg = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: \`Book: "\${manuscriptTitle}"
Chapter: "\${chapterTitle}" — at \${Math.round(positionPct * 100)}% through the manuscript (\${posLabel})

Excerpt:
\${cleanText}\`,
      config: {
        systemInstruction: \`You are a story structure analyst. Identify the primary narrative beat in the chapter excerpt.
Return ONLY valid JSON: {"beat_type": "<type>"}
Beat types: hook, rising_action, midpoint, all_is_lost, climax, falling_action, resolution, character_beat, world_building\`,
        responseMimeType: "application/json"
      }
    })`)
    content = content.replace("const raw = msg.content[0].type === 'text' ? msg.content[0].text.trim() : ''", "const raw = msg.text?.trim() || ''")
  }
  
  if (file.includes('generic')) {
    content = content.replace(/const msg = await anthropic\.messages\.create\(\{[\s\S]*?\}\)/, `const msg = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: \`Writer's established voice: \${voiceDesc}

Chapter: "\${chapterTitle}"
Excerpt:
\${cleanText}

Rate genericness 0.0–1.0.\`,
      config: {
        systemInstruction: \`You are a writing coach measuring voice distinctiveness.
Compare a chapter excerpt to the writer's established voice and rate how flat or generic it sounds.
0.0 = unmistakably this writer's distinctive voice. 1.0 = could have been written by anyone — flat, voiceless.
Return ONLY valid JSON: {"score": 0.0}\`,
        responseMimeType: "application/json"
      }
    })`)
    content = content.replace("const raw = msg.content[0].type === 'text' ? msg.content[0].text.trim() : ''", "const raw = msg.text?.trim() || ''")
  }
  
  if (file.includes('references')) {
    content = content.replace(/const msg = await anthropic\.messages\.create\(\{[\s\S]*?\}\)/, `const msg = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: \`Book: "\${manuscriptTitle}"\${genre ? \` (\${genre})\` : ''}
Chapter: "\${chapterTitle}"

Excerpt:
\${cleanText}

Reference library:
\${catalogue}

Find the 1–2 most relevant references.\`,
      config: {
        systemInstruction: \`You are a literary analyst. Identify the 1–2 reference books most structurally or tonally relevant to the chapter excerpt. Focus on how the reference handles a similar moment, beat, or challenge — not just genre match.
Return ONLY valid JSON: {"matches": [{"idx": 0, "relevance": "<one sentence: how this book handled a similar challenge>"}]}\`,
        responseMimeType: "application/json"
      }
    })`)
    content = content.replace("const raw = msg.content[0].type === 'text' ? msg.content[0].text.trim() : ''", "const raw = msg.text?.trim() || ''")
  }
  
  if (file.includes('direction')) {
    content = content.replace(/const stream = anthropic\.messages\.stream\(\{[\s\S]*?return new Response\(stream\.toReadableStream\(\)\)/, `const responseStream = await ai.models.generateContentStream({
    model: 'gemini-2.5-flash',
    contents: userPrompt,
    config: {
      systemInstruction: systemPrompt,
    }
  })

  let fullText = ''
  const readableStream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of responseStream) {
          const text = chunk.text
          if (text) {
            fullText += text
            controller.enqueue(new TextEncoder().encode(text))
          }
        }
        controller.close()
        
        // Fire and forget store
        supabase.from('ai_suggestions').insert({
          user_id: user.id,
          type: 'direction',
          prompt_context: \`chapter: \${chapterTitle}\`,
          suggestion_text: fullText,
          model: 'gemini-2.5-flash',
        }).then(() => {})
      } catch (e) {
        controller.error(e)
      }
    }
  })

  return new Response(readableStream)`)
  }
  
  fs.writeFileSync(file, content)
}
console.log('Swapped Anthropic for Google GenAI')
