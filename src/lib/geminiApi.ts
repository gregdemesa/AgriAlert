import { LocationData } from './LocationContext';
import { CurrentWeather, ForecastDay } from './weatherApi';

// Gemini API base URL
const API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

// API key from environment variables
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Message types
export type MessageRole = 'user' | 'model' | 'system';

export interface Message {
  role: MessageRole;
  content: string;
  timestamp: string;
}

export interface ChatMessage {
  type: 'user' | 'ai' | 'system';
  content: string;
  timestamp: string;
  imageUrl?: string;
}

// Function to generate a chat response from Gemini
export const generateChatResponse = async (
  messages: ChatMessage[],
  location?: LocationData | null,
  weather?: CurrentWeather | null,
  forecast?: ForecastDay[] | null
): Promise<string> => {
  try {
    // Build a prompt from the messages
    let prompt = 'You are an agricultural advisor AI assistant called AgriAlert. ';
    prompt += 'Provide helpful, accurate, and concise advice to farmers about their crops, pests, diseases, and agricultural practices. ';
    prompt += 'Base your advice on scientific knowledge and best practices in agriculture.\n\n';
    prompt += 'Format your responses in a well-structured way using Markdown formatting. Use headings, bullet points, and emphasis where appropriate. ';
    prompt += 'Start with a friendly greeting, then provide your advice in a clear, organized manner. ';
    prompt += 'Use bullet points (*) for lists and recommendations. Use bold (**text**) for important points or headings.\n\n';
    prompt += 'ALWAYS respond in Tagalog (Filipino) language. If the user asks a question in English, translate it to Tagalog in your mind first, then respond in Tagalog.\n\n';

    // Add context about location and weather if available
    if (location && weather) {
      prompt += `The user is located in ${weather.location} where the current weather is ${weather.description} with a temperature of ${weather.temperature}°C.\n`;
    }

    if (forecast && forecast.length > 0) {
      prompt += 'The weather forecast for the next few days is:\n';
      forecast.slice(0, 3).forEach(day => {
        prompt += `${day.day}: ${day.description}, high of ${day.temperature.high}°C, low of ${day.temperature.low}°C.\n`;
      });
      prompt += '\n';
    }

    // Add the conversation history
    prompt += 'Conversation history:\n';
    messages
      .filter(msg => msg.type !== 'system')
      .forEach(msg => {
        prompt += `${msg.type === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
      });

    // Add the final instruction
    prompt += '\nPlease provide a helpful response to the user\'s last message.';

    // Make the API request
    const response = await fetch(
      `${API_BASE_URL}/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Gemini API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();

    // Extract the response text
    const responseText = data.candidates[0]?.content?.parts[0]?.text || 'Sorry, I could not generate a response.';

    return responseText;
  } catch (error) {
    console.error('Error generating chat response:', error);
    return 'Sorry, there was an error processing your request. Please try again later.';
  }
};

// Function to generate a chat response with an image
// Define the crop type for recommendations
interface CropForRecommendation {
  name: string;
  status?: string;
  variety?: string;
  plantingDate?: string;
  harvestDate?: string;
}

// Function to generate agricultural recommendations based on weather and location
export const generateRecommendations = async (
  location?: LocationData | null,
  weather?: CurrentWeather | null,
  forecast?: ForecastDay[] | null,
  crops?: CropForRecommendation[] | null
): Promise<{ id: string; title: string; description: string; priority: 'low' | 'medium' | 'high' }[]> => {
  try {
    // Build a prompt for generating recommendations
    let prompt = 'You are an agricultural advisor AI assistant called AgriAlert. ';
    prompt += 'Generate 3-5 specific, actionable recommendations for farmers based on the current weather conditions, forecast, and crops. ';
    prompt += 'Each recommendation should have a title, description, and priority level (low, medium, or high).\n\n';

    // Add context about location and weather if available
    if (location && weather) {
      prompt += `The user is located in ${weather.location} where the current weather is ${weather.description} with a temperature of ${weather.temperature}°C. `;
      prompt += `The humidity is ${weather.humidity}%, wind speed is ${weather.windSpeed} m/s, and pressure is ${weather.pressure} hPa.\n\n`;
    }

    if (forecast && forecast.length > 0) {
      prompt += 'The weather forecast for the next few days is:\n';
      forecast.slice(0, 3).forEach(day => {
        prompt += `${day.day}: ${day.description}, high of ${day.temperature.high}°C, low of ${day.temperature.low}°C, precipitation probability: ${day.precipitation}%.\n`;
      });
      prompt += '\n';
    }

    // Add information about crops if available
    if (crops && crops.length > 0) {
      prompt += 'The user has the following crops:\n';
      crops.forEach(crop => {
        let cropInfo = `- ${crop.name}`;
        if (crop.variety) cropInfo += ` (Variety: ${crop.variety})`;
        if (crop.status) cropInfo += ` (Status: ${crop.status})`;
        if (crop.plantingDate) cropInfo += ` (Planted: ${crop.plantingDate})`;
        if (crop.harvestDate) cropInfo += ` (Expected Harvest: ${crop.harvestDate})`;
        prompt += cropInfo + '\n';
      });
      prompt += '\n';
    }

    prompt += 'Based on this information, provide 3-5 specific recommendations for actions the farmer should take. ';
    prompt += 'Format your response as a JSON array with objects containing "id", "title", "description", and "priority" fields. ';
    prompt += 'The priority should be one of: "low", "medium", or "high" based on urgency. ';
    prompt += 'Make sure the recommendations are specific, actionable, and directly related to the current conditions. ';
    prompt += 'Example format: [{"id": "1", "title": "Check drainage systems", "description": "Heavy rain expected, ensure all drainage systems are clear to prevent flooding.", "priority": "high"}]\n\n';
    prompt += 'Return ONLY the JSON array without any additional text or explanation.';

    // Make the API request
    const response = await fetch(
      `${API_BASE_URL}/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.2, // Lower temperature for more consistent, factual responses
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Gemini API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();

    // Extract the response text
    const responseText = data.candidates[0]?.content?.parts[0]?.text || '[]';

    // Parse the JSON response
    try {
      // Clean the response text to ensure it's valid JSON
      const cleanedText = responseText.replace(/```json|```/g, '').trim();
      const recommendations = JSON.parse(cleanedText);

      // Validate and format the recommendations
      return recommendations.map((rec: any, index: number) => ({
        id: rec.id || String(index + 1),
        title: rec.title || 'Recommendation',
        description: rec.description || 'No description provided',
        priority: ['low', 'medium', 'high'].includes(rec.priority) ? rec.priority : 'medium',
      })).slice(0, 5); // Limit to 5 recommendations
    } catch (parseError) {
      console.error('Error parsing recommendations JSON:', parseError);
      return [
        {
          id: '1',
          title: 'Error generating recommendations',
          description: 'Unable to generate recommendations based on current data. Please try again later.',
          priority: 'medium',
        }
      ];
    }
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return [
      {
        id: '1',
        title: 'Error generating recommendations',
        description: 'Unable to generate recommendations based on current data. Please try again later.',
        priority: 'medium',
      }
    ];
  }
};

export const generateImageResponse = async (
  messages: ChatMessage[],
  imageBase64: string,
  location?: LocationData | null,
  weather?: CurrentWeather | null
): Promise<string> => {
  try {
    // Get the last user message (the one with the image)
    const lastUserMessage = messages.filter(msg => msg.type === 'user').pop();
    if (!lastUserMessage) {
      throw new Error('No user message found');
    }

    // Build a prompt with context
    let prompt = 'You are an agricultural advisor AI assistant called AgriAlert. ';
    prompt += 'Provide helpful, accurate, and concise advice to farmers about their crops, pests, diseases, and agricultural practices. ';
    prompt += 'Base your advice on scientific knowledge and best practices in agriculture. ';
    prompt += 'You will be analyzing an image of crops, plants, or an agricultural situation.\n\n';
    prompt += 'Format your responses in a well-structured way using Markdown formatting. Use headings, bullet points, and emphasis where appropriate. ';
    prompt += 'Start with a friendly greeting, then provide your analysis of the image in a clear, organized manner. ';
    prompt += 'Use bullet points (*) for lists and recommendations. Use bold (**text**) for important points or headings.\n\n';
    prompt += 'ALWAYS respond in Tagalog (Filipino) language. If the user asks a question in English, translate it to Tagalog in your mind first, then respond in Tagalog.\n\n';

    if (location && weather) {
      prompt += `The user is located in ${weather.location} where the current weather is ${weather.description} with a temperature of ${weather.temperature}°C.\n\n`;
    }

    // Add conversation history (excluding the last message with image)
    prompt += 'Conversation history:\n';
    messages
      .filter(msg => msg.type !== 'system' && msg !== lastUserMessage)
      .forEach(msg => {
        prompt += `${msg.type === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
      });

    // Add the user's question about the image
    prompt += `\nUser's question about the image: ${lastUserMessage.content}\n\n`;
    prompt += 'Please analyze the image and provide a helpful response.';

    // Prepare the image data
    const imageData = imageBase64.replace(/^data:image\/[a-z]+;base64,/, ''); // Remove the data URL prefix

    // Make the API request to the multimodal model
    const response = await fetch(
      `${API_BASE_URL}/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    mimeType: 'image/jpeg',
                    data: imageData
                  }
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Gemini API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();

    // Extract the response text
    const responseText = data.candidates[0]?.content?.parts[0]?.text || 'Sorry, I could not analyze the image.';

    return responseText;
  } catch (error) {
    console.error('Error generating image response:', error);
    return 'Sorry, there was an error processing your image. Please try again later.';
  }
};
