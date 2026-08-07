import { fromKey } from "@/lib/date";

const QUOTES: { text: string; author: string }[] = [
  { text: "We are what we repeatedly do. Excellence, then, is not an act but a habit.", author: "Aristotle" },
  { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln" },
  { text: "You do not rise to the level of your goals. You fall to the level of your systems.", author: "James Clear" },
  { text: "The successful warrior is the average man with laser-like focus.", author: "Bruce Lee" },
  { text: "It is not that we have a short time to live, but that we waste much of it.", author: "Seneca" },
  { text: "Motivation gets you going. Discipline keeps you growing.", author: "John C. Maxwell" },
  { text: "First say to yourself what you would be, then do what you have to do.", author: "Epictetus" },
  { text: "The pain of discipline is far less than the pain of regret.", author: "Sarah Bombell" },
  { text: "Small disciplines repeated with consistency every day lead to great achievements.", author: "John C. Maxwell" },
  { text: "Waste no more time arguing what a good man should be. Be one.", author: "Marcus Aurelius" },
  { text: "Do the hard jobs first. The easy jobs will take care of themselves.", author: "Dale Carnegie" },
  { text: "Discipline equals freedom.", author: "Jocko Willink" },
  { text: "He who conquers himself is the mightiest warrior.", author: "Confucius" },
  { text: "Nothing will work unless you do.", author: "Maya Angelou" },
  { text: "You will never always be motivated. You must learn to be disciplined.", author: "Unknown" },
  { text: "Suffer the pain of discipline or suffer the pain of regret.", author: "Unknown" },
  { text: "Every action you take is a vote for the person you wish to become.", author: "James Clear" },
  { text: "Well begun is half done.", author: "Aristotle" },
  { text: "The best revenge is massive success, built one quiet day at a time.", author: "Frank Sinatra" },
  { text: "How we spend our days is, of course, how we spend our lives.", author: "Annie Dillard" },
  { text: "Amateurs sit and wait for inspiration. The rest of us just get up and go to work.", author: "Stephen King" },
  { text: "Consistency is what transforms average into excellence.", author: "Unknown" },
  { text: "The obstacle is the way.", author: "Marcus Aurelius" },
  { text: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci" },
  { text: "Order your soul. Reduce your wants.", author: "Augustine" },
  { text: "What stands in the way becomes the way.", author: "Marcus Aurelius" },
  { text: "Long-term consistency beats short-term intensity.", author: "Bruce Lee" },
  { text: "A year from now you may wish you had started today.", author: "Karen Lamb" },
  { text: "Rule your mind or it will rule you.", author: "Horace" },
  { text: "Hold yourself to a standard higher than anyone expects of you.", author: "Henry Ward Beecher" },
  { text: "Begin at once to live, and count each separate day as a separate life.", author: "Seneca" },
];

/** Deterministic quote for a given day key so it never changes mid-day. */
export function quoteForDay(key: string) {
  const date = fromKey(key);
  const index =
    Math.floor(date.getTime() / 86_400_000 + date.getTimezoneOffset() / -1440) % QUOTES.length;
  const safe = ((index % QUOTES.length) + QUOTES.length) % QUOTES.length;
  return QUOTES[safe] ?? QUOTES[0]!;
}
