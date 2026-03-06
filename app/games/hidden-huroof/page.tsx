"use client";
import React from 'react';
import { AppShell } from '../../../components/AppShell';
import { HiddenHuroof } from '../../../components/HiddenHuroof';
import { useUser } from '../../../contexts/UserContext';
import { useRouter } from 'next/navigation';

export default function HiddenHuroofPage() {
    const { user, setUser } = useUser();
    const router = useRouter();

    return (
        <AppShell>
            <HiddenHuroof 
                currentUser={user}
                onUpdateUser={setUser}
                onBack={() => router.push('/games')}
            />
        </AppShell>
    );
}
