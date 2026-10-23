# Publicar «Cronometraje de Regatas» en Google Play

Guía en orden. Lo marcado con ⚠️ es lo que más suele salir mal.
Fuentes oficiales al final.

## 0. Cómo está montada la app Android

La app es un contenedor Android (**Capacitor**) que lleva **dentro** tu `index.html` y funciona sin conexión.

| Pieza | Dónde |
|---|---|
| Web (única fuente de verdad) | `index.html` (raíz del repositorio) |
| Copia empaquetada en Android | `dist/app/` (se regenera con `npm run android:sync`; no se edita a mano ni se versiona) |
| Proyecto Android Studio | `android/` |
| Código nativo propio | `android/app/src/main/java/es/regatas/cronometraje/` |
| Material de la ficha | `store/` |

Qué cambia respecto al PWA, y por qué:

| Función | PWA / navegador | App Android |
|---|---|---|
| Excel | descarga directa | se guarda en caché y abre la hoja de **Compartir** (Drive, Gmail, «Guardar en…») |
| PDF | `window.print()` | diálogo de impresión de Android → «Guardar como PDF» (el WebView no implementa `window.print()`) |
| Pantalla encendida | Wake Lock API | bandera nativa `KEEP_SCREEN_ON` |
| Pantalla completa | Fullscreen API | oculta barras del sistema; el botón la activa/desactiva y recuerda la preferencia |
| Botón atrás | — | cierra el análisis; en regata exige **dos pulsaciones** para salir |
| Service worker | sí | no (los archivos van en el paquete) |

⚠️ **Consecuencia importante:** los cambios que publiques en GitHub Pages **no llegan** a la app de Play. Cada cambio en la web exige una nueva versión en Play Store (paso 12). Es el precio de que funcione 100 % sin conexión.

## 1. Requisitos en tu equipo
- Android Studio **reciente** con **Android SDK Platform 36** (SDK Manager ▸ SDK Platforms). El proyecto está fijado a Android Gradle Plugin 8.13 y Gradle 8.14: **no aceptes la actualización automática** de AGP/Gradle que Android Studio ofrece. Necesita **JDK 21**.
- Node.js 22 o superior (para `npm`).
- Un móvil Android con depuración USB (recomendado) o un emulador.

## 2. Abrir, compilar y probar
```bash
npm ci                 # una vez (instala Capacitor)
npm run android:sync   # construye dist/app y lo sincroniza con android/
```
Después, en Android Studio: **File ▸ Open** y elige la carpeta **`android/`** (no la raíz del repositorio). Espera al «Gradle sync», elige tu móvil y pulsa ▶ **Run**.

⚠️ **Pruébalo en un dispositivo real antes de seguir** (lista en el paso 13). Yo he podido compilar el proyecto, pero no ejecutarlo en un Android.

## 3. Decisiones que no se pueden deshacer
**ID de la app (applicationId).** Es `es.regatas.cronometraje` y **no se cambia**: es permanente en cuanto subes el primer paquete, y cambiarlo después de instalar la app la convertiría en otra distinta.

**Política de privacidad.** Play la exige. Está en `privacidad.html` (raíz) y el workflow *Pages* ya la publica.
1. Abre ese archivo y sustituye `[PON AQUÍ TU CORREO DE CONTACTO]` por tu correo.
2. Súbelo a `main` (por PR). La URL será `https://lsantome.github.io/Crono-Regatas/privacidad.html`.
3. Ábrela en el navegador y comprueba que carga **antes** de pegarla en Play Console.

**Versión.** Se cambia **solo** en `package.json` (`version`, formato `X.Y.Z`): de ahí salen `versionName` (X.Y.Z) y `versionCode` (X·10000 + Y·100 + Z; 1.1.0 → 10100). Debe subir en cada subida a Play.

