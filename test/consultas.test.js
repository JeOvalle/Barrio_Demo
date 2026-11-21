const test = require('node:test');
const assert = require('node:assert/strict');

const { consultarModulo, ADAPTERS } = require('../src/consultas');
const { resolverBarrio } = require('../src/barrio');
const { ESTADOS } = require('../src/resultado');

const barrio = resolverBarrio('Suba Compartir');

test('los trece modulos devuelven el contrato de resultado', async () => {
  for (const modulo of Object.keys(ADAPTERS)) {
    const resultado = await consultarModulo(modulo, barrio);

    assert.ok(ESTADOS.includes(resultado.estado));
    assert.ok(Object.hasOwn(resultado, 'fuente'));
    assert.ok(Object.hasOwn(resultado, 'actualizado'));
    assert.ok(Object.hasOwn(resultado, 'aviso'));
    assert.ok(Array.isArray(resultado.datos));
    assert.ok(Object.hasOwn(resultado, 'geojson'));
  }
});

test('un modulo desconocido devuelve error', async () => {
  const resultado = await consultarModulo('no-existe', barrio);

  assert.equal(resultado.estado, 'error');
});

test('las respuestas no incluyen valores de llaves de entorno', async () => {
  process.env.DATOS_BOGOTA_API_KEY = 'secreto-no-publico';

  try {
    const resultado = await consultarModulo('restaurantes', barrio);
    assert.equal(JSON.stringify(resultado).includes('secreto-no-publico'), false);
  } finally {
    delete process.env.DATOS_BOGOTA_API_KEY;
  }
});
