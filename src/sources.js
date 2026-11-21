const MODULOS = {
  'estado-calles': {
    titulo: 'Estado de calles',
    categoria: 'condicional',
    endpoint: null,
    estado: 'por_validar',
    requiereLlave: false,
    cobertura: 'Reportes de obras o bacheo; no representa un estado en tiempo real',
    nota: 'Sin endpoint verificado. No se consulta hasta validar una fuente publica.',
    nivelesSoportados: ['barrio', 'localidad'],
  },
  librerias: {
    titulo: 'Librerias',
    categoria: 'entidad',
    endpoint: null,
    estado: 'por_validar',
    requiereLlave: false,
    cobertura: 'OpenStreetMap / Biblored; cobertura parcial',
    nota: 'Fuente candidata no verificada.',
    nivelesSoportados: ['barrio'],
  },
  robos: {
    titulo: 'Robos',
    categoria: 'indicador',
    endpoint: null,
    estado: 'por_validar',
    requiereLlave: false,
    cobertura: 'Datos agregados por barrio o localidad; sin ubicaciones individuales',
    nota: 'Fuente candidata no verificada.',
    nivelesSoportados: ['barrio', 'localidad'],
  },
  'datos-catastrales': {
    titulo: 'Datos catastrales',
    categoria: 'indicador',
    endpoint: null,
    estado: 'por_validar',
    requiereLlave: false,
    cobertura: 'Indicadores agregados del barrio; sin fichas por predio',
    nota: 'Fuente candidata no verificada.',
    nivelesSoportados: ['barrio'],
  },
  'centros-educativos': {
    titulo: 'Centros educativos',
    categoria: 'entidad',
    endpoint: null,
    estado: 'por_validar',
    requiereLlave: false,
    cobertura: 'OpenStreetMap / Secretaria de Educacion; cobertura parcial',
    nota: 'Fuente candidata no verificada.',
    nivelesSoportados: ['barrio'],
  },
  camaras: {
    titulo: 'Camaras de seguridad',
    categoria: 'sin_fuente',
    endpoint: null,
    estado: 'sin_fuente',
    requiereLlave: false,
    cobertura: 'No se publican ubicaciones de camaras por razones de seguridad',
    nota: 'Sin fuente publica verificada. No se realizan consultas externas.',
    nivelesSoportados: [],
  },
  'zonas-verdes': {
    titulo: 'Zonas verdes',
    categoria: 'entidad',
    endpoint: null,
    estado: 'por_validar',
    requiereLlave: false,
    cobertura: 'OpenStreetMap / IDEGIS; areas aproximadas',
    nota: 'Fuente candidata no verificada.',
    nivelesSoportados: ['barrio'],
  },
  'escenarios-deportivos': {
    titulo: 'Escenarios deportivos',
    categoria: 'entidad',
    endpoint: null,
    estado: 'por_validar',
    requiereLlave: false,
    cobertura: 'IDRD / OpenStreetMap; cobertura parcial',
    nota: 'Fuente candidata no verificada.',
    nivelesSoportados: ['barrio'],
  },
  veterinarias: {
    titulo: 'Veterinarias',
    categoria: 'entidad',
    endpoint: null,
    estado: 'por_validar',
    requiereLlave: false,
    cobertura: 'OpenStreetMap; cobertura parcial',
    nota: 'Fuente candidata no verificada.',
    nivelesSoportados: ['barrio'],
  },
  restaurantes: {
    titulo: 'Restaurantes',
    categoria: 'entidad',
    endpoint: null,
    estado: 'por_validar',
    requiereLlave: false,
    cobertura: 'OpenStreetMap; cobertura parcial',
    nota: 'Fuente candidata no verificada.',
    nivelesSoportados: ['barrio'],
  },
  cai: {
    titulo: 'Centros de atencion de policia (CAI)',
    categoria: 'entidad',
    endpoint: null,
    estado: 'por_validar',
    requiereLlave: false,
    cobertura: 'OpenStreetMap / Policia; verificar vigencia de cada CAI',
    nota: 'Fuente candidata no verificada.',
    nivelesSoportados: ['barrio', 'localidad'],
  },
  'datos-localidad': {
    titulo: 'Datos de la localidad',
    categoria: 'indicador',
    endpoint: null,
    estado: 'por_validar',
    requiereLlave: false,
    cobertura: 'Datos censales de Suba; no en tiempo real',
    nota: 'Fuente candidata no verificada.',
    nivelesSoportados: ['localidad'],
  },
  'paradas-transmilenio': {
    titulo: 'Paradas de TransMilenio',
    categoria: 'entidad',
    endpoint: null,
    estado: 'por_validar',
    requiereLlave: false,
    cobertura: 'GTFS de TransMilenio; puede estar desactualizado',
    nota: 'Fuente candidata no verificada.',
    nivelesSoportados: ['barrio', 'localidad'],
  },
};

function obtenerFuente(id) {
  return MODULOS[id] ?? null;
}

function listarFuentes() {
  return Object.entries(MODULOS).map(([id, fuente]) => ({ id, ...fuente }));
}

function esConsultable(fuente) {
  return Boolean(fuente && fuente.estado !== 'sin_fuente' && fuente.endpoint);
}

module.exports = { MODULOS, obtenerFuente, listarFuentes, esConsultable };
