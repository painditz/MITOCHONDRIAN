import os
import re

tokens = [
    "3000", "15", "7", "2", "1", "5", "96.4", "93.7", "85", "84.5",
    "INC-102", "INC-103", "INC-105", "INC-108", "INC-111",
    "99.38", "100", "83.33", "0.9091", "1.0", "776", "25"
]

client_src = r"c:\Users\ASHMIT\Desktop\MICROSOFT WINNER\client\src"

results = []
for root, dirs, files in os.walk(client_src):
    for f in files:
        if f.endswith((".jsx", ".js", ".ts", ".tsx")):
            path = os.path.join(root, f)
            with open(path, "r", encoding="utf-8", errors="ignore") as fl:
                lines = fl.readlines()
                for line_idx, line in enumerate(lines, 1):
                    for token in tokens:
                        # Find whole words or exact token matches
                        pattern = r'(?<![a-zA-Z0-9_\.])' + re.escape(token) + r'(?![a-zA-Z0-9_\.])'
                        if re.search(pattern, line):
                            rel_path = os.path.relpath(path, client_src)
                            results.append({
                                "file": rel_path,
                                "line": line_idx,
                                "token": token,
                                "snippet": line.strip()
                            })

print(f"Total potential occurrences found: {len(results)}")
# Filter out common UI layout numbers like padding: 1, 2, 5, 15px or svg coords
# Let's inspect significant ones:
for r in results:
    s = r["snippet"]
    t = r["token"]
    # Check if it looks like a hardcoded metric/incident
    if t in ["96.4", "93.7", "85", "84.5", "INC-102", "INC-103", "INC-105", "INC-108", "INC-111", "99.38", "83.33", "0.9091", "776", "25"]:
        print(f"[{r['file']}:{r['line']}] Token '{t}': {s[:100]}")
