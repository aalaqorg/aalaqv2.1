"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AppShell } from '../../components/AppShell';
import { InputForm } from '../../components/InputForm';
import { StoryEditor } from '../../components/StoryEditor';
import { generateStory } from '../../services/geminiService';
import { storageService } from '../../services/storageService';
import { StoryResponse, AppState, PublishedStory } from '../../types';
import { useUser } from '../../contexts/UserContext';

function CreateStoryContent() {
  const { user, setMyStories } = useUser();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const initialPrompt = searchParams.get('prompt') || '';
  const remixId = searchParams.get('remixId');

  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [generatedStory, setGeneratedStory] = useState<StoryResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [remixContext, setRemixContext] = useState<{ originalStory: string, originalAuthor: string, originalId: string } | null>(null);

  useEffect(() => {
      if (remixId) {
          // Fetch story to remix
          // Since we don't have a direct getStory endpoint in storageService that returns one story, 
          // we might need to fetch all and find. Or add getStory.
          storageService.getStories().then(stories => {
              const story = stories.find(s => s.id === remixId);
              if (story) {
                  setRemixContext({
                      originalStory: story.storyContent,
                      originalAuthor: story.author,
                      originalId: story.id
                  });
              }
          });
      }
  }, [remixId]);

  const handleGenerate = async (prompt: string, genre: string) => {
    setAppState(AppState.GENERATING);
    setErrorMsg(null);
    try {
      const result = await generateStory(prompt, genre, remixContext ? { 
          originalStory: remixContext.originalStory, 
          originalAuthor: remixContext.originalAuthor 
      } : undefined);
      
      setGeneratedStory({ ...result, genre });
      setAppState(AppState.EDITING);
    } catch (err: any) {
      console.error(err);
      setAppState(AppState.ERROR);
      setErrorMsg("Oops! The storyteller needs a moment. Please check your internet or try again.");
    }
  };

  const handlePublish = async (finalStory: StoryResponse) => {
    if (!user) {
        alert("Please login to publish");
        return;
    }
    try {
        await storageService.publishStory({
            ...finalStory,
            author: user.username,
            moral: finalStory.moral,
            references: finalStory.references,
            genre: finalStory.genre || 'Wisdom',
            remixedFrom: remixContext?.originalId
        });
        // Refresh local data
        const stories = await storageService.getUserStories(user.username);
        setMyStories(stories);
        router.push('/dashboard');
    } catch (e: any) {
        alert(e.message);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
        {appState === AppState.IDLE && (
            <>
                <h2 className="text-5xl font-serif font-black text-brand-dark mb-10 tracking-tight">
                    {remixContext ? 'Remix a Tale' : 'Start a New Tale'}
                </h2>
                <InputForm 
                    onSubmit={handleGenerate} 
                    isLoading={false} 
                    initialPrompt={initialPrompt}
                />
            </>
        )}

        {appState === AppState.GENERATING && (
            <div className="flex flex-col items-center justify-center space-y-8 animate-[fadeIn_0.5s_ease-in] py-20">
                <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md border-2 border-brand-brightGold animate-bounce">
                    <svg className="w-16 h-16 text-brand-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                </div>
                <p className="text-3xl text-brand-dark font-serif font-bold animate-pulse text-center">
                    Consulting the library of wisdom...
                </p>
            </div>
        )}

        {appState === AppState.EDITING && generatedStory && (
            <StoryEditor 
                initialStory={generatedStory} 
                onPublish={handlePublish}
                onCancel={() => setAppState(AppState.IDLE)} 
            />
        )}

        {appState === AppState.ERROR && (
            <div className="bg-red-100 p-8 rounded-[2rem] text-center max-w-lg">
                <h3 className="text-red-500 text-2xl font-black mb-2">Something went wrong</h3>
                <p className="text-gray-600 mb-8 font-bold">{errorMsg}</p>
                <button onClick={() => setAppState(AppState.IDLE)} className="px-8 py-3 bg-red-500 text-white font-bold rounded-xl">Try Again</button>
            </div>
        )}
    </div>
  );
}

export default function CreatePage() {
    return (
        <AppShell>
            <Suspense fallback={<div>Loading...</div>}>
                <CreateStoryContent />
            </Suspense>
        </AppShell>
    );
}
