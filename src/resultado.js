const ESTADOS = ['ok', 'sin_datos', 'sin_fuente', 'error'];

function crearResultado({
  estado,
  fuente = null,
  actualizado = new Date().toISOString(),
  aviso = '',
  granularidad = null,
  datos = [],
  geojson = null,
} = {}) {
  if (!ESTADOS.includes(estado)) {
    throw new Error(`Estado no valido: ${estado}`);
  }

  return {
    estado,
    fuente,
    actualizado,
    aviso,
    granularidad,
    datos,
    geojson: geojson ?? null,
  };
}

module.exports = { crearResultado, ESTADOS };
