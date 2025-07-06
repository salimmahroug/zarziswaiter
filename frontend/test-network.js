const http = require('http');
const os = require('os');

// Get network interfaces
function getNetworkInterfaces() {
    const nets = os.networkInterfaces();
    const results = [];

    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            if (net.family === 'IPv4' && !net.internal) {
                results.push({
                    interface: name,
                    address: net.address
                });
            }
        }
    }
    return results;
}

// Create a simple test server
const server = http.createServer((req, res) => {
    res.writeHead(200, { 
        'Content-Type': 'text/html',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
        'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end(`
        <html>
            <head><title>Test Network Connection</title></head>
            <body>
                <h1>✅ Network Test Successful!</h1>
                <p>Time: ${new Date().toLocaleString()}</p>
                <p>Server IP: ${req.socket.localAddress}</p>
                <p>Client IP: ${req.socket.remoteAddress}</p>
                <h2>Available Network Interfaces:</h2>
                <ul>
                    ${getNetworkInterfaces().map(net => 
                        `<li><strong>${net.interface}:</strong> ${net.address}</li>`
                    ).join('')}
                </ul>
            </body>
        </html>
    `);
});

const PORT = 3000;
const HOST = '0.0.0.0'; // Listen on all interfaces

server.listen(PORT, HOST, () => {
    console.log('\n🚀 Test server running!');
    console.log('==========================================');
    
    const interfaces = getNetworkInterfaces();
    interfaces.forEach(net => {
        console.log(`📱 Test on phone: http://${net.address}:${PORT}`);
    });
    
    console.log('==========================================');
    console.log('Press Ctrl+C to stop');
});

server.on('error', (err) => {
    console.error('Server error:', err);
});
