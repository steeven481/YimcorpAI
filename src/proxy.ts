import {createServerSupabaseClient} from "@/app/lib/supabase/server";
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
    const response = NextResponse.next()


    const supabase = await createServerSupabaseClient()

    try {

        const {
            data: { session },
        } = await supabase.auth.getSession()

        if (!session && request.nextUrl.pathname.startsWith('/chat')) {
            const redirectUrl = new URL('/login', request.url)
            redirectUrl.searchParams.set('redirectedFrom', request.nextUrl.pathname)
            return NextResponse.redirect(redirectUrl)
        }

        if (session && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/register')) {
            return NextResponse.redirect(new URL('/chat', request.url))
        }
    } catch (error) {
        console.error('Middleware auth error:', error)
        if (request.nextUrl.pathname.startsWith('/chat')) {
            return NextResponse.redirect(new URL('/login', request.url))
        }
    }

    return response
}
