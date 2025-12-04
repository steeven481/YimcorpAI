'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from "@/app/lib/supabase/client"
import { Eye, EyeOff, Mail, Lock, Loader2, MessageSquare, Sparkles, ArrowRight } from 'lucide-react'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()
    const supabase = createClient()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) throw error
            router.push('/chat')
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message)
            } else {
                setError('An error occurred. Please try again.')
            }
        } finally {
            setLoading(false)
        }
    }

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
                    <div className="mb-4 inline-flex items-center justify-center space-x-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400">
                            <MessageSquare className="h-6 w-6 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-white">
                            Yimcorp<span className="text-emerald-400">AI</span>
                        </h1>
                    </div>
                    <p className="text-gray-400">
                        Sign in to continue your conversations
                    </p>
                </div>

                {/* Login Card */}
                <div className="w-full max-w-md">
                    <div className="rounded-xl border border-gray-700 bg-gray-800/50 backdrop-blur-sm p-8 shadow-2xl">
                        {/* Welcome Message */}
                        <div className="mb-6 text-center">
                            <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-400/20">
                                <Sparkles className="h-6 w-6 text-emerald-400" />
                            </div>
                            <h2 className="text-xl font-semibold text-white">
                                Welcome back
                            </h2>
                            <p className="mt-2 text-sm text-gray-400">
                                Enter your credentials to continue
                            </p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-6">
                            {/* Email Field */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-300">
                                    Email address
                                </label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <Mail className="h-5 w-5 text-gray-500" />
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full rounded-lg border border-gray-600 bg-gray-700 p-3 pl-10 text-white placeholder-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-colors"
                                        placeholder="you@example.com"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div>
                                <div className="mb-2 flex items-center justify-between">
                                    <label className="block text-sm font-medium text-gray-300">
                                        Password
                                    </label>
                                    <Link
                                        // href="/forgot-password"
                                        className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                                        href={""}                                    >
                                        Forgot password?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <Lock className="h-5 w-5 text-gray-500" />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full rounded-lg border border-gray-600 bg-gray-700 p-3 pl-10 pr-10 text-white placeholder-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-colors"
                                        placeholder="••••••••"
                                        required
                                        disabled={loading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-300 transition-colors"
                                        disabled={loading}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
                                    <p className="text-sm text-red-400">
                                        {error}
                                    </p>
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-3 font-medium text-white hover:from-emerald-500 hover:to-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/20"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        Signing in...
                                    </>
                                ) : (
                                    <>
                                        Sign in
                                        <ArrowRight className="h-4 w-4" />
                                    </>
                                )}
                            </button>

                            {/* Divider */}
                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-700"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="bg-gray-800 px-2 text-gray-400">
                                        New to YimcorpAI?
                                    </span>
                                </div>
                            </div>

                            {/* Sign Up Link */}
                            <div className="text-center">
                                <Link
                                    href="/register"
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gray-600 bg-gray-700/50 px-4 py-3 font-medium text-gray-300 hover:border-gray-500 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-gray-600 transition-all duration-200"
                                >
                                    <span>Create an account</span>
                                    <Sparkles className="h-4 w-4" />
                                </Link>
                            </div>
                        </form>

                        {/* Terms */}
                        <div className="mt-8 text-center">
                            <p className="text-xs text-gray-500">
                                By signing in, you agree to our{' '}
                                <Link href="/terms" className="text-emerald-400 hover:text-emerald-300 transition-colors">
                                    Terms of Service
                                </Link>{' '}
                                and{' '}
                                <Link href="/privacy" className="text-emerald-400 hover:text-emerald-300 transition-colors">
                                    Privacy Policy
                                </Link>
                            </p>
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