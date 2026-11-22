export interface CurriculumLesson {
  id: string;
  title: string;
  summary: string;
  exercise: string;
}

export interface BuilderModuleDef {
  key: string;
  index: string;
  title: string;
  track: 'Engineering' | 'Systems' | 'Enterprise';
  overview: string;
  lessons: CurriculumLesson[];
}

export const BUILDER_CURRICULUM: BuilderModuleDef[] = [
  {
    key: 'html',
    index: '01',
    title: 'HTML',
    track: 'Engineering',
    overview: 'Semantic document structure, accessibility landmarks, forms, and clean markup.',
    lessons: [
      { id: 'html_1', title: 'Document Anatomy & Landmarks', summary: 'Understand header, nav, main, article, section, and footer semantics.', exercise: 'Build a valid semantic profile page using zero div wrappers for landmarks.' },
      { id: 'html_2', title: 'Forms, Labels & Validation', summary: 'Accessible inputs, fieldsets, native validation attributes, and keyboard focus.', exercise: 'Create a registration form with accessible labels and required constraints.' },
      { id: 'html_3', title: 'Tables, Media & Metadata', summary: 'Structured tabular data, responsive picture tags, and OpenGraph meta.', exercise: 'Author a financial ledger table with thead, tbody, scope, and caption.' },
      { id: 'html_4', title: 'ARIA & Screen Reader Basics', summary: 'When native HTML suffices and how to label interactive controls responsibly.', exercise: 'Audit an existing page and verify every button and link has clear accessible names.' },
    ],
  },
  {
    key: 'css',
    index: '02',
    title: 'CSS',
    track: 'Engineering',
    overview: 'Box model mastery, Flexbox, Grid, responsive typography, and design systems.',
    lessons: [
      { id: 'css_1', title: 'Box Model & Cascade Specificity', summary: 'Padding, border, margin, box-sizing, and predictable specificity.', exercise: 'Rebuild a multi-card layout with consistent spacing tokens and zero margin collapse bugs.' },
      { id: 'css_2', title: 'Flexbox & Alignment Discipline', summary: 'One-dimensional layout flows, gap, shrink/grow rules, and wrapping.', exercise: 'Construct a responsive 3-zone navigation bar that collapses cleanly on mobile.' },
      { id: 'css_3', title: 'CSS Grid & Responsive Tracks', summary: 'Two-dimensional grids, minmax(), auto-fit, and named areas.', exercise: 'Design a 12-column dashboard grid adapting from 1 column on mobile to 3 on desktop.' },
      { id: 'css_4', title: 'Custom Properties & Motion Restraint', summary: 'CSS variables for themes, dark/light tokens, and prefers-reduced-motion.', exercise: 'Implement a dark/light token sheet using :root custom properties.' },
    ],
  },
  {
    key: 'javascript',
    index: '03',
    title: 'JavaScript',
    track: 'Engineering',
    overview: 'Core language mechanics, closures, async/await, DOM APIs, and clean state.',
    lessons: [
      { id: 'js_1', title: 'Types, Scope & Closures', summary: 'Lexical scope, const/let discipline, pure functions, and closures.', exercise: 'Write a counter and rate-limiter factory function using closures.' },
      { id: 'js_2', title: 'Arrays, Objects & Immutability', summary: 'Map, filter, reduce, destructuring, and immutable state updates.', exercise: 'Transform an array of expense records into monthly category totals without mutating inputs.' },
      { id: 'js_3', title: 'Promises, Async/Await & Fetch', summary: 'Event loop fundamentals, error handling with try/catch, and HTTP requests.', exercise: 'Fetch JSON data with timeout handling and render clear loading/error states.' },
      { id: 'js_4', title: 'DOM Events & Modular Code', summary: 'Event delegation, ES modules, and separating logic from rendering.', exercise: 'Create an interactive keyboard-navigable checklist module in vanilla JS.' },
    ],
  },
  {
    key: 'python',
    index: '04',
    title: 'Python',
    track: 'Engineering',
    overview: 'Clean syntax, data structures, scripting automation, OOP, and problem solving.',
    lessons: [
      { id: 'py_1', title: 'Data Structures & Comprehensions', summary: 'Lists, dicts, sets, tuples, and readable list/dict comprehensions.', exercise: 'Write a script that deduplicates and ranks word frequency in a text file.' },
      { id: 'py_2', title: 'Functions, Modules & File I/O', summary: 'Type hints, context managers (with open), CSV/JSON parsing.', exercise: 'Build a CLI personal expense tracker that reads and writes CSV safely.' },
      { id: 'py_3', title: 'Object-Oriented Modeling', summary: 'Classes, dataclasses, encapsulation, and composition over inheritance.', exercise: 'Model a simple task scheduler with Task and Schedule classes and unit tests.' },
      { id: 'py_4', title: 'Virtual Environments & APIs', summary: 'venv, pip, requests/httpx, and writing reliable automation scripts.', exercise: 'Create a small script that validates links or summarizes local study logs.' },
    ],
  },
  {
    key: 'web_dev',
    index: '05',
    title: 'Web Development',
    track: 'Engineering',
    overview: 'React, TypeScript, routing, state management, REST APIs, and PWAs.',
    lessons: [
      { id: 'web_1', title: 'Component Architecture & Props', summary: 'Thinking in React, controlled inputs, and unidirectional data flow.', exercise: 'Build a reusable filterable list component with typed props.' },
      { id: 'web_2', title: 'Hooks, Effects & Derived State', summary: 'Avoiding redundant state, clean useEffect cleanup, and custom hooks.', exercise: 'Write a useLocalStorage and useDebounce custom React hook in TypeScript.' },
      { id: 'web_3', title: 'Client-Server Contracts & Auth', summary: 'REST endpoints, Bearer token headers, input validation, and error boundaries.', exercise: 'Wire a form to a typed Express POST route with server-side validation.' },
      { id: 'web_4', title: 'Offline-First & Performance', summary: 'Service workers, caching strategies, code splitting, and Lighthouse audits.', exercise: 'Configure a manifest and verify offline shell caching in DevTools.' },
    ],
  },
  {
    key: 'software_eng',
    index: '06',
    title: 'Software Engineering',
    track: 'Systems',
    overview: 'Git discipline, testing, debugging, security hygiene, and maintainability.',
    lessons: [
      { id: 'swe_1', title: 'Git Discipline & Atomic Commits', summary: 'Branching, meaningful commit messages, diffs, and pull request reviews.', exercise: 'Practice resolving a merge conflict cleanly and writing descriptive commit logs.' },
      { id: 'swe_2', title: 'Debugging & Root-Cause Analysis', summary: 'Reproducing bugs minimally, reading stack traces, binary search debugging.', exercise: 'Document a real bug you encountered: hypothesis, test, root cause, prevention.' },
      { id: 'swe_3', title: 'Automated Testing Pyramid', summary: 'Unit tests, integration boundaries, edge-case inputs, and regression guards.', exercise: 'Write unit tests covering empty, boundary, and malformed inputs for a utility.' },
      { id: 'swe_4', title: 'Security Fundamentals', summary: 'Least privilege, input sanitization, keeping secrets server-side, XSS/CSRF prevention.', exercise: 'Audit a sample form and API route for missing auth or validation checks.' },
    ],
  },
  {
    key: 'real_systems',
    index: '07',
    title: 'Building Real Systems',
    track: 'Systems',
    overview: 'Database modeling, security rules, deployment, reliability, and monitoring.',
    lessons: [
      { id: 'sys_1', title: 'Data Modeling & Schemas', summary: 'Entity boundaries, relational vs document trade-offs, and indexing.', exercise: 'Design a schema for a multi-user study tracker with strict user isolation.' },
      { id: 'sys_2', title: 'Authentication & Authorization', summary: 'Identity verification vs access rules, least privilege, and token verification.', exercise: 'Trace an authenticated API call end-to-end and verify ownership checks.' },
      { id: 'sys_3', title: 'Deployment & Environments', summary: 'Environment variables, build pipelines, production vs dev parity.', exercise: 'Deploy a full-stack app with zero secrets committed to source control.' },
      { id: 'sys_4', title: 'Resilience, Backups & Observability', summary: 'Graceful degradation, offline queues, structured error logs, and data export.', exercise: 'Implement JSON export and clear recovery UI for a persistence layer.' },
    ],
  },
  {
    key: 'entrepreneurship',
    index: '08',
    title: 'Entrepreneurship',
    track: 'Enterprise',
    overview: 'Identifying real problems, validating cheaply, shipping MVPs, and serving users.',
    lessons: [
      { id: 'ent_1', title: 'Problems Over Ideas', summary: 'Finding painful, frequent problems people already try to solve.', exercise: 'Interview 3 real people about a recurring daily friction without pitching anything.' },
      { id: 'ent_2', title: 'Minimum Viable Value', summary: 'Cutting scope to the core outcome before writing months of code.', exercise: 'Write a 1-page specification for a small tool you can build in 7 days.' },
      { id: 'ent_3', title: 'Unit Economics & Sustainability', summary: 'Understanding costs, time, pricing, and margin before scaling.', exercise: 'Calculate real monthly costs and break-even users for a small software idea.' },
      { id: 'ent_4', title: 'Integrity in Enterprise', summary: 'Building trustworthy products without manipulation, dark patterns, or hype.', exercise: 'Define 5 non-negotiable ethical standards for anything you build and sell.' },
    ],
  },
  {
    key: 'sales_biz',
    index: '09',
    title: 'Sales & Business Development',
    track: 'Enterprise',
    overview: 'Clear communication, listening to buyers, ethical persuasion, and follow-through.',
    lessons: [
      { id: 'sales_1', title: 'Listening as Diagnosis', summary: 'Great sales is understanding the buyer\'s problem more clearly than they do.', exercise: 'Draft 5 open-ended discovery questions for a local business owner.' },
      { id: 'sales_2', title: 'Clear Value Propositions', summary: 'Explaining what you do, who it helps, and the concrete outcome in two sentences.', exercise: 'Write and refine a plain-language 2-sentence pitch without buzzwords.' },
      { id: 'sales_3', title: 'Handling Objections Honestly', summary: 'Addressing budget, trust, and timing concerns transparently—knowing when to walk away.', exercise: 'List 3 common objections to your project and write honest, grounded responses.' },
      { id: 'sales_4', title: 'Follow-Up & Reliability', summary: 'Most opportunities are won by respectful, reliable follow-through.', exercise: 'Design a simple follow-up cadence and honor every promised deadline.' },
    ],
  },
  {
    key: 'fin_literacy',
    index: '10',
    title: 'Financial Literacy',
    track: 'Enterprise',
    overview: 'Cashflow stewardship, budgeting, emergency reserves, avoiding debt traps, and compounding.',
    lessons: [
      { id: 'fin_1', title: 'Cashflow & Zero-Based Clarity', summary: 'Knowing every inflow and outflow before making lifestyle commitments.', exercise: 'Track every shilling or dollar spent for 14 consecutive days honestly.' },
      { id: 'fin_2', title: 'Emergency Reserves & Margin', summary: 'Why liquidity protects character, peace of mind, and career patience.', exercise: 'Set a starter emergency fund target and automate your first contribution.' },
      { id: 'fin_3', title: 'Assets vs Liabilities', summary: 'Distinguishing tools that build future capability from depreciating status spending.', exercise: 'Review your last 5 discretionary purchases under this lens.' },
      { id: 'fin_4', title: 'Stewardship & Generosity', summary: 'Money is a useful servant and a terrible master; plan giving, saving, and living.', exercise: 'Draft a personal monthly allocation percentage across giving, saving, learning, and living.' },
    ],
  },
];

