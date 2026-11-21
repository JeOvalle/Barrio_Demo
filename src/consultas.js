const { crearResultado } = require('./resultado');
const { crearCache } = require('./cache');
const { obtenerFuente } = require('./sources');
const { resolverBarrio } = require('./barrio');

const {
  librerias,
  centrosEducativos,
  zonasVerdes,
  escenariosDeportivos,
  veterinarias,
  restaurantes,
  cai,
  paradasTransmilenio,
} = require('./adapters/entidades');

const { robos, datosCatastrales, datosLocalidad } = require('./adapters/indicadores');
const { camaras, estadoCalles } = require('./adapters/no-disponibles');

const ADAPTERS = {
  'estado-calles': estadoCalles,
  librerias,
  robos,
  'datos-catastrales': datosCatastrales,
  'centros-educativos': centrosEducativos,
  camaras,
  'zonas-verdes': zonasVerdes,
  'escenarios-deportivos': escenariosDeportivos,
  veterinarias,
  restaurantes,
  cai,
  'datos-localidad': datosLocalidad,
  'paradas-transmilenio': paradasTransmilenio,
};

const cache = crearCache();

async function consultarModulo(modulo, barrio) {
  const fuente = obtenerFuente(modulo);

  if (!fuente || !ADAPTERS[modulo] || !barrio) {
    return crearResultado({
      estado: 'error',
      aviso: 'Modulo o barrio no valido',
    });
  }

  const clave = `${modulo}:${barrio.id}:${fuente.estado}`;

  return cache.obtener(clave, async () => {
    try {
      return await ADAPTERS[modulo]({ barrio });
    } catch (error) {
      return crearResultado({
        estado: 'error',
        fuente: fuente.titulo,
        aviso: 'No fue posible consultar la fuente en este momento',
      });
    }
  });
}

module.exports = { consultarModulo, ADAPTERS };
