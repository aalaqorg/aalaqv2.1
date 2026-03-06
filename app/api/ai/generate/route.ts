import { NextResponse } from "next/server";
import { GoogleGenAI, Type, Schema } from "@google/genai";

const storySchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: "A creative and engaging title for the story.",
    },
    storyContent: {
      type: Type.STRING,
      description: "The full story, written in a kid-friendly, engaging tone. Use paragraphs. Do not use Markdown.",
    },
    moral: {
      type: Type.STRING,
      description: "A short sentence explaining the lesson learned from the story.",
    },
    references: {
      type: Type.ARRAY,
      description: "A list of Quranic verses or Hadith used as inspiration.",
      items: {
        type: Type.OBJECT,
        properties: {
          source: {
            type: Type.STRING,
            description: "The citation source (e.g., 'Surah Al-Baqarah 2:185' or 'Sahih Muslim').",
          },
          text: {
            type: Type.STRING,
            description: "The translation of the verse or hadith text.",
          }
        },
        required: ["source", "text"],
      },
    },
  },
  required: ["title", "storyContent", "moral", "references"],
};

export async function POST(request: Request) {
  try {
    const { userPrompt, genre, remixContext } = await request.json();
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: "API Key is missing." }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });
    const modelId = "gemini-3-flash-preview"; 

    let systemInstruction = `
      You are a kind, wise, and creative storyteller for children (ages 6-12). 
      Your task is to take a short summary or idea provided by a child about Ramadan 
      and expand it into a beautiful, complete story.

      Guidelines:
      1. Tone: Warm, inspiring, and easy to understand.
      2. Theme: Ramadan, Fasting, Charity, Patience, Kindness, or Family.
      3. Integration: The story MUST be inspired by authentic Islamic teachings (Quran and Sunnah).
      4. Structure: Beginning, Middle (Conflict/Challenge), and Happy/Educational End.
      5. Length: Approximately 300-400 words.
      6. Citations: You MUST identify the specific Quranic verses or Hadith that align with the story's moral and list them.
    `;

    if (genre) {
        systemInstruction += `
    7. Genre: The story MUST be written in the style of the "${genre}" genre.`;
    }

    let prompt = `The child's story idea is: "${userPrompt}".`;

    if (remixContext) {
        prompt += `
    This is a REMIX of a story by ${remixContext.originalAuthor}. 
        The original story content was: "${remixContext.originalStory}".
        
        Please rewrite this story with a new creative twist, alternative ending, or stylistic change based on the child's idea: "${userPrompt}".
        Keep the core moral if possible, but change the narrative path or perspective.`;
    } else {
        prompt += ` Please write a full story based on this.`;
    }

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: storySchema,
        temperature: 0.8,
      },
    });

    return NextResponse.json(JSON.parse(response.text));

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
