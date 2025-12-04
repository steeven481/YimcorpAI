import {createClient} from "@/app/lib/supabase/client"

export type Message = {
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
    tokensPerSecond?: string
    isLoading?: boolean
}

export type Conversation = {
    id: string
    title: string
    created_at: string
    updated_at: string
    message_count: number
}

class ChatService {
    private supabase = createClient()

    private generateUUID(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    async getOrCreateConversation(title?: string): Promise<string | null> {
        try {
            const { data: userData } = await this.supabase.auth.getUser()
            if (!userData.user) return null

            const { data: conversations } = await this.supabase
                .from('conversations')
                .select('*')
                .eq('user_id', userData.user.id)
                .order('created_at', { ascending: false })
                .limit(1)

            if (conversations && conversations.length > 0) {
                return conversations[0].id
            }

            const conversationTitle = title || 'Nouvelle conversation'
            const { data: newConversation, error } = await this.supabase
                .from('conversations')
                .insert({
                    id: this.generateUUID(),
                    user_id: userData.user.id,
                    title: conversationTitle,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .select()
                .single()

            if (error) {
                console.error('Error creating conversation:', error)
                return null
            }
            return newConversation.id
        } catch (error) {
            console.error('Error getting/creating conversation:', error)
            return null
        }
    }

    async createNewConversation(title?: string): Promise<string | null> {
        try {
            const { data: userData } = await this.supabase.auth.getUser()
            if (!userData.user) return null

            const conversationTitle = title || 'Nouvelle conversation'
            const { data: newConversation, error } = await this.supabase
                .from('conversations')
                .insert({
                    id: this.generateUUID(),
                    user_id: userData.user.id,
                    title: conversationTitle,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .select()
                .single()

            if (error) {
                console.error('Error creating conversation:', error)
                return null
            }
            return newConversation.id
        } catch (error) {
            console.error('Error creating conversation:', error)
            return null
        }
    }

    async loadConversationMessages(conversationId: string): Promise<Message[]> {
        try {
            const { data: messages, error } = await this.supabase
                .from('messages')
                .select('*')
                .eq('conversation_id', conversationId)
                .order('created_at', { ascending: true })

            if (error) {
                console.error('Error loading messages:', error)
                return []
            }

            if (!messages) {
                return []
            }

            return messages.map(msg => ({
                id: msg.id,
                role: msg.role as 'user' | 'assistant',
                content: msg.content,
                timestamp: new Date(msg.created_at),
                tokensPerSecond: msg.tokens ? Math.round(msg.tokens).toString() : undefined
            }))
        } catch (error) {
            console.error('Error loading messages:', error)
            return []
        }
    }

    async saveMessage(
        conversationId: string,
        message: {
            id?: string
            role: 'user' | 'assistant'
            content: string
            tokens?: number
        }
    ): Promise<string | null> {
        try {
            const messageId = message.id || this.generateUUID()

            const { error } = await this.supabase
                .from('messages')
                .insert({
                    id: messageId,
                    conversation_id: conversationId,
                    role: message.role,
                    content: message.content,
                    tokens: message.tokens || 0,
                    created_at: new Date().toISOString()
                })

            if (error) {
                console.error('Error saving message:', error)
                return null
            }


            await this.updateConversationTimestamp(conversationId)
            return messageId
        } catch (error) {
            console.error('Error saving message:', error)
            return null
        }
    }

    async updateConversationTitle(conversationId: string, title: string): Promise<boolean> {
        try {
            const { error } = await this.supabase
                .from('conversations')
                .update({
                    title,
                    updated_at: new Date().toISOString()
                })
                .eq('id', conversationId)

            if (error) {
                console.error('Error updating conversation title:', error)
                return false
            }
            return true
        } catch (error) {
            console.error('Error updating conversation title:', error)
            return false
        }
    }

    async updateConversationTimestamp(conversationId: string): Promise<void> {
        try {
            await this.supabase
                .from('conversations')
                .update({
                    updated_at: new Date().toISOString()
                })
                .eq('id', conversationId)
        } catch (error) {
            console.error('Error updating conversation timestamp:', error)
        }
    }

    async deleteConversation(conversationId: string): Promise<boolean> {
        try {
            const { error: messagesError } = await this.supabase
                .from('messages')
                .delete()
                .eq('conversation_id', conversationId)

            if (messagesError) {
                console.error('Error deleting messages:', messagesError)
                return false
            }

            const { error: convError } = await this.supabase
                .from('conversations')
                .delete()
                .eq('id', conversationId)

            if (convError) {
                console.error('Error deleting conversation:', convError)
                return false
            }
            return true
        } catch (error) {
            console.error('Error deleting conversation:', error)
            return false
        }
    }

    async getUserConversations(): Promise<Conversation[]> {
        try {
            const { data: userData } = await this.supabase.auth.getUser()
            if (!userData.user) return []

            const { data: conversations, error } = await this.supabase
                .from('conversations')
                .select(`
                    id,
                    title,
                    created_at,
                    updated_at
                `)
                .eq('user_id', userData.user.id)
                .order('updated_at', { ascending: false })

            if (error) {
                console.error('Error getting conversations:', error)
                return []
            }

            if (!conversations) {
                return []
            }

            return await Promise.all(
                conversations.map(async (conv) => {
                    const {count} = await this.supabase
                        .from('messages')
                        .select('*', {count: 'exact', head: true})
                        .eq('conversation_id', conv.id)

                    return {
                        id: conv.id,
                        title: conv.title,
                        created_at: conv.created_at,
                        updated_at: conv.updated_at,
                        message_count: count || 0
                    }
                })
            )
        } catch (error) {
            console.error('Error getting conversations:', error)
            return []
        }
    }
}

export const chatService = new ChatService()