# CollabApp 🚀

A real-time collaborative application built with **Turborepo**, **Express**, **Postgres**, **WebSockets**, and **Kafka**.  
The project demonstrates a scalable architecture with authentication, room management, and real-time messaging backed by Kafka pub/sub.

---

## 🛠️ Tech Stack
- **[Turborepo](https://turbo.build/repo)** – Monorepo build system  
- **[Express](https://expressjs.com/)** – Backend framework  
- **[Postgres](https://www.postgresql.org/)** – Relational database  
- **[WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)** – Real-time communication  
- **[Kafka](https://kafka.apache.org/)** – Message streaming and pub/sub  

---

## ⚙️ Features

### 🔑 Authentication
- **User Registration** → `POST /api/user/register`  
- **Login** → `POST /api/user/login`  
- JWT-based authentication to secure APIs & WebSocket connections  

### 👤 User
- **Get Profile** → `GET /api/user/profile`  

### 🏠 Rooms
- **Create Room** → `POST /api/room/create`  
- **Get All Rooms** → `GET /api/room/all`  
- **Join Room** → via WebSocket connection (with JWT)  

### 💬 Messaging
- Users can join rooms and send messages in real time via WebSocket  
- Messages are published to **Kafka** and stored in **Postgres** via a Kafka consumer  

---

## 📡 Workflow

1. **Register/Login** → receive JWT  
2. **Join Room** → authenticate WebSocket connection using JWT  
3. **Send Messages** → messages go through Kafka pub/sub  
4. **Persist Messages** → Kafka consumer saves messages in Postgres  
5. **Retrieve Messages** → fetch chat history per room  

---

## 🏗️ Project Structure (Turborepo)

