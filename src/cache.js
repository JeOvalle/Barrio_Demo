const TTL_POR_DEFECTO = 5 * 60 * 1000;

function crearCache(ttlMs = TTL_POR_DEFECTO) {
  const almacen = new Map();

  return {
    async obtener(clave, productor) {
      const ahora = Date.now();
      const entrada = almacen.get(clave);

      if (entrada && ahora - entrada.fecha < ttlMs) {
        return entrada.valor;
      }

      const valor = await productor();
      almacen.set(clave, { fecha: Date.now(), valor });
      return valor;
    },
    limpiar() {
      almacen.clear();
    },
  };
}

module.exports = { crearCache, TTL_POR_DEFECTO };
