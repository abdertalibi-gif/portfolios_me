import { createApiApp } from "./app";

const port = Number(process.env.PORT || 3001);
const app = createApiApp({ serveStatic: true });

app.listen(port, () => {
  console.log(`[server] Portfolio + admin disponibles sur http://localhost:${port}`);
});
