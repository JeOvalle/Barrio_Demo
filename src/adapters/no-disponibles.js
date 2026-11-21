const { crearResultado } = require('../resultado');
const { seleccionarNivel } = require('../barrio');
const { obtenerFuente, esConsultable } = require('../sources');

function avisoDe(fuente, nivel) {
  const partes = [fuente.cobertura, fuente.nota].filter(Boolean);
  if (nivel && nivel !== 'barrio') {
    partes.push(`Granularidad: ${nivel}.`);
  }
  return partes.join('. ');
}

async function camaras() {
  const fuente = obtenerFuente('camaras');
  return crearResultado({
    estado: 'sin_fuente',
    fuente: fuente.titulo,
    aviso: avisoDe(fuente),
  });
}

function crearAdapterEstadoCalles(modulo = 'estado-calles') {
  return async function consultarEstadoCalles({ barrio, tramos = [], actualizado } = {}) {
    const fuente = obtenerFuente(modulo);

    if (!esConsultable(fuente)) {
      return crearResultado({
        estado: 'sin_fuente',
        fuente: fuente.titulo,
        aviso: avisoDe(fuente),
      });
    }

    const seleccion = seleccionarNivel(barrio, fuente.nivelesSoportados);

    if (tramos.length === 0) {
      return crearResultado({
        estado: 'sin_datos',
        fuente: fuente.titulo,
        aviso: avisoDe(fuente, seleccion.nivel),
        granularidad: seleccion.nivel,
      });
    }

    const datos = tramos.map((tramo, indice) => {
      const etiqueta = tramo.etiqueta ?? `Tramo ${indice + 1}`;
      return {
        id: tramo.id ?? `${modulo}-${indice + 1}`,
        etiqueta,
        estado: tramo.estado ?? 'sin informacion',
      };
    });

    const features = tramos.flatMap((tramo, indice) => {
      if (!Array.isArray(tramo.coordenadas)) {
        return [];
      }
      return [
        {
          type: 'Feature',
          id: datos[indice].id,
          geometry: { type: 'LineString', coordinates: tramo.coordenadas },
          properties: { etiqueta: datos[indice].etiqueta },
        },
      ];
    });

    return crearResultado({
      estado: 'ok',
      fuente: fuente.titulo,
      actualizado,
      aviso: avisoDe(fuente, seleccion.nivel),
      granularidad: seleccion.nivel,
      datos,
      geojson: { type: 'FeatureCollection', features },
    });
  };
}

const estadoCalles = crearAdapterEstadoCalles();

module.exports = { camaras, estadoCalles, crearAdapterEstadoCalles };
