/**
 * IQ Question Bank — 36 questions, 15 drawn randomly per test.
 *
 * Distribution:
 *   pat   (patterns, sequences, analogies)   — 13 questions
 *   logic (deduction, syllogisms, reasoning) — 17 questions
 *   math  (quantitative reasoning, minimal)  —  6 questions
 *
 * Real IQ tests measure fluid intelligence:
 *   – Abstract pattern recognition
 *   – Deductive & inductive reasoning
 *   – Verbal & spatial analogies
 *   – NOT arithmetic or memorised formulas
 */

export const iqQuestions = [

  // ── PATTERN RECOGNITION ─────────────────────────────────────────────────

  {
    q: 'What comes next in the sequence?\n2, 6, 12, 20, 30, __',
    opts: ['38', '40', '42', '44'],
    correct: 2, cat: 'pat',
    ex: 'Each term is n×(n+1): 1×2, 2×3, 3×4, 4×5, 5×6, so 6×7 = 42.',
  },
  {
    q: 'What letter comes next?\nA, C, F, J, O, __',
    opts: ['S', 'T', 'U', 'V'],
    correct: 2, cat: 'pat',
    ex: 'The gaps between letters increase by 1 each time: +2, +3, +4, +5, +6. O is the 15th letter, so the next is the 21st: U.',
  },
  {
    q: 'Which number does NOT fit the pattern?\n4, 9, 16, 25, 35, 49',
    opts: ['9', '25', '35', '49'],
    correct: 2, cat: 'pat',
    ex: 'All others are perfect squares (2², 3², 4², 5², 7²). 35 is not a perfect square.',
  },
  {
    q: 'What comes next?\nAZ, BY, CX, __',
    opts: ['DV', 'DW', 'EW', 'WD'],
    correct: 1, cat: 'pat',
    ex: 'First letter ascends (A, B, C, D); second letter descends (Z, Y, X, W). Answer: DW.',
  },
  {
    q: 'Complete the series:\n1, 8, 27, 64, __',
    opts: ['100', '125', '128', '216'],
    correct: 1, cat: 'pat',
    ex: 'These are cube numbers: 1³, 2³, 3³, 4³, 5³ = 125.',
  },
  {
    q: 'What comes next?\n3, 6, 11, 18, 27, __',
    opts: ['35', '36', '38', '40'],
    correct: 2, cat: 'pat',
    ex: 'Differences increase by 2 each time: +3, +5, +7, +9, +11. So 27 + 11 = 38.',
  },
  {
    q: 'Complete the analogy:\nBook : Library :: Painting : __',
    opts: ['Canvas', 'Museum', 'Artist', 'Frame'],
    correct: 1, cat: 'pat',
    ex: 'A book belongs in a library; a painting belongs in a museum.',
  },
  {
    q: 'Complete the analogy:\nDoctor : Patient :: Teacher : __',
    opts: ['School', 'Lesson', 'Student', 'Textbook'],
    correct: 2, cat: 'pat',
    ex: 'A doctor serves a patient; a teacher serves a student.',
  },
  {
    q: 'Complete the analogy:\nSilence : Noise :: Dark : __',
    opts: ['Shadow', 'Night', 'Light', 'Colour'],
    correct: 2, cat: 'pat',
    ex: 'Silence is the opposite of noise; dark is the opposite of light.',
  },
  {
    q: 'What letter-pair comes next?\nBC, EF, HI, KL, __',
    opts: ['MN', 'NO', 'NP', 'OP'],
    correct: 1, cat: 'pat',
    ex: 'Each pair skips one letter: BC, (D), EF, (G), HI, (J), KL, (M), NO.',
  },
  {
    q: 'What number comes next?\n81, 27, 9, 3, __',
    opts: ['0', '1', '2', '6'],
    correct: 1, cat: 'pat',
    ex: 'Each term is divided by 3: 81÷3=27, 27÷3=9, 9÷3=3, 3÷3=1.',
  },
  {
    q: 'Complete the analogy:\nMarch : April :: November : __',
    opts: ['October', 'December', 'January', 'September'],
    correct: 1, cat: 'pat',
    ex: 'March is followed by April; November is followed by December.',
  },
  {
    q: 'What comes next in the sequence?\n2, 3, 5, 8, 13, 21, __',
    opts: ['29', '32', '34', '36'],
    correct: 2, cat: 'pat',
    ex: 'Each number is the sum of the two before it (Fibonacci). 13 + 21 = 34.',
  },

  // ── LOGICAL REASONING ───────────────────────────────────────────────────

  {
    q: 'All mammals breathe air. Dolphins are mammals. Therefore:',
    opts: [
      'All air-breathers are mammals',
      'Dolphins breathe air',
      'Some mammals do not breathe air',
      'Dolphins are not mammals',
    ],
    correct: 1, cat: 'logic',
    ex: 'Classic syllogism: If all A are B and X is A, then X is B. Dolphins breathe air.',
  },
  {
    q: 'No reptiles are warm-blooded. Snakes are reptiles. Therefore:',
    opts: [
      'Some snakes might be warm-blooded',
      'All cold-blooded animals are reptiles',
      'Snakes are not warm-blooded',
      'Snakes are not reptiles',
    ],
    correct: 2, cat: 'logic',
    ex: 'If no reptile is warm-blooded and snakes are reptiles, snakes cannot be warm-blooded.',
  },
  {
    q: '"All gleebs are snorps. No snorp is a wumble." Therefore:',
    opts: [
      'Some gleebs are wumbles',
      'All wumbles are gleebs',
      'No gleeb is a wumble',
      'Some wumbles are snorps',
    ],
    correct: 2, cat: 'logic',
    ex: 'Gleebs → snorps; snorps → not wumbles; therefore gleebs → not wumbles. Abstract logic — the nonsense words stop you using prior knowledge.',
  },
  {
    q: 'If it rains, the ground gets wet. The ground IS wet. What can we conclude?',
    opts: [
      'It definitely rained',
      'It definitely did not rain',
      'The ground is always wet',
      'It may or may not have rained',
    ],
    correct: 3, cat: 'logic',
    ex: 'Wet ground has other possible causes (sprinklers, spilled water). We cannot confirm rain. This logical error is called "affirming the consequent."',
  },
  {
    q: '"If P then Q" is true. Q is false. What must be true?',
    opts: ['P is true', 'P is false', 'P could be true or false', 'Q might be true'],
    correct: 1, cat: 'logic',
    ex: 'Modus tollens: If P→Q, and Q is false, then P must also be false.',
  },
  {
    q: 'Which instrument does NOT belong?\nTrumpet, Saxophone, Clarinet, Violin',
    opts: ['Trumpet', 'Saxophone', 'Clarinet', 'Violin'],
    correct: 3, cat: 'logic',
    ex: 'Trumpet, Saxophone, and Clarinet are wind instruments. Violin is a string instrument.',
  },
  {
    q: 'Which does NOT belong?\nMercury, Venus, Earth, Moon',
    opts: ['Mercury', 'Venus', 'Earth', 'Moon'],
    correct: 3, cat: 'logic',
    ex: 'Mercury, Venus, and Earth are planets orbiting the Sun. The Moon is a natural satellite of Earth.',
  },
  {
    q: 'John is older than Mary. Mary is older than Steve. Paul is younger than Steve. Who is the youngest?',
    opts: ['John', 'Mary', 'Steve', 'Paul'],
    correct: 3, cat: 'logic',
    ex: 'Order: John > Mary > Steve > Paul. Paul is the youngest.',
  },
  {
    q: 'If some A are B, and all B are C, which MUST be true?',
    opts: ['All A are C', 'No A are C', 'Some A are C', 'All C are A'],
    correct: 2, cat: 'logic',
    ex: 'Some A are B, and all B are C, so those A that are B are also C. Therefore some A are C.',
  },
  {
    q: 'A room has 4 corners. In each corner sits a cat. In front of every cat sit 3 cats. How many cats are in the room?',
    opts: ['4', '8', '12', '16'],
    correct: 0, cat: 'logic',
    ex: 'Only 4 cats total. Each cat "sees" the 3 cats in the other corners — they are the same cats, not additional ones.',
  },
  {
    q: 'If you fold a square piece of paper in half twice, then punch one hole through all layers, how many holes appear when unfolded?',
    opts: ['2', '3', '4', '8'],
    correct: 2, cat: 'logic',
    ex: 'Each fold doubles the layers: 1 fold = 2 layers, 2 folds = 4 layers. One punch through 4 layers creates 4 holes.',
  },
  {
    q: 'Which word is most out of place?\nEagle, Penguin, Sparrow, Hawk, Falcon',
    opts: ['Eagle', 'Penguin', 'Sparrow', 'Hawk'],
    correct: 1, cat: 'logic',
    ex: 'Eagle, Sparrow, Hawk, and Falcon can all fly. Penguins are birds but cannot fly.',
  },
  {
    q: 'If today is 3 days after Wednesday, what day is tomorrow?',
    opts: ['Saturday', 'Sunday', 'Monday', 'Friday'],
    correct: 1, cat: 'logic',
    ex: '3 days after Wednesday = Saturday (today). Tomorrow is therefore Sunday.',
  },
  {
    q: 'A mirror is placed facing you. You raise your RIGHT hand. In the mirror, which hand appears raised?',
    opts: [
      'The left hand of the reflection',
      'The right hand of the reflection',
      'Both hands',
      'Neither — mirrors only flip up/down',
    ],
    correct: 0, cat: 'logic',
    ex: 'Mirrors flip depth (front/back), not left/right. Your raised right hand appears on the LEFT side of the reflection.',
  },
  {
    q: '"Every honest person tells the truth. Sam does not tell the truth." Therefore:',
    opts: [
      'Sam is honest',
      'Sam is not honest',
      'Some honest people lie',
      'Truth-tellers are rare',
    ],
    correct: 1, cat: 'logic',
    ex: 'Modus tollens again: Honest → truth-teller. Sam is not a truth-teller. Therefore Sam is not honest.',
  },
  {
    q: 'Which of these is logically equivalent to "If it\'s a dog, it has four legs"?',
    opts: [
      'If it has four legs, it\'s a dog',
      'If it doesn\'t have four legs, it\'s not a dog',
      'Dogs sometimes have three legs',
      'Four-legged animals are dogs',
    ],
    correct: 1, cat: 'logic',
    ex: 'The contrapositive of "If P then Q" is "If not Q then not P" — logically identical. "No four legs → not a dog."',
  },
  {
    q: 'Five people line up. Ann is ahead of Ben. Ben is ahead of Clare. Clare is ahead of Dan. Eve is behind Ben but ahead of Clare. What is the order?',
    opts: [
      'Ann, Ben, Eve, Clare, Dan',
      'Ann, Eve, Ben, Clare, Dan',
      'Ben, Ann, Eve, Clare, Dan',
      'Ann, Ben, Clare, Eve, Dan',
    ],
    correct: 0, cat: 'logic',
    ex: 'Ann > Ben > Eve > Clare > Dan. Eve is behind Ben but ahead of Clare, placing her between them.',
  },
  {
    q: 'If CAT is coded as DBU (each letter +1), what does HAT decode to?',
    opts: ['GZS', 'IBU', 'GAS', 'HZT'],
    correct: 0, cat: 'logic',
    ex: 'Encoding adds 1 to each letter. To decode, subtract 1: H→G, A→Z, T→S. Answer: GZS.',
  },

  // ── QUANTITATIVE REASONING (minimal arithmetic) ─────────────────────────

  {
    q: 'A container doubles in volume every minute. At 60 minutes it is completely full. At what minute was it HALF full?',
    opts: ['30', '45', '58', '59'],
    correct: 3, cat: 'math',
    ex: 'Since it doubles each minute, one minute before full (minute 59) it was exactly half full. Not minute 30 — exponential growth is counterintuitive.',
  },
  {
    q: '5 workers build a wall in 6 days. How long do 3 workers take?',
    opts: ['8 days', '9 days', '10 days', '12 days'],
    correct: 2, cat: 'math',
    ex: '5 × 6 = 30 worker-days of effort needed. 30 ÷ 3 = 10 days.',
  },
  {
    q: 'What percentage of 80 is 20?',
    opts: ['20%', '25%', '30%', '40%'],
    correct: 1, cat: 'math',
    ex: '20 ÷ 80 = 0.25 = 25%.',
  },
  {
    q: 'A rectangle has a perimeter of 24. Its length is 3× its width. What is its area?',
    opts: ['18', '24', '27', '36'],
    correct: 2, cat: 'math',
    ex: '2(l + w) = 24, so l + w = 12. With l = 3w: 4w = 12, w = 3, l = 9. Area = 3 × 9 = 27.',
  },
  {
    q: 'If you buy 3 items at £4 each and 2 items at £7 each, what is the total?',
    opts: ['£24', '£26', '£28', '£30'],
    correct: 1, cat: 'math',
    ex: '3 × £4 = £12. 2 × £7 = £14. £12 + £14 = £26.',
  },
  {
    q: 'A journey takes 2 hours at 60 mph. How long would the same journey take at 80 mph?',
    opts: ['1h', '1h 15m', '1h 30m', '1h 45m'],
    correct: 2, cat: 'math',
    ex: 'Distance = 2 × 60 = 120 miles. At 80 mph: 120 ÷ 80 = 1.5 hours = 1 hour 30 minutes.',
  },
];
