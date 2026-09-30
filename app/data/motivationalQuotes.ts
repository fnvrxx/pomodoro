export interface Quote {
  text: string;
  author: string;
}

const sessionMessages = [
  "Sesi selesai. Nikmati jedanya.",
  "Satu sesi lagi tercatat.",
  "Istirahat dulu, lalu lanjut.",
  "Bagus. Fokusmu hari ini bertambah.",
];

export function messageForSession(completedSessions: number): string {
  const count = Math.max(0, Math.floor(completedSessions));
  return count === 0
    ? "Satu sesi dulu. Sisanya menyusul."
    : sessionMessages[(count - 1) % sessionMessages.length];
}

export const motivationalQuotes: Quote[] = [
  {
    text: "The secret of getting ahead is getting started.",
    author: "Mark Twain",
  },
  {
    text: "Small progress is still progress.",
    author: "Unknown",
  },
  {
    text: "You don't have to be great to start, but you have to start to be great.",
    author: "Zig Ziglar",
  },
  {
    text: "Focus on being productive instead of busy.",
    author: "Tim Ferriss",
  },
  {
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
  },
  {
    text: "Success is the sum of small efforts, repeated day in and day out.",
    author: "Robert Collier",
  },
  {
    text: "Don't watch the clock; do what it does. Keep going.",
    author: "Sam Levenson",
  },
  {
    text: "Your future is created by what you do today, not tomorrow.",
    author: "Robert Kiyosaki",
  },
  {
    text: "The best time to plant a tree was 20 years ago. The second best time is now.",
    author: "Chinese Proverb",
  },
  {
    text: "Believe you can and you're halfway there.",
    author: "Theodore Roosevelt",
  },
  {
    text: "It always seems impossible until it's done.",
    author: "Nelson Mandela",
  },
  {
    text: "The only limit to our realization of tomorrow will be our doubts of today.",
    author: "Franklin D. Roosevelt",
  },
  {
    text: "Action is the foundational key to all success.",
    author: "Pablo Picasso",
  },
  {
    text: "What you do today can improve all your tomorrows.",
    author: "Ralph Marston",
  },
  {
    text: "Excellence is not a skill, it's an attitude.",
    author: "Ralph Marston",
  },
  {
    text: "You've got this! Every completed task is a step forward.",
    author: "Unknown",
  },
  {
    text: "Consistency is what transforms average into excellence.",
    author: "Unknown",
  },
  {
    text: "Great job! Your dedication is inspiring.",
    author: "Unknown",
  },
  {
    text: "One step at a time, you're building something amazing.",
    author: "Unknown",
  },
  {
    text: "Productivity is being able to do things that you were never able to do before.",
    author: "Franz Kafka",
  },
];
