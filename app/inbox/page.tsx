"use client";
import React, { useState } from 'react';
import { AppShell } from '../../components/AppShell';
import { useUser } from '../../contexts/UserContext';
import { Inbox } from '../../components/Inbox';
import { MessageModal } from '../../components/MessageModal';
import { storageService } from '../../services/storageService';

export default function InboxPage() {
    const { user } = useUser();
    const [messageRecipient, setMessageRecipient] = useState<string | null>(null);

    const handleSendMessage = async (content: string) => {
        if (user && messageRecipient) {
            try {
                await storageService.sendMessage(user.username, messageRecipient, content);
                alert("Message sent!");
                setMessageRecipient(null);
            } catch (e) {
                alert("Failed to send message.");
            }
        }
    };

    if (!user) {
         return (
            <AppShell>
                <div className="text-center py-20">
                    <h2 className="text-3xl font-bold mb-4">Please login to view your inbox.</h2>
                </div>
            </AppShell>
        );
    }

    return (
        <AppShell>
            <div className="w-full max-w-4xl mx-auto">
                <Inbox 
                    currentUser={user}
                    onReply={(sender) => setMessageRecipient(sender)}
                />
            </div>
             {messageRecipient && (
                <MessageModal 
                    recipient={messageRecipient}
                    onSend={handleSendMessage}
                    onClose={() => setMessageRecipient(null)}
                />
            )}
        </AppShell>
    );
}
