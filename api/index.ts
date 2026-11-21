import { createApiApp } from "../server/app";

export default function handler(req: any, res: any) {
  res.status(200).json({ ok: true, msg: "imported", type: typeof createApiApp });
}