export interface DailyScripture {
  ref: string;
  text: string;
  reflection: string;
}

export const DAILY_SCRIPTURES: DailyScripture[] = [
  {
    ref: 'Proverbs 25:28',
    text: 'Like a city whose walls are broken through is a person who lacks self-control.',
    reflection: 'Self-control is the wall that protects your calling, focus, and peace. Build one boundary today.',
  },
  {
    ref: '2 Timothy 1:7',
    text: 'For the Spirit God gave us does not make us timid, but gives us power, love and self-discipline.',
    reflection: 'Courage and self-discipline belong together. Act on conviction rather than fear or peer approval.',
  },
  {
    ref: 'Galatians 1:10',
    text: 'Am I now trying to win the approval of human beings, or of God?',
    reflection: 'True independence begins when God\'s truth matters more than fitting into the crowd.',
  },
  {
    ref: 'Proverbs 16:3',
    text: 'Commit to the Lord whatever you do, and he will establish your plans.',
    reflection: 'Excellence in coding, study, and work is worship when offered with integrity and humility.',
  },
  {
    ref: 'Luke 16:10',
    text: 'Whoever can be trusted with very little can also be trusted with much.',
    reflection: 'Small daily habits—how you manage an hour, a promise, or a small coin—shape your future.',
  },
  {
    ref: 'James 1:19',
    text: 'Everyone should be quick to listen, slow to speak and slow to become angry.',
    reflection: 'Pause before replying today. Wisdom is measured more by restraint than volume.',
  },
  {
    ref: 'Romans 12:2',
    text: 'Do not conform to the pattern of this world, but be transformed by the renewing of your mind.',
    reflection: 'Guard what enters your mind. Renewal happens daily through truth, discipline, and honest reflection.',
  },
];

