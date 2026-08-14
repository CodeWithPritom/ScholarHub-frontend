with open('e:/Websites/NCBI/frontend/src/pages/Auditor.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for idx, line in enumerate(lines, 1):
    # Check for odd number of single quotes (ignoring escaped ones)
    clean_line = line.replace(\"\\'\", \"\")
    if clean_line.count(\"'\") % 2 != 0:
        print(f\"Line {idx}: {line.strip()}\")
