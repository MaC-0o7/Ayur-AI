import axios from 'axios';

// Configure Ollama API endpoint
const OLLAMA_API_URL = 'http://localhost:11434/api/generate';

interface OllamaResponse {
  model: string;
  response: string;
  done: boolean;
}

/**
 * Sends a message to the Ollama API and returns the response
 * @param message - The user's message to send to Ollama
 * @returns The assistant's response text
 */
export const sendMessageToOllama = async (message: string): Promise<string> => {
  try {
    const response = await axios.post(OLLAMA_API_URL, {
      model: 'deepseek-r1:1.5b', // Using deepseek-r1:1.5b model
      prompt: `You are an Ayurvedic health assistant. Answer the following question with helpful, accurate information about Ayurvedic medicine, herbs, treatments, and wellness practices: ${message}`,
      stream: false
    });

    return response.data.response;
  } catch (error) {
    console.error('Error calling Ollama API:', error);
    throw new Error('Failed to get response from Ollama');
  }
};