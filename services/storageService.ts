import { PublishedStory, User, Message } from "../types";

export const storageService = {
  // --- User Management ---
  registerUser: async (user: Partial<User>): Promise<User> => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Registration failed");
    }
    return await response.json();
  },

  loginUser: async (identifier: string, password?: string): Promise<User | null> => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password }),
    });
    if (!response.ok) return null;
    return await response.json();
  },

  checkDailyStreak: async (username: string): Promise<User | null> => {
    // For now, we can just use login without password or a specific check route
    return await storageService.loginUser(username);
  },

  getUser: (username: string): User | null => {
      // Mock for now, should ideally fetch from API
      // But components expect it synchronous in some legacy parts which is tricky
      // For the build to pass, we return null or mocks. 
      // Ideally refactor components to async getUser
      return null; 
  },

  deductRewardPoints: (username: string, amount: number): boolean => {
      // Mock implementation
      return true;
  },

  incrementGameStat: (username: string, gameId: string) => {
      console.log("Game stat increment not yet implemented on server", { username, gameId });
  },

  getGameLeaderboard: (gameId: string): User[] => [],

  // --- Stories ---
  getStories: async (): Promise<PublishedStory[]> => {
    const response = await fetch('/api/stories');
    if (!response.ok) return [];
    return await response.json();
  },

  getUserStories: async (username: string): Promise<PublishedStory[]> => {
    const all = await storageService.getStories();
    return all.filter(s => s.author.toLowerCase() === username.toLowerCase());
  },

  publishStory: async (story: any): Promise<PublishedStory> => {
    const response = await fetch('/api/stories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(story),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to publish story");
    }
    return await response.json();
  },

  deleteStory: async (id: string) => {
      const response = await fetch(`/api/stories/${id}`, {
          method: 'DELETE',
      });
      if (!response.ok) {
          throw new Error("Failed to delete story");
      }
  },

  voteStory: async (id: string, username?: string) => {
      if (!username) return; 
      await fetch(`/api/stories/${id}/vote`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username })
      });
  },

  hasVoted: async (storyId: string, username: string): Promise<boolean> => {
      // In a real app, check via API. For now, we can assume false or implement a check endpoint.
      // Or we can rely on the story object if it has a 'likedBy' array (which it currently doesn't).
      // Let's create an endpoint for this or just return false for now and update local state optimistically.
      return false; 
  },

  // --- Interaction & Stats ---
  getAuthorRank: (author: string): { rank: number, badge: string } => {
      return { rank: 1, badge: 'Top Writer' };
  },

  getAuthorGenreStats: (author: string): Record<string, number> => {
      return {};
  },

  getBookmarks: async (username: string): Promise<string[]> => {
      const response = await fetch(`/api/users/${username}/bookmarks`);
      if (!response.ok) return [];
      return await response.json();
  },

  getBookmarkedStories: async (username: string): Promise<PublishedStory[]> => {
      // We can fetch IDs then filter, or create a specific endpoint
      const ids = await storageService.getBookmarks(username);
      const all = await storageService.getStories();
      return all.filter(s => ids.includes(s.id));
  },

  toggleBookmark: async (username: string, storyId: string) => {
      await fetch(`/api/stories/${storyId}/bookmark`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username })
      });
  },

  getUserRating: async (storyId: string, username: string): Promise<number> => {
       // Need an endpoint for this or include in story data
       return 0;
  },

  rateStory: async (storyId: string, username: string, rating: number) => {
      await fetch(`/api/stories/${storyId}/rate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, rating })
      });
  },

  // --- Messaging ---
  sendMessage: async (from: string, to: string, content: string): Promise<Message> => {
      const response = await fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ from, to, content }),
      });
      if (!response.ok) throw new Error("Failed to send message");
      return await response.json();
  },

  getMessages: async (username: string): Promise<Message[]> => {
      const response = await fetch(`/api/messages?username=${encodeURIComponent(username)}`);
      if (!response.ok) return [];
      return await response.json();
  },

  getConversation: async (user1: string, user2: string): Promise<Message[]> => {
      const response = await fetch(`/api/messages/conversation?user1=${encodeURIComponent(user1)}&user2=${encodeURIComponent(user2)}`);
      if (!response.ok) return [];
      return await response.json();
  },

  markAsRead: async (msgId: string) => {
      await fetch(`/api/messages/${msgId}/read`, { method: 'PUT' });
  }
};
