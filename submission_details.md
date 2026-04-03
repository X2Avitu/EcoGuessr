# Hackathon Submission Details: PLATZ

Here is the drafted content for your hackathon submission. You can copy and paste this directly into Devpost or your submission portal.

---

## 1. Project Title, Tagline, and Short Description
**Title:** PLATZ
**Tagline:** The Streetwear-Inspired, AI-Powered Civic Movement

**Short Description:** A high-impact, gamified platform that transforms urban cleanups into a competitive, community-driven social experience powered by advanced AI vision and intelligent agents.

---

## 2. Problem Statement
Urban areas worldwide suffer from rampant littering and illegal dumping, leading to environmental degradation and lowered community morale. Traditional civic cleanup efforts often struggle with low engagement, particularly among younger demographics, because they can be tedious, disorganized, and unrewarding. There is a critical lack of real-time environmental data, coordinated community action, and exciting incentives to drive consistent, large-scale participation in keeping our cities clean. 

---

## 3. Solution Overview
PLATZ redefines civic duty by turning it into a dynamic, streetwear-inspired movement. Rather than a standard utility app, PLATZ is a community-first platform where users form "Squads", identify pollution hotspots on a live interactive map, and coordinate missions to restore their neighborhoods. 

By blending striking dark-mode aesthetics, slick micro-animations, and competitive gamification, PLATZ naturally engages users. The platform manages everything from secure authentication and user profiles (via Supabase) to real-time squad leaderboards, making environmental action both accessible and highly rewarding.

---

## 4. AI Usage Explanation
PLATZ leverages cutting-edge AI to automate impact tracking and guide the community, seamlessly integrating intelligence into the user experience:

*   **Platz AI Vision (Trash Threat Classification):** When users complete a cleanup, they upload a photo of the area or the collected trash. Our integrated Vision AI automatically analyzes the image to classify the "threat level" of the litter, identify potential hazards (e.g., sharp objects, toxic materials), and estimate the volume/weight. It then dynamically calculates the environmental impact and awards the appropriate amount of points to the squad, eliminating manual verification and making scoring fair and automated.
*   **Platz AI Agent (Intelligent Onboarding & Coordination):** We implemented a contextual AI chatbot acting as the ultimate "hype-man" and guide for the PLATZ movement. Utilizing advanced LLM instructions, the agent understands the project's exact mission, helps new users onboard, explains how squads work, and provides actionable advice on how to maximize their cleanup impact.

---

## 5. Demo
*Replace these placeholders with your actual links before submitting.*

*   **Video Demo Link:** `[Insert YouTube/Vimeo Link Here]`
*   **Live Demo Link:** `[Insert Vercel/Deployed URL Here]`

*(Tip for the video: Make sure to record the full flow—logging in, showing the sleek UI/map, uploading a trash photo to demonstrate the AI Vision analysis, and chatting with the Platz AI Agent.)*

---

## 6. Source Code / Repository
*Replace this with your actual repository link. If your repo is private, make sure to invite the judges or change it to public.*

*   **GitHub Repository:** `[Insert GitHub Repo Link Here]`

---

## 7. About the Project

### Inspiration
Civic duty has always felt like an obligation rather than a movement. Too often, cleanup efforts appeal to a narrow demographic and lack the excitement, gamification, and style that drive modern social platforms. We asked ourselves: *What if keeping our cities clean had the same hype as a streetwear drop or a competitive online game?* This led us to create PLATZ—a platform that shifts the narrative from "doing chores" to "leveling up your squad and your streets."

### How We Built It & The Math Behind the Impact
We architected PLATZ as a full-stack web application. The core platform runs on the **Next.js App Router**, ensuring high performance, fast server-side rendering, and seamless API routes. We integrated **Supabase** for robust authentication, user management, and realtime database capabilities to power the live map and squad leaderboards.

For the AI components, we relied on **Google Gemini**. We used Gemini's Vision models to create the *Platz AI Vision* feature, which analyzes user-uploaded photos of trash. We track the total impact of a cleanup dynamically. The AI assigns values to variables like Threat Level ($T$) and Volume ($V$), allowing us to calculate the rewarded points ($P$) using a scoring algorithm:

$$ P = \sum_{i=1}^{n} (T_i \times V_i) \times S_m $$

Where $S_m$ is the active Squad Multiplier. 

Additionally, we built the *Platz AI Agent*, an LLM-powered chatbot that acts as a hype-man, using highly specific system instructions to understand project context and guide users in dark-mode style. The stunning frontend was crafted using **Tailwind CSS** and **shadcn/ui** to ensure a premium, streetwear-inspired aesthetic.

### Challenges We Faced
1. **AI Vision Accuracy:** Ensuring the model consistently identified the "threat level" of varying types of trash—from common litter to hazardous waste—required careful prompt engineering and fine-tuning of the system instructions sent to the vision model.
2. **Contextualizing the Chatbot:** Keeping the AI Agent "in character" as a hype-man without hallucinating false features about the platform was challenging. We had to strictly define its boundaries and knowledge base.
3. **Aesthetic Consistency:** Building a dark, premium, streetwear-inspired aesthetic demands attention to detail. Implementing smooth micro-animations and ensuring color harmony across complex UI components like the live map and leaderboards took significant iteration.

### What We Learned
* **AI Beyond Text:** We learned how incredibly powerful LLMs and Vision models are at automating real-world processes. Instead of manually verifying cleanups, we essentially built an AI judge.
* **Full-Stack Synergy:** We deepened our understanding of the seamless synergy between Next.js Server Components and Supabase data fetching, allowing us to build a highly responsive and secure app very quickly.
* **Designing for Engagement:** We learned that the UX/UI wrapper around a utility is what ultimately drives engagement. Making civic duty look "cool" is harder than it sounds, but vastly more effective.

---

## 8. Built With
*   **Next.js** (React, TypeScript, App Router)
*   **Supabase** (PostgreSQL, Authentication)
*   **Tailwind CSS** & **shadcn/ui** (Styling & Component Library)
*   **Google Gemini APIs** (LLM Chatbot & Vision Analysis)
*   **Vercel** (Hosting & Deployment)
