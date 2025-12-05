import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY!)

console.log(process.env.NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY)
export const model = genAI.getGenerativeModel({
    model: "gemini-flash-latest",
    generationConfig: {
        temperature: 0.7,
        topK: 1,
        topP: 1,
        maxOutputTokens: 2048,
    }
})

export async function* streamChatResponse(prompt: string) {
    const chat = model.startChat({
        history: [],
        generationConfig: {
            maxOutputTokens: 2048,
        },
    })

    const result = await chat.sendMessageStream(prompt)

    let totalTokens = 0
    const startTime = Date.now()

    for await (const chunk of result.stream) {
        const text = chunk.text()
        const tokensInChunk = Math.ceil(text.length / 4)
        totalTokens += tokensInChunk

        const elapsedSeconds = (Date.now() - startTime) / 1000
        const tokensPerSecond = elapsedSeconds > 0 ? totalTokens / elapsedSeconds : 0

        yield {
            text,
            tokensPerSecond: tokensPerSecond.toFixed(2),
            totalTokens
        }
    }
}