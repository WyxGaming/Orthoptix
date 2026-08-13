# Textures April (Maxime)

Les textures sont **générées automatiquement** par `npm run prepare:april-model`.
Aucun fichier PNG à déposer manuellement.

Le script produit des textures procédurales (peau, cheveux, yeux) puis emballe
tout dans `../maxime.glb` avec les textures embarquées.

Pour remplacer par les textures Sketchfab originales : déposer les 7 PNG exportés
depuis Sketchfab (noms identiques à ceux référencés dans `scene-source.gltf`),
puis relancer `npm run prepare:april-model`.
