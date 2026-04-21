Sí, y aquí la clave es separar dos capas:

1. Datos de Google Places para descubrir negocios y obtener señales básicas oficiales.
2. Auditoría del sitio web del negocio para medir qué tan digitalizado está.

La idea es viable, pero conviene diseñarla para quedar dentro de términos y sin meterte a zonas grises. Google permite usar Places API sin mostrar necesariamente un mapa, y Place Details puede devolverte campos como teléfono, rating, horarios y websiteUri; además, el endpoint exige FieldMask, así que puedes pedir solo lo que realmente uses. Google también prohíbe scraping de Maps y exige atribución cuando muestras contenido de Google.

La parte más delicada es el Excel. Las condiciones de Google incluyen restricciones sobre cachear y exportar Google Maps Content, así que yo no basaría el producto en “volcar” masivamente datos crudos de Places a hojas permanentes. El enfoque más seguro es usar Google para descubrir el negocio y luego exportar sobre todo tu análisis derivado: score, notas, hallazgos técnicos, banderas como “tiene web/no tiene web”, “carga lenta”, “sin formulario”, “sin HTTPS fuerte”, etc. Cuando sí muestres contenido de Google en la app, mantén la atribución correspondiente.

QUÉ SÍ PUEDES MEDIR TÉCNICAMENTE DEL NEGOCIO

1) Presencia básica del negocio
Desde Places API puedes usar displayName, dirección, teléfono, ratings, horarios y websiteUri. Esto te sirve para saber si el negocio existe, qué tan visible es y si ya tiene una web pública asociada. Técnicamente, aquí tu sistema hace un Text Search o Nearby Search, toma el place_id, y luego un Place Details pidiendo solo los campos necesarios.

2) Presencia web real
Si websiteUri existe, haces una verificación técnica del dominio. Aquí no necesitas scraping agresivo; basta con una visita controlada a la home y, como mucho, a unas pocas rutas típicas como /contact, /contacto, /about, /nosotros. Debes respetar robots.txt como señal operativa para crawlers; ojo, robots.txt no es autorización legal por sí mismo, pero sí es el estándar que los crawlers deben honrar.

Qué medir:
- si responde el dominio
- código HTTP final
- si redirige de http a https
- tiempo de respuesta inicial
- si hay errores 4xx/5xx
- si cae en parking domain o sitio caído

3) Velocidad y experiencia de carga
Para esto no conviene inventar métricas propias desde cero. Lo más limpio es integrar PageSpeed Insights API, que ya te da análisis automatizado y sugerencias. PSI reporta datos de laboratorio y, cuando existen, datos de usuarios reales; distingue entre ambos, lo cual es importante porque una web puede ir bien en lab y mal en la práctica. También expone métricas como FCP, LCP, CLS e INP.

Qué guardar tú como señal:
- performance score móvil
- performance score desktop
- LCP
- CLS
- INP
- si hay field data disponible o no

Interpretación útil:
- rápida: buena puntuación móvil + LCP razonable
- aceptable: carga usable pero con oportunidades
- lenta: puntuación baja o Core Web Vitals pobres

4) Seguridad mínima del sitio
Esto sí es una señal fuerte de madurez digital. Puedes revisar:
- si usa HTTPS
- si fuerza redirección HTTP → HTTPS
- si envía header Strict-Transport-Security

HSTS le indica al navegador que ese host debe usarse siempre por HTTPS, y puede aplicarse también a subdominios. Es una muy buena bandera de “sitio cuidado”.

Señales prácticas:
- https_ok
- http_redirects_to_https
- has_hsts
- certificate_valid

5) Formularios y vías de contacto
Aquí sí puedes detectar cosas muy útiles sin invadir nada. El elemento <form> representa una sección con controles interactivos para enviar información; además, el action te dice a qué endpoint se envía. Eso te permite detectar si el sitio tiene una forma real de captación de leads.

Qué revisar:
- número de formularios en home/contacto
- si existe un formulario de contacto
- si pide nombre/email/teléfono/mensaje
- si el action apunta a un backend real o a un placeholder vacío
- si solo muestra WhatsApp/teléfono y no formulario

Importante: detectar un formulario es válido; probarlo enviando datos automáticos ya es otro nivel y no te lo recomiendo para esta herramienta interna.

6) Señales de modernización del frontend
Aquí puedes inferir, no afirmar al 100%, si el negocio tiene una web moderna. No necesitas una fuente externa para esto: basta inspeccionar el HTML y headers que el propio sitio publica.

Señales recomendadas:
- presencia de meta viewport
- carga correcta en móvil
- uso de assets modernos
- existencia de manifest PWA
- existencia de service worker
- bundles de frameworks conocidos
- favicon, title y meta description bien puestos

