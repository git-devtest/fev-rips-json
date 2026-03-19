require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { testConnection, pool } = require('./database');

(async () => {
  console.log('\n🔌  Probando conexión a PostgreSQL...');
  console.log(`   Host:     ${process.env.DB_HOST}:${process.env.DB_PORT}`);
  console.log(`   Base:     ${process.env.DB_NAME}`);
  console.log(`   Usuario:  ${process.env.DB_USER}\n`);

  const result = await testConnection();

  if (result.ok) {
    console.log('✅  Conexión exitosa');
    console.log(`   Versión:  ${result.version}`);
    console.log(`   Base:     ${result.database}`);
    console.log(`   Host:     ${result.host}\n`);
  } else {
    console.error('❌  Conexión fallida');
    console.error(`   Error: ${result.error}\n`);
    console.error('💡  Verifica que:');
    console.error('   - PostgreSQL esté corriendo: docker compose ps');
    console.error('   - El archivo .env esté configurado\n');
    process.exit(1);
  }

  await pool.end();
})();