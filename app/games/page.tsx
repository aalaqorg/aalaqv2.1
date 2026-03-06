"use client";

import React from 'react';
import { AppShell } from '../../components/AppShell';
import { GameHub } from '../../components/GameHub';

export default function GamesPage() {
  return (
    <AppShell>
      <GameHub />
    </AppShell>
  );
}
