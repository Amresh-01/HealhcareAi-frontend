import { useState, useRef, useEffect } from "react"
import {
  Bot,
  Send,
  Mic,
  MicOff,
  Sparkles,
  X,
  Minimize2,
  Maximize2,
} from "lucide-react"

export function AIChatAssistance({
  isOpen,
  onClose,
  isExpanded = false,
  onToggleExpand,
}) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)

  const scrollRef = useRef(null)

  const suggestedQuestions = [
    "What causes headaches?",
    "How to improve sleep?",
    "Signs of dehydration?",
    "When to see a doctor?",
  ]

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = () => {
    if (!input.trim()) return

    const userMessage = {
      id: Date.now(),
      role: "user",
      content: input,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    setTimeout(() => {
      const replies = [
        "This could be due to multiple reasons. Please consult a doctor.",
        "Stay hydrated and monitor your symptoms.",
        "If it persists, seek medical advice.",
      ]

      const aiMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: replies[Math.floor(Math.random() * replies.length)],
      }

      setMessages((prev) => [...prev, aiMessage])
      setIsLoading(false)
    }, 1200)
  }

  const toggleVoice = () => {
    setIsListening(!isListening)

    if (!isListening) {
      setTimeout(() => {
        setInput("I have headache since 2 days")
        setIsListening(false)
      }, 2000)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className={`fixed z-50 flex flex-col backdrop-blur-xl border border-white/10 
      bg-gradient-to-br from-[#0b1220] to-[#020617] text-white shadow-2xl rounded-2xl
      transition-all duration-300
      ${isExpanded ? "inset-4" : "bottom-5 right-5 w-[360px] h-[520px]"}`}
    >
      {/* 🔷 Header */}
      <div className="flex justify-between items-center px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="bg-primary/20 p-2 rounded-lg">
            <Bot className="h-4 w-4 text-primary" />
          </div>
          <span className="font-semibold">AI Health Assistant</span>
        </div>

        <div className="flex gap-2">
          {onToggleExpand && (
            <button
              onClick={onToggleExpand}
              className="hover:bg-white/10 p-1 rounded"
            >
              {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
          )}
          <button
            onClick={onClose}
            className="hover:bg-red-500/20 p-1 rounded"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* 💬 Chat Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3"
      >
        {messages.length === 0 ? (
          <div className="text-center mt-10">
            <Sparkles className="mx-auto mb-3 text-primary animate-pulse" />
            <p className="text-sm text-muted-foreground">
              Ask anything about your health
            </p>

            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              {suggestedQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => setInput(q)}
                  className="px-3 py-1 text-xs rounded-full bg-white/5 hover:bg-primary/20 transition"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`px-4 py-2 rounded-xl max-w-[75%] text-sm shadow-md
                ${
                  msg.role === "user"
                    ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                    : "bg-white/10 backdrop-blur-md text-gray-200"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))
        )}

        {isLoading && (
          <div className="text-xs text-muted-foreground animate-pulse">
            AI is typing...
          </div>
        )}
      </div>

      {/* ✏️ Input */}
      <div className="border-t border-white/10 p-3 flex gap-2 items-center">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask something..."
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />

        {/* 🎤 Voice */}
        <button
          onClick={toggleVoice}
          className="p-2 rounded-lg hover:bg-white/10 transition"
        >
          {isListening ? (
            <MicOff className="text-red-400" size={18} />
          ) : (
            <Mic size={18} />
          )}
        </button>

        {/* 🚀 Send */}
        <button
          onClick={handleSend}
          className="p-2 rounded-lg bg-primary hover:bg-primary/80 transition"
        >
          <Send size={16} />
        </button>
      </div>  
    </div>
  )
}