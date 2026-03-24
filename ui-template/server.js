const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const ROOT = __dirname;

const MIME = {
  '.html': 'text/html',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
};

function scanDir(dir) {
  try {
    return fs.readdirSync(path.join(ROOT, dir)).filter(f => f.endsWith('.js'));
  } catch {
    return [];
  }
}

function camelToSpaced(str) {
  return str.replace(/([a-z])([A-Z])/g, '$1 $2');
}

function extractDesc(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const match = content.match(/class="sc-desc">([^<]*)/);
    return match ? match[1] : '';
  } catch {
    return '';
  }
}

function buildRegistry() {
  const components = scanDir('Components')
    .filter(f => f.endsWith('.showcase.js'))
    .map(f => {
      const id = f.replace('.showcase.js', '');
      return {
        id,
        name: camelToSpaced(id),
        desc: extractDesc(path.join(ROOT, 'Components', f)),
        module: 'Components/' + f,
      };
    });

  const screens = scanDir('Screens').map(f => {
    const id = f.replace('.js', '');
    return { id, name: camelToSpaced(id), desc: '', module: 'Screens/' + f, fullscreen: true };
  });

  const flows = scanDir('Flows').map(f => {
    const id = f.replace('.js', '');
    return { id, name: camelToSpaced(id), desc: '', module: 'Flows/' + f, fullscreen: true };
  });

  const animations = scanDir('Animations').map(f => {
    const id = f.replace('.js', '');
    return { id, name: camelToSpaced(id), desc: '', module: 'Animations/' + f, fullscreen: true };
  });

  const references = scanDir('References')
    .filter(f => f.endsWith('.showcase.js'))
    .map(f => {
      const id = f.replace('.showcase.js', '');
      return {
        id,
        name: camelToSpaced(id),
        desc: extractDesc(path.join(ROOT, 'References', f)),
        module: 'References/' + f,
      };
    });

  return { references, components, screens, flows, animations };
}

const server = http.createServer((req, res) => {
  // Dynamic registry endpoint
  if (req.url === '/registry.js' || req.url.startsWith('/registry.js?')) {
    const registry = buildRegistry();
    const js = `export const registry = ${JSON.stringify(registry, null, 2)};`;
    res.writeHead(200, {
      'Content-Type': 'application/javascript',
      'Cache-Control': 'no-cache',
    });
    res.end(js);
    return;
  }

  // Static file serving
  let filePath = path.join(ROOT, req.url === '/' ? 'index.html' : req.url.split('?')[0]);
  const ext = path.extname(filePath);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Cache-Control': ext === '.js' ? 'no-cache' : 'max-age=5',
    });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`UI Design System running at http://localhost:${PORT}`);
  console.log('Registry is generated dynamically — just refresh the page after adding files.');
  console.log('Press Ctrl+C to stop.');
});
