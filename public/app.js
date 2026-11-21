const BARRIO = 'Suba Compartir';

const MODULOS = [
  { id: 'estado-calles', titulo: 'Estado de calles' },
  { id: 'librerias', titulo: 'Librerias' },
  { id: 'robos', titulo: 'Robos' },
  { id: 'datos-catastrales', titulo: 'Datos catastrales' },
  { id: 'centros-educativos', titulo: 'Centros educativos' },
  { id: 'camaras', titulo: 'Camaras de seguridad' },
  { id: 'zonas-verdes', titulo: 'Zonas verdes' },
  { id: 'escenarios-deportivos', titulo: 'Escenarios deportivos' },
  { id: 'veterinarias', titulo: 'Veterinarias' },
  { id: 'restaurantes', titulo: 'Restaurantes' },
  { id: 'cai', titulo: 'Centros de atencion de policia (CAI)' },
  { id: 'datos-localidad', titulo: 'Datos de la localidad' },
  { id: 'paradas-transmilenio', titulo: 'Paradas de TransMilenio' },
];

const capasPorModulo = new Map();
let mapa;

function elemento(etiqueta, clase, texto) {
  const nodo = document.createElement(etiqueta);
  if (clase) nodo.className = clase;
  if (texto !== undefined && texto !== null) nodo.textContent = String(texto);
  return nodo;
}

function crearMapa() {
  mapa = L.map('mapa').setView([4.745, -74.0875], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contribuyentes',
  }).addTo(mapa);
}

async function cargarBarrio() {
  const respuesta = await fetch(`/api/barrio/resolver?q=${encodeURIComponent(BARRIO)}`);
  if (!respuesta.ok) throw new Error('No fue posible resolver el barrio');

  const barrio = await respuesta.json();
  document.getElementById('alias-barrio').textContent = `Alias: ${barrio.alias.join(' · ')}`;

  const nivel = barrio.niveles.barrio.disponible ? barrio.niveles.barrio : barrio.niveles.localidad;
  if (nivel.poligono) {
    const capa = L.geoJSON(nivel.poligono, {
      style: { color: '#0b7285', weight: 2, fillOpacity: 0.06 },
    }).addTo(mapa);
    mapa.fitBounds(capa.getBounds(), { padding: [20, 20] });
  }

  return barrio;
}

function renderizarTarjetas() {
  const contenedor = document.getElementById('tarjetas');

  MODULOS.forEach((modulo) => {
    const tarjeta = elemento('article', 'tarjeta');
    const cabecera = elemento('div', 'tarjeta__titulo');
    const titulo = elemento('h2', null, modulo.titulo);
    const boton = elemento('button', 'boton', 'Consultar');
    const resultado = elemento('div', 'resultado');

    boton.type = 'button';
    cabecera.append(titulo, boton);
    tarjeta.append(cabecera, resultado);
    contenedor.append(tarjeta);

    boton.addEventListener('click', () => consultar(modulo, boton, resultado));
  });
}

function badge(estado) {
  return elemento('span', `estado estado--${estado}`, estado);
}

async function consultar(modulo, boton, contenedor) {
  boton.disabled = true;
  contenedor.replaceChildren(elemento('p', 'aviso', 'Consultando...'));

  try {
    const respuesta = await fetch(
      `/api/consultar?modulo=${encodeURIComponent(modulo.id)}&barrio=${encodeURIComponent(BARRIO)}`,
    );
    if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
    mostrarResultado(modulo.id, await respuesta.json(), contenedor);
  } catch (error) {
    contenedor.replaceChildren();
    contenedor.append(badge('error'), elemento('p', 'aviso', 'No fue posible consultar. Intenta de nuevo.'));
  } finally {
    boton.disabled = false;
  }
}

function valorDeFila(fila) {
  if (fila.valor !== undefined && fila.valor !== null) {
    const partes = [String(fila.valor)];
    if (fila.unidad) partes.push(String(fila.unidad));
    if (fila.periodo) partes.push(`(${fila.periodo})`);
    return partes.join(' ');
  }
  return Object.entries(fila)
    .filter(([clave]) => !['id', 'etiqueta'].includes(clave))
    .map(([, valor]) => (valor === null ? '' : String(valor)))
    .filter(Boolean)
    .join(' · ');
}

function resaltarFila(id) {
  document.querySelectorAll('.fila--resaltada').forEach((fila) => fila.classList.remove('fila--resaltada'));

  for (const fila of document.querySelectorAll('[data-fila-id]')) {
    if (fila.dataset.filaId === String(id)) {
      fila.classList.add('fila--resaltada');
      fila.scrollIntoView({ block: 'nearest' });
      return;
    }
  }
}

function dibujarCapa(moduloId, geojson) {
  const anterior = capasPorModulo.get(moduloId);
  if (anterior) {
    mapa.removeLayer(anterior);
    capasPorModulo.delete(moduloId);
  }

  if (!geojson || !Array.isArray(geojson.features) || geojson.features.length === 0) {
    return;
  }

  const capa = L.geoJSON(geojson, {
    pointToLayer: (feature, latlng) => L.marker(latlng),
    onEachFeature: (feature, layer) => {
      const idFila = feature.properties?.id ?? feature.id;
      if (idFila !== undefined) layer.on('click', () => resaltarFila(idFila));
      if (feature.properties?.etiqueta) layer.bindPopup(String(feature.properties.etiqueta));
    },
  }).addTo(mapa);

  capasPorModulo.set(moduloId, capa);
  mapa.fitBounds(capa.getBounds(), { padding: [20, 20], maxZoom: 16 });
}

function mostrarResultado(moduloId, resultado, contenedor) {
  contenedor.replaceChildren();
  contenedor.append(badge(resultado.estado));

  if (resultado.aviso) contenedor.append(elemento('p', 'aviso', resultado.aviso));

  if (Array.isArray(resultado.datos) && resultado.datos.length > 0) {
    const tabla = elemento('table', 'filas');
    resultado.datos.forEach((fila) => {
      const filaNodo = elemento('tr');
      filaNodo.dataset.filaId = fila.id;
      filaNodo.append(elemento('td', null, fila.etiqueta), elemento('td', null, valorDeFila(fila)));
      tabla.append(filaNodo);
    });
    contenedor.append(tabla);
  }

  dibujarCapa(moduloId, resultado.geojson);
}

async function iniciar() {
  crearMapa();
  await cargarBarrio();
  renderizarTarjetas();
}

iniciar().catch((error) => {
  document.getElementById('alias-barrio').textContent = 'No fue posible cargar el barrio';
  console.error(error);
});
