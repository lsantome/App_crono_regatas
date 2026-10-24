# App de Android

La app es un contenedor Android (**Capacitor 8.5.3**) que lleva dentro la web (`index.html`) y
funciona sin conexión. `appId`: **`es.regatas.cronometraje`** (no se cambia).
Para el proceso de alta y publicación en Google Play, ver [GUIA-PLAY-STORE.md](GUIA-PLAY-STORE.md).

| Pieza | Dónde |
|---|---|
| Web (fuente única) | `index.html` en la raíz |
| Web empaquetada en el APK | `dist/app/` (se genera con `npm run build:android-web`; no se versiona) |
| Proyecto Android | `android/` |
| Código nativo propio | `android/app/src/main/java/es/regatas/cronometraje/` |
| Versión | `version` de `package.json` (`versionName` = X.Y.Z, `versionCode` = X·10000 + Y·100 + Z) |

## Versiones fijadas

Node 22 · JDK 21 · Capacitor 8.5.3 · Android Gradle Plugin 8.13 · Gradle 8.14.3 · compileSdk/targetSdk 36 · minSdk 24.

**No aceptes la actualización de AGP/Gradle que Android Studio ofrece.** Con AGP 9 el proyecto necesita
diez opciones de compatibilidad en `gradle.properties` y el estándar de los repositorios usa 8.13.

## Compilar en local

Requisitos: Node 22, JDK 21 (Temurin) con `JAVA_HOME`, y el Android SDK con *Platform 36*
(`ANDROID_HOME` o `android/local.properties` con `sdk.dir=…`, que Android Studio crea solo).

```bash
npm ci                    # una vez
npm test                  # opcional
npm run android:debug     # APK de depuración → android/app/build/outputs/apk/debug/app-debug.apk
npm run android:release   # APK + AAB de release → android/app/build/outputs/{apk,bundle}/release/
```

Sin claves de firma, el release sale **sin firmar** (no instalable ni subible a Play).
Para abrirlo en Android Studio: `npm run android:sync` y **File ▸ Open** sobre la carpeta `android/`.

## Funciones nativas (no se pueden perder)

Plugin `RegatasNative` (`RegatasNativePlugin.java`) y `MainActivity.java`:

| Función | Cómo se implementa |
|---|---|
| Impresión / PDF | `print`: diálogo de impresión del sistema, A4 horizontal, «Guardar como PDF» (el WebView no implementa `window.print()`) |
| Pantalla siempre encendida | `keepAwake`: bandera `FLAG_KEEP_SCREEN_ON` |
| Pantalla completa | `immersive`: oculta las barras del sistema; se reaplica al recuperar el foco |
| Botón / gesto atrás | `MainActivity` pregunta a la web (`window.__nativeBack`): cierra el análisis; en regata exige dos pulsaciones para salir |
| Compartir y guardar archivos (Excel) | plugins `@capacitor/share` y `@capacitor/filesystem` + `FileProvider` |
| Sin service worker | la web detecta `window.Capacitor` y no lo registra: los archivos van en el paquete |
| Sin copia de seguridad automática | `allowBackup="false"`, para no restaurar regatas antiguas en otro móvil |

## Crear el keystore (una vez, en tu PC)

El keystore es la clave de firma. **Una por app. Nunca dentro del repositorio.** Guárdalo en una carpeta
fuera del repo (por ejemplo `C:\Users\<tú>\claves\`).

```powershell
& "$env:JAVA_HOME\bin\keytool.exe" -genkeypair -v -keystore crono-regatas-release.jks -alias crono-regatas -keyalg RSA -keysize 2048 -validity 10000
```

`keytool` te pedirá una contraseña para el almacén y otra para la clave. Apunta el **alias**
(`crono-regatas`) y ambas contraseñas.

**Copia de seguridad.** El `.jks`, el alias y las contraseñas deben quedar guardados **fuera del PC**
(gestor de contraseñas, memoria USB…). Es lo único irrecuperable del proyecto. Con *Play App Signing*
Google guarda la clave definitiva y esta actúa como clave de subida, que se puede restablecer
pidiéndolo a Google, pero conviene no llegar a ese punto.

## Cargar la firma en GitHub (4 secretos)

1. Codifica el keystore en base64 y cópialo al portapapeles:
   ```powershell
   [Convert]::ToBase64String([IO.File]::ReadAllBytes("C:\ruta\crono-regatas-release.jks")) | Set-Clipboard
   ```
   (En Linux/macOS: `base64 -w0 crono-regatas-release.jks`.)
2. En GitHub: **Settings ▸ Secrets and variables ▸ Actions ▸ New repository secret** y crea estos cuatro:

   | Secreto | Contenido |
   |---|---|
   | `ANDROID_KEYSTORE_BASE64` | el base64 del paso anterior |
   | `ANDROID_KEYSTORE_PASSWORD` | contraseña del almacén |
   | `ANDROID_KEY_ALIAS` | `crono-regatas` (o el alias que usaste) |
   | `ANDROID_KEY_PASSWORD` | contraseña de la clave |

3. Nunca pegues estos valores en el chat, en issues ni en archivos del repositorio.

Para firmar **en local** define las variables de entorno `ANDROID_KEYSTORE_PATH` (ruta del `.jks`),
`ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS` y `ANDROID_KEY_PASSWORD`, o crea `android/keystore.properties`
(ignorado por Git):

```
storeFile=C:/ruta/crono-regatas-release.jks
storePassword=...
keyAlias=...
keyPassword=...
```

## Publicar una versión

1. Rama + PR con los cambios; sube `version` en `package.json` y añade la entrada en `CHANGELOG.md`.
2. Merge en `main`. La web se publica sola en Pages.
3. Etiqueta (debe ser exactamente `v` + la versión de `package.json`) y súbela:
   ```bash
   git tag v1.1.0
   git push origin v1.1.0
   ```
4. El workflow **Android** comprueba la etiqueta, rechaza claves versionadas, ejecuta los tests y compila.
   Con los 4 secretos genera **APK y AAB de release firmados** y los adjunta a la Release de GitHub.
   Sin ellos genera un APK de depuración y lo avisa en el log (no sirve para Play).
5. Sube el `.aab` a Play Console.

Para un **APK de prueba sin etiqueta**: *Actions ▸ Android (APK y AAB) ▸ Run workflow*. El binario queda en
*Artifacts* de la ejecución durante 30 días. El repositorio es público: cualquiera con sesión en GitHub
podría descargar un artefacto de depuración (no lleva claves ni datos tuyos).

## Problemas frecuentes

| Síntoma | Causa y solución |
|---|---|
| Android Studio ofrece actualizar AGP/Gradle | Recházalo (ver «Versiones fijadas») |
| «No se instaló la aplicación» al abrir un APK de release | Está sin firmar: usa el de depuración o configura la firma |
| El workflow falla con «La etiqueta … no coincide con package.json» | Sube `version` en `package.json` o crea la etiqueta correcta |
| El workflow falla con «Hay una clave … versionada» | Quita el archivo del repositorio y trata la clave como comprometida |
