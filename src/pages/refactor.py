import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find sequences of var.style.prop = value
    lines = content.split('\n')
    new_lines = []
    
    current_var = None
    current_styles = []
    
    def flush_styles():
        if current_var and current_styles:
            props = ", ".join([f"{k}: {v}" for k, v in current_styles])
            return f"    Object.assign({current_var}.style, {{ {props} }});"
        return None

    i = 0
    while i < len(lines):
        line = lines[i]
        match = re.search(r'^(\s*)([a-zA-Z0-9_]+)\.style\.([a-zA-Z0-9_]+)\s*=\s*(.*?);(.*)$', line)
        if match:
            indent, var_name, prop, val, rest = match.groups()
            
            if current_var is None:
                current_var = var_name
                current_styles.append((prop, val))
            elif current_var == var_name:
                current_styles.append((prop, val))
            else:
                new_lines.append(indent + flush_styles().strip())
                current_var = var_name
                current_styles = [(prop, val)]
        else:
            if current_var:
                new_lines.append(indent + flush_styles().strip())
                current_var = None
                current_styles = []
            new_lines.append(line)
        i += 1
        
    if current_var:
        new_lines.append(indent + flush_styles().strip())
        
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write('\n'.join(new_lines))

process_file('e:/Websites/NCBI/frontend/src/pages/Auditor.jsx')
