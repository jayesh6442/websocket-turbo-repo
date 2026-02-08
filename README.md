# Real-time Chat Application

This project is a scalable real-time chat application that allows users to register, log in, create chat rooms, and exchange messages instantly. It features a robust backend architecture designed for high performance and message persistence, leveraging technologies like WebSockets for real-time communication and Apache Kafka for handling message streams.

## Features

-   **User Authentication**: Secure user registration and login using JWT.
-   **Room Management**: Users can create new chat rooms and view all available rooms.
-   **Real-time Messaging**: Instant message delivery using WebSockets.
-   **Persistent Storage**: Messages are asynchronously stored in a PostgreSQL database.
-   **Scalable Architecture**: Built with a monorepo structure using Turborepo and a decoupled message-handling system with Kafka.

## Tech Stack

-   **Monorepo**: [Turborepo](https://turbo.build/repo)
-   **Backend Framework**: [Express.js](https://expressjs.com/)
-   **Database**: [PostgreSQL](https://www.postgresql.org/)
-   **Real-time Communication**: [ws (WebSocket)](https://github.com/websockets/ws)
-   **Message Broker**: [Apache Kafka](https://kafka.apache.org/)
-   **Runtime/Package Manager**: [Bun](https://bun.sh/)

## How It Works

The application follows a modern, decoupled architecture to ensure scalability and reliability.

1.  **User Authentication**: A user signs up or logs in, and upon success, receives a JSON Web Token (JWT).
2.  **Room Interaction**: The user can fetch their profile, view a list of all chat rooms, or create a new one.
3.  **Joining a Room**: To join a room, the user establishes a WebSocket connection, authenticating with their JWT.
4.  **Sending Messages**: Once connected, the user sends messages through the WebSocket connection to the server.
5.  **Message Processing**: The Express server receives the message and publishes it to a Kafka topic.
6.  **Database Persistence**: A separate consumer service listens to the Kafka topic, receives the message, and stores it in the PostgreSQL database. This pub/sub model decouples the real-time component from the database, preventing bottlenecks and ensuring messages are not lost.

## API Endpoints

Here are the available REST API endpoints for user and room management.

### User Routes

-   **Register a new user**
    -   `POST /api/user/register`
-   **Login a user**
    -   `POST /api/user/login`
-   **Get user profile** (Requires JWT)
    -   `GET /api/user/profile`

### Room Routes

-   **Create a new room** (Requires JWT)
    -   `POST /api/room/create`
-   **Get all available rooms**
    -   `GET /api/room/all`

## Real-time Communication (WebSockets)

-   **Authentication**: The WebSocket connection is initiated with the user's JWT passed as a query parameter or in the initial handshake.
-   **Join Room**: After authentication, the client sends a message to join a specific `roomId`.
-   **Send Message**: The client sends a JSON payload containing the message content and `roomId`. The server then broadcasts this message to all other clients in the same room.

## Message Persistence with Kafka

-   **Producer**: The main application server acts as a Kafka **producer**. When a message is received via WebSocket, it's immediately sent to a specific Kafka topic (e.g., `chat-messages`).
-   **Consumer**: A dedicated background worker acts as a Kafka **consumer**. It subscribes to the `chat-messages` topic, consumes messages as they arrive, and saves them to the `messages` table in the PostgreSQL database.

## Getting Started

### Prerequisites

-   [Bun](https://bun.sh/)
-   PostgreSQL
-   Apache Kafka & Zookeeper

### Installation

1.  Clone the repository:
    
    ```bash
    git clone https://github.com/jayesh6442/websocket-turbo-repo
    ```
    
2.  CD into clone repo:
    
    ```bash
    cd websocket-turbo-repo
    ```
    
3.  Install dependencies:
    
    ```bash
    bun install
    ```
    
4.  Set up your environment variables in a `.env` file.
5.  Start the development server:
    
    ```bash
    bun dev
    ```