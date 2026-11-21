import { createApiApp } from "../server/app";

export default function handler(req: any, res: any) {
  try {
    const app = createApiApp();
    return app(req, res);
  } catch (err: any) {
    return res.status(500).json({ error: "createApiApp failed", message: err?.message, stack: err?.stack });
  }
}
