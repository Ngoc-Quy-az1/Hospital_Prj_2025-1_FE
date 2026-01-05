import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { chatbotAPI } from '../../services/api'
import { Send, Bot, User, Loader2, MessageCircle, X } from 'lucide-react'

const Chat = () => {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [conversationHistory, setConversationHistory] = useState([])
  const messagesEndRef = useRef(null)
  const chatContainerRef = useRef(null)

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Check chatbot health on mount
  useEffect(() => {
    checkConnection()
    loadChatHistory()
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
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
    if (user?.id && user?.role === 'patient') {
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
        }
      } catch (error) {
        console.error('Failed to load chat history:', error)
      }
    }
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
      
      // Format conversation history for API (simple message/response pairs)
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
  }

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Initial welcome message
  useEffect(() => {
    if (messages.length === 0 && !isLoading) {
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
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-t-2xl shadow-lg p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Chatbot Hỗ trợ</h1>
                <div className="flex items-center gap-2 mt-1">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm text-gray-600">
                    {isConnected ? 'Đang kết nối' : 'Đang kiểm tra...'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div 
          ref={chatContainerRef}
          className="bg-white rounded-b-2xl shadow-lg h-[calc(100vh-280px)] md:h-[600px] flex flex-col overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.sender === 'bot' && (
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                )}
                
                <div className={`max-w-[75%] md:max-w-[60%] ${message.sender === 'user' ? 'order-2' : ''}`}>
                  <div
                    className={`rounded-2xl px-4 py-3 ${
                      message.sender === 'user'
                        ? 'bg-blue-600 text-white'
                        : message.isError
                        ? 'bg-red-50 text-red-800 border border-red-200'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{message.text}</p>
                    <span className={`text-xs mt-1 block ${
                      message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                  
                  {/* Suggestions */}
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {message.suggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="text-xs px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-colors border border-blue-200"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {message.sender === 'user' && (
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-gray-600" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-gray-100 rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
                    <span className="text-gray-600">Đang soạn tin nhắn...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Nhập tin nhắn của bạn..."
                className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading || !isConnected}
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading || !isConnected}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
                <span className="hidden md:inline">Gửi</span>
              </button>
            </form>
            
            {!isConnected && (
              <div className="mt-2 text-sm text-red-600 flex items-center gap-2">
                <X className="w-4 h-4" />
                Không thể kết nối đến chatbot. Vui lòng thử lại sau.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Chat

