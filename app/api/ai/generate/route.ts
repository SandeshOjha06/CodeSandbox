import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";
import { error } from "console";

export async function POST(req: Request) {
    const { prompt, language } = await req.json()

    if (!prompt || !language) {
        return Response.json(
            { error: "Missing prompt or language" },
            { status: 400 },
        )
    }

    try {
        const systemPrompt = `You are an expert ${language} developer. Generate ONLY clean code, nothing else.

IMPORTANT RULES:
- Output ONLY the code itself
- NO markdown code blocks
- NO backticks
- NO language identifiers like \`\`\`javascript
- NO explanations or comments outside the code
- NO "Here's the code:" or similar text
- Write comments INSIDE the code if needed
- Make the code complete and ready to run`

        const { text } = await generateText({
            model: groq('llama-3.1-8b-instant'),
            system: systemPrompt,
            prompt,
            temperature: 0.7,
        })

        let cleanCode = text.trim()

        cleanCode = cleanCode.replace(/^```[\s\S]*?\n/, '')
        cleanCode = cleanCode.replace(/\n```[\s\S]*?$/, '')

        cleanCode = cleanCode.replace(/^`+|`+$/g, '')

        cleanCode = cleanCode.replace(/^(javascript|typescript|python|html|css|jsx|tsx)\n/i, '')

        cleanCode = cleanCode.trim()

        console.log('Cleaned code:', cleanCode)

        return Response.json({ code: cleanCode })
    } catch (error) {
        console.error("Process failed: ", error);
        return Response.json(
            { error: "Failed to generate code" },
            { status: 500 },
        )

    }
}