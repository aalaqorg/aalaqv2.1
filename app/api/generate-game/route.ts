import { NextResponse } from "next/server";
import { GoogleGenAI, Type, Schema } from "@google/genai";
import fs from 'fs';
import path from 'path';

// Helper to load env manually if needed
function getApiKey() {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
  
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const envFile = fs.readFileSync(envPath, 'utf8');
      const match = envFile.match(/GEMINI_API_KEY="?([^"\n]+)"?/);
      if (match) return match[1];
    }
  } catch (e) {
    console.error("Failed to read .env file:", e);
  }
  return null;
}

const apiKey = getApiKey();

// --- Schemas for Structured Output ---

const ayatScrambleSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    verse: { type: Type.STRING, description: "The full Quranic verse text in English." },
    reference: { type: Type.STRING, description: "Surah name and verse number (e.g., Surah Al-Baqarah 2:286)." },
    words: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "The individual words of the verse in correct order." 
    }
  },
  required: ["verse", "reference", "words"]
};

const letterLaddersSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    start: { type: Type.STRING, description: "The starting word (3-5 letters)." },
    end: { type: Type.STRING, description: "The target word (same length as start)." },
    steps: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "The intermediate words transforming start to end, changing one letter at a time." 
    }
  },
  required: ["start", "end", "steps"]
};

const traitsCrosswordSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      clue: { type: Type.STRING, description: "A clue describing an Islamic trait or historical fact." },
      answer: { type: Type.STRING, description: "The one-word answer (uppercase)." },
      gridSize: { type: Type.NUMBER, description: "Length of the answer." }
    },
    required: ["clue", "answer", "gridSize"]
  }
};

const rhymeTimeSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    word: { type: Type.STRING, description: "A common Islamic or general word to rhyme with." },
    rhymes: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "A list of 5-8 words that rhyme with the target word." 
    }
  },
  required: ["word", "rhymes"]
};

const hiddenHuroofSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    theme: { type: Type.STRING, description: "The theme of the word search (e.g., Prophets, Fruits, Names of Allah)." },
    words: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "List of 5-8 words related to the theme (uppercase)." 
    },
    gridSize: { type: Type.NUMBER, description: "Recommended grid size (e.g., 8, 10, 12)." }
  },
  required: ["theme", "words", "gridSize"]
};

const huroofSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    word: { type: Type.STRING, description: "A 5-letter Quranic or Islamic word (UPPERCASE)." },
    verse: { type: Type.STRING, description: "A verse or translation where the word appears." },
    reference: { type: Type.STRING, description: "The citation (e.g. Surah 2:185)." },
    prompt: { type: Type.STRING, description: "A short story prompt based on this verse." }
  },
  required: ["word", "verse", "reference", "prompt"]
};

const moralMadLibsSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    story: { type: Type.STRING, description: "The story template with placeholders like {0}, {1}, {2}, {3}." },
    inputs: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "Labels for each placeholder (e.g., 'Name', 'Place', 'Feeling')." 
    }
  },
  required: ["story", "inputs"]
};

// Map schemas to game types
const SCHEMAS: Record<string, Schema> = {
  AYAT_SCRAMBLE: ayatScrambleSchema,
  LETTER_LADDERS: letterLaddersSchema,
  TRAITS_CROSSWORD: traitsCrosswordSchema,
  RHYME_TIME: rhymeTimeSchema,
  HIDDEN_HUROOF: hiddenHuroofSchema,
  HUROOF: huroofSchema,
  MORAL_MADLIBS: moralMadLibsSchema
};

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { gameType, segment } = body;
    
    if (!apiKey) {
      console.error("API Key is missing in environment variables.");
      return NextResponse.json({ error: "Server configuration error: API Key missing." }, { status: 500 });
    }

    if (!gameType || !SCHEMAS[gameType]) {
      console.error(`Invalid game type received: ${gameType}`);
      return NextResponse.json({ error: "Invalid game type." }, { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey });
    // Use a standard, widely available model
    const modelId = "gemini-3-flash-preview"; 

    let prompt = "";
    const topic = segment || "General Islamic Knowledge";

    switch (gameType) {
      case "AYAT_SCRAMBLE":
        prompt = `Generate a puzzle for the game 'Ayat Scramble'. 
                  Topic: ${topic}.
                  Task: Select a meaningful Quranic verse (in English translation) related to the topic.
                  Return the full verse, its reference, and the individual words in order.`;
        break;
      case "LETTER_LADDERS":
        prompt = `Generate a puzzle for the game 'Letter Ladders'.
                  Topic: ${topic} (optional, can be general words).
                  Task: Create a word ladder puzzle where a starting word transforms into a target word by changing one letter at a time.
                  Ensure all intermediate steps are valid English words.
                  Words should be 3-5 letters long.`;
        break;
      case "TRAITS_CROSSWORD":
        prompt = `Generate 4-6 clues and answers for a crossword puzzle.
                  Topic: ${topic} (focus on Prophet's character, Islamic history, or ethics).
                  Task: Provide a list of clues and their one-word answers.`;
        break;
      case "RHYME_TIME":
        prompt = `Generate a rhyming challenge.
                  Topic: ${topic}.
                  Task: Choose a word related to the topic (or a general positive word) and provide a list of rhyming words.`;
        break;
      case "HIDDEN_HUROOF":
        prompt = `Generate a word search puzzle configuration.
                  Topic: ${topic}.
                  Task: Create a theme title and a list of words related to that theme for a word search grid.`;
        break;
      case "HUROOF":
        prompt = `Generate a 5-letter Islamic word puzzle.
                  Topic: ${topic}.
                  Task: Select a 5-letter word found in the Quran or Islamic terminology. Provide its context and a story prompt.`;
        break;
      case "MORAL_MADLIBS":
        prompt = `Generate a 'Mad Libs' style story template with a moral lesson.
                  Topic: ${topic}.
                  Task: Create a short story (2-3 sentences) with 4 placeholders {0}, {1}, {2}, {3} and provide labels for what should be entered in each.`;
        break;
    }

    console.log(`Generating content for ${gameType} with model ${modelId}...`);

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: SCHEMAS[gameType],
        temperature: 0.8,
      },
    });

    // Check if response.text is valid
    if (!response || !response.text) {
        console.error("Gemini API returned empty response or invalid structure.");
        return NextResponse.json({ error: "AI generation failed: Empty response." }, { status: 500 });
    }

    console.log("Gemini API response received.");
    const jsonResponse = JSON.parse(response.text);
    return NextResponse.json(jsonResponse);

  } catch (error: any) {
    console.error("Gemini API Error details:", error);
    return NextResponse.json({ 
        error: error.message || "An unexpected error occurred during AI generation.",
        details: error.toString(),
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}