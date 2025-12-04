
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Chat - AI Assistant',
    description: 'Chat with AI Assistant',
}

export default function ChatLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    return (
        <div className="h-screen flex flex-col">
            {children}
        </div>
    )
}