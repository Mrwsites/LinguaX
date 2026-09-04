/* ===== LinguaX Curriculum Data — Phase 2 Batch 1 ===== */
/*
 * Complete A0–C2 curriculum map.
 *
 * Each level contains:
 *   levelPurpose          — why this level exists in the learning journey
 *   entryExpectations     — what a learner must already control to start here
 *   endOfLevelOutcomes    — what a learner can do on exit
 *   units[]               — ordered array of unit objects
 *     unit.lessons[]      — ordered lesson stubs (no bodies yet)
 *       lesson.status     — "PUBLISHED" | "PLANNED"
 *   grammarProgression[]  — ordered grammar targets for the level
 *   vocabularyThemes[]    — thematic vocabulary sets
 *   languageFunctions[]   — communicative functions practised
 *   scenarioFamilies[]    — real-world scenario families used
 *   assessmentCheckpoints[]— formal / informal checkpoints
 *   reviewStrategy        — how SRS / recycling is handled at this level
 *   finalChallenge        — end-of-level capstone task description
 *   launchPriority        — "P0" | "P1" | "P2"
 *
 * Lesson status values:
 *   "PUBLISHED"  — full lesson body exists and is live (currently 1 lesson only)
 *   "PLANNED"    — lesson is scoped but body not yet written
 *
 * The single PUBLISHED lesson is:
 *   A1 → Unit 1: Me, My Things, and Basic Descriptions → Lesson 4
 *   id: "A1-BE-LOST-PROPERTY-001"
 *   Its full body lives in window.LX.lesson_A1_001 (data.js — unchanged).
 *
 * Import pattern (next batch):
 *   window.LX.curriculum is available after this file loads.
 *   Access a level:  window.LX.curriculum.levels.A1
 *   Access a lesson: window.LX.curriculum.getLessonById('A1-BE-LOST-PROPERTY-001')
 *   Count helpers:   window.LX.curriculum.counts
 */

