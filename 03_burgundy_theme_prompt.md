## THEME OVERRIDE: BURGUNDY (replaces every earlier violet, cyan or magenta reference)

Read accentColor, accentTint and accentSecondary from data.ts and use them as design tokens (CSS variables on :root, mapped into the Tailwind config):
- --accent: #800020 (burgundy). Use for button fills, gradients, borders, 3D node graph spheres and particles, and avatar highlights.
- --accent-tint: #c2274f (lighter burgundy). Use for text, links, icons, focus rings and glows, because pure #800020 is too dark to read on a dark background.
- --accent-secondary: #e0b878 (champagne gold). Use for the second stop in gradients, small highlights, counters and badges.
- Background: #0d0709 (warm near-black). Surface/glass cards: rgba(255,255,255,0.04) with a 1px border rgba(194,39,79,0.25) and a soft burgundy glow on hover.
- Main gradient: linear-gradient(135deg, #800020, #c2274f 55%, #e0b878).
- Light mode: background #fbf6f4, text #1a0d10, accent #800020 for fills and links.
- Text on burgundy buttons: white. Make sure every text/background pair passes WCAG AA contrast.
- 3D scene: node graph and particles in burgundy and champagne gold, with a faint tint-colored bloom or glow. Shift the scene hue slightly per section between burgundy and gold as the user scrolls.
- Custom cursor glow, scroll progress bar, active nav highlight, and the favicon monogram "DP" all use the burgundy accent.
