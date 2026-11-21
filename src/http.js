const TIMEOUT_POR_DEFECTO = 5000;

async function fetchJson(url, { timeoutMs = TIMEOUT_POR_DEFECTO, fetchImpl = globalThis.fetch } = {}) {
  const controlador = new AbortController();
  const temporizador = setTimeout(() => controlador.abort(), timeoutMs);

  try {
    const respuesta = await fetchImpl(url, {
      signal: controlador.signal,
      headers: { Accept: 'application/json' },
    });

    if (!respuesta.ok) {
      throw new Error(`Respuesta HTTP ${respuesta.status}`);
    }

    return await respuesta.json();
  } finally {
    clearTimeout(temporizador);
  }
}

module.exports = { fetchJson, TIMEOUT_POR_DEFECTO };
