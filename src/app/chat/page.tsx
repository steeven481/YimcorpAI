'use client'

import { useState, useRef, useEffect } from 'react'
import {
    Send,
    User,
    Bot,
    Trash2,
    LogOut,
    Sparkles,
    Zap,
    Copy,
    ThumbsUp,
    ThumbsDown,
    Loader2,
    X,
    ChevronLeft,
    MessageSquare,
    Clock,
    Edit2,
    Check,
    XCircle
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { chatService, type Message, type Conversation } from "@/app/lib/chatService"
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            role: 'assistant',
            content: 'Bonjour ! Je suis YimcorpAI, votre assistant IA. Comment puis-je vous aider aujourd\'hui ?',
            timestamp: new Date(),
        }
    ])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [isTyping, setIsTyping] = useState(false)
    const [currentTokensPerSecond, setCurrentTokensPerSecond] = useState('0')
    const [isDarkMode] = useState(true)
    const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [showSidebar, setShowSidebar] = useState(true)
    const [editingTitle, setEditingTitle] = useState<string | null>(null)
    const [newTitle, setNewTitle] = useState('')

    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLTextAreaElement>(null)
    const router = useRouter()

    useEffect(() => {
        scrollToBottom()
        if (inputRef.current) {
            inputRef.current.style.height = 'auto'
            inputRef.current.style.height = inputRef.current.scrollHeight + 'px'
        }
    }, [messages, input])

    useEffect(() => {
        initializeChat()
    }, [])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    const initializeChat = async () => {
        try {
            const convs = await chatService.getUserConversations()
            setConversations(convs)

            const conversationId = await chatService.getOrCreateConversation()
            setCurrentConversationId(conversationId)

            if (conversationId) {
                const loadedMessages = await chatService.loadConversationMessages(conversationId)
                if (loadedMessages.length > 0) {
                    setMessages(loadedMessages)
                }
            }
        } catch (error) {
            console.error('Error initializing chat:', error)
        }
    }

    const handleSend = async () => {
        if (!input.trim() || loading) return

        const userMessageId = crypto.randomUUID()
        const assistantMessageId = crypto.randomUUID()

        const userMessage: Message = {
            id: userMessageId,
            role: 'user',
            content: input,
            timestamp: new Date(),
        }

        const assistantMessage: Message = {
            id: assistantMessageId,
            role: 'assistant',
            content: '',
            timestamp: new Date(),
            isLoading: true
        }

        setMessages(prev => [...prev, userMessage, assistantMessage])
        setInput('')
        setLoading(true)
        setIsTyping(true)
        setCurrentTokensPerSecond('0')

        try {
            let conversationId = currentConversationId

            if (!conversationId) {
                conversationId = await chatService.createNewConversation(input.substring(0, 50))
                setCurrentConversationId(conversationId)
                await refreshConversations()
            }

            if (!conversationId) throw new Error('No conversation ID')
            await chatService.saveMessage(conversationId, {
                id: userMessageId,
                role: 'user',
                content: input
            })

            if (messages.length <= 1) {
                await chatService.updateConversationTitle(conversationId, input.substring(0, 50) + (input.length > 50 ? '...' : ''))
                await refreshConversations()
            }

            const { streamChatResponse } = await import('@/app/lib/gemini')
            const stream = streamChatResponse(input)

            let fullResponse = ''
            let lastTokenUpdate = 0

            for await (const chunk of stream) {
                fullResponse += chunk.text
                console.log('Chunk reçu:', {
                    text: chunk.text,
                    tokensPerSecond: chunk.tokensPerSecond,
                    totalTokens: chunk.totalTokens
                })

                setCurrentTokensPerSecond(chunk.tokensPerSecond)

                setMessages(prev => prev.map(msg =>
                    msg.id === assistantMessageId
                        ? {
                            ...msg,
                            content: fullResponse,
                            tokensPerSecond: chunk.tokensPerSecond,
                            isLoading: false
                        }
                        : msg
                ))

                const now = Date.now()
                if (now - lastTokenUpdate > 500) {
                    lastTokenUpdate = now
                }
            }


            await chatService.saveMessage(conversationId, {
                id: assistantMessageId,
                role: 'assistant',
                content: fullResponse,
                tokens: Math.ceil(fullResponse.length / 4) // Estimation
            })

        } catch (error) {
            console.error('Error:', error)
            setMessages(prev => prev.map(msg =>
                msg.id === assistantMessageId
                    ? {
                        ...msg,
                        content: 'Désolé, une erreur est survenue. Veuillez réessayer.',
                        isLoading: false
                    }
                    : msg
            ))
        } finally {
            setLoading(false)
            setIsTyping(false)
        }
    }

    const refreshConversations = async () => {
        const convs = await chatService.getUserConversations()
        setConversations(convs)
    }

    const handleSignOut = async () => {
        const { createClient } = await import('@/app/lib/supabase/client')
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push('/')
    }

    const clearChat = async () => {
        if (currentConversationId) {
            const confirmed = window.confirm('Êtes-vous sûr de vouloir supprimer cette conversation ?')
            if (!confirmed) return

            await chatService.deleteConversation(currentConversationId)
            setCurrentConversationId(null)
            setMessages([{
                id: 'welcome',
                role: 'assistant',
                content: 'Bonjour ! Je suis YimcorpAI, votre assistant IA. Comment puis-je vous aider aujourd\'hui ?',
                timestamp: new Date(),
            }])
            await refreshConversations()
        }
    }

    const createNewChat = async () => {
        const conversationId = await chatService.createNewConversation()
        if (conversationId) {
            setCurrentConversationId(conversationId)
            setMessages([{
                id: 'welcome',
                role: 'assistant',
                content: 'Bonjour ! Je suis YimcorpAI, votre assistant IA. Comment puis-je vous aider aujourd\'hui ?',
                timestamp: new Date(),
            }])
            await refreshConversations()
        }
    }

    const selectConversation = async (conversationId: string) => {
        const loadedMessages = await chatService.loadConversationMessages(conversationId)
        setCurrentConversationId(conversationId)
        setMessages(loadedMessages.length > 0 ? loadedMessages : [{
            id: 'welcome',
            role: 'assistant',
            content: 'Bonjour ! Je suis YimcorpAI, votre assistant IA. Comment puis-je vous aider aujourd\'hui ?',
            timestamp: new Date(),
        }])
    }

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text)
        } catch (err) {
            console.error('Failed to copy:', err)
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    const startEditTitle = (conversationId: string, currentTitle: string) => {
        setEditingTitle(conversationId)
        setNewTitle(currentTitle)
    }

    const saveTitle = async (conversationId: string) => {
        if (newTitle.trim()) {
            await chatService.updateConversationTitle(conversationId, newTitle.trim())
            await refreshConversations()
        }
        setEditingTitle(null)
        setNewTitle('')
    }

    const cancelEditTitle = () => {
        setEditingTitle(null)
        setNewTitle('')
    }


    return (
        <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
            {/* Main Container */}
            <div className="flex h-screen">
                {/* Sidebar */}
                {showSidebar && (
                    <div className="hidden md:flex md:w-64 flex-col border-r border-gray-800 bg-gray-900">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center space-x-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400">
                                        <Sparkles className="h-6 w-6 text-white" />
                                    </div>
                                    <span className="text-xl font-bold text-white">
                                        Yimcorp<span className="text-emerald-400">AI</span>
                                    </span>
                                </div>
                                <button
                                    onClick={createNewChat}
                                    className="p-2 text-emerald-400 hover:text-emerald-300 hover:bg-gray-800 rounded-lg transition-colors"
                                    title="Nouvelle conversation"
                                >
                                    <MessageSquare className="h-5 w-5" />
                                </button>
                            </div>

                            <nav className="space-y-1">
                                <button
                                    onClick={createNewChat}
                                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 text-white mb-4"
                                >
                                    <Sparkles className="h-5 w-5" />
                                    <span>Nouveau Chat</span>
                                </button>

                                <div className="text-sm text-gray-400 mb-2">Historique</div>
                                {conversations.map((conv) => (
                                    <div key={conv.id} className="group">
                                        {editingTitle === conv.id ? (
                                            <div className="flex items-center space-x-2 p-2">
                                                <input
                                                    type="text"
                                                    value={newTitle}
                                                    onChange={(e) => setNewTitle(e.target.value)}
                                                    className="flex-1 px-2 py-1 text-sm bg-gray-800 border border-gray-700 rounded text-white"
                                                    autoFocus
                                                />
                                                <button
                                                    onClick={() => saveTitle(conv.id)}
                                                    className="p-1 text-emerald-400 hover:text-emerald-300"
                                                >
                                                    <Check className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={cancelEditTitle}
                                                    className="p-1 text-red-400 hover:text-red-300"
                                                >
                                                    <XCircle className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div
                                                onClick={() => selectConversation(conv.id)}
                                                className={`w-full flex flex-col items-start p-3 rounded-lg transition-colors cursor-pointer ${
                                                    currentConversationId === conv.id
                                                        ? 'bg-gray-800 text-white'
                                                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between w-full">
                                                    <div className="flex items-center space-x-3 truncate">
                                                        <MessageSquare className="h-4 w-4 flex-shrink-0" />
                                                        <span className="truncate text-sm">{conv.title}</span>
                                                    </div>
                                                    <div
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            startEditTitle(conv.id, conv.title)
                                                        }}
                                                        className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-gray-300 cursor-pointer"
                                                        role="button"
                                                        tabIndex={0}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter' || e.key === ' ') {
                                                                e.preventDefault()
                                                                e.stopPropagation()
                                                                startEditTitle(conv.id, conv.title)
                                                            }
                                                        }}
                                                    >
                                                        <Edit2 className="h-3 w-3" />
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                                                    <Clock className="h-3 w-3" />
                                                    <span>
                        {formatDistanceToNow(new Date(conv.updated_at), {
                            addSuffix: true,
                            locale: fr
                        })}
                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </nav>
                        </div>

                        <div className="mt-auto p-6 border-t border-gray-800">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-400">Performance</span>
                                    <div className="flex items-center space-x-1">
                                        <Zap className="h-4 w-4 text-emerald-400" />
                                        <span className="text-sm text-emerald-400">{currentTokensPerSecond} t/s</span>
                                    </div>
                                </div>
                                <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                                         style={{ width: `${Math.min(parseFloat(currentTokensPerSecond) * 10, 100)}%` }}>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                )}

                {/* Main Chat Area */}
                <div className="flex-1 flex flex-col">
                    {/* Header */}
                    <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm">
                        <div className="flex items-center justify-between px-4 md:px-6 py-4">
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={() => setShowSidebar(!showSidebar)}
                                    className="md:hidden p-2 text-gray-400 hover:text-gray-300 rounded-lg hover:bg-gray-800 transition-colors"
                                >
                                    <ChevronLeft className={`h-5 w-5 transition-transform ${showSidebar ? 'rotate-0' : 'rotate-180'}`} />
                                </button>
                                <div className="flex items-center space-x-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-emerald-500 to-teal-400">
                                        <Bot className="h-4 w-4 text-white" />
                                    </div>
                                    <h1 className="text-lg font-semibold text-white">Assistant IA</h1>
                                </div>
                                <div className="hidden md:flex items-center space-x-2 text-sm">
                                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                    <span className="text-emerald-400">En ligne</span>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={clearChat}
                                    className="p-2 text-gray-400 hover:text-red-400 rounded-lg hover:bg-gray-800 transition-colors"
                                    title="Effacer la conversation"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={handleSignOut}
                                    className="px-3 py-2 text-gray-300 hover:text-white bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
                                >
                                    <LogOut className="h-4 w-4" />
                                    <span className="hidden md:inline">Déconnexion</span>
                                </button>
                            </div>
                        </div>
                    </header>

                    {/* Messages Container */}
                    <div className="flex-1 overflow-y-auto">
                        <div className="max-w-3xl mx-auto px-4 py-8">
                            {messages.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="w-20 h-20 bg-gradient-to-r from-emerald-500/20 to-teal-400/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Sparkles className="h-10 w-10 text-emerald-400" />
                                    </div>
                                    <h2 className="text-3xl font-bold text-white mb-3">
                                        Comment puis-je vous aider ?
                                    </h2>
                                    <p className="text-gray-400 max-w-md mx-auto mb-8">
                                        Posez-moi n importe quelle question ou demandez-moi de créer quelque chose pour vous.
                                    </p>

                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {messages.map((message) => (
                                        <div
                                            key={message.id}
                                            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div
                                                className={`max-w-[85%] md:max-w-[75%] rounded-2xl p-4 transition-all duration-300 ${
                                                    message.role === 'user'
                                                        ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-br-none'
                                                        : 'bg-gray-800/70 backdrop-blur-sm border border-gray-700 rounded-bl-none'
                                                }`}
                                            >
                                                <div className="flex items-start space-x-3">
                                                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                                                        message.role === 'user' ? 'bg-white/20' : 'bg-emerald-500/20'
                                                    }`}>
                                                        {message.role === 'user' ? (
                                                            <User className="h-4 w-4 text-white" />
                                                        ) : (
                                                            <Bot className="h-4 w-4 text-emerald-400" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="font-medium text-sm">
                                                                {message.role === 'user' ? 'Vous' : 'YimcorpAI'}
                                                            </span>
                                                            <div className="flex items-center space-x-2">
                                                                {message.tokensPerSecond && message.role === 'assistant' && (
                                                                    <span className="text-xs text-emerald-400 px-2 py-1 bg-emerald-500/10 rounded-full">
                                                                        {message.tokensPerSecond} t/s
                                                                    </span>
                                                                )}
                                                                {message.role === 'assistant' && (
                                                                    <button
                                                                        onClick={() => copyToClipboard(message.content)}
                                                                        className="text-gray-400 hover:text-gray-300 transition-colors"
                                                                    >
                                                                        <Copy className="h-4 w-4" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className={`whitespace-pre-wrap text-sm ${message.role === 'user' ? 'text-white' : 'text-gray-300'}`}>
                                                            {message.content}
                                                            {message.isLoading && (
                                                                <span className="inline-block ml-1">
                                                                    <span className="animate-pulse">▋</span>
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className={`flex items-center justify-between mt-3 text-xs ${
                                                            message.role === 'user' ? 'text-emerald-200' : 'text-gray-500'
                                                        }`}>
                                                            <span>
                                                                {message.timestamp.toLocaleTimeString('fr-FR', {
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                })}
                                                            </span>
                                                            {message.role === 'assistant' && !message.isLoading && (
                                                                <div className="flex items-center space-x-2">
                                                                    <button className="hover:text-emerald-400 transition-colors">
                                                                        <ThumbsUp className="h-3.5 w-3.5" />
                                                                    </button>
                                                                    <button className="hover:text-red-400 transition-colors">
                                                                        <ThumbsDown className="h-3.5 w-3.5" />
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Input Area */}
                    <div className="border-t border-gray-800 bg-gray-900/80 backdrop-blur-sm">
                        <div className="max-w-3xl mx-auto px-4 py-6">
                            {/* Typing Indicator */}
                            {isTyping && (
                                <div className="flex items-center space-x-2 mb-4 text-sm text-emerald-400 animate-pulse">
                                    <div className="flex space-x-1">
                                        <div className="h-2 w-2 bg-emerald-400 rounded-full animate-bounce"></div>
                                        <div className="h-2 w-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                        <div className="h-2 w-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                    </div>
                                    <span>YimcorpAI rédige une réponse...</span>
                                </div>
                            )}

                            <div className="flex items-end space-x-3">
                                <div className="flex-1 relative">
                                    <textarea
                                        ref={inputRef}
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={handleKeyPress}
                                        placeholder="Envoyez un message à YimcorpAI..."
                                        className="w-full px-4 py-3 pr-12 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none max-h-40"
                                        rows={1}
                                        disabled={loading}
                                        style={{
                                            minHeight: '48px',
                                            maxHeight: '160px'
                                        }}
                                    />
                                    <button
                                        onClick={() => setInput('')}
                                        className="absolute right-3 top-3 text-gray-500 hover:text-gray-300 transition-colors"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                                <button
                                    onClick={handleSend}
                                    disabled={loading || !input.trim()}
                                    className={`flex-shrink-0 h-12 w-12 rounded-xl flex items-center justify-center transition-all duration-200 ${
                                        loading || !input.trim()
                                            ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:shadow-lg hover:shadow-emerald-500/20 hover:scale-105'
                                    }`}
                                >
                                    {loading ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        <Send className="h-5 w-5" />
                                    )}
                                </button>
                            </div>

                            {/* Help Text */}
                            <div className="mt-4 text-center text-xs text-gray-500">
                                <p>YimcorpAI peut faire des erreurs. Vérifiez les informations importantes.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Background Effects */}
            <div className="fixed inset-0 -z-10 overflow-hidden">
                {isDarkMode ? (
                    <>
                        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-emerald-500/5 blur-3xl"></div>
                        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-teal-500/5 blur-3xl"></div>
                    </>
                ) : (
                    <>
                        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-emerald-300/30 blur-3xl"></div>
                        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-teal-300/30 blur-3xl"></div>
                    </>
                )}
            </div>
        </div>
    )
}