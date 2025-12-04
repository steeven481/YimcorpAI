# Architecture du Chatbot AI

## Choix techniques

### 1. Framework : Next.js (App Router)
- **Pourquoi** : Support natif de React Server Components, meilleures performances
- **Avantages** : Streaming SSR, layout nesting, route handlers API intégrés

### 2. Base de données : Supabase
- **Pourquoi** : PostgreSQL avec RLS, authentification intégrée, gratuit pour débuter
- **Avantages** :
    - Authentification prête à l'emploi
    - APIs REST/GraphQL générées automatiquement
    - Stockage de fichiers inclus

### 3. LLM : Google Gemini API
- **Pourquoi** : API gratuite (jusqu'à 60 requêtes/minute), bonne qualité
- **Alternative** : OpenAI GPT-4 (payant) ou Claude API

### 4. Styling : Tailwind CSS
- **Pourquoi** : Utilitaires CSS, mobile-first, personnalisation facile
- **Avantages** : Bundle size réduit, développement rapide


