
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare } from "lucide-react";

const AIAdvisor = () => {
  const [message, setMessage] = useState("");
  
  // Mock chat history
  const [chatHistory, setChatHistory] = useState([
    {
      type: "system",
      content: "Welcome to AgriAlert AI Advisor. How can I help you with your farming needs today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
    {
      type: "user",
      content: "My rice crop is showing yellow leaves. What could be wrong?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
    {
      type: "ai",
      content: "Yellow leaves in rice crops can be caused by several factors:\n\n1. Nitrogen deficiency: The most common cause, especially if older leaves turn yellow first.\n\n2. Iron deficiency: If young leaves are turning yellow while the veins remain green.\n\n3. Water stress: Either too much or too little water can cause yellowing.\n\n4. Disease: Bacterial leaf blight or rice blast can cause yellowing.\n\nBased on the current weather in your area (which has been fairly wet), and without more specific information, I'd suggest checking for nitrogen deficiency first. Consider applying a nitrogen-rich fertilizer and monitor for improvement. Would you like specific fertilizer recommendations for your soil type?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    // Add user message to chat
    const userMessage = {
      type: "user",
      content: message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    
    setChatHistory([...chatHistory, userMessage]);
    setMessage("");
    
    // Simulate AI response (in a real app, this would be an API call)
    setTimeout(() => {
      const aiResponse = {
        type: "ai",
        content: "I'll need to analyze that situation further based on your local conditions and crop variety. Based on the weather forecast for your area, I'd recommend monitoring closely and considering preventive measures. Would you like me to provide more specific advice?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatHistory(prev => [...prev, aiResponse]);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Crop Advisor</h1>
        <p className="text-muted-foreground">
          Get personalized advice for your crops based on local conditions and AI analysis.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2 h-[600px] flex flex-col">
          <CardHeader className="pb-2 border-b">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-agri-green" />
              Advisor Chat
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatHistory.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    msg.type === "user"
                      ? "bg-agri-green text-white"
                      : msg.type === "system"
                      ? "bg-gray-100 text-gray-800"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                  <div className="text-xs mt-1 opacity-70 text-right">
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
          <div className="p-4 border-t">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your farming question..."
                className="flex-1"
              />
              <Button type="submit">Send</Button>
            </form>
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Topics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start text-left">
                Pest identification
              </Button>
              <Button variant="outline" className="w-full justify-start text-left">
                Disease management
              </Button>
              <Button variant="outline" className="w-full justify-start text-left">
                Weather adaptation
              </Button>
              <Button variant="outline" className="w-full justify-start text-left">
                Fertilizer recommendations
              </Button>
              <Button variant="outline" className="w-full justify-start text-left">
                Irrigation scheduling
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upload Photos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Upload photos of your crops for more accurate diagnosis.
                </p>
                <div className="grid gap-2">
                  <label
                    htmlFor="photo-upload"
                    className="cursor-pointer border-2 border-dashed rounded-md p-6 text-center"
                  >
                    <span className="text-sm text-muted-foreground">
                      Click to upload a photo
                    </span>
                    <input
                      id="photo-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AIAdvisor;
