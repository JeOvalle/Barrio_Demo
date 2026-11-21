require('dotenv').config();

function obtenerLlave(nombre) {
  const valor = process.env[nombre];
  return typeof valor === 'string' && valor.trim() !== '' ? valor : null;
}

function estaConfigurada(nombre) {
  return obtenerLlave(nombre) !== null;
}

module.exports = { obtenerLlave, estaConfigurada };
