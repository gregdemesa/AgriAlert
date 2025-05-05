
import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Loader2, Image as ImageIcon, X, ArrowDown } from "lucide-react";
import { useGemini } from "@/lib/GeminiContext";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const AIAdvisor = () => {
  const [message, setMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Use the Gemini context instead of local state
  const { chatHistory, isLoading, sendMessage, sendImageMessage, clearChat } = useGemini();

  // Handle scroll events to show/hide scroll button
  useEffect(() => {
    const chatContainer = chatContainerRef.current;
    if (!chatContainer) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = chatContainer;
      // Show button if not at bottom (with a small threshold)
      setShowScrollButton(scrollHeight - scrollTop - clientHeight > 100);
    };

    chatContainer.addEventListener('scroll', handleScroll);
    return () => chatContainer.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  // Function to scroll to bottom
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    if (selectedImage) {
      // Send message with image
      await sendImageMessage(message, selectedImage);
      setSelectedImage(null);
    } else {
      // Send text-only message
      await sendMessage(message);
    }

    setMessage("");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setIsUploading(false);
    };
    reader.onerror = () => {
      console.error('Error reading file');
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleQuickTopic = (topic: string) => {
    setMessage(topic);
  };

  const clearSelectedImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4 py-2">
      <div className="mb-2">
        <h1 className="text-2xl font-bold tracking-tight mb-1">AI Crop Advisor</h1>
        <p className="text-sm text-muted-foreground">
          Get personalized advice for your crops based on local conditions and AI analysis.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2 h-[calc(100vh-10rem)] flex flex-col overflow-hidden">
          <CardHeader className="pb-2 border-b">
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-agri-green" />
                Advisor Chat
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearChat}
                disabled={isLoading || chatHistory.length <= 1}
              >
                Clear Chat
              </Button>
            </div>
          </CardHeader>
          <div className="relative flex-1 overflow-hidden">
            <CardContent ref={chatContainerRef} className="absolute inset-0 overflow-y-auto p-4 space-y-4">
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
                    {msg.imageUrl && (
                      <div className="mb-2">
                        <img
                          src={msg.imageUrl}
                          alt="Uploaded crop"
                          className="rounded-md max-h-48 w-auto"
                        />
                      </div>
                    )}
                    {msg.type === 'ai' ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:mb-2 prose-headings:mt-1 prose-p:mb-2 prose-p:leading-relaxed prose-li:mb-0.5 prose-li:leading-relaxed prose-ul:mt-1 prose-ul:mb-1 prose-ol:mt-1 prose-ol:mb-1 prose-h1:text-lg prose-h2:text-base prose-h3:text-sm">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    )}
                    <div className="text-xs mt-1 opacity-70 text-right">
                      {msg.timestamp}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-agri-green" />
                </div>
              )}
            </CardContent>

            {showScrollButton && (
              <Button
                className="absolute bottom-4 right-4 rounded-full h-10 w-10 p-0 shadow-md z-10"
                onClick={scrollToBottom}
                size="icon"
                variant="secondary"
              >
                <ArrowDown className="h-5 w-5" />
              </Button>
            )}
          </div>
          <div className="p-4 border-t">
            {selectedImage && (
              <div className="mb-2 relative">
                <div className="flex items-center gap-2 p-2 border rounded-md">
                  <img
                    src={selectedImage}
                    alt="Selected"
                    className="h-12 w-auto rounded"
                  />
                  <span className="text-sm truncate flex-1">Image selected</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={clearSelectedImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your farming question..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading || !!selectedImage}
              >
                {isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ImageIcon className="h-4 w-4" />
                )}
              </Button>
              <Button type="submit" disabled={isLoading || !message.trim()}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Send
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
                disabled={isLoading}
              />
            </form>
          </div>
        </Card>

        <div className="space-y-4 flex flex-col h-[calc(100vh-10rem)]">
          <Card className="flex-1">
            <CardHeader>
              <CardTitle>Quick Topics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 overflow-y-auto">
              <Button
                variant="outline"
                className="w-full justify-start text-left"
                onClick={() => handleQuickTopic("Maaari mo ba akong tulungan na kilalanin ang mga karaniwang peste sa mga pananim ng palay?")}
              >
                Pest identification
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-left"
                onClick={() => handleQuickTopic("Ano ang mga pinakamahusay na kasanayan para sa pamamahala ng mga sakit ng pananim sa mga basang kondisyon?")}
              >
                Disease management
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-left"
                onClick={() => handleQuickTopic("Paano ko maaaring iakma ang aking mga kasanayan sa pagsasaka sa kasalukuyang pagtataya ng panahon?")}
              >
                Weather adaptation
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-left"
                onClick={() => handleQuickTopic("Anong mga pataba ang irerekomenda mo para sa aking mga pananim batay sa lokal na kondisyon?")}
              >
                Fertilizer recommendations
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-left"
                onClick={() => handleQuickTopic("Maaari ka bang magmungkahi ng pinakamainam na iskedyul ng patubig para sa aking mga pananim?")}
              >
                Irrigation scheduling
              </Button>
            </CardContent>
          </Card>

          <Card className="flex-shrink-0">
            <CardHeader className="pb-2">
              <CardTitle>Upload Photos</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Upload photos of your crops for more accurate diagnosis.
                </p>
                <div className="grid gap-2">
                  <label
                    htmlFor="photo-upload-card"
                    className="cursor-pointer border-2 border-dashed rounded-md p-6 text-center"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="flex flex-col items-center gap-2">
                      {isUploading ? (
                        <Loader2 className="h-6 w-6 animate-spin text-agri-green" />
                      ) : (
                        <ImageIcon className="h-6 w-6 text-agri-green" />
                      )}
                      <span className="text-sm text-muted-foreground">
                        {isUploading ? "Uploading..." : "Click to upload a photo"}
                      </span>
                    </div>
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
