'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { ProtectedRoute } from '@/components/protected-route';
import { useWebSocket } from '@/lib/use-websocket';
import { roomAPI, messageAPI, Message } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
import Link from 'next/link';
// Simple date formatter
const formatTime = (date: string | Date) => {
  const d = new Date(date);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params?.roomId as string;
  const { user, token } = useAuth();
  const [roomName, setRoomName] = useState('');
  const [messageText, setMessageText] = useState('');
  const [isLoadingRoom, setIsLoadingRoom] = useState(true);
  const [initialMessages, setInitialMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { isConnected, messages, sendMessage } = useWebSocket({
    token,
    roomId,
    onMessage: () => {
      // Scroll to bottom when new message arrives
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    },
  });

  // Combine initial messages with new WebSocket messages
  const allMessages = useMemo(() => {
    return [...initialMessages, ...messages];
  }, [initialMessages, messages]);

  useEffect(() => {
    if (!token || !roomId) return;

    const fetchRoomAndMessages = async () => {
      try {
        // Fetch room details and messages in parallel
        const [room, messagesData] = await Promise.all([
          roomAPI.getById(token, roomId),
          messageAPI.getRoomMessages(token, roomId, 50, 0),
        ]);
        
        setRoomName(room.name);
        setInitialMessages(messagesData.messages);
        
        // Scroll to bottom after loading messages
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } catch (err) {
        console.error('Failed to fetch room or messages:', err);
        router.push('/');
      } finally {
        setIsLoadingRoom(false);
      }
    };

    fetchRoomAndMessages();
  }, [token, roomId, router]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [allMessages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !isConnected) return;

    sendMessage(messageText);
    setMessageText('');
    inputRef.current?.focus();
  };

  if (isLoadingRoom) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-4 flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-xl font-semibold">{roomName}</h1>
              <p className="text-sm text-muted-foreground">
                {isConnected ? (
                  <span className="text-green-500">● Connected</span>
                ) : (
                  <span className="text-yellow-500">● Connecting...</span>
                )}
              </p>
            </div>
          </div>
        </header>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4">
          <div className="container mx-auto max-w-4xl space-y-4">
            {allMessages.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              allMessages.map((message) => {
                const isOwnMessage = message.senderId === user?.id;
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        isOwnMessage
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-card border'
                      }`}
                    >
                      {!isOwnMessage && (
                        <div className="text-xs font-semibold mb-1 opacity-80">
                          {message.sender?.name || 'Unknown'}
                        </div>
                      )}
                      <div className="text-sm">{message.content}</div>
                      <div
                        className={`text-xs mt-1 ${
                          isOwnMessage ? 'opacity-80' : 'text-muted-foreground'
                        }`}
                      >
                        {formatTime(message.createdAt)}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="border-t bg-card p-4">
          <form onSubmit={handleSendMessage} className="container mx-auto max-w-4xl">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder={
                  isConnected
                    ? 'Type your message...'
                    : 'Connecting to server...'
                }
                disabled={!isConnected}
                className="flex-1"
              />
              <Button
                type="submit"
                disabled={!isConnected || !messageText.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}
