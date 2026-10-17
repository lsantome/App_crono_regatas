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
```

`index.html` es autónomo. Si lo abres directamente desde el disco (doble clic) la
app funciona igual; lo único que no hay en ese modo es instalación ni caché offline.

## Publicar en GitHub Pages

1. Crea un repositorio en GitHub, por ejemplo `regatas`.
2. Sube estos archivos **a la raíz** del repositorio, conservando la carpeta `icons/`.
3. En el repositorio: **Settings → Pages**.
4. En *Build and deployment* → *Source*, elige **Deploy from a branch**.
5. Selecciona la rama `main` y la carpeta `/ (root)`. Guarda.
6. Al cabo de uno o dos minutos la app estará en:
   `https://<tu-usuario>.github.io/<repositorio>/`

El repositorio debe ser **público** para usar Pages con una cuenta gratuita.

GitHub Pages sirve por HTTPS, que es requisito para que funcionen el service worker
y la instalación. Todas las rutas del proyecto son relativas, así que funciona tanto
en `usuario.github.io/regatas/` como en un dominio propio, sin tocar nada.

## Instalar en el móvil

- **Android (Chrome):** abre la URL y acepta *Instalar aplicación*, o menú ⋮ →
  *Añadir a pantalla de inicio*.
- **iPhone/iPad (Safari):** botón Compartir → *Añadir a pantalla de inicio*.
  En iOS la instalación solo funciona desde Safari, no desde Chrome.

Una vez instalada se abre a pantalla completa, sin barra de direcciones, y funciona
sin cobertura. Conviene abrirla una vez con conexión antes de ir a la regata.

## Publicar una versión nueva

1. Sustituye `index.html` (y lo que haya cambiado).
2. **Sube el número de versión en `sw.js`:**
   ```js
   const CACHE_VERSION = 'v2';   // antes 'v1'
   ```
3. Haz commit y push.

Si olvidas el paso 2 los usuarios seguirán viendo la versión antigua guardada en
caché hasta que el navegador la renueve por su cuenta.

Quien tenga la app abierta verá un aviso *"Hay una versión nueva"* con un botón
**Actualizar**. La app nunca se recarga sola: si estás en plena regata puedes cerrar
el aviso y seguir cronometrando.

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
