# WebSocket Server Testing Guide

## Prerequisites

1. **Start the services:**
   ```bash
   # Start Docker containers (PostgreSQL, Kafka, Zookeeper)
   bun run docker:up
   
   # Start the backend API (for getting JWT tokens)
   # In a separate terminal
   cd apps/backend && bun run dev
   
   # Start the WebSocket server
   # In another terminal
   cd apps/ws && bun run dev
   ```

2. **Get a JWT Token:**
   ```bash
   # Register a new user
   curl -X POST http://localhost:3000/api/user/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"test123","name":"Test User"}'
   
   # Or login if user exists
   curl -X POST http://localhost:3000/api/user/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"test123"}'
   ```
   
   Copy the `token` from the response.

## Testing Methods

### Method 1: Using the Test Script (Recommended)

```bash
# Run the test script with your JWT token
node test-websocket.js <YOUR_JWT_TOKEN>
```

The script will:
1. ✅ Connect to the WebSocket server
2. ✅ Authenticate with your token
3. ✅ Join a test room
4. ✅ Send test messages
5. ✅ Receive broadcasted messages from Kafka consumer
6. ✅ Leave the room and close connection

### Method 2: Using `websocat` (Command Line)

Install websocat:
```bash
# On Linux
wget https://github.com/vi/websocat/releases/download/v1.11.0/websocat.x86_64-unknown-linux-musl
chmod +x websocat.x86_64-unknown-linux-musl
sudo mv websocat.x86_64-unknown-linux-musl /usr/local/bin/websocat

# Or using cargo
cargo install websocat
```

Then connect and send messages:
```bash
# Connect to WebSocket
websocat ws://localhost:8080

# In the interactive session, send JSON messages:
{"type":"auth","token":"YOUR_JWT_TOKEN"}
{"type":"join_room","roomId":"test-room"}
{"type":"message","roomId":"test-room","text":"Hello from websocat!"}
{"type":"leave_room","roomId":"test-room"}
```

### Method 3: Using Browser Console

Open browser console and run:

```javascript
const ws = new WebSocket('ws://localhost:8080');
const token = 'YOUR_JWT_TOKEN'; // Replace with your actual token

ws.onopen = () => {
    console.log('Connected!');
    
    // Authenticate
    ws.send(JSON.stringify({ type: 'auth', token }));
};

ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    console.log('Received:', msg);
    
    if (msg.type === 'auth_success') {
        // Join room
        ws.send(JSON.stringify({ type: 'join_room', roomId: 'test-room' }));
        
        // Send message after 1 second
        setTimeout(() => {
            ws.send(JSON.stringify({ 
                type: 'message', 
                roomId: 'test-room', 
                text: 'Hello from browser!' 
            }));
        }, 1000);
    }
    
    if (msg.type === 'chat:new') {
        console.log('✅ Message persisted and broadcasted:', msg.payload);
    }
};

ws.onerror = (error) => {
    console.error('Error:', error);
};
```

### Method 4: Using Postman

1. Open Postman
2. Create a new WebSocket request
3. URL: `ws://localhost:8080`
4. Send messages in JSON format:
   ```json
   {"type":"auth","token":"YOUR_JWT_TOKEN"}
   {"type":"join_room","roomId":"test-room"}
   {"type":"message","roomId":"test-room","text":"Hello from Postman!"}
   ```

## Message Types

### 1. Authentication
```json
{
  "type": "auth",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "type": "auth_success",
  "user": { "id": "...", "email": "..." }
}
```

### 2. Join Room
```json
{
  "type": "join_room",
  "roomId": "room-123"
}
```

**Response:**
```json
{
  "type": "room_joined",
  "roomId": "room-123"
}
```

### 3. Send Message
```json
{
  "type": "message",
  "roomId": "room-123",
  "text": "Hello, world!"
}
```

**Response:**
```json
{
  "type": "queued",
  "roomId": "room-123",
  "tempId": "temp-1234567890",
  "createdAt": "2026-01-30T15:00:00.000Z"
}
```

**Later, you'll receive:**
```json
{
  "type": "chat:new",
  "payload": {
    "id": "message-uuid",
    "content": "Hello, world!",
    "sender": { "id": "...", "name": "...", "email": "..." },
    "createdAt": "2026-01-30T15:00:00.000Z",
    "roomId": "room-123"
  }
}
```

### 4. Leave Room
```json
{
  "type": "leave_room",
  "roomId": "room-123"
}
```

## Testing Multiple Clients

To test broadcasting, open multiple browser tabs or terminals and connect with different tokens. Messages sent by one client should be received by all other clients in the same room.

## Verifying Kafka Integration

1. **Check Kafka logs:**
   ```bash
   docker logs collabapp-kafka -f
   ```

2. **Check if messages are in Kafka:**
   ```bash
   docker exec -it collabapp-kafka kafka-console-consumer \
     --bootstrap-server localhost:9092 \
     --topic chat-messages \
     --from-beginning
   ```

3. **Check database:**
   ```bash
   # Connect to PostgreSQL
   docker exec -it collabapp-postgres psql -U jayesh -d collabapp
   
   # Query messages
   SELECT * FROM "Message" ORDER BY "createdAt" DESC LIMIT 10;
   ```

## Troubleshooting

1. **Connection refused:**
   - Make sure WebSocket server is running on port 8080
   - Check: `lsof -i :8080`

2. **Authentication fails:**
   - Verify your JWT token is valid
   - Check that the secret matches between backend and WS server
   - Token should contain `userId` field

3. **Messages not being broadcasted:**
   - Check Kafka consumer logs
   - Verify Kafka is running: `docker ps | grep kafka`
   - Check database connection

4. **Leadership election error:**
   - Wait a few seconds for Kafka to fully initialize
   - Restart Kafka container if needed
