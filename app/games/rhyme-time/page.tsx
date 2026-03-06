"use client";
import React from 'react';
import { AppShell } from '../../../components/AppShell';
import { RhymeTime } from '../../../components/RhymeTime';
import { useUser } from '../../../contexts/UserContext';
import { useRouter } from 'next/navigation';

export default function RhymeTimePage() {
    const { user, setUser } = useUser();
    const router = useRouter();

    return (
        <AppShell>
            <RhymeTime 
                currentUser={user}
                onUpdateUser={setUser}
                onBack={() => router.push('/games')}
            />
        </AppShell>
    );
}
