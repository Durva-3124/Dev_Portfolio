export const hero = {
  name: 'Durva Pawar',
  label: "Hi there, I'm",
  roles: ['Full-Stack Engineer', 'AI/ML Engineer', 'Backend Developer'],
  tagline: '',
  oneLiner: 'I build end-to-end full-stack applications, distributed backend microservices, and deep learning pipelines.',
  location: 'Pune, Maharashtra, India',
  socials: {
    github: 'https://github.com/Durva-3124',
    linkedin: 'https://linkedin.com/in/durva-pawar-04640b34a',
    email: 'pawardurva273@gmail.com'
  }
};

export const about = {
  text: "B.Tech AI & Machine Learning student at PES Modern College of Engineering (CGPA 9.47, Honors in Advanced Web Development), with hands-on experience engineering end-to-end full-stack applications, distributed backend microservices, and deep learning pipelines.",
  highlights: [
    { title: 'Backend & Systems', text: 'REST APIs with Node.js/Express (TypeScript) and Java/Spring Boot 3, JWT/RBAC/Spring Security, Redis job queues.' },
    { title: 'AI & Computer Vision', text: 'Multi-stage computer vision workflows (U-Net, EfficientNet-B0, Swin Transformer) and resilient Python AI microservices.' },
    { title: 'Web & Mobile', text: 'Interactive web apps and cross-platform apps with React.js and React Native.' }
  ],
  counters: [
    { label: 'CGPA', value: 9.47, suffix: '' },
    { label: 'Images trained', value: 35000, suffix: '+' },
    { label: 'Internships', value: 2, suffix: '' }
  ]
};

export const skills = [
  { category: 'Languages', items: ['Python', 'Java', 'C/C++', 'JavaScript', 'TypeScript'] },
  { category: 'Frontend & Mobile', items: ['React.js', 'React Native', 'HTML5', 'CSS3', 'Tailwind CSS'] },
  { category: 'Backend & Frameworks', items: ['Node.js', 'Express.js', 'Spring Boot 3 (Java 21)'] },
  { category: 'Databases & ORM', items: ['MongoDB', 'Mongoose', 'PostgreSQL', 'JPA', 'MySQL'] },
  { category: 'Real-Time & Async', items: ['WebSocket', 'Socket.IO', 'Redis', 'BullMQ'] },
  { category: 'AI/ML & Vision', items: ['PyTorch', 'TensorFlow', 'U-Net', 'EfficientNet-B0', 'Swin Transformer'] },
  { category: 'Security & Ops', items: ['JWT', 'bcrypt.js', 'Spring Security', 'RBAC', 'Git', 'GitHub'] },
  { category: 'Core CS', items: ['Data Structures & Algorithms', 'DBMS', 'OOP', 'Operating Systems'] }
];

export const experience = [
  {
    role: 'Web Developer Intern',
    company: 'PropMv',
    period: 'July 2026 – Present',
    description: 'Assisted in building a multi-portal full-stack property management SaaS backend using Node.js/Express and MongoDB. Implemented JWT authentication and RBAC middleware for distinct Landlord, HOA, Tenant, and Vendor portals. Supported background task handling with BullMQ, multi-provider email delivery, and real-time Socket.IO messaging.'
  },
  {
    role: 'AI/ML Intern',
    company: 'Atodya',
    period: 'July 2026 – Present',
    description: 'Contributed to TejaLens, an AI-powered skin cancer pre-screening medical device. Developed a two-stage deep learning pipeline combining U-Net segmentation and multi-class classification (EfficientNet-B0 / Swin Transformer), trained on 35,000+ dermoscopic images.'
  },
  {
    role: 'Technical Co-Head',
    company: 'App Club, PESMCOE',
    period: '',
    description: 'Developed and maintained the official App Club website. Organized and led technical events and workshops, including interactive sessions on automation with n8n.'
  }
];

export const projects = [
  {
    slug: 'meetsync-ai',
    title: 'meetsync-AI',
    role: 'Full-Stack Developer',
    description: 'AI-driven meeting orchestration platform (transcription → MoM → decisions → skill matching). Built a Node.js/Express/TypeScript REST API with MongoDB, Redis-backed BullMQ job queues, and asynchronous DOCX/PDF generation. Integrated two Python AI microservices through a resilience layer with circuit breakers, exponential retry, Zod validation, and rate limiting.',
    tags: ['Node.js', 'Express', 'TypeScript', 'MongoDB', 'Redis', 'BullMQ', 'Python', 'Circuit Breaker', 'Zod', 'Docx/PDF']
  },
  {
    slug: 'bullsight',
    title: 'BullSight',
    role: 'Backend Developer',
    description: 'Real-time stock market tracking and alert dashboard. Built a Spring Boot 3 (Java 21) REST API backed by PostgreSQL for portfolios, positions, and price alerts using Controller-Service-Repository architecture. Streams real-time stock data via WebSocket integrated with the Finnhub API (OkHttp), secured with Spring Security.',
    tags: ['Spring Boot 3', 'Java 21', 'PostgreSQL', 'WebSocket', 'Finnhub', 'OkHttp', 'Spring Security']
  },
  {
    slug: 'tejalens',
    title: 'TejaLens',
    role: 'AI/ML, Atodya',
    description: 'AI-powered skin cancer pre-screening device using a two-stage U-Net + EfficientNet-B0/Swin Transformer pipeline on 35,000+ dermoscopic images.',
    tags: ['U-Net', 'EfficientNet-B0', 'Swin Transformer', 'PyTorch', '35,000+ Images']
  }
];

export const education = [
  {
    degree: 'B.Tech in AI & ML',
    institution: 'PES Modern College of Engineering',
    score: 'CGPA 9.47',
    honors: 'Honors in Advanced Web Development',
    period: '2023 – 2027'
  },
  {
    degree: 'HSC (Class 12)',
    institution: 'R.R. Shinde Junior College',
    score: '76.17%',
    period: '2021 – 2023'
  },
  {
    degree: 'SSC (Class 10)',
    institution: 'Sharada English Medium School',
    score: '91.40%',
    period: '2021'
  }
];

export const certifications = [
  { name: 'AI Fundamentals', issuer: 'IBM' },
  { name: 'Data Analytics Job Simulation', issuer: 'Deloitte' },
  { name: 'AI for Beginners', issuer: 'HP LIFE' },
  { name: 'Python Training', issuer: 'IIT Bombay' },
  { name: 'C Training', issuer: 'IIT Bombay' },
  { name: 'Foundation C Beginner Skill Assessment', issuer: 'TechGig' },
  { name: "Hands-on Git & GitHub Workshop", issuer: 'IEEE Student Branch, PESMCOE' }
];

export const contact = {
  heading: "Let's build something together.",
  subheading: 'Say hi',
  email: 'pawardurva273@gmail.com',
  linkedin: 'https://linkedin.com/in/durva-pawar-04640b34a',
  github: 'https://github.com/Durva-3124'
};
