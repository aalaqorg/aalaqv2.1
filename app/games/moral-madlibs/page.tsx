"use client";
import React from 'react';
import { AppShell } from '../../../components/AppShell';
import { MoralMadLibs } from '../../../components/MoralMadLibs';
import { useUser } from '../../../contexts/UserContext';
import { useRouter } from 'next/navigation';

export default function MoralMadLibsPage() {
    const { user, setUser } = useUser();
    const router = useRouter();

    return (
        <AppShell>
            <MoralMadLibs 
                currentUser={user}
                onUpdateUser={setUser}
                onBack={() => router.push('/games')}
            />
        </AppShell>
    );
}
