'use client'

import { useState, useEffect } from 'react'
import Dashboard from '@/components/Dashboard'
import { PromptInputBox } from '@/components/ai-prompt-box'
import { useIsMobile } from '@/app/hooks/use-mobile'
import { submitReport, getChatSession, sendChatMessage, type ChatMessage as APIChatMessage } from '@/app/services/api'
import { useAuth } from '@/app/contexts/AuthContext'
import ProtectedRoute from '@/app/components/ProtectedRoute'

interface Message {
  id: string | number
  message: string
  timestamp: string
  isUser: boolean
}

function ChatPageContent() {
  const isMobile = useIsMobile()
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [reportId, setReportId] = useState<string | null>(null)
  const [userLanguage, setUserLanguage] = useState<'en' | 'tw'>('en')

  const formatMessage = (message: string) => {
    return message.split('\n').map((line, index) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return <strong key={index} className="font-semibold">{line.slice(2, -2)}</strong>
      }
      if (line.match(/^\d+\.\s/)) {
        return <li key={index} className="ml-4 list-decimal">{line}</li>
      }
      return <p key={index}>{line}</p>
    })
  }

  useEffect(() => {
    // Load existing chat session if available
    const loadChatSession = async () => {
      const storedSessionId = localStorage.getItem('chat_session_id')
      const storedReportId = localStorage.getItem('current_report_id')
      
      if (storedSessionId && storedReportId) {
        setSessionId(storedSessionId)
        setReportId(storedReportId)
        
        try {
          const session = await getChatSession(storedReportId)
          setSessionId(session.session_id)
          
          // Convert API messages to UI messages
          const formattedMessages: Message[] = session.messages.map((msg, idx) => ({
            id: idx + 1,
            message: userLanguage === 'tw' && msg.message_text_twi ? msg.message_text_twi : msg.message_text,
            timestamp: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isUser: msg.sender === 'user'
          }))
          
          setMessages(formattedMessages)
        } catch (error) {
          console.error('Failed to load chat session:', error)
        }
      }
    }
    
    loadChatSession()
  }, [userLanguage])

  const handleSendMessage = async (message: string, files?: File[]) => {
    if (!message.trim() && (!files || files.length === 0)) return

    // Add user message to UI
    const newMessage: Message = {
      id: Date.now(),
      message: message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isUser: true,
    }
    setMessages((prev) => [...prev, newMessage])

    setIsTyping(true)
    
    try {
      // First message creates a report
      if (!sessionId && !reportId) {
        // Create report from user's symptom message
        const report = await submitReport(message, 'Ghana')
        setReportId(report.id)
        setSessionId(report.chat_session_id || null)
        localStorage.setItem('current_report_id', report.id)
        
        if (report.chat_session_id) {
          localStorage.setItem('chat_session_id', report.chat_session_id)
          
          // Get initial AI greeting
          const session = await getChatSession(report.id)
          
          const aiGreeting: Message = {
            id: Date.now() + 1,
            message: session.messages[0] ? (userLanguage === 'tw' && session.messages[0].message_text_twi ? session.messages[0].message_text_twi : session.messages[0].message_text) : "How can I help you?",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isUser: false,
          }
          setMessages([newMessage, aiGreeting])
        }
      } else if (sessionId) {
        // Send message in existing chat session
        const response = await sendChatMessage(sessionId, message, userLanguage)
        
        const aiResponse: Message = {
          id: Date.now() + 1,
          message: userLanguage === 'tw' ? response.ai_response.twi : response.ai_response.english,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isUser: false,
        }
        setMessages((prev) => [...prev, aiResponse])
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      const errorMessage: Message = {
        id: Date.now() + 1,
        message: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isUser: false,
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <Dashboard>
      <div className={`${isMobile ? 'w-full' : 'max-w-4xl'} mx-auto`}>

        {messages.length === 0 ? (
          /* Welcome State - Centered */
          <div className={`flex flex-col items-center justify-center ${isMobile ? 'py-6 px-4' : 'py-12'}`}>
            <div className={`text-center ${isMobile ? 'max-w-xs' : 'max-w-md'}`}>
              <div className={`${isMobile ? 'w-12 h-12' : 'w-16 h-16'} bg-green-500 rounded-full flex items-center justify-center mx-auto ${isMobile ? 'mb-4' : 'mb-6'}`}>
                <svg className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} text-white`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h2 className={`font-bold text-gray-900 ${isMobile ? 'text-xl mb-2' : 'text-2xl mb-2'}`}>Welcome to AI Health Assistant</h2>
              <p className={`text-gray-600 ${isMobile ? 'text-sm mb-6' : 'mb-8'}`}>I'm here to help you with your health and fitness questions. Start a conversation below!</p>
              
              {/* Centered Input */}
              <div className={`w-full ${isMobile ? '' : 'max-w-lg'}`}>
                <PromptInputBox
                  onSend={handleSendMessage}
                  isLoading={isTyping}
                  placeholder="Ask me anything about your health..."
                  className="w-full"
                />
              </div>
            </div>
          </div>
        ) : (
          /* Messages State */
          <div className={isMobile ? 'mt-4' : 'mt-8'}>
            {/* Messages List */}
            <div className={`bg-white rounded-lg shadow-sm border border-gray-200 mb-6 ${isMobile ? 'p-4' : 'p-6'}`}>
              <div className={`space-y-4 overflow-y-auto ${isMobile ? 'max-h-[50vh]' : 'max-h-96'}`}>
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-start space-x-3 ${isMobile ? 'max-w-[75%]' : 'max-w-xs lg:max-w-md'} ${msg.isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      {/* Avatar */}
                      <div className={`flex-shrink-0 rounded-full flex items-center justify-center ${
                        msg.isUser ? 'bg-blue-500' : 'bg-green-500'
                      } ${isMobile ? 'w-6 h-6' : 'w-8 h-8'}`}>
                        {msg.isUser ? (
                          <span className={`text-white font-bold ${isMobile ? 'text-xs' : 'text-sm'}`}>U</span>
                        ) : (
                          <svg className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} text-white`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        )}
                      </div>
                      
                      {/* Message Bubble */}
                      <div className={`rounded-2xl ${
                        msg.isUser
                          ? 'bg-blue-500 text-white rounded-br-md'
                          : 'bg-gray-50 text-gray-900 border border-gray-200 rounded-bl-md'
                      } ${isMobile ? 'px-3 py-2 text-sm' : 'px-4 py-3'}`}>
                        <div className="prose prose-sm max-w-none">
                          {formatMessage(msg.message)}
                        </div>
                        <div className={`${isMobile ? 'text-[10px] mt-1' : 'text-xs mt-2'} ${
                          msg.isUser ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {msg.timestamp}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="flex items-start space-x-3">
                      <div className={`flex-shrink-0 rounded-full bg-green-500 flex items-center justify-center ${isMobile ? 'w-6 h-6' : 'w-8 h-8'}`}>
                        <svg className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} text-white`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className={`bg-gray-50 border border-gray-200 rounded-2xl rounded-bl-md ${isMobile ? 'px-3 py-2' : 'px-4 py-3'}`}>
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Input Area */}
            <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${isMobile ? 'p-4' : 'p-6'}`}>
              <PromptInputBox
                onSend={handleSendMessage}
                isLoading={isTyping}
                placeholder="Type your message..."
                className="w-full"
              />
            </div>
          </div>
        )}
      </div>
    </Dashboard>
  )
}

export default function ChatPage() {
  return (
    <ProtectedRoute allowedRoles={['user', 'epa_admin', 'health_admin', 'super_admin']}>
      <ChatPageContent />
    </ProtectedRoute>
  )
}