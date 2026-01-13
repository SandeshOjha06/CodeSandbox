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
        const systemPrompt = `You are an expert ${language} developer. Generate clean, production-ready code based on the user's request.

Requirements:
- Write only the code, no explanations or markdown backticks
- Include comments for complex logic
- Follow best practices and conventions for ${language}
- Make the code reusable and well-structured
- If it's a function, make it complete and ready to use`

const { text } = await generateText({
    model: groq('llama-3.1-8b-instant'),
    system: systemPrompt,
    prompt,
})

return Response.json({ code: text })
    } catch (error) {
        console.error("Process failed: ", error);
        return Response.json(
            {error: "Failed to generate code"},
            {status: 500},
        )
        
    }
}