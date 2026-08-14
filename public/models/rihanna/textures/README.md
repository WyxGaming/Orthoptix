# Textures Rihanna (Sketchfab)

Déposer ici les **7 PNG** exportés depuis Sketchfab (noms identiques au GLTF source) :

| Fichier | Rôle |
|---------|------|
| `t_head_baseColor.png` | Peau — couleur |
| `t_head_metallicRoughness.png` | Peau — métal / rugosité |
| `t_head_normal.png` | Peau — normal (remplace le `.jpeg` du GLTF) |
| `t_cards_baseColor.png` | Cheveux — couleur |
| `t_cards_metallicRoughness.png` | Cheveux — métal / rugosité |
| `t_cards_normal.png` | Cheveux — normal |
| `t_cards_specularf0.png` | Cheveux — spéculaire |

Puis régénérer le modèle servi :

```bash
npm run prepare:rihanna-model
```

Le script emballe tout dans `../rihanna.glb`. Commiter les PNG **et** le GLB mis à jour.

Sans ces fichiers, le script génère des textures procédurales de secours.
