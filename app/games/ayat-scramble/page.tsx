"use client";
import React from 'react';
import { AppShell } from '../../../components/AppShell';
import { AyatScramble } from '../../../components/AyatScramble';
import { useUser } from '../../../contexts/UserContext';
import { useRouter } from 'next/navigation';

export default function AyatScramblePage() {
    const { user, setUser } = useUser();
    const router = useRouter();

    return (
        <AppShell>
            <AyatScramble 
                currentUser={user}
                onUpdateUser={setUser}
                onBack={() => router.push('/games')}
            />
        </AppShell>
    );
}
