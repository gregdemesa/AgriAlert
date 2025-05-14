/// <reference types="vite/client" />

// Add Web Speech API types
interface Window {
  SpeechRecognition: any;
  webkitSpeechRecognition: any;
  mozSpeechRecognition: any;
  msSpeechRecognition: any;
}
