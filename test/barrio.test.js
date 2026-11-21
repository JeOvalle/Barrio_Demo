const test = require('node:test');
const assert = require('node:assert/strict');

const { resolverBarrio, seleccionarNivel } = require('../src/barrio');

test('ambos alias resuelven al mismo identificador canonico', () => {
  const principal = resolverBarrio('Suba Compartir');
  const alterno = resolverBarrio('Sabana de Tibabuyes Norte');

  assert.equal(principal.id, 'suba-compartir');
  assert.equal(alterno.id, principal.id);
  assert.deepEqual(principal.alias, ['Suba Compartir', 'Sabana de Tibabuyes Norte']);
});

test('la jerarquia expone barrio, UPZ y localidad', () => {
  const barrio = resolverBarrio('Suba Compartir');

  assert.deepEqual(Object.keys(barrio.niveles), ['barrio', 'upz', 'localidad']);
  assert.equal(barrio.niveles.localidad.nombre, 'Suba');
  assert.ok(barrio.niveles.upz.id);
});

test('el nivel barrio incluye poligono, centroide y bbox', () => {
  const geometria = resolverBarrio('Suba Compartir').niveles.barrio;

  assert.equal(geometria.poligono.type, 'Polygon');
  assert.equal(geometria.centroide.length, 2);
  assert.equal(geometria.bbox.length, 4);
});

test('un nivel sin geometria se marca como no disponible', () => {
  const upz = resolverBarrio('Suba Compartir').niveles.upz;

  assert.equal(upz.disponible, false);
  assert.equal(upz.poligono, null);
  assert.equal(upz.centroide, null);
  assert.equal(upz.bbox, null);
});

test('seleccionarNivel salta la UPZ no disponible y usa la localidad', () => {
  const barrio = resolverBarrio('Suba Compartir');

  const seleccion = seleccionarNivel(barrio, ['upz', 'localidad']);

  assert.equal(seleccion.nivel, 'localidad');
  assert.equal(seleccion.geometria.nombre, 'Suba');
});

test('un alias desconocido no resuelve', () => {
  assert.equal(resolverBarrio('Otro barrio'), null);
});
