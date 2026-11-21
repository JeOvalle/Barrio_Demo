const { crearResultado } = require('../resultado');
const { seleccionarNivel } = require('../barrio');
const { obtenerFuente } = require('../sources');

function slug(texto) {
  return String(texto ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function avisoDe(fuente, nivel) {
  const partes = [fuente.cobertura, fuente.nota].filter(Boolean);
  if (nivel && nivel !== 'barrio') {
    partes.push(`Granularidad: ${nivel}.`);
  }
  return partes.join('. ');
}

function crearAdapterIndicador(modulo) {
  return async function consultarIndicador({ barrio, indicadores = [], actualizado } = {}) {
    const fuente = obtenerFuente(modulo);

    if (!fuente || fuente.estado === 'sin_fuente' || !fuente.endpoint) {
      return crearResultado({
        estado: 'sin_fuente',
        fuente: fuente?.titulo ?? null,
        aviso: fuente ? avisoDe(fuente) : 'Sin fuente declarada',
      });
    }

    const seleccion = seleccionarNivel(barrio, fuente.nivelesSoportados);

    if (indicadores.length === 0) {
      return crearResultado({
        estado: 'sin_datos',
        fuente: fuente.titulo,
        aviso: avisoDe(fuente, seleccion.nivel),
        granularidad: seleccion.nivel,
      });
    }

    const datos = indicadores.map((indicador, indice) => {
      const etiqueta = indicador.etiqueta ?? `Indicador ${indice + 1}`;
      return {
        id: indicador.id ? String(indicador.id) : slug(`${modulo}-${etiqueta}-${indice}`),
        etiqueta,
        valor: indicador.valor ?? null,
        unidad: indicador.unidad ?? null,
        periodo: indicador.periodo ?? null,
      };
    });

    let geojson = null;
    if (seleccion.geometria?.poligono) {
      geojson = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            id: `${modulo}-area`,
            geometry: seleccion.geometria.poligono,
            properties: { id: `${modulo}-area`, etiqueta: seleccion.geometria.nombre },
          },
        ],
      };
    }

    return crearResultado({
      estado: 'ok',
      fuente: fuente.titulo,
      actualizado,
      aviso: avisoDe(fuente, seleccion.nivel),
      granularidad: seleccion.nivel,
      datos,
      geojson,
    });
  };
}

const robos = crearAdapterIndicador('robos');
const datosCatastrales = crearAdapterIndicador('datos-catastrales');
const datosLocalidad = crearAdapterIndicador('datos-localidad');

module.exports = { crearAdapterIndicador, robos, datosCatastrales, datosLocalidad };
