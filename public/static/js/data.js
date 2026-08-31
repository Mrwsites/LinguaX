/* ===== LinguaX Curriculum Data ===== */
/* All seeded curriculum data — CURATED_CORE content */

window.LX = window.LX || {};

// ── CEFR LEVELS ──
window.LX.cefrLevels = {
  A0: { code: 'A0', name: 'Pre-A1 / Foundation', color: '#7C4A0E', bg: '#FFF8F0', supportRules: 'Visual, familiar, concrete. Single grammar decision at a time. Recognition, matching, choosing, copying.', outputExpectations: 'Words and short phrases. Highly scaffolded.', cssClass: 'cefr-a0' },
  A1: { code: 'A1', name: 'Beginner', color: '#5B61F6', bg: '#EEF0FF', supportRules: 'Short predictable exchanges. Sentence frames, dialogue models, core vocabulary, 2–4 turn speaking.', outputExpectations: 'Short sentences about familiar people, objects, places, needs and routines.', cssClass: 'cefr-a1' },
  A2: { code: 'A2', name: 'Elementary', color: '#0369A1', bg: '#F0F9FF', supportRules: 'Prompts, role cards, visual maps, short messages/dialogues.', outputExpectations: 'Several connected sentences about everyday tasks and simple problems.', cssClass: 'cefr-a2' },
  B1: { code: 'B1', name: 'Intermediate', color: '#2D7E5E', bg: '#E6F4EF', supportRules: 'Reduce support. Add information gaps and follow-up questions.', outputExpectations: 'Connected experience, explanation, story, problem, reason, comparison, solution.', cssClass: 'cefr-b1' },
  B2: { code: 'B2', name: 'Upper-Intermediate', color: '#7C3AED', bg: '#F5F3FF', supportRules: 'Competing information. Longer interaction.', outputExpectations: 'Choice, negotiation, register, clarification, justification.', cssClass: 'cefr-b2' },
  C1: { code: 'C1', name: 'Advanced', color: '#D97706', bg: '#FEF3C7', supportRules: 'Minimal support. Implicit meaning.', outputExpectations: 'Professional, academic, nuanced. Extended production.', cssClass: 'cefr-c1' },
  C2: { code: 'C2', name: 'Mastery', color: '#BE123C', bg: '#FFF1F2', supportRules: 'No support needed.', outputExpectations: 'High-precision. Ambiguity, pragmatics, stylistic control.', cssClass: 'cefr-c2' },
};

// ── VERB TO BE REFERENCE ──
window.LX.verbToBe = {
  present: [
    { subject: 'I', positive: 'am', negative: "am not / I'm not", question: 'Am I…?' },
    { subject: 'He / She / It', positive: 'is', negative: "isn't / is not", question: 'Is he/she/it…?' },
    { subject: 'You / We / They', positive: 'are', negative: "aren't / are not", question: 'Are you/we/they…?' },
  ],
  past: [
    { subject: 'I', positive: 'was', negative: "wasn't / was not", question: 'Was I…?' },
    { subject: 'He / She / It', positive: 'was', negative: "wasn't / was not", question: 'Was he/she/it…?' },
    { subject: 'You / We / They', positive: 'were', negative: "weren't / were not", question: 'Were you/we/they…?' },
  ],
  future: [
    { subject: 'All subjects', positive: 'will be', negative: "won't be", question: 'Will … be?' },
  ],
};

