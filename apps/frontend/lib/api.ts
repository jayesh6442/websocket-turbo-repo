const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8089';

// Types
export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Room {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
  owner?: User;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  roomId: string;
  createdAt: string;
  sender?: User;
}

export interface MessagesResponse {
  messages: Message[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface LoginResponse {
  token: string;
  user: User;
}

// Auth API
export const authAPI = {
  register: async (email: string, password: string, name: string) => {
    const response = await fetch(`${API_BASE_URL}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }
    return response.json();
  },

  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await fetch(`${API_BASE_URL}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }
    return response.json();
  },

  getProfile: async (token: string): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch profile');
    }
    return response.json();
  },
};

// Room API
export const roomAPI = {
  getAll: async (token: string): Promise<Room[]> => {
    const response = await fetch(`${API_BASE_URL}/rooms`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch rooms');
    }
    return response.json();
  },

  getById: async (token: string, roomId: string): Promise<Room> => {
    const response = await fetch(`${API_BASE_URL}/rooms/${roomId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch room');
    }
    return response.json();
  },

  create: async (token: string, name: string): Promise<Room> => {
    const response = await fetch(`${API_BASE_URL}/rooms/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create room');
    }
    return response.json();
  },
};

// Message API
export const messageAPI = {
  getRoomMessages: async (
    token: string,
    roomId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<MessagesResponse> => {
    const response = await fetch(
      `${API_BASE_URL}/messages/room/${roomId}?limit=${limit}&offset=${offset}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (!response.ok) {
      throw new Error('Failed to fetch messages');
    }
    return response.json();
  },
};

export { WS_URL };
