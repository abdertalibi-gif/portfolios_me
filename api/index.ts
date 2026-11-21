let app: any;
try {
  const { createApiApp } = await import("../server/app.js");
  app = createApiApp();
} catch (err: any) {
  console.error("createApiApp failed:", err);
  const express = (await import("express")).default;
  app = express();
  app.all("*", (_req: any, res: any) => res.status(500).json({ error: err?.message || String(err), stack: err?.stack }));
}
export default app;
