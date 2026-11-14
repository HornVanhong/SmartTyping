import { Passage } from './types';

export const STARTER_PASSAGES: Passage[] = [
  // English Beginner
  {
    id: 'en-b-1',
    locale: 'en',
    title: 'The Quick Brown Fox',
    content: 'The quick brown fox jumps over the lazy dog. Practice typing every day to build speed, accuracy, and confidence with all ten fingers.',
    difficulty: 'BEGINNER',
    category: 'GENERAL',
    contentMode: 'SENTENCES',
  },
  {
    id: 'en-b-2',
    locale: 'en',
    title: 'Typing Fundamentals',
    content: 'Good typing habits start with proper posture and keeping your fingers resting on the home row keys. Speed comes with practice.',
    difficulty: 'BEGINNER',
    category: 'TUTORIAL',
    contentMode: 'PARAGRAPH',
  },

  // English Intermediate
  {
    id: 'en-i-1',
    locale: 'en',
    title: 'The Art of Software',
    content: 'Programming is the art of expressing thoughts clearly for both computers and humans. Simple solutions are often the most elegant and durable.',
    difficulty: 'INTERMEDIATE',
    category: 'TECHNOLOGY',
    contentMode: 'PARAGRAPH',
  },
  {
    id: 'en-i-2',
    locale: 'en',
    title: 'Daily Practice',
    content: 'Consistent daily effort yields far greater progress than irregular marathon sessions. Focus on rhythm and precision rather than pure speed.',
    difficulty: 'INTERMEDIATE',
    category: 'GENERAL',
    contentMode: 'PARAGRAPH',
  },

  // English Advanced
  {
    id: 'en-a-1',
    locale: 'en',
    title: 'The Craft of Mastery',
    content: 'The hallmark of true craft is patient attention to the smallest details until function and elegance harmonize effortlessly. Mastery is a quiet path.',
    difficulty: 'ADVANCED',
    category: 'LITERATURE',
    contentMode: 'QUOTE',
  },

  // Khmer Beginner
  {
    id: 'km-b-1',
    locale: 'km',
    title: 'ការរៀនវាយអក្សរ',
    content: 'ការរៀនវាយអត្ថបទជួយឱ្យយើងធ្វើការងារបានលឿននិងមានប្រសិទ្ធភាពខ្ពស់។ ចូរបង្ហាត់វាយជាប្រចាំថ្ងៃ។',
    difficulty: 'BEGINNER',
    category: 'TUTORIAL',
    contentMode: 'SENTENCES',
  },
  {
    id: 'km-b-2',
    locale: 'km',
    title: 'សម្បត្តិវប្បធម៌ខ្មែរ',
    content: 'ប្រទេសកម្ពុជាមានសម្បត្តិវប្បធម៌សម្បូរបែប និងប្រាសាទបុរាណជាច្រើនដែលល្បីល្បាញលើសកលលោក។',
    difficulty: 'BEGINNER',
    category: 'CULTURE',
    contentMode: 'PARAGRAPH',
  },

  // Khmer Intermediate
  {
    id: 'km-i-1',
    locale: 'km',
    title: 'បច្ចេកវិទ្យានិងការអភិវឌ្ឍ',
    content: 'បច្ចេកវិទ្យាព័ត៌មានវិទ្យាកំពុងដើរតួនាទីយ៉ាងសំខាន់ក្នុងការអភិវឌ្ឍសង្គមជាតិ។ ការប្រើប្រាស់កុំព្យូទ័រនិងជំនាញវាយអក្សរខ្មែរបានត្រឹមត្រូវ ជាមូលដ្ឋានគ្រឹះសម្រាប់សិស្ស និស្សិត និងបុគ្គលិកគ្រប់រូប។',
    difficulty: 'INTERMEDIATE',
    category: 'TECHNOLOGY',
    contentMode: 'PARAGRAPH',
  },
  {
    id: 'km-i-2',
    locale: 'km',
    title: 'តម្លៃនៃការអាន',
    content: 'សៀវភៅគឺជាស្ពានចម្លងចំណេះដឹងពីជំនាន់មួយទៅជំនាន់មួយទៀត។ ការអានជាប្រចាំជួយពង្រីកការគិត និងការយល់ដឹងឱ្យកាន់តែទូលំទូលាយ។',
    difficulty: 'INTERMEDIATE',
    category: 'EDUCATION',
    contentMode: 'PARAGRAPH',
  },

  // Khmer Advanced
  {
    id: 'km-a-1',
    locale: 'km',
    title: 'អច្ឆរិយវត្ថុនៃប្រាសាទអង្គរវត្ត',
    content: 'ប្រាសាទអង្គរវត្តជាស្នាដៃឯកនៃស្ថាបត្យកម្មខ្មែរសម័យបុរាណ ដែលបង្ហាញពីភាពរុងរឿងនិងទេពកោសល្យដ៏មហិមារបស់បុព្វបុរសខ្មែរ។ សំណង់ថ្មភក់ដ៏ធំស្កឹមស្កៃនេះត្រូវបានកសាងឡើងដើម្បីឧទ្ទិសដល់ព្រះវិស្ណុ និងជាបេតិកភណ្ឌពិភពលោកដែលមនុស្សទូទាំងពិភពលោកកោតសរសើរ។',
    difficulty: 'ADVANCED',
    category: 'HISTORY',
    contentMode: 'PARAGRAPH',
  },
];

export function getFallbackPassage(locale: 'en' | 'km', difficulty?: string): Passage {
  const filtered = STARTER_PASSAGES.filter(
    (p) => p.locale === locale && (!difficulty || p.difficulty === difficulty)
  );
  if (filtered.length > 0) {
    const idx = Math.floor(Math.random() * filtered.length);
    return filtered[idx];
  }
  return STARTER_PASSAGES.find((p) => p.locale === locale) || STARTER_PASSAGES[0];
}