export const BIBLE_READING_PLAN = [
  { day: 1, passage: 'John 1:1–18', theme: 'The Word Made Flesh — Foundation of Truth' },
  { day: 2, passage: 'Proverbs 1:1–19', theme: 'The Beginning of Wisdom & Resisting the Crowd' },
  { day: 3, passage: 'Psalm 1', theme: 'Two Paths: Rooted vs Drifting' },
  { day: 4, passage: 'Matthew 5:1–16', theme: 'The Character of Christ\'s Kingdom' },
  { day: 5, passage: 'Proverbs 3:1–12', theme: 'Trust, Humility & Discipline' },
  { day: 6, passage: 'James 1:1–27', theme: 'Steadfastness Under Pressure & Doers of the Word' },
  { day: 7, passage: 'Philippians 2:1–11', theme: 'Humility & The Mind of Christ' },
  { day: 8, passage: 'Proverbs 4:1–27', theme: 'Guard Your Heart Above All Else' },
  { day: 9, passage: 'John 15:1–17', theme: 'Abiding in Christ for Real Fruit' },
  { day: 10, passage: 'Romans 12:1–21', theme: 'Renewed Mind & Practical Love' },
  { day: 11, passage: 'Psalm 23', theme: 'The Shepherd in Calm and Valley' },
  { day: 12, passage: 'Proverbs 6:6–11 & 10:4', theme: 'Diligence & Honest Work' },
  { day: 13, passage: 'Ephesians 4:17–32', theme: 'Putting Off the Old Self' },
  { day: 14, passage: '1 Corinthians 13:1–13', theme: 'Love Beyond Performance' },
];

