# Spec Delta

## Purpose

Permite que todos los módulos trabajen sobre un mismo lugar, resolviendo los alias del barrio y exponiendo su jerarquía geográfica y sus geometrías.

## ADDED Requirements

### Requirement: Alias canónico del barrio

El sistema SHALL resolver los nombres "Suba Compartir" y "Sabana de Tibabuyes Norte" a un único identificador canónico de barrio, de modo que las consultas no dependan del texto usado por cada fuente.

#### Scenario: Consulta con el alias principal

- **WHEN** un usuario o módulo solicita el barrio "Suba Compartir"
- **THEN** el sistema devuelve el identificador canónico del barrio junto con sus alias registrados

#### Scenario: Consulta con el alias alterno

- **WHEN** un usuario o módulo solicita el barrio "Sabana de Tibabuyes Norte"
- **THEN** el sistema devuelve el mismo identificador canónico que para "Suba Compartir"

### Requirement: Jerarquía geográfica del barrio

El sistema SHALL exponer para el barrio resuelto los niveles barrio, UPZ y localidad, con sus identificadores y nombres, para que cada módulo pueda elegir el nivel más estrecho que su fuente soporte.

#### Scenario: Jerarquía disponible

- **WHEN** se resuelve correctamente el barrio
- **THEN** el sistema devuelve los niveles barrio, UPZ y localidad "Suba" con sus identificadores y nombres

### Requirement: Geometrías para encuadre y filtrado

El sistema SHALL proporcionar polígono, centroide y caja de límites para cada nivel geográfico disponible, de modo que el mapa pueda encuadrar el área y los módulos puedan filtrar por ubicación.

#### Scenario: Geometría del barrio disponible

- **WHEN** se solicita la geometría del nivel barrio
- **THEN** el sistema devuelve un polígono, un centroide y una caja de límites válidos

#### Scenario: Nivel sin geometría disponible

- **WHEN** un nivel de la jerarquía no tiene polígono disponible
- **THEN** el sistema lo marca como no disponible sin generar una geometría inventada
