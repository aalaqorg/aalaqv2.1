"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from './Logo';
import { useUser } from '../contexts/UserContext';
import { AuthScreen } from './AuthScreen';

export const AppShell = ({ children }: { children: React.ReactNode }) => {
  const { user, logout, showAuthModal, setShowAuthModal, login } = useUser();
  const pathname = usePathname();

  const handleLogin = async (username: string) => {
      // AuthScreen calls this after successful login/register
      // But AuthScreen internally calls storageService. 
      // We should probably update AuthScreen to use context, but for now let's keep it simple.
      // If AuthScreen returns a username, we refresh the user.
      await login(username); 
  };

  const isActive = (path: string) => pathname === path || (path !== '/' && pathname.startsWith(path));

  return (
    <div className="min-h-screen relative overflow-x-hidden selection:bg-brand-mint selection:text-brand-dark font-sans text-brand-dark flex flex-col">
      
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-mint via-brand-brightGold to-brand-lavender bg-[length:400%_400%] animate-mesh opacity-80"></div>
        <div className="absolute inset-0 bg-white/30 backdrop-blur-[100px]"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-mint rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-lavender rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Navigation */}
      <nav className="w-full p-6 md:px-12 flex justify-between items-center z-50 relative">
        <Link href="/" className="cursor-pointer hover:scale-105 transition-transform duration-300">
          <Logo />
        </Link>
        
        <div className="hidden md:flex items-center gap-2 md:gap-4 bg-white/20 backdrop-blur-xl p-2 rounded-full border border-white/40 shadow-lg">
          <Link 
              href="/"
              className={`text-sm font-bold px-5 py-2.5 rounded-full transition-all duration-300 ${pathname === '/' ? 'bg-white text-brand-dark shadow-md scale-105' : 'text-gray-700 hover:bg-white/50'}`}
          >
              Explore
          </Link>
          <Link 
              href="/games"
              className={`text-sm font-bold px-5 py-2.5 rounded-full transition-all duration-300 ${isActive('/games') ? 'bg-white text-brand-dark shadow-md scale-105' : 'text-gray-700 hover:bg-white/50'}`}
          >
              Games
          </Link>
          
          {user ? (
              <>
                  <div className="flex items-center gap-1 px-3 py-1 bg-brand-brightGold/10 rounded-full border border-brand-brightGold/20 mx-1" title="Daily Streak">
                      <span className="text-lg animate-pulse">🔥</span>
                      <span className="text-sm font-black text-brand-brightGold">{user.streak || 0}</span>
                  </div>

                  <Link 
                      href="/dashboard"
                      className={`text-sm font-bold px-5 py-2.5 rounded-full transition-all duration-300 ${isActive('/dashboard') ? 'bg-white text-brand-dark shadow-md scale-105' : 'text-gray-700 hover:bg-white/50'}`}
                  >
                      My Stories
                  </Link>
                  <Link 
                      href="/inbox"
                      className={`text-sm font-bold px-5 py-2.5 rounded-full transition-all duration-300 ${isActive('/inbox') ? 'bg-white text-brand-dark shadow-md scale-105' : 'text-gray-700 hover:bg-white/50'}`}
                  >
                      Inbox
                  </Link>
                  <div className="h-4 w-px bg-gray-400/50 mx-1"></div>
                  <button onClick={logout} className="text-gray-600 hover:text-red-500 px-3 font-bold transition-colors">
                      Logout
                  </button>
              </>
          ) : (
              <button 
                  onClick={() => setShowAuthModal(true)}
                  className="bg-brand-dark text-white px-6 py-2.5 rounded-full font-bold text-sm hover:scale-105 hover:rotate-1 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                  Login
              </button>
          )}
        </div>

        {!user && (
            <button 
              onClick={() => setShowAuthModal(true)}
              className="md:hidden bg-brand-dark text-white px-4 py-2 rounded-full font-bold text-xs shadow-lg"
          >
              Login
          </button>
        )}
      </nav>

      {/* Mobile Bottom Navigation */}
      {user && (
          <div className="md:hidden fixed bottom-6 left-4 right-4 z-[90] bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white/50 p-2 flex justify-around items-center">
              <Link 
                  href="/"
                  className={`p-3 rounded-full transition-all ${pathname === '/' ? 'bg-brand-dark text-white shadow-lg' : 'text-gray-500'}`}
              >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
              </Link>
              <Link 
                  href="/games"
                  className={`p-3 rounded-full transition-all ${isActive('/games') ? 'bg-brand-dark text-white shadow-lg' : 'text-gray-500'}`}
              >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </Link>
              <Link 
                  href="/dashboard"
                  className={`p-3 rounded-full transition-all ${isActive('/dashboard') ? 'bg-brand-dark text-white shadow-lg' : 'text-gray-500'}`}
              >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              </Link>
              <Link 
                  href="/inbox"
                  className={`p-3 rounded-full transition-all ${isActive('/inbox') ? 'bg-brand-dark text-white shadow-lg' : 'text-gray-500'}`}
              >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </Link>
              <button 
                  onClick={logout}
                  className="p-3 rounded-full text-red-500 hover:bg-red-50 transition-all"
              >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              </button>
          </div>
      )}

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8 pb-32 md:pb-8 flex flex-col items-center z-10">
        {children}
      </main>

      {/* Footer */}
      <footer className="w-full py-8 text-center text-gray-500 text-sm font-bold z-10 border-t border-black/5 bg-white/30 backdrop-blur-md">
          <p>&copy; {new Date().getFullYear()} Aalaq. All rights reserved.</p>
      </footer>

      {/* Auth Modal */}
      {showAuthModal && (
          <div className="fixed inset-0 z-[100] flex justify-end">
              <div className="absolute inset-0 bg-brand-dark/20 backdrop-blur-sm" onClick={() => setShowAuthModal(false)}></div>
              <div className="relative w-full max-w-md h-full bg-white/80 backdrop-blur-2xl shadow-2xl animate-slide-in-elastic p-8 flex flex-col justify-center">
                  <button onClick={() => setShowAuthModal(false)} className="absolute top-8 right-8 text-gray-400">
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                  <AuthScreen onLogin={handleLogin} />
              </div>
          </div>
      )}
    </div>
  );
};
