const test = require('node:test');
const assert = require('node:assert/strict');

const { MODULOS } = require('../src/sources');
const { resolverBarrio } = require('../src/barrio');
const { crearAdapterEntidad } = require('../src/adapters/entidades');

const MODULOS_CON_PUNTO = [
  'librerias',
  'centros-educativos',
  'zonas-verdes',
  'escenarios-deportivos',
  'veterinarias',
  'restaurantes',
  'cai',
  'paradas-transmilenio',
];

const barrio = resolverBarrio('Suba Compartir');

for (const modulo of MODULOS_CON_PUNTO) {
  test(`el adapter de ${modulo} produce filas con id estable y puntos`, async () => {
    const fuente = MODULOS[modulo];
    const endpointOriginal = fuente.endpoint;
    fuente.endpoint = 'http://fuente-de-prueba.invalid';

    try {
      const consultar = crearAdapterEntidad(modulo);
      const registros = [{ id: `${modulo}-1`, nombre: 'Primer registro', latitud: 4.74, longitud: -74.08 }];

      const primero = await consultar({ barrio, registros });
      const segundo = await consultar({ barrio, registros });

      assert.equal(primero.estado, 'ok');
      assert.equal(primero.datos[0].id, segundo.datos[0].id);
      assert.equal(primero.datos[0].etiqueta, 'Primer registro');
      assert.equal(primero.geojson.type, 'FeatureCollection');
      assert.equal(primero.geojson.features[0].geometry.type, 'Point');
      assert.equal(primero.geojson.features[0].properties.id, primero.datos[0].id);
    } finally {
      fuente.endpoint = endpointOriginal;
    }
  });
}

test('sin endpoint verificado los adapters devuelven sin_fuente', async () => {
  for (const modulo of MODULOS_CON_PUNTO) {
    const resultado = await crearAdapterEntidad(modulo)({ barrio });
    assert.equal(resultado.estado, 'sin_fuente');
    assert.equal(resultado.geojson, null);
  }
});
