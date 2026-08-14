# Modèle 3D — Rihanna (cas 3)

## Fichiers attendus

1. Exporter depuis Sketchfab en **glTF** (`.gltf` + `.bin` + textures) ou **GLB**.
2. Placer les sources ici :
   - `scene-source.gltf` (export Sketchfab brut)
   - ou directement `rihanna.glb` (fichier servi par l'app)

## Intégration dans Orthoptix

Le cas clinique référence `public/models/rihanna/rihanna.glb` via `src/scene/modeles-tete.ts`.

Après ajout du modèle :

1. Ajuster `decalageFin`, `decalageOrbites`, `masquer` si besoin (voir Maxime / April).
2. Vérifier que le modèle expose des meshes « Eye » ou définir `orbites` manuellement.
3. Lancer l'app et tester le zoom reflets + cover test.

## Crédit Sketchfab

Renseigner `license.txt` avec l'URL du modèle, l'auteur et la licence (CC-BY-4.0 en général).
