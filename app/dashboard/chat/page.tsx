'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Dashboard from '@/components/Dashboard'
import { PromptInputBox } from '@/components/ai-prompt-box'
import { useIsMobile } from '@/app/hooks/use-mobile'
import { submitReport, createChatSession, getChatSessionById, sendChatMessage, type ChatMessage as APIChatMessage } from '@/app/services/api'
import { useAuth } from '@/app/contexts/AuthContext'
import ProtectedRoute from '@/app/components/ProtectedRoute'

interface Message {
  id: string | number
  message: string
  messageEn?: string  // English version
  messageTw?: string  // Twi version
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
  const [showTranslation, setShowTranslation] = useState<{[key: string]: boolean}>({}) // Track which messages show translation

  const formatMessage = (message: string | undefined) => {
    if (!message) return <p>No message</p>
    
    // Split by lines
    const lines = message.split('\n')
    const elements: JSX.Element[] = []
    let currentParagraph: string[] = []
    let currentListItems: JSX.Element[] = []
    let currentListType: 'ul' | 'ol' | null = null
    
    const flushParagraph = (key: string) => {
      if (currentParagraph.length > 0) {
        elements.push(
          <p key={key} className="mb-2">
            {formatInlineText(currentParagraph.join(' '))}
          </p>
        )
        currentParagraph = []
      }
    }
    
    const flushList = (key: string) => {
      if (currentListItems.length > 0 && currentListType) {
        const ListTag = currentListType
        const listClass = currentListType === 'ul' ? 'list-disc' : 'list-decimal'
        elements.push(
          <ListTag key={key} className={`mb-2 ml-4 ${listClass}`}>
            {currentListItems}
          </ListTag>
        )
        currentListItems = []
        currentListType = null
      }
    }
    
    const processLine = (line: string, index: number) => {
      // Check for bullet points
      if (line.trim().match(/^[\*\-]\s/)) {
        flushParagraph(`para-${index}`)
        flushList(`list-before-${index}`)
        currentListType = 'ul'
        currentListItems.push(
          <li key={index} className="mb-1 ml-4">
            {formatInlineText(line.replace(/^[\*\-]\s/, '').trim())}
          </li>
        )
        return
      }
      
      // Check for numbered lists
      if (line.match(/^\d+\.\s/)) {
        flushParagraph(`para-${index}`)
        flushList(`list-before-${index}`)
        currentListType = 'ol'
        currentListItems.push(
          <li key={index} className="mb-1 ml-4">
            {formatInlineText(line.replace(/^\d+\.\s/, '').trim())}
          </li>
        )
        return
      }
      
      // Check for headers (lines with bold only)
      if (line.trim().startsWith('**') && line.trim().endsWith('**') && line.trim().length > 4) {
        flushParagraph(`para-${index}`)
        flushList(`list-before-${index}`)
        elements.push(
          <p key={index} className="mb-2 font-semibold">
            {formatInlineText(line)}
          </p>
        )
        return
      }
      
      // Regular paragraph text
      if (line.trim()) {
        if (currentListItems.length > 0) {
          flushList(`list-end-${index}`)
        }
        currentParagraph.push(line)
      } else if (currentParagraph.length > 0) {
        // Empty line - flush current paragraph
        flushParagraph(`para-${index}`)
      } else if (currentListItems.length > 0) {
        // Empty line in a list
        flushList(`list-end-${index}`)
      }
    }
    
    lines.forEach((line, index) => processLine(line, index))
    
    // Flush any remaining content
    flushParagraph('para-final')
    flushList('list-final')
    
    return <>{elements}</>
  }
  
