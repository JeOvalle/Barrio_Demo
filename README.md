# Barrio Suba Compartir

Panel web de **solo consulta** que reúne información básica del barrio Suba Compartir (también conocido como *Sabana de Tibabuyes Norte*, en Bogotá) en una vista dividida entre mapa y panel de resultados.

La aplicación existe para resolver un problema concreto: los datos del barrio están dispersos entre portales de datos abiertos, OpenStreetMap y entidades distritales, con nombres distintos y granularidades mezcladas (barrio, UPZ o localidad). Aquí los 13 temas se consultan desde un único lugar, con un contrato de respuesta común y avisos explícitos cuando una fuente no está verificada.

> **Estado del proyecto:** demo funcional en desarrollo local. Las fuentes externas candidatas están marcadas como `por_validar`; los módulos sin fuente pública verificada devuelven `sin_fuente` en lugar de inventar datos. Las geometrías de `data/barrio.json` son aproximadas.

## Características

- **13 módulos de consulta**, sin operaciones de escritura:
  - Entidades con punto en el mapa: librerías, centros educativos, zonas verdes, escenarios deportivos, veterinarias, restaurantes, CAI y paradas de TransMilenio.
  - Indicadores agregados: robos, datos catastrales y datos de la localidad.
  - Condicionales / sin fuente: estado de calles y cámaras de seguridad.
- **Resolución de identidad del barrio**: `Suba Compartir` y `Sabana de Tibabuyes Norte` apuntan al mismo lugar, con jerarquía barrio → UPZ → localidad Suba.
- **Contrato único de resultado** con estados `ok`, `sin_datos`, `sin_fuente` y `error`, filas para el panel y `geojson` opcional para el mapa.
- **Degradación controlada de granularidad**: si un dato solo existe a nivel de localidad, se muestra con un aviso y se dibuja el polígono correspondiente.
- **Mapa interactivo** con Leaflet y tiles de OpenStreetMap (sin llave de pago). Cada consulta activa su propia capa; al hacer clic en un marcador se resalta la fila del panel.
- **Backend proxy**: las llaves viven en variables de entorno y nunca se envían al navegador; incluye caché en memoria (TTL de 5 minutos) y timeouts de 5 segundos para fuentes externas.

## Tecnologías

- **Backend:** Node.js (18 o superior) y Express 4 (CommonJS).
- **Frontend:** HTML, CSS y JavaScript plano, sin framework de UI.
- **Mapas:** Leaflet 1.9 servido localmente desde `node_modules`, con teselas de OpenStreetMap.
- **Configuración:** `dotenv`.
- **Pruebas:** `node:test` (sin dependencias adicionales).
- **Especificación de cambios:** OpenSpec.

No hay base de datos ni almacenamiento persistente; la caché vive en memoria del proceso.

## Requisitos

- Node.js 18 o superior (se usan `fetch`, `structuredClone` y `node:test`).
- npm (incluido con Node.js).
- En Windows, se recomienda ejecutar los comandos en PowerShell desde la raíz del proyecto.

## Instalación y ejecución

```powershell
# 1. Instalar dependencias
npm install

# 2. (Opcional) crear el archivo de entorno
Copy-Item .env.example .env

# 3. Editar .env si vas a conectar fuentes que requieran llave

# 4. Arrancar en modo desarrollo (reinicia al guardar cambios)
npm run dev
```

Abre <http://localhost:3000> en el navegador. El servidor imprimirá `Barrio Suba Compartir escuchando en http://localhost:3000`.

Para producción local sin recarga automática:

```powershell
npm start
```

Para ejecutar la suite de pruebas:

```powershell
npm test
```

Comprobación rápida de que el servidor responde:

```powershell
Invoke-RestMethod http://localhost:3000/health
# => ok : True
```

### Variables de entorno

Copia `.env.example` a `.env` y completa solo las llaves que uses. Ninguna se envía al navegador.

| Variable | Valor por defecto | Uso |
| --- | --- | --- |
| `PORT` | `3000` | Puerto HTTP del servidor. |
| `GOOGLE_PLACES_API_KEY` | vacía | Reservada para futura validación de fuentes (no se usa en la demo). |
| `OVERPASS_API_KEY` | vacía | Reservada para consultas a OpenStreetMap/Overpass. |
| `DATOS_BOGOTA_API_KEY` | vacía | Reservada para el portal de datos abiertos de Bogotá. |

## Estructura del proyecto

```text
.
├── data/
│   └── barrio.json            # Alias, jerarquía y geometrías de referencia
├── public/                    # Frontend estático servido por Express
│   ├── index.html             # Encabezado + áreas de mapa y panel
│   ├── styles.css             # Reparto 50/50 y apilamiento en pantallas estrechas
│   └── app.js                 # Tarjetas, consultas, capas Leaflet y resaltado
├── src/
│   ├── server.js              # Rutas HTTP y archivos estáticos
│   ├── barrio.js              # Resolutor del barrio y selección de nivel
│   ├── sources.js             # Registro de las 13 fuentes y su estado
│   ├── consultas.js           # Despacho de módulos hacia los adapters
│   ├── adapters/
│   │   ├── entidades.js       # Adapters con puntos GeoJSON
│   │   ├── indicadores.js     # Adapters de datos agregados
│   │   └── no-disponibles.js  # Cámaras y estado de calles
│   ├── resultado.js           # Contrato único de respuesta
│   ├── cache.js               # Caché en memoria con TTL
│   ├── http.js                # fetch con timeout
│   └── config.js              # Lectura de variables de entorno
├── test/                      # Pruebas con node:test
├── openspec/                  # Propuesta, diseño, tareas y specs del cambio
├── .env.example
├── MANZ.geojson
├── package.json
└── README.md
```

## API

### `GET /api/barrio/resolver?q=...`

