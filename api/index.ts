import { createApiApp } from "../server/app";

// Point d'entrée Vercel Functions : toutes les routes /api/* sont gérées par l'app Express.
const app = createApiApp({ serveStatic: false });

export default app;