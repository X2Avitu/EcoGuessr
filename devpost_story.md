# The Story of PLATZ

## Inspiration
Traditional civic engagement initiatives often struggle with low participation rates, particularly among younger demographics. Cleanup efforts are frequently viewed as unrewarding administrative chores rather than collaborative community activities. We realized that by applying modern gamification mechanics, user-centric design principles, and automated verification systems, we could fundamentally transform how citizens interact with their local environment. PLATZ was created to modernize environmental stewardship, transforming it into a highly engaging, community-driven ecosystem where tangible actions are rewarded transparently.

## What it does
PLATZ is an AI-powered civic platform designed to decentralize and incentivize urban cleanups. 
*   **Decentralized Coordination:** Users form "Squads", utilize an interactive geographic dashboard to locate environmental hazard zones (pollution hotspots), and orchestrate targeted cleanup missions.
*   **AI Vision Verification:** To eliminate the need for manual oversight, users photograph the completed cleanup. Our integrated AI Vision pipeline processes the image to classify the threat taxonomy (e.g., hazardous waste, recyclables), estimates volume, and dynamically allocates reputation points based on the environmental impact of the intervention.
*   **Intelligent Onboarding:** A contextual AI Agent acts as a platform concierge, guiding users through complex workflows, explaining local environmental challenges, and strategically recommending nearby hotspots based on user history.

## How we built it
We engineered PLATZ as a high-performance, full-stack enterprise application utilizing the **Next.js App Router** for optimized server-side rendering and resilient API endpoints. Our data layer relies on **Supabase** (PostgreSQL) to manage secure OAuth authentication, transactional user data, and real-time telemetry for the global leaderboards.

To ensure a robust, feature-rich ecosystem, we aggregated several powerful third-party APIs into our architecture:
*   **Google Gemini APIs:** Powers our core intelligence. The Vision model handles complex image classification for environmental threat analysis, while the LLM powers our conversational concierge agent.
*   **Mapbox GL JS API:** Renders our highly customized geographic interfaces, allowing for complex vector tile rendering of environmental hotspots.
*   **OpenWeatherMap API:** Ingests real-time meteorological data to dynamically adjust accessibility scores for hotspots (e.g., warning users of extreme weather or applying point multipliers for adverse conditions).
*   **Google Maps Geocoding API:** Translates latent EXIF GPS data from user uploads into actionable neighborhood metrics and human-readable location tags.
*   **Resend API:** Manages our transactional email infrastructure, dispatching automated alerts when critical hotspots emerge in a user's registered district.

The algorithmic scoring runs dynamically, calculating the rewarded points ($P$) via our automated environmental impact matrix:

$$ P = \sum_{i=1}^{n} (T_i \times V_i \times W_f) \times S_m $$

*(Where $T$ is the Threat Level, $V$ is Volume, $W_f$ is the Weather factor derived from OpenWeatherMap, and $S_m$ is the active Squad Multiplier.)*

## Challenges we ran into
1.  **AI Vision Determinism:** Ensuring high confidence thresholds from the vision model across highly variable lighting conditions and complex backgrounds (e.g., urban streets vs. dense foliage) required rigorous prompt engineering and temperature tuning.
2.  **API Orchestration:** Synchronously resolving the Gemini API analysis, Reverse Geocoding, and OpenWeatherMap data while maintaining a sub-second response time on the Next.js edge runtime demanded aggressive caching strategies and asynchronous microservices.
3.  **State Management:** Coordinating real-time leaderboard data from Supabase alongside dynamic Mapbox vector updates required strict adherence to React concurrency models to prevent memory leaks and UI stuttering.

## Accomplishments that we're proud of
*   **Zero-Trust Verification Pipeline:** We successfully automated physical-world validation. By fusing computer vision with geofencing, we created a robust system that prevents gamification abuse without human adjudication.
*   **Seamless API Aggregation:** We achieved a deeply integrated architecture where mapping, weather data, communication, and AI reasoning interact fluidly without compromising the end-user experience.
*   **Enterprise-Grade UX/UI:** We maintained strict design system guidelines using Tailwind CSS and components, resulting in an interface that rivals top-tier consumer applications in accessibility and polish.

## What we learned
*   **Architectural Scalability:** We deepened our understanding of serverless architectures, particularly how to implement defensive programming when relying on third-party APIs with variable rate limits (like LLMs and geocoders).
*   **AI as Infrastructure, Not Just a Feature:** We realized the paradigm shift of using AI strictly as a functional data parser and verification engine, rather than just a conversational tool.
*   **Data Synthesis:** Pulling in disparate data points (weather, geospatial, visual) into a single cohesive impact score taught us the intricacies of multi-variable data synthesis.

## What's next for Platz
*   **Municipal API Integrations:** We intend to interface directly with city Open Data portals (e.g., 311 systems) to automatically populate our map with municipal trash complaints.
*   **Predictive AI Modeling:** Utilizing historical cleanup data and weather patterns to train predictive models that forecast where litter accumulation is most likely to occur next.
*   **Corporate CSR Sponsorships:** Deploying smart contracts to allow corporations to fund specific environmental targets, releasing micro-grants to squads upon successful, AI-verified cleanups.

## Built With (Tags for Devpost)
*Copy and paste these exact tags into the "Built With" input box on Devpost:*

`next.js, react, typescript, supabase, postgresql, postgis, tailwind css, shadcn/ui, framer motion, radix ui, vercel, google gemini api, mapbox, openweathermap api, google maps geocoding api, resend, twilio api, node.js, json web tokens (jwt), websockets, graphql, aws s3, supabase storage, github actions, figma`
