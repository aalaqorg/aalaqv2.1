"use client";
import React from 'react';
import { AppShell } from '../../../components/AppShell';
import { LetterLadders } from '../../../components/LetterLadders';
import { useUser } from '../../../contexts/UserContext';
import { useRouter } from 'next/navigation';

export default function LetterLaddersPage() {
    const { user, setUser } = useUser();
    const router = useRouter();

    return (
        <AppShell>
            <LetterLadders 
                currentUser={user}
                onUpdateUser={setUser}
                onBack={() => router.push('/games')}
            />
        </AppShell>
    );
}
