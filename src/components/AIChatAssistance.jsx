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

  const [mode, setMode] = useState("chat")
  const [pdfFile, setPdfFile] = useState(null)
  const [sessionId, setSessionId] = useState("")

  const scrollRef = useRef(null)

  // 🔄 AUTO SCROLL
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    })
  }, [messages])

  // ❌ REMOVE PDF
  const removePdf = () => {
    setPdfFile(null)
  }

  // 🧹 CLEAR CHAT (NEW FEATURE)
  const clearChat = () => {
    setMessages([])
    setInput("")
    setSessionId("")
  }

  // 🚀 SEND MESSAGE
  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    if (mode === "pdf" && !pdfFile) {
      alert("Please upload a PDF first")
      return
    }

    const userMessage = {
      id: Date.now(),
      role: "user",
      content: input,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      let data

      if (mode === "chat") {
        const res = await fetch(
          "https://ai-healtcare-22.onrender.com/ask",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              question: userMessage.content,
              session_id: sessionId || "",
            }),
          }
        )

        data = await res.json()
        setSessionId(data.session_id || "")
      } else {
        const formData = new FormData()
        formData.append("file", pdfFile)

        const url =
          "https://ai-healtcare-22.onrender.com/ask-pdf" +
          `?question=${encodeURIComponent(userMessage.content)}` +
          `&session_id=${sessionId || ""}`

        const res = await fetch(url, {
          method: "POST",
          body: formData,
        })

        data = await res.json()
        setSessionId(data.session_id || "")
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: data.answer || "No response",
        },
      ])
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: "⚠️ Server error",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const toggleVoice = () => {
    setIsListening(!isListening)
    if (!isListening) {
      setTimeout(() => {
        setInput("I have headache since 2 days")
        setIsListening(false)
      }, 1500)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className={`fixed z-50 flex flex-col backdrop-blur-2xl border border-white/10 
      bg-gradient-to-br from-[#0b1220] to-[#020617] text-white shadow-2xl rounded-3xl overflow-hidden
      transition-all duration-300
      ${isExpanded ? "inset-4" : "bottom-5 right-5 w-[380px] h-[560px]"}`}
    >

      {/* 🔷 HEADER */}
      <div className="flex justify-between items-center px-4 py-3 border-b border-white/10 bg-white/5">
        <div className="flex items-center gap-2">
          <div className="bg-green-500/20 p-2 rounded-full">
            <Bot className="h-4 w-4 text-green-400" />
          </div>
          <div>
            <p className="text-sm font-semibold">AI Health Assistant</p>
            <p className="text-[10px] text-green-400">● Online</p>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex gap-2 items-center">

          {/* 🧹 CLEAR CHAT BUTTON (NEW) */}
          <button
            onClick={clearChat}
            className="text-xs px-2 py-1 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30"
          >
            Clear
          </button>

          {onToggleExpand && (
            <button onClick={onToggleExpand}>
              {isExpanded ? (
                <Minimize2 size={16} />
              ) : (
                <Maximize2 size={16} />
              )}
            </button>
          )}

          <button onClick={onClose}>
            <X size={16} />
          </button>
        </div>
      </div>

      {/* MODE SWITCH */}
      <div className="flex mx-3 mt-3 bg-white/5 rounded-full p-1">
        <button
          onClick={() => setMode("chat")}
          className={`flex-1 py-1 text-xs rounded-full ${
            mode === "chat" ? "bg-blue-500 text-white" : "text-gray-300"
          }`}
        >
          Chat
        </button>

        <button
          onClick={() => setMode("pdf")}
          className={`flex-1 py-1 text-xs rounded-full ${
            mode === "pdf" ? "bg-green-500 text-white" : "text-gray-300"
          }`}
        >
          PDF
        </button>
      </div>

      {/* PDF UPLOAD */}
      {mode === "pdf" && (
        <div className="mx-3 mt-2 p-2 border border-white/10 rounded-xl bg-white/5">
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => {
              setPdfFile(e.target.files[0])
              setMessages([])
              setSessionId("")
            }}
            className="text-xs w-full"
          />

          {pdfFile && (
            <div className="flex justify-between mt-2">
              <p className="text-xs text-green-400 truncate max-w-[200px]">
                📄 {pdfFile.name}
              </p>

              <button
                onClick={removePdf}
                className="text-red-400 text-xs"
              >
                ✕ Remove
              </button>
            </div>
          )}
        </div>
      )}

      {/* CHAT AREA */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-3 space-y-3"
      >
        {messages.length === 0 ? (
          <div className="text-center mt-10">
            <Sparkles className="mx-auto mb-3 text-green-400 animate-pulse" />
            <p className="text-sm text-gray-300">
              Ask your health questions
            </p>
          </div>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${
                m.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`px-3 py-2 rounded-2xl text-sm max-w-[75%]
                ${
                  m.role === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-white/10 text-gray-200"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))
        )}

        {isLoading && (
          <div className="text-xs text-gray-400 animate-pulse">
            AI is thinking...
          </div>
        )}
      </div>

      {/* INPUT */}
      <div className="p-3 border-t border-white/10 flex gap-2 bg-white/5">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask something..."
          className="flex-1 px-3 py-2 rounded-xl bg-black/20 text-sm"
        />

        <button onClick={toggleVoice}>
          {isListening ? <MicOff /> : <Mic />}
        </button>

        <button
          onClick={handleSend}
          disabled={isLoading}
          className="bg-blue-500 px-3 py-2 rounded-xl"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  )
}