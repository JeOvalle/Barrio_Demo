# Spec Delta

## Purpose

Define el contrato observable de los trece módulos de consulta, incluyendo estados, granularidad, avisos y la forma de los datos entregados al panel y al mapa.

## ADDED Requirements

### Requirement: Contrato único de resultado

Cada módulo SHALL devolver un resultado con estado, fuente, fecha de actualización, aviso, filas de datos y geometría opcional, con independencia de la fuente utilizada.

#### Scenario: Módulo con datos y capa

- **WHEN** un módulo obtiene datos de su fuente
- **THEN** el resultado incluye filas con identificador y etiqueta, además de una geometría para el mapa

#### Scenario: Módulo sin geometría

- **WHEN** un módulo produce datos que no se representan en el mapa
- **THEN** el resultado indica ausencia de geometría sin invalidar las filas del panel

### Requirement: Estados de consulta

El estado del resultado SHALL ser uno de "ok", "sin_datos", "sin_fuente" o "error", y cada estado SHALL ser representable en la interfaz sin interrumpir la carga de los demás módulos.

#### Scenario: Sin datos disponibles

- **WHEN** la fuente responde correctamente pero no hay registros para el barrio
- **THEN** el resultado tiene estado "sin_datos" y el panel lo muestra como vacío

#### Scenario: Sin fuente pública

- **WHEN** el módulo no tiene fuente pública verificada
- **THEN** el resultado tiene estado "sin_fuente" y muestra el aviso correspondiente

#### Scenario: Fallo de la fuente

- **WHEN** la fuente externa falla o agota el tiempo de espera
- **THEN** el resultado tiene estado "error" y no afecta a otros módulos

### Requirement: Degradación de granularidad con aviso

Cuando una fuente solo dispone de datos de la UPZ o de la localidad, el sistema SHALL devolver el dato con el nivel geográfico realmente usado y un aviso visible, en lugar de presentarlo como dato del barrio.

#### Scenario: Fuente disponible solo por localidad

- **WHEN** un módulo solo obtiene datos agregados de la localidad Suba
- **THEN** el resultado declara la granularidad "localidad" e incluye un aviso que lo indica

### Requirement: Información sensible agregada

El sistema SHALL NO mostrar ubicaciones individuales de robos ni fichas catastrales por predio, y SHALL mantener el módulo de cámaras de seguridad en estado "sin_fuente".

#### Scenario: Robos agregados

- **WHEN** se consulta el módulo de robos con una fuente válida
- **THEN** el resultado contiene totales o tasas del área seleccionada y no puntos de eventos individuales

#### Scenario: Cámaras de seguridad

- **WHEN** se consulta el módulo de cámaras de seguridad
- **THEN** el resultado tiene estado "sin_fuente" y no incluye ubicaciones de cámaras

### Requirement: Operaciones de solo lectura

Los módulos SHALL ejecutar únicamente consultas y NO SHALL crear, modificar ni eliminar información en fuentes externas ni en la aplicación.

#### Scenario: Consulta de un módulo

- **WHEN** un usuario pulsa "Consultar" en cualquier módulo
- **THEN** el sistema solo lee datos y no produce cambios persistentes
