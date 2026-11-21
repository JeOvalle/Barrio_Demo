const express = require('express');
const path = require('path');

const { resolverBarrio } = require('./barrio');
const { obtenerFuente } = require('./sources');
const { consultarModulo } = require('./consultas');

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const ROOT = path.join(__dirname, '..');

app.use(express.json());
app.use('/vendor/leaflet', express.static(path.join(ROOT, 'node_modules', 'leaflet', 'dist')));
app.use(express.static(path.join(ROOT, 'public')));

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

app.get('/api/barrio/resolver', (req, res) => {
  const barrio = resolverBarrio(req.query.q);

  if (!barrio) {
    return res.status(404).json({ error: 'Barrio no encontrado' });
  }

  return res.json(barrio);
});

app.get('/api/consultar', async (req, res) => {
  const barrio = resolverBarrio(req.query.barrio);
  const fuente = obtenerFuente(req.query.modulo);

  if (!barrio) {
    return res.status(400).json({ error: 'Barrio no valido' });
  }

  if (!fuente) {
    return res.status(404).json({ error: 'Modulo no encontrado' });
  }

  const resultado = await consultarModulo(req.query.modulo, barrio);
  return res.json(resultado);
});

app.listen(PORT, () => {
  console.log(`Barrio Suba Compartir escuchando en http://localhost:${PORT}`);
});
