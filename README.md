# Cronometraje de Regatas — PWA

Aplicación para cronometrar regatas de traineras: tiempos por parcial, clasificación
en directo, análisis de puestos y diferencias, y exportación a PDF y Excel.

Funciona sin conexión y se instala en el móvil como una app más.

## Contenido

```
index.html               la aplicación completa (HTML + CSS + JS en un solo archivo)
manifest.webmanifest     nombre, iconos y modo de presentación de la app instalada
sw.js                    service worker: caché offline y aviso de versión nueva
icons/                   iconos 192, 512, maskable, apple-touch y favicon
.github/workflows/       despliegue automático con GitHub Actions
```

`index.html` es autónomo. Si lo abres directamente desde el disco (doble clic) la
app funciona igual; lo único que no hay en ese modo es instalación ni caché offline.

## Publicar en GitHub Pages

1. Crea un repositorio **público** en GitHub, por ejemplo `regatas`. Con cuenta
   gratuita, Pages solo funciona en repositorios públicos.
2. Sube estos archivos **a la raíz** del repositorio, conservando las carpetas
   `icons/` y `.github/`.
3. En el repositorio: **Settings → Pages**.
4. En *Build and deployment* → *Source*, elige **GitHub Actions**.
5. Haz un push a `main`. El workflow se encarga del resto.
6. La app queda en `https://<tu-usuario>.github.io/<repositorio>/`

La alternativa es elegir **Deploy from a branch** (rama `main`, carpeta `/ (root)`).
Publica igual, pero sin las comprobaciones ni el sellado automático de versión que
se describen abajo, así que tendrías que subir `CACHE_VERSION` a mano en cada cambio.

## Despliegue automático (GitHub Actions)

`.github/workflows/deploy.yml` se ejecuta en cada push a `main` y también a mano
desde la pestaña *Actions*. Hace tres cosas:

**Sella la versión del service worker.** Sustituye `CACHE_VERSION` por el hash
corto del commit, así que cada despliegue genera una caché nueva y los usuarios
reciben el aviso de actualización. Es el paso que, hecho a mano, se olvida.

**Comprueba que no falta nada.** Verifica que están el HTML, el manifest, el
service worker y los cinco iconos, y que ninguno está vacío.

**Valida el código antes de publicar.** Extrae el `<script>` de `index.html` y lo
pasa por `node --check`, hace lo mismo con `sw.js` y comprueba que el manifest es
JSON válido con sus claves obligatorias. Si algo falla, el despliegue se detiene y
la versión publicada sigue siendo la anterior.

Solo se publica el contenido de `_site`: el HTML, el manifest, el service worker
y los iconos. El README y la carpeta `.github/` no se suben al sitio.

Si el workflow falla, en la pestaña *Actions* aparece el paso concreto y el motivo.

## Instalar en el móvil

- **Android (Chrome):** abre la URL y acepta *Instalar aplicación*, o menú ⋮ →
  *Añadir a pantalla de inicio*.
- **iPhone/iPad (Safari):** botón Compartir → *Añadir a pantalla de inicio*.
  En iOS la instalación solo funciona desde Safari, no desde Chrome.

Una vez instalada se abre a pantalla completa, sin barra de direcciones, y funciona
sin cobertura. Conviene abrirla una vez con conexión antes de ir a la regata.

## Publicar una versión nueva

Con GitHub Actions configurado, basta con subir el archivo cambiado a `main`:
el despliegue y el número de versión de la caché se gestionan solos.

Quien tenga la app abierta verá un aviso *"Hay una versión nueva"* con un botón
**Actualizar**. La app nunca se recarga sola: si estás en plena regata puedes
cerrar el aviso y seguir cronometrando.

Si publicas sin Actions (modo *Deploy from a branch*), acuérdate de subir a mano
el número de versión en `sw.js`:

```js
const CACHE_VERSION = 'v2';   // antes 'v1'
```

Si lo olvidas, los usuarios seguirán viendo la versión antigua guardada en caché.

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
