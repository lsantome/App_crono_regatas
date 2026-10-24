# Changelog

Formato [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/). Versiones con [semver](https://semver.org/lang/es/).
La versión de `package.json` es la fuente única: la etiqueta de Git es `v` + esa versión.

## [1.1.0] - 2026-10-23

### Añadido
- App Android (Capacitor) en el propio repositorio: `android/`, `capacitor.config.json` y plugin nativo
  (impresión/PDF, pantalla encendida, pantalla completa, botón atrás, compartir Excel).
- Versión única en `package.json`, sellada al compilar: el pie de la app muestra
  `vX.Y.Z · build abc1234 · AAAA-MM-DD` (antes mostraba solo el hash y la fecha).
- Scripts `build:pwa`, `build:android-web`, `android:sync`, `android:debug` y `android:release`.
- Pruebas automáticas (`npm test`): sintaxis, manifest, service worker, ausencia de recursos externos,
  claves de almacenamiento, build y coherencia de Android.
- Workflow `android.yml`: APK y AAB por etiqueta, firmados si están los secretos.
- Documentación: `docs/ANDROID.md`, `docs/GUIA-PLAY-STORE.md`, `CLAUDE.md`; material de la ficha en `store/`.

### Cambiado
- `deploy.yml` pasa a `pages.yml`: ejecuta `npm test` y construye con `npm run build:pwa`; las PR no publican.
- El repositorio se llama `Crono-Regatas`; la URL de la PWA es `https://lsantome.github.io/Crono-Regatas/`.

### Corregido
- En Análisis, el scroll horizontal de gráficos y tablas ya no vuelve al inicio al soltar la barra.

## [1.0.0] - 2026-10-17

### Añadido
- Versión inicial: PWA de cronometraje de regatas publicada en GitHub Pages.
