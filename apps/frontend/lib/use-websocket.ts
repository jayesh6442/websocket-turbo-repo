'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Message } from './api';

interface UseWebSocketOptions {
  token: string | null;
  roomId: string | null;
  onMessage?: (message: Message) => void;
  onError?: (error: Error) => void;
}

export function useWebSocket({ token, roomId, onMessage, onError }: UseWebSocketOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isConnectingRef = useRef(false);
  const isUnmountingRef = useRef(false);
  const hasConnectedRef = useRef(false);
  const tokenRef = useRef(token);
  const roomIdRef = useRef(roomId);
  const onMessageRef = useRef(onMessage);
  const onErrorRef = useRef(onError);
  const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8089';

  // Keep refs in sync
  useEffect(() => {
    tokenRef.current = token;
    roomIdRef.current = roomId;
    onMessageRef.current = onMessage;
    onErrorRef.current = onError;
  }, [token, roomId, onMessage, onError]);

  const sendMessage = useCallback((text: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && roomIdRef.current) {
      wsRef.current.send(JSON.stringify({
        type: 'message',
        roomId: roomIdRef.current,
        text,
      }));
    }
  }, []);

  const connect = useCallback(() => {
    // Use refs to get current values
    const currentToken = tokenRef.current;
    const currentRoomId = roomIdRef.current;

    if (!currentToken || !currentRoomId || isUnmountingRef.current) {
      return;
    }

    // Prevent multiple simultaneous connection attempts
    if (isConnectingRef.current) {
      return;
    }

    // If already connected, don't reconnect
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      return;
    }

    // Clean up any existing connection
    if (wsRef.current) {
      try {
        if (wsRef.current.readyState === WebSocket.CONNECTING || wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.close();
        }
      } catch {
        // Ignore errors
      }
      wsRef.current = null;
    }

    isConnectingRef.current = true;

    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        isConnectingRef.current = false;
        hasConnectedRef.current = true;
        
        // Authenticate first - use ref to get current token
        const currentToken = tokenRef.current;
        if (currentToken && !isUnmountingRef.current) {
          ws.send(JSON.stringify({
            type: 'auth',
            token: currentToken,
          }));
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          switch (data.type) {
            case 'auth_success':
              console.log('WebSocket authenticated');
              setIsConnected(true);
              // Join the room - use ref to get current roomId
              const currentRoomId = roomIdRef.current;
              if (ws.readyState === WebSocket.OPEN && currentRoomId && !isUnmountingRef.current) {
                ws.send(JSON.stringify({
                  type: 'join_room',
                  roomId: currentRoomId,
                }));
              }
              break;
            
            case 'room_joined':
              console.log('Joined room:', data.roomId);
              break;
            
            case 'queued':
              console.log('Message queued');
              break;
            
            case 'chat:new':
              const newMessage: Message = {
                id: data.payload.id,
                content: data.payload.content,
                senderId: data.payload.sender.id,
                roomId: data.payload.roomId,
                createdAt: data.payload.createdAt,
                sender: data.payload.sender,
              };
              setMessages((prev) => [...prev, newMessage]);
              onMessageRef.current?.(newMessage);
              break;
            
            case 'error':
              console.error('WebSocket error:', data.message);
              onErrorRef.current?.(new Error(data.message));
              break;
          }
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        isConnectingRef.current = false;
        setIsConnected(false);
        // Don't call onError here as it might trigger re-renders
      };

      ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        isConnectingRef.current = false;
        setIsConnected(false);
        wsRef.current = null;
        
        // Only reconnect if it wasn't a normal closure and we still have token/roomId
        // Don't reconnect on 1000 (normal closure) or if component is unmounting
        const currentToken = tokenRef.current;
        const currentRoomId = roomIdRef.current;
        if (
          event.code !== 1000 && 
          event.code !== 1001 && 
          currentToken && 
          currentRoomId && 
          !isUnmountingRef.current &&
          hasConnectedRef.current // Only reconnect if we had a successful connection before
        ) {
          // Attempt to reconnect after 3 seconds
          reconnectTimeoutRef.current = setTimeout(() => {
            if (
              currentToken && 
              currentRoomId && 
              !wsRef.current && 
              !isConnectingRef.current && 
              !isUnmountingRef.current
            ) {
              connect();
            }
          }, 3000);
        } else {
          hasConnectedRef.current = false;
        }
      };
    } catch (err) {
      console.error('Failed to create WebSocket:', err);
      isConnectingRef.current = false;
      onErrorRef.current?.(err as Error);
    }
  }, [WS_URL]);

  // Main effect - only run when token or roomId changes, not on every render
  useEffect(() => {
    // Only connect if we have both token and roomId
    if (!token || !roomId) {
      return;
    }

    // Reset flags
    isUnmountingRef.current = false;
    hasConnectedRef.current = false;

    // Clear any existing reconnect timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    // Connect after a small delay to prevent rapid reconnections
    const connectTimeout = setTimeout(() => {
      if (!isUnmountingRef.current && token && roomId) {
        connect();
      }
    }, 200);

    return () => {
      // Mark as unmounting to prevent reconnections
      isUnmountingRef.current = true;
      
      clearTimeout(connectTimeout);
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      
      if (wsRef.current) {
        // Only send leave_room if WebSocket is open
        const currentRoomId = roomIdRef.current;
        if (currentRoomId && wsRef.current.readyState === WebSocket.OPEN) {
          try {
            wsRef.current.send(JSON.stringify({
              type: 'leave_room',
              roomId: currentRoomId,
            }));
          } catch {
            // Ignore errors
          }
        }
        // Close the connection
        try {
          if (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING) {
            wsRef.current.close(1000, 'Component unmounting');
          }
        } catch {
          // Ignore errors
        }
        wsRef.current = null;
      }
      
      isConnectingRef.current = false;
      hasConnectedRef.current = false;
    };
  }, [token, roomId, connect]);

  return {
    isConnected,
    messages,
    sendMessage,
    reconnect: connect,
  };
}
