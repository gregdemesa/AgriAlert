// Speech-to-Text service using the Web Speech API
// This service provides functionality to convert speech to text using the browser's built-in capabilities

// Define types for our speech recognition service
export interface SpeechRecognitionResult {
  transcript: string;
  isFinal: boolean;
}

export interface SpeechRecognitionError {
  error: string;
  message: string;
}

// Define event callbacks
export type OnResultCallback = (result: SpeechRecognitionResult) => void;
export type OnErrorCallback = (error: SpeechRecognitionError) => void;
export type OnStartCallback = () => void;
export type OnEndCallback = () => void;

// Define the SpeechRecognition type for TypeScript
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onstart: () => void;
  onend: () => void;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message: string;
}

// Get the Speech Recognition API (with browser prefixes for compatibility)
const SpeechRecognitionAPI = window.SpeechRecognition ||
                            (window as any).webkitSpeechRecognition ||
                            (window as any).mozSpeechRecognition ||
                            (window as any).msSpeechRecognition;

// Class to handle speech recognition
export class SpeechToTextService {
  private recognition: SpeechRecognition | null = null;
  private isListening: boolean = false;
  private onResultCallback: OnResultCallback | null = null;
  private onErrorCallback: OnErrorCallback | null = null;
  private onStartCallback: OnStartCallback | null = null;
  private onEndCallback: OnEndCallback | null = null;

  constructor() {
    // Check if the browser supports speech recognition
    if (!SpeechRecognitionAPI) {
      console.error('Speech recognition is not supported in this browser.');
      return;
    }

    // Initialize the speech recognition
    this.recognition = new SpeechRecognitionAPI();
    this.recognition.continuous = true; // Keep listening until explicitly stopped
    this.recognition.interimResults = true; // Get interim results as the user speaks
    this.recognition.lang = ''; // Empty string allows for auto language detection
    this.recognition.maxAlternatives = 1; // Get only the most likely result

    // Set up event handlers
    this.recognition.onresult = this.handleResult.bind(this);
    this.recognition.onerror = this.handleError.bind(this);
    this.recognition.onstart = this.handleStart.bind(this);
    this.recognition.onend = this.handleEnd.bind(this);
  }

  // Start listening for speech
  public startListening(): boolean {
    if (!this.recognition) {
      console.error('Speech recognition is not supported in this browser.');
      return false;
    }

    if (this.isListening) {
      return true; // Already listening
    }

    try {
      this.recognition.start();
      return true;
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      return false;
    }
  }

  // Stop listening for speech
  public stopListening(): void {
    if (!this.recognition || !this.isListening) {
      return;
    }

    // Set isListening to false BEFORE stopping
    // This prevents the handleEnd method from restarting recognition
    this.isListening = false;

    try {
      this.recognition.stop();
    } catch (error) {
      console.error('Error stopping speech recognition:', error);
    }
  }

  // Set the callback for when a result is received
  public onResult(callback: OnResultCallback): void {
    this.onResultCallback = callback;
  }

  // Set the callback for when an error occurs
  public onError(callback: OnErrorCallback): void {
    this.onErrorCallback = callback;
  }

  // Set the callback for when recognition starts
  public onStart(callback: OnStartCallback): void {
    this.onStartCallback = callback;
  }

  // Set the callback for when recognition ends
  public onEnd(callback: OnEndCallback): void {
    this.onEndCallback = callback;
  }

  // Handle speech recognition results
  private handleResult(event: SpeechRecognitionEvent): void {
    if (!event.results || event.resultIndex >= event.results.length) {
      return;
    }

    const result = event.results[event.resultIndex];
    if (!result || result.length === 0) {
      return;
    }

    const transcript = result[0].transcript;
    const isFinal = result.isFinal;

    if (this.onResultCallback) {
      this.onResultCallback({ transcript, isFinal });
    }
  }

  // Handle speech recognition errors
  private handleError(event: SpeechRecognitionErrorEvent): void {
    if (this.onErrorCallback) {
      this.onErrorCallback({
        error: event.error,
        message: event.message || this.getErrorMessage(event.error),
      });
    }
  }

  // Handle speech recognition start
  private handleStart(): void {
    this.isListening = true;
    if (this.onStartCallback) {
      this.onStartCallback();
    }
  }

  // Handle speech recognition end
  private handleEnd(): void {
    // Only set isListening to false if we explicitly stopped listening
    // Otherwise, restart recognition to keep it going continuously
    if (this.isListening) {
      try {
        // Restart recognition if it ended unexpectedly
        this.recognition?.start();
      } catch (error) {
        console.error('Error restarting speech recognition:', error);
        this.isListening = false;
        if (this.onEndCallback) {
          this.onEndCallback();
        }
      }
    } else {
      if (this.onEndCallback) {
        this.onEndCallback();
      }
    }
  }

  // Get a user-friendly error message
  private getErrorMessage(error: string): string {
    switch (error) {
      case 'no-speech':
        return 'No speech was detected. Please try again.';
      case 'aborted':
        return 'Speech recognition was aborted.';
      case 'audio-capture':
        return 'Audio capture failed. Please check your microphone.';
      case 'network':
        return 'Network error occurred. Please check your internet connection.';
      case 'not-allowed':
        return 'Microphone access was not allowed. Please allow microphone access.';
      case 'service-not-allowed':
        return 'Speech recognition service is not allowed. Please try again later.';
      case 'bad-grammar':
        return 'Grammar error occurred. Please try again.';
      case 'language-not-supported':
        return 'Language is not supported. Please try a different language.';
      default:
        return `An unknown error occurred: ${error}`;
    }
  }
}

// Create and export a singleton instance
const speechToTextService = new SpeechToTextService();
export default speechToTextService;