(function () {
  'use strict';

  window.LX = window.LX || {};

  /* ─────────────────────────────────────────────
     HELPER — build a PLANNED lesson stub
  ───────────────────────────────────────────── */
  function planned(id, title, estimatedMinutes, scenarioFamily, grammarFocus, objective) {
    return {
      id: id,
      title: title,
      status: 'PLANNED',
      estimatedMinutes: estimatedMinutes || 25,
      scenarioFamily: scenarioFamily || 'personal_life',
      grammarFocus: grammarFocus || [],
      objective: objective || '',
    };
  }

  /* ─────────────────────────────────────────────
     HELPER — build the PUBLISHED anchor lesson stub
     (full body is in window.LX.lesson_A1_001)
  ───────────────────────────────────────────── */
  function publishedAnchor() {
    return {
      id: 'A1-BE-LOST-PROPERTY-001',
      title: 'Lost Property: Is This Your Bag?',
      status: 'PUBLISHED',
      estimatedMinutes: 25,
      scenarioFamily: 'community_public',
      grammarFocus: ['present_be_is', 'present_be_are', 'be_possession', 'be_question'],
      objective: 'I can describe an object, ask who it belongs to, and return it to the correct person.',
      bodyRef: 'window.LX.lesson_A1_001',
    };
  }

  /* ═══════════════════════════════════════════════════════════════
     LEVEL  A0  —  Pre-A1 / Foundation
  ═══════════════════════════════════════════════════════════════ */
  var A0 = {
    code: 'A0',
    launchPriority: 'P1',

    levelPurpose:
      'Build absolute zero literacy and spoken-word recognition in English. ' +
      'Learners arrive with no prior English exposure. Every item is concrete, ' +
      'visual, and immediately useful. The level removes anxiety and establishes ' +
      'the habit of noticing English in the world around the learner.',

    entryExpectations:
      'No English required. Learner must be able to read their own L1 and ' +
      'follow simple visual instructions. Basic number recognition (1–10) helpful.',

    endOfLevelOutcomes: [
      'Recognise and say the English alphabet aloud.',
      'Count to 20 and recognise numerals in context.',
      'Identify and name ~150 high-frequency concrete nouns by sight.',
      'Understand and respond to 10 core classroom instructions.',
      'Produce single-word and two-word answers to simple visual prompts.',
      'Recognise own name and basic personal information in written form.',
      'Say hello, goodbye, please, thank you, and sorry confidently.',
    ],

    units: [
      {
        code: 'A0-U1',
        title: 'Hello, English!',
        description: 'First contact — alphabet, sounds, and classroom language.',
        lessons: [
          planned('A0-U1-L1', 'The English Alphabet: A–M', 20, 'education_study',
            ['alphabet_recognition'], 'I can identify and say letters A to M.'),
          planned('A0-U1-L2', 'The English Alphabet: N–Z', 20, 'education_study',
            ['alphabet_recognition'], 'I can identify and say letters N to Z.'),
          planned('A0-U1-L3', 'Classroom Instructions: Stand Up, Sit Down, Listen', 20, 'education_study',
            ['imperative_basic'], 'I can follow 10 core classroom commands.'),
          planned('A0-U1-L4', 'Hello and Goodbye', 20, 'personal_life',
            ['greeting_formulaic'], 'I can greet and farewell people using set phrases.'),
          planned('A0-U1-L5', 'Please, Thank You, Sorry', 15, 'personal_life',
            ['polite_formulaic'], 'I can use three essential politeness words correctly.'),
        ],
      },
      {
        code: 'A0-U2',
        title: 'Numbers and Colours',
        description: 'Core numbers 1–20 and basic colour vocabulary.',
        lessons: [
          planned('A0-U2-L1', 'Numbers 1–10', 20, 'personal_life',
            ['cardinal_numbers'], 'I can count from 1 to 10 and match numerals to words.'),
          planned('A0-U2-L2', 'Numbers 11–20', 20, 'personal_life',
            ['cardinal_numbers'], 'I can count from 11 to 20.'),
          planned('A0-U2-L3', 'Colours: Red, Blue, Green, Yellow, Black, White', 20, 'personal_life',
            ['colour_adjectives'], 'I can name six basic colours.'),
          planned('A0-U2-L4', 'Colours: Orange, Purple, Pink, Brown, Grey', 20, 'personal_life',
            ['colour_adjectives'], 'I can name five more colours.'),
          planned('A0-U2-L5', 'Numbers and Colours Together: Three Blue Bags', 20, 'personal_life',
            ['cardinal_numbers', 'colour_adjectives'], 'I can combine a number and a colour to describe things.'),
        ],
      },
      {
        code: 'A0-U3',
        title: 'My World: Things I Can See',
        description: 'Concrete everyday nouns — body, classroom, home, food.',
        lessons: [
          planned('A0-U3-L1', 'My Body: Head, Eyes, Ears, Nose, Mouth, Hands', 20, 'health_wellbeing',
            ['body_nouns'], 'I can name six body parts.'),
          planned('A0-U3-L2', 'My Classroom: Book, Pen, Desk, Chair, Board', 20, 'education_study',
            ['classroom_nouns'], 'I can name five classroom objects.'),
          planned('A0-U3-L3', 'My Home: Door, Window, Table, Chair, Bed', 20, 'personal_life',
            ['home_nouns'], 'I can name five objects found at home.'),
          planned('A0-U3-L4', 'Food I Know: Apple, Bread, Water, Milk, Egg', 20, 'food_shopping',
            ['food_nouns'], 'I can name five basic food items.'),
          planned('A0-U3-L5', 'Animals: Dog, Cat, Bird, Fish, Horse', 20, 'personal_life',
            ['animal_nouns'], 'I can name five common animals.'),
          planned('A0-U3-L6', 'Review: Nouns in My World', 20, 'personal_life',
            ['noun_review_a0'], 'I can identify 25+ nouns across all topic areas.'),
        ],
      },
      {
        code: 'A0-U4',
        title: 'Who Am I? Basic Personal Information',
        description: 'Name, age, country — the first personal information exchange.',
        lessons: [
          planned('A0-U4-L1', 'My Name: What Is Your Name? My Name Is …', 20, 'personal_life',
            ['name_exchange'], 'I can say and write my own name in English.'),
          planned('A0-U4-L2', 'My Age: How Old Are You? I Am … Years Old.', 20, 'personal_life',
            ['age_expression'], 'I can say and understand ages using cardinal numbers.'),
          planned('A0-U4-L3', 'My Country: Where Are You From? I Am From …', 20, 'personal_life',
            ['country_expression'], 'I can name my country and at least 5 other countries.'),
          planned('A0-U4-L4', 'A–Z: My Name, My Spelling', 20, 'personal_life',
            ['alphabet_spelling'], 'I can spell my name aloud using the English alphabet.'),
          planned('A0-U4-L5', 'Foundation Challenge: Who Am I? Card', 25, 'personal_life',
            ['name_exchange', 'age_expression', 'country_expression'],
            'I can complete a basic personal ID card in English.'),
        ],
      },
    ],

    grammarProgression: [
      { order: 1, tag: 'alphabet_recognition',  title: 'The English Alphabet (recognition + production)' },
      { order: 2, tag: 'cardinal_numbers',       title: 'Cardinal Numbers 1–20' },
      { order: 3, tag: 'colour_adjectives',      title: 'Colour Adjectives (pre-noun position)' },
      { order: 4, tag: 'noun_singular',          title: 'Singular Nouns (concrete, high-frequency)' },
      { order: 5, tag: 'imperative_basic',       title: 'Basic Imperatives: Stand up. Sit down. Listen.' },
      { order: 6, tag: 'greeting_formulaic',     title: 'Formulaic Greetings: Hello / Hi / Goodbye / Bye' },
      { order: 7, tag: 'polite_formulaic',       title: 'Polite Formulae: Please / Thank you / Sorry' },
      { order: 8, tag: 'name_exchange',          title: 'Name Exchange: My name is … / What is your name?' },
      { order: 9, tag: 'age_expression',         title: 'Age: I am … years old.' },
      { order: 10, tag: 'country_expression',    title: 'Country of Origin: I am from …' },
    ],

    vocabularyThemes: [
      'Alphabet and phonics', 'Numbers 1–20', 'Colours (11)',
      'Classroom objects', 'Body parts', 'Home objects',
      'Food basics', 'Animals', 'Countries and nationalities (10)',
      'Personal information words',
    ],

    languageFunctions: [
      'Greeting and leave-taking',
      'Expressing politeness (please / thank you / sorry)',
      'Identifying objects by name',
      'Saying your name, age, and country',
      'Spelling your name aloud',
      'Following basic classroom instructions',
      'Recognising numbers in context (prices, ages, phone numbers)',
    ],

    scenarioFamilies: [
      'personal_life', 'education_study', 'food_shopping', 'health_wellbeing',
    ],

    assessmentCheckpoints: [
      { after: 'A0-U2', type: 'formative', label: 'Numbers & Colours Check', description: 'Match 20 number words to numerals; name all 11 colours from flashcards.' },
      { after: 'A0-U3', type: 'formative', label: 'Noun Recognition Scan', description: 'Identify 25 nouns from images within 60 seconds.' },
      { after: 'A0-U4', type: 'summative', label: 'Foundation Exit Task', description: 'Complete a personal ID card (name, age, country, spell name). Score ≥ 80% to exit A0.' },
    ],

    reviewStrategy:
      'Daily 5-minute flashcard loops on target nouns and numbers. ' +
      'Spaced repetition intervals: 1 day → 3 days → 7 days. ' +
      'No written production required — recognition and spoken matching only.',

    finalChallenge:
      'Foundation Identity Card Task: The learner fills in a printed or on-screen ' +
      'personal ID card (name, age, country, 3 favourite things using colour + noun), ' +
      'spells their name aloud, and presents it to a partner or camera. ' +
      'Rubric: accuracy of spelling, correct number use, colour accuracy, politeness formula.',
  };

  /* ═══════════════════════════════════════════════════════════════
     LEVEL  A1  —  Beginner
  ═══════════════════════════════════════════════════════════════ */
  var A1 = {
    code: 'A1',
    launchPriority: 'P0',

    levelPurpose:
      'Establish the core verb "to be" and present-simple verb system across ' +
      'the most essential daily-life contexts: identity, possessions, location, ' +
      'routine, and basic needs. Every lesson at A1 is a real-world scenario ' +
      'where a learner can immediately use the language outside the classroom.',

    entryExpectations:
      'Learner can name ~100 concrete English nouns, say their name/age/country, ' +
      'use greetings and politeness formulae, and recognise the alphabet. ' +
      '(A0 exit or equivalent recognised prior knowledge.)',

    endOfLevelOutcomes: [
      'Use "to be" (am / is / are) correctly in statements, questions, and negatives.',
      'Talk about personal information: name, age, nationality, job, family.',
      'Describe objects, places, and people using basic adjectives.',
      'Express possession using possessive pronouns and \'s.',
      'Ask and answer yes/no questions and simple Wh- questions.',
      'Understand and produce short dialogues about daily routines.',
      'Use present simple for habits, facts, and schedules.',
      'Use "there is / there are" to describe locations.',
      'Use basic prepositions of place: in, on, under, next to.',
      'Handle simple transactional exchanges: shopping, directions, introductions.',
    ],

    units: [
      {
        code: 'A1-U1',
        title: 'Me, My Things, and Basic Descriptions',
        description: 'The verb "to be" — describing yourself, your possessions, and the world immediately around you.',
        lessons: [
          planned('A1-U1-L1', 'I Am … — Introducing Yourself with "to be"', 25, 'personal_life',
            ['present_be_is', 'present_be_am'],
            'I can introduce myself using "My name is …" and "I am …".'),
          planned('A1-U1-L2', 'He Is, She Is — Describing People', 25, 'personal_life',
            ['present_be_is'],
            'I can describe a third person using "he is" and "she is" + adjective.'),
          planned('A1-U1-L3', 'They Are, We Are — Groups and Plural Descriptions', 25, 'personal_life',
            ['present_be_are'],
            'I can describe groups of people and things using "they are" and "we are".'),
          publishedAnchor(), /* ← A1-U1-L4: Lost Property — PUBLISHED */
          planned('A1-U1-L5', 'Is It …? — Yes/No Questions with "to be"', 25, 'community_public',
            ['be_question'],
            'I can ask and answer yes/no questions using inversion.'),
          planned('A1-U1-L6', 'It Isn\'t … — Negative Statements with "to be"', 25, 'personal_life',
            ['be_negative'],
            'I can correct wrong information using "isn\'t" and "aren\'t".'),
          planned('A1-U1-L7', 'Unit 1 Review: Am / Is / Are in Action', 25, 'personal_life',
            ['present_be_is', 'present_be_are', 'be_question', 'be_negative'],
            'I can use all forms of "to be" accurately across contexts.'),
        ],
      },
      {
        code: 'A1-U2',
        title: 'My Family and People I Know',
        description: 'Talking about family members, ages, and relationships.',
        lessons: [
          planned('A1-U2-L1', 'Family Words: Mother, Father, Sister, Brother', 25, 'family_friends',
            ['family_vocabulary', 'present_be_is'],
            'I can name immediate family members and describe them with "to be".'),
          planned('A1-U2-L2', 'How Old Is He? — Ages and Family', 25, 'family_friends',
            ['age_expression', 'present_be_is'],
            'I can ask and answer questions about age.'),
          planned('A1-U2-L3', 'My Family: A Description', 25, 'family_friends',
            ['possessive_pronouns', 'present_be_is'],
            'I can describe my family using possessive pronouns (my, his, her, their).'),
          planned('A1-U2-L4', 'Friends and Classmates: Nice to Meet You', 25, 'family_friends',
            ['introductions_third_party'],
            'I can introduce a third person: "This is my friend …".'),
          planned('A1-U2-L5', 'Where Are They From? — Nationalities', 25, 'family_friends',
            ['nationality_adjectives', 'present_be_is'],
            'I can say where people are from and use nationality adjectives.'),
        ],
      },
      {
        code: 'A1-U3',
        title: 'My Day: Habits and Routines',
        description: 'Present simple for daily routines and habitual actions.',
        lessons: [
          planned('A1-U3-L1', 'I Get Up, I Go — Present Simple (I / You)', 25, 'personal_life',
            ['present_simple_affirmative'],
            'I can describe my daily routine using common action verbs.'),
          planned('A1-U3-L2', 'He Gets Up — Third-Person -s', 25, 'personal_life',
            ['present_simple_third_person_s'],
            'I can add -s to verbs for he/she/it in present simple.'),
          planned('A1-U3-L3', 'Do You …? — Yes/No Questions in Present Simple', 25, 'personal_life',
            ['present_simple_do_question'],
            'I can ask yes/no questions using "Do you …?"'),
          planned('A1-U3-L4', 'I Don\'t … — Negative Present Simple', 25, 'personal_life',
            ['present_simple_negative'],
            'I can make negative sentences using "don\'t" and "doesn\'t".'),
          planned('A1-U3-L5', 'What Time Do You …? — Daily Schedules', 25, 'personal_life',
            ['time_expressions', 'present_simple_do_question'],
            'I can ask about and describe time using o\'clock and half past.'),
          planned('A1-U3-L6', 'Days of the Week in My Routine', 25, 'personal_life',
            ['days_of_week', 'frequency_adverbs'],
            'I can use days of the week and frequency words (always, usually, sometimes, never).'),
        ],
      },
      {
        code: 'A1-U4',
        title: 'Where Things Are: Places and Directions',
        description: 'There is / there are, prepositions of place, and basic directions.',
        lessons: [
          planned('A1-U4-L1', 'There Is a Café — There Is / There Are', 25, 'city_directions',
            ['there_is_there_are'],
            'I can describe what exists in a place using "there is/are".'),
          planned('A1-U4-L2', 'On the Table, In the Bag — Prepositions of Place', 25, 'personal_life',
            ['prepositions_place'],
            'I can say where things are using in, on, under, next to, behind.'),
          planned('A1-U4-L3', 'Where Is the Station? — Asking for Directions', 25, 'city_directions',
            ['directions_vocabulary', 'there_is_there_are'],
            'I can ask for and understand simple directions.'),
          planned('A1-U4-L4', 'Go Straight On — Giving Directions', 25, 'city_directions',
            ['directions_imperatives'],
            'I can give simple directions using imperative forms.'),
          planned('A1-U4-L5', 'My Town: A Description', 25, 'city_directions',
            ['there_is_there_are', 'prepositions_place'],
            'I can describe my town/neighbourhood using "there is/are" and prepositions.'),
        ],
      },
      {
        code: 'A1-U5',
        title: 'Food, Shopping, and Money',
        description: 'Shopping transactions, food vocabulary, prices, and simple requests.',
        lessons: [
          planned('A1-U5-L1', 'At the Café: Ordering Food and Drink', 25, 'food_shopping',
            ['can_request', 'food_vocabulary'],
            'I can order food and drink using "I\'d like …" and "Can I have …?"'),
          planned('A1-U5-L2', 'How Much Is It? — Prices and Money', 25, 'food_shopping',
            ['numbers_prices', 'be_question'],
            'I can ask for and understand prices.'),
          planned('A1-U5-L3', 'I Like / I Don\'t Like — Food Preferences', 25, 'food_shopping',
            ['present_simple_like', 'present_simple_negative'],
            'I can express food likes and dislikes.'),
          planned('A1-U5-L4', 'At the Market: Buying Fruit and Vegetables', 25, 'food_shopping',
            ['can_request', 'numbers_prices', 'food_vocabulary'],
            'I can buy items at a market using quantities and prices.'),
          planned('A1-U5-L5', 'A Shopping List: What Do You Need?', 25, 'food_shopping',
            ['need_want_have', 'present_simple_do_question'],
            'I can make and discuss a shopping list.'),
        ],
      },
      {
        code: 'A1-U6',
        title: 'Travel and Getting Around',
        description: 'Transport, tickets, simple travel language.',
        lessons: [
          planned('A1-U6-L1', 'How Do You Get to Work? — Transport Vocabulary', 25, 'travel_transport',
            ['transport_vocabulary', 'present_simple_affirmative'],
            'I can name modes of transport and say how I travel.'),
          planned('A1-U6-L2', 'A Ticket to London, Please — Buying Tickets', 25, 'travel_transport',
            ['can_request', 'numbers_prices'],
            'I can buy a transport ticket using set phrases.'),
          planned('A1-U6-L3', 'At the Airport: Check-in Basics', 25, 'travel_transport',
            ['airport_vocabulary', 'be_question'],
            'I can handle basic airport check-in language.'),
          planned('A1-U6-L4', 'Is the Train Late? — Travel Problems', 25, 'travel_transport',
            ['present_be_is', 'be_question', 'be_negative'],
            'I can ask and respond to basic travel problem questions.'),
          planned('A1-U6-L5', 'A1 Exit Challenge: Travel Scenario', 30, 'travel_transport',
            ['present_simple_affirmative', 'can_request', 'be_question'],
            'I can handle a complete travel scenario from start to finish.'),
        ],
      },
    ],

    grammarProgression: [
      { order: 1,  tag: 'present_be_am',             title: 'To Be: am (I am …)' },
      { order: 2,  tag: 'present_be_is',             title: 'To Be: is (singular)' },
      { order: 3,  tag: 'present_be_are',            title: 'To Be: are (plural / you / we / they)' },
      { order: 4,  tag: 'be_question',               title: 'Questions with To Be: Is …? Are …?' },
      { order: 5,  tag: 'be_negative',               title: 'Negatives: isn\'t / aren\'t / am not' },
      { order: 6,  tag: 'be_possession',             title: "Possession with 's" },
      { order: 7,  tag: 'possessive_pronouns',       title: 'Possessive Pronouns: my, your, his, her, our, their' },
      { order: 8,  tag: 'there_is_there_are',        title: 'There Is / There Are' },
      { order: 9,  tag: 'prepositions_place',        title: 'Prepositions of Place: in, on, under, next to, behind' },
      { order: 10, tag: 'present_simple_affirmative',title: 'Present Simple: Affirmative (I / you / we / they)' },
      { order: 11, tag: 'present_simple_third_person_s', title: 'Present Simple: Third-Person -s (he / she / it)' },
      { order: 12, tag: 'present_simple_do_question',title: 'Present Simple: Do / Does Questions' },
      { order: 13, tag: 'present_simple_negative',   title: 'Present Simple: Don\'t / Doesn\'t' },
      { order: 14, tag: 'frequency_adverbs',         title: 'Frequency Adverbs: always, usually, sometimes, never' },
      { order: 15, tag: 'can_request',               title: 'Modal: Can for Requests' },
    ],

    vocabularyThemes: [
      'Personal information (name, age, nationality, job)',
      'Family members', 'Physical descriptions', 'Personality adjectives (basic)',
      'Daily routine verbs (get up, eat, go, work, sleep)',
      'Days of the week', 'Time expressions (o\'clock, half past)',
      'Food and drink', 'Prices and money', 'Transport',
      'Town and city places', 'Preposition landmarks',
      'Classroom and study vocabulary', 'Colours and shapes review',
    ],

    languageFunctions: [
      'Introducing yourself and others',
      'Asking for and giving personal information',
      'Describing people, objects, and places',
      'Expressing possession',
      'Asking yes/no questions and giving short answers',
      'Describing daily routines and habits',
      'Telling the time',
      'Ordering food and drink',
      'Asking for prices',
      'Buying tickets',
      'Asking for and giving directions',
      'Describing where things are',
    ],

    scenarioFamilies: [
      'personal_life', 'family_friends', 'food_shopping',
      'travel_transport', 'city_directions', 'community_public', 'education_study',
    ],

    assessmentCheckpoints: [
      { after: 'A1-U2', type: 'formative', label: 'To Be & Family Check',
        description: 'Describe a family photograph using all forms of "to be". Score ≥ 75%.' },
      { after: 'A1-U3', type: 'formative', label: 'Present Simple Routine Check',
        description: 'Write 6 sentences about your daily routine, including third-person and negative forms.' },
      { after: 'A1-U4', type: 'formative', label: 'Directions Role-Play',
        description: 'Give and follow directions to 3 places using a simple map.' },
      { after: 'A1-U6', type: 'summative', label: 'A1 Exit Task: Travel Scenario',
        description: 'Handle a complete travel interaction: buy a ticket, ask for directions, describe a lost item. Score ≥ 80% to exit A1.' },
    ],

    reviewStrategy:
      'SRS flashcards for all vocabulary sets. Grammar recycled in every new scenario. ' +
      'End-of-unit "New Situation" transfer task uses the same grammar in a fresh context. ' +
      'Spaced review: same-day → next lesson → 3 days → 7 days → 21 days.',

    finalChallenge:
      'A1 Travel Scenario: The learner acts as a traveller arriving in a new city. ' +
      'They must (1) introduce themselves at a hostel reception, (2) ask for directions ' +
      'to a café, (3) order food and ask the price, and (4) report a lost item. ' +
      'All four grammar targets from the level must appear. Assessed on accuracy, ' +
      'fluency, and task completion.',
  };

  /* ═══════════════════════════════════════════════════════════════
     LEVEL  A2  —  Elementary
  ═══════════════════════════════════════════════════════════════ */
  var A2 = {
    code: 'A2',
    launchPriority: 'P0',

    levelPurpose:
      'Extend the learner beyond simple present into past events, future plans, ' +
      'ability, permission, and obligation. A2 learners begin to handle multi-turn ' +
      'conversations, write short messages, and navigate real-world service contexts ' +
      '(hotels, clinics, workplaces, shops) with increasing independence.',

    entryExpectations:
      'Secure A1 exit: can use all forms of "to be", present simple affirmative, ' +
      'negative and question; uses basic prepositions, there is/are, frequency adverbs, ' +
      'and can/can\'t for requests. Vocabulary: ~500 words.',

    endOfLevelOutcomes: [
      'Use past simple (regular and common irregular verbs) for personal narratives.',
      'Use "going to" and "will" for future plans and predictions.',
      'Use modal verbs: can, can\'t, could, should, must, have to.',
      'Compare things using comparative and superlative adjectives.',
      'Write a short personal email or message (50–80 words).',
      'Describe a past experience or event in a sequence.',
      'Handle service encounters: hotel check-in, doctor\'s appointment, job interview.',
      'Understand and give multi-step directions.',
      'Use connectors: and, but, because, so, then.',
      'Ask for clarification and repetition politely.',
    ],

    units: [
      {
        code: 'A2-U1',
        title: 'Things I Did: Past Simple',
        description: 'Regular and irregular past simple for personal narratives and recent events.',
        lessons: [
          planned('A2-U1-L1', 'Yesterday I Worked — Regular Past Simple', 25, 'personal_life',
            ['past_simple_regular'], 'I can use regular past simple verbs with -ed.'),
          planned('A2-U1-L2', 'I Went, I Saw, I Had — Common Irregular Verbs', 25, 'personal_life',
            ['past_simple_irregular_group1'],
            'I can use 15 common irregular past simple forms.'),
          planned('A2-U1-L3', 'Did You …? — Past Simple Questions', 25, 'personal_life',
            ['past_simple_question'],
            'I can ask and answer past simple yes/no and Wh- questions.'),
          planned('A2-U1-L4', 'I Didn\'t … — Past Simple Negative', 25, 'personal_life',
            ['past_simple_negative'],
            'I can make negative sentences in the past simple.'),
          planned('A2-U1-L5', 'When Were You …? — Past of "to be"', 25, 'personal_life',
            ['past_be_was_were'],
            'I can use was/were for past states and descriptions.'),
          planned('A2-U1-L6', 'My Weekend: A Short Narrative', 25, 'personal_life',
            ['past_simple_regular', 'past_simple_irregular_group1', 'time_connectors'],
            'I can tell a short story about my weekend in sequence.'),
        ],
      },
      {
        code: 'A2-U2',
        title: 'Plans and Predictions: Future Language',
        description: '"Going to" for plans, "will" for spontaneous decisions and predictions.',
        lessons: [
          planned('A2-U2-L1', 'I\'m Going to … — Plans with "going to"', 25, 'personal_life',
            ['going_to_future'], 'I can talk about definite future plans.'),
          planned('A2-U2-L2', 'I\'ll Help You — Spontaneous Decisions with "will"', 25, 'personal_life',
            ['will_spontaneous'], 'I can make spontaneous offers and decisions using "will".'),
          planned('A2-U2-L3', 'It Will Be Cold — Predictions with "will"', 25, 'personal_life',
            ['will_prediction'], 'I can make simple predictions using "will".'),
          planned('A2-U2-L4', 'What Are Your Plans? — Discussing Future Arrangements', 25, 'personal_life',
            ['going_to_future', 'present_continuous_future'],
            'I can discuss future plans using "going to" and present continuous.'),
          planned('A2-U2-L5', 'Next Year I\'m Going to … — Long-term Goals', 25, 'personal_life',
            ['going_to_future', 'time_expressions_future'],
            'I can describe long-term plans and ambitions.'),
        ],
      },
      {
        code: 'A2-U3',
        title: 'Ability, Permission, and Obligation',
        description: 'Modal verbs: can, could, should, must, have to, don\'t have to.',
        lessons: [
          planned('A2-U3-L1', 'Can You …? — Ability and Permission', 25, 'work_business',
            ['modal_can_ability', 'modal_can_permission'],
            'I can use "can" for ability and "can I" for permission.'),
          planned('A2-U3-L2', 'Could You …? — Polite Requests', 25, 'work_business',
            ['modal_could_polite'], 'I can make polite requests using "could".'),
          planned('A2-U3-L3', 'You Should … — Advice', 25, 'health_wellbeing',
            ['modal_should_advice'], 'I can give and respond to advice using "should".'),
          planned('A2-U3-L4', 'You Must / You Have To — Rules and Obligations', 25, 'work_business',
            ['modal_must_obligation', 'modal_have_to'],
            'I can talk about rules and obligations.'),
          planned('A2-U3-L5', 'You Don\'t Have To — No Obligation', 25, 'work_business',
            ['modal_dont_have_to'],
            'I can distinguish "must not" (prohibition) from "don\'t have to" (no obligation).'),
        ],
      },
      {
        code: 'A2-U4',
        title: 'Comparing Things: Adjectives and Adverbs',
        description: 'Comparative and superlative adjectives; comparative adverbs.',
        lessons: [
          planned('A2-U4-L1', 'Bigger, Better, Faster — Comparative Adjectives', 25, 'food_shopping',
            ['comparative_adjectives_short'], 'I can compare two things using -er + than.'),
          planned('A2-U4-L2', 'More Expensive, More Beautiful — Long Comparative', 25, 'food_shopping',
            ['comparative_adjectives_long'], 'I can compare things using more + adjective.'),
          planned('A2-U4-L3', 'The Best, The Worst — Superlative Adjectives', 25, 'food_shopping',
            ['superlative_adjectives'], 'I can use superlatives to describe the highest degree.'),
          planned('A2-U4-L4', 'As Good As … — Equality Comparisons', 25, 'personal_life',
            ['as_adjective_as'], 'I can say two things are the same using "as … as".'),
          planned('A2-U4-L5', 'Which Is Better? — Comparing in Real Contexts', 25, 'food_shopping',
            ['comparative_adjectives_short', 'comparative_adjectives_long', 'superlative_adjectives'],
            'I can compare products and make a recommendation.'),
        ],
      },
      {
        code: 'A2-U5',
        title: 'Service Encounters: Real-World Transactions',
        description: 'Hotel, clinic, and workplace service language.',
        lessons: [
          planned('A2-U5-L1', 'Checking In: At the Hotel', 25, 'travel_transport',
            ['modal_can_permission', 'modal_could_polite', 'past_be_was_were'],
            'I can check in to a hotel and ask about facilities.'),
          planned('A2-U5-L2', 'At the Doctor\'s: Describing Symptoms', 25, 'health_wellbeing',
            ['present_simple_affirmative', 'modal_should_advice'],
            'I can describe how I feel and understand basic medical advice.'),
          planned('A2-U5-L3', 'Making an Appointment: Phone Language', 25, 'work_business',
            ['modal_could_polite', 'going_to_future'],
            'I can make, change, and cancel an appointment by phone.'),
          planned('A2-U5-L4', 'A Job Interview: Talking About Experience', 25, 'work_business',
            ['past_simple_regular', 'past_simple_irregular_group1', 'present_simple_affirmative'],
            'I can answer basic job interview questions about my experience.'),
          planned('A2-U5-L5', 'Sending a Message: Short Emails and Texts', 25, 'work_business',
            ['past_simple_regular', 'going_to_future', 'modal_could_polite'],
            'I can write a short, clear email or text message.'),
        ],
      },
      {
        code: 'A2-U6',
        title: 'Talking About the Past: Stories and Experiences',
        description: 'Connecting past events; using time expressions and sequencing language.',
        lessons: [
          planned('A2-U6-L1', 'First … Then … Finally — Sequencing a Story', 25, 'personal_life',
            ['time_connectors', 'past_simple_irregular_group1'],
            'I can tell a story in sequence using time connectors.'),
          planned('A2-U6-L2', 'Have You Ever …? — Introduction to Present Perfect', 25, 'personal_life',
            ['present_perfect_ever_never'],
            'I can use "Have you ever …?" for life experiences.'),
          planned('A2-U6-L3', 'It Was Amazing — Talking About a Past Trip', 25, 'travel_transport',
            ['past_simple_regular', 'past_be_was_were', 'time_connectors'],
            'I can describe a past journey or holiday.'),
          planned('A2-U6-L4', 'When I Was a Child … — Childhood Memories', 25, 'personal_life',
            ['past_simple_regular', 'used_to_intro'],
            'I can talk about childhood habits using past simple and "used to" (introduction).'),
          planned('A2-U6-L5', 'A2 Exit Challenge: My Story', 30, 'personal_life',
            ['past_simple_regular', 'past_simple_irregular_group1', 'going_to_future', 'modal_should_advice'],
            'I can tell a short personal story covering past, present situation, and future plans.'),
        ],
      },
    ],

    grammarProgression: [
      { order: 1,  tag: 'past_simple_regular',           title: 'Past Simple: Regular Verbs (-ed)' },
      { order: 2,  tag: 'past_simple_irregular_group1',  title: 'Past Simple: Irregular Verbs (Group 1: go/went, see/saw, have/had …)' },
      { order: 3,  tag: 'past_simple_question',          title: 'Past Simple: Did Questions' },
      { order: 4,  tag: 'past_simple_negative',          title: 'Past Simple: Didn\'t' },
      { order: 5,  tag: 'past_be_was_were',              title: 'Past of "To Be": was / were' },
      { order: 6,  tag: 'going_to_future',               title: 'Future: Going to (plans)' },
      { order: 7,  tag: 'will_spontaneous',              title: 'Future: Will (spontaneous / offers)' },
      { order: 8,  tag: 'will_prediction',               title: 'Future: Will (predictions)' },
      { order: 9,  tag: 'present_continuous_future',     title: 'Present Continuous for Future Arrangements' },
      { order: 10, tag: 'modal_can_ability',             title: 'Modal: Can for Ability' },
      { order: 11, tag: 'modal_can_permission',          title: 'Modal: Can / Could for Permission' },
      { order: 12, tag: 'modal_could_polite',            title: 'Modal: Could for Polite Requests' },
      { order: 13, tag: 'modal_should_advice',           title: 'Modal: Should for Advice' },
      { order: 14, tag: 'modal_must_obligation',         title: 'Modal: Must for Strong Obligation' },
      { order: 15, tag: 'modal_have_to',                 title: 'Modal: Have To for External Obligation' },
      { order: 16, tag: 'modal_dont_have_to',            title: 'Modal: Don\'t Have To (no obligation)' },
      { order: 17, tag: 'comparative_adjectives_short',  title: 'Comparative Adjectives: -er + than' },
      { order: 18, tag: 'comparative_adjectives_long',   title: 'Comparative Adjectives: more + adj' },
      { order: 19, tag: 'superlative_adjectives',        title: 'Superlative Adjectives: the -est / the most' },
      { order: 20, tag: 'as_adjective_as',               title: 'Equality: as … as' },
      { order: 21, tag: 'time_connectors',               title: 'Time Connectors: first, then, after that, finally' },
      { order: 22, tag: 'present_perfect_ever_never',    title: 'Present Perfect: Have you ever …? (introduction)' },
      { order: 23, tag: 'used_to_intro',                 title: 'Used To: Introduction for Past Habits' },
    ],

    vocabularyThemes: [
      'Past time expressions (yesterday, last week, ago)',
      'Common irregular past forms (30 verbs)',
      'Future time expressions (tomorrow, next week, in + year)',
      'Hotel and accommodation vocabulary',
      'Health and body vocabulary (symptoms)',
      'Work and job vocabulary',
      'Comparative language (bigger, more expensive, the best)',
      'Connectors (and, but, because, so, then, finally)',
      'Phone and digital communication phrases',
      'Travel and transport (extended)',
    ],

    languageFunctions: [
      'Narrating past events in sequence',
      'Talking about future plans and predictions',
      'Giving and responding to advice',
      'Making and responding to requests (polite forms)',
      'Expressing ability and inability',
      'Describing rules and obligations',
      'Comparing and contrasting options',
      'Handling service encounters (hotel, clinic, workplace)',
      'Making appointments by phone',
      'Writing short messages and emails',
      'Asking for clarification',
    ],

    scenarioFamilies: [
      'personal_life', 'family_friends', 'food_shopping',
      'travel_transport', 'health_wellbeing', 'work_business', 'community_public',
    ],

    assessmentCheckpoints: [
      { after: 'A2-U1', type: 'formative', label: 'Past Simple Narrative Check',
        description: 'Recount a past event using ≥ 6 sentences; include regular and irregular verbs, one question, one negative.' },
      { after: 'A2-U3', type: 'formative', label: 'Modals in Context',
        description: 'Role-play: workplace rules briefing. Use can, should, must, don\'t have to correctly in context.' },
      { after: 'A2-U5', type: 'formative', label: 'Service Encounter Role-Play',
        description: 'Complete a hotel check-in OR doctor\'s appointment role-play end-to-end.' },
      { after: 'A2-U6', type: 'summative', label: 'A2 Exit: My Story',
        description: 'Tell a 2-minute personal narrative: childhood, recent past, present, future plans. Score ≥ 80% to exit A2.' },
    ],

    reviewStrategy:
      'Irregular verb forms reviewed every 3 lessons via recognition quizzes. ' +
      'Modal verb distinctions recycled across scenarios at every unit. ' +
      'Spaced review: 1 day → 4 days → 10 days → 28 days.',

    finalChallenge:
      'A2 Personal Story: The learner records or presents a 2-minute narrative that ' +
      'covers: a past experience (past simple), their current life (present simple + modals), ' +
      'and future plans (going to / will). Must include at least one comparison. ' +
      'Assessed on grammatical range, accuracy, cohesion, and fluency.',
  };

  window.LX = window.LX || {};

  function planned(id, title, estimatedMinutes, scenarioFamily, grammarFocus, objective) {
    return {
      id: id,
      title: title,
      status: 'PLANNED',
      estimatedMinutes: estimatedMinutes || 30,
      scenarioFamily: scenarioFamily || 'work_business',
      grammarFocus: grammarFocus || [],
      objective: objective || '',
    };
  }

  /* ═══════════════════════════════════════════════════════════════
     LEVEL  B1  —  Intermediate
  ═══════════════════════════════════════════════════════════════ */
  var B1 = {
    code: 'B1',
    launchPriority: 'P1',

    levelPurpose:
      'Bridge the learner from controlled transactions to genuine independent ' +
      'communication. B1 learners begin to express opinion, give reasons, narrate ' +
      'complex events, understand the main point of extended listening and reading, ' +
      'and handle most predictable travel, work, and social situations without ' +
      'preparation.',

    entryExpectations:
      'Secure A2 exit: past simple (regular + 30 irregular), going to / will, ' +
      'core modals, comparatives, superlatives, basic connectors, short personal ' +
      'narrative. Vocabulary: ~1,200 words.',

    endOfLevelOutcomes: [
      'Use present perfect for experience, recent news, and results.',
      'Use past continuous for background/interrupted actions.',
      'Use first conditional for real/likely situations.',
      'Express opinions, agreement, disagreement, and preferences with reasons.',
      'Write a structured paragraph or short essay (100–150 words).',
      'Understand the main points of authentic texts on familiar topics.',
      'Handle unexpected problems in travel, work, and daily life.',
      'Use relative clauses to give extra information.',
      'Use a range of time clauses (when, while, before, after, until).',
      'Use reported speech for simple statements and questions.',
    ],

    units: [
      {
        code: 'B1-U1',
        title: 'Experience and News: Present Perfect',
        description: 'Present perfect for life experiences, recent events, and results; ever, never, just, already, yet.',
        lessons: [
          planned('B1-U1-L1', 'I Have Been To … — Present Perfect for Experience', 30, 'travel_transport',
            ['present_perfect_experience'], 'I can talk about life experiences using present perfect.'),
          planned('B1-U1-L2', 'Just, Already, Yet — Recent Events', 30, 'personal_life',
            ['present_perfect_just_already_yet'], 'I can use just, already, and yet with present perfect.'),
          planned('B1-U1-L3', 'Since and For — Duration to the Present', 30, 'work_business',
            ['present_perfect_since_for'], 'I can describe how long a situation has lasted using since/for.'),
          planned('B1-U1-L4', 'Present Perfect vs Past Simple', 30, 'personal_life',
            ['present_perfect_vs_past_simple'], 'I can choose correctly between present perfect and past simple.'),
          planned('B1-U1-L5', 'In the News — Present Perfect in Real Contexts', 30, 'community_public',
            ['present_perfect_experience', 'present_perfect_just_already_yet'],
            'I can discuss news headlines using present perfect naturally.'),
          planned('B1-U1-L6', 'Have You Finished? — Present Perfect in Workplace Talk', 30, 'work_business',
            ['present_perfect_since_for', 'present_perfect_just_already_yet'],
            'I can ask and answer about task completion in a workplace context.'),
        ],
      },
      {
        code: 'B1-U2',
        title: 'Telling Stories: Past Continuous and Narrative',
        description: 'Past continuous for background and interrupted action; narrative tenses combined.',
        lessons: [
          planned('B1-U2-L1', 'I Was Walking When … — Past Continuous', 30, 'personal_life',
            ['past_continuous'], 'I can describe a background action using past continuous.'),
          planned('B1-U2-L2', 'When vs While — Interrupted Actions', 30, 'personal_life',
            ['past_continuous', 'past_simple_irregular_group1'],
            'I can contrast when (sudden event) and while (ongoing action).'),
          planned('B1-U2-L3', 'A Dramatic Story: Past Simple + Past Continuous', 30, 'personal_life',
            ['past_continuous', 'past_simple_irregular_group1'],
            'I can tell a dramatic story combining both narrative tenses.'),
          planned('B1-U2-L4', 'Had Already … — Introduction to Past Perfect', 30, 'personal_life',
            ['past_perfect_intro'], 'I can use past perfect to show one past action preceded another.'),
          planned('B1-U2-L5', 'True Stories: Reading and Retelling', 30, 'personal_life',
            ['past_continuous', 'past_perfect_intro', 'time_connectors'],
            'I can read and retell a short news story using narrative tenses.'),
        ],
      },
      {
        code: 'B1-U3',
        title: 'If … Then: Conditionals',
        description: 'Zero conditional for facts; first conditional for real/likely futures.',
        lessons: [
          planned('B1-U3-L1', 'If You Heat Water … — Zero Conditional', 30, 'education_study',
            ['zero_conditional'], 'I can use zero conditional for facts and general truths.'),
          planned('B1-U3-L2', 'If I Study Hard, I Will Pass — First Conditional', 30, 'education_study',
            ['first_conditional'], 'I can make first conditional sentences for likely outcomes.'),
          planned('B1-U3-L3', 'Unless, As Long As — Conditional Variations', 30, 'work_business',
            ['conditional_unless'], 'I can use "unless" and "as long as" in conditional sentences.'),
          planned('B1-U3-L4', 'Warning Signs and Instructions — Conditionals in Context', 30, 'community_public',
            ['zero_conditional', 'first_conditional'],
            'I can read and write warning notices using conditional language.'),
          planned('B1-U3-L5', 'Problem-Solving: What Will Happen If …?', 30, 'work_business',
            ['first_conditional', 'conditional_unless'],
            'I can discuss a workplace problem using conditional reasoning.'),
        ],
      },
      {
        code: 'B1-U4',
        title: 'Opinions and Discussion',
        description: 'Expressing and justifying opinions, agreeing and disagreeing, discussing pros and cons.',
        lessons: [
          planned('B1-U4-L1', 'I Think … I Believe … — Giving Opinions', 30, 'community_public',
            ['opinion_phrases'], 'I can give my opinion on familiar topics using opinion phrases.'),
          planned('B1-U4-L2', 'I Agree / I Disagree — Arguing a Point', 30, 'community_public',
            ['agreement_disagreement'], 'I can agree and disagree politely and give reasons.'),
          planned('B1-U4-L3', 'On the One Hand … — Balanced Arguments', 30, 'education_study',
            ['contrast_connectors'], 'I can present both sides of an argument.'),
          planned('B1-U4-L4', 'Because, So, Although — Adding Reasons and Contrast', 30, 'personal_life',
            ['reason_result_contrast'], 'I can use because, so, and although to connect ideas.'),
          planned('B1-U4-L5', 'A Discussion: Is Technology Good for Us?', 30, 'technology_services',
            ['opinion_phrases', 'agreement_disagreement', 'contrast_connectors'],
            'I can take part in a structured discussion on a familiar topic.'),
        ],
      },
      {
        code: 'B1-U5',
        title: 'Giving Information: Relative Clauses',
        description: 'Defining relative clauses with who, which, that, where.',
        lessons: [
          planned('B1-U5-L1', 'The Person Who … — Relative Clauses with "who"', 30, 'personal_life',
            ['relative_clause_who'], 'I can use who to define a person.'),
          planned('B1-U5-L2', 'The Thing That … — Relative Clauses with "which/that"', 30, 'personal_life',
            ['relative_clause_which'], 'I can use which/that to define a thing.'),
          planned('B1-U5-L3', 'The Place Where … — Relative Clauses with "where"', 30, 'city_directions',
            ['relative_clause_where'], 'I can use where to define a place.'),
          planned('B1-U5-L4', 'Defining vs Non-Defining: Extra Information', 30, 'education_study',
            ['non_defining_relative_clause'], 'I can add non-essential information using commas + relative clauses.'),
          planned('B1-U5-L5', 'Writing a Description Using Relative Clauses', 30, 'personal_life',
            ['relative_clause_who', 'relative_clause_which', 'relative_clause_where'],
            'I can write a clear description of a person, thing, or place.'),
        ],
      },
      {
        code: 'B1-U6',
        title: 'Reporting What Was Said',
        description: 'Reported speech for statements, questions, and requests; backshift rules.',
        lessons: [
          planned('B1-U6-L1', 'He Said (That) … — Reported Statements', 30, 'work_business',
            ['reported_speech_statements'], 'I can report what someone said using backshift.'),
          planned('B1-U6-L2', 'She Asked If … — Reported Questions', 30, 'work_business',
            ['reported_speech_questions'], 'I can report yes/no and Wh- questions.'),
          planned('B1-U6-L3', 'He Told Me To … — Reported Commands', 30, 'work_business',
            ['reported_speech_commands'], 'I can report instructions and commands.'),
          planned('B1-U6-L4', 'Gossip and News — Reported Speech in Social Contexts', 30, 'community_public',
            ['reported_speech_statements', 'reported_speech_questions'],
            'I can pass on news or gossip accurately using reported speech.'),
          planned('B1-U6-L5', 'B1 Exit Challenge: Solve a Problem at Work', 35, 'work_business',
            ['present_perfect_since_for', 'first_conditional', 'reported_speech_statements', 'relative_clause_who'],
            'I can handle a complex workplace interaction drawing on all B1 grammar targets.'),
        ],
      },
    ],

    grammarProgression: [
      { order: 1,  tag: 'present_perfect_experience',       title: 'Present Perfect: Experience (ever/never)' },
      { order: 2,  tag: 'present_perfect_just_already_yet', title: 'Present Perfect: Just / Already / Yet' },
      { order: 3,  tag: 'present_perfect_since_for',        title: 'Present Perfect: Since / For (duration)' },
      { order: 4,  tag: 'present_perfect_vs_past_simple',   title: 'Present Perfect vs Past Simple: Contrast' },
      { order: 5,  tag: 'past_continuous',                  title: 'Past Continuous: I was -ing' },
      { order: 6,  tag: 'past_perfect_intro',               title: 'Past Perfect Introduction: had + past participle' },
      { order: 7,  tag: 'zero_conditional',                 title: 'Zero Conditional: If + present, present' },
      { order: 8,  tag: 'first_conditional',                title: 'First Conditional: If + present, will' },
      { order: 9,  tag: 'conditional_unless',               title: 'Conditional Variations: unless, as long as' },
      { order: 10, tag: 'opinion_phrases',                  title: 'Opinion Language: I think, I believe, In my view' },
      { order: 11, tag: 'agreement_disagreement',           title: 'Agreeing and Disagreeing: I agree / I\'m not sure about that' },
      { order: 12, tag: 'contrast_connectors',              title: 'Contrast Connectors: however, on the other hand, although' },
      { order: 13, tag: 'reason_result_contrast',           title: 'Linking: because, so, although' },
      { order: 14, tag: 'relative_clause_who',              title: 'Relative Clauses: who (people)' },
      { order: 15, tag: 'relative_clause_which',            title: 'Relative Clauses: which/that (things)' },
      { order: 16, tag: 'relative_clause_where',            title: 'Relative Clauses: where (places)' },
      { order: 17, tag: 'non_defining_relative_clause',     title: 'Non-Defining Relative Clauses (commas)' },
      { order: 18, tag: 'reported_speech_statements',       title: 'Reported Speech: Statements + backshift' },
      { order: 19, tag: 'reported_speech_questions',        title: 'Reported Speech: Questions (if/whether + backshift)' },
      { order: 20, tag: 'reported_speech_commands',         title: 'Reported Speech: Commands (tell + to-inf)' },
    ],

    vocabularyThemes: [
      'News and media vocabulary', 'Travel experiences',
      'Work processes and tasks', 'Problem and solution language',
      'Argument and discussion phrases', 'Opinion markers',
      'Connectors and discourse markers',
      'Technology (social media, devices)', 'Health and lifestyle',
      'Education and achievement', 'Environmental topics (entry)',
    ],

    languageFunctions: [
      'Narrating complex past events with background and main action',
      'Discussing and comparing life experiences',
      'Making and responding to conditional proposals',
      'Expressing, justifying, and defending opinions',
      'Agreeing and disagreeing politely',
      'Presenting two sides of an argument',
      'Describing people, things, and places with relative clauses',
      'Reporting conversations and news accurately',
      'Writing a structured paragraph with a clear topic sentence',
      'Handling unexpected workplace or travel problems',
    ],

    scenarioFamilies: [
      'personal_life', 'work_business', 'travel_transport',
      'community_public', 'education_study', 'technology_services', 'health_wellbeing',
    ],

    assessmentCheckpoints: [
      { after: 'B1-U2', type: 'formative', label: 'Narrative Tenses Check',
        description: 'Retell a short news story using past simple + past continuous. Minimum 8 sentences.' },
      { after: 'B1-U4', type: 'formative', label: 'Discussion Task',
        description: '3-minute discussion: give opinion, justify, respond to counterargument. Assessed on fluency and accuracy.' },
      { after: 'B1-U6', type: 'summative', label: 'B1 Exit: Workplace Problem',
        description: 'Role-play: handle a complaint, explain a situation, propose a solution. Score ≥ 80% to exit B1.' },
    ],

    reviewStrategy:
      'Present perfect recycled in every subsequent unit via news-based warm-ups. ' +
      'Reported speech revisited in B1-U6 after appearing in reading texts in U4/U5. ' +
      'Spaced review: 2 days → 7 days → 21 days → 60 days. ' +
      'Writing tasks recycled as speaking prompts in subsequent units.',

    finalChallenge:
      'B1 Workplace Problem: A three-part role-play where the learner (1) reports ' +
      'a complaint using reported speech, (2) explains what has happened using present ' +
      'perfect and narrative tenses, and (3) proposes a solution using first conditional. ' +
      'A written follow-up email (100 words) must be submitted. ' +
      'Assessed on range, accuracy, coherence, and register.',
  };

  /* ═══════════════════════════════════════════════════════════════
     LEVEL  B2  —  Upper-Intermediate
  ═══════════════════════════════════════════════════════════════ */
  var B2 = {
    code: 'B2',
    launchPriority: 'P1',

    levelPurpose:
      'Develop the ability to understand complex arguments and produce extended, ' +
      'well-structured discourse across a wide range of registers. B2 learners ' +
      'handle abstract topics, nuanced negotiation, professional writing, and ' +
      'authentic media with only occasional difficulty.',

    entryExpectations:
      'Secure B1 exit: present perfect (all uses), past continuous, first conditional, ' +
      'relative clauses, reported speech, structured paragraph writing. ' +
      'Vocabulary: ~2,500 words. Can sustain a discussion on familiar topics.',

    endOfLevelOutcomes: [
      'Use second and third conditionals for hypothetical and regret.',
      'Use passive voice across tenses confidently.',
      'Use full range of modal verbs for deduction and speculation.',
      'Produce extended writing: essays, reports, formal letters (200–250 words).',
      'Understand most authentic English media (news, podcasts, films with subtitles).',
      'Handle debate, negotiation, and formal discussion.',
      'Use cleft sentences and fronting for emphasis.',
      'Command a wide collocation network (verb-noun, adj-noun, adv-adj).',
      'Control register: formal/informal/neutral switching.',
      'Use a range of discourse markers for spoken and written cohesion.',
    ],

    units: [
      {
        code: 'B2-U1',
        title: 'Hypothetical and Regret: Conditionals 2 & 3',
        description: 'Second conditional for imaginary/hypothetical; third conditional for past regret.',
        lessons: [
          planned('B2-U1-L1', 'If I Were … — Second Conditional', 30, 'personal_life',
            ['second_conditional'], 'I can speculate about imaginary or unlikely situations.'),
          planned('B2-U1-L2', 'If I Had Known … — Third Conditional', 30, 'personal_life',
            ['third_conditional'], 'I can express regret or a different past outcome.'),
          planned('B2-U1-L3', 'Mixed Conditionals — Past Cause, Present Result', 30, 'personal_life',
            ['mixed_conditional'], 'I can use mixed conditionals for complex reasoning.'),
          planned('B2-U1-L4', 'I Wish / If Only — Expressing Regret', 30, 'personal_life',
            ['wish_if_only'], 'I can express wishes and regrets using wish + past simple/perfect.'),
          planned('B2-U1-L5', 'Hypothetical Negotiation: Business Scenario', 30, 'work_business',
            ['second_conditional', 'third_conditional', 'wish_if_only'],
            'I can negotiate using conditional reasoning in a business context.'),
        ],
      },
      {
        code: 'B2-U2',
        title: 'Passive Voice: Process and Focus',
        description: 'Passive across tenses; impersonal passive; passive with modals.',
        lessons: [
          planned('B2-U2-L1', 'It Is Made By … — Present and Past Passive', 30, 'work_business',
            ['passive_present_past'], 'I can form and use present and past passive.'),
          planned('B2-U2-L2', 'Will Be Built, Has Been Finished — Future and Perfect Passive', 30, 'work_business',
            ['passive_future_perfect'], 'I can use passive in future and perfect tenses.'),
          planned('B2-U2-L3', 'It Is Said That … — Impersonal Passive Reporting', 30, 'community_public',
            ['impersonal_passive_reporting'],
            'I can use impersonal passive to report opinions and beliefs.'),
          planned('B2-U2-L4', 'Passive with Modals: Should Be Done, Must Be Checked', 30, 'work_business',
            ['passive_with_modals'], 'I can combine modal verbs with passive voice.'),
          planned('B2-U2-L5', 'Process Writing: How Is It Made?', 30, 'work_business',
            ['passive_present_past', 'passive_future_perfect'],
            'I can write a process description using passive throughout.'),
        ],
      },
      {
        code: 'B2-U3',
        title: 'Deduction and Speculation: Advanced Modals',
        description: 'Must / can\'t / might / could / should for deduction and probability.',
        lessons: [
          planned('B2-U3-L1', 'He Must Be … — Logical Deduction (Present)', 30, 'community_public',
            ['modal_deduction_present'],
            'I can deduce the present situation using must/can\'t/might.'),
          planned('B2-U3-L2', 'He Must Have … — Deduction About the Past', 30, 'community_public',
            ['modal_deduction_past'],
            'I can speculate about past events using must have / can\'t have / might have.'),
          planned('B2-U3-L3', 'It Could Be … — Speculating About Possibilities', 30, 'community_public',
            ['modal_speculation'],
            'I can speculate using could be, may be, might have been.'),
          planned('B2-U3-L4', 'Crime Scene: Deduction Role-Play', 30, 'community_public',
            ['modal_deduction_present', 'modal_deduction_past'],
            'I can describe evidence and deduce what happened using modal language.'),
          planned('B2-U3-L5', 'Should Have / Could Have — Criticising Past Actions', 30, 'work_business',
            ['modal_should_have_could_have'],
            'I can criticise or evaluate past decisions using should have / could have.'),
        ],
      },
      {
        code: 'B2-U4',
        title: 'Register and Style: Formal vs Informal',
        description: 'Register control across formal letters, emails, and spoken contexts.',
        lessons: [
          planned('B2-U4-L1', 'Dear Sir or Madam — Formal Letter and Email', 30, 'work_business',
            ['formal_register_writing'],
            'I can write a formal letter or email using appropriate register markers.'),
          planned('B2-U4-L2', 'Abbreviations and Informality — Informal Writing', 30, 'personal_life',
            ['informal_register_writing'],
            'I can write informal messages using contractions, colloquial phrases.'),
          planned('B2-U4-L3', 'Collocations: Make, Do, Take, Have + Noun', 30, 'work_business',
            ['verb_noun_collocations'], 'I can use high-frequency verb-noun collocations correctly.'),
          planned('B2-U4-L4', 'Phrasal Verbs in Context', 30, 'personal_life',
            ['phrasal_verbs_b2'],
            'I can use 30 common phrasal verbs in appropriate contexts.'),
          planned('B2-U4-L5', 'Hedging and Boosting — Degrees of Certainty', 30, 'work_business',
            ['hedging_language', 'boosting_language'],
            'I can modify the strength of my claims using hedging and boosting language.'),
        ],
      },
      {
        code: 'B2-U5',
        title: 'Complex Sentences: Emphasis and Focus',
        description: 'Cleft sentences, fronting, inversion for emphasis.',
        lessons: [
          planned('B2-U5-L1', 'What I Need Is … — Cleft Sentences with "what"', 30, 'personal_life',
            ['cleft_sentences_what'], 'I can use cleft sentences to emphasise the most important information.'),
          planned('B2-U5-L2', 'It Is … That … — Cleft Sentences with "it"', 30, 'personal_life',
            ['cleft_sentences_it'], 'I can front the key element of a sentence using "It is … that …".'),
          planned('B2-U5-L3', 'Rarely Do I … — Inversion for Emphasis', 30, 'education_study',
            ['inversion_negative_adverbs'],
            'I can use fronted negative adverbials for strong emphasis.'),
          planned('B2-U5-L4', 'Discourse Markers: Signposting in Speech', 30, 'education_study',
            ['discourse_markers_spoken'],
            'I can use markers like firstly, in contrast, what\'s more to structure a talk.'),
          planned('B2-U5-L5', 'A Formal Presentation: Structure and Delivery', 30, 'work_business',
            ['cleft_sentences_what', 'discourse_markers_spoken', 'hedging_language'],
            'I can deliver a short formal presentation on a familiar topic.'),
        ],
      },
      {
        code: 'B2-U6',
        title: 'Writing at B2: Essays and Reports',
        description: 'Argument essay, report writing, and formal summary.',
        lessons: [
          planned('B2-U6-L1', 'For and Against: Argument Essay Structure', 30, 'education_study',
            ['argument_essay_structure'], 'I can plan and write a balanced argument essay.'),
          planned('B2-U6-L2', 'The Introduction and Thesis Statement', 30, 'education_study',
            ['thesis_statement'], 'I can write a compelling essay introduction with a clear thesis.'),
          planned('B2-U6-L3', 'Report Writing: Findings and Recommendations', 30, 'work_business',
            ['report_writing_structure'], 'I can write a formal report with headings, findings, and recommendations.'),
          planned('B2-U6-L4', 'Summarising: Main Points Without Plagiarism', 30, 'education_study',
            ['summary_writing'], 'I can summarise a text in my own words accurately.'),
          planned('B2-U6-L5', 'B2 Exit Challenge: Write and Present', 35, 'work_business',
            ['argument_essay_structure', 'passive_present_past', 'second_conditional', 'discourse_markers_spoken'],
            'I can write a 200-word argument essay and present its key points formally.'),
        ],
      },
    ],

    grammarProgression: [
      { order: 1,  tag: 'second_conditional',               title: 'Second Conditional: If + past simple, would' },
      { order: 2,  tag: 'third_conditional',                title: 'Third Conditional: If + past perfect, would have' },
      { order: 3,  tag: 'mixed_conditional',                title: 'Mixed Conditionals' },
      { order: 4,  tag: 'wish_if_only',                     title: 'Wish / If Only for Regret and Desire' },
      { order: 5,  tag: 'passive_present_past',             title: 'Passive Voice: Present and Past Simple' },
      { order: 6,  tag: 'passive_future_perfect',           title: 'Passive Voice: Future and Present Perfect' },
      { order: 7,  tag: 'impersonal_passive_reporting',     title: 'Impersonal Passive Reporting: It is said that …' },
      { order: 8,  tag: 'passive_with_modals',              title: 'Passive with Modals: should be, must be' },
      { order: 9,  tag: 'modal_deduction_present',          title: 'Modals of Deduction: Present (must/can\'t/might be)' },
      { order: 10, tag: 'modal_deduction_past',             title: 'Modals of Deduction: Past (must have/can\'t have)' },
      { order: 11, tag: 'modal_speculation',                title: 'Modals of Speculation: could/may/might' },
      { order: 12, tag: 'modal_should_have_could_have',     title: 'Regret Modals: should have / could have' },
      { order: 13, tag: 'formal_register_writing',          title: 'Formal Register: Letters, Emails' },
      { order: 14, tag: 'informal_register_writing',        title: 'Informal Register: Texts, Messages' },
      { order: 15, tag: 'verb_noun_collocations',           title: 'Verb-Noun Collocations: make/do/take/have + noun' },
      { order: 16, tag: 'phrasal_verbs_b2',                 title: 'Phrasal Verbs (B2 set: 30 items)' },
      { order: 17, tag: 'hedging_language',                 title: 'Hedging: apparently, it seems, I tend to think' },
      { order: 18, tag: 'cleft_sentences_what',             title: 'Cleft Sentences: What I … is …' },
      { order: 19, tag: 'cleft_sentences_it',               title: 'Cleft Sentences: It is … that …' },
      { order: 20, tag: 'inversion_negative_adverbs',       title: 'Inversion: Rarely do I …, Never have I …' },
      { order: 21, tag: 'discourse_markers_spoken',         title: 'Discourse Markers: Spoken signposting' },
      { order: 22, tag: 'argument_essay_structure',         title: 'Argument Essay: Structure and Language' },
      { order: 23, tag: 'report_writing_structure',         title: 'Report Writing: Headings, Findings, Recommendations' },
    ],

    vocabularyThemes: [
      'Business and professional language', 'Academic vocabulary (AWL subset)',
      'Media and news language', 'Environmental and social issues',
      'Technology and digital society', 'Crime and justice',
      'Health and science', 'Collocation networks (verb-noun, adj-noun)',
      'Phrasal verbs in context', 'Discourse and argumentation vocabulary',
    ],

    languageFunctions: [
      'Speculating about hypothetical and counterfactual situations',
      'Expressing regret and criticism of past actions',
      'Describing processes and procedures using passive',
      'Reporting claims and beliefs impersonally',
      'Deducing and speculating with evidence',
      'Writing formal letters, emails, essays, and reports',
      'Presenting information formally with discourse markers',
      'Negotiating and persuading in professional contexts',
      'Controlling register across formal/informal contexts',
      'Emphasising key information using cleft structures',
    ],

    scenarioFamilies: [
      'work_business', 'education_study', 'community_public',
      'technology_services', 'personal_life', 'health_wellbeing',
    ],

    assessmentCheckpoints: [
      { after: 'B2-U2', type: 'formative', label: 'Passive Process Report',
        description: 'Write a 100-word process description using passive voice throughout.' },
      { after: 'B2-U4', type: 'formative', label: 'Register Awareness Task',
        description: 'Rewrite the same message in formal and informal register. Compare and justify choices.' },
      { after: 'B2-U6', type: 'summative', label: 'B2 Exit: Write and Present',
        description: 'Submit a 200-word argument essay and deliver a 3-minute formal presentation. Score ≥ 80% to exit B2.' },
    ],

    reviewStrategy:
      'Conditionals recycled through deduction and speculation units. ' +
      'Passive voice embedded in all writing tasks from U2 onwards. ' +
      'Vocabulary review: collocation maps revised every 2 units. ' +
      'Spaced review: 3 days → 10 days → 30 days → 90 days.',

    finalChallenge:
      'B2 Write and Present: The learner writes a 200-word argument essay on a ' +
      'topical issue (e.g. remote work, AI in education) and delivers a 3-minute ' +
      'formal presentation covering introduction, key arguments, and recommendation. ' +
      'Must use: passive, conditional (2nd or 3rd), modal deduction, cleft or ' +
      'inversion for emphasis, and appropriate discourse markers. ' +
      'Peer-assessed using a structured rubric.',
  };

  /* ═══════════════════════════════════════════════════════════════
     LEVEL  C1  —  Advanced
  ═══════════════════════════════════════════════════════════════ */
  var C1 = {
    code: 'C1',
    launchPriority: 'P2',

    levelPurpose:
      'Develop near-native fluency and stylistic control across professional and ' +
      'academic registers. C1 learners handle implicit meaning, manage interaction ' +
      'with authority and tact, and produce sophisticated, cohesive written and ' +
      'spoken discourse. Grammar is largely automatic; focus shifts to idiom, ' +
      'collocation depth, and pragmatic precision.',

    entryExpectations:
      'Secure B2 exit: full conditional range, passive across tenses, modal deduction, ' +
      'cleft sentences, argument essay writing. Vocabulary: ~5,000 words. ' +
      'Can present formally and write a structured essay.',

    endOfLevelOutcomes: [
      'Use advanced grammar: subjunctive, inversion, ellipsis, substitution.',
      'Command an extensive collocation network including idioms and fixed phrases.',
      'Write academic and professional documents of high quality (reports, proposals, reviews).',
      'Understand implicit meaning, irony, and register shifts in authentic input.',
      'Manage long, complex interactions: negotiation, persuasion, facilitation.',
      'Control cohesion through a wide range of referencing and linking devices.',
      'Demonstrate awareness of stylistic and pragmatic choices.',
      'Handle highly specialised vocabulary in at least one professional domain.',
    ],

    units: [
      {
        code: 'C1-U1',
        title: 'Advanced Grammar: Subjunctive, Inversion, Ellipsis',
        description: 'Formal and literary grammar structures for advanced writing and speech.',
        lessons: [
          planned('C1-U1-L1', 'It Is Essential That He Be … — The Subjunctive', 35, 'education_study',
            ['subjunctive_formal'],
            'I can use the formal subjunctive in recommendations and requirements.'),
          planned('C1-U1-L2', 'Not Only Did He … — Advanced Inversion', 35, 'education_study',
            ['inversion_advanced'],
            'I can use a range of inverted structures for emphasis and formality.'),
          planned('C1-U1-L3', 'She Can, and So Can I — Ellipsis and Substitution', 35, 'personal_life',
            ['ellipsis_substitution'],
            'I can avoid repetition using ellipsis, so, do so, and one(s).'),
          planned('C1-U1-L4', 'Nominalisation: Turning Verbs into Nouns', 35, 'work_business',
            ['nominalisation'],
            'I can use nominalisation to create formal, concise academic prose.'),
          planned('C1-U1-L5', 'Complex Sentences in Academic Writing', 35, 'education_study',
            ['subjunctive_formal', 'nominalisation', 'ellipsis_substitution'],
            'I can apply advanced grammar in a paragraph of academic writing.'),
        ],
      },
      {
        code: 'C1-U2',
        title: 'Idioms, Collocation, and Lexical Precision',
        description: 'High-frequency idioms, multi-word verbs, and fine-grained word choice.',
        lessons: [
          planned('C1-U2-L1', 'At the Drop of a Hat — Idioms of Time and Speed', 35, 'personal_life',
            ['idioms_time_speed'], 'I can understand and use 15 time/speed idioms naturally.'),
          planned('C1-U2-L2', 'Break New Ground — Idioms of Progress and Change', 35, 'work_business',
            ['idioms_progress_change'], 'I can use 15 idioms relating to progress and innovation.'),
          planned('C1-U2-L3', 'Fine-Grained Word Choice: Synonyms and Near-Synonyms', 35, 'education_study',
            ['lexical_precision'],
            'I can choose between near-synonyms based on connotation and register.'),
          planned('C1-U2-L4', 'Collocations in Academic English', 35, 'education_study',
            ['academic_collocations'],
            'I can use key academic collocations: conduct research, draw conclusions, raise awareness.'),
          planned('C1-U2-L5', 'Complex Multi-Word Verbs at C1', 35, 'work_business',
            ['multi_word_verbs_c1'],
            'I can use complex multi-word verbs accurately in professional contexts.'),
        ],
      },
      {
        code: 'C1-U3',
        title: 'Managing Interaction: Discourse and Pragmatics',
        description: 'Turn-taking, interruption, hedging, implicature, and managing difficult conversations.',
        lessons: [
          planned('C1-U3-L1', 'Can I Just Say … — Interrupting and Turn-Taking', 35, 'work_business',
            ['turn_taking_interruption'],
            'I can interrupt politely and regain the floor in formal discussions.'),
          planned('C1-U3-L2', 'With Respect … — Tactful Disagreement', 35, 'work_business',
            ['tactful_disagreement'],
            'I can challenge and disagree diplomatically using hedged language.'),
          planned('C1-U3-L3', 'Reading Between the Lines — Implicature and Implicit Meaning', 35, 'community_public',
            ['implicature_pragmatics'],
            'I can infer unstated meaning and respond to implication.'),
          planned('C1-U3-L4', 'Facilitation Language: Managing a Meeting', 35, 'work_business',
            ['facilitation_language'],
            'I can chair a discussion, invite contributions, and summarise.'),
          planned('C1-U3-L5', 'Persuasion and Influence: A Negotiation', 35, 'work_business',
            ['persuasion_language', 'tactful_disagreement'],
            'I can persuade, concede, and reach agreement in a complex negotiation.'),
        ],
      },
      {
        code: 'C1-U4',
        title: 'Academic and Professional Writing',
        description: 'Proposals, literature reviews, reports of research, and critical reviews.',
        lessons: [
          planned('C1-U4-L1', 'Writing a Proposal: Aims and Rationale', 35, 'education_study',
            ['proposal_writing'], 'I can write a formal project proposal with clear aims and justification.'),
          planned('C1-U4-L2', 'Critical Review: Evaluating an Argument', 35, 'education_study',
            ['critical_review_writing'],
            'I can write a balanced critical review assessing strengths and weaknesses.'),
          planned('C1-U4-L3', 'Hedging in Academic Writing', 35, 'education_study',
            ['academic_hedging'],
            'I can hedge claims appropriately using modal verbs, adverbs, and reporting verbs.'),
          planned('C1-U4-L4', 'Concision: Saying More With Fewer Words', 35, 'work_business',
            ['nominalisation', 'ellipsis_substitution'],
            'I can reduce wordiness using nominalisation, ellipsis, and parallel structure.'),
          planned('C1-U4-L5', 'C1 Exit Challenge: Write a Professional Report', 40, 'work_business',
            ['report_writing_structure', 'passive_present_past', 'academic_hedging', 'nominalisation'],
            'I can produce a 300-word professional report that meets C1 quality standards.'),
        ],
      },
    ],

    grammarProgression: [
      { order: 1,  tag: 'subjunctive_formal',       title: 'The Formal Subjunctive: It is vital that he be …' },
      { order: 2,  tag: 'inversion_advanced',        title: 'Advanced Inversion: Not only … / Seldom … / No sooner …' },
      { order: 3,  tag: 'ellipsis_substitution',     title: 'Ellipsis and Substitution: so, do so, one(s), not' },
      { order: 4,  tag: 'nominalisation',            title: 'Nominalisation: the + verb → noun' },
      { order: 5,  tag: 'idioms_time_speed',         title: 'Idioms: Time and Speed' },
      { order: 6,  tag: 'idioms_progress_change',    title: 'Idioms: Progress and Change' },
      { order: 7,  tag: 'lexical_precision',         title: 'Lexical Precision: Near-Synonyms and Connotation' },
      { order: 8,  tag: 'academic_collocations',     title: 'Academic Collocations (AWL + discipline-specific)' },
      { order: 9,  tag: 'multi_word_verbs_c1',       title: 'Complex Multi-Word Verbs (C1 set)' },
      { order: 10, tag: 'turn_taking_interruption',  title: 'Discourse Management: Turn-Taking and Interruption' },
      { order: 11, tag: 'tactful_disagreement',      title: 'Pragmatics: Tactful Disagreement and Challenge' },
      { order: 12, tag: 'implicature_pragmatics',    title: 'Pragmatics: Implicature and Implicit Meaning' },
      { order: 13, tag: 'facilitation_language',     title: 'Discourse: Facilitation and Chairing Language' },
      { order: 14, tag: 'persuasion_language',       title: 'Persuasion and Concession Language' },
      { order: 15, tag: 'proposal_writing',          title: 'Writing: Proposals and Rationale' },
      { order: 16, tag: 'critical_review_writing',   title: 'Writing: Critical Reviews' },
      { order: 17, tag: 'academic_hedging',          title: 'Academic Hedging: Modal Verbs, Reporting Verbs, Adverbs' },
    ],

    vocabularyThemes: [
      'Idioms (60+ items across topic families)',
      'Academic Word List (AWL) — Sublist 1–5',
      'Professional domain vocabulary (one specialisation)',
      'Collocations: academic and professional',
      'Discourse and argumentation markers (extended)',
      'Nuance vocabulary: near-synonyms and connotation',
      'Pragmatic vocabulary: hedging, boosting, softening',
      'Cultural reference and irony awareness',
    ],

    languageFunctions: [
      'Managing complex professional and academic interactions',
      'Interrupting, regaining the floor, and facilitating meetings',
      'Expressing implicit and indirect meaning',
      'Persuading and conceding in negotiation',
      'Writing proposals, critical reviews, and professional reports',
      'Hedging claims in academic and professional writing',
      'Using idioms naturally in context',
      'Achieving precision through word choice and collocation',
      'Demonstrating awareness of register and pragmatic appropriateness',
    ],

    scenarioFamilies: [
      'work_business', 'education_study', 'community_public',
      'technology_services', 'personal_life',
    ],

    assessmentCheckpoints: [
      { after: 'C1-U2', type: 'formative', label: 'Lexical Range Test',
        description: 'Produce a 150-word text on a professional topic using ≥ 10 academic collocations and ≥ 3 idioms correctly.' },
      { after: 'C1-U3', type: 'formative', label: 'Negotiation Simulation',
        description: '10-minute negotiation role-play: assessed on discourse management, tactfulness, and persuasion.' },
      { after: 'C1-U4', type: 'summative', label: 'C1 Exit: Professional Report',
        description: 'Write a 300-word professional report. Score ≥ 80% on range, accuracy, register, and cohesion to exit C1.' },
    ],

    reviewStrategy:
      'Idioms recycled across all units via extended reading texts. ' +
      'Grammar accuracy maintained through editing tasks (find and fix 10 errors). ' +
      'Vocabulary depth: collocations retested in new topic domains every unit. ' +
      'Spaced review: 5 days → 15 days → 45 days → 120 days.',

    finalChallenge:
      'C1 Professional Report: A 300-word formal report responding to a scenario ' +
      '(e.g. evaluate a new company policy). Must demonstrate: formal register throughout, ' +
      'passive voice, nominalisation, academic hedging, at least one idiom used naturally, ' +
      'and a clear recommendation section. Marked by a trained assessor or AI rubric.',
  };

  /* ═══════════════════════════════════════════════════════════════
     LEVEL  C2  —  Mastery
  ═══════════════════════════════════════════════════════════════ */
  var C2 = {
    code: 'C2',
    launchPriority: 'P2',

    levelPurpose:
      'Achieve complete operational mastery equivalent to a highly educated native ' +
      'speaker. C2 work focuses on stylistic nuance, rhetorical artistry, cultural ' +
      'depth, and the ability to exploit all registers and genres with complete ' +
      'accuracy and native-like appropriateness. Errors are rare and self-corrected.',

    entryExpectations:
      'Secure C1 exit: advanced grammar (subjunctive, inversion, ellipsis, nominalisation), ' +
      'idiom and collocation mastery, professional report writing, facilitation language. ' +
      'Vocabulary: ~8,000+ words. Can handle virtually any interaction without difficulty.',

    endOfLevelOutcomes: [
      'Exploit the full stylistic and rhetorical range of English.',
      'Demonstrate near-native command of all registers (legal, academic, literary, conversational).',
      'Use a complete range of cohesive devices with no systemic gaps.',
      'Understand and produce ambiguity, irony, humour, and allusion.',
      'Write at a publishable academic or professional standard.',
      'Adapt instantly to unfamiliar topics, genres, and audiences.',
      'Self-monitor and self-correct instantly at the level of pragmatic appropriateness.',
      'Demonstrate awareness of English as a global and pluricentric language.',
    ],

    units: [
      {
        code: 'C2-U1',
        title: 'Style and Register: Mastery of the Full Range',
        description: 'Literary, legal, journalistic, and conversational styles; code-switching.',
        lessons: [
          planned('C2-U1-L1', 'The Legal Register: Contracts, Clauses, and Conditions', 40, 'work_business',
            ['legal_register'], 'I can understand and produce text in formal legal English.'),
          planned('C2-U1-L2', 'The Literary Register: Imagery, Metaphor, and Tone', 40, 'education_study',
            ['literary_register'], 'I can analyse and reproduce literary style using imagery and figurative language.'),
          planned('C2-U1-L3', 'Journalistic English: Headlines, Leads, and Attribution', 40, 'community_public',
            ['journalistic_register'], 'I can write and analyse English news texts across broadsheet and tabloid styles.'),
          planned('C2-U1-L4', 'Code-Switching: Adapting to Audience Instantly', 40, 'personal_life',
            ['code_switching'], 'I can switch seamlessly between formal and informal registers mid-interaction.'),
          planned('C2-U1-L5', 'Register Portfolio: One Topic, Four Registers', 40, 'education_study',
            ['legal_register', 'literary_register', 'journalistic_register', 'code_switching'],
            'I can write the same message in four distinct registers and justify each.'),
        ],
      },
      {
        code: 'C2-U2',
        title: 'Rhetoric and Persuasion at the Highest Level',
        description: 'Classical rhetorical devices: ethos, pathos, logos; anaphora, tricolon, chiasmus.',
        lessons: [
          planned('C2-U2-L1', 'Ethos, Pathos, Logos — The Three Pillars of Rhetoric', 40, 'education_study',
            ['rhetorical_appeals'], 'I can identify and use all three Aristotelian appeals strategically.'),
          planned('C2-U2-L2', 'Anaphora and Tricolon — Rhythm in Persuasion', 40, 'community_public',
            ['rhetorical_devices_repetition'],
            'I can use anaphora, tricolon, and other repetition devices for powerful effect.'),
          planned('C2-U2-L3', 'Irony, Sarcasm, and Understatement', 40, 'personal_life',
            ['irony_understatement'],
            'I can produce and interpret irony, sarcasm, and understatement accurately.'),
          planned('C2-U2-L4', 'A Political Speech: Writing for Impact', 40, 'community_public',
            ['rhetorical_appeals', 'rhetorical_devices_repetition'],
            'I can write a persuasive speech that deploys multiple rhetorical devices.'),
          planned('C2-U2-L5', 'Cultural Allusion and Shared Reference', 40, 'education_study',
            ['cultural_allusion'],
            'I can understand and exploit cultural allusions in English speech and writing.'),
        ],
      },
      {
        code: 'C2-U3',
        title: 'Ambiguity, Humour, and Pragmatic Mastery',
        description: 'Puns, double meanings, dark humour, comic timing, and pragmatic subtlety.',
        lessons: [
          planned('C2-U3-L1', 'Puns and Wordplay: How English Exploits Ambiguity', 40, 'personal_life',
            ['wordplay_puns'], 'I can understand and create English wordplay and puns.'),
          planned('C2-U3-L2', 'Dark Humour and Taboo Topics', 40, 'personal_life',
            ['dark_humour_pragmatics'],
            'I can recognise the pragmatic boundaries of humour across cultural contexts.'),
          planned('C2-U3-L3', 'Saying One Thing, Meaning Another: Irony in Depth', 40, 'personal_life',
            ['irony_understatement', 'implicature_pragmatics'],
            'I can produce extended ironic discourse and interpret layered implication.'),
          planned('C2-U3-L4', 'Face-Threatening Acts and Politeness Theory', 40, 'work_business',
            ['politeness_theory'],
            'I can identify and manage face-threatening acts in professional and social interaction.'),
          planned('C2-U3-L5', 'C2 Capstone Presentation: The Art of English', 45, 'education_study',
            ['rhetorical_appeals', 'irony_understatement', 'code_switching', 'cultural_allusion'],
            'I can deliver a polished, stylistically rich presentation on a topic of my choice.'),
        ],
      },
      {
        code: 'C2-U4',
        title: 'Academic Mastery: Publishing-Quality Writing',
        description: 'Research writing, peer-review language, abstract writing, and academic integrity.',
        lessons: [
          planned('C2-U4-L1', 'The Abstract: Maximum Information in Minimum Space', 40, 'education_study',
            ['abstract_writing'], 'I can write a concise, complete academic abstract.'),
          planned('C2-U4-L2', 'Literature Review Language: Synthesis and Critique', 40, 'education_study',
            ['literature_review_writing'],
            'I can synthesise multiple sources into a coherent, critically evaluative literature review.'),
          planned('C2-U4-L3', 'Paraphrase and Avoidance of Plagiarism', 40, 'education_study',
            ['academic_paraphrase'],
            'I can paraphrase and integrate sources at publishable academic standard.'),
          planned('C2-U4-L4', 'Peer Review: Giving and Receiving Critical Feedback', 40, 'education_study',
            ['peer_review_language'],
            'I can write and respond to formal academic peer review using discipline-appropriate language.'),
          planned('C2-U4-L5', 'C2 Final Challenge: A Publishable Mini-Essay', 50, 'education_study',
            ['nominalisation', 'academic_hedging', 'rhetorical_appeals', 'literature_review_writing'],
            'I can write a 400-word essay that meets publishable academic standards.'),
        ],
      },
    ],

    grammarProgression: [
      { order: 1,  tag: 'legal_register',               title: 'Legal English: Shall, Herein, Notwithstanding' },
      { order: 2,  tag: 'literary_register',            title: 'Literary Style: Imagery, Metaphor, Free Indirect Style' },
      { order: 3,  tag: 'journalistic_register',        title: 'Journalistic English: Headline Grammar, Attribution' },
      { order: 4,  tag: 'code_switching',               title: 'Code-Switching: Register Control on Demand' },
      { order: 5,  tag: 'rhetorical_appeals',           title: 'Rhetoric: Ethos, Pathos, Logos' },
      { order: 6,  tag: 'rhetorical_devices_repetition',title: 'Rhetorical Devices: Anaphora, Tricolon, Chiasmus' },
      { order: 7,  tag: 'irony_understatement',         title: 'Pragmatics: Irony, Understatement, Banter' },
      { order: 8,  tag: 'wordplay_puns',                title: 'Wordplay: Puns, Ambiguity, Homophones in Context' },
      { order: 9,  tag: 'dark_humour_pragmatics',       title: 'Dark Humour and Cultural Boundaries' },
      { order: 10, tag: 'cultural_allusion',            title: 'Cultural Allusion: Literature, History, Pop Culture' },
      { order: 11, tag: 'politeness_theory',            title: 'Politeness Theory: Face, Positive/Negative Face' },
      { order: 12, tag: 'abstract_writing',             title: 'Abstract Writing: IMRaD Summary Format' },
      { order: 13, tag: 'literature_review_writing',    title: 'Literature Review: Synthesis and Critical Stance' },
      { order: 14, tag: 'academic_paraphrase',          title: 'Academic Paraphrase and Source Integration' },
      { order: 15, tag: 'peer_review_language',         title: 'Peer Review Language and Academic Diplomacy' },
    ],

    vocabularyThemes: [
      'Legal English vocabulary',
      'Literary and rhetorical terminology',
      'Journalistic English conventions',
      'Idioms and allusion (advanced: 100+ items)',
      'Academic vocabulary (AWL Sublist 6–10 + discipline-specific)',
      'Pragmatic vocabulary: hedging, face-work, indirection',
      'Humour and irony meta-language',
      'Cultural reference: literature, history, politics, pop culture',
    ],

    languageFunctions: [
      'Writing and interpreting legal-register text',
      'Producing literary and journalistic prose',
      'Code-switching on demand between four registers',
      'Deploying classical rhetorical devices for persuasion',
      'Understanding and producing irony, sarcasm, and understatement',
      'Writing publishable academic abstracts, literature reviews, and essays',
      'Providing and responding to peer review',
      'Managing politeness and face-threat in any professional context',
      'Exploiting cultural allusion and shared reference',
    ],

    scenarioFamilies: [
      'work_business', 'education_study', 'community_public',
      'personal_life', 'technology_services',
    ],

    assessmentCheckpoints: [
      { after: 'C2-U2', type: 'formative', label: 'Rhetorical Speech Analysis',
        description: 'Analyse a famous speech for rhetorical devices and deliver a 2-minute persuasive response using the same techniques.' },
      { after: 'C2-U3', type: 'formative', label: 'Pragmatic Awareness Test',
        description: 'Interpret 10 ambiguous or ironic exchanges and explain the intended meaning and pragmatic function.' },
      { after: 'C2-U4', type: 'summative', label: 'C2 Final: Publishable Mini-Essay',
        description: 'Write a 400-word essay meeting publishable academic standards. Blind peer-reviewed. Score ≥ 85% to achieve C2.' },
    ],

    reviewStrategy:
      'At C2, spaced review focuses on maintaining breadth: idiom, collocation, and ' +
      'register are revisited through extensive reading across authentic genres. ' +
      'Weekly: read one authentic text + annotate for stylistic features. ' +
      'Spaced review: 7 days → 30 days → 90 days → annual.',

    finalChallenge:
      'C2 Publishable Mini-Essay: A 400-word essay on a topic of the learner\'s choice. ' +
      'Must demonstrate: a distinct thesis, integrated source references, academic hedging, ' +
      'at least one rhetorical device, nominalisation, and a register sustained throughout. ' +
      'Blind peer-reviewed by two other C2 learners using an academic rubric. ' +
      'Passing score qualifies the learner for a Mastery certificate.',
  };

  /* ─────────────────────────────────────────────
     FULL LEVELS MAP
     A0 / A1 / A2 are declared earlier in this same IIFE scope.
     B1 / B2 / C1 / C2 are declared immediately above.
  ───────────────────────────────────────────── */
  var levels = {
    A0: A0,
    A1: A1,
    A2: A2,
    B1: B1,
    B2: B2,
    C1: C1,
    C2: C2,
  };

  /* ─────────────────────────────────────────────
     COUNT HELPERS
  ───────────────────────────────────────────── */

  /** Flatten all lesson stubs from a single level */
  function getLessonsForLevel(level) {
    var lessons = [];
    (level.units || []).forEach(function (unit) {
      (unit.lessons || []).forEach(function (lesson) {
        lessons.push(lesson);
      });
    });
    return lessons;
  }

  /** Build summary counts across all levels */
  function buildCounts() {
    var counts = {
      byLevel: {},
      byPriority: { P0: 0, P1: 0, P2: 0 },
      totalLessons: 0,
      totalUnits: 0,
      published: 0,
      planned: 0,
    };

    Object.keys(levels).forEach(function (code) {
      var lvl = levels[code];
      var lessons = getLessonsForLevel(lvl);
      var unitCount = (lvl.units || []).length;
      var publishedCount = lessons.filter(function (l) { return l.status === 'PUBLISHED'; }).length;
      var plannedCount   = lessons.filter(function (l) { return l.status === 'PLANNED';   }).length;

      counts.byLevel[code] = {
        units:     unitCount,
        lessons:   lessons.length,
        published: publishedCount,
        planned:   plannedCount,
        priority:  lvl.launchPriority,
      };

      counts.totalUnits   += unitCount;
      counts.totalLessons += lessons.length;
      counts.published    += publishedCount;
      counts.planned      += plannedCount;

      var p = lvl.launchPriority;
      if (counts.byPriority[p] !== undefined) {
        counts.byPriority[p] += lessons.length;
      }
    });

    return counts;
  }

  /* ─────────────────────────────────────────────
     LOOKUP HELPERS
  ───────────────────────────────────────────── */

  /** Return a lesson stub by ID (searches all levels) */
  function getLessonById(id) {
    var result = null;
    Object.keys(levels).some(function (code) {
      getLessonsForLevel(levels[code]).some(function (lesson) {
        if (lesson.id === id) { result = lesson; return true; }
        return false;
      });
      return !!result;
    });
    return result;
  }

  /** Return all lessons for a level code (flat array) */
  function getLessonsByLevel(code) {
    return levels[code] ? getLessonsForLevel(levels[code]) : [];
  }

  /** Return all lessons for a unit code */
  function getLessonsByUnit(unitCode) {
    var result = [];
    Object.keys(levels).forEach(function (code) {
      (levels[code].units || []).forEach(function (unit) {
        if (unit.code === unitCode) {
          result = result.concat(unit.lessons || []);
        }
      });
    });
    return result;
  }

  /** Return all published lessons */
  function getPublishedLessons() {
    var result = [];
    Object.keys(levels).forEach(function (code) {
      getLessonsForLevel(levels[code]).forEach(function (lesson) {
        if (lesson.status === 'PUBLISHED') result.push(lesson);
      });
    });
    return result;
  }

  /* ─────────────────────────────────────────────
     FINAL EXPORT — window.LX.curriculum
  ───────────────────────────────────────────── */
  window.LX.curriculum = {
    version: '2.0.0',
    phase: 'Phase 2 — Batch 1',
    generatedAt: '2024-09',

    /* The canonical levels map */
    levels: levels,

    /* Pre-built counts (recomputed on init) */
    counts: buildCounts(),

    /* Public API */
    getLessonById:      getLessonById,
    getLessonsByLevel:  getLessonsByLevel,
    getLessonsByUnit:   getLessonsByUnit,
    getPublishedLessons: getPublishedLessons,

    /* CEFR level order for iteration */
    LEVEL_ORDER: ['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
  };

  /* Convenience log (dev only — remove in production) */
  if (typeof console !== 'undefined' && console.log) {
    var c = window.LX.curriculum.counts;
    console.log(
      '[LinguaX Curriculum] Loaded Phase 2 Batch 1 — ' +
      c.totalLessons + ' lessons across ' + c.totalUnits + ' units | ' +
      'Published: ' + c.published + ' | Planned: ' + c.planned + ' | ' +
      'P0: ' + c.byPriority.P0 + ' P1: ' + c.byPriority.P1 + ' P2: ' + c.byPriority.P2
    );
  }


})();
