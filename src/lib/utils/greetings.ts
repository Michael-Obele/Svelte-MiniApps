interface Mantra {
    phrase: string;
}

export const mantras: Mantra[] = [
    { phrase: "Practice kindness every day" },
    { phrase: "Embrace change with open arms" },
    { phrase: "Choose joy in every moment" },
    { phrase: "Spread positivity wherever you go" },
    { phrase: "Create magic in the ordinary" },
    { phrase: "Share knowledge to empower others" },
    { phrase: "Build community through connection" },
    { phrase: "Foster growth in yourself and others" },
    { phrase: "Inspire others to dream bigger" },
    { phrase: "Cultivate peace in your heart" },
    { phrase: "Nurture creativity in all forms" },
    { phrase: "Spark innovation through curiosity" },
    { phrase: "Radiate love and compassion" },
    { phrase: "Chase dreams with determination" },
    { phrase: "Celebrate progress, no matter how small" },
    { phrase: "Discover possibilities in challenges" },
    { phrase: "Ignite passion in everything you do" },
    { phrase: "Embrace challenges as opportunities" },
    { phrase: "Unlock potential through persistence" },
    { phrase: "Spread happiness like confetti" },
    { phrase: "Create memories that last forever" },
    { phrase: "Find balance in the chaos" },
    { phrase: "Trust yourself to make good choices" },
    { phrase: "Explore opportunities with courage" },
    { phrase: "Share stories that inspire change" },
    { phrase: "Build connections that matter" },
    { phrase: "Dream big and dare to fail" },
    { phrase: "Stay curious about everything" },
    { phrase: "Keep learning something new everyday" },
    { phrase: "Make impact in your community" },
    { phrase: "Be authentic in your journey" },
    { phrase: "Lead change with compassion" },
    { phrase: "Seek wisdom in simple moments" },
    { phrase: "Cherish moments with loved ones" },
    { phrase: "Inspire greatness in others" },
    { phrase: "Foster understanding through empathy" },
    { phrase: "Create harmony in diversity" },
    { phrase: "Turn obstacles into stepping stones" },
    { phrase: "Find strength in vulnerability" },
    { phrase: "Embrace the journey, not just the destination" },
    { phrase: "Light the way for others" },
    { phrase: "Dance in the rain of life" },
    { phrase: "Plant seeds of kindness everywhere" },
    { phrase: "Write your story with courage" },
    { phrase: "Paint your world with possibility" }
];

export const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
};

export function getDailyMantra(): Mantra {
    // Get today's date as a string (YYYY-MM-DD format)
    const today = new Date().toISOString().split('T')[0];
    
    // Use the date string to create a consistent index for today
    let hash = 0;
    for (let i = 0; i < today.length; i++) {
        hash = ((hash << 5) - hash) + today.charCodeAt(i);
        hash = hash & hash; // Convert to 32-bit integer
    }
    
    // Use the hash to select today's mantra
    const index = Math.abs(hash) % mantras.length;
    return mantras[index];
}

export function getRandomMantra(): Mantra {
    const index = Math.floor(Math.random() * mantras.length);
    return mantras[index];
}
