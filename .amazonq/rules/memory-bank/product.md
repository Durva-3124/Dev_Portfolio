# Product Overview

## Project: Durva Pawar 3D Portfolio

### Purpose
An immersive, interactive 3D portfolio website for Durva Pawar — a developer/designer showcasing work, skills, and personality through a full-screen WebGL gallery world experience rather than a traditional scrollable page.

### Value Proposition
- Differentiates from standard portfolios via a walkable 3D gallery environment
- Combines Three.js/R3F 3D scenes with polished 2D UI (Framer Motion, GSAP, Tailwind)
- Reflects personal brand through a burgundy/gold color theme and custom 3D avatar

### Key Features
- **3D Gallery World**: Full-screen walkable environment built with React Three Fiber
- **Player Controller**: First/third-person navigation inside the gallery
- **3D Avatar**: Animated character representing the portfolio owner
- **Portfolio Sections** (preserved in `src/sections/`, to be integrated as in-world panels):
  - Hero, About, Skills, Experience, Projects, Education, Certifications, BeyondCode, Contact, MyDesk
- **Rich UI Components**: Custom cursor, magnetic buttons, tilt cards, glass cards, speech bubbles, timeline, preloader, project modal, section reveal animations
- **Smooth Scroll**: Lenis-powered smooth scrolling
- **Theme System**: Dark theme with burgundy/gold palette
- **Easter Egg**: Konami code hook
- **Performance**: Reduced motion support, Three.js performance monitoring

### Target Users
- Recruiters and hiring managers evaluating Durva's candidacy
- Collaborators and clients exploring past work
- Developers seeking inspiration for creative portfolio approaches

### Current Phase
Phase 1 — Full-screen 3D gallery world active. Existing portfolio sections (Hero, About, etc.) are preserved and will be integrated as in-world content panels in Phase 6.

### Deployment
- Hosted on Vercel (`vercel.json` present, `public/_redirects` for SPA routing)
