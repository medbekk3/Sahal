# SAHAL

Production-ready web application built with **Next.js 15**, **TypeScript**, **Tailwind CSS**, **shadcn/ui**, **Firebase**, **Google Maps**, and **Framer Motion**.

## Architecture

```
src/
├── app/                 # Next.js App Router (presentation)
├── application/         # Use cases (business orchestration)
├── components/          # Shared UI & layout
├── domain/              # Entities, repositories & service interfaces
├── features/            # Feature-specific UI modules
├── hooks/               # React hooks
├── infrastructure/      # Firebase, Google Maps, DI container
├── lib/                 # Utilities & validators
└── providers/           # React context providers
```

**Clean architecture layers:**

| Layer | Responsibility |
|-------|----------------|
| `domain` | Pure business types and contracts (no framework deps) |
| `application` | Use cases that orchestrate domain + infrastructure |
| `infrastructure` | Firebase, Google APIs, external adapters |
| `features` / `app` | UI and Next.js routes |

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

### 3. Firebase setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Authentication** (Email/Password + Google)
3. Create a **Firestore** database
4. Enable **Storage**
5. Enable **Cloud Messaging** and generate a Web Push certificate (VAPID key)
6. Copy `public/firebase-messaging-sw.js.example` → `public/firebase-messaging-sw.js` with your config
7. Deploy security rules from `firebase/`:

```bash
firebase deploy --only firestore:rules,storage
```

### 4. Google Maps setup

1. Enable **Maps JavaScript API** and **Directions API** in Google Cloud Console
2. Add your API key to `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
3. Restrict the key by HTTP referrer in production

### 5. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |

## Key integrations

- **Auth** — `FirebaseAuthService` with Firestore user profiles
- **Firestore** — `FirestoreUserRepository`
- **Storage** — `FirebaseStorageService` with dashboard upload UI
- **FCM** — `FirebaseNotificationService` + service worker
- **Maps** — `@react-google-maps/api` map component
- **Directions** — Server-side proxy at `/api/directions` (avoids CORS)

## Adding features

1. Define entities/interfaces in `src/domain`
2. Add a use case in `src/application/use-cases`
3. Implement adapter in `src/infrastructure`
4. Register in `src/infrastructure/di/container.ts`
5. Build UI in `src/features/<feature-name>`

## License

Private — all rights reserved.
