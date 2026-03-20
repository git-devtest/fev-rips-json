# FEV-RIPS

Generador y validador de archivos **RIPS JSON** para reporte a **SISPRO** según la **Resolución 2275 de 2023**.

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | Angular 17 (Standalone + Angular Material) |
| Backend | Node.js 20 + Express 4 |
| Base de datos | PostgreSQL 15+ |

---

## Estructura del proyecto

```
fev-rips/
├── backend/
│   ├── src/
│   │   ├── app.js                  # Entry point Express
│   │   ├── config/
│   │   │   ├── database.js         # Pool pg + helpers
│   │   │   ├── migrate.js          # Runner de migraciones
│   │   │   └── test-connection.js  # Conexión a Base de Datos
│   │   ├── controllers/
│   │   │   ├── consultas.controller.js
│   │   │   ├── facturas.controller.js
│   │   │   ├── procedimientos.controller.js
│   │   │   ├── rips.controller.js
│   │   │   └── usuarios.controller.js
│   │   ├── middleware/
│   │   ├── models/
│   │   │   ├── consulta.model.js
│   │   │   ├── factura.model.js
│   │   │   ├── procedimiento.model.js
│   │   │   └── usuario.model.js
│   │   ├── routes/
│   │   │   ├── consultas.routes.js
│   │   │   ├── facturas.routes.js
│   │   │   ├── procedimientos.routes.js
│   │   │   ├── rips.routes.js
│   │   │   └── usuarios.routes.js
│   │   ├── seeds/
│   │   │   ├── cie10.seed.js               # Carga CIE-10 desde XLSX
│   │   │   ├── cups.seed.js                # Carga CUPS desde XLSX
│   │   │   ├── geo.seed.js                 # Carga listado de paises
│   │   │   ├── references.seed.js          # Tablas de referencia fijas
│   │   │   └── sispro.references.seed.js   # Tablas de referencias auxiliares
│   │   ├── services/
│   │   │   └── rips.generator.js   # Lógica de generación JSON
│   │   └── utils/
│   ├── data/                   # XLSXs de referencia (ignorados por git)
│   │   └── seeds/
│   │       ├── CIE10.xlsx
│   │       └── CUPS_6digitos.xlsx
│   └── .env.example
├── frontend/                   # Angular 17
├── commitlint.config.js
└── README.md
```

---

## Configuración inicial

### 1. Requisitos previos

```bash
node --version   # >= 20
psql --version   # >= 15
```

### 2. Clonar e instalar dependencias

```bash
git clone <repo>
cd fev-rips

# Instalar herramientas de commits
npm install

# Instalar dependencias del backend
cd backend && npm install
```

### 3. Base de datos

```bash
# Crear la base de datos
createdb fev_rips

# Copiar y editar variables de entorno
cp backend/.env.example backend/.env
nano backend/.env   # configura DB_USER, DB_PASSWORD, etc.
```

### 4. Probar la conexión

```bash
cd backend
node src/config/test-connection.js
```

### 5. Ejecutar migraciones

```bash
npm run backend:migrate
# o directamente:
node backend/src/config/migrate.js
```

### 6. Cargar datos de referencia

```bash
# Tablas fijas (tipos de documento, modalidades, etc.)
node backend/src/seeds/cie10.seed.js
node backend/src/seeds/cups.seed.js
node backend/src/seeds/geo.seed.js
node backend/src/seeds/references.seed.js
node backend/src/seeds/sispro.references.seed.js

# CUPS y CIE-10 desde CSV
# Coloca los archivos en backend/data/seeds
node backend/src/seeds/cups.seed.js  backend/data/seeds/CUPS_6digitos.xlsx
node backend/src/seeds/cie10.seed.js backend/data/seeds/CIE10.xlsx
```

### 7. Iniciar el servidor

```bash
npm run backend
# API disponible en http://localhost:3000
# Health check: http://localhost:3000/health
```

### 8. Endpoints

#### Health
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/health` | Estado de la API y conexión a BD |

#### Facturas
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/v1/facturas` | Listar facturas (paginado, filtros: `estado`, `prestador_id`, `page`, `limit`) |
| GET | `/api/v1/facturas/:id` | Obtener factura por ID |
| POST | `/api/v1/facturas` | Crear factura |
| PATCH | `/api/v1/facturas/:id` | Actualizar factura (solo en estado `borrador`) |
| DELETE | `/api/v1/facturas/:id` | Eliminar factura (solo en estado `borrador`) |

