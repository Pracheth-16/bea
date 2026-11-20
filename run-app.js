import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('================================================================');
console.log('🚀 Starting Enterprise ITSM (BMSIT&M BEA BCS703B Project)');
console.log('================================================================');

// Start backend
const backend = spawn(process.execPath, ['src/server.js'], {
  cwd: path.join(__dirname, 'backend'),
  stdio: 'inherit'
});

// Start frontend
const vitePath = path.join(__dirname, 'frontend', 'node_modules', 'vite', 'bin', 'vite.js');
const frontend = spawn(process.execPath, [vitePath, '--host', '0.0.0.0', '--port', '3000'], {
  cwd: path.join(__dirname, 'frontend'),
  stdio: 'inherit'
});

const cleanup = () => {
  console.log('\n[ITSM Runner] Shutting down application servers gracefully...');
  backend.kill();
  frontend.kill();
  process.exit();
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

