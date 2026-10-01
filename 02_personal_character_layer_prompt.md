## PERSONAL CHARACTER LAYER (overrides the generic hero where they conflict)

The site should feel like it belongs to one specific person, not a template. A 3D version of Durva is the host of the whole site.

### 3D AVATAR
- Load /public/models/durva.glb with useGLTF from @react-three/drei. If the file is missing, automatically render a stylized low-poly procedural character (rounded head, simple hair shape, hoodie, glasses optional) so the site never breaks.
- Hero layout: avatar on the right, floating beside the glowing neural-network node graph, with the text on the left. On mobile, the avatar sits above the text at a smaller scale.
- Idle animation: gentle breathing, random blinking, slight head sway.
- On page load, the avatar waves (use the GLB's animation if available, otherwise animate the arm bone or group procedurally).
- Head and eyes follow the mouse cursor (clamped rotation, smooth lerp). On touch devices, follow the last tap.
- Clicking the avatar triggers a speech bubble with a random line from data.ts (personal.avatarQuotes) and a small jump/spin.
- Speech bubble: glassmorphism style, typewriter effect, auto-dismisses after 4 seconds.

### AVATAR REACTS TO SCROLL
The avatar stays in a small fixed 3D corner widget (bottom-right, collapsible) after the hero and changes pose or props per section:
- About: waves and smiles
- Skills: types on a floating holographic laptop
- Experience: holds a glowing badge or ID card
- Projects: points toward the project cards
- Contact: thumbs up with a speech bubble saying "Let's talk!"
If poses are not available in the model, use simple procedural rotations and floating props (laptop, badge, arrow) around the avatar instead.

### "MY DESK" 3D SCENE (between Experience and Projects)
A small cozy 3D desk scene built procedurally: laptop showing animated code, a coffee mug with steam particles, a plant, and a lamp with a warm glow. Add 3 clickable objects (laptop, mug, plant), each opening a small popup with a line from personal.deskObjectMessages. If a message is empty, show only the object name.

### VOICE AND COPY
- Write all copy in first person, warm, confident, and slightly playful, like Durva is talking. Avoid corporate buzzwords.
- Section headings should have personality, for example "A little about me", "What I work with", "Where I've been building", "Things I've made", "Say hi".
- Add a "Beyond the code" section after Certifications with cards for personal interests, fed from personal.interests (painting, flute, sleeping).
- Include a small "Currently" widget in the About section (currently building / learning / exploring) fed from personal.currently. Hide it while the fields are empty.
- Show personal.tagline under the hero name or roles.

### PERSONAL DETAILS (single source of truth in data.ts)
Use the `personal` object from src/data/personal.ts exactly as provided. Do not invent any values. If a field is empty, hide the component that uses it. accentColor is used site-wide so it can be changed in one place.

### EXTRA DELIGHTS
- Konami code or pressing "D" triggers confetti and the avatar dances.
- Custom 404 page with the avatar shrugging.
- Preloader shows the avatar's silhouette filling in with color as progress increases.
- Favicon is a small avatar or "DP" monogram in burgundy.
- Respect prefers-reduced-motion: freeze the avatar in a still pose and disable dance, confetti, and cursor tracking.
