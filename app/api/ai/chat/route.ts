import { streamText } from 'ai'
import { groq } from '@ai-sdk/groq'

export async function POST(req: Request) {
  const { messages, codeContext } = await req.json()

  const systemPrompt = `You are an expert code assistant.

${codeContext ? `Current code:\n${codeContext}` : ''}`

const result = await streamText({
  model: groq('llama-3.1-70b-versatile'),
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
