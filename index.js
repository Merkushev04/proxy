const http = require('http');
const httpProxy = require('http-proxy');

const LISTENER_PORT = 80;
const RESUME_HOST_NAMES = ['resume.busprix.com', 'cm.busprix.com', 'me.busprix.com'];
const SHOP_HOST_NAMES = ['busprix.com ','www.busprix.com' ,'shop.busprix.com'];
const APPLEID_HOST_NAMES = ['appleid.busprix.com'];
const APPLEID_LOCAL_ADDR = 'http://localhost:8002';
const RESUME_LOCAL_ADDR = 'http://localhost:8001';
const SHOP_LOCAL_ADDR = 'http://localhost:8000';

const proxy = httpProxy.createProxyServer({});

proxy.on('error', (err, req, res) => {
  // TODO place here error page
  res.writeHead(500, { 'Content-Type': 'text/plain' });
  res.end('Hahh, just resting!');
});

proxy.on('proxyReq', (proxyReq, req) => {
  if (req.body && req.complete) {
    const bodyData = JSON.stringify(req.body);
    proxyReq.setHeader('Content-Type', 'application/json');
    proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
    proxyReq.write(bodyData);
  }
});

const server = http.createServer((req, res) => {
    const { host, url } = req.headers;
    if (RESUME_HOST_NAMES.includes(host)) { return proxy.web(req, res, { target: RESUME_LOCAL_ADDR }); } 
    if (SHOP_HOST_NAMES.includes(host)) { return proxy.web(req, res, { target: SHOP_LOCAL_ADDR }); }
    if (APPLEID_HOST_NAMES.includes(host)) { return proxy.web(req, res, {target: APPLEID_LOCAL_ADDR}); }
   
    res.writeHead(301, { Location: `https://${SHOP_HOST_NAMES[0]}/${url || ''}` });
    res.end();
});

server.listen(LISTENER_PORT, () => console.log('Proxy running on: ' + LISTENER_PORT));
