# Textures April (Maxime)

Copier ici les 7 PNG exportés avec le GLTF Sketchfab, **avec ces noms exacts** :

| Fichier | Contenu |
|---|---|
| `Material.004_baseColor.png` | Peau / visage (albedo) |
| `Material.004_metallicRoughness.png` | ORM visage (métal / rugosité) |
| `Material.004_normal.png` | Normal map visage |
| `Material.002_baseColor.png` | Globe oculaire (yeux du mesh, masqués en jeu) |
| `hair_baseColor.png` | Cheveux (albedo) |
| `hair_metallicRoughness.png` | Cheveux (alpha / ORM — fond magenta) |
| `hair_normal.png` | Normal map cheveux |

Puis à la racine du projet :

```bash
npm run prepare:april-model
```

Le script emballe tout dans `../maxime.glb`.
