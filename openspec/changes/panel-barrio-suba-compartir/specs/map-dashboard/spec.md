# Spec Delta

## Purpose

Describe la vista dividida entre mapa y panel de resultados, y la interacción mínima que permite activar capas y relacionar marcadores con las filas del panel.

## ADDED Requirements

### Requirement: Vista dividida mapa y panel

La página SHALL mostrar un área de mapa y un panel de módulos en simultáneo, con el barrio encuadrado al abrirla y sin capas de módulos activas.

#### Scenario: Apertura de la página

- **WHEN** un usuario abre la página
- **THEN** se muestran el mapa encuadrado en el barrio y los trece módulos del panel sin capas activas

### Requirement: Capas activadas por consulta

Cuando un módulo devuelve geometría, el mapa SHALL dibujar esa capa y ajustar la vista a su extensión; cuando no devuelve geometría, el mapa SHALL permanecer sin cambios.

#### Scenario: Consulta con geometría

- **WHEN** un usuario consulta un módulo cuyo resultado incluye geometría
- **THEN** el mapa dibuja la capa correspondiente y encuadra su extensión

#### Scenario: Consulta sin geometría

- **WHEN** un usuario consulta un módulo cuyo resultado no incluye geometría
- **THEN** el panel muestra el resultado y el mapa conserva las capas existentes

### Requirement: Resaltado entre marcador y fila

El sistema SHALL permitir seleccionar un elemento del mapa y resaltar la fila correspondiente del panel sin realizar una nueva consulta.

#### Scenario: Selección de un marcador

- **WHEN** un usuario hace clic en un marcador de una capa activa
- **THEN** la fila correspondiente del panel se resalta sin disparar otra consulta

### Requirement: Estados vacíos y de error en el panel

Cada tarjeta SHALL mostrar su estado de forma independiente, incluyendo "sin_datos", "sin_fuente" y "error", sin impedir el uso de los otros módulos.

#### Scenario: Tarjeta sin fuente

- **WHEN** un módulo devuelve el estado "sin_fuente"
- **THEN** su tarjeta muestra el aviso y el mapa no dibuja ninguna capa para ese módulo

#### Scenario: Tarjeta con error

- **WHEN** un módulo devuelve el estado "error"
- **THEN** su tarjeta muestra el error y las demás tarjetas siguen disponibles
