// Test CORS against Vercel deployment
const https = require('https');

const backendUrl = 'https://nidhi-backend-hw8pzw3wf-vignesh-kumars-projects-04f1e33b.vercel.app';
const frontendOrigin = 'https://nidhi-web2.vercel.app';

console.log('Testing CORS preflight (OPTIONS)...\n');

const options = {
  hostname: 'nidhi-backend-hw8pzw3wf-vignesh-kumars-projects-04f1e33b.vercel.app',
  path: '/api/auth/login',
  method: 'OPTIONS',
  headers: {
    'Origin': frontendOrigin,
    'Access-Control-Request-Method': 'POST',
    'Access-Control-Request-Headers': 'Content-Type, Authorization'
  }
};

const req = https.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log('\nCORS Headers:');
  console.log(`Access-Control-Allow-Origin: ${res.headers['access-control-allow-origin'] || 'NOT SET'}`);
  console.log(`Access-Control-Allow-Methods: ${res.headers['access-control-allow-methods'] || 'NOT SET'}`);
  console.log(`Access-Control-Allow-Headers: ${res.headers['access-control-allow-headers'] || 'NOT SET'}`);
  console.log(`Access-Control-Allow-Credentials: ${res.headers['access-control-allow-credentials'] || 'NOT SET'}`);
  
  console.log('\nAll Headers:');
  Object.keys(res.headers).forEach(key => {
    if (key.toLowerCase().includes('access-control')) {
      console.log(`${key}: ${res.headers[key]}`);
    }
  });
  
  res.on('data', (d) => {
    process.stdout.write(d);
  });
  
  res.on('end', () => {
    console.log('\n\n✅ CORS Preflight test complete');
  });
});

req.on('error', (e) => {
  console.error(`❌ Error: ${e.message}`);
});

req.end();

