#!/usr/bin/env node
/**
 * Manual WebSocket Test Script
 * 
 * Usage:
 *   1. First, get a JWT token by logging in via the backend API
 *   2. Then run this script with: node test-websocket.js <YOUR_JWT_TOKEN>
 * 
 * Example:
 *   node test-websocket.js eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 */

const WebSocket = require('ws');

const WS_URL = 'ws://localhost:8080';
const token = process.argv[2];

if (!token) {
    console.error('❌ Please provide a JWT token as argument');
    console.log('\n📝 Steps to get a token:');
    console.log('   1. Register/Login via POST http://localhost:3000/api/user/login');
    console.log('   2. Copy the token from the response');
    console.log('   3. Run: node test-websocket.js <YOUR_TOKEN>');
    process.exit(1);
}

console.log('🔌 Connecting to WebSocket server...');
const ws = new WebSocket(WS_URL);

ws.on('open', () => {
    console.log('✅ Connected to WebSocket server');
    
    // Step 1: Authenticate
    console.log('\n📤 Step 1: Authenticating...');
    ws.send(JSON.stringify({
        type: 'auth',
        token: token
    }));
});

ws.on('message', (data) => {
    const message = JSON.parse(data.toString());
    console.log('\n📥 Received:', JSON.stringify(message, null, 2));
    
    if (message.type === 'auth_success') {
        console.log('✅ Authentication successful!');
        console.log('\n📤 Step 2: Joining room "test-room"...');
        ws.send(JSON.stringify({
            type: 'join_room',
            roomId: 'test-room'
        }));
        
        // After 2 seconds, send a test message
        setTimeout(() => {
            console.log('\n📤 Step 3: Sending test message...');
            ws.send(JSON.stringify({
                type: 'message',
                roomId: 'test-room',
                text: 'Hello from test script! ' + new Date().toISOString()
            }));
        }, 2000);
        
        // Send another message after 5 seconds
        setTimeout(() => {
            console.log('\n📤 Step 4: Sending another message...');
            ws.send(JSON.stringify({
                type: 'message',
                roomId: 'test-room',
                text: 'This message should be persisted to DB and broadcasted!'
            }));
        }, 5000);
        
        // Keep connection alive for 10 seconds
        setTimeout(() => {
            console.log('\n📤 Step 5: Leaving room...');
            ws.send(JSON.stringify({
                type: 'leave_room',
                roomId: 'test-room'
            }));
            
            setTimeout(() => {
                console.log('\n👋 Closing connection...');
                ws.close();
                process.exit(0);
            }, 1000);
        }, 10000);
    }
    
    if (message.type === 'queued') {
        console.log('✅ Message queued to Kafka');
    }
    
    if (message.type === 'chat:new') {
        console.log('✅ Received broadcasted message from consumer!');
        console.log('   Message ID:', message.payload.id);
        console.log('   Content:', message.payload.content);
        console.log('   Sender:', message.payload.sender);
    }
    
    if (message.type === 'error') {
        console.error('❌ Error:', message.message);
    }
});

ws.on('error', (error) => {
    console.error('❌ WebSocket error:', error.message);
});

ws.on('close', () => {
    console.log('\n🔌 Connection closed');
});

// Handle Ctrl+C
process.on('SIGINT', () => {
    console.log('\n\n👋 Closing connection...');
    ws.close();
    process.exit(0);
});
