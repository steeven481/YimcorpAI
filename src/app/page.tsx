'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from "@/app/lib/supabase/client"
import { Loader2, MessageSquare, Sparkles } from 'lucide-react'

export default function HomePage() {
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()

            if (user) {
                router.push('/chat')
            } else {
                router.push('/login')
            }
        }

        checkUser()
    }, [router, supabase.auth])

    return (
        <div className="min-h-screen bg-gray-900">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHoiIGZpbGw9IiMxRDFFMjAiLz48L2c+PC9zdmc+')] opacity-20"></div>
            </div>

            {/* Main Container */}
            <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-8">
                {/* Header */}
                <div className="mb-8 w-full max-w-md text-center">
                    <div className="mb-6 inline-flex items-center justify-center space-x-3">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 animate-pulse">
                            <MessageSquare className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">
                                Yimcorp<span className="text-emerald-400">AI</span>
                            </h1>
                            <p className="text-sm text-gray-400 mt-1">
                                Intelligent conversations redefined
                            </p>
                        </div>
                    </div>
                </div>

                {/* Loading Card */}
                <div className="w-full max-w-md">
                    <div className="rounded-xl border border-gray-700 bg-gray-800/50 backdrop-blur-sm p-8 shadow-2xl">
                        {/* Loading Content */}
                        <div className="text-center">
                            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-400/20">
                                <Sparkles className="h-8 w-8 text-emerald-400 animate-pulse" />
                            </div>

                            <h2 className="text-xl font-semibold text-white mb-4">
                                Preparing your experience
                            </h2>

                            <p className="text-gray-400 mb-8">
                                We&#39;re checking your session and getting everything ready
                            </p>

                            {/* Animated Loader */}
                            <div className="flex flex-col items-center justify-center space-y-6">
                                <div className="relative">
                                    <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-700 border-t-emerald-500"></div>
                                    <Loader2 className="absolute top-1/2 left-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 text-emerald-400 animate-spin" />
                                </div>

                                <div className="w-full max-w-xs">
                                    <div className="h-2 w-full rounded-full bg-gray-700 overflow-hidden">
                                        <div className="h-full w-1/3 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full animate-slide">
                                            <style jsx>{`
                                                @keyframes slide {
                                                    0% { transform: translateX(-100%); }
                                                    100% { transform: translateX(333%); }
                                                }
                                                .animate-slide {
                                                    animation: slide 1.5s ease-in-out infinite;
                                                }
                                            `}</style>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Features */}
                        <div className="mt-10 grid grid-cols-3 gap-4 text-center">
                            <div className="space-y-2">
                                <div className="mx-auto h-2 w-2 rounded-full bg-emerald-500"></div>
                                <p className="text-xs text-gray-400">Secure</p>
                            </div>
                            <div className="space-y-2">
                                <div className="mx-auto h-2 w-2 rounded-full bg-teal-500"></div>
                                <p className="text-xs text-gray-400">Fast</p>
                            </div>
                            <div className="space-y-2">
                                <div className="mx-auto h-2 w-2 rounded-full bg-emerald-400"></div>
                                <p className="text-xs text-gray-400">Intelligent</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center">
                    <p className="text-sm text-gray-500">
                        © {new Date().getFullYear()} YimcorpAI. All rights reserved.
                    </p>
                </div>
            </div>

            {/* Decorative Elements */}
            <div className="fixed bottom-0 left-0 right-0 top-0 -z-10 overflow-hidden">
                <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-emerald-500/5 blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-teal-500/5 blur-3xl"></div>

                {/* Grid Pattern */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-900/50 to-gray-900"></div>
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
            </div>
        </div>
    )
}