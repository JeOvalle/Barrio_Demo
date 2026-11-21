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

function avisoDe(fuente) {
  return [fuente.cobertura, fuente.nota].filter(Boolean).join('. ');
}

function crearAdapterEntidad(modulo) {
  return async function consultarEntidad({ barrio, registros = [], actualizado } = {}) {
    const fuente = obtenerFuente(modulo);

    if (!fuente || fuente.estado === 'sin_fuente' || !fuente.endpoint) {
      return crearResultado({
        estado: 'sin_fuente',
        fuente: fuente?.titulo ?? null,
        aviso: fuente ? avisoDe(fuente) : 'Sin fuente declarada',
      });
    }

    const seleccion = seleccionarNivel(barrio, fuente.nivelesSoportados);

    if (registros.length === 0) {
      return crearResultado({
        estado: 'sin_datos',
        fuente: fuente.titulo,
        aviso: avisoDe(fuente),
        granularidad: seleccion.nivel,
      });
    }

    const filas = [];
    const puntos = [];

    registros.forEach((registro, indice) => {
      const nombre = registro.nombre ?? `Registro ${indice + 1}`;
      const id = registro.id ? String(registro.id) : slug(`${modulo}-${nombre}-${indice}`);
      const { nombre: _nombre, latitud, longitud, lat, lon, ...resto } = registro;
      filas.push({ id, etiqueta: nombre, ...resto });

      const latitudFinal = latitud ?? lat;
      const longitudFinal = longitud ?? lon;
      if (Number.isFinite(Number(latitudFinal)) && Number.isFinite(Number(longitudFinal))) {
        puntos.push({
          type: 'Feature',
          id,
          geometry: { type: 'Point', coordinates: [Number(longitudFinal), Number(latitudFinal)] },
          properties: { id, etiqueta: nombre },
        });
      }
    });

    return crearResultado({
      estado: 'ok',
      fuente: fuente.titulo,
      actualizado,
      aviso: avisoDe(fuente),
      granularidad: seleccion.nivel,
      datos: filas,
      geojson: { type: 'FeatureCollection', features: puntos },
    });
  };
}

const librerias = crearAdapterEntidad('librerias');
const centrosEducativos = crearAdapterEntidad('centros-educativos');
const zonasVerdes = crearAdapterEntidad('zonas-verdes');
const escenariosDeportivos = crearAdapterEntidad('escenarios-deportivos');
const veterinarias = crearAdapterEntidad('veterinarias');
const restaurantes = crearAdapterEntidad('restaurantes');
const cai = crearAdapterEntidad('cai');
const paradasTransmilenio = crearAdapterEntidad('paradas-transmilenio');

module.exports = {
  crearAdapterEntidad,
  librerias,
  centrosEducativos,
  zonasVerdes,
  escenariosDeportivos,
  veterinarias,
  restaurantes,
  cai,
  paradasTransmilenio,
};
