// src/app.js
require('dotenv').config();
const express = require('express');
const helmet  = require('helmet');
const cors    = require('cors');
const morgan  = require('morgan');
const { testConnection } = require('./config/database');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middlewares globales ──────────────────────
app.use(helmet());
app.use(cors({
  origin: (process.env.ALLOWED_ORIGINS || 'http://localhost:4200').split(','),
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Rutas ─────────────────────────────────────
app.get('/health', async (req, res) => {
  const db = await testConnection();
  res.json({
    status: db.ok ? 'ok' : 'degraded',
    app: 'fev-rips-api',
    version: '1.0.0',
    db,
    timestamp: new Date().toISOString(),
  });
});

app.get('/', (req, res) => {
  res.json({
    message: 'Bienvenido a la API de FEV-RIPS',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      facturas: '/api/v1/facturas',
    },
    timestamp: new Date().toISOString()
  });
});

// ── Routers de la API ─────────────────────────────────────────────────────
app.use('/api/v1/facturas', require('./routes/facturas.routes'));
app.use('/api/v1/facturas/:factura_id/usuarios', require('./routes/usuarios.routes'));
app.use('/api/v1/facturas/:factura_id/usuarios/:usuario_id/consultas', require('./routes/consultas.routes'));
app.use('/api/v1/facturas/:factura_id/usuarios/:usuario_id/procedimientos', require('./routes/procedimientos.routes'));
app.use('/api/v1/rips', require('./routes/rips.routes'));

// TODO: montar routers de cada módulo aquí
// app.use('/api/v1/usuarios', require('./routes/usuarios.routes'));
// app.use('/api/v1/consultas',     require('./routes/consultas.routes'));
// app.use('/api/v1/procedimientos',require('./routes/procedimientos.routes'));
// app.use('/api/v1/rips',          require('./routes/rips.routes'));
// app.use('/api/v1/validator',     require('./routes/validator.routes'));
// app.use('/api/v1/ref',           require('./routes/referencias.routes'));

// ── 404 handler ───────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada', path: req.originalUrl });
});

// ── Error handler global ──────────────────────
app.use((err, req, res, next) => {
  console.error('[ERROR]', err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    error: err.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ── Inicio ────────────────────────────────────
app.listen(PORT, async () => {
  console.log(`\n🚀 FEV-RIPS API corriendo en http://localhost:${PORT}`);
  console.log(`   Entorno: ${process.env.NODE_ENV || 'development'}`);

  const db = await testConnection();
  if (db.ok) {
    console.log(`   BD: ✅  ${db.database} @ ${db.host} (${db.version})`);
  } else {
    console.warn(`   BD: ❌  ${db.error}`);
  }
  console.log('');
});

module.exports = app; // para tests
