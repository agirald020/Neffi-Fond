const { Client } = require('pg');
const c = new Client({ host: '192.168.2.10', port: 5432, database: 'neffitrust', user: 'neffitrust', password: 'Temporal01' });

c.connect().then(async () => {
  // Buscar tablas relacionadas con anexos
  const tables = await c.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND (table_name ILIKE '%anex%' OR table_name ILIKE '%adjunt%' OR table_name ILIKE '%archivo%') ORDER BY table_name"
  );
  console.log('Tablas de anexos:', tables.rows.map(r => r.table_name));
  c.end();
}).catch(e => { console.error(e.message); c.end(); });
