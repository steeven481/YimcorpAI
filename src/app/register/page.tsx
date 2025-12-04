'use client'

import { useState } from 'react'
import { createClient } from "@/app/lib/supabase/client"
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Check, X, Mail, Lock, User, ArrowRight, Loader2, MessageSquare, Sparkles } from 'lucide-react'

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        fullName: '',
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [passwordStrength, setPasswordStrength] = useState(0)
    const router = useRouter()
    const supabase = createClient()

    const validatePassword = (password: string) => {
        let strength = 0
        if (password.length >= 8) strength++
        if (/[A-Z]/.test(password)) strength++
        if (/[a-z]/.test(password)) strength++
        if (/[0-9]/.test(password)) strength++
        if (/[^A-Za-z0-9]/.test(password)) strength++
        return strength
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))

        if (name === 'password') {
            setPasswordStrength(validatePassword(value))
        }
    }

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        setSuccess('')

        if (formData.password !== formData.confirmPassword) {
            setError('Les mots de passe ne correspondent pas')
            setLoading(false)
            return
        }

        if (passwordStrength < 3) {
            setError('Le mot de passe est trop faible. Utilisez un mot de passe plus fort.')
            setLoading(false)
            return
        }

        try {
            const {error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.fullName,
                        avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.fullName)}&background=random`
                    },
                    emailRedirectTo: `${window.location.origin}/auth/callback`
                }
            })

            if (authError) throw authError

            setSuccess('Compte créé avec succès ! Vérifiez votre email pour confirmer votre compte.')

            setTimeout(() => {
                router.push('/login')
            }, 3000)
        } catch (error) {
            console.error('Registration error:', error)

            if (error instanceof Error) {
                if (error.message.includes('already registered')) {
                    setError('Cet email est déjà enregistré. Essayez de vous connecter à la place.')
                } else if (error.message.includes('password')) {
                    setError('Mot de passe trop faible. Utilisez au moins 8 caractères avec majuscules, minuscules et chiffres.')
                } else if (error.message.includes('email')) {
                    setError('Veuillez entrer une adresse email valide.')
                } else {
                    setError(error.message || 'Une erreur est survenue lors de l\'inscription.')
                }
            } else {
                setError('Une erreur inconnue est survenue')
            }
        } finally {
            setLoading(false)
        }
    }


    const getPasswordStrengthColor = () => {
        if (passwordStrength === 0) return 'bg-gray-700'
        if (passwordStrength <= 2) return 'bg-red-500'
        if (passwordStrength === 3) return 'bg-yellow-500'
        if (passwordStrength === 4) return 'bg-blue-500'
        return 'bg-emerald-500'
    }

    const getPasswordStrengthText = () => {
        if (passwordStrength === 0) return ''
        if (passwordStrength <= 2) return 'Faible'
        if (passwordStrength === 3) return 'Moyen'
        if (passwordStrength === 4) return 'Bon'
        return 'Fort'
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
                        Créez votre compte pour commencer
                    </p>
                </div>

                {/* Register Card */}
                <div className="w-full max-w-md">
                    <div className="rounded-xl border border-gray-700 bg-gray-800/50 backdrop-blur-sm p-8 shadow-2xl">
                        {/* Welcome Message */}
                        <div className="mb-6 text-center">
                            <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-400/20">
                                <Sparkles className="h-6 w-6 text-emerald-400" />
                            </div>
                            <h2 className="text-xl font-semibold text-white">
                                Créer un compte
                            </h2>
                            <p className="mt-2 text-sm text-gray-400">
                                Rejoignez notre communauté
                            </p>
                        </div>

                        <form onSubmit={handleRegister} className="space-y-6">
                            {/* Full Name Field */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-300">
                                    <User className="inline h-4 w-4 mr-2" />
                                    Nom complet
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        className="block w-full rounded-lg border border-gray-600 bg-gray-700 p-3 pl-10 text-white placeholder-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-colors"
                                        placeholder="John Doe"
                                        required
                                        disabled={loading}
                                    />
                                    <User className="absolute left-3 top-3.5 h-4 w-4 text-gray-500" />
                                </div>
                            </div>

                            {/* Email Field */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-300">
                                    <Mail className="inline h-4 w-4 mr-2" />
                                    Adresse email
                                </label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="block w-full rounded-lg border border-gray-600 bg-gray-700 p-3 pl-10 text-white placeholder-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-colors"
                                        placeholder="vous@exemple.com"
                                        required
                                        disabled={loading}
                                    />
                                    <Mail className="absolute left-3 top-3.5 h-4 w-4 text-gray-500" />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-300">
                                    <Lock className="inline h-4 w-4 mr-2" />
                                    Mot de passe
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="block w-full rounded-lg border border-gray-600 bg-gray-700 p-3 pl-10 pr-10 text-white placeholder-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-colors"
                                        placeholder="••••••••"
                                        required
                                        disabled={loading}
                                    />
                                    <Lock className="absolute left-3 top-3.5 h-4 w-4 text-gray-500" />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-300 transition-colors"
                                        disabled={loading}
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>

                                {/* Password Strength Indicator */}
                                {formData.password && (
                                    <div className="mt-3 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-400">Force du mot de passe:</span>
                                            <span className={`text-sm font-medium ${
                                                passwordStrength <= 2 ? 'text-red-400' :
                                                    passwordStrength === 3 ? 'text-yellow-400' :
                                                        passwordStrength === 4 ? 'text-blue-400' :
                                                            'text-emerald-400'
                                            }`}>
                                                {getPasswordStrengthText()}
                                            </span>
                                        </div>
                                        <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                                                style={{ width: `${(passwordStrength / 5) * 100}%` }}
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div className="flex items-center gap-2">
                                                {formData.password.length >= 8 ?
                                                    <Check className="text-emerald-400 h-3.5 w-3.5" /> :
                                                    <X className="text-gray-600 h-3.5 w-3.5" />
                                                }
                                                <span className={formData.password.length >= 8 ? 'text-emerald-400' : 'text-gray-500'}>
                                                    8+ caractères
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {/[A-Z]/.test(formData.password) ?
                                                    <Check className="text-emerald-400 h-3.5 w-3.5" /> :
                                                    <X className="text-gray-600 h-3.5 w-3.5" />
                                                }
                                                <span className={/[A-Z]/.test(formData.password) ? 'text-emerald-400' : 'text-gray-500'}>
                                                    Majuscule
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {/[a-z]/.test(formData.password) ?
                                                    <Check className="text-emerald-400 h-3.5 w-3.5" /> :
                                                    <X className="text-gray-600 h-3.5 w-3.5" />
                                                }
                                                <span className={/[a-z]/.test(formData.password) ? 'text-emerald-400' : 'text-gray-500'}>
                                                    Minuscule
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {/[0-9]/.test(formData.password) ?
                                                    <Check className="text-emerald-400 h-3.5 w-3.5" /> :
                                                    <X className="text-gray-600 h-3.5 w-3.5" />
                                                }
                                                <span className={/[0-9]/.test(formData.password) ? 'text-emerald-400' : 'text-gray-500'}>
                                                    Chiffre
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Confirm Password Field */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-300">
                                    Confirmer le mot de passe
                                </label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className={`block w-full rounded-lg border p-3 text-white placeholder-gray-400 focus:ring-2 focus:outline-none transition-colors ${
                                        formData.confirmPassword && formData.password !== formData.confirmPassword
                                            ? 'border-red-500 bg-red-500/10 focus:border-red-500 focus:ring-red-500/20'
                                            : 'border-gray-600 bg-gray-700 focus:border-emerald-500 focus:ring-emerald-500/20'
                                    }`}
                                    placeholder="••••••••"
                                    required
                                    disabled={loading}
                                />
                                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                                    <p className="mt-2 text-sm text-red-400">Les mots de passe ne correspondent pas</p>
                                )}
                            </div>

                            {/* Terms */}
                            <div className="flex items-start space-x-3">
                                <input
                                    type="checkbox"
                                    id="terms"
                                    className="mt-1 h-4 w-4 rounded border-gray-600 bg-gray-700 text-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                                    required
                                    disabled={loading}
                                />
                                <label htmlFor="terms" className="text-sm text-gray-400">
                                    accepte les{' '}
                                    <Link href="" className="text-emerald-400 hover:text-emerald-300 transition-colors">
                                        conditions utilisation
                                    </Link>{' '}
                                    et la{' '}
                                    <Link href="" className="text-emerald-400 hover:text-emerald-300 transition-colors">
                                        politique de confidentialité
                                    </Link>
                                </label>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
                                    <p className="text-sm text-red-400">
                                        {error}
                                    </p>
                                </div>
                            )}

                            {/* Success Message */}
                            {success && (
                                <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
                                    <p className="text-sm text-emerald-400">
                                        {success}
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
                                        Création du compte...
                                    </>
                                ) : (
                                    <>
                                        <span>Créer un compte</span>
                                        <ArrowRight className="h-4 w-4" />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Sign In Link */}
                        <div className="mt-6 text-center">
                            <p className="text-gray-400">
                                Vous avez déjà un compte?{' '}
                                <Link
                                    href="/login"
                                    className="font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
                                >
                                    Se connecter
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center">
                    <p className="text-sm text-gray-500">
                        © {new Date().getFullYear()} YimcorpAI. Tous droits réservés.
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