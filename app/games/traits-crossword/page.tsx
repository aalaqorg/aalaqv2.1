"use client";
import React from 'react';
import { AppShell } from '../../../components/AppShell';
import { TraitsCrossword } from '../../../components/TraitsCrossword';
import { useUser } from '../../../contexts/UserContext';
import { useRouter } from 'next/navigation';

export default function TraitsCrosswordPage() {
    const { user, setUser } = useUser();
    const router = useRouter();

    return (
        <AppShell>
            <TraitsCrossword 
                currentUser={user}
                onUpdateUser={setUser}
                onBack={() => router.push('/games')}
            />
        </AppShell>
    );
}
