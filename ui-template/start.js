#!/usr/bin/env node
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const SERVER = path.join(ROOT, 'server.js');
const PID_FILE = path.join(ROOT, '.server.pid');
const LOG_FILE = path.join(ROOT, 'server.log');

function readPort() {
  try {
    const src = fs.readFileSync(SERVER, 'utf8');
    const m = src.match(/PORT\s*=\s*(\d+)/);
    return m ? m[1] : '8080';
  } catch {
    return '8080';
  }
}

function readPid() {
  try {
    const pid = parseInt(fs.readFileSync(PID_FILE, 'utf8').trim(), 10);
    return Number.isFinite(pid) ? pid : null;
  } catch {
    return null;
  }
}

function isRunning(pid) {
  if (!pid) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function clearPidFile() {
  if (fs.existsSync(PID_FILE)) fs.unlinkSync(PID_FILE);
}

function start() {
  const existing = readPid();
  if (isRunning(existing)) {
    console.log(`Server already running (PID ${existing}), http://localhost:${readPort()}`);
    return;
  }
  if (existing) clearPidFile();

  const out = fs.openSync(LOG_FILE, 'a');
  const err = fs.openSync(LOG_FILE, 'a');
  const child = spawn(process.execPath, [SERVER], {
    cwd: ROOT,
    detached: true,
    stdio: ['ignore', out, err],
    windowsHide: true,
  });
  child.on('error', (e) => {
    console.error(`Failed to spawn: ${e.message}`);
    process.exit(1);
  });
  fs.writeFileSync(PID_FILE, String(child.pid));
  child.unref();
  console.log(`Started server (PID ${child.pid}), http://localhost:${readPort()}`);
  console.log(`Logs: ${LOG_FILE}`);
}

function stop() {
  const pid = readPid();
  if (!isRunning(pid)) {
    console.log('Server not running');
    clearPidFile();
    return;
  }
  try {
    process.kill(pid);
    console.log(`Stopped server (PID ${pid})`);
  } catch (e) {
    console.error(`Failed to stop PID ${pid}: ${e.message}`);
    process.exit(1);
  }
  clearPidFile();
}

function status() {
  const pid = readPid();
  if (isRunning(pid)) {
    console.log(`Running (PID ${pid}), http://localhost:${readPort()}`);
  } else {
    console.log('Not running');
    clearPidFile();
  }
}

function restart() {
  stop();
  setTimeout(start, 300);
}

const cmd = (process.argv[2] || 'start').toLowerCase();
switch (cmd) {
  case 'start':   start();   break;
  case 'stop':    stop();    break;
  case 'status':  status();  break;
  case 'restart': restart(); break;
  default:
    console.error(`Unknown command: ${cmd}`);
    console.error('Usage: node start.js [start|stop|status|restart]');
    process.exit(1);
}
