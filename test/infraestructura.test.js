const test = require('node:test');
const assert = require('node:assert/strict');

const { crearCache, TTL_POR_DEFECTO } = require('../src/cache');
const { fetchJson } = require('../src/http');

test('el TTL por defecto es de cinco minutos', () => {
  assert.equal(TTL_POR_DEFECTO, 300000);
});

test('una segunda consulta identica no vuelve a llamar a la fuente', async () => {
  const cache = crearCache();
  let llamadas = 0;

  const productor = async () => {
    llamadas += 1;
    return { resultado: llamadas };
  };

  const primero = await cache.obtener('modulo:barrio', productor);
  const segundo = await cache.obtener('modulo:barrio', productor);

  assert.equal(llamadas, 1);
  assert.deepEqual(segundo, primero);
});

test('la cache expira despues del TTL', async () => {
  const cache = crearCache(10);
  let llamadas = 0;
  const productor = async () => ({ llamadas: ++llamadas });

  await cache.obtener('clave', productor);
  await new Promise((resolver) => setTimeout(resolver, 25));
  await cache.obtener('clave', productor);

  assert.equal(llamadas, 2);
});

test('fetchJson aborta una peticion que supera el timeout', async () => {
  const fetchQueCuelga = (url, opciones) => new Promise((resolve, reject) => {
    opciones.signal.addEventListener('abort', () => reject(new Error('abortada')));
  });

  await assert.rejects(
    fetchJson('http://ejemplo.invalid', { timeoutMs: 10, fetchImpl: fetchQueCuelga }),
    /abortada/,
  );
});
