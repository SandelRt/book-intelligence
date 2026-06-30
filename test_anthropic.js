const fs = require('fs');

async function testAnthropic() {
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': anthropicKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-haiku-20240307',
      max_tokens: 100,
      system: 'You are a bot',
      messages: [{ role: 'user', content: 'Say hello' }],
      stream: true
    })
  });

  const reader = anthropicRes.body.getReader();
  const decoder = new TextDecoder();
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    console.log("CHUNK:", JSON.stringify(chunk));
  }
}

testAnthropic();
