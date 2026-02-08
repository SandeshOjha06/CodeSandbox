import { streamText } from 'ai'
import { groq } from '@ai-sdk/groq'

export async function POST(req: Request) {
  const { messages, codeContext } = await req.json()

 const systemPrompt = `You are an expert code assistant.

STRICT OUTPUT RULES:
- Output ONLY plain source code
- NO markdown
- NO titles or headings
- NO explanations or descriptions
- NO code fences
- NO language identifiers
- NO comments inside the code
- Provide only ONE example
- Do not add blank text before or after the code

If any rule is violated, the output is invalid.

${codeContext ? 'Current code:\n' + codeContext : ''}`;


  const result = await streamText({
    model: groq('llama-3.1-8b-instant'),
    system: systemPrompt,
    messages,
  })

  const encoder = new TextEncoder()

  return new Response(
    new ReadableStream({
      async start(controller) {
        for await (const chunk of result.textStream) {
          controller.enqueue(encoder.encode(chunk))
        }
        controller.close()
      },
    }),
    {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    }
  )
}
