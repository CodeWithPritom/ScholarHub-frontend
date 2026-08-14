import re

with open('e:/Websites/NCBI/frontend/src/pages/Auditor.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

def replace_object_assign(match):
    indent = match.group(1)
    var_name = match.group(2)
    props_str = match.group(3)
    
    # Parse props: prop: 'val', prop2: 'val2'
    # Simple regex extraction of key: value pairs
    pairs = re.findall(r'([a-zA-Z0-9_]+)\s*:\s*([^,{}]+)', props_str)
    statements = []
    for prop, val in pairs:
        prop = prop.strip()
        val = val.strip()
        statements.append(f"{indent}{var_name}.style.{prop} = {val};")
    return '\n'.join(statements)

# Pattern: Object.assign(var.style, { ... });
new_content = re.sub(r'(\s*)Object\.assign\(([a-zA-Z0-9_\.]+)\.style,\s*\{([^}]+)\}\);', replace_object_assign, content)

with open('e:/Websites/NCBI/frontend/src/pages/Auditor.jsx', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Done replacing Object.assign in Auditor.jsx")
