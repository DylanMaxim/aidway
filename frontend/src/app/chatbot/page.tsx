"use client"

import { useState, useRef, useEffect } from "react"

interface Message {
    role: "user" | "assistant"
    text: string
}

export default function ChatbotPage() {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "assistant",
            text: "Hi, I'm here to help you with any women's health questions or concerns you might have. Everything you share is confidential. What's on your mind today?",
        },
    ])
    const [input, setInput] = useState("")
    const [loading, setLoading] = useState(false)
    const [apiError, setApiError] = useState<string | null>(null)
    const bottomRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLTextAreaElement>(null)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    const sendMessage = async () => {
        const text = input.trim()
        if (!text || loading) return

        const newMessages: Message[] = [...messages, { role: "user", text }]
        setMessages(newMessages)
        setInput("")
        setLoading(true)
        setApiError(null)

        try {
            const res = await fetch("/chatbot/api", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: newMessages }),
            })
            const data = await res.json()
            if (data.error) throw new Error(data.error)
            setMessages([...newMessages, { role: "assistant", text: data.text }])
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Something went wrong"
            setApiError(msg)
        } finally {
            setLoading(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            sendMessage()
        }
    }

    return (
        <main className="min-h-screen bg-gray-50 flex flex-col">

            {/* Page header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="inline-block w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Women's Health Assistant</span>
                    </div>
                    <h1 className="text-xl font-bold text-gray-900">Health Consultation</h1>
                    <p className="text-sm text-gray-500 mt-0.5">
                        Chat about your health concerns in a safe, confidential space
                    </p>
                </div>
            </div>

            <div className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 flex flex-col gap-6">

                {/* Chat window */}
                <div
                    id="chat-window"
                    className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4 overflow-y-auto"
                    style={{ minHeight: "420px", maxHeight: "560px" }}
                >
                    {messages.map((msg, i) => (
                        <div
                            key={i}
                            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            {msg.role === "assistant" && (
                                <div className="w-8 h-8 rounded-full bg-[var(--color_red)] flex items-center justify-center text-white text-xs font-bold mr-2 flex-shrink-0 mt-0.5">
                                    AI
                                </div>
                            )}
                            <div
                                className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap
                  ${msg.role === "user"
                                        ? "bg-[var(--color_red)] text-white rounded-br-sm"
                                        : "bg-gray-100 text-gray-800 rounded-bl-sm"
                                    }`}
                            >
                                {msg.text}
                            </div>
                        </div>
                    ))}

                    {loading && (
                        <div className="flex justify-start">
                            <div className="w-8 h-8 rounded-full bg-[var(--color_red)] flex items-center justify-center text-white text-xs font-bold mr-2 flex-shrink-0">
                                AI
                            </div>
                            <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1.5">
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                            </div>
                        </div>
                    )}

                    {apiError && (
                        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm">
                            ⚠️ {apiError} — Check that your <code className="bg-red-100 px-1 rounded">GEMINI_API_KEY</code> is set in <code className="bg-red-100 px-1 rounded">frontend/.env.local</code>
                        </div>
                    )}

                    <div ref={bottomRef} />
                </div>

                {/* Input area */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex gap-3 items-end">
                    <textarea
                        ref={inputRef}
                        id="chat-input"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Share your symptoms or concerns… (Enter to send, Shift+Enter for new line)"
                        rows={2}
                        className="flex-1 resize-none border-0 outline-none text-sm text-gray-800 placeholder-gray-400 bg-transparent leading-relaxed"
                        disabled={loading}
                    />
                    <button
                        id="send-btn"
                        onClick={sendMessage}
                        disabled={!input.trim() || loading}
                        className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all
              ${input.trim() && !loading
                                ? "bg-[var(--color_red)] hover:bg-[var(--color_red_tinted)] text-white hover:scale-105 active:scale-95 shadow-sm"
                                : "bg-gray-100 text-gray-300 cursor-not-allowed"
                            }`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </button>
                </div>
            </div>
        </main>
    )
}