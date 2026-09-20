// start.js - Unified Development Process Runner for Problem #25
import { spawn } from 'child_process';

console.log('🚀 Starting Microsoft Problem Statement #25 ("3,000 Alerts, One Analyst")...');

// 1. Spawn Python FastAPI Backend on port 8000
const backend = spawn('python', ['-m', 'uvicorn', 'app:app', '--host', '127.0.0.1', '--port', '8000', '--app-dir', 'backend'], {
  stdio: 'inherit',
  shell: true
});

// 2. Spawn Vite Frontend Client on port 5173
const frontend = spawn('npm', ['--prefix', 'client', 'run', 'dev', '--', '--host'], {
  stdio: 'inherit',
  shell: true
});

const cleanup = () => {
  console.log('\n🛑 Shutting down Problem #25 services...');
  backend.kill();
  frontend.kill();
  process.exit();
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
