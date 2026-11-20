# Abderrahim Talibi — Portfolio

Personal portfolio of **Abderrahim Talibi**, Software Engineer | AI & Backend Developer and Master's student in Data Science & Artificial Intelligence (SDIA) at Université Moulay Ismaïl (Meknès, Morocco).

Live sections: Home · About · Skills · Projects · Education · Academic Projects · Achievements · Contact, in four languages (FR / EN / DE / AR).

## Stack

- **Frontend:** React 19, Vite 8, TypeScript, Tailwind CSS v4, Framer Motion, react-i18next, lucide-react
- **Backend (dev):** Express 4 (embedded in Vite dev server), JSON file store (`data/db.json`), scrypt password hashing, rate limiting
- **Content:** DB-backed portfolio content with seeded fallback (`shared/seedContent.ts`) so the site works even without the API

## Run locally

```bash
npm install --legacy-peer-deps
npm run dev          # Vite + Express API on http://localhost:3000
```

Admin dashboard: `http://localhost:3000/admin/login` (credentials from `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env`).

## Build

```bash
npm run build        # outputs dist/
npm run lint         # tsc --noEmit
```

## Deploy

- Static hosting (Vercel/Netlify): `npm run build`, output `dist/`. The site renders from seeded content; the admin and contact email require the Express backend.
- Full stack: run `npm start` (Express) behind a reverse proxy, or deploy the API separately.

## Project layout

```
src/        React app (components, pages, context, i18n)
shared/     Types + seeded content + identity constants
server/     Express API (auth, content, messages, uploads)
data/       JSON database (db.json) + uploads
public/     Static assets (images, cv.pdf)
```

## License

MIT — see the repository.