## 4. Firma: crea tu keystore y guárdalo
Android Studio ▸ **Build ▸ Generate Signed App Bundle / APK ▸ Android App Bundle ▸ Create new…**
Guarda el `.jks` y las contraseñas en un gestor de contraseñas **y en una copia de seguridad fuera del ordenador**. No lo subas a git (ya está en `.gitignore`). Cómo crearlo por línea de comandos y cargarlo como secreto de GitHub: [ANDROID.md](ANDROID.md).

Con **Play App Signing** (activo por defecto en apps nuevas), Google guarda la clave de firma definitiva y tu keystore actúa como **clave de subida**: si la pierdes se puede restablecer pidiéndolo a Google, pero conviene no llegar a ese punto.

Alternativa por línea de comandos: define las variables `ANDROID_KEYSTORE_PATH`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS` y `ANDROID_KEY_PASSWORD`, o crea `android/keystore.properties` (no se sube a git):
```
storeFile=/ruta/a/tu-clave.jks
storePassword=...
keyAlias=...
keyPassword=...
```
y ejecuta `npm run android:release`.

El paquete queda en `android/app/build/outputs/bundle/release/app-release.aab`. **Play Store pide AAB, no APK.**

## 5. Cuenta de desarrollador de Google Play
- Cuota **única de 25 USD**, con tarjeta (no se admiten prepago). Mayor de 18 años.
- Dos tipos: **personal** u **organización** (esta exige número D-U-N-S, gratuito pero puede tardar hasta 30 días).
- Verificación de contacto con código (correo y teléfono) y de nombre/dirección legales; la de pago puede tardar hasta 5 días.
- Las cuentas personales deben además demostrar que tienen un dispositivo Android desde la app móvil de Play Console.

⚠️ **Cuentas personales creadas después del 13/11/2023:** antes de poder publicar en producción hay que ejecutar una **prueba cerrada con al menos 12 testers inscritos de forma continua durante 14 días** y luego solicitar el acceso a producción. Si tu cuenta es anterior o de organización, esta parte puede no aplicarte (Google lo limita a cuentas personales; compruébalo en tu panel).
Plan realista: **2–3 semanas** entre el alta y la publicación.

## 6. Crear la app en Play Console
**Todas las apps ▸ Crear app**: nombre «Cronometraje de Regatas», idioma es-ES, **App** (no juego), **Gratuita**, y acepta las declaraciones.

## 7. Ficha de la tienda
Textos listos en `store/ficha-play-store.md`. Gráficos en `store/`:
icono `icono-512.png`, gráfico de funciones `grafico-funciones-1024x500.png`, capturas `captura-*.png`.
⚠️ Las capturas son de la web con datos de ejemplo. Cuando la pruebes en tu móvil, sustitúyelas por capturas reales de la app instalada si quieres.

## 8. «Contenido de la app»
Respuestas previstas en `store/ficha-play-store.md`: política de privacidad (la URL del paso 3), anuncios: no, acceso: sin registro, público 18+, clasificación de contenido (cuestionario), **seguridad de los datos: no se recopilan ni se comparten datos**, y las declaraciones de noticias/salud/finanzas: no.
Responde con lo que sea cierto: si algún día añades analíticas, anuncios o una nube, hay que actualizar esto **y** la política de privacidad.

## 9. Prueba cerrada (si tu cuenta la exige)
1. **Pruebas ▸ Prueba cerrada ▸ Crear versión** y sube el `.aab`.
2. Crea una lista de testers (correos de Google o un grupo de Google) y comparte el **enlace de aceptación**.
3. Necesitas **≥12 testers que acepten y se mantengan 14 días seguidos**. Recluta 15–20 para tener margen: si bajas de 12 el contador se reinicia. Los compañeros de tu club son los candidatos naturales.
4. Que **usen la app de verdad**: el formulario de acceso a producción pregunta por el feedback recibido.

## 10. Solicitar acceso a producción
Cuando se cumpla: **Panel ▸ Solicitar acceso a producción** y responde las tres secciones (sobre tu prueba cerrada, sobre la app, preparación para producción). La revisión suele tardar hasta 7 días, a veces más. Cumplir los números no garantiza la aprobación.

## 11. Publicar en producción
**Producción ▸ Crear versión**, sube el `.aab` (con `versionCode` mayor que el de la prueba si ya subiste uno), añade notas de la versión y **envía a revisión**. La primera revisión puede tardar días.

⚠️ **API objetivo:** Play exige apuntar a **Android 16 (API 36)** para apps nuevas y actualizaciones desde el 31/08/2026. Este proyecto ya usa `targetSdk = 36`. Mantén Capacitor y el SDK al día; cada año Google sube el nivel.

## 12. Actualizar la app más adelante
1. Edita `index.html` (la web de siempre) en una rama.
2. Sube `version` en `package.json` y añade la entrada en `CHANGELOG.md`.
3. Merge en `main` (la web se publica sola en Pages).
4. Etiqueta `vX.Y.Z` y súbela (`git tag vX.Y.Z && git push origin vX.Y.Z`): el workflow *Android* genera el `.aab` firmado y lo adjunta a la Release (necesita los 4 secretos; ver [ANDROID.md](ANDROID.md)).
5. Sube ese `.aab` a Play Console en una versión nueva.

## 13. Pruebas que debes hacer en un móvil real (no he podido ejecutarlas)
Ordenadas por riesgo:
1. **PDF:** exporta un PDF → debe abrirse el diálogo de impresión → «Guardar como PDF». Comprueba que sale en **A4 horizontal**, con **5 páginas** para 4 parciales y sin cortes. Es lo más incierto: el WebView imprime con su propio motor y puede tratar los márgenes distinto que Chrome.
2. **Excel:** exporta → hoja de compartir → guarda/abre el `.xlsx` en Excel/Sheets y comprueba columnas, nombre y fecha en cada fila.
3. **Zonas seguras:** móvil con muesca (notch) en vertical y horizontal; cabecera y botones sin quedar bajo la cámara.
4. **Pantalla completa:** arranca sin barras; el botón la quita y la pone; la preferencia se recuerda al reabrir.
5. **Botón/gesto atrás:** en regata, un aviso y salir con la segunda pulsación; en análisis vuelve a la regata.
6. **Persistencia:** con la regata en curso, cierra la app desde recientes y reábrela → debe ofrecer recuperarla.
7. **Pantalla encendida** durante una regata de varios minutos y giro de pantalla sin perder estado.
8. Teclado en la pantalla de configuración (que no tape los campos).

## 14. Riesgos que conviene conocer
- **«Funcionalidad mínima» / apps que son solo una web.** Google puede rechazar apps que sean un simple envoltorio de una web. Aquí la app funciona sin conexión y añade integración nativa (impresión, compartir, pantalla completa, atrás), lo que ayuda, pero **no puedo garantizar la aprobación**. Si la rechazaran, pide revisión explicando la funcionalidad.
- **Datos locales.** Se guardan dentro de la app: desinstalar o «Borrar datos» los elimina. La copia automática de Android está desactivada a propósito (`allowBackup=false`) para no restaurar regatas antiguas en otro móvil. Para conservar resultados, exporta a Excel.
- **WebView desactualizado.** La app usa el «Android System WebView» del móvil. En móviles muy antiguos puede fallar alguna función moderna; el mínimo configurado es Android 7.0 (API 24).

## Fuentes oficiales
- [Get started with Play Console](https://support.google.com/googleplay/android-developer/answer/6112435)
- [Información requerida para crear la cuenta](https://support.google.com/googleplay/android-developer/answer/13628312)
- [Requisitos de prueba para cuentas personales nuevas](https://support.google.com/googleplay/android-developer/answer/14151465)
- [Capacitor – Android](https://capacitorjs.com/docs/android)
