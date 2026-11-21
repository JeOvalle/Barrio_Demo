const test = require('node:test');
const assert = require('node:assert/strict');

const { crearResultado, ESTADOS } = require('../src/resultado');

test('todos los estados definidos producen resultados validos', () => {
  for (const estado of ESTADOS) {
    const resultado = crearResultado({ estado });
    assert.equal(resultado.estado, estado);
    assert.equal(resultado.geojson, null);
    assert.deepEqual(resultado.datos, []);
  }
});

test('un estado fuera del contrato se rechaza', () => {
  assert.throws(() => crearResultado({ estado: 'desconocido' }), /Estado no valido/);
});

test('un resultado sin geometria conserva sus filas', () => {
  const filas = [{ id: 'a', etiqueta: 'A', valor: 1 }];
  const resultado = crearResultado({ estado: 'ok', datos: filas });

  assert.deepEqual(resultado.datos, filas);
  assert.equal(resultado.geojson, null);
});

test('el resultado declara granularidad y aviso cuando se proporcionan', () => {
  const resultado = crearResultado({
    estado: 'ok',
    granularidad: 'localidad',
    aviso: 'Disponible solo a nivel de localidad',
  });

  assert.equal(resultado.granularidad, 'localidad');
  assert.match(resultado.aviso, /localidad/);
});
