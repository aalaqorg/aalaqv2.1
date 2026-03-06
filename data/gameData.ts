export const AYAT_SCRAMBLE_DATA = [
    {
        verse: "Indeed, with hardship comes ease.",
        reference: "Surah Ash-Sharh 94:6",
        words: ["Indeed,", "with", "hardship", "comes", "ease."]
    },
    {
        verse: "And speak to people good words.",
        reference: "Surah Al-Baqarah 2:83",
        words: ["And", "speak", "to", "people", "good", "words."]
    },
    {
        verse: "Allah does not burden a soul beyond that it can bear.",
        reference: "Surah Al-Baqarah 2:286",
        words: ["Allah", "does", "not", "burden", "a", "soul", "beyond", "that", "it", "can", "bear."]
    },
    {
        verse: "So remember Me; I will remember you.",
        reference: "Surah Al-Baqarah 2:152",
        words: ["So", "remember", "Me;", "I", "will", "remember", "you."]
    },
    {
        verse: "Is there any reward for good other than good?",
        reference: "Surah Ar-Rahman 55:60",
        words: ["Is", "there", "any", "reward", "for", "good", "other", "than", "good?"]
    }
];

export const LETTER_LADDERS_DATA = [
    { start: "DARK", end: "GLOW", steps: ["DARE", "CARE", "CORE", "GORE", "GONE", "GLOW"] }, // Example path, user finds their own
    { start: "HATE", end: "LOVE", steps: ["LATE", "LAVE", "LOVE"] },
    { start: "SAD", end: "GLAD", steps: ["LAD", "GLAD"] },
    { start: "FEAR", end: "HOPE", steps: ["HEAR", "HERE", "HOPE"] }, // Simplified for kids
    { start: "COLD", end: "WARM", steps: ["CORD", "WORD", "WARD", "WARM"] }
];

export const TRAITS_CROSSWORD_DATA = [
    {
        clue: "The name given to the Prophet because he always told the truth.",
        answer: "SIDDIQ",
        gridSize: 6
    },
    {
        clue: "Being thankful for what you have.",
        answer: "SHUKR",
        gridSize: 5
    },
    {
        clue: "Patience during hard times.",
        answer: "SABR",
        gridSize: 4
    },
    {
        clue: "Giving to those in need.",
        answer: "SADAQAH",
        gridSize: 7
    }
];

export const RHYME_TIME_DATA = [
    { word: "Light", rhymes: ["Bright", "Sight", "Right", "Night", "Fight", "Height", "Might", "White"] },
    { word: "Star", rhymes: ["Far", "Car", "Jar", "Bar", "Scar", "Tar"] },
    { word: "Moon", rhymes: ["Soon", "Noon", "Spoon", "Tune", "June"] },
    { word: "Sky", rhymes: ["Fly", "High", "Try", "Cry", "Dry", "Why"] },
    { word: "Heart", rhymes: ["Start", "Part", "Art", "Cart", "Smart"] }
];

export const HIDDEN_HUROOF_DATA = [
    {
        theme: "Names of Allah",
        words: ["RAHMAN", "RAHIM", "MALIK", "QUDDUS", "SALAM"],
        gridSize: 8
    },
    {
        theme: "Fruits in Quran",
        words: ["FIG", "OLIVE", "DATE", "GRAPE", "POMEGRANATE"],
        gridSize: 10 // POMEGRANATE needs space
    },
    {
        theme: "Prophets",
        words: ["ADAM", "NUH", "MUSA", "ISA", "MUHAMMAD"],
        gridSize: 9
    }
];
