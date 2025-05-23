import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { formatTime } from "@/lib/utils";
import { type User, type Chat } from "@shared/schema";

interface ChatBoxProps {
  recipient: User;
  onClose: () => void;
}

export default function ChatBox({ recipient, onClose }: ChatBoxProps) {
  const [message, setMessage] = useState("");
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const { user, token } = useAuth();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Fetch chat history
  const { data: messages, refetch } = useQuery<Chat[]>({
    queryKey: [`/api/chat/${recipient.id}`],
    enabled: !!user && !!recipient,
  });

  // Connect to WebSocket
  useEffect(() => {
    if (!user || !token) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const newSocket = new WebSocket(wsUrl);

    newSocket.onopen = () => {
      // Authenticate on connection
      newSocket.send(JSON.stringify({
        type: 'auth',
        token
      }));
    };

    newSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'auth' && data.success) {
        setConnected(true);
      } else if (data.type === 'message') {
        // Refresh messages when receiving a new one
        refetch();
      }
    };

    newSocket.onerror = (error) => {
      console.error('WebSocket error:', error);
      toast({
        variant: "destructive",
        title: "Lỗi kết nối",
        description: "Không thể kết nối đến máy chủ trò chuyện.",
      });
    };

    newSocket.onclose = () => {
      setConnected(false);
    };

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [user, token, toast, refetch]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!message.trim() || !socket || !connected) return;

    try {
      socket.send(JSON.stringify({
        type: 'message',
        receiverId: recipient.id,
        content: message.trim()
      }));
      
      setMessage("");
      
      // Refresh messages after sending
      setTimeout(() => {
        refetch();
      }, 300);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi gửi tin nhắn",
        description: "Không thể gửi tin nhắn. Vui lòng thử lại.",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Card className="w-full max-w-md h-96 flex flex-col">
      <CardHeader className="py-3 px-4 border-b">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200">
              {recipient.avatarUrl ? (
                <img
                  src={recipient.avatarUrl}
                  alt={recipient.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary text-white font-bold">
                  {recipient.name.charAt(0)}
                </div>
              )}
            </div>
            <CardTitle className="text-base">{recipient.name}</CardTitle>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            className="h-8 w-8 p-0"
            onClick={onClose}
          >
            <i className="fas fa-times"></i>
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow p-0 overflow-hidden">
        <ScrollArea className="h-full p-4">
          {messages && messages.length > 0 ? (
            <div className="space-y-3">
              {messages.map((msg) => {
                const isSentByMe = msg.senderId === user.id;
                
                return (
                  <div 
                    key={msg.id} 
                    className={`flex ${isSentByMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[70%] px-3 py-2 rounded-lg ${
                        isSentByMe 
                          ? 'bg-primary text-white rounded-br-none' 
                          : 'bg-gray-200 text-gray-900 rounded-bl-none'
                      }`}
                    >
                      <p className="break-words">{msg.message}</p>
                      <div 
                        className={`text-xs mt-1 ${
                          isSentByMe ? 'text-indigo-100' : 'text-gray-500'
                        }`}
                      >
                        {formatTime(msg.sentAt)}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-500">
              <i className="far fa-comments text-3xl mb-2"></i>
              <p>Bắt đầu cuộc trò chuyện với {recipient.name}</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
      
      <CardFooter className="p-2 border-t">
        <div className="flex w-full space-x-2">
          <Input 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Nhập tin nhắn..."
            disabled={!connected}
          />
          <Button 
            className="bg-primary hover:bg-indigo-700"
            onClick={sendMessage}
            disabled={!message.trim() || !connected}
          >
            <i className="fas fa-paper-plane"></i>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
