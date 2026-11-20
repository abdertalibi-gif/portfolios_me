import { createApiApp } from "./app";

const port = Number(process.env.PORT || 3001);

// Vercel serverless configuration
// Vercel will automatically export the app as a serverless function
const app = createApiApp({ serveStatic: false });

// For local development, start the server
if (process.env.NODE_ENV !== "production") {
  app.listen(port, () => {
    console.log(`[server] Portfolio + admin disponibles sur http://localhost:${port}`);
  });
}

// Export for Vercel serverless functions
export default app;
