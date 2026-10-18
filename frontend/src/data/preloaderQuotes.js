/**
 * Curated inspirational quotes for Responsible Individuals NGO.
 * Themes: Volunteering, compassion, community, service, and social responsibility.
 */
export const PRELOADER_QUOTES = [
  {
    id: 'quote-1',
    text: 'Small acts of kindness can create meaningful change.',
    category: 'compassion',
  },
  {
    id: 'quote-2',
    text: 'A stronger community begins with people who care.',
    category: 'community',
  },
  {
    id: 'quote-3',
    text: 'Together, we can turn compassion into action.',
    category: 'action',
  },
  {
    id: 'quote-4',
    text: 'Every helping hand can make a difference.',
    category: 'volunteering',
  },
  {
    id: 'quote-5',
    text: 'Positive change begins when we choose to act.',
    category: 'responsibility',
  },
  {
    id: 'quote-6',
    text: 'Dedicated individuals shaping a responsible tomorrow.',
    category: 'service',
  },
  {
    id: 'quote-7',
    text: 'Service to others is the foundation of enduring hope.',
    category: 'service',
  },
];

/**
 * Returns a random quote distinct from the current quote index if possible.
 * @param {number} currentIndex 
 * @returns {{ quote: typeof PRELOADER_QUOTES[0], index: number }}
 */
export function getNextQuote(currentIndex = -1) {
  if (PRELOADER_QUOTES.length === 0) {
    return {
      quote: {
        id: 'default',
        text: 'Together, we can turn compassion into action.',
        category: 'action',
      },
      index: 0,
    };
  }

  if (PRELOADER_QUOTES.length === 1) {
    return { quote: PRELOADER_QUOTES[0], index: 0 };
  }

  let nextIndex;
  do {
    nextIndex = Math.floor(Math.random() * PRELOADER_QUOTES.length);
  } while (nextIndex === currentIndex && PRELOADER_QUOTES.length > 1);

  return { quote: PRELOADER_QUOTES[nextIndex], index: nextIndex };
}
