Build a production-quality, highly professional 3D portfolio website for Durva Pawar, a Full-Stack & AI/ML Engineer. It should feel like a premium, award-style developer portfolio, not a template.

## TECH STACK
- React 18 + Vite + TypeScript
- Tailwind CSS for styling
- Three.js via @react-three/fiber and @react-three/drei for 3D
- Framer Motion for UI animations and scroll reveals
- Lenis (or similar) for smooth scrolling
- No backend needed. The contact form opens a mailto: link or uses EmailJS.
- Deployable to Vercel/Netlify. Give me the full folder structure, all code files, and run and deploy instructions.

## DESIGN DIRECTION
- Dark theme by default with a light-mode toggle. Deep warm near-black background (#0d0709), with burgundy (#800020) as the primary accent and champagne gold (#e0b878) as the secondary accent. Use a lighter burgundy tint (#c2274f) for text, links and glows so they stay readable on dark backgrounds.
- Glassmorphism cards (blur, thin translucent borders, soft burgundy glow on hover).
- Typography: Space Grotesk or Sora for headings, Inter for body. Large, confident hero text.
- Generous whitespace, consistent 8px spacing, subtle grain/noise overlay.
- Custom cursor with a soft glow that reacts to hoverable elements.

## 3D VISUALS (core feature)
1. HERO: A full-screen interactive 3D scene, built procedurally with no external model files. Use a floating distorted icosahedron/neural-network-style node graph (glowing spheres connected by lines) that slowly rotates, reacts to mouse movement with parallax, and gently pulses. Add a particle starfield in the background. This visually represents AI/ML.
2. SCROLL-DRIVEN 3D: The camera or scene shifts subtly as the user scrolls between sections (e.g., the node graph rotates or shifts between burgundy and gold per section).
3. SKILLS: An interactive 3D rotating sphere or cloud of skill labels (drei's <Html> or text sprites) that can be dragged and auto-rotates.
4. PROJECT CARDS: 3D tilt effect on hover (vanilla-tilt style with perspective and a light-reflection glare).
5. Performance: lazy-load the canvas, cap devicePixelRatio at 2, reduce particle count on mobile, and pause rendering when off-screen. Provide a static gradient fallback if WebGL is unavailable or the user prefers reduced motion.

## SECTIONS (in this order, with sticky glass navbar and smooth anchor scroll)

### 1. Hero
- Small label: "Hi there, I'm"
- Name: Durva Pawar
- Animated typewriter/rotating roles: "Full-Stack Engineer" / "AI/ML Engineer" / "Backend Developer"
- One-liner: "I build end-to-end full-stack applications, distributed backend microservices, and deep learning pipelines."
- Buttons: "View Projects" (scroll), "Get in Touch" (scroll), and icon links to GitHub and LinkedIn
- Location: Pune, Maharashtra, India
- Scroll-down indicator

### 2. About
B.Tech AI & Machine Learning student at PES Modern College of Engineering (CGPA 9.47, Honors in Advanced Web Development), with hands-on experience engineering end-to-end full-stack applications, distributed backend microservices, and deep learning pipelines. Three highlight cards:
- Backend & Systems: REST APIs with Node.js/Express (TypeScript) and Java/Spring Boot 3, JWT/RBAC/Spring Security, Redis job queues
- AI & Computer Vision: multi-stage computer vision workflows (U-Net, EfficientNet-B0, Swin Transformer) and resilient Python AI microservices
- Web & Mobile: interactive web apps and cross-platform apps with React.js and React Native
Add animated counters: CGPA 9.47, 35,000+ images trained on, 2 internships.

### 3. Skills (3D skill sphere + grouped list below it)
- Languages: Python, Java, C/C++, JavaScript, TypeScript
- Frontend & Mobile: React.js, React Native, HTML5, CSS3, Tailwind CSS
- Backend & Frameworks: Node.js, Express.js, Spring Boot 3 (Java 21)
- Databases & ORM: MongoDB, Mongoose, PostgreSQL, JPA, MySQL
- Real-Time & Async: WebSocket, Socket.IO, Redis, BullMQ
- AI/ML & Vision: PyTorch, TensorFlow, U-Net, EfficientNet-B0, Swin Transformer
- Security & Ops: JWT, bcrypt.js, Spring Security, RBAC, Git, GitHub
- Core CS: Data Structures & Algorithms, DBMS, OOP, Operating Systems
Use only these skills. Do not add any others.

### 4. Experience (vertical animated timeline)
- Web Developer Intern, PropMv (July 2026 – Present): Assisted in building a multi-portal full-stack property management SaaS backend using Node.js/Express and MongoDB. Implemented JWT authentication and RBAC middleware for distinct Landlord, HOA, Tenant, and Vendor portals. Supported background task handling with BullMQ, multi-provider email delivery, and real-time Socket.IO messaging.
- AI/ML Intern, Atodya (July 2026 – Present): Contributed to TejaLens, an AI-powered skin cancer pre-screening medical device. Developed a two-stage deep learning pipeline combining U-Net segmentation and multi-class classification (EfficientNet-B0 / Swin Transformer), trained on 35,000+ dermoscopic images.
- Technical Co-Head, App Club, PESMCOE: Developed and maintained the official App Club website. Organized and led technical events and workshops, including interactive sessions on automation with n8n.

### 5. Featured Projects (3D-tilt glass cards, each with a tech-tag row, a "Details" modal, and GitHub/Live link buttons as placeholders)
- meetsync-AI (Full-Stack Developer): AI-driven meeting orchestration platform (transcription → MoM → decisions → skill matching). Built a Node.js/Express/TypeScript REST API with MongoDB, Redis-backed BullMQ job queues, and asynchronous DOCX/PDF generation. Integrated two Python AI microservices through a resilience layer with circuit breakers, exponential retry, Zod validation, and rate limiting.
- BullSight (Backend Developer): Real-time stock market tracking and alert dashboard. Built a Spring Boot 3 (Java 21) REST API backed by PostgreSQL for portfolios, positions, and price alerts using Controller-Service-Repository architecture. Streams real-time stock data via WebSocket integrated with the Finnhub API (OkHttp), secured with Spring Security.
- TejaLens (AI/ML, Atodya): AI-powered skin cancer pre-screening device using a two-stage U-Net + EfficientNet-B0/Swin Transformer pipeline on 35,000+ dermoscopic images.

### 6. Education
- B.Tech in AI & ML, PES Modern College of Engineering, CGPA 9.47, Honors in Advanced Web Development
- HSC (Class 12), R.R. Shinde Junior College, 76.17%
- SSC (Class 10), Sharada English Medium School, 91.40%

### 7. Certifications & Workshops (compact badge grid)
AI Fundamentals (IBM), Data Analytics Job Simulation (Deloitte), AI for Beginners (HP LIFE), Python Training (IIT Bombay), C Training (IIT Bombay), Foundation C Beginner Skill Assessment (TechGig), Hands-on Git & GitHub Workshop (IEEE Student Branch, PESMCOE)

### 8. Contact
Heading: "Let's build something together." Contact form (name, email, message) with validation, plus email pawardurva273@gmail.com, LinkedIn linkedin.com/in/durva-pawar-04640b34a, and GitHub github.com/Durva-3124. Do not display a phone number.

### Footer
"© 2026 Durva Pawar" plus social icons and a back-to-top button.

## INTERACTIONS & POLISH
- Animated preloader (logo/initials with progress) before the 3D scene loads
- Scroll progress bar at the top, and active-section highlighting in the navbar
- Staggered fade-up reveals on every section and magnetic hover on primary buttons
- "Download Resume" button in the navbar (link to /resume.pdf as a placeholder)
- Mobile hamburger menu with animated overlay

## QUALITY REQUIREMENTS
- Fully responsive (360px to 4K), with a simplified 3D scene on mobile
- Lighthouse targets: Performance 90+, Accessibility 95+, SEO 100
- Semantic HTML, alt text, keyboard focus states, prefers-reduced-motion support
- SEO meta tags, Open Graph tags, favicon, and a proper <title>
- Clean, commented, componentized code: /components, /sections, /three, /data (keep all portfolio content in one data.ts file so it's easy to edit)
- Produce complete working code for every file, not snippets or "rest remains the same."

Start by outlining the folder structure, then output every file in full.
