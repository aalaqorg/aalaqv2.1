export interface Reference {
  source: string;
  text: string;
}

// The response from AI
export interface StoryResponse {
  title: string;
  storyContent: string;
  references: Reference[];
  moral: string;
  genre?: string;
}

// The object stored in our "database"
export interface PublishedStory extends StoryResponse {
  id: string;
  author: string;
  votes: number;
  timestamp: number;
  genre: string;
  ratingSum: number;
  ratingCount: number;
  remixedFrom?: string; // ID of the original story
}

export interface User {
  username: string;
  email?: string;
  password?: string;
  bookmarks?: string[]; // IDs of bookmarked stories
  rewardPoints: number;
  huroofCompleted: number;
  gamesPlayed?: Record<string, number>; // gameId -> count
  streak: number;
  lastActivityDate: string; // YYYY-MM-DD
}

export interface Message {
  id: string;
  from: string;
  to: string;
  content: string;
  timestamp: number;
  read: boolean;
}

export interface HuroofWord {
  word: string;
  verse: string;
  reference: string;
  prompt: string;
}

export type ViewState = 'STORYBOOK' | 'LOGIN' | 'DASHBOARD' | 'CREATE' | 'INBOX' | 'FAVORITES' | 'GAMES';

export enum AppState {
  IDLE = 'IDLE',
  GENERATING = 'GENERATING',
  EDITING = 'EDITING', // User is editing the AI output
  ERROR = 'ERROR'
}

export const GENRES = ['Wisdom', 'Adventure', 'Fable', 'Mystery', 'Sci-Fi', 'Nature'];
