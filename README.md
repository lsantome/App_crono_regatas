# Cronometraje de Regatas

Aplicación para cronometrar regatas: tiempos por parcial, clasificación
en directo, análisis de puestos y diferencias, y exportación a PDF y Excel.

Funciona sin conexión. Se usa de dos formas, con el mismo código:

- **PWA** en GitHub Pages, instalable en el móvil como una app más.
- **App Android** (APK/AAB, Capacitor) con la web empaquetada dentro.

**URL de la PWA:** <https://lsantome.github.io/Crono-Regatas/>

## Contenido

```
index.html               la aplicación completa (HTML + CSS + JS en un solo archivo)
manifest.webmanifest     nombre, iconos y modo de presentación de la app instalada
sw.js                    service worker: caché offline y aviso de versión nueva
privacidad.html          política de privacidad (la pide Google Play)
icons/                   iconos 192, 512, maskable, apple-touch y favicon
capacitor.config.json    configuración de la app Android (appId, webDir)
android/                 proyecto de Android Studio (Capacitor) y plugin nativo propio
scripts/                 version.js, build-pwa.js, build-android-web.js, gradle.js
tests/                   pruebas (npm test)
docs/                    ANDROID.md y GUIA-PLAY-STORE.md
store/                   icono, gráfico de funciones, capturas y textos de la ficha de Play
.github/workflows/       pages.yml (tests y Pages) y android.yml (APK y AAB)
package.json             versión (fuente única) y scripts · CHANGELOG.md · CLAUDE.md · LICENSE
```

`index.html` es autónomo. Si lo abres directamente desde el disco (doble clic) la
app funciona igual; lo único que no hay en ese modo es instalación ni caché offline.
Sin compilar, el pie de la pantalla de configuración muestra *Versión desarrollo*.

## Desarrollo

Requisitos: Node 22 o superior. Para Android, además JDK 21 y el SDK de Android
(ver [docs/ANDROID.md](docs/ANDROID.md)).

| Comando | Qué hace |
|---|---|
| `npm ci` | Instala las dependencias (Capacitor), con las versiones del lock |
| `npm test` | Ejecuta todas las pruebas |
| `npm run build:pwa` | Genera `dist/site`, lo que se publica en Pages, con la versión sellada |
| `npm run build:android-web` | Genera `dist/app`, la web que entra en el APK (sin service worker) |
| `npm run android:sync` | `build:android-web` + `cap sync android` |
| `npm run android:debug` | Sincroniza y compila un APK de depuración |
| `npm run android:release` | Sincroniza y compila APK y AAB de release (firmados si hay claves) |

La versión se sella al compilar: `v1.1.0 · build abc1234 · 2026-10-23` (versión de
`package.json`, hash corto del commit y fecha). El mismo hash es la versión de la caché
del service worker, y sirve para comprobar qué versión se está ejecutando.

## Publicar en GitHub Pages

La publicación es automática, pero hace falta un ajuste **una sola vez**:

1. En el repositorio: **Settings → Pages**.
2. En *Build and deployment* → *Source*, elige **GitHub Actions**.
3. Haz un push a `main`. El workflow *Pages* se encarga del resto.
4. La app queda en `https://lsantome.github.io/Crono-Regatas/`

Con *Deploy from a branch* se publicaría el código sin compilar: sin versión sellada y
sin las comprobaciones. No lo uses.

## Despliegue automático (GitHub Actions)

`.github/workflows/pages.yml` se ejecuta en cada push a `main`, en cada PR y a mano
desde la pestaña *Actions*. **Solo `main` publica**; las PR ejecutan todo lo demás.

1. `npm ci` y `npm test`: sintaxis, manifest, service worker, ausencia de recursos
   externos, claves de almacenamiento, build y coherencia de Android.
2. `npm run build:pwa`: construye `dist/site` con la versión sellada.
3. Comprueba que no falta ningún archivo, que `sw.js` compila y que la versión y el
   hash del commit quedaron sellados.
4. Publica `dist/site` en Pages. Si algo falla, el despliegue se detiene y la versión
   publicada sigue siendo la anterior.

Si el workflow falla, en la pestaña *Actions* aparece el paso concreto y el motivo.

## App de Android

La app lleva la web dentro y funciona sin conexión. **No comparte datos con la PWA**: son
dos instalaciones distintas, cada una con su propio almacenamiento. El medio para pasar
resultados de una a otra es el Excel exportado.

- **APK de prueba:** *Actions → Android (APK y AAB) → Run workflow*. Al terminar, el APK
  está en *Artifacts*. Sin claves de firma es un APK de depuración, válido para probar en
  el móvil pero no para Play Store.
- **Release firmada (APK y AAB):** al subir una etiqueta `vX.Y.Z`, con los secretos de
  firma cargados. Se adjunta a la Release de GitHub.
- **Instalar el APK:** pásalo al móvil y ábrelo; Android pedirá permitir instalar
  desde esa fuente.
- **Publicar en Google Play:** [docs/GUIA-PLAY-STORE.md](docs/GUIA-PLAY-STORE.md).

Los cambios en la web (Pages) **no llegan solos** a la app instalada: cada cambio exige
una versión nueva de la app.

## Datos y privacidad

Todo se guarda en el dispositivo (almacenamiento local del navegador o de la app). No
hay cuentas, servidores ni analíticas. La política completa está en
[privacidad.html](privacidad.html). Desinstalar la app o borrar sus datos elimina las
regatas guardadas: exporta a Excel lo que quieras conservar.

