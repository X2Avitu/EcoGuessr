"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Send, X, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

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
      content: "Hello! How can I help you today?",
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
        const errorData = await response.json()
        throw new Error(errorData.error || `API Error: ${response.status}`)
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
      } else {
        throw new Error("Received empty or invalid response from AI")
      }
    } catch (err: any) {
      console.error("Chat API Error:", err)
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: `Error: ${err.message || "Could not connect to AI."}`,
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
      {/* Chat Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <Button
          onClick={toggleChat}
          size="lg"
          className={cn(
            "rounded-full w-14 h-14 shadow-lg transition-all duration-300",
            isOpen
              ? "bg-green-700 hover:bg-green-800"
              : "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800",
          )}
        >
          <motion.div animate={{ rotate: isOpen ? 45 : 0 }} transition={{ duration: 0.3 }}>
            {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
          </motion.div>
        </Button>
      </motion.div>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-24 right-6 w-80 sm:w-96 h-[500px] max-h-[80vh] bg-white rounded-2xl shadow-2xl overflow-hidden z-40 flex flex-col border border-gray-300"
            initial={{ y: 20, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Chat Header */}
            <div className="p-4 bg-gradient-to-r from-green-700 to-green-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8 border-2 border-white">
                  <div className="flex h-full w-full items-center justify-center bg-green-900 text-green-200 font-semibold text-sm">
                    AI
                  </div>
                </Avatar>
                <div>
                  <h3 className="font-medium">Chat Assistant</h3>
                  <p className="text-xs text-green-200">Gemini-1.5-Flash</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleChat}
                className="text-white hover:bg-green-800/20 rounded-full h-8 w-8"
              >
                <X size={18} />
              </Button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-white space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={cn(
                    "flex items-start gap-2 max-w-[85%]",
                    message.sender === "user" ? "ml-auto flex-row-reverse" : "",
                  )}
                >
                  {message.sender === "bot" && (
                    <Avatar className="h-8 w-8 mt-1">
                      <div className="flex h-full w-full items-center justify-center bg-green-900 text-green-200 font-semibold text-sm">
                        AI
                      </div>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      "rounded-2xl py-2 px-3",
                      message.sender === "user"
                        ? "bg-green-700 text-white rounded-tr-none"
                        : "bg-gray-100 shadow-sm border border-gray-300 rounded-tl-none",
                    )}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className="text-[10px] mt-1 opacity-70">
                      {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  {message.sender === "user" && (
                    <Avatar className="h-8 w-8 mt-1">
                      <div className="flex h-full w-full items-center justify-center bg-gray-300 text-gray-700 font-semibold text-sm">
                        U
                      </div>
                    </Avatar>
                  )}
                </motion.div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-2 max-w-[85%]"
                >
                  <Avatar className="h-8 w-8 mt-1">
                    <div className="flex h-full w-full items-center justify-center bg-green-900 text-green-200 font-semibold text-sm">
                      AI
                    </div>
                  </Avatar>
                  <div className="bg-gray-100 rounded-2xl rounded-tl-none py-2 px-4 shadow-sm border border-gray-300">
                    <div className="flex space-x-1">
                      <motion.div
                        className="w-2 h-2 rounded-full bg-green-700"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1, delay: 0 }}
                      />
                      <motion.div
                        className="w-2 h-2 rounded-full bg-green-700"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1, delay: 0.2 }}
                      />
                      <motion.div
                        className="w-2 h-2 rounded-full bg-green-700"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1, delay: 0.4 }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <form
              onSubmit={handleSubmit}
              className="p-3 border-t border-gray-300 bg-white flex gap-2"
            >
              <Input
                ref={inputRef}
                type="text"
                placeholder="Type your message..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-1 focus-visible:ring-green-700"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!inputValue.trim()}
                className="bg-green-700 hover:bg-green-800 text-white rounded-full h-10 w-10 flex items-center justify-center"
              >
                <Send size={18} />
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}