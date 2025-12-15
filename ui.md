# Room Page UI Documentation

## Aesthetic Overview: "Vivid Cyber-Glass"
The application uses a **premium, high-contrast aesthetic** combining deep, rich backgrounds with neon accents and heavy glassmorphism. It evokes a modern, slightly futuristic feeling suitable for a media-sharing application.

### Color Palette
- **Background**: A deep, immersive radial gradient fading from **Midnight Purple (`#1a103c`)** at the top to **Obsidian Black (`#05050a`)**.
- **Accents**: High-saturatino neon colors used for interactive elements and highlights:
  - **Electric Violet (`#7c3aed`)**: Primary action color (Active tabs, Host badges).
  - **Neon Cyan (`#06b6d4`)**: Secondary accents (Gradients).
  - **Hot Pink (`#f43f5e`)**: Highlights and alerts.
- **Glass**: Multiple layers of translucency (`rgba(255, 255, 255, 0.03)` to `0.1`) with varying blur levels (12px - 20px) to create depth.

---

## Layout Structure

The Room Page is divided into three primary zones, floating above the global background:

1.  **Glass Header (Top)**
    - **Appearance**: A floating glass strip with a blurred backdrop.
    - **Elements**: 
      - *Room Name*: Rendered in a glowing gradient font (White to Lavender) with a soft shadow.
      - *Controls*: Glass-morphic icon buttons for settings and room management.
      - *User Menu*: A circular avatar with a neon border that reveals a glass dropdown menu on click.

2.  **Main Stage (Center - Left/Middle)**
    - **Tab Navigation**: A horizontal row of "floating" buttons.
      - *Inactive*: Transparent with subtle text.
      - *Active*: Vivid violet background with a neon outer glow.
    - **Content Area**:
      - *Video Player*: Encased in a deep glass container with a neon-glowing progress bar thumb.
      - *Music/Games*: (Placeholder context) Consistent glass styling.

3.  **Chat Sidebar (Right)**
    - **Appearance**: A tall, semi-transparent glass panel docked to the right.
    - **Backdrop**: Heavy blur (20px) to ensure text legibility while revealing the background gradient.
    - **Chat Bubbles**:
      - *User*: Vivid violet-to-indigo gradient with a soft shadow.
      - *Others*: Subtle glass containers with light borders.
    - **Participants**: List of users with avatars that glow neon when interacted with.

---

## Interactive Design

- **Hover States**: almost all interactive elements (buttons, avatars, tabs) have "juicy" hover effects:
  - **Scale**: Slight growth (1.05x - 1.1x).
  - **Glow**: Increased `box-shadow` or border brightness.
  - **Background**: Shift from transparent to subtle glass-white.
- **Micro-interactions**:
  - **Tabs**: Smooth elastic transitions.
  - **Avatars**: Neon rings expand on hover.
  - **Dropdowns**: Fade and slide in with a glass backdrop.