## Instalar en el móvil

- **Android (Chrome):** abre la URL y acepta *Instalar aplicación*, o menú ⋮ →
  *Añadir a pantalla de inicio*.
- **iPhone/iPad (Safari):** botón Compartir → *Añadir a pantalla de inicio*.
  En iOS la instalación solo funciona desde Safari, no desde Chrome.

- **App Android (APK):** ver «App de Android» más abajo. Es independiente de la PWA.

Una vez instalada se abre a pantalla completa, sin barra de direcciones, y funciona
sin cobertura. Conviene abrirla una vez con conexión antes de ir a la regata.

## Releases (publicar una versión nueva)

1. Cambia lo que haga falta en una rama y abre una PR hacia `main`. Las PR ejecutan los
   tests y construyen el sitio, pero no publican.
2. Para una versión: sube `version` en `package.json` (semver `X.Y.Z`) y añade su entrada
   en `CHANGELOG.md`. Esa es la única fuente de versión: la web, la caché del service worker
   y el `versionName`/`versionCode` de Android salen de ahí.
3. Al hacer merge en `main`, GitHub Pages publica la web sola. Quien tenga la PWA abierta
   verá un aviso *«Hay una versión nueva»* con un botón **Actualizar**; la app nunca se
   recarga sola, así que en plena regata puedes cerrarlo y seguir cronometrando.
4. Para generar la app Android: etiqueta `vX.Y.Z` (igual que `package.json`) y súbela:
   ```bash
   git tag v1.1.0
   git push origin v1.1.0
   ```
   El workflow *Android* compila y adjunta APK y AAB a la Release de GitHub. Detalles en
   [docs/ANDROID.md](docs/ANDROID.md).

## Pantalla completa

El botón de pantalla completa está en las tres cabeceras (configuración, regata y
análisis). En el móvil solo se ve el icono.

- **PC, Android e iPad:** el botón entra y sale. En pantallas táctiles, además, se
  entra sola al **primer toque**. Los navegadores no permiten hacerlo al cargar la
  página sin un gesto del usuario, así que ese primer toque es imprescindible.
- **Recordatorio:** si sales con el botón, no se vuelve a forzar al abrir la app. Si
  sales con un gesto del sistema, solo se respeta durante esa visita. Para reactivarla,
  pulsa el botón.
- **App instalada en Android:** el manifest pide `fullscreen` (con `standalone` como
  alternativa), así que se abre sin barras desde el primer momento, sin tocar nada.
  Queda oculta la barra de estado (hora y batería); se recupera deslizando desde el
  borde superior. Si prefieres verla, borra la línea `display_override` del manifest.
- **iPhone:** Safari no ofrece esta función. La alternativa es *Compartir → Añadir a
  pantalla de inicio*; abierta desde su icono, la app se muestra sin barras del
  navegador. El botón, en Safari, explica estos pasos.
- Las cabeceras y los márgenes respetan el *notch* y las barras del sistema.

## Notas de funcionamiento

- **Los tiempos se guardan solos.** Tras cada pulsación el estado queda en el
  almacenamiento del navegador. Si la app se cierra, el móvil se queda sin batería o
  el sistema la descarta, al volver a abrirla te ofrece recuperar la regata.
  El botón *Nueva regata* es lo único que borra ese guardado.
- **Reloj monótono.** Los cronómetros usan `performance.now()`, que no se ve afectado
  si el móvil ajusta la hora por NTP en mitad de la regata.
- **Pantalla siempre encendida.** Durante la regata se solicita un *wake lock* para
  que el móvil no apague la pantalla. En navegadores que no lo admiten (Safari
  antiguo) conviene subir a mano el tiempo de apagado.
- **Exportar PDF** abre el diálogo de impresión del navegador: elige *Guardar como
  PDF*, tamaño A4 y orientación horizontal.
- El **Excel** es un archivo plano, una fila por equipo y parcial, con el nombre y la
  fecha de la regata en todas las filas, pensado para apilar regatas en un histórico.

## Independencia respecto a otras PWA del mismo origen

En GitHub Pages todos tus repos comparten origen (`usuario.github.io`). Para que esta
app no se confunda con otras:

- **`id` del manifest = `regatas-cronometraje`.** El navegador resuelve el `id` contra el
  *origen*, no contra la carpeta: el valor anterior `"./"` equivalía a `https://usuario.github.io/`
  y habría sido idéntico al de cualquier otra PWA tuya con `"./"` o `"/"`; el navegador las
  trataría como la misma app (instalación, actualización de nombre/iconos…). Las pruebas
  (`npm test`) fallan si el `id` cambia o vuelve a ser genérico.
- **Cachés con prefijo propio** (`regatas-cronometraje-…`) y limpieza que solo borra las suyas.
- **`scope` y `start_url`** siguen acotados a la carpeta del repo, y el service worker se
  registra con ese mismo alcance.

Límites: `localStorage` es común a todo el origen (las claves de esta app empiezan por
`regatas.`; evita ese prefijo en otras apps). El aislamiento total de almacenamiento solo
se consigue con un origen distinto (un dominio propio, o una cuenta/organización de GitHub
aparte).

Si ya tenías la app instalada con el `id` anterior, el navegador la verá como una app
distinta: desinstala la antigua e instala de nuevo.

## Licencia

MIT. Ver [LICENSE](LICENSE).
