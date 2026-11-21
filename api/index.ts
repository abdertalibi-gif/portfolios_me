import { createApiApp } from "../server/app.js";

let app: any;
let initError: any = null;
try {
  app = createApiApp();
} catch (err: any) {
  console.error("createApiApp failed:", err?.message, err?.stack);
  initError = err;
}

export default function handler(req: any, res: any) {
  if (initError) {
    return res.status(500).json({ error: "init failed", message: initError?.message, stack: initError?.stack });
  }
  if (!app) {
    return res.status(500).json({ error: "app not initialized" });
  }
  return app(req, res);
}
