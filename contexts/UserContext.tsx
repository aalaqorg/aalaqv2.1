"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, PublishedStory } from '../types';
import { storageService } from '../services/storageService';

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  myStories: PublishedStory[];
  setMyStories: (stories: PublishedStory[]) => void;
  login: (username: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [myStories, setMyStories] = useState<PublishedStory[]>([]);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    // Check for existing user session
    const savedUser = localStorage.getItem('aalaq_user');
    if (savedUser) {
        try {
            const u = JSON.parse(savedUser);
            // Check streak on load
            storageService.checkDailyStreak(u.username).then(updatedUser => {
                const finalUser = updatedUser || u;
                setUser(finalUser);
                storageService.getUserStories(finalUser.username).then(setMyStories);
            });
        } catch (e) {
            console.error("Failed to parse saved user", e);
        }
    }
  }, []);

  const login = async (username: string) => {
    const loggedInUser = await storageService.loginUser(username);
    if (loggedInUser) {
        setUser(loggedInUser);
        localStorage.setItem('aalaq_user', JSON.stringify(loggedInUser));
        const stories = await storageService.getUserStories(username);
        setMyStories(stories);
        setShowAuthModal(false);
    } else {
        const newUser = await storageService.registerUser({ 
            username, 
            rewardPoints: 0, 
            huroofCompleted: 0, 
            streak: 1, 
            lastActivityDate: new Date().toISOString().split('T')[0] 
        });
        setUser(newUser);
        localStorage.setItem('aalaq_user', JSON.stringify(newUser));
        const stories = await storageService.getUserStories(username);
        setMyStories(stories);
        setShowAuthModal(false);
    }
  };

  const logout = () => {
    setUser(null);
    setMyStories([]);
    localStorage.removeItem('aalaq_user');
  };

  const refreshUser = async () => {
      if (user) {
          // This assumes storageService has a way to get user by username, or we just rely on local state updates from games
          // For now, let's just re-fetch stories. 
          // If games update user, they should call setUser.
          const stories = await storageService.getUserStories(user.username);
          setMyStories(stories);
      }
  };

  return (
    <UserContext.Provider value={{ 
        user, 
        setUser, 
        myStories, 
        setMyStories, 
        login, 
        logout, 
        refreshUser,
        showAuthModal,
        setShowAuthModal
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
