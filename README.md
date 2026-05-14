# Sistema de Monitoreo de Infraestructura TI  
## Hospital Universitario San Rafael de Tunja

## 1. Descripción general del proyecto

El proyecto consiste en el diseño e implementación de un sistema basado en microservicios para el monitoreo de infraestructura TI del Hospital Universitario San Rafael de Tunja. Su objetivo principal es permitir la gestión y supervisión de recursos tecnológicos críticos, como servidores, equipos de red, dispositivos médicos conectados, métricas de funcionamiento, alertas, ubicaciones y usuarios responsables.

La arquitectura está organizada por microservicios independientes, donde cada servicio tiene una responsabilidad específica dentro del sistema. Esto permite que cada componente pueda desarrollarse, probarse, desplegarse y mantenerse de forma separada, facilitando la escalabilidad y el mantenimiento del proyecto.

---

## 2. Arquitectura general del sistema

El sistema está diseñado bajo una arquitectura de microservicios, donde cada microservicio cumple una responsabilidad específica dentro del monitoreo de infraestructura TI del Hospital Universitario San Rafael de Tunja.

Cada servicio funciona de manera independiente, tiene sus propias rutas, controladores, modelos y conexión con la base de datos. La comunicación entre servicios se realiza mediante peticiones HTTP y referencias lógicas por medio de identificadores como `user_id`, `device_id`, `location_id`, `metric_id` o `alert_id`.

---

## Diagrama general de arquitectura

## Diagrama general de arquitectura

```txt
                         Cliente / Postman / Frontend
                                    │
                                    ▼
                           Peticiones HTTP REST
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        │                           │                           │
        ▼                           ▼                           ▼

┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│  users_service  │       │ devices_service │       │ locations_service│
│                 │       │                 │       │                 │
│ - Usuarios      │       │ - Dispositivos  │       │ - Ubicaciones   │
│ - Roles         │       │ - Tipos disp.   │       │ - Áreas         │
└────────┬────────┘       └────────┬────────┘       └────────┬────────┘
         │                         │                         │
         ▼                         ▼                         ▼
   Base de datos             Base de datos             Base de datos
   users / roles             devices / types           locations


┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│ metrics_service │       │ alerts_service  │       │ reports_service │
│                 │       │                 │       │                 │
│ - Métricas      │       │ - Alertas       │       │ - Reportes      │
│ - Tipos métrica │       │ - Severidades   │       │ - Consultas     │
└────────┬────────┘       └────────┬────────┘       └────────┬────────┘
         │                         │                         │
         ▼                         ▼                         ▼
   Base de datos             Base de datos             Base de datos
   metrics/types             alerts/severities         reports
```

## Arquitectura de los microservicios

```txt
microservicio/
│
├── routes/
│   └── Define los endpoints HTTP
│
├── controllers/
│   └── Contiene la lógica de negocio
│
├── models/
│   └── Define las tablas o entidades de base de datos
│
├── scripts/
│   └── Contiene archivos auxiliares como seeders
│
├── app.py
│   └── Inicializa Flask, registra rutas y levanta el servidor
│
├── config.py
│   └── Contiene la configuración del servicio
│
└── extensions.py
    └── Centraliza extensiones como SQLAlchemy
```
## Capturas funcionamiento de los microservicios

### Users 

**Servidor users

![alt text](docs/img/Server-Users.png)

**Creación de Usuarios

![alt text](docs/img/POST-Users.png)

**Obtener usuarios

![alt text](docs/img/GET-Users.png)

### Devices

**Servidor devices

![alt text](docs/img/Server-Devices.png)

**Crear dispositivo

![alt text](docs/img/POST-Devices.png)

**Obtener dispositivos

![alt text](docs/img/GET-Devices.png)

### Locations

**Servidor locations ejecutandose

![alt text](docs/img/Server-Locations.png)

**Creación de una ubicación

![alt text](docs/img/POST-Locations.png)

**Obtener todas las ubicaciones

![alt text](docs/img/GET-Locations.png)

### Metrics

**Servidor Metrics

![alt text](docs/img/Server-Metrics.png)

**Creación de métrica

![alt text](docs/img/POST-Metric.png)

**Obtener métricas

![alt text](docs/img/GET-Metrics.png)

### Alerts

**Servidor alertas ejecutandose

![alt text](docs/img/Server-Alerts.png)

**Obtener alertas

![alt text](docs/img/GET-Alerts.png)

### Reports

**Servidor reportes ejecutandose

![alt text](docs/img/Server-Reports.png.png)

**Obtener reportes

![alt text](docs/img/GET-Reports.png)