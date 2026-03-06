import { StoryResponse } from "../types";

export const generateStory = async (
  userPrompt: string, 
  genre?: string, 
  remixContext?: { originalStory: string, originalAuthor: string }
): Promise<StoryResponse> => {
  const response = await fetch('/api/ai/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userPrompt, genre, remixContext }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to generate story");
  }

  return await response.json();
};