# Spec Delta

## Purpose

Declara de forma centralizada la fuente de cada módulo, su estado de verificación y sus límites, para que la interfaz pueda mostrar información honesta y el backend sepa cuándo no debe consultar un endpoint externo.

## ADDED Requirements

### Requirement: Fuente declarada por módulo

El sistema SHALL mantener una declaración de fuente para cada uno de los trece módulos, indicando endpoint, estado de verificación, cobertura y si requiere llave de acceso.

#### Scenario: Consulta de la declaración de un módulo

- **WHEN** se solicita la configuración de fuente de un módulo
- **THEN** el sistema devuelve su endpoint, estado de verificación, nota de cobertura y necesidad de llave

### Requirement: Fuente no verificada

El sistema SHALL tratar una fuente marcada como "por_validar" como no verificada y SHALL conservar su nota de cobertura en el resultado de la consulta.

#### Scenario: Módulo con fuente por validar

- **WHEN** un módulo usa una fuente marcada como "por_validar"
- **THEN** el resultado incluye la nota de cobertura de esa fuente

### Requirement: Declaración de sin fuente pública

El sistema SHALL permitir declarar que un módulo no tiene fuente pública verificada y SHALL evitar intentos de consulta externa para ese módulo.

#### Scenario: Módulo sin fuente pública

- **WHEN** un módulo está declarado sin fuente pública verificada
- **THEN** el sistema no realiza peticiones a endpoints externos para ese módulo

### Requirement: Llaves de acceso protegidas

El sistema SHALL NO exponer llaves de acceso de fuentes externas en respuestas dirigidas al navegador ni en mensajes de error.

#### Scenario: Fuente que requiere llave sin configurar

- **WHEN** una fuente requiere llave y esta no está configurada
- **THEN** el resultado indica un error de configuración sin revelar la llave ni su valor parcial
