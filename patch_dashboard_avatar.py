f = 'c:/Users/Mansy/Desktop/Naanaa/naanaa_frontend/src/components/ChefDashboard.js'
with open(f, encoding='utf-8') as fp:
    content = fp.read()

# 1. Add import for avatar utils right after the last import line
old_import = "import { Camera, Save, Loader2, Image as ImageIcon, Plus, Trash2, RefreshCcw, Edit2, Clock, Flame, ShieldAlert, Coffee, UtensilsCrossed } from 'lucide-react';"
new_import = old_import + "\nimport { DEFAULT_AVATAR, onImgError } from '../utils/avatar';"

content = content.replace(old_import, new_import, 1)

# 2. Replace all Pngtree fallbacks for recipe.image
content = content.replace(
    "recipe.image || '/\u2014Pngtree\u2014default avatar profile icon gray_20971753.png'",
    "recipe.image || DEFAULT_AVATAR"
)

# 3. Add onError to all <img> tags that reference DEFAULT_AVATAR (recipe images in cards)
# We target the pattern inside the recipe card img
content = content.replace(
    "alt={recipe.title} className=\"w-full h-full object-cover group-hover:scale-105 transition-transform duration-500\"",
    "alt={recipe.title} onError={onImgError} className=\"w-full h-full object-cover group-hover:scale-105 transition-transform duration-500\""
)

count_da = content.count('DEFAULT_AVATAR')
count_oe = content.count('onImgError')
print(f'Done. DEFAULT_AVATAR={count_da}, onImgError={count_oe}')

with open(f, 'w', encoding='utf-8') as fp:
    fp.write(content)