Sobre el manifest: un web app manifest es un JSON que le dice al navegador cómo debe comportarse el sitio como app; su presencia suele ser una buena señal de cuidado técnico o enfoque móvil/PWA.

7) SEO técnico básico
No necesitas entrar a hacer SEO completo; basta con revisar si hay fundamentos mínimos:
- <title>
- meta description
- canonical
- headings
- structured data / JSON-LD
- sitemap enlazado
- robots.txt accesible

Para un negocio local, encontrar JSON-LD con datos de organización, negocio local, dirección, teléfono o horarios es una señal muy buena.

8) Señales de conversión
Esto es de mucho valor comercial para ti. Más que “si tiene web”, importa “si la web convierte”.

Puedes auditar:
- botón visible de contacto
- CTA en home
- WhatsApp click-to-chat
- formulario
- teléfono clickeable
- mapa embebido
- agenda / reserva
- e-commerce o catálogo
- testimonios / reseñas embebidas

Esto no requiere scraping pesado; es inspección de DOM y enlaces visibles.

9) Señales de abandono
Aquí detectas oportunidades de venta muy claras:
- copyright viejo
- links rotos
- imágenes faltantes
- JS roto en consola
- formularios visuales pero sin action
- sitio sin mobile viewport
- dominio que carga pero con diseño muy antiguo
- sin SSL o con redirecciones defectuosas

Estas banderas suelen valer más comercialmente que el simple “tiene página”.

10) Tecnología detectada
Esto se puede inferir desde:
- headers HTTP
- nombres de archivos JS/CSS
- meta generators
- rutas típicas
- HTML renderizado

Ejemplos de inferencia:
- wp-content → WordPress
- /_next/ → Next.js
- cdn.shopify.com o patrones Shopify → Shopify
- wixstatic → Wix

Esto es útil para saber si venderías:
- rediseño
- performance
- SEO
- automatización
- CRM/contact forms
- sistema de citas
- landing nueva

Aquí la regla es reportarlo como “inferido”, no como verdad absoluta.

QUÉ NO DEBERÍAS HACER

No haría esto:
- scrapear HTML de Google Maps directamente
- navegar cientos de páginas por dominio
- ignorar robots.txt en un crawler masivo
- enviar formularios
- extraer correos o teléfonos personales de individuos
- recolectar datos personales y tratarlos como base comercial sin cuidar privacidad

Si tu herramienta empieza a almacenar o usar datos personales con fines comerciales, ya entras a obligaciones de tratamiento y privacidad. Por eso, en cuanto esto sea para prospección de negocio organizada, conviene tratarlo con disciplina de privacidad.

QUÉ MÉTRICAS SÍ TE RECOMIENDO METER AL EXCEL

Yo exportaría algo así:
- negocio
- categoría
- ciudad
- website_detected
- website_status
- https_ok
- hsts
- pagespeed_mobile
- pagespeed_desktop
- has_contact_form
- has_whatsapp_link
- has_booking_flow
- has_structured_data
- has_manifest
- inferred_stack
- google_rating
- google_reviews
- tech_score
- opportunity_score
- notas

Y separaría dos columnas:
- source_google
- source_website

Para que siempre sepas qué salió de Google y qué salió de tu auditoría técnica.

MODELO DE SCORING RECOMENDADO

Te conviene usar dos scores:

Tech score
- sitio disponible
- HTTPS
- velocidad
- mobile
- structured data
- manifest
- formulario

Opportunity score
- no tiene web
- web lenta
- sin formulario
- sin CTA
- sin SEO básico
- sin WhatsApp
- sin reservas
- rating alto pero web pobre

Eso te ayuda a priorizar a quién contactar primero.

ARQUITECTURA SIMPLE Y LIMPIA

Con tu stack, yo lo haría así:
- Next.js como app única
- una ruta API para consulta de Places
- una ruta API para auditoría del sitio
- una ruta API para exportar XLSX
- cola ligera en memoria o procesamiento por lotes chico
- sin BD, pero con export temporal en sesión

Flujo:
1. buscas negocios con Places
2. seleccionas cuáles auditar
3. corres auditoría web sobre esos dominios
4. ves tabla
5. exportas Excel con análisis derivado

RECOMENDACIÓN LEGAL/TÉCNICA FINAL

La forma más segura es:
- usar Google Places API solo para descubrimiento
- hacer la auditoría profunda únicamente sobre la web pública del negocio
- respetar robots.txt, rate limits y crawling pequeño
- exportar principalmente tu análisis transformado, no un dump crudo de Maps
- mantener atribución de Google cuando corresponda