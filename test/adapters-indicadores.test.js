const test = require('node:test');
const assert = require('node:assert/strict');

const { MODULOS } = require('../src/sources');
const { resolverBarrio } = require('../src/barrio');
const { crearAdapterIndicador } = require('../src/adapters/indicadores');

const barrio = resolverBarrio('Suba Compartir');

function conEndpoint(modulo, callback) {
  const fuente = MODULOS[modulo];
  const original = fuente.endpoint;
  fuente.endpoint = 'http://fuente-de-prueba.invalid';
  return Promise.resolve(callback()).finally(() => {
    fuente.endpoint = original;
  });
}

test('robos devuelve agregados y un poligono, nunca puntos de eventos', async () => {
  await conEndpoint('robos', async () => {
    const resultado = await crearAdapterIndicador('robos')({
      barrio,
      indicadores: [{ etiqueta: 'Robos en octubre', valor: 42, unidad: 'eventos', periodo: '2026-10' }],
    });

    assert.equal(resultado.estado, 'ok');
    assert.equal(resultado.granularidad, 'barrio');
    assert.equal(resultado.datos[0].unidad, 'eventos');
    assert.equal(resultado.datos[0].periodo, '2026-10');
    assert.equal(resultado.geojson.features[0].geometry.type, 'Polygon');
    assert.equal(resultado.geojson.features.some((f) => f.geometry.type === 'Point'), false);
  });
});

test('el adapter catastral agrega por barrio', async () => {
  await conEndpoint('datos-catastrales', async () => {
    const resultado = await crearAdapterIndicador('datos-catastrales')({
      barrio,
      indicadores: [{ etiqueta: 'Predios', valor: 1200, unidad: 'predios', periodo: '2026' }],
    });

    assert.equal(resultado.granularidad, 'barrio');
    assert.deepEqual(resultado.geojson.features[0].geometry.coordinates, barrio.niveles.barrio.poligono.coordinates);
  });
});

test('datos de la localidad pintan el poligono de Suba y avisan la granularidad', async () => {
  await conEndpoint('datos-localidad', async () => {
    const resultado = await crearAdapterIndicador('datos-localidad')({
      barrio,
      indicadores: [{ etiqueta: 'Poblacion', valor: 100000, unidad: 'habitantes', periodo: '2025' }],
    });

    assert.equal(resultado.granularidad, 'localidad');
    assert.match(resultado.aviso, /Granularidad: localidad/);
    assert.deepEqual(resultado.geojson.features[0].geometry.coordinates, barrio.niveles.localidad.poligono.coordinates);
  });
});

test('sin endpoint verificado los indicadores devuelven sin_fuente', async () => {
  for (const modulo of ['robos', 'datos-catastrales', 'datos-localidad']) {
    const resultado = await crearAdapterIndicador(modulo)({ barrio });
    assert.equal(resultado.estado, 'sin_fuente');
    assert.equal(resultado.geojson, null);
  }
});