export const CHARACTER_VIRTUES = [
  'Self-control',
  'Honesty',
  'Patience',
  'Humility',
  'Forgiveness',
  'Discipline',
  'Integrity',
  'Wisdom',
] as const;

export interface LogicPuzzle {
  id: string;
  title: string;
  category: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const LOGIC_PUZZLES: LogicPuzzle[] = [
  {
    id: 'puz_1',
    title: 'The Honest & Dishonest Gatekeepers',
    category: 'Deductive Logic',
    prompt: 'Two guards stand at two doors: one leads to freedom, one to a dead end. One guard always tells the truth; the other always lies. You may ask ONE guard ONE yes/no question. Which question guarantees you find the freedom door?',
    options: [
      '"Does your door lead to freedom?"',
      '"If I asked the other guard which door leads to freedom, what would they point to?"',
      '"Are you the truth-telling guard?"',
      '"Do both doors lead to the same place?"',
    ],
    correctIndex: 1,
    explanation: 'Asking what the OTHER guard would say passes through one truth and one lie regardless of who you ask, so both guards will point to the WRONG door. Choose the opposite door.',
  },
  {
    id: 'puz_2',
    title: 'Base-Rate Discipline Check',
    category: 'Critical Thinking',
    prompt: 'A software team notices 90% of bugs in production came from Friday afternoon deploys. A junior engineer concludes: "Deploying on Friday causes 90% of bugs, so banning Friday deploys fixes 90% of bugs." What critical thinking flaw is present?',
    options: [
      'Confirmation bias — ignoring Monday bugs',
      'Missing base rate — what fraction of total deploys happened on Friday?',
      'False dilemma — only two days exist',
      'Circular reasoning — bugs prove deploys',
    ],
    correctIndex: 1,
    explanation: 'Without knowing how many total deploys occur on Fridays (or whether complex features pile up before the weekend), raw percentage of bugs ignores the base rate and confounding variables.',
  },
  {
    id: 'puz_3',
    title: 'The Compounding Lily Pond',
    category: 'Exponential Reasoning',
    prompt: 'A pond has a patch of lilies that doubles in area every day. On Day 30, the pond is completely covered. On which day was the pond half covered?',
    options: ['Day 15', 'Day 20', 'Day 28', 'Day 29'],
    correctIndex: 3,
    explanation: 'Because the patch doubles each day, working backward one day from Day 30 (100%) means Day 29 was 50%. Exponential growth looks slow until the final steps—just like compounding skills and savings.',
  },
  {
    id: 'puz_4',
    title: 'The Sunk-Cost Trap',
    category: 'Decision Science',
    prompt: 'You spent 40 hours building a feature nobody wants, and you realize an alternative approach would take 10 hours and solve the real user problem. What is the rational decision?',
    options: [
      'Keep spending another 20 hours so the 40 hours are not wasted.',
      'Pivot to the 10-hour solution—the 40 hours are already spent regardless.',
      'Average the two approaches together.',
      'Wait another week before deciding.',
    ],
    correctIndex: 1,
    explanation: 'The 40 hours are a sunk cost—unrecoverable either way. Rational decisions weigh only future costs against future value.',
  },
];

export const WEALTH_LESSONS = [
  {
    id: 'wl_1',
    title: 'Earn by Solving Real Problems',
    body: 'Income grows sustainably when you increase the value and reliability of the problems you can solve for others—not through hype, shortcuts, or chasing status.',
  },
  {
    id: 'wl_2',
    title: 'Pay Yourself Margin First',
    body: 'Before upgrading lifestyle, set aside savings and skill reinvestment. Even small consistent percentages build independence and protect you from bad peer or financial pressure.',
  },
  {
    id: 'wl_3',
    title: 'Distinguish Needs, Tools, and Vanity',
    body: 'Needs sustain health; tools multiply productivity (books, courses, reliable hardware); vanity purchases exist mainly to impress people who rarely care.',
  },
  {
    id: 'wl_4',
    title: 'Avoid Guaranteed-Wealth Promises',
    body: 'No ethical financial education promises guaranteed riches. Real wealth building combines marketable skill, disciplined budgeting, patience, and honest stewardship.',
  },
];

export const PEER_PRESSURE_QUESTIONS = [
  'Am I doing this because I want to or because others are doing it?',
  'What are my personal values?',
  'What decisions am I making just to impress people?',
  'What do I genuinely believe?',
  'What kind of person am I becoming?',
] as const;

export const COMMUNICATION_HABITS = [
  'Listening before responding',
  'Thinking before speaking',
  'Speaking truthfully',
  'Avoiding unnecessary arguments',
  'Keeping appropriate privacy',
  'Asking for help when necessary',
] as const;

export const EMERGENCY_ALTERNATIVES = [
  { title: 'Cold Water & Walk Outside', detail: 'Splash cold water on your face, leave the room immediately, and walk briskly for 15 minutes without your phone.' },
  { title: '25 Pushups + Stretch Reset', detail: 'Shift physical energy immediately through bodyweight movement, then drink a full glass of water.' },
  { title: 'Write an Honest 5-Line Note', detail: 'Write down exactly what emotion preceded this urge (boredom, stress, loneliness, fatigue) instead of numbing it.' },
  { title: 'Read Proverbs or Call a Trusted Person', detail: 'Step into an open, accountable space and talk to someone who genuinely cares about your future.' },
];

export const AVATAR_OPTIONS = [
  { id: 'monolith', label: 'Obsidian Monolith' },
  { id: 'compass', label: 'Brass Compass' },
  { id: 'crown', label: 'Sovereign Shield' },
  { id: 'flame', label: 'Refined Gold' },
] as const;
