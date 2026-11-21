import { Pool } from "pg";

export default function handler(req: any, res: any) {
  res.status(200).json({ ok: true, msg: "pg imported", pool: typeof Pool });
}
