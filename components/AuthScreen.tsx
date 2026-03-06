import React, { useState } from 'react';
import { storageService } from '../services/storageService';

interface AuthScreenProps {
  onLogin: (username: string) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
        if (isLogin) {
            const user = await storageService.loginUser(username, password);
            if (user) {
                onLogin(user.username);
            } else {
                setError("Invalid credentials");
            }
        } else {
            if (username.trim().length < 3) throw new Error("Username must be at least 3 characters");
            if (!email.includes('@')) throw new Error("Please enter a valid email");
            if (password.length < 6) throw new Error("Password must be at least 6 characters");

            const newUser = { username: username.trim(), email: email.trim(), password };
            await storageService.registerUser(newUser);
            onLogin(username.trim());
        }
    } catch (err: any) {
        setError(err.message);
    }
  };

  return (
    <div className="w-full">
        <div className="mb-10 text-center">
            <h2 className="text-4xl font-serif font-black text-brand-dark mb-3 tracking-tight">
                {isLogin ? 'Welcome Back' : 'Unlock the Full Adventure'}
            </h2>
            <p className="text-gray-600 font-bold font-sans">
                {isLogin ? 'Resume your storytelling journey.' : 'Join the circle to create, share, and message authors.'}
            </p>
        </div>

        {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-600 font-bold text-sm rounded-2xl border border-red-200">
                {error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-2">Username</label>
            <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. AliWriter"
                className="w-full p-4 rounded-2xl bg-white/50 border border-white/60 focus:border-brand-mint focus:ring-4 focus:ring-brand-mint/20 text-brand-dark outline-none transition-all font-bold placeholder-gray-400 shadow-inner"
                required
            />
          </div>

          {!isLogin && (
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-2">Email</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full p-4 rounded-2xl bg-white/50 border border-white/60 focus:border-brand-mint focus:ring-4 focus:ring-brand-mint/20 text-brand-dark outline-none transition-all font-bold placeholder-gray-400 shadow-inner"
                    required
                />
              </div>
          )}

          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-2">Password</label>
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-4 rounded-2xl bg-white/50 border border-white/60 focus:border-brand-mint focus:ring-4 focus:ring-brand-mint/20 text-brand-dark outline-none transition-all font-bold placeholder-gray-400 shadow-inner"
                required
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-brand-dark text-white font-black rounded-2xl hover:scale-[1.02] hover:shadow-xl transition-all mt-4 shadow-lg active:scale-95"
          >
            {isLogin ? 'Log In' : 'Create Account'}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-gray-200/50 text-center">
            <p className="text-gray-500 font-bold text-sm">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button 
                    onClick={() => { setIsLogin(!isLogin); setError(''); }}
                    className="text-brand-lavender font-black hover:underline ml-1"
                >
                    {isLogin ? 'Sign Up' : 'Log In'}
                </button>
            </p>
        </div>
    </div>
  );
};