// ── GRAMMAR POINTS ──
window.LX.grammarPoints = {
  'present_be_is': {
    id: 'present_be_is',
    code: 'GRAM-A1-BE-001',
    title: 'Present Simple: "is" (singular)',
    grammarGroup: 'A',
    definition: 'We use "is" with singular subjects (he, she, it, or a singular noun) to describe things, identify objects, and express possession or location in the present.',
    howItWorks: 'Subject (singular) + is + description/noun/adjective. Contractions: it\'s = it is, he\'s = he is, she\'s = she is, that\'s = that is.',
    whenToUse: 'To describe one person, place, or thing. To identify what something is. To say who something belongs to. To give the location of one thing.',
    whyItIsUsed: '"Is" matches the singular subject. English verbs must agree with their subjects. "Is" tells the listener we are talking about one thing right now.',
    commonErrors: [
      'Saying "It are red." ✗ → "It is red." ✓',
      'Saying "The bag is red?" ✗ as a question — must invert: "Is the bag red?" ✓',
      'Forgetting the apostrophe in possession: "Johns bag" ✗ → "John\'s bag" ✓',
      'Using "is" with plural: "The keys is on the desk." ✗ → "The keys are on the desk." ✓',
    ],
    curated_status: 'CURATED_CORE',
  },
  'present_be_are': {
    id: 'present_be_are',
    code: 'GRAM-A1-BE-002',
    title: 'Present Simple: "are" (plural)',
    grammarGroup: 'A',
    definition: 'We use "are" with plural subjects (we, you, they, or plural nouns) to describe groups of things, people, or to make general statements.',
    howItWorks: 'Subject (plural) + are + description/noun/adjective. Contractions: they\'re, you\'re, we\'re.',
    whenToUse: 'To describe more than one person, place, or thing. To talk about groups. With "you" (singular or plural).',
    whyItIsUsed: '"Are" matches plural subjects. Subject–verb agreement is essential in English for clarity and correctness.',
    commonErrors: [
      'Saying "The apples is red." ✗ → "The apples are red." ✓',
      'Confusing "you\'re" (you are) with "your" (belonging to you)',
      'Using "are" with singular: "The phone are black." ✗ → "The phone is black." ✓',
    ],
    curated_status: 'CURATED_CORE',
  },
  'be_possession': {
    id: 'be_possession',
    code: 'GRAM-A1-BE-003',
    title: "Possession with 's",
    grammarGroup: 'A',
    definition: "In English, we show possession by adding 's to a name or noun. We often use 'is' to connect the subject to the possessed item.",
    howItWorks: "Name/noun + 's + object. Example: John's phone = the phone that belongs to John.",
    whenToUse: "When identifying the owner of an object. In lost-property, shopping, classroom, and identification contexts.",
    whyItIsUsed: "English uses 's rather than a separate word for possession (unlike many other languages). It is the most common possession marker for proper nouns.",
    commonErrors: [
      "Reversing the structure: 'the phone of John' ✗ (avoid this pattern with names) → 'John's phone' ✓",
      "Missing the apostrophe: 'Johns phone' ✗ → 'John's phone' ✓",
      "Confusing possessive 's with plural s: 'the bags' (plural) vs 'the bag's handle' (possession)",
    ],
    curated_status: 'CURATED_CORE',
  },
  'be_question': {
    id: 'be_question',
    code: 'GRAM-A1-BE-004',
    title: 'Questions with "be": Is…? / Are…?',
    grammarGroup: 'A',
    definition: 'To make a yes/no question with "be", we move the verb to the front. This is called inversion.',
    howItWorks: 'Statement: The bag is red. → Question: Is the bag red? / Statement: These are your keys. → Question: Are these your keys?',
    whenToUse: 'When you want to confirm information. When you need to identify an object or person. In lost-property, hotel, classroom scenarios.',
    whyItIsUsed: 'English signals questions by changing word order (inversion), not by tone of voice alone. This is essential for clear communication.',
    commonErrors: [
      '"The bag is red?" ✗ — Statement tone does not make a correct English question → "Is the bag red?" ✓',
      '"Is these your keys?" ✗ → "Are these your keys?" ✓ (must match plural)',
      'Forgetting to invert: "This is your ticket?" ✗ (informal only) — formal/standard: "Is this your ticket?" ✓',
    ],
    curated_status: 'CURATED_CORE',
  },
};

// ── CORE SENTENCES (Tim Ferriss Grammar Deconstruction) ──
window.LX.coreSentences = [
  { number: 1, sentence: 'The apple is red.', grammarPointIds: ['present_be_is'], group: 'A', parts: [{word:'The apple', role:'subject', type:'subject'},{word:'is', role:'verb (to be)', type:'verb'},{word:'red', role:'description (adjective)', type:'description'}] },
  { number: 2, sentence: "It is John's apple.", grammarPointIds: ['present_be_is','be_possession'], group: 'A', parts: [{word:'It', role:'subject (pronoun)', type:'subject'},{word:'is', role:'verb (to be)', type:'verb'},{word:"John's", role:'possessor + \'s', type:'possession'},{word:'apple', role:'possessed object', type:'object'}] },
  { number: 3, sentence: 'I give John the apple.', grammarPointIds: [], group: 'B', parts: [] },
  { number: 4, sentence: 'We give him the apple.', grammarPointIds: [], group: 'B', parts: [] },
  { number: 5, sentence: 'He gives it to John.', grammarPointIds: [], group: 'B', parts: [] },
  { number: 6, sentence: 'She gives it to him.', grammarPointIds: [], group: 'B', parts: [] },
  { number: 7, sentence: 'Is the apple red?', grammarPointIds: ['be_question'], group: 'A', parts: [{word:'Is', role:'verb (inverted)', type:'verb'},{word:'the apple', role:'subject', type:'subject'},{word:'red?', role:'description + question', type:'description'}] },
  { number: 8, sentence: 'The apples are red.', grammarPointIds: ['present_be_are'], group: 'A', parts: [{word:'The apples', role:'subject (plural)', type:'subject'},{word:'are', role:'verb (to be, plural)', type:'verb'},{word:'red', role:'description (adjective)', type:'description'}] },
  { number: 9, sentence: 'I must give it to him.', grammarPointIds: [], group: 'C', parts: [] },
  { number: 10, sentence: 'I want to give it to her.', grammarPointIds: [], group: 'C', parts: [] },
  { number: 11, sentence: "I'm going to know tomorrow.", grammarPointIds: [], group: 'C', parts: [] },
  { number: 12, sentence: "I can't eat the apple.", grammarPointIds: [], group: 'C', parts: [] },
];

// ── SCENARIO FAMILIES ──
window.LX.scenarioFamilies = [
  { id: 'personal_life', name: 'Personal Life & Home', emoji: '🏠' },
  { id: 'family_friends', name: 'Family & Friends', emoji: '👨‍👩‍👧' },
  { id: 'food_shopping', name: 'Food & Shopping', emoji: '🛒' },
  { id: 'travel_transport', name: 'Travel & Transport', emoji: '✈️' },
  { id: 'city_directions', name: 'City & Directions', emoji: '🗺️' },
  { id: 'work_business', name: 'Work & Business', emoji: '💼' },
  { id: 'education_study', name: 'Education & Study', emoji: '📚' },
  { id: 'health_wellbeing', name: 'Health & Wellbeing', emoji: '🏥' },
  { id: 'technology_services', name: 'Technology & Services', emoji: '💻' },
  { id: 'community_public', name: 'Community & Public Places', emoji: '🏛️' },
];