#### Usuarios RIPS
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/v1/facturas/:factura_id/usuarios` | Listar usuarios de una factura |
| GET | `/api/v1/facturas/:factura_id/usuarios/:id` | Obtener usuario por ID |
| POST | `/api/v1/facturas/:factura_id/usuarios` | Crear usuario (máximo 1 por factura) |
| PATCH | `/api/v1/facturas/:factura_id/usuarios/:id` | Actualizar usuario |
| DELETE | `/api/v1/facturas/:factura_id/usuarios/:id` | Eliminar usuario y sus servicios en cascada |

#### Consultas
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/v1/facturas/:factura_id/usuarios/:usuario_id/consultas` | Listar consultas |
| GET | `/api/v1/facturas/:factura_id/usuarios/:usuario_id/consultas/:id` | Obtener consulta |
| POST | `/api/v1/facturas/:factura_id/usuarios/:usuario_id/consultas` | Crear consulta (excluye procedimientos) |
| PATCH | `/api/v1/facturas/:factura_id/usuarios/:usuario_id/consultas/:id` | Actualizar consulta |
| DELETE | `/api/v1/facturas/:factura_id/usuarios/:usuario_id/consultas/:id` | Eliminar consulta |

#### Procedimientos
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/v1/facturas/:factura_id/usuarios/:usuario_id/procedimientos` | Listar procedimientos |
| GET | `/api/v1/facturas/:factura_id/usuarios/:usuario_id/procedimientos/:id` | Obtener procedimiento |
| POST | `/api/v1/facturas/:factura_id/usuarios/:usuario_id/procedimientos` | Crear procedimiento (excluye consultas) |
| PATCH | `/api/v1/facturas/:factura_id/usuarios/:usuario_id/procedimientos/:id` | Actualizar procedimiento |
| DELETE | `/api/v1/facturas/:factura_id/usuarios/:usuario_id/procedimientos/:id` | Eliminar procedimiento |

#### Generador RIPS
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/v1/rips/:factura_id` | Previsualizar JSON RIPS (sin persistir) |
| POST | `/api/v1/rips/:factura_id/generar` | Generar y persistir JSON RIPS en BD |
| GET | `/api/v1/rips/:factura_id/descargar` | Descargar archivo `.json` |

#### Tablas de referencia
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/v1/ref` | Listar todas las tablas disponibles |
| GET | `/api/v1/ref/:tabla` | Obtener registros de una tabla |
| GET | `/api/v1/ref/municipios?departamento=76` | Municipios filtrados por departamento |
| GET | `/api/v1/ref/cups?q=puncion&limit=10` | Búsqueda en CUPS por código o descripción |
| GET | `/api/v1/ref/cie10?q=J06&limit=10` | Búsqueda en CIE-10 por código o descripción |

> Tablas disponibles: `tipos-documento`, `tipos-usuario`, `cod-sexo`, `cod-sexo-biologico`, `zonas-territoriales`, `paises`, `departamentos`, `municipios`, `incapacidad`, `modalidades`, `grupos-servicio`, `vias-ingreso`, `conceptos-recaudo`, `tipos-diagnostico`, `causa-motivo-cons-ext`, `causa-motivo-urg-proc`, `finalidad-tecnologia`, `cod-servicio`, `condicion-egreso`, `tipos-nota`, `tipos-medicamento`, `formas-farmaceuticas`, `unidades-medida`, `unidades-min-dispensa`, `tipos-os`, `cups`, `cie10`

---

## Conventional Commits

Todos los commits deben seguir el estándar [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <descripción en minúsculas>
```

### Tipos permitidos
`feat` · `fix` · `refactor` · `test` · `docs` · `chore` · `ci` · `build` · `perf` · `style` · `revert`

### Scopes permitidos
`config` · `db` · `seed` · `migrate` · `api` · `auth` · `models` · `routes` · `services` · `utils` · `usuarios` · `consultas` · `procedimientos` · `medicamentos` · `otros-servicios` · `urgencias` · `hospitalizacion` · `recien-nacidos` · `facturas` · `rips` · `validator` · `excel` · `ui` · `forms` · `shared` · `docs` · `ci` · `release`

### Ejemplos

```bash
feat(db): add PostgreSQL connection pool with pg
feat(migrate): create all RIPS tables (res. 2275)
feat(seed): load reference tables from constants
feat(seed): load cups and cie10 from xlsx files
feat(api): add health check endpoint with db status
```

### Commits atómicos

Cada commit debe representar **un solo cambio lógico** y poder revertirse sin afectar el resto del proyecto.

---

## Roadmap

- [x] Scaffold del proyecto
- [x] Conexión PostgreSQL
- [x] Migraciones (todas las tablas RIPS)
- [x] Seeds tablas de referencia
- [x] Loader XLSX para CUPS y CIE-10
- [x] API REST módulo facturas
- [x] API REST módulo usuarios RIPS
- [x] API REST módulo consultas
- [x] API REST módulo procedimientos
- [x] Generador de RIPS JSON
- [x] API REST módulo para dropdowns del frontend
- [ ] Validador contra Anexo Técnico SISPRO
- [ ] Importación desde Excel
- [ ] Frontend Angular 17
- [ ] Multi-tenant (multi-prestador)