Resuelve el nombre canónico y devuelve la jerarquía geográfica. El parámetro `q` es opcional; si se omite, devuelve el barrio por defecto. Un texto que no coincida con los alias devuelve `404`.

```powershell
Invoke-RestMethod 'http://localhost:3000/api/barrio/resolver?q=Sabana%20de%20Tibabuyes%20Norte'
```

```json
{
  "id": "suba-compartir",
  "nombre": "Suba Compartir",
  "alias": ["Suba Compartir", "Sabana de Tibabuyes Norte"],
  "nota": "Geometrias de referencia aproximadas...",
  "niveles": {
    "barrio": { "disponible": true, "poligono": { "...": "..." } },
    "upz": { "disponible": false, "poligono": null },
    "localidad": { "disponible": true, "poligono": { "...": "..." } }
  }
}
```

### `GET /api/consultar?modulo=...&barrio=...`

Ejecuta un módulo. `barrio` debe ser un alias válido y `modulo` uno de los identificadores del registro de fuentes.

```powershell
Invoke-RestMethod 'http://localhost:3000/api/consultar?modulo=restaurantes&barrio=Suba%20Compartir'
```

Respuestas posibles: `400` si el barrio no es válido, `404` si el módulo no existe, y `200` con el resultado normalizado en los demás casos.

### Contrato de resultado

Toda respuesta de `/api/consultar` tiene esta forma:

```json
{
  "estado": "sin_fuente",
  "fuente": "Camaras de seguridad",
  "actualizado": "2026-11-20T12:00:00.000Z",
  "aviso": "No se publican ubicaciones de camaras por razones de seguridad. Sin fuente publica verificada. No se realizan consultas externas.",
  "granularidad": null,
  "datos": [],
  "geojson": null
}
```

| Campo | Descripción |
| --- | --- |
| `estado` | `ok` (hay datos), `sin_datos` (fuente válida sin registros), `sin_fuente` (sin fuente pública verificada) o `error` (fallo al consultar). |
| `fuente` | Título legible de la fuente declarada en `src/sources.js`. |
| `actualizado` | Marca de tiempo ISO de la respuesta o de los datos. |
| `aviso` | Nota de cobertura, verificación y granularidad que se muestra en la tarjeta. |
| `granularidad` | Nivel usado: `barrio`, `upz` o `localidad` (o `null`). |
| `datos[]` | Filas para el panel; las entidades incluyen `id` y `etiqueta`, los indicadores `valor`, `unidad` y `periodo`. |
| `geojson` | `FeatureCollection` opcional con puntos, líneas o el polígono del nivel usado. |

Los módulos sensibles se agregan: robos y catastral no devuelven ubicaciones individuales, y cámaras siempre responde `sin_fuente`.

## Módulos y fuentes

El registro central está en `src/sources.js`. Cada módulo declara `titulo`, `categoria`, `endpoint`, `estado`, `requiereLlave`, `cobertura`, `nota` y `nivelesSoportados`.

| ID del módulo | Categoría | Estado |
| --- | --- | --- |
| `estado-calles` | condicional | `por_validar` (sin endpoint verificado) |
| `librerias` | entidad | `por_validar` (OpenStreetMap / Biblored) |
| `robos` | indicador | `por_validar` (datos agregados) |
| `datos-catastrales` | indicador | `por_validar` (agregado, sin fichas por predio) |
| `centros-educativos` | entidad | `por_validar` (OSM / Secretaría de Educación) |
| `camaras` | sin_fuente | `sin_fuente` (no se publican ubicaciones) |
| `zonas-verdes` | entidad | `por_validar` (OSM / IDEGIS) |
| `escenarios-deportivos` | entidad | `por_validar` (IDRD / OSM) |
| `veterinarias` | entidad | `por_validar` (OSM) |
| `restaurantes` | entidad | `por_validar` (OSM) |
| `cai` | entidad | `por_validar` (OSM / Policía) |
| `datos-localidad` | indicador | `por_validar` (datos censales de Suba) |
| `paradas-transmilenio` | entidad | `por_validar` (GTFS de TransMilenio) |

Para conectar una fuente real hay que validar su endpoint, completar el registro y sustituir los datos de ejemplo que recibe el adapter correspondiente. Las llaves se leen con `obtenerLlave()` desde `src/config.js`.

## Pruebas

Las pruebas cubren el resolutor de barrio, el registro de fuentes, el contrato de resultado, los adapters, la caché, los timeouts y la protección de llaves de entorno:

```powershell
npm test
```

También puedes validar el cambio de OpenSpec si tienes la CLI instalada:

```powershell
openspec validate "panel-barrio-suba-compartir" --type change
```

## Pendiente y siguientes pasos

Las tareas 1 a 5 del cambio `panel-barrio-suba-compartir` están completas. Quedan:

- **6.1** Validar la disponibilidad real de cada fuente candidata y documentar endpoints probados en `docs/fuentes.md`.
- **6.2** Reemplazar las geometrías aproximadas de `data/barrio.json` por las oficiales.
- **7.1** Recorrer los 13 módulos en el navegador y verificar estados, avisos y capas.
- **7.2** Ejecutar la verificación final de pruebas y OpenSpec, y archivar el cambio.

## Decisiones de diseño

- Express actúa como proxy para evitar bloqueos CORS, mantener las llaves fuera del cliente y centralizar la caché.
- Un solo contrato de resultado alimenta el panel y el mapa; `geojson` ausente significa "sin capa", no "falló".
- El barrio se resuelve una sola vez desde datos locales para evitar inconsistencias entre módulos.
- Las capas del mapa están desactivadas por defecto y se activan solo al consultar su módulo.
- No se usan Google Places, Mapbox ni otras fuentes de pago, y no hay base de datos.
