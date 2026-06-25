f = 'c:/Users/Mansy/Desktop/Naanaa/naanaa_frontend/src/components/ChefDashboard.js'
with open(f, encoding='utf-8', errors='replace') as fp:
    content = fp.read()

# Fix: inject owner_type before image append (LF version)
old_img = "    if (imageFile) {\n      data.append('image', imageFile);\n    }"
new_img = "    data.append('owner_type', activeTab);\n    if (imageFile) {\n      data.append('image', imageFile);\n    }"

if old_img in content:
    content = content.replace(old_img, new_img, 1)
    print("owner_type OK")
else:
    # find the line and print context
    for i, line in enumerate(content.split('\n')):
        if 'imageFile' in line and 'append' in line:
            print(f"Line {i+1}: {repr(line[:80])}")

# Fix toast message
old_toast = "        setMessage({ type: 'success', text: '\u062a\u0645 \u0625\u0636\u0627\u0641\u0629 \u0627\u0644\u0648\u0635\u0641\u0629 \u0628\u0646\u062c\u0627\u062d!' });\n        showToast('\u062a\u0645 \u0627\u0644\u0646\u0634\u0631 \u0628\u0646\u062c\u0627\u062d', 'success');"
new_toast = "        const addSuccessMsg = activeTab === 'restaurant' ? '\u062a\u0645 \u0625\u0636\u0627\u0641\u0629 \u0627\u0644\u0635\u0646\u0641 \u0644\u0644\u0642\u0627\u0626\u0645\u0629 \u0628\u0646\u062c\u0627\u062d!' : '\u062a\u0645 \u0646\u0634\u0631 \u0627\u0644\u0648\u0635\u0641\u0629 \u0628\u0646\u062c\u0627\u062d!';\n        setMessage({ type: 'success', text: addSuccessMsg });\n        showToast(addSuccessMsg, 'success');"

if old_toast in content:
    content = content.replace(old_toast, new_toast, 1)
    print("Toast OK")
else:
    print("Toast not found - searching...")
    for i, line in enumerate(content.split('\n')):
        if 'success' in line and ('toast' in line.lower() or 'message' in line.lower()) and 'add' in line.lower():
            print(f"Line {i+1}: {repr(line[:100])}")

with open(f, 'w', encoding='utf-8', errors='replace') as fp:
    fp.write(content)
print("Done")
