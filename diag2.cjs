const http = require('http');

function get(path, label) {
  return new Promise(resolve => {
    const req = http.request({
      hostname: '192.168.2.10', port: 8092,
      path: '/admonfiducia/api/v1' + path, method: 'GET',
      headers: { 'X-Gravitee-Api-Key': '5f27c830-aad5-43c7-9f6f-ac2f59ad7572' }
    }, res => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          console.log(`\n[${label}] Status: ${res.statusCode}`);
          console.log('  success:', json.success);
          if (json.data !== undefined)
            console.log('  data type:', Array.isArray(json.data) ? `Array[${json.data.length}]` : typeof json.data);
          if (json.data && Array.isArray(json.data) && json.data[0])
            console.log('  primer elemento:', JSON.stringify(json.data[0]));
          if (!json.success) console.log('  message:', json.message);
        } catch(e) { console.log(`[${label}] raw:`, body.slice(0,200)); }
        resolve();
      });
    });
    req.on('error', e => { console.log(`[${label}] ERROR: ${e.message}`); resolve(); });
    req.setTimeout(5000, () => { req.destroy(); resolve(); });
    req.end();
  });
}

async function run() {
  // Test minúsculas vs mayúsculas en AdmonFiducia
  await get('/tipos-responsables/usuario/ytafur/fideicomiso/120768', 'MINÚSCULAS ytafur');
  await get('/tipos-responsables/usuario/YTAFUR/fideicomiso/120768', 'MAYÚSCULAS YTAFUR');

  // Verificar versión del backend NeffiFond (si tiene el endpoint de estado)
  const req2 = http.request({
    hostname: '192.168.2.10', port: 8093,
    path: '/actuator/health', method: 'GET'
  }, res => {
    let body = '';
    res.on('data', d => body += d);
    res.on('end', () => console.log('\n[NeffiFond Health] Status:', res.statusCode, body.slice(0,100)));
  });
  req2.on('error', e => console.log('[NeffiFond Health] ERROR:', e.message));
  req2.setTimeout(3000, () => req2.destroy());
  req2.end();
}
run();
