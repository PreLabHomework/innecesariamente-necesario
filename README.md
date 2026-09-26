# Innecesariamente Necesario . Web

Web estática de dos zonas: **informativa** (index.html) y **tienda** (tienda.html).
No necesita servidor ni base de datos. Se puede publicar gratis en GitHub Pages.

## Puesta en marcha (5 minutos)

1. Abre `assets/config.js` y rellena:
   - `email`: el correo donde quieres recibir los pedidos.
   - `instagram`: tu usuario de IG sin la arroba.
   - `paypalMe`: tu usuario de paypal.me si lo tienes (opcional).
2. Abre `index.html` en el navegador. Ya funciona.

## Cómo funciona un pedido (sin Shopify, sin backend)

1. La clienta añade productos al carrito y pulsa "Hacer pedido".
2. Puede elegir:
   - **Email**: se abre su correo con el pedido ya escrito, dirigido a tu email.
   - **DM**: el resumen se copia al portapapeles y se abre tu chat de Instagram.
3. Tú confirmas y le envías la **solicitud de pago por PayPal**. Sin comisiones de plataforma.

Cada producto tiene además su propio botón **DM** para trato directo, tal y como pediste.

## Añadir o cambiar productos

Todo el catálogo vive en `assets/products.js`. Copia un bloque, pégalo al final
y cambia los datos. Los filtros (por producto y por marca) se generan solos:
si añades un producto con `marca: "Sama"`, la marca Sama aparece automáticamente
como filtro con todos sus productos.

- `img: ""` dibuja un placeholder bonito hasta que tengas foto.
- `img: "img/mi-foto.jpg"` usa tu foto (crea la carpeta `img/` y mete ahí las fotos, cuadradas mejor).
- `rareza: "unica"` marca la pieza como única (borde lima).
- `nuevo: true` le pone la etiqueta NUEVO y la ordena primero.

## Cambiar los colores

La paleta actual sale del logo oficial (coral del aro, rubor del interior,
negro de la tipografía y azul de la perla). Si algún día cambia el logo, solo hay
que tocar el bloque `:root` al principio de `assets/brand.css`.
Cambia los códigos de color y toda la web se actualiza sola. Los importantes:

- `--brand`: el color principal del logo.
- `--brand-deep`: coral oscuro para precios y textos.
- `--violet`: azul de los collabs.
- `--bg`: color de fondo.

## Qué pedirle a Sama (lista exacta)

Para que el diseño quede a tu gusto y con los colores del logo, pídele:

1. **Logo** en PNG con fondo transparente (mínimo 1000 px) y si puede, también en SVG.
   Una versión para fondo oscuro y otra para fondo claro.
2. **Códigos de color exactos** del logo (los hex, tipo `#FF3D7F`). Mínimo el principal
   y uno o dos secundarios.
3. **Fotos de producto**: cuadradas (1:1, la tienda las muestra a cuadrado completo), mínimo 1000 x 1000 px, con fondo consistente
   (misma mesa o mismo fondo en todas). Para figuras 3D, dos o tres ángulos.
4. **Logo o nombre de cada marca collab** (el suyo propio, por ejemplo) y la lista
   de sus productos con precios.
5. **4 a 6 reseñas reales** (captura del DM o texto) con el usuario de IG de cada clienta,
   y una foto del encargo si la hay.
6. Tu **usuario de IG exacto** y el **email de PayPal** para configurar pagos.

Con eso la web queda 100% tuya sin tocar ni una línea de diseño.

## Publicar gratis en GitHub Pages

1. Crea un repositorio en GitHub y sube esta carpeta entera.
2. En Settings > Pages, elige la rama `main` y carpeta raíz.
3. En un minuto tienes la web en `tuusuario.github.io/nombre-del-repo`.

## Shopify (para el futuro, cuando haya ingresos)

La web ya está preparada. Cuando abras la cuenta de Shopify:

1. En Shopify, activa el canal **Buy Button** y crea tus productos allí.
2. En `assets/config.js` pon `shopify.enabled: true`, tu `domain`
   (`tu-tienda.myshopify.com`) y el `token` (Storefront access token).
3. La función `shopifyCheckout()` en `assets/site.js` es el único punto a conectar
   con el Buy Button SDK de Shopify (su documentación trae el código exacto).
   Hasta entonces, el flujo email + PayPal funciona sin pagar cuota mensual.

Ventaja de este orden: hoy no pagas los 22 euros al mes del plan Basic y, cuando
la tienda dé ingresos, el cambio es de configuración, no de rediseño.

## Archivos

- `index.html` . portada: quiénes somos, pedidos realizados, contacto
- `tienda.html` . tienda con filtros, carrito y pedido
- `assets/config.js` . TUS DATOS (email, IG, PayPal, Shopify)
- `assets/products.js` . TU CATÁLOGO
- `assets/brand.css` . TUS COLORES y el estilo visual
- `assets/site.js` . lógica (no hace falta tocarlo)
- `DESIGN.md` . decisiones de diseño (para quien retoque la web)