// ── MVP LESSON: A1 LOST PROPERTY ──
window.LX.lesson_A1_001 = {
  id: 'A1-BE-LOST-PROPERTY-001',
  version: '1.0.0',
  contentType: 'CURATED_CORE',
  cefrLevel: 'A1',
  grammarPointIds: ['present_be_is', 'present_be_are', 'be_possession', 'be_question'],
  title: 'Lost Property: Is This Your Bag?',
  objective: 'I can describe an object, ask who it belongs to, and return it to the correct person.',
  estimatedMinutes: 25,
  scenarioFamily: 'community_public',
  scenarioFamilyName: 'Community & Public Places',
  status: 'published',

  // Stage 1: Visual Time
  visualTime: {
    stage: 'Stage 01',
    label: 'Visual Time',
    tagline: 'Look and think. What do you see?',
    visuals: [
      { emoji: '👜', word: 'bag', sentence: 'The {bag} is black.', highlight: 'bag' },
      { emoji: '📱', word: 'phone', sentence: 'The {phone} is blue.', highlight: 'phone' },
      { emoji: '🔑', word: 'keys', sentence: 'The {keys} are on the desk.', highlight: 'keys' },
      { emoji: '🎫', word: 'ticket', sentence: 'Is this your {ticket}?', highlight: 'ticket' },
    ],
    mindMapTitle: 'Key Language: is / are / \'s',
    mindMapItems: [
      { text: 'is (singular)', highlight: true },
      { text: 'are (plural)', highlight: true },
      { text: "John's bag", highlight: false },
      { text: 'Is this…?', highlight: false },
      { text: 'Are these…?', highlight: false },
      { text: "It isn't…", highlight: false },
    ],
  },

  // Stage 2: Grammar Focus
  grammarFocus: {
    stage: 'Stage 02',
    label: 'Grammar Focus',
    tagline: 'Understand the rule. See the pattern.',
    grammarName: 'Present Simple of "to be": is / are + Possession with \'s',
    sections: [
      { type: 'what', title: 'What is it?', content: 'We use <strong>is</strong> with one thing (singular) and <strong>are</strong> with more than one thing (plural) to describe, identify, and locate objects. We add <strong>\'s</strong> to a name to show who something belongs to.' },
      { type: 'how', title: 'How does it work?', content: '<strong>Singular:</strong> Subject + is + adjective/noun<br><strong>Plural:</strong> Subject + are + adjective/noun<br><strong>Possession:</strong> Name + \'s + noun<br><strong>Question:</strong> Is/Are + subject + adjective/noun?' },
      { type: 'when', title: 'When do I use it?', content: 'Use <em>is/are</em> when you want to: describe what an object looks like, identify an object (name it), say who something belongs to, ask if something belongs to someone, or say something is NOT true.' },
      { type: 'why', title: 'Why is it important?', content: 'English verbs must agree with their subjects. <em>Is</em> = one thing. <em>Are</em> = more than one. Getting this right immediately makes your English sound accurate and natural. It is the most used verb in English.' },
      { type: 'errors', title: 'Common mistakes', content: null, errors: [
        { wrong: 'The keys is on the desk.', right: 'The keys are on the desk.', reason: '"Keys" is plural → use "are"' },
        { wrong: 'Is these your keys?', right: 'Are these your keys?', reason: '"These" is plural → use "are"' },
        { wrong: "It is Johns bag.", right: "It is John's bag.", reason: "Always add apostrophe + s for possession" },
        { wrong: 'The phone is blue?', right: 'Is the phone blue?', reason: 'For questions, move "is/are" to the front' },
      ]},
    ],
    verbToBeTable: {
      tense: 'Present',
      rows: [
        { subject: 'I', positive: "am / I'm", negative: "am not / I'm not", question: 'Am I…?' },
        { subject: 'He / She / It', positive: "is / he's", negative: "isn't / is not", question: 'Is he/she/it…?' },
        { subject: 'You / We / They', positive: "are / you're", negative: "aren't / are not", question: 'Are you/we/they…?' },
      ],
    },
  },

  // Stage 3: Core Sentences
  coreSentences: {
    stage: 'Stage 03',
    label: 'Core Sentences',
    tagline: 'Study the models. Understand every word.',
    sentences: [
      {
        id: 'cs1',
        model: 'The apple is red.',
        coreSentenceNum: 1,
        breakdown: [
          { word: 'The apple', role: 'Subject', type: 'subject', reason: 'The thing we are talking about. Singular (one apple).' },
          { word: 'is', role: 'Verb (to be)', type: 'verb', reason: 'We use "is" because "the apple" is singular (one thing).' },
          { word: 'red', role: 'Adjective (description)', type: 'description', reason: 'Describes the colour of the apple. Adjectives come after "is/are" in English.' },
        ],
        wordTable: [
          { word: 'apple', pos: 'noun', definition: 'a round fruit', example: 'The apple is red and sweet.' },
          { word: 'is', pos: 'verb (to be, present)', definition: 'equals / describes (for one thing)', example: 'The bag is black.' },
          { word: 'red', pos: 'adjective', definition: 'the colour of blood or a tomato', example: 'Her phone is red.' },
        ],
        tenseLink: "This is present simple. 'Is' describes the apple right now. If we talked about yesterday: 'The apple was red.'",
      },
      {
        id: 'cs2',
        model: "It is John's apple.",
        coreSentenceNum: 2,
        breakdown: [
          { word: 'It', role: 'Subject (pronoun)', type: 'subject', reason: 'We use "it" to replace a thing we already mentioned (the apple). This avoids repetition.' },
          { word: 'is', role: 'Verb (to be)', type: 'verb', reason: '"It" is singular → use "is".' },
          { word: "John's", role: "Name + 's (possession)", type: 'possession', reason: "We add 's to John's name to show the apple belongs to John." },
          { word: 'apple', role: 'Possessed object', type: 'object', reason: "The thing that belongs to John." },
        ],
        wordTable: [
          { word: 'it', pos: 'pronoun', definition: 'replaces a singular thing (not a person)', example: "The bag is black. It is heavy." },
          { word: "'s", pos: 'possessive marker', definition: 'shows belonging — add to a name', example: "Maria's phone is blue." },
          { word: 'John', pos: 'proper noun (name)', definition: 'a man\'s name — used as an example', example: "John's ticket is here." },
        ],
        tenseLink: null,
      },
      {
        id: 'cs7',
        model: 'Is the apple red?',
        coreSentenceNum: 7,
        breakdown: [
          { word: 'Is', role: 'Verb (inverted — question)', type: 'verb', reason: 'To make a question, move "is/are" to the start. This is called inversion.' },
          { word: 'the apple', role: 'Subject', type: 'subject', reason: 'The subject comes after "is" in a question.' },
          { word: 'red?', role: 'Adjective + question mark', type: 'description', reason: 'The description stays at the end. Add ? at the end.' },
        ],
        wordTable: [
          { word: 'Is…?', pos: 'inverted question form', definition: 'Moves to the front to signal a yes/no question', example: 'Is this your bag? — Yes, it is.' },
          { word: 'Yes, it is.', pos: 'short answer (positive)', definition: 'The correct short answer to "Is…?" questions', example: 'Is this your phone? — Yes, it is.' },
          { word: 'No, it isn\'t.', pos: "short answer (negative)", definition: "The correct short answer when the answer is no", example: "Is this your bag? — No, it isn't." },
        ],
        tenseLink: "Statement: 'The apple is red.' → Question: 'Is the apple red?' Note how 'is' moves to the front.",
      },
      {
        id: 'cs8',
        model: 'The apples are red.',
        coreSentenceNum: 8,
        breakdown: [
          { word: 'The apples', role: 'Subject (plural)', type: 'subject', reason: 'More than one apple — plural noun.' },
          { word: 'are', role: 'Verb (to be — plural)', type: 'verb', reason: 'We use "are" because "the apples" is plural (more than one).' },
          { word: 'red', role: 'Adjective (description)', type: 'description', reason: 'Same adjective, but now describes all the apples.' },
        ],
        wordTable: [
          { word: 'apples', pos: 'noun (plural)', definition: 'more than one apple', example: "The apples are red and fresh." },
          { word: 'are', pos: 'verb (to be — plural)', definition: 'equals / describes (for more than one thing, or with you/we/they)', example: "The keys are on the desk." },
          { word: '-s / -es', pos: 'plural marker', definition: 'Add to most nouns to make them plural', example: "bag → bags, key → keys, phone → phones" },
        ],
        tenseLink: "Singular: 'The apple is red.' / Plural: 'The apples are red.' One change (apple → apples) forces another (is → are).",
      },
    ],
  },

  // Stage 4: Vocabulary
  vocabulary: {
    stage: 'Stage 04',
    label: 'Vocabulary',
    tagline: 'Learn the words. Build your toolkit.',
    groups: {
      objects: {
        title: 'Objects',
        emoji: '📦',
        items: [
          { word: 'bag', pos: 'noun', def: 'a container you carry', example: 'The {bag} is black.', emoji: '👜' },
          { word: 'phone', pos: 'noun', def: 'a mobile telephone', example: "It is Maria's {phone}.", emoji: '📱' },
          { word: 'keys', pos: 'noun (plural)', def: 'metal objects that open locks', example: 'The {keys} are on the desk.', emoji: '🔑' },
          { word: 'ticket', pos: 'noun', def: 'a card or paper that lets you enter or travel', example: 'Is this your {ticket}?', emoji: '🎫' },
          { word: 'book', pos: 'noun', def: 'pages bound together for reading', example: 'The {book} is green.', emoji: '📗' },
        ],
      },
      descriptions: {
        title: 'Colours & Descriptions',
        emoji: '🎨',
        items: [
          { word: 'black', pos: 'adj', def: 'the darkest colour', example: 'The bag is {black}.', emoji: '⬛' },
          { word: 'blue', pos: 'adj', def: 'the colour of the sky', example: 'Is the phone {blue}?', emoji: '🔵' },
          { word: 'red', pos: 'adj', def: 'the colour of a tomato', example: 'The apple is {red}.', emoji: '🔴' },
          { word: 'green', pos: 'adj', def: 'the colour of grass', example: 'The book is {green}.', emoji: '🟢' },
          { word: 'new', pos: 'adj', def: 'recently made or bought', example: 'The keys are {new}.', emoji: '✨' },
          { word: 'old', pos: 'adj', def: 'not new; used for a long time', example: "It is John's {old} bag.", emoji: '📦' },
        ],
      },
      ownership: {
        title: 'Ownership',
        emoji: '🏷️',
        items: [
          { word: 'my', pos: 'pronoun (possessive)', def: 'belonging to me', example: 'Is this {my} bag?', emoji: '👤' },
          { word: 'your', pos: 'pronoun (possessive)', def: 'belonging to you', example: 'Is this {your} phone?', emoji: '👉' },
          { word: 'his', pos: 'pronoun (possessive)', def: "belonging to him", example: 'It is {his} ticket.', emoji: '👨' },
          { word: 'her', pos: 'pronoun (possessive)', def: "belonging to her", example: "It is {her} key.", emoji: '👩' },
          { word: "John's", pos: "proper noun + 's", def: "belonging to John", example: "It is {John's} apple.", emoji: '🏷️' },
          { word: "Maria's", pos: "proper noun + 's", def: "belonging to Maria", example: "It is {Maria's} phone.", emoji: '🏷️' },
        ],
      },
      actions: {
        title: 'Actions',
        emoji: '🎬',
        items: [
          { word: 'find', pos: 'verb', def: 'to discover something lost', example: 'I {find} the bag.', emoji: '🔍' },
          { word: 'look', pos: 'verb', def: 'to direct your eyes at something', example: 'I {look} at the ticket.', emoji: '👀' },
          { word: 'ask', pos: 'verb', def: 'to put a question to someone', example: 'I {ask} about the bag.', emoji: '❓' },
          { word: 'return', pos: 'verb', def: 'to give something back', example: 'I {return} the keys.', emoji: '↩️' },
          { word: 'give', pos: 'verb', def: 'to hand something to someone', example: 'I {give} John the phone.', emoji: '🤝' },
        ],
      },
      locations: {
        title: 'Locations',
        emoji: '📍',
        items: [
          { word: 'desk', pos: 'noun', def: 'a table for working at', example: 'The keys are on the {desk}.', emoji: '🪑' },
          { word: 'bag', pos: 'noun', def: 'a container (also a location)', example: 'The phone is in the {bag}.', emoji: '👜' },
          { word: 'station', pos: 'noun', def: 'a place where trains or buses stop', example: 'The bag is at the {station}.', emoji: '🚉' },
          { word: 'hotel', pos: 'noun', def: 'a building where you pay to stay and sleep', example: 'The ticket is at the {hotel}.', emoji: '🏨' },
          { word: 'classroom', pos: 'noun', def: 'a room where students learn', example: 'The book is in the {classroom}.', emoji: '🏫' },
        ],
      },
    },
  },

  // Stage 4b: Useful Sentences
  usefulSentences: {
    stage: 'Stage 04b',
    label: 'Useful Sentences',
    tagline: 'Real English for real situations.',
    groups: {
      statements: {
        title: 'Statements',
        colorClass: 'phrases-green',
        function: 'Describe or identify',
        items: [
          { phrase: 'It is a black bag.', function: 'Describe one object (colour + noun)' },
          { phrase: "It is John's phone.", function: "Identify the owner using 's" },
          { phrase: 'The keys are on the desk.', function: 'Describe location of plural object' },
          { phrase: 'The book is green.', function: 'Describe colour of singular object' },
          { phrase: 'It is a new phone.', function: 'Describe quality of one object' },
        ],
      },
      questions: {
        title: 'Questions',
        colorClass: 'phrases-blue',
        function: 'Ask and confirm',
        items: [
          { phrase: 'Is this your ticket?', function: 'Ask if something belongs to someone (singular)' },
          { phrase: 'Are these your keys?', function: 'Ask if something belongs to someone (plural)' },
          { phrase: 'Is the bag black?', function: 'Confirm a description' },
          { phrase: 'Who does this bag belong to?', function: 'Ask about an unknown owner' },
          { phrase: 'Is this a new bag?', function: 'Ask about quality' },
        ],
      },
      negative: {
        title: 'Negative & Problem Sentences',
        colorClass: 'phrases-red',
        function: 'Correct or deny',
        items: [
          { phrase: "It isn't my bag.", function: 'Deny ownership (contraction)' },
          { phrase: 'The phone is not blue.', function: 'Correct a wrong description (full form)' },
          { phrase: "These aren't my keys.", function: 'Deny ownership (plural)' },
          { phrase: "I don't know who it belongs to.", function: 'Express uncertainty about ownership' },
        ],
      },
      polite: {
        title: 'Polite & Functional Language',
        colorClass: 'phrases-accent',
        function: 'Be helpful and polite',
        items: [
          { phrase: 'Thank you. Here is your book.', function: 'Return an item politely' },
          { phrase: 'Excuse me — is this your bag?', function: 'Approach someone politely' },
          { phrase: 'Yes, it is. Thank you!', function: 'Confirm with thanks' },
          { phrase: "No, it isn't. I'm sorry.", function: 'Deny and apologise' },
          { phrase: 'One moment, please.', function: 'Ask someone to wait politely' },
        ],
      },
      expansion: {
        title: 'Expansion Sentences',
        colorClass: 'phrases-purple',
        function: 'Say more — Level up',
        items: [
          { phrase: "The bag is black and it is very heavy.", function: "Add detail with 'and'" },
          { phrase: "The keys are old but they are still useful.", function: "Contrast with 'but'" },
          { phrase: "This is the phone. It is blue and new.", function: 'Two sentences about one object' },
          { phrase: "Is this your bag? It is on the desk.", function: 'Question + location information' },
        ],
      },
    },
  },

  // Stage 5: Exercises
  exercises: {
    stage: 'Stage 05',
    label: 'Practice',
    tagline: 'Recognise → Build → Communicate.',
    stages: [
      {
        id: 'recognition',
        num: 1,
        type: 'Recognition',
        title: 'Choose the correct form',
        prompt: 'Read each sentence. Choose "is" or "are" to complete it correctly.',
        contentType: 'CURATED_CORE',
        items: [
          { sentence: 'The bag ___ black.', blank: 0, options: ['is', 'are'], answer: 'is', explanation: '"Bag" is singular → use "is".' },
          { sentence: 'The keys ___ on the desk.', blank: 0, options: ['is', 'are'], answer: 'are', explanation: '"Keys" is plural → use "are".' },
          { sentence: '___ this your phone?', blank: 0, options: ['Is', 'Are'], answer: 'Is', explanation: '"This" refers to one thing (singular) → use "Is".' },
          { sentence: 'These ___ your books.', blank: 0, options: ['is', 'are'], answer: 'are', explanation: '"These" is plural → use "are".' },
          { sentence: 'The ticket ___ blue.', blank: 0, options: ['is', 'are'], answer: 'is', explanation: '"Ticket" is singular → use "is".' },
          { sentence: '___ these your keys?', blank: 0, options: ['Is', 'Are'], answer: 'Are', explanation: '"These" is plural → use "Are".' },
        ],
      },
      {
        id: 'matching',
        num: 2,
        type: 'Recognition',
        title: 'Match the object to the owner',
        prompt: "Read each sentence. Choose the correct owner for each object.",
        contentType: 'CURATED_CORE',
        items: [
          { sentence: "It is John's bag.", question: 'Who does the bag belong to?', options: ['John', 'Maria', 'you', 'me'], answer: 'John', explanation: "John's = belonging to John." },
          { sentence: "It is Maria's phone.", question: 'Who does the phone belong to?', options: ['John', 'Maria', 'the teacher', 'him'], answer: 'Maria', explanation: "Maria's = belonging to Maria." },
          { sentence: 'It is her ticket.', question: 'Who does the ticket belong to?', options: ['him', 'her', 'me', 'John'], answer: 'her', explanation: "'Her' shows it belongs to a woman." },
          { sentence: 'These are his keys.', question: 'Who do the keys belong to?', options: ['her', 'him', 'me', 'John'], answer: 'him', explanation: "'His' shows it belongs to a man." },
        ],
      },
      {
        id: 'controlled_production',
        num: 3,
        type: 'Controlled Production',
        title: 'Complete the sentences',
        prompt: "Complete each sentence with the correct form of 'to be' and the words in brackets.",
        contentType: 'CURATED_CORE',
        items: [
          { template: 'The phone ___ (blue).', answer: 'is blue', hint: 'singular → is' },
          { template: 'The bags ___ (black).', answer: 'are black', hint: 'plural → are' },
          { template: "___ (this / your ticket)?", answer: 'Is this your ticket', hint: 'question singular → Is' },
          { template: "___ (these / your keys)?", answer: 'Are these your keys', hint: 'question plural → Are' },
          { template: "It ___ (not / my bag).", answer: "isn't my bag", hint: 'negative → isn\'t' },
        ],
      },
      {
        id: 'question_transform',
        num: 4,
        type: 'Controlled Production',
        title: 'Turn statements into questions',
        prompt: 'Change each statement into a yes/no question.',
        contentType: 'CURATED_CORE',
        items: [
          { statement: 'The bag is black.', answer: 'Is the bag black?', hint: 'Move "is" to the front' },
          { statement: 'The keys are on the desk.', answer: 'Are the keys on the desk?', hint: 'Move "are" to the front' },
          { statement: "It is John's phone.", answer: "Is it John's phone?", hint: 'Move "is" to the front' },
          { statement: 'These are your books.', answer: 'Are these your books?', hint: 'Move "are" to the front' },
        ],
      },
    ],
  },

  // Stage 5b: Guided Dialogue
  guidedDialogue: {
    stage: 'Stage 05b',
    label: 'Guided Dialogue',
    tagline: 'Have a conversation. Use the language.',
    setting: 'Lost property desk at a train station',
    studentRole: 'Lost Property Officer',
    partnerRole: 'Passenger',
    goal: 'Help the passenger find their lost black bag',
    contentType: 'CURATED_CORE',
    dialogue: [
      { speaker: 'partner', text: 'Excuse me. I think my bag is here.', type: 'opening' },
      { speaker: 'student', text: null, prompt: 'Ask: "Is this your bag?" and describe it', model: 'Is this your bag? It is a black bag.', options: ['Is this your bag? It is a black bag.', 'This is a black bag. Is it your?', 'Are this your bag? It black.'] },
      { speaker: 'partner', text: 'Hmm. Is it black? Yes! And is it a big bag?', type: 'response' },
      { speaker: 'student', text: null, prompt: 'Confirm: Yes, it is big. And ask about keys', model: "Yes, it is big. Are these your keys? They are in the bag.", options: ["Yes, it is big. Are these your keys? They are in the bag.", "Yes it big. Are this your keys? Keys are bag.", "The bag is big. Key are in."] },
      { speaker: 'partner', text: "Yes! Those are my keys. Thank you so much!", type: 'response' },
      { speaker: 'student', text: null, prompt: 'Respond politely and return the bag', model: "You're welcome! Here is your bag. Have a good journey!", options: ["You're welcome! Here is your bag. Have a good journey!", "Welcome! Here bag. Good trip!", "No problem. Bag is yours. Go well!"] },
    ],
    successChecklist: [
      'You used "is" correctly with singular objects (bag, phone)',
      "You used 'are' correctly with plural objects (keys, books)",
      "You used 's to show possession (John's, Maria's)",
      'You asked at least one yes/no question with is/are',
      'You used a negative form (isn\'t / aren\'t)',
      'You completed the task: the passenger received their bag',
    ],
  },

  // Stage 5c: Information Gap
  informationGap: {
    stage: 'Stage 05c',
    label: 'Information Gap',
    tagline: 'Ask questions. Fill the gaps. Solve it.',
    contentType: 'CURATED_CORE',
    studentHas: [
      { emoji: '👜', object: 'bag', description: 'black, big' },
      { emoji: '📱', object: 'phone', description: 'blue, new' },
      { emoji: '🔑', object: 'keys', description: 'old, 3 keys' },
      { emoji: '🎫', object: 'ticket', description: 'red, small' },
    ],
    partnerHas: [
      { object: 'bag', owner: 'John' },
      { object: 'phone', owner: 'Maria' },
      { object: 'keys', owner: 'the teacher' },
      { object: 'ticket', owner: 'Mr Chen' },
    ],
    instructions: 'You can see the objects. Your partner knows the owners. Ask questions to match each object to its owner. Use: "Is this John\'s ___?" or "Are these ___\'s keys?"',
    answerKey: [
      { object: 'bag', owner: 'John', sentence: "The bag is John's." },
      { object: 'phone', owner: 'Maria', sentence: "The phone is Maria's." },
      { object: 'keys', owner: 'the teacher', sentence: "The keys are the teacher's." },
      { object: 'ticket', owner: 'Mr Chen', sentence: "The ticket is Mr Chen's." },
    ],
  },

  // Stage 6: Transfer Challenge — A curated bank of 4 scenarios
  transferChallenge: {
    stage: 'Stage 06',
    label: 'Transfer: New Situation',
    tagline: 'Use what you know. No model. Just you.',
    contentType: 'CURATED_CORE',
    intro: 'A new situation. Same grammar. You are on your own. Use is/are, \'s, and your vocabulary.',
    scenarios: [
      {
        id: 'hotel_reception',
        title: 'Hotel Reception',
        setting: 'The hotel reception desk. A guest has left items behind.',
        studentRole: 'Receptionist',
        partnerRole: 'Hotel Guest',
        newGap: 'The guest is looking for their room key and a black bag. You have both, but you need to confirm they belong to the right person.',
        targetLanguage: ['Is this your room key?', "The bag is Mr Smith's.", 'Are these your documents?', 'The towels are clean.'],
        lostItems: [
          { emoji: '🗝️', object: 'room key', description: 'silver, room 204' },
          { emoji: '👜', object: 'black bag', description: 'black, large' },
          { emoji: '📋', object: 'documents', description: 'in a brown envelope' },
        ],
        successCriteria: [
          "Used 'is' correctly at least twice",
          "Used 'are' correctly at least once",
          "Used 's possession at least once",
          'Asked at least one yes/no question',
          'Completed the task: returned items to the correct guest',
        ],
      },
      {
        id: 'classroom_objects',
        title: 'Classroom: Who Owns This?',
        setting: 'End of English class. Objects are left on desks.',
        studentRole: 'Class Monitor',
        partnerRole: 'Student',
        newGap: 'There are 4 objects on desks. You need to find out who they belong to and return them.',
        targetLanguage: ['Is this your pen?', 'Are these your books?', "It is Sara's notebook.", 'The bag is not mine.'],
        lostItems: [
          { emoji: '✏️', object: 'pen', description: 'blue, new' },
          { emoji: '📚', object: 'books', description: '3 books, green' },
          { emoji: '📓', object: 'notebook', description: 'red, small' },
          { emoji: '🎒', object: 'backpack', description: 'black, big' },
        ],
        successCriteria: [
          "Used 'is' for singular objects",
          "Used 'are' for plural objects (books)",
          "Used 's to name an owner",
          'Asked who objects belong to',
          'All 4 items returned to owners',
        ],
      },
      {
        id: 'shopping_centre',
        title: 'Shopping Centre Lost & Found',
        setting: 'Shopping centre information desk.',
        studentRole: 'Information Desk Assistant',
        partnerRole: 'Shopper',
        newGap: "A shopper has lost their phone and keys. You have items in your lost-and-found box. Confirm what's there and return the right items.",
        targetLanguage: ['Is this your phone?', 'Are these your keys?', "The phone is blue.", "It isn't black."],
        lostItems: [
          { emoji: '📱', object: 'phone', description: 'blue, cracked screen' },
          { emoji: '🔑', object: 'keys', description: '2 keys, on a red ring' },
          { emoji: '👓', object: 'glasses', description: 'black, small' },
        ],
        successCriteria: [
          'Described at least 2 objects using is/are + colour',
          'Asked at least 2 questions using Is/Are',
          "Used a negative (isn't/aren't)",
          'Returned the correct items',
        ],
      },
      {
        id: 'airport_gate',
        title: 'Airport: Gate B12',
        setting: 'Boarding gate at an airport. A bag is blocking the aisle.',
        studentRole: 'Airline Staff',
        partnerRole: 'Passenger',
        newGap: 'A black bag is blocking the aisle at gate B12. You need to find its owner and get it moved.',
        targetLanguage: ['Is this your bag?', "It is a black bag.", "It isn't mine.", "Is this the right gate?"],
        lostItems: [
          { emoji: '🧳', object: 'suitcase', description: 'black, large' },
          { emoji: '🎒', object: 'backpack', description: 'blue, small' },
          { emoji: '🗺️', object: 'boarding pass', description: 'for gate B12' },
        ],
        successCriteria: [
          "Used 'is' and 'isn't' correctly",
          'Asked the passengers politely',
          'Identified the owner',
          'Task completed: bag removed',
        ],
      },
    ],
  },

  // Stage 7: Feedback & Rubric
  rubric: {
    dimensions: [
      { id: 'target_grammar', label: 'Target grammar (is/are)', max: 2 },
      { id: 'verb_be_agreement', label: 'Verb-to-be agreement', max: 2 },
      { id: 'vocabulary', label: 'Vocabulary range', max: 2 },
      { id: 'questions_negatives', label: 'Questions & negatives', max: 2 },
      { id: 'meaning', label: 'Meaning & clarity', max: 2 },
      { id: 'interaction', label: 'Interaction & task completion', max: 2 },
      { id: 'repair', label: 'Self-repair & clarification', max: 2 },
      { id: 'transfer', label: 'Transfer to new context', max: 2 },
    ],
    scoreBands: [
      { min: 0, max: 5, label: 'Reteach', desc: 'Needs more support. Review grammar focus and try again with the model.', color: '#DC2626' },
      { min: 6, max: 10, label: 'Emerging', desc: 'Good effort. Repeat the guided practice in a new context.', color: '#D97706' },
      { min: 11, max: 13, label: 'Functional', desc: 'Well done! Try the expansion scenario.', color: '#0369A1' },
      { min: 14, max: 16, label: 'Independent', desc: 'Excellent! You are ready for the next lesson. Review scheduled.', color: '#2D7E5E' },
    ],
  },

  // Stage 8: Review Plan
  reviewPlan: {
    stage: 'Stage 08',
    label: 'Review Plan',
    tagline: 'Keep it. Use it. Remember it.',
    events: [
      { timing: 'End of lesson', label: 'Oral recap', desc: "Say aloud: 'The bag is black. It is John's bag. Is this your phone?' Try to say them without looking.", icon: '🎤', type: 'immediate' },
      { timing: 'Same day', label: 'Quick recognition', desc: "Complete 3 sentences with is/are. Do it before bed.", icon: '📝', type: 'sameday' },
      { timing: 'Next lesson', label: 'New scenario', desc: "Your teacher will give you a similar scenario in a different setting (e.g. café, office). Use the same grammar.", icon: '🔄', type: 'nextlesson' },
      { timing: '3 days', label: 'Short dialogue', desc: "Write a 4-line lost-property dialogue in a new setting (hotel, airport, shopping centre). Use is/are and 's.", icon: '💬', type: 'threedays' },
      { timing: '7 days', label: 'Independent transfer', desc: "Without any model: describe 4 objects in a new place. Ask 2 questions. Give 2 objects back to their owners.", icon: '🚀', type: 'sevendays' },
      { timing: '2–4 weeks', label: 'Mixed review', desc: "Mixed grammar: is/are + going to + can't. Scenario: travel or workplace.", icon: '🔁', type: 'weeks' },
    ],
  },

  // What to remember
  whatToRemember: [
    { rule: "Singular → is. Plural → are. Never mix them.", emoji: '⚖️' },
    { rule: "To ask a question, move is/are to the front.", emoji: '❓' },
    { rule: "Add 's to a name to show possession: John's, Maria's.", emoji: '🏷️' },
    { rule: "Use isn't / aren't for negatives — not 'is not' in fast speech.", emoji: '🚫' },
    { rule: "Test yourself: one apple → is. Two apples → are. Simple!", emoji: '🎯' },
  ],
};

