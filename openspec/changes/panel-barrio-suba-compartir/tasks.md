# Tasks

## 1. Setup y servidor base

- [x] 1.1 Crear `package.json` con scripts `dev` y `start`, e instalar `express` y `leaflet`. Verificar que `npm install` termina sin errores y que `npm run dev` levanta el servidor.
- [x] 1.2 Crear la estructura `public/`, `src/` y `data/`, y un servidor Express mínimo que sirva `public/` y responda `/health`. Verificar que `http://localhost:3000/health` devuelve una respuesta correcta.

## 2. Geografía del barrio

- [x] 2.1 Crear `data/barrio.json` con los alias "Suba Compartir" y "Sabana de Tibabuyes Norte", el identificador canónico y las geometrías de barrio, UPZ y localidad Suba. Verificar que el archivo es JSON válido y contiene ambos alias exactos.
- [x] 2.2 Implementar el resolutor que devuelve la jerarquía geográfica y las geometrías. Verificar con `node --test` que ambos alias producen el mismo identificador y que cada nivel incluye polígono, centroide y bbox o su marca de no disponible.

## 3. Registro de fuentes

- [x] 3.1 Definir el registro de fuentes para los trece módulos con endpoint, estado `verificado`/`por_validar`, llave requerida y nota de cobertura. Verificar con una prueba que existen los trece identificadores y que cámaras está declarado sin fuente pública.
- [x] 3.2 Añadir `.env.example` y la carga de variables de entorno para llaves. Verificar con una prueba que ninguna respuesta del endpoint incluye el valor de una llave.
- [x] 3.3 Implementar caché en memoria con TTL inicial de cinco minutos y timeout por petición externa. Verificar con una prueba que una segunda consulta idéntica no vuelve a llamar a la fuente simulada.

## 4. Contrato y adapters de consulta

- [x] 4.1 Implementar el normalizador del resultado con estados `ok`, `sin_datos`, `sin_fuente` y `error`, campos `fuente`, `actualizado`, `aviso`, filas `datos[]` y `geojson` opcional. Verificar con una prueba que todos los estados son válidos y que `geojson` ausente no invalida las filas.
- [x] 4.2 Implementar los adapters de entidades con punto: librerías, centros educativos, zonas verdes, escenarios deportivos, veterinarias, restaurantes, CAI y paradas de TransMilenio. Verificar con pruebas parametrizadas que cada fila trae `id` estable y que el `geojson` resultante contiene puntos.
- [x] 4.3 Implementar los adapters de indicadores agregados: robos, datos catastrales y datos de la localidad. Verificar con pruebas que robos no devuelve puntos de eventos, que catastral es agregado por barrio y que cada indicador declara `unidad` y `periodo` cuando aplica.
- [x] 4.4 Implementar los adapters sin fuente y la degradación de granularidad: cámaras siempre `sin_fuente`, estado de calles condicionado a fuente válida, y datos solo de localidad o UPZ con aviso visible. Verificar con pruebas que cámaras no llama a endpoints externos y que un dato de localidad incluye el aviso y el polígono de Suba.
- [x] 4.5 Exponer `GET /api/barrio/resolver?q=...` y `GET /api/consultar?modulo=...&barrio=...`. Verificar con peticiones manuales que ambas respuestas cumplen el contrato definido en `specs/module-queries/spec.md`.

## 5. Vista mapa y panel

- [x] 5.1 Crear `public/index.html` con el encabezado del barrio y sus alias, y dos áreas laterales para mapa y panel. Verificar al abrirlo en el navegador que ambas áreas son visibles.
- [x] 5.2 Crear `public/styles.css` con el reparto 50/50, estados visuales de tarjeta y apilamiento en pantallas estrechas. Verificar redimensionando la ventana que el mapa queda encima del panel.
- [x] 5.3 Implementar `public/app.js` para renderizar las trece tarjetas y enviar la consulta al pulsar "Consultar". Verificar que una consulta muestra filas o el estado correspondiente sin recargar la página.
- [x] 5.4 Integrar Leaflet para dibujar el polígono del barrio, las capas GeoJSON devueltas y el encuadre de la extensión. Verificar que consultar restaurantes dibuja puntos y que el mapa se ajusta a ellos.
- [x] 5.5 Implementar el resaltado de fila al hacer clic en un marcador y la presentación de `sin_datos`, `sin_fuente`, `error` y avisos de granularidad. Verificar que una tarjeta `sin_fuente` muestra su aviso y no dibuja capa, y que un clic en marcador resalta la fila sin nueva petición.

## 6. Validación de fuentes

- [ ] 6.1 Validar la disponibilidad real de cada fuente candidata y actualizar su estado en el registro. Verificar entregando `docs/fuentes.md` con endpoint probado, respuesta obtenida y cobertura observada por módulo.
- [ ] 6.2 Ajustar `data/barrio.json` con los polígonos y alias definitivos cuando se confirme una fuente oficial. Verificar que las pruebas del resolutor siguen pasando con los datos actualizados.

## 7. Verificación de integración

- [ ] 7.1 Recorrer los trece módulos en el navegador con `npm run dev` y comprobar estados, avisos y capas. Verificar con un checklist de los trece resultados observados.
- [ ] 7.2 Ejecutar `node --test` y `openspec validate "panel-barrio-suba-compartir" --type change`. Verificar que ambos terminan sin errores.

## Workflow follow-up

- Archivar el change después de la revisión, siguiendo el flujo de OpenSpec.
- Verificar el resultado archivado.
