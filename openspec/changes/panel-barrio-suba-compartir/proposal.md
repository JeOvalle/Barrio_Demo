# Proposal

## Why

Los vecinos de Suba Compartir —que en algunas fuentes aparece como Sabana de Tibabuyes Norte— no tienen un único lugar donde consultar información básica de su barrio: calles, bibliotecas, robos, datos catastrales, colegios, cámaras, zonas verdes, escenarios deportivos, veterinarias, restaurantes, CAI, datos de la localidad y paradas de TransMilenio. Hoy esos datos están dispersos en portales de datos abiertos, OpenStreetMap y entidades distritales, con nombres distintos y granularidades mezcladas (barrio, UPZ o localidad). Esta change crea una página web de **solo consulta** que reúne los 13 temas en módulos con una vista compartida de mapa y panel.

## What Changes

- Crear una aplicación web con frontend HTML/JS plano y un backend Express ligero que actúa como proxy de las fuentes de datos.
- Definir 13 módulos de consulta con un único botón **Consultar** y sin operaciones de escritura.
- Resolver la identidad del barrio antes de consultar: `Suba Compartir` y `Sabana de Tibabuyes Norte` apuntan al mismo lugar, con jerarquía barrio → UPZ → localidad Suba y geometrías asociadas.
- Establecer un contrato único de resultado con estados `ok`, `sin_datos`, `sin_fuente` y `error`, más `fuente`, `actualizado`, `aviso`, filas para el panel y `geojson` opcional para el mapa.
- Mostrar los módulos sin fuente pública verificada como `sin_fuente` en lugar de inventar datos. En particular, las cámaras de seguridad siempre se muestran así; el estado de calles queda condicionado a que exista fuente válida.
- Aceptar degradación de granularidad: si una fuente solo tiene datos de la localidad Suba, mostrar el dato con un aviso explícito y pintar el polígono correspondiente.
- Mantener un registro de fuentes por módulo con endpoint, llave requerida, estado (`verificado` / `por_validar`) y nota de cobertura.
- Mostrar la mitad de la página con un mapa Leaflet sobre tiles de OpenStreetMap y la otra mitad con el panel de resultados. Cada consulta enciende su capa; un clic en un marcador resalta la fila del panel.
- Agregar caché en memoria, timeouts y manejo de errores en el backend. No se introduce base de datos.
- No incluye autenticación, edición de datos, Google Places, llaves de pago ni despliegue a producción.

## Capabilities

### New Capabilities

- `barrio-geography`: resolución del nombre canónico del barrio y sus alias, con jerarquía geográfica (barrio, UPZ, localidad) y geometrías (polígono, centroide, bbox) usadas por todas las consultas.
- `source-registry`: declaración de la fuente de cada módulo, su estado de verificación, necesidades de llave, cobertura y reglas para declarar `sin_fuente`.
- `module-queries`: ejecución de los 13 módulos de consulta mediante un contrato común de resultado, incluyendo estados, granularidad, avisos y normalización de datos.
- `map-dashboard`: vista dividida mapa/panel, activación de capas por módulo, resaltado entre marcadores y filas, y presentación de estados vacíos y de error.

### Modified Capabilities

Ninguna. El proyecto no tiene specs previas.

## Impact

- Estructura nueva: `public/` (HTML, CSS, JS), `src/` (servidor, resolutor, registro de fuentes y adapters), `data/` (alias y geometrías del barrio).
- Dependencias nuevas: `express`, `leaflet` y utilidades mínimas para configuración; sin framework de UI.
- Fuentes externas candidatas, todas marcadas como `por_validar` hasta comprobarse: OpenStreetMap/Overpass, portales de datos abiertos (CKAN / datos.gov.co), IDEGIS/Geoportal y GTFS de TransMilenio.
- Endpoints internos nuevos: resolución del barrio y consulta por módulo.
- Sin base de datos ni almacenamiento persistente; la caché vive en memoria del proceso.
- Desarrollo local en Windows mediante `npm run dev`.
