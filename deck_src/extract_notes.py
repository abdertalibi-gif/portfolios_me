# -*- coding: utf-8 -*-
"""Extract slide titles + notes from the delivered oral script (single source of truth)."""
import json
import os
import re

SRC = r"C:\Users\Abde\Desktop\ABDE RAHIM\excelllll\Discours_oral_detaille.md"
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "notes.json")

text = open(SRC, encoding="utf-8").read()
blocks = re.split(r"^## Diapositive (\d+) — (.+)$", text, flags=re.M)
# blocks: [preamble, n, title, body, n, title, body...]
items = []
for i in range(1, len(blocks), 3):
    n = int(blocks[i])
    title = blocks[i + 1].strip()
    body = blocks[i + 2]
    meta = re.search(r"^\*(.+?) · transition : (.+?) · (\d+) temps d.animation\*$", body, flags=re.M)
    part = meta.group(1).strip() if meta else ""
    transition = meta.group(2).strip() if meta else "Fondu"
    body = re.sub(r"^\*.*?\*$", "", body, count=1, flags=re.M)
    body = body.replace("---", "").strip()
    body = re.sub(r"\n{3,}", "\n\n", body)
    items.append({"n": n, "title": title, "part": part, "transition": transition, "notes": body})

assert len(items) == 30, len(items)
with open(OUT, "w", encoding="utf-8") as fh:
    json.dump(items, fh, ensure_ascii=False, indent=1)
print("extracted", len(items), "->", OUT)
for it in items[:3]:
    print(it["n"], it["title"], "|", it["part"], "|", it["transition"], "|", len(it["notes"]))
