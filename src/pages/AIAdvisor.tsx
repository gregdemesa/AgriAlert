
import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Loader2, Image as ImageIcon, X, ArrowDown, Mic, MicOff } from "lucide-react";
import { useGemini } from "@/lib/GeminiContext";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import speechToTextService from "@/lib/speechToTextService";
import { toast } from "@/components/ui/sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const AIAdvisor = () => {
  const [message, setMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const dropZoneRef = useRef<HTMLLabelElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);

  // Use the Gemini context instead of local state
  const { chatHistory, isLoading, sendMessage, sendImageMessage, clearChat } = useGemini();

  // Initialize speech recognition
  useEffect(() => {
    // Set up speech recognition callbacks
    speechToTextService.onStart(() => {
      setIsListening(true);
      setInterimTranscript("");
      toast("Listening...", {
        description: "Speak in any language. Click the microphone button again to stop.",
        duration: 5000,
      });
    });

    speechToTextService.onResult((result) => {
      if (result.isFinal) {
        setMessage((prev) => {
          const newMessage = prev.trim() ? `${prev} ${result.transcript}` : result.transcript;
          return newMessage;
        });
        setInterimTranscript("");
      } else {
        setInterimTranscript(result.transcript);
      }
    });

    speechToTextService.onError((error) => {
      console.error("Speech recognition error:", error);
      setIsListening(false);
      toast("Speech recognition error", {
        description: error.message,
      });
    });

    speechToTextService.onEnd(() => {
      setIsListening(false);
      setInterimTranscript("");
    });
  }, []);

  // Toggle speech recognition
  const toggleSpeechRecognition = () => {
    if (isListening) {
      speechToTextService.stopListening();
    } else {
      const success = speechToTextService.startListening();
      if (!success) {
        toast("Speech recognition not available", {
          description: "Your browser may not support this feature or microphone access was denied.",
        });
      }
    }
  };

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

      // Focus the message input after a short delay to allow the UI to update
      setTimeout(() => {
        messageInputRef.current?.focus();
      }, 100);
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

  // Handle drag events for file upload
  const handleDragEnter = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        setIsUploading(true);

        const reader = new FileReader();
        reader.onload = () => {
          setSelectedImage(reader.result as string);
          setIsUploading(false);

          // Focus the message input after a short delay
          setTimeout(() => {
            messageInputRef.current?.focus();
          }, 100);
        };
        reader.onerror = () => {
          console.error('Error reading file');
          setIsUploading(false);
        };
        reader.readAsDataURL(file);
      }
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
                <div className="flex items-center gap-2 p-2 border rounded-md bg-gray-50">
                  <img
                    src={selectedImage}
                    alt="Selected"
                    className="h-12 w-auto rounded"
                  />
                  <div className="flex-1">
                  <span className="text-sm truncate block">Image selected</span>
                  <span className="text-xs text-muted-foreground">Type your question about this image</span>
                </div>
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
              <div className="relative flex-1">
                <Input
                  ref={messageInputRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={isListening ? '' : "Type your farming question..."}
                  className={`flex-1 pr-10 ${isListening ? 'border-agri-green text-transparent' : ''}`}
                  disabled={isLoading}
                />
                {isListening && (
                  <div className="absolute inset-0 flex items-center px-3 pointer-events-none overflow-hidden bg-background">
                    <span className={`truncate ${interimTranscript || message ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {message || interimTranscript ? `${message} ${interimTranscript}` : "Listening..."}
                    </span>
                  </div>
                )}
              </div>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={toggleSpeechRecognition}
                      disabled={isLoading}
                      className={isListening ? 'bg-agri-green text-white hover:bg-agri-green/90' : ''}
                    >
                      {isListening ? (
                        <MicOff className="h-4 w-4" />
                      ) : (
                        <Mic className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isListening ? 'Stop listening' : 'Start voice input (any language)'}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
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
                    ref={dropZoneRef}
                    htmlFor="photo-upload-card"
                    className={`cursor-pointer border-2 border-dashed rounded-md p-6 text-center transition-colors ${
                      isDragging ? 'border-agri-green bg-agri-green/5' : 'border-gray-300'
                    }`}
                    onClick={() => fileInputRef.current?.click()}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  >
                    <div className="flex flex-col items-center gap-2">
                      {isUploading ? (
                        <Loader2 className="h-6 w-6 animate-spin text-agri-green" />
                      ) : (
                        <ImageIcon className={`h-6 w-6 ${isDragging ? 'text-agri-green' : 'text-agri-green/70'}`} />
                      )}
                      <span className="text-sm text-muted-foreground">
                        {isUploading
                          ? "Uploading..."
                          : isDragging
                            ? "Drop your image here"
                            : "Drag & drop or click to upload a photo"}
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
