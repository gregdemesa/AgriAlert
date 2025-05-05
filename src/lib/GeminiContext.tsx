import { createContext, useContext, useState, ReactNode } from 'react';
import { useLocation } from './LocationContext';
import { useWeather } from './WeatherContext';
import { ChatMessage, generateChatResponse, generateImageResponse } from './geminiApi';

// Define the context type
interface GeminiContextType {
  chatHistory: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (message: string) => Promise<void>;
  sendImageMessage: (message: string, imageBase64: string) => Promise<void>;
  clearChat: () => void;
}

// Create the context with default values
const GeminiContext = createContext<GeminiContextType | null>(null);

// Custom hook to use the Gemini context
export const useGemini = () => {
  const context = useContext(GeminiContext);
  if (!context) {
    throw new Error('useGemini must be used within a GeminiProvider');
  }
  return context;
};

// Gemini Provider component
export const GeminiProvider = ({ children }: { children: ReactNode }) => {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      type: 'ai',
      content: '# Maligayang pagdating sa AgriAlert AI Advisor! 👋\n\nNarito ako para magbigay ng personalized na payo sa agrikultura batay sa iyong lokasyon, kondisyon ng panahon, at pangangailangan ng pananim.\n\n**Paano kita matutulungan ngayon?**\n\n* Magtanong tungkol sa pamamahala ng pananim\n* Kumuha ng pagkakakilanlan ng peste at sakit\n* Tumanggap ng mga rekomendasyon batay sa panahon\n* Mag-upload ng mga larawan para sa pagsusuri\n* Kumuha ng payo sa pagtatanim at pag-aani',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get location and weather data to provide context to the AI
  const { location } = useLocation();
  const { currentWeather, forecast } = useWeather();

  // Function to send a message to the AI
  const sendMessage = async (message: string) => {
    if (!message.trim()) return;

    try {
      setIsLoading(true);
      setError(null);

      // Add user message to chat
      const userMessage: ChatMessage = {
        type: 'user',
        content: message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      // Update chat history with user message
      setChatHistory(prev => [...prev, userMessage]);

      // Generate AI response
      const aiResponseText = await generateChatResponse(
        [...chatHistory, userMessage],
        location,
        currentWeather.data,
        forecast.data
      );

      // Add AI response to chat
      const aiMessage: ChatMessage = {
        type: 'ai',
        content: aiResponseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      // Update chat history with AI response
      setChatHistory(prev => [...prev, aiMessage]);
    } catch (err: any) {
      setError(err.message || 'An error occurred while sending your message');
      console.error('Error sending message:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to send a message with an image to the AI
  const sendImageMessage = async (message: string, imageBase64: string) => {
    if (!message.trim() || !imageBase64) return;

    try {
      setIsLoading(true);
      setError(null);

      // Add user message with image to chat
      const userMessage: ChatMessage = {
        type: 'user',
        content: message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        imageUrl: imageBase64,
      };

      // Update chat history with user message
      setChatHistory(prev => [...prev, userMessage]);

      // Generate AI response for the image
      const aiResponseText = await generateImageResponse(
        [...chatHistory, userMessage],
        imageBase64,
        location,
        currentWeather.data
      );

      // Add AI response to chat
      const aiMessage: ChatMessage = {
        type: 'ai',
        content: aiResponseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      // Update chat history with AI response
      setChatHistory(prev => [...prev, aiMessage]);
    } catch (err: any) {
      setError(err.message || 'An error occurred while analyzing your image');
      console.error('Error sending image message:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to clear the chat history
  const clearChat = () => {
    setChatHistory([
      {
        type: 'ai',
        content: '# Maligayang pagdating sa AgriAlert AI Advisor! 👋\n\nNarito ako para magbigay ng personalized na payo sa agrikultura batay sa iyong lokasyon, kondisyon ng panahon, at pangangailangan ng pananim.\n\n**Paano kita matutulungan ngayon?**\n\n* Magtanong tungkol sa pamamahala ng pananim\n* Kumuha ng pagkakakilanlan ng peste at sakit\n* Tumanggap ng mga rekomendasyon batay sa panahon\n* Mag-upload ng mga larawan para sa pagsusuri\n* Kumuha ng payo sa pagtatanim at pag-aani',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const value = {
    chatHistory,
    isLoading,
    error,
    sendMessage,
    sendImageMessage,
    clearChat,
  };

  return (
    <GeminiContext.Provider value={value}>
      {children}
    </GeminiContext.Provider>
  );
};
