# Cronometraje de Regatas — notas para Claude

Responde siempre en español.

## Stack
PWA de un solo archivo (`index.html`, JS vanilla) + service worker, publicada en GitHub Pages.
App Android con Capacitor 8.5.3 (AGP 8.13, Gradle 8.14, JDK 21, Node 22). `appId` `es.regatas.cronometraje`.

## Comandos
`npm ci` · `npm test` · `npm run build:pwa` · `npm run build:android-web` · `npm run android:sync` ·
`npm run android:debug` · `npm run android:release`

## Estructura
`index.html`, `manifest.webmanifest`, `sw.js`, `icons/`, `privacidad.html` (raíz) · `android/` · `capacitor.config.json` ·
`scripts/` · `tests/` · `docs/` (`ANDROID.md`, `GUIA-PLAY-STORE.md`) · `store/` · `.github/workflows/` (`pages.yml`, `android.yml`).

## Reglas
- **Nunca** subir ni mostrar claves, keystores ni contraseñas. La firma va en secretos de GitHub (`docs/ANDROID.md`).
- **No mover el HTML de la raíz.**
- **No renombrar el repositorio** ni cambiar el `appId` de Android ni el `id` del manifest (`regatas-cronometraje`).
- No renombrar claves de `localStorage` (prefijo `regatas.`): se perderían los datos de los usuarios.
- Cachés del service worker con prefijo `regatas-cronometraje-`; solo se borran las propias.
- No hacer push directo a `main` (despliega en Pages): rama + PR. Sin `push --force` ni reescribir historial.
- No tocar a la vez lógica de la app y estructura del repositorio en el mismo cambio.
- Commits en español, formato `tipo: resumen` (`feat`, `fix`, `chore`, `docs`, `test`, `ci`).
- Nunca dar por verificado lo que no se ha ejecutado.

## Subir de versión
1. Editar `version` en `package.json` (semver) y añadir la entrada en `CHANGELOG.md`.
2. Commit en una rama, PR y merge a `main`.
3. Etiqueta `vX.Y.Z` (igual a `package.json`) y `git push origin vX.Y.Z`: el workflow *Android* compila APK y AAB.
`versionCode` de Android = X·10000 + Y·100 + Z (calculado en `android/app/build.gradle`; no se escribe a mano).
