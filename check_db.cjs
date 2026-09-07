const { Client } = require('pg');
const c = new Client({ host: '192.168.2.10', port: 5432, database: 'neffitrust', user: 'neffitrust', password: 'Temporal01' });

c.connect().then(async () => {
  const cols = await c.query(
    "SELECT column_name FROM information_schema.columns WHERE table_name='nt_procesos' ORDER BY ordinal_position"
  );
  console.log('Columnas nt_procesos:', cols.rows.map(r => r.column_name).join(', '));

  const fly = await c.query(
    "SELECT version, description, success, checksum FROM flyway_schema_history ORDER BY installed_rank"
  );
  console.log('\nFlyway history:');
  fly.rows.forEach(r => console.log(` [${r.success ? 'OK' : 'FAIL'}] V${r.version} — ${r.description}`));
  c.end();
}).catch(e => { console.error('ERROR:', e.message); c.end(); });
