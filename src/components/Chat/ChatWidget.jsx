import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { chatbotAPI } from '../../services/api'
import { Send, Bot, User, Loader2, MessageCircle, X, Minimize2 } from 'lucide-react'

const ChatWidget = () => {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [conversationHistory, setConversationHistory] = useState([])
  const messagesEndRef = useRef(null)
  const chatContainerRef = useRef(null)

  // Debug: Log when component mounts
  useEffect(() => {
    console.log('ChatWidget mounted')
  }, [])

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
    }
  }, [messages, isOpen])

  // Check chatbot health on mount
  useEffect(() => {
    checkConnection()
  }, [])

  // Load chat history when widget opens
  useEffect(() => {
    if (isOpen) {
      loadChatHistory()
    }
  }, [isOpen])

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  const checkConnection = async () => {
    try {
      await chatbotAPI.healthCheck()
      setIsConnected(true)
    } catch (error) {
      console.error('Chatbot connection check failed:', error)
      setIsConnected(false)
    }
  }

  const loadChatHistory = async () => {
    if (user?.id && user?.role === 'patient' && messages.length === 0) {
      try {
        const response = await chatbotAPI.getChatHistory(user.id)
        if (response.history && response.history.length > 0) {
          const formattedHistory = response.history.map(item => ({
            id: Date.now() + Math.random(),
            text: item.message,
            sender: 'user',
            timestamp: new Date(item.timestamp)
          }))
          const formattedResponses = response.history.map(item => ({
            id: Date.now() + Math.random() + 1,
            text: item.response,
            sender: 'bot',
            timestamp: new Date(item.timestamp)
          }))
          
          // Interleave messages
          const allMessages = []
          formattedHistory.forEach((msg, idx) => {
            allMessages.push(msg)
            if (formattedResponses[idx]) {
              allMessages.push(formattedResponses[idx])
            }
          })
          
          setMessages(allMessages)
          setConversationHistory(response.history)
        } else {
          // Show welcome message if no history
          showWelcomeMessage()
        }
      } catch (error) {
        console.error('Failed to load chat history:', error)
        showWelcomeMessage()
      }
    } else if (messages.length === 0) {
      showWelcomeMessage()
    }
  }

  const showWelcomeMessage = () => {
    const welcomeMessage = {
      id: 'welcome',
      text: 'Xin chào! Tôi là chatbot hỗ trợ bệnh nhân. Tôi có thể giúp bạn:\n• Thông tin về dịch vụ bệnh viện\n• Giờ làm việc và quy trình khám bệnh\n• Hướng dẫn đặt lịch hẹn\n• Thông tin về các khoa, phòng ban\n\nBạn cần hỗ trợ gì?',
      sender: 'bot',
      timestamp: new Date(),
      suggestions: [
        'Giờ làm việc của bệnh viện?',
        'Cách đặt lịch hẹn khám?',
        'Thông tin về các khoa'
      ]
    }
    setMessages([welcomeMessage])
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    
    if (!inputMessage.trim() || isLoading) return

    const userMessage = {
      id: Date.now(),
      text: inputMessage.trim(),
      sender: 'user',
      timestamp: new Date()
    }

    // Add user message to UI immediately
    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    // Update conversation history
    const updatedHistory = [
      ...conversationHistory,
      {
        message: userMessage.text,
        response: '',
        timestamp: userMessage.timestamp.toISOString()
      }
    ]

    try {
      const patientId = user?.role === 'patient' ? user.id.toString() : null
      
      // Format conversation history for API
      const formattedHistory = conversationHistory
        .filter(h => h.message && h.response)
        .map(h => ({
          message: h.message,
          response: h.response
        }))
      
      const response = await chatbotAPI.sendMessage(
        userMessage.text,
        patientId,
        formattedHistory
      )

      const botMessage = {
        id: Date.now() + 1,
        text: response.response || response.message || 'Xin lỗi, tôi không thể phản hồi lúc này.',
        sender: 'bot',
        timestamp: new Date(response.timestamp || Date.now()),
        suggestions: response.suggestions
      }

      setMessages(prev => [...prev, botMessage])
      
      // Update conversation history
      const finalHistory = [...updatedHistory]
      finalHistory[finalHistory.length - 1].response = botMessage.text
      setConversationHistory(finalHistory)

    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage = {
        id: Date.now() + 1,
        text: 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.',
        sender: 'bot',
        timestamp: new Date(),
        isError: true
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuggestionClick = (suggestion) => {
    setInputMessage(suggestion)
    // Auto focus input after setting suggestion
    setTimeout(() => {
      const input = document.querySelector('#chat-input')
      if (input) input.focus()
    }, 100)
  }

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-16 h-16 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-110 z-[9999] flex items-center justify-center group"
          aria-label="Mở chat"
          style={{ zIndex: 9999 }}
        >
          <MessageCircle className="w-7 h-7" />
          {isConnected && (
            <span className="absolute top-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></span>
          )}
        </button>
      )}

      {/* Chat Widget */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col border border-gray-200 animate-slide-up" style={{ zIndex: 9999 }}>
          {/* Header */}
          <div className="bg-blue-600 text-white rounded-t-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold">Chatbot Hỗ trợ</h3>
                <div className="flex items-center gap-2 text-xs text-blue-100">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                  <span>{isConnected ? 'Đang kết nối' : 'Đang kiểm tra...'}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Đóng chat"
            >
              <Minimize2 className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50"
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-2 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.sender === 'bot' && (
                  <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                
                <div className={`max-w-[75%] ${message.sender === 'user' ? 'order-2' : ''}`}>
                  <div
                    className={`rounded-lg px-3 py-2 text-sm ${
                      message.sender === 'user'
                        ? 'bg-blue-600 text-white'
                        : message.isError
                        ? 'bg-red-50 text-red-800 border border-red-200'
                        : 'bg-white text-gray-900 border border-gray-200'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{message.text}</p>
                    <span className={`text-xs mt-1 block ${
                      message.sender === 'user' ? 'text-blue-100' : 'text-gray-400'
                    }`}>
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                  
                  {/* Suggestions */}
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {message.suggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="text-xs px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-colors border border-blue-200"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {message.sender === 'user' && (
                  <div className="w-7 h-7 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2 justify-start">
                <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white border border-gray-200 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-3 h-3 animate-spin text-gray-600" />
                    <span className="text-xs text-gray-600">Đang soạn tin nhắn...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-3 bg-white rounded-b-2xl">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                id="chat-input"
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Nhập tin nhắn..."
                className="flex-1 px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading || !isConnected}
                autoFocus
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading || !isConnected}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                aria-label="Gửi tin nhắn"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </form>
            
            {!isConnected && (
              <div className="mt-2 text-xs text-red-600 flex items-center gap-1">
                <X className="w-3 h-3" />
                Không thể kết nối đến chatbot
              </div>
            )}
          </div>
        </div>
      )}

      {/* CSS Animation */}
      <style>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  )
}

export default ChatWidget

