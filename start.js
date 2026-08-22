const { spawn } = require('child_process');
const path = require('path');

console.log('Starting Smart Hospital Servers...');

// 1. Start Backend
const backendPath = path.join(__dirname, 'backend');
const backendProcess = spawn('node', ['server.js'], {
    cwd: backendPath,
    stdio: 'inherit',
    shell: false // Prevent shell parsing issues with '&' in folder name
});

// 2. Start Frontend
const frontendPath = path.join(__dirname, 'frontend');
const frontendProcess = spawn('node', ['node_modules/vite/bin/vite.js'], {
    cwd: frontendPath,
    stdio: 'inherit',
    shell: false // Prevent shell parsing issues with '&' in folder name
});

// Handle termination
process.on('SIGINT', () => {
    console.log('\nStopping servers...');
    backendProcess.kill('SIGINT');
    frontendProcess.kill('SIGINT');
    process.exit();
});

backendProcess.on('close', (code) => {
    console.log(`Backend server exited with code ${code}`);
});

frontendProcess.on('close', (code) => {
    console.log(`Frontend server exited with code ${code}`);
});