  const formatInlineText = (text: string) => {
    // Split by ** for bold text
    const parts = text.split(/(\*\*.*?\*\*)/g)
    
    return (
      <>
        {parts.map((part, index) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={index} className="font-semibold">{part.slice(2, -2)}</strong>
          }
          return <span key={index}>{part}</span>
        })}
      </>
    )
  }

  const searchParams = useSearchParams()

  useEffect(() => {
    // Load existing chat session if available
    const loadChatSession = async () => {
      // First check for sessionId from query params (from image upload)
      const sessionIdFromQuery = searchParams.get('sessionId')
      
      if (sessionIdFromQuery) {
        setSessionId(sessionIdFromQuery)
        localStorage.setItem('chat_session_id', sessionIdFromQuery)
        
        try {
          const session = await getChatSessionById(sessionIdFromQuery)
          
          // Convert API messages to UI messages
          const formattedMessages: Message[] = session.messages.map((msg: APIChatMessage, idx: number) => ({
            id: idx + 1,
            message: userLanguage === 'tw' && msg.content_twi ? msg.content_twi : msg.content,
            messageEn: msg.role === 'user' ? msg.content : (msg.content || msg.content),
            messageTw: msg.content_twi || msg.content,
            timestamp: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isUser: msg.role === 'user'
          }))
          
          setMessages(formattedMessages)
          return
        } catch (error) {
          console.error('Failed to load chat session from query:', error)
        }
      }
      
      // Fallback to stored session
      const storedSessionId = localStorage.getItem('chat_session_id')
      const storedReportId = localStorage.getItem('current_report_id')
      
      if (storedSessionId && storedReportId) {
        setSessionId(storedSessionId)
        setReportId(storedReportId)
        
        try {
          const session = await getChatSessionById(storedSessionId)
          
          // Convert API messages to UI messages
          const formattedMessages: Message[] = session.messages.map((msg: APIChatMessage, idx: number) => ({
            id: idx + 1,
            message: userLanguage === 'tw' && msg.content_twi ? msg.content_twi : msg.content,
            messageEn: msg.role === 'user' ? msg.content : (msg.content || msg.content),
            messageTw: msg.content_twi || msg.content,
            timestamp: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isUser: msg.role === 'user'
          }))
          
          setMessages(formattedMessages)
        } catch (error) {
          console.error('Failed to load chat session:', error)
        }
      }
    }
    
    loadChatSession()
  }, [userLanguage, searchParams])

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
      // Check if this is the very first message (no report or session exists)
      const hasExistingReport = reportId || localStorage.getItem('current_report_id')
      const hasExistingSession = sessionId || localStorage.getItem('chat_session_id')
      
      if (!hasExistingReport && !hasExistingSession) {
        // Step 1: Create report from user's symptom message
        const report = await submitReport(message, 'Ghana', userLanguage)
        setReportId(report.id)
        localStorage.setItem('current_report_id', report.id)
        
        // The report contains the AI analysis directly
        // Backend returns ai_diagnosis and ai_diagnosis_twi
        const aiDiagnosisEn = report.ai_diagnosis || report.reasoning || ''
        const aiDiagnosisTw = report.ai_diagnosis_twi || report.reasoning || ''
        
        const aiGreeting: Message = {
          id: Date.now() + 1,
          message: userLanguage === 'tw' ? aiDiagnosisTw : aiDiagnosisEn,
          messageEn: aiDiagnosisEn,
          messageTw: aiDiagnosisTw,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isUser: false,
        }
        setMessages([newMessage, aiGreeting])
        
        // Step 2: Create chat session with the report for follow-up questions
        try {
          const session = await createChatSession('report', report.id)
          const sessionIdFromAPI = typeof session === 'string' ? session : session.id
          if (sessionIdFromAPI) {
            setSessionId(sessionIdFromAPI)
            localStorage.setItem('chat_session_id', sessionIdFromAPI)
          }
        } catch (sessionError) {
          console.error('Failed to create chat session, but report was created:', sessionError)
          // Continue without session - user can still see the initial diagnosis
        }
      } else if (hasExistingSession) {
        // Send message in existing chat session
        const activeSessionId = sessionId || localStorage.getItem('chat_session_id')
        if (!activeSessionId) {
          throw new Error('No active session')
        }
        
        const response = await sendChatMessage(activeSessionId, message, userLanguage)
        
        // Extract content from assistant_message (actual API response structure)
        const aiResponseEn = response?.assistant_message?.content || 'Response received'
        const aiResponseTw = response?.assistant_message?.content_twi || 'Response received'
        
        const aiResponse: Message = {
          id: Date.now() + 1,
          message: userLanguage === 'tw' ? aiResponseTw : aiResponseEn,
          messageEn: aiResponseEn,
          messageTw: aiResponseTw,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isUser: false,
        }
        setMessages((prev) => [...prev, aiResponse])
      } else {
        // Report exists but no session yet - create session now
        const currentReportId = reportId || localStorage.getItem('current_report_id')
        if (!currentReportId) {
          throw new Error('No report ID found')
        }
        
        const session = await createChatSession('report', currentReportId)
        const sessionIdFromAPI = typeof session === 'string' ? session : session.id
        if (sessionIdFromAPI) {
          setSessionId(sessionIdFromAPI)
          localStorage.setItem('chat_session_id', sessionIdFromAPI)
        }
        
        // Now send the message
        const response = await sendChatMessage(sessionIdFromAPI, message, userLanguage)
        
        const aiResponseEn = response?.assistant_message?.content || 'Response received'
        const aiResponseTw = response?.assistant_message?.content_twi || 'Response received'
        
        const aiResponse: Message = {
          id: Date.now() + 1,
          message: userLanguage === 'tw' ? aiResponseTw : aiResponseEn,
          messageEn: aiResponseEn,
          messageTw: aiResponseTw,
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
              
              {/* Language Selector */}
              <div className={`flex justify-center gap-2 ${isMobile ? 'mb-4' : 'mb-6'}`}>
                <button
                  onClick={() => setUserLanguage('en')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    userLanguage === 'en'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => setUserLanguage('tw')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    userLanguage === 'tw'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Twi
                </button>
              </div>
              
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
                {messages.map((msg) => {
                  const isTranslationShown = showTranslation[msg.id] || false
                  const currentMessage = !msg.isUser && isTranslationShown
                    ? (userLanguage === 'en' ? msg.messageTw : msg.messageEn) // Show opposite language
                    : msg.message // Show default language
                  
                  return (
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
                          <div className="prose prose-sm max-w-none break-words">
                            {formatMessage(currentMessage)}
                          </div>
                          
                          {/* Translation Toggle - Only for AI messages with both languages */}
                          {!msg.isUser && msg.messageEn && msg.messageTw && msg.messageEn !== msg.messageTw && (
                            <button
                              onClick={() => setShowTranslation(prev => ({
                                ...prev,
                                [msg.id]: !prev[msg.id]
                              }))}
                              className={`${isMobile ? 'text-[10px] mt-1' : 'text-xs mt-2'} text-green-600 hover:text-green-700 underline`}
                            >
                              {isTranslationShown 
                                ? `Show ${userLanguage === 'en' ? 'English' : 'Twi'}`
                                : `Show ${userLanguage === 'en' ? 'Twi' : 'English'} translation`
                              }
                            </button>
                          )}
                          
                          <div className={`${isMobile ? 'text-[10px] mt-1' : 'text-xs mt-2'} ${
                            msg.isUser ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {msg.timestamp}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}

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
              {/* Language Selector for Active Chat */}
              <div className="flex justify-end gap-2 mb-4">
                <button
                  onClick={() => setUserLanguage('en')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    userLanguage === 'en'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => setUserLanguage('tw')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    userLanguage === 'tw'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Twi
                </button>
              </div>
              
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