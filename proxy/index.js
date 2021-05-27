const http = require('http');
const { performance } = require('perf_hooks');
const fetch = require('node-fetch');

const baseUrl = 'https://ubl.webattach.nl/fcgi-bin/iipsrv.fcgi';
const defRegion = '0,0,1,1';
const server = http.createServer(async (req, res) => {
  const startTime = performance.now();
  const logMsg = [new Date().toISOString()];
  const resHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET',
  };
  const { pathname } = new URL(req.url, 'http://' + req.headers.host);
  const [, name, region] = pathname.split('/');

  logMsg.push(pathname);

  if (!name) {
    res.writeHead(400, { ...resHeaders, 'Content-Type': 'text/plain' });
    res.end('Bad Request');

    logMsg.push(400);
  } else {
    const fetchUrl = `${baseUrl}?FIF=/home/maps/tif/${name}.tif&rgn=${region || defRegion}&cvt=jpeg`;
    const fetchRes = await fetch(fetchUrl);

    if (fetchRes.ok) {
      const imgBuffer = await fetchRes.buffer();

      res.writeHead(fetchRes.status, { ...resHeaders, 'Content-Type': 'image/jpeg' });
      res.end(imgBuffer, 'binary');
    } else {
      const plainText = await fetchRes.text();

      res.writeHead(fetchRes.status, { ...resHeaders, 'Content-Type': 'text/plain' });
      res.end(plainText || 'Error');
    }

    logMsg.push(fetchRes.status);
  }

  logMsg.push(`${Math.ceil(performance.now() - startTime)}ms`);

  console.log(...logMsg);
});

server.listen(process.env.PORT || 8000);
