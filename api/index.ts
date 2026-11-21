import { ROOT_DIR } from "../server/env";

export default function handler(req: any, res: any) {
  res.status(200).json({ ok: true, msg: "env imported", root: ROOT_DIR });
}
