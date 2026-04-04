import os

search_dir = r"C:\Users\Shivam O Sharma\Desktop\Projects\Hackathon Projects\GigShield\apps\admin-dashboard\src"

API_VAR = "import.meta.env.VITE_API_URL || 'http://localhost:5000'"

for root, _, files in os.walk(search_dir):
    for file in files:
        if file.endswith(('.jsx', '.js')):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            if 'http://localhost:5000' in content:
                # Replace backtick strings: `http://localhost:5000/claims/${claimId}/status`
                new_content = content.replace("`http://localhost:5000", f"`${{{API_VAR}}}")
                # Replace single quote strings: 'http://localhost:5000/claims'
                new_content = new_content.replace("'http://localhost:5000", f"`${{{API_VAR}}}")
                # And replace the closing quote for those we just changed from ' to `
                new_content = new_content.replace("', {", "`, {")
                new_content = new_content.replace("')", "`)")
                # Fix DocsPage specifically which has text strings
                new_content = new_content.replace(">{import.meta.env.VITE_API_URL || 'http://localhost:5000'}", ">http://localhost:5000")
                
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"Updated {file}")

