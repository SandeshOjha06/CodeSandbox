'use client'

import { useState, useCallback } from "react"

interface Message {
    id: string
    role: 'user' | 'assistant'
    content: string
}

export function useAI() {
    const [messages, setMessages] = useState<Message[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const sendMessage = useCallback(async (userMessage: string, codeContext?: string) => {
        if (!userMessage.trim()) return

        //adding usermsg to chat
        const userMsgId = Date.now().toString()
        const newUserMsg: Message = {
            id: userMsgId,
            role: 'user',
            content: userMessage,
        }
        setMessages((prev) => [...prev, newUserMsg])
        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Tyoe': 'application/json' },
                body: JSON.stringify({
                    messages: [
                        ...messages,
                        { role: 'user', content: userMessage },
                    ],
                    codeContext,
                }),
            })
            if (!response.ok) {
                throw new Error("Failed to get response")
            }

            //reading responses
            const reader = response.body?.getReader()
            if (!reader) throw new Error('No response body')

            let fullResponse = ''
            const aiMsgId = (Date.now() + 1).toString()

            const aiMessage: Message = {
                id: aiMsgId,
                role: 'assistant',
                content: '',
            }
            setMessages((prev) => [...prev, aiMessage])

            while (true) {
                const { done, value } = await reader.read()
                if (done) break

                //reading stream chunks
                const chunk = new TextDecoder().decode(value)
                fullResponse += chunk

                // updating aimsg with streaming content
                setMessages((prev) =>
                    prev.map((msg) =>
                        msg.id === aiMsgId
                            ? { ...msg, content: fullResponse }
                            : msg
                    )
                )
            }



        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Unknown error'
            setError(errorMsg)
            console.error('AI error:', err)
        }
        finally{
            setIsLoading(false)
        }
    }, [messages])

    const clearChat = useCallback(() => {
    setMessages([])
    setError(null)
  }, [])

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearChat,
  }




}