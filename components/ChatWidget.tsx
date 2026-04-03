"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Send, X, Terminal, Cpu } from "lucide-react"

type Message = {
  id: string
  content: string
  sender: "user" | "bot"
  timestamp: Date
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "PLATZ CIVIC SCOUT INITIALIZED... Ready to analyze local infrastructure or coordinate squad actions. Hit me.",
      sender: "bot",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const toggleChat = () => {
    setIsOpen(!isOpen)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!inputValue.trim() || isTyping) return

    const userMessageContent = inputValue.trim()

    const userMessage: Message = {
      id: Date.now().toString(),
      content: userMessageContent,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsTyping(true)

    try {
      const historyForAPI = messages.map((msg) => ({
        role: msg.sender === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      }))

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          history: historyForAPI,
          message: userMessageContent,
        }),
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`)
      }

      const data = await response.json()

      if (data.response) {
        const botMessage: Message = {
          id: Date.now().toString(),
          content: data.response,
          sender: "bot",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, botMessage])
      }
    } catch (err: any) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: `SYS_ERROR: Connection to Scout Network severed.`,
        sender: "bot",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 300)
    }
  }, [isOpen])

  return (
    <>
      {/* HUD Floating Button */}
      <motion.div
        className="fixed bottom-8 left-8 z-[100]"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 1 }}
      >
        <button
          onClick={toggleChat}
          className={`relative group rounded-xl w-16 h-16 flex items-center justify-center transition-all duration-300 border-2 ${
            isOpen ? "bg-white border-white text-black" : "bg-[#0A0A0A] border-primary text-primary hover:bg-[#111]"
          } shadow-[0_0_20px_rgba(184,255,60,0.3)]`}
        >
          <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.4, type: "spring" }}>
            {isOpen ? <X size={28} /> : <Terminal size={28} />}
          </motion.div>
          {!isOpen && (
              <span className="absolute -top-2 -right-2 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-primary border-2 border-[#0A0A0A]"></span>
              </span>
          )}
        </button>
      </motion.div>

      {/* Terminal Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-28 left-8 w-80 sm:w-96 h-[500px] max-h-[80vh] bg-[#0A0A0A]/95 backdrop-blur-xl border border-primary/50 shadow-[0_0_40px_rgba(184,255,60,0.15)] flex flex-col z-[100]"
            initial={{ y: 50, opacity: 0, scale: 0.95, clipPath: 'polygon(0 100%, 100% 100%, 100% 100%, 0% 100%)' }}
            animate={{ y: 0, opacity: 1, scale: 1, clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0% 100%)' }}
            exit={{ y: 50, opacity: 0, scale: 0.95, clipPath: 'polygon(0 100%, 100% 100%, 100% 100%, 0% 100%)' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
          >
            {/* HUD Header */}
            <div className="p-4 border-b border-primary/30 flex items-center justify-between bg-[#111]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center border border-primary bg-primary/10 text-primary">
                    <Cpu size={16} />
                </div>
                <div>
                  <h3 className="font-bebas text-2xl text-white leading-none">CIVIC SCOUT AI</h3>
                  <p className="font-dmsans text-[10px] text-primary uppercase font-bold tracking-[0.2em] animate-pulse">Online & Monitoring</p>
                </div>
              </div>
              <button onClick={toggleChat} className="text-gray-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Chat Log */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 font-mono text-sm scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, x: message.sender === "user" ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex flex-col ${message.sender === "user" ? "items-end" : "items-start"}`}
                >
                  <div className="text-[10px] text-gray-600 mb-1">
                      {message.sender === "user" ? "OPERATOR" : "SYS.AI"} // {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                  </div>
                  <div className={`p-3 border max-w-[85%] ${
                      message.sender === "user" 
                        ? "bg-primary text-black border-primary font-bold" 
                        : "bg-[#111] text-primary border-primary/30"
                    }`}
                  >
                    {message.content}
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-start">
                  <div className="text-[10px] text-gray-600 mb-1">SYS.AI // COMPUTING</div>
                  <div className="p-3 border bg-[#111] text-primary border-primary/30 flex gap-2 w-16">
                     <div className="w-1.5 h-3 bg-primary animate-[pulse_1s_infinite_0ms]"></div>
                     <div className="w-1.5 h-3 bg-primary animate-[pulse_1s_infinite_200ms]"></div>
                     <div className="w-1.5 h-3 bg-primary animate-[pulse_1s_infinite_400ms]"></div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Terminal */}
            <form onSubmit={handleSubmit} className="p-3 border-t border-primary/30 bg-[#111] flex gap-2">
              <div className="text-primary font-mono flex items-center justify-center pl-2">{">"}</div>
              <input
                ref={inputRef}
                type="text"
                placeholder="Enter command..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-1 bg-transparent border-none text-white font-mono placeholder:text-gray-700 focus:outline-none focus:ring-0 text-sm"
              />
              <button
                type="submit"
                disabled={!inputValue.trim()}
                className="w-10 h-10 flex items-center justify-center bg-primary text-black hover:bg-white disabled:opacity-50 disabled:bg-[#222] disabled:text-gray-600 transition-colors"
              >
                <Send size={16} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}