// ── LEARNER DATA (Simulated — replaces Supabase for Phase 1 testing) ──
window.LX.learnerData = {
  profile: { id: 'learner-001', name: 'Alex Johnson', role: 'learner', cefrLevel: 'A1', avatar: 'AJ' },
  progress: {
    'A1-BE-LOST-PROPERTY-001': {
      lessonId: 'A1-BE-LOST-PROPERTY-001',
      status: 'in_progress',
      currentStage: 0,
      stagesCompleted: [],
      startedAt: new Date().toISOString(),
      confidenceRating: null,
    },
  },
  attempts: [],
  reviewQueue: [],
  masteryRecords: {
    'present_be_is': { recognition: 0, controlled: 0, guided: 0, transfer: 0, overall: 'not_started' },
    'present_be_are': { recognition: 0, controlled: 0, guided: 0, transfer: 0, overall: 'not_started' },
  },
};

// ── TEACHER DATA ──
window.LX.teacherData = {
  profile: { id: 'teacher-001', name: 'Ms Rivera', role: 'teacher', avatar: 'MR' },
  learners: [
    { id: 'learner-001', name: 'Alex Johnson', level: 'A1', avatar: 'AJ', color: '#5B61F6' },
    { id: 'learner-002', name: 'Priya Sharma', level: 'A1', avatar: 'PS', color: '#2D7E5E' },
    { id: 'learner-003', name: 'Marco Bianchi', level: 'A2', avatar: 'MB', color: '#D97706' },
  ],
};

// ── ADMIN DATA ──
window.LX.adminData = {
  profile: { id: 'admin-001', name: 'Platform Admin', role: 'platform_admin', avatar: 'PA' },
  contentStats: {
    curatedLessons: 1, generatedPractice: 0, pendingReview: 0, published: 1,
  },
};
