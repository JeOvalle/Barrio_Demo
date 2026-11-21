const test = require('node:test');
const assert = require('node:assert/strict');

const { MODULOS } = require('../src/sources');
const { resolverBarrio } = require('../src/barrio');
const { camaras, estadoCalles } = require('../src/adapters/no-disponibles');

const barrio = resolverBarrio('Suba Compartir');

test('camaras siempre devuelve sin_fuente y no intenta consultar nada', async () => {
  const fetchQueFalla = () => {
    throw new Error('No se debio llamar a una fuente externa');
  };

  const resultado = await camaras({ barrio, fetchImpl: fetchQueFalla });

  assert.equal(resultado.estado, 'sin_fuente');
  assert.match(resultado.aviso, /No se publican ubicaciones/);
  assert.equal(resultado.geojson, null);
});

test('estado de calles sin fuente verificada devuelve sin_fuente', async () => {
  const resultado = await estadoCalles({ barrio });

  assert.equal(resultado.estado, 'sin_fuente');
  assert.equal(resultado.geojson, null);
});

test('estado de calles degrada a localidad con aviso visible', async () => {
  const fuente = MODULOS['estado-calles'];
  const endpointOriginal = fuente.endpoint;
  const nivelesOriginales = fuente.nivelesSoportados;

  fuente.endpoint = 'http://fuente-de-prueba.invalid';
  fuente.nivelesSoportados = ['localidad'];

  try {
    const resultado = await estadoCalles({
      barrio,
      tramos: [
        {
          id: 'tramo-1',
          etiqueta: 'Calle 1',
          estado: 'obras',
          coordenadas: [[-74.09, 4.74], [-74.08, 4.74]],
        },
      ],
    });

    assert.equal(resultado.estado, 'ok');
    assert.equal(resultado.granularidad, 'localidad');
    assert.match(resultado.aviso, /Granularidad: localidad/);
    assert.equal(resultado.geojson.features[0].geometry.type, 'LineString');
  } finally {
    fuente.endpoint = endpointOriginal;
    fuente.nivelesSoportados = nivelesOriginales;
  }
});
