const { spawn } = require('child_process');
const path = require('path');

const isWin = process.platform === 'win32';
const npmCmd = isWin ? 'npm.cmd' : 'npm';

console.log('\x1b[32m%s\x1b[0m', '================================================');
console.log('\x1b[32m%s\x1b[0m', '   Starting GramSeva Platform (Server & Client)  ');
console.log('\x1b[32m%s\x1b[0m', '================================================');

// Start backend server
const server = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(__dirname, '..', 'server'),
  stdio: 'inherit',
  shell: true
});

// Start frontend client
const client = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(__dirname, '..', 'client'),
  stdio: 'inherit',
  shell: true
});

const cleanup = () => {
  console.log('\nStopping GramSeva services...');
  server.kill();
  client.kill();
  process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
