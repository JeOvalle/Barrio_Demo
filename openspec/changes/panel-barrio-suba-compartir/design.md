# Design

## Context

El proyecto está recién inicializado con OpenSpec y no contiene código de aplicación. El desarrollo ocurre en Windows y se ejecutará con `npm run dev`. Las fuentes externas de datos no pudieron verificarse desde el entorno donde se hizo el diseño, por lo que la arquitectura no puede asumir que un endpoint responde ni que permite llamadas desde el navegador. La motivación y el alcance están en `proposal.md`; los comportamientos exigidos están en `specs/`.

## Goals / Non-Goals

**Goals:**

- Un único contrato de resultado para los trece módulos, con estados explícitos y geometría opcional.
- Identidad del barrio resuelta antes de cualquier consulta, con jerarquía barrio → UPZ → localidad.
- Vista dividida mapa/panel donde cada consulta activa su propia capa.
- Registro central de fuentes con estado de verificación, cobertura y protección de llaves.
- Caché en memoria, timeouts y degradación controlada ante fallos externos.

**Non-Goals:**

- Base de datos o almacenamiento persistente.
- Autenticación, edición o escritura en fuentes externas.
- Google Places, Mapbox u otras fuentes que requieran llaves de pago.
- Mostrar ubicaciones de cámaras de seguridad o fichas catastrales individuales.
- Despliegue a producción o infraestructura en la nube.

## Decisions

**1. Backend Express como proxy del frontend.**
El navegador llama al backend y este consulta las fuentes externas. Así se evitan bloqueos por CORS, se guardan llaves fuera del cliente y se aplica caché en un solo lugar.
*Alternativas consideradas:* frontend puro (descartado: varias fuentes no permiten CORS); Next.js (descartado: más estructura de la que necesita una demo de trece tarjetas).

**2. Node/Express + HTML/JS plano.**
Un solo ecosistema (`npm`), arranque sencillo en Windows y suficiente para trece tarjetas. La UI se construye con DOM desde `app.js`, sin framework.
*Alternativas consideradas:* FastAPI/Python (válido, pero obliga a manejar entorno virtual en Windows); React + Vite (útil si la página creciera, pero exige más configuración inicial).

**3. Resultado único con `datos[]` y `geojson` opcional.**
Panel y mapa consumen la misma respuesta. `geojson` ausente significa que el módulo no tiene capa, no que falló.
*Alternativas consideradas:* dos endpoints distintos, uno por vista (descartado: duplica consultas y puede devolver estados contradictorios).

**4. Resolutor de barrio con jerarquía y datos locales de alias/geometría.**
Un archivo en `data/` contiene los alias y las geometrías del barrio, la UPZ y la localidad. Cada adapter recibe la jerarquía y elige el nivel más estrecho disponible.
*Alternativas consideradas:* geocodificar el texto en cada módulo (descartado: `Suba Compartir` y `Sabana de Tibabuyes Norte` darían resultados inconsistentes); consultar geometrías en cada petición (diferido: añade dependencia de disponibilidad externa para algo que cambia poco).

**5. Registro de fuentes con estados y `sin_fuente`.**
Cada módulo declara endpoint, llave, cobertura y estado (`verificado` / `por_validar`). Si no hay fuente pública verificada, el adapter no llama a nada y devuelve `sin_fuente`.
*Alternativas consideradas:* dejar que cada módulo implemente su propia lógica de fuente (descartado: imposible mantener consistencia entre módulos y mensajes de aviso).

**6. Leaflet con tiles de OpenStreetMap.**
No requiere llave, funciona con HTML/JS plano y soporta puntos, polígonos y líneas mediante GeoJSON. Se muestra la atribución obligatoria de OSM.
*Alternativas consideradas:* Mapbox/Google Maps (descartadas por llave y cuotas); librerías de mapas vectoriales (descartadas por complejidad para esta v1).

**7. El panel manda y las capas se activan bajo demanda.**
Al consultar se dibuja la capa de ese módulo y se encuadra su extensión. El clic en un marcador solo resalta la fila. Las capas no están activas al abrir la página.
*Alternativas consideradas:* todas las capas activas (descartado: ilegible con trece módulos); el mapa dispara consultas (descartado: más lógica de selección sin beneficio para la v1).

**8. Agregación obligatoria de datos sensibles.**
Robos y catastral se muestran como indicadores o coropletos; cámaras permanece `sin_fuente`. Cuando un dato solo existe por localidad, se muestra con aviso y se pinta ese polígono.
*Alternativas consideradas:* puntos individuales de robos o predios (descartados por privacidad y ruido visual).

## Risks / Trade-offs

- **Fuentes no verificadas** → El registro las marca `por_validar` y el resultado conserva la nota de cobertura; las tareas incluyen una validación explícita antes de conectar cada una.
- **CORS o llaves en fuentes externas** → Todas las peticiones pasan por Express; las llaves viven en variables de entorno y nunca se envían al navegador.
- **Cobertura parcial de OpenStreetMap** → Los módulos basados en OSM muestran avisos de cobertura en lugar de presumir exhaustividad.
- **Ilegibilidad del mapa con trece capas** → Capas desactivadas por defecto y activadas solo por la consulta del módulo correspondiente.
- **Caché en memoria** → Se pierde al reiniciar el proceso; se acepta porque los datos son de consulta y no críticos.
- **Dependencia de tiles externos** → Se mantiene el volumen bajo y se respeta la atribución de OpenStreetMap.
- **Granularidad mezclada** → Cada resultado declara el nivel usado y el aviso viaja con el dato hasta la tarjeta.

## Migration Plan

No hay migración: el proyecto parte de cero. El orden de trabajo es inicializar `package.json`, crear la estructura de carpetas, implementar el resolutor y el registro de fuentes, añadir los adapters de los trece módulos y, por último, construir la vista dividida. Si se aborta, no hay datos persistentes que restaurar; basta con retirar la estructura creada.

## Open Questions

- TTL exacto de caché por fuente. Valor inicial propuesto: cinco minutos, ajustable por módulo.
- Proveedor de tiles: OSM estándar por defecto, con posible cambio a otro estilo gratuito si se vuelve ilegible.
- Definir si el módulo de robos incluye tasa por habitante cuando la fuente de población esté disponible; en caso contrario se muestra solo el conteo.
