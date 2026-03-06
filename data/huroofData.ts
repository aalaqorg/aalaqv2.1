import { HuroofWord } from "../types";

export const HUROOF_WORDS: HuroofWord[] = [
    {
        word: "FAITH",
        verse: "Those who believe and do righteous deeds - the Most Merciful will appoint for them affection.",
        reference: "Surah Maryam 19:96",
        prompt: "Write a story about two friends whose bond grows stronger because they encourage each other to do good."
    },
    {
        word: "LIGHT",
        verse: "Allah is the Light of the heavens and the earth.",
        reference: "Surah An-Nur 24:35",
        prompt: "Imagine a world without sun or lamps, where good deeds are the only source of light. Tell a tale of a child seeking to light up their village."
    },
    {
        word: "PEACE",
        verse: "Peace it is until the emergence of dawn.",
        reference: "Surah Al-Qadr 97:5",
        prompt: "Describe a magical night where everything in nature stops to say 'Salam' (Peace). What does a young traveler hear?"
    },
    {
        word: "MERCY",
        verse: "My mercy encompasses all things.",
        reference: "Surah Al-A'raf 7:156",
        prompt: "Write about a grumpy giant who learns kindness from a small, merciful creature."
    },
    {
        word: "NIGHT",
        verse: "Indeed, We sent the Qur'an down during the Night of Decree.",
        reference: "Surah Al-Qadr 97:1",
        prompt: "A young astronomer looks for the Night of Decree. Instead of stars, they find something else in the sky."
    },
    {
        word: "WATER",
        verse: "And We made from water every living thing.",
        reference: "Surah Al-Anbya 21:30",
        prompt: "In a desert village, the well runs dry. A child discovers that sharing their last cup of water brings a miracle."
    },
    {
        word: "HEART",
        verse: "Unquestionably, by the remembrance of Allah hearts are assured.",
        reference: "Surah Ar-Ra'd 13:28",
        prompt: "A robot with a clockwork heart tries to understand what it means to feel peace."
    },
    {
        word: "TRUTH",
        verse: "And say, 'The truth is from your Lord.'",
        reference: "Surah Al-Kahf 18:29",
        prompt: "A kingdom where lies turn into heavy stones, and truth turns into floating feathers. Follow a hero carrying a heavy burden."
    },
    {
        word: "GUIDE",
        verse: "And He found you lost and guided [you].",
        reference: "Surah Ad-Duhaa 93:7",
        prompt: "A ship lost at sea follows a strange, glowing fish that seems to know the way home."
    },
    {
        word: "PRAYR", // Approximated for 5 letters, or use SALAH if preferred, but sticking to English for broader accessibility or transliteration
        verse: "Indeed, prayer prohibits immorality and wrongdoing.",
        reference: "Surah Al-Ankabut 29:45",
        prompt: "A magical prayer mat that flies, but only when the rider has a pure intention."
    }
];

// Helper to get a random word for the day/session
export const getDailyWord = (): HuroofWord => {
    // Simple random for now, could be day-based
    const index = Math.floor(Math.random() * HUROOF_WORDS.length);
    return HUROOF_WORDS[index];
};
