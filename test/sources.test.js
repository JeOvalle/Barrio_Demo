const test = require('node:test');
const assert = require('node:assert/strict');

const { MODULOS, obtenerFuente, listarFuentes, esConsultable } = require('../src/sources');

test('existen los trece modulos declarados', () => {
  assert.equal(Object.keys(MODULOS).length, 13);
  assert.equal(listarFuentes().length, 13);
});

test('cada fuente declara estado, llave, cobertura y niveles', () => {
  for (const fuente of listarFuentes()) {
    assert.ok(fuente.titulo);
    assert.ok(['verificado', 'por_validar', 'sin_fuente'].includes(fuente.estado));
    assert.equal(typeof fuente.requiereLlave, 'boolean');
    assert.ok(fuente.cobertura);
    assert.ok(Array.isArray(fuente.nivelesSoportados));
  }
});

test('camaras esta declarada sin fuente publica', () => {
  const camaras = obtenerFuente('camaras');

  assert.equal(camaras.estado, 'sin_fuente');
  assert.equal(camaras.categoria, 'sin_fuente');
  assert.equal(esConsultable(camaras), false);
});

test('ninguna fuente sin endpoint es consultable', () => {
  for (const fuente of listarFuentes()) {
    assert.equal(esConsultable(fuente), false);
  }
});

test('un modulo desconocido no tiene fuente', () => {
  assert.equal(obtenerFuente('no-existe'), null);
});
