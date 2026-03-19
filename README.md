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
│   │   ├── app.js              # Entry point Express
│   │   ├── config/
│   │   │   ├── database.js     # Pool pg + helpers
│   │   │   ├── migrate.js      # Runner de migraciones
│   │   │   └── test-connection.js
│   │   ├── controllers/
│   │   │   ├── consultas.controller.js
│   │   │   ├── facturas.controller.js
│   │   │   └── usuarios.controller.js
│   │   ├── middleware/
│   │   ├── models/
│   │   │   ├── consulta.model.js
│   │   │   ├── factura.model.js
│   │   │   └── usuario.model.js
│   │   ├── routes/
│   │   │   ├── consultas.routes.js
│   │   │   ├── facturas.routes.js
│   │   │   └── usuarios.routes.js
│   │   ├── seeds/
│   │   │   ├── references.seed.js  # Tablas de referencia fijas
│   │   │   ├── cups.seed.js        # Carga CUPS desde CSV
│   │   │   └── cie10.seed.js       # Carga CIE-10 desde CSV
│   │   ├── services/
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
node backend/src/seeds/references.seed.js

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

```bash
# Crear Factura:    http://localhost:3000/api/v1/facturas
# Crear Usuario:    http://localhost:3000/api/v1/facturas/:factura_id/usuarios
# Crear Consulta:   http://localhost:3000/api/v1/facturas/:factura_id/usuarios/:usuario_id/consultas
```

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
- [ ] API REST módulo procedimientos
- [ ] Generador de RIPS JSON
- [ ] Validador contra Anexo Técnico SISPRO
- [ ] Importación desde Excel
- [ ] Frontend Angular 17
- [ ] Multi-tenant (multi-prestador)
