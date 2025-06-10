
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Bot, X, Send, MapPin, Sparkles, Settings } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  trip?: any;
}

interface AIChatBotProps {
  onTripCreated?: (trip: any) => void;
}

export function AIChatBot({ onTripCreated }: AIChatBotProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [n8nWebhookUrl, setN8nWebhookUrl] = useState(
    localStorage.getItem('n8n_webhook_url') || ''
  );
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: 'Hi! I\'m your AI travel assistant. I can help you plan trips, answer travel questions, and create itineraries with Google Maps integration. Try saying "Create a trip to Tokyo for 5 days" or ask me anything about travel!',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendToN8n = async (data: any) => {
    if (!n8nWebhookUrl) return;

    try {
      await fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'no-cors',
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          user_id: user?.id,
          user_email: user?.email,
          ...data
        }),
      });
      console.log('Data sent to n8n successfully');
    } catch (error) {
      console.error('Error sending data to n8n:', error);
    }
  };

  const saveN8nWebhook = () => {
    localStorage.setItem('n8n_webhook_url', n8nWebhookUrl);
    setIsSettingsOpen(false);
    toast({
      title: "Settings Saved",
      description: "n8n webhook URL has been saved successfully.",
    });
  };

  const sendMessage = async () => {
    if (!input.trim() || !user) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: input,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    
    // Send user message to n8n
    await sendToN8n({
      event_type: 'user_message',
      message: input,
      action: 'chat_message'
    });

    setInput('');
    setIsLoading(true);

    try {
      const isCreateTripRequest = input.toLowerCase().includes('create trip') || 
                                 input.toLowerCase().includes('plan trip') ||
                                 input.toLowerCase().includes('make trip');

      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          message: input,
          userId: user.id,
          action: isCreateTripRequest ? 'create_trip' : 'chat'
        }
      });

      if (error) throw error;

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: data.response,
        isUser: false,
        timestamp: new Date(),
        trip: data.trip
      };

      setMessages(prev => [...prev, aiMessage]);

      if (data.action === 'trip_created' && data.trip) {
        toast({
          title: "Trip Created!",
          description: "Your AI-generated trip has been added to your plans.",
        });
        onTripCreated?.(data.trip);

        // Send trip creation event to n8n
        await sendToN8n({
          event_type: 'trip_created',
          trip: data.trip,
          action: 'trip_created'
        });
      }

      // Send AI response to n8n
      await sendToN8n({
        event_type: 'ai_response',
        ai_response: data.response,
        action: data.action || 'chat'
      });

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });

      // Send error event to n8n
      await sendToN8n({
        event_type: 'error',
        error_message: error.message,
        action: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-20 right-4 z-50">
        <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="mb-2 h-10 w-10 rounded-full shadow-lg"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>n8n Integration Settings</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="webhook-url">n8n Webhook URL</Label>
                <Input
                  id="webhook-url"
                  value={n8nWebhookUrl}
                  onChange={(e) => setN8nWebhookUrl(e.target.value)}
                  placeholder="https://your-n8n-instance.com/webhook/your-webhook-id"
                />
              </div>
              <Button onClick={saveN8nWebhook} className="w-full">
                Save Settings
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full h-14 w-14 shadow-lg"
          size="icon"
        >
          <Bot className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <Card className="fixed bottom-20 right-4 z-50 w-80 h-96 shadow-xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Sparkles className="h-4 w-4 text-blue-600" />
            AI Travel Assistant
            {n8nWebhookUrl && (
              <Badge variant="secondary" className="text-xs">
                n8n Connected
              </Badge>
            )}
          </CardTitle>
          <div className="flex gap-1">
            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                >
                  <Settings className="h-3 w-3" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>n8n Integration Settings</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="webhook-url">n8n Webhook URL</Label>
                    <Input
                      id="webhook-url"
                      value={n8nWebhookUrl}
                      onChange={(e) => setN8nWebhookUrl(e.target.value)}
                      placeholder="https://your-n8n-instance.com/webhook/your-webhook-id"
                    />
                  </div>
                  <Button onClick={saveN8nWebhook} className="w-full">
                    Save Settings
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col h-full pb-4">
        <div className="flex-1 overflow-y-auto space-y-3 mb-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-2 rounded-lg text-sm ${
                  message.isUser
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                {message.text}
                {message.trip && (
                  <div className="mt-2 p-2 bg-white/20 rounded border">
                    <div className="flex items-center gap-1 text-xs mb-1">
                      <MapPin className="h-3 w-3" />
                      Trip Created
                    </div>
                    <div className="text-xs">{message.trip.title}</div>
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 p-2 rounded-lg text-sm">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about travel or create a trip..."
            className="text-sm"
            disabled={isLoading}
          />
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
