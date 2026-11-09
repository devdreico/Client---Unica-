# UNICA · Moda colombiana desde Medellín

Tienda digital de UNICA, marca colombiana nacida en Medellín. Su voz celebra la moda de aquí con orgullo, carácter y estilo propio, sin atribuir fabricación local a prendas cuyo origen no se ha verificado. Experiencia en React, Vite y Tailwind CSS, con galería de fotografías, selección de prendas y carrito con pedido por WhatsApp.

## Ejecutar localmente

```bash
npm install
cp .env.example .env.local
npm run dev
```

Configura `VITE_WHATSAPP_NUMBER` en `.env.local` con el número comercial en formato internacional, solo dígitos y con indicativo de país (por ejemplo, `57` para Colombia). Si queda vacío, WhatsApp abre el mensaje para que el cliente elija un contacto. El pedido es una solicitud de compra: no procesa pago ni reserva inventario.

Para generar la versión estática de producción:

```bash
npm run build
```

El resultado queda en `dist/` y se puede publicar en un hosting estático compatible con Vite.

## SEO e indexación

La aplicación se monta desde `src/main.jsx` en el elemento `#root` de `index.html`. El HTML de producción incluye canonical, metadatos Open Graph, tarjeta para redes y datos estructurados `ClothingStore`. `public/robots.txt` permite el rastreo y declara `public/sitemap.xml`, que apunta a la página principal en `https://unica.presentto.online/`.

Una vez que el hosting sirva el sitio en ese dominio con HTTPS, registra la propiedad en Google Search Console y envía `https://unica.presentto.online/sitemap.xml`. Los archivos preparan el rastreo, pero la indexación efectiva depende de que el dominio esté accesible y de los tiempos y decisiones del buscador.

## Catálogo y fotografías

El archivo original se conserva en `assets/img/img-ropa-y-modelos.zip`. Para regenerar el archivo visual:

```bash
python3 scripts/import_catalogo.py
```

El importador organiza las 434 imágenes en 102 referencias y escribe los recursos web en `public/catalogo/`. Las ocho referencias con un precio escrito en el nombre de la foto aparecen en la selección comprable; las demás quedan como consulta. Los precios se transcriben como referencias históricas del material entregado: confirmar valor, talla, color y disponibilidad antes de publicar o aceptar el pedido.

Las fotografías de origen se mantienen sin alterar para respetar el material recibido. En la revisión visual se encontraron algunas con marca de agua de Dola AI y logos de terceros; antes de usar una imagen en publicidad o confirmar que representa una prenda en inventario, verificar derechos de uso y correspondencia con el producto real.

## Plan de implementación

1. **Base de marca y tienda (implementado).** Interfaz adaptable, logo entregado, Montserrat, modo oscuro y claro, historia de marca, colección filtrable, archivo fotográfico, detalle por referencia y carrito persistente en el navegador.
2. **Validación comercial antes de abrir ventas.** Confirmar con UNICA precios vigentes, referencias activas, tallas, colores, materiales y disponibilidad. Añadir el número real de WhatsApp a `.env.local`; revisar textos de envío, cambios, medios de pago y atención.
3. **Publicación en `unica.presentto.online`.** Generar `dist/` con `npm run build` y desplegarlo en el proveedor de hosting elegido. Añadir `unica.presentto.online` en su panel, configurar los registros DNS indicados por el proveedor, activar HTTPS y comprobar la versión móvil, el carrito y los enlaces a Instagram/WhatsApp desde el dominio. El dominio aún debe vincularse con el hosting; este repositorio no presupone proveedor ni configuración DNS.
4. **Operación y crecimiento.** Si se requieren pagos en línea, control de inventario, tarifas de envío, analítica o notificaciones automáticas, conectar esos servicios y publicar políticas de privacidad, tratamiento de datos, entregas y devoluciones antes de escalar las ventas.

## Lista de salida

- Confirmar precios e inventario con la marca; los nombres de archivo no certifican vigencia.
- Configurar y probar el WhatsApp comercial en el entorno de producción.
- Revisar categorías, nombres, composición y tallas de las referencias expuestas.
- Publicar en el hosting, apuntar el dominio y confirmar HTTPS.
- Probar en móvil filtros, cambio de tema, carrito, total y mensaje generado.
- Validar las políticas comerciales y de tratamiento de datos con UNICA.