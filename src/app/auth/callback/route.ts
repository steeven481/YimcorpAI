import { createServerSupabaseClient } from '@/app/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const error = requestUrl.searchParams.get('error')
    const errorDescription = requestUrl.searchParams.get('error_description')

    console.log('Callback URL:', requestUrl.toString())
    console.log('Code:', code)
    console.log('Error:', error)
    console.log('Error Description:', errorDescription)

    if (error) {
        console.error('Auth error:', error, errorDescription)
        return NextResponse.redirect(`${requestUrl.origin}/login?error=${encodeURIComponent(errorDescription || error)}`)
    }

    if (code) {
        try {
            const supabase = await createServerSupabaseClient()
            const { error: authError } = await supabase.auth.exchangeCodeForSession(code)

            if (authError) {
                console.error('Exchange code error:', authError)
                return NextResponse.redirect(`${requestUrl.origin}/login?error=${encodeURIComponent(authError.message)}`)
            }

            console.log('Successfully exchanged code for session')
        } catch (err) {
            console.error('Unexpected error in callback:', err)
            return NextResponse.redirect(`${requestUrl.origin}/login?error=${encodeURIComponent('Unexpected error')}`)
        }
    }

    // Rediriger vers la page chat
    return NextResponse.redirect(`${requestUrl.origin}/chat`)
}