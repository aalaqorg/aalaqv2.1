"use client";
import React from 'react';
import { AppShell } from '../../../components/AppShell';
import { HuroofGame } from '../../../components/HuroofGame';
import { useUser } from '../../../contexts/UserContext';
import { useRouter } from 'next/navigation';

export default function HuroofPage() {
    const { user, setUser } = useUser();
    const router = useRouter();

    return (
        <AppShell>
            <HuroofGame 
                currentUser={user}
                onUpdateUser={setUser}
                onBack={() => router.push('/games')}
                onWriteStory={(prompt) => {
                    const encoded = encodeURIComponent(prompt);
                    router.push(`/create?prompt=${encoded}`);
                }}
            />
        </AppShell>
    );
}
