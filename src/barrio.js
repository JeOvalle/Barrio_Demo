const datosBarrio = require('../data/barrio.json');

const NIVELES = ['barrio', 'upz', 'localidad'];

function normalizar(texto) {
  return String(texto ?? '')
    .trim()
    .toLocaleLowerCase('es')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function resolverBarrio(consulta) {
  const texto = normalizar(consulta);

  if (texto !== '' && !datosBarrio.alias.some((alias) => normalizar(alias) === texto)) {
    return null;
  }

  return {
    id: datosBarrio.id,
    nombre: datosBarrio.nombre,
    alias: [...datosBarrio.alias],
    nota: datosBarrio.nota,
    niveles: Object.fromEntries(
      NIVELES.map((nivel) => [nivel, structuredClone(datosBarrio.niveles[nivel])]),
    ),
  };
}

function seleccionarNivel(barrio, nivelesSoportados = NIVELES) {
  for (const nivel of nivelesSoportados) {
    const candidato = barrio.niveles[nivel];
    if (candidato && candidato.disponible) {
      return { nivel, geometria: candidato };
    }
  }
  return { nivel: null, geometria: null };
}

module.exports = { resolverBarrio, seleccionarNivel, normalizar, NIVELES };
