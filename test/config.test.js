const test = require('node:test');
const assert = require('node:assert/strict');

const { obtenerLlave, estaConfigurada } = require('../src/config');
const { listarFuentes } = require('../src/sources');

test('una llave no configurada devuelve null', () => {
  assert.equal(obtenerLlave('VARIABLE_QUE_NO_EXISTE'), null);
  assert.equal(estaConfigurada('VARIABLE_QUE_NO_EXISTE'), false);
});

test('la configuracion publica no incluye valores de llaves', () => {
  process.env.PRUEBA_API_KEY = 'secreto-no-publico';

  try {
    assert.equal(obtenerLlave('PRUEBA_API_KEY'), 'secreto-no-publico');
    const configuracionPublica = JSON.stringify(listarFuentes());
    assert.equal(configuracionPublica.includes('secreto-no-publico'), false);
  } finally {
    delete process.env.PRUEBA_API_KEY;
  }
});
