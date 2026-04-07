# 🎬 Resonant Sips: Deep Game Design & Execution Plan

**Team:** Whale shark
**Project Category:** AI-Driven Interactive Narrative & Vibe-Coding

## 1. Core Concept & Atmosphere
* **Worldview:** Set in "Bit Bay," a cyberpunk city where digital overload causes people's emotional frequencies to become misaligned.
* **Core Mechanic:** The player acts as a bartender possessing "Frequency Resonance Perception." By conversing with customers (Storyworld characters), the bartender extracts their hidden emotional state.
* **Healing Logic:** Players achieve "Emotional Resonance" by mixing drinks that match the customer's specific mood (e.g., a bitter drink for 'letting go', a sweet drink for 'hope'). 
* **Visual Feedback:** Upon successful resonance, the customer visually transitions from grayscale pixels to vibrant full color, symbolizing emotional healing.

## 2. Granular Task List & Module Breakdown

### Module A: Visual Assets & Aesthetics
* **A1. Character Pixel-ization:** Download YAMLs and images from Storyworld. Build a unified ComfyUI pixelation workflow for consistent NPC sprites.
* **A2. Dynamic Environment:** Utilize LTX-Video to generate a looping "rainy night bar" pixel-art background video.
* **A3. UI/UX Design:** Create retro pixel-style dialogue boxes, liquor cabinet interfaces, and "Resonance Success" VFX.
* **A4. VFX & Cutscenes:** Animate the bartending sequence and the glowing light burst effect upon successful healing.

### Module B: Vibe-Coding & Game Logic
* **B1. Game Engine Setup:** Guide AI (Vibe-coding) to write the core Python/Pygame scripts for smooth video playback and UI layers.
* **B2. YAML Parser:** Develop Python code to automatically parse personality tags directly from Storyworld YAML files.
* **B3. LLM API Integration:** Integrate OpenAI/Claude APIs with robust System Prompts to ensure NPCs speak according to their Storyworld personas.
* **B4. Emotion Matching Engine:** Develop an algorithm that compares player's drink emotional tags with LLM-extracted NPC state tags.

### Module C: Narrative & Content Design
* **C1. Drink Recipe Database:** Design 10-15 unique "healing recipes" mapped to specific emotional resonance combinations.
* **C2. Prompt Engineering:** Refine dialogue prompts for each Storyworld character to naturally embed "emotional clues."
* **C3. Healing Scripts:** Write the transformative dialogue characters leave behind after their emotional frequency is restored.

### Module D: Audio & Documentation
* **D1. Ambient Soundtrack:** Generate a pixel-bar appropriate Lo-Fi BGM using Suno.
* **D2. Interactive SFX:** Generate tactile sound effects (pouring liquid, ice clinking, success chimes) using AI audio tools.
* **D3. Reflection Documentation:** Keep a strict log of all Vibe-coding errors, prompt iterations, and debugging processes (25% of the rubric).
* **D4. Workflow Management:** Organize and heavily comment all ComfyUI workflow JSON files for transparency.

## 3. Technical Strategy & Workflow
Our development utilizes an AI-assisted code generation approach (Vibe-coding) integrated with Pygame.
* **Asset Pipeline:** Storyworld (YAML + Img) -> ComfyUI (Pixel Workflow) -> PNG Sprites / MP4 Backgrounds.
* **Vibe-Coding Approach:** Prompting AI with architectural instructions to write Python programs that handle LLM dialogues and resonance evaluation logic.
* **Integration:** Using Python as the "glue code" to bind AI-generated visual assets, LLM-driven text, and audio.

## 4. Submission Checklist & Grading Alignment
* [ ] **Originality:** Demonstrate the unique Python matching algorithm built via Vibe-coding.
* [ ] **Synergy:** Successfully import and interact with characters created by other teams, proving ecosystem connection.
* [ ] **Transparency:** Submit a detailed `AGENTS.md` explaining AI agent interactions during the coding and asset generation process.