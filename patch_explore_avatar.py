f = 'c:/Users/Mansy/Desktop/Naanaa/naanaa_frontend/src/components/Explore.js'
with open(f, encoding='utf-8') as fp:
    content = fp.read()

# Replace recipe image fallback in both ChefCard and RestaurantCard
old = "src={recipe.image || '/\u2014Pngtree\u2014default avatar profile icon gray_20971753.png'}\n          alt={recipe.title} className="
new = "src={recipe.image || DEFAULT_AVATAR}\n          alt={recipe.title} onError={onImgError} className="
content = content.replace(old, new)

count = content.count('DEFAULT_AVATAR')
print('Done. DEFAULT_AVATAR count:', count)

with open(f, 'w', encoding='utf-8') as fp:
    fp.write(content)
