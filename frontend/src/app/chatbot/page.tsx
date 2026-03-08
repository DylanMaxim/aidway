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
            text: "Hi! I'm here to help collect your sanitary product needs so we can get the right supplies to the right people. Could you start by telling me where the products are needed and roughly how many people are affected?",
        },
    ])
    const [input, setInput] = useState("")
    const [loading, setLoading] = useState(false)
    const [jsonOutput, setJsonOutput] = useState<string | null>(null)
    const [jsonLoading, setJsonLoading] = useState(false)
    const [jsonError, setJsonError] = useState<string | null>(null)
    const [apiError, setApiError] = useState<string | null>(null)
    const bottomRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLTextAreaElement>(null)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages, jsonOutput])

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

    const generateJson = async () => {
        setJsonLoading(true)
        setJsonError(null)
        setJsonOutput(null)

        try {
            const res = await fetch("/chatbot/api", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages, generateJson: true }),
            })
            const data = await res.json()
            if (data.error) throw new Error(data.error)
            // Try to pretty-print if it's valid JSON
            try {
                const parsed = JSON.parse(data.text)
                setJsonOutput(JSON.stringify(parsed, null, 2))
            } catch {
                setJsonOutput(data.text)
            }
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Failed to generate JSON"
            setJsonError(msg)
        } finally {
            setJsonLoading(false)
        }
    }

    const downloadJson = () => {
        if (!jsonOutput) return
        const blob = new Blob([jsonOutput], { type: "application/json" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = "sanitary_needs.json"
        a.click()
        URL.revokeObjectURL(url)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            sendMessage()
        }
    }

    const canGenerateJson = messages.length >= 4 // At least 2 turns of conversation

    return (
        <main className="min-h-screen bg-gray-50 flex flex-col">

            {/* Page header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="inline-block w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Dev Tool — Chatbot</span>
                        </div>
                        <h1 className="text-xl font-bold text-gray-900">Sanitary Needs Intake</h1>
                        <p className="text-sm text-gray-500 mt-0.5">
                            Chat to collect needs · then export as JSON for the database team
                        </p>
                    </div>
                    <button
                        id="generate-json-btn"
                        onClick={generateJson}
                        disabled={!canGenerateJson || jsonLoading}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm
              ${canGenerateJson && !jsonLoading
                                ? "bg-[var(--color_red)] hover:bg-[var(--color_red_tinted)] text-white hover:scale-105 active:scale-95"
                                : "bg-gray-100 text-gray-400 cursor-not-allowed"
                            }`}
                    >
                        {jsonLoading ? (
                            <>
                                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                </svg>
                                Generating…
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Generate JSON
                            </>
                        )}
                    </button>
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
                        placeholder="Describe what's needed… (Enter to send, Shift+Enter for new line)"
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

                {/* JSON output panel */}
                {(jsonOutput || jsonError) && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50">
                            <div className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-[var(--color_red)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span className="font-semibold text-sm text-gray-700">Generated JSON — <span className="text-gray-400 font-normal">sanitary_needs.json</span></span>
                            </div>
                            {jsonOutput && (
                                <button
                                    id="download-json-btn"
                                    onClick={downloadJson}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--color_red)] text-white text-xs font-semibold rounded-lg hover:bg-[var(--color_red_tinted)] transition-all hover:scale-105 active:scale-95"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    Download
                                </button>
                            )}
                        </div>
                        {jsonError && (
                            <div className="p-5 text-red-600 text-sm">⚠️ {jsonError}</div>
                        )}
                        {jsonOutput && (
                            <pre
                                id="json-output"
                                className="p-5 text-xs text-gray-700 overflow-x-auto leading-relaxed"
                                style={{ fontFamily: "var(--font-geist-mono), monospace", background: "#fafafa" }}
                            >
                                {jsonOutput}
                            </pre>
                        )}
                    </div>
                )}

                {!canGenerateJson && (
                    <p className="text-center text-xs text-gray-400">
                        Chat a little more to unlock the <strong>Generate JSON</strong> button
                    </p>
                )}
            </div>
        </main>
    )
}
