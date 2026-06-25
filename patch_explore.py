f = 'c:/Users/Mansy/Desktop/Naanaa/naanaa_frontend/src/components/Explore.js'
with open(f, encoding='utf-8') as fp:
    content = fp.read()

old = '                     </div>\n                  </div>\n\n                  <div className="p-5 flex-1 flex flex-col">'
new = '''                     </div>
                     {recipe.price != null && (
                        <div className="absolute top-3 left-12 bg-orange-500 text-white text-xs px-2 py-1 rounded-lg font-bold shadow">
                          {recipe.price} EGP
                        </div>
                     )}
                     {!recipe.price && recipe.difficulty_level && (
                        <div className={`absolute top-3 left-12 text-white text-xs px-2 py-1 rounded-lg font-bold shadow ${
                          recipe.difficulty_level === 'Easy' ? 'bg-green-500' :
                          recipe.difficulty_level === 'Medium' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}>
                          {recipe.difficulty_level === 'Easy' ? '\u0633\u0647\u0644 \ud83d\udfe2' : recipe.difficulty_level === 'Medium' ? '\u0645\u062a\u0648\u0633\u0637 \ud83d\udfe1' : '\u0645\u062d\u062a\u0631\u0641 \ud83d\udd34'}
                        </div>
                     )}
                  </div>

                  <div className="p-5 flex-1 flex flex-col">'''

if old in content:
    content = content.replace(old, new, 1)
    print("Patched OK")
else:
    print("Not found. Trying without blank line...")
    old2 = '                     </div>\n                  </div>\n                  <div className="p-5 flex-1 flex flex-col">'
    if old2 in content:
        content = content.replace(old2, new.replace('\n\n                  <div', '\n                  <div'), 1)
        print("Patched OK (no blank)")
    else:
        print("FAIL - searching nearby...")

with open(f, 'w', encoding='utf-8') as fp:
    fp.write(content)
print("Done")
