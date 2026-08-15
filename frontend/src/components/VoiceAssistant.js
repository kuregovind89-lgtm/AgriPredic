import React, { useState } from "react";
import { FiMic, FiMicOff } from "react-icons/fi";

/*
 * Voice assistant built on the browser's native Web Speech API
 * (SpeechRecognition + SpeechSynthesis) -- works fully offline of any
 * paid service, in Chrome/Edge. Supports English and Marathi.
 * Extend the intents map below to wire up more commands
 * (e.g. sendPrompt-style navigation, reading out prediction results).
 */
const LANG_MAP = { en: "en-IN", mr: "mr-IN" };

const RESPONSES = {
  en: {
    greeting: "Hello farmer! How can I help you today?",
    unknown: "Sorry, I did not understand that. Try saying 'upload image' or 'show weather'.",
    upload: "Opening the disease detection page for you.",
    weather: "Opening weather risk page for you.",
    history: "Opening your crop history.",
  },
  mr: {
    greeting: "नमस्कार शेतकरी! मी आपली कशी मदत करू शकतो?",
    unknown: "माफ करा, मला ते समजले नाही. 'फोटो अपलोड करा' किंवा 'हवामान दाखवा' असे बोलून पहा.",
    upload: "रोग तपासणी पान उघडत आहे.",
    weather: "हवामान जोखीम पान उघडत आहे.",
    history: "आपला पीक इतिहास उघडत आहे.",
  },
};

export default function VoiceAssistant() {
  const [lang, setLang] = useState("en");
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const supported = typeof window !== "undefined" &&
    (window.SpeechRecognition || window.webkitSpeechRecognition);

  const speak = (text) => {
    if (!window.speechSynthesis) return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = LANG_MAP[lang];
    window.speechSynthesis.speak(utter);
  };

  const handleCommand = (text) => {
    const lower = text.toLowerCase();
    const r = RESPONSES[lang];
    if (lower.includes("upload") || lower.includes("फोटो")) {
      speak(r.upload);
      window.location.href = "/upload";
    } else if (lower.includes("weather") || lower.includes("हवामान")) {
      speak(r.weather);
      window.location.href = "/weather";
    } else if (lower.includes("history") || lower.includes("इतिहास")) {
      speak(r.history);
      window.location.href = "/history";
    } else {
      speak(r.unknown);
    }
  };

  const startListening = () => {
    if (!supported) {
      speak(RESPONSES[lang].unknown);
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = LANG_MAP[lang];
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setListening(true);
    speak(RESPONSES[lang].greeting);

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      handleCommand(text);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognition.start();
  };

  return (
    <div className="voice-assistant">
      <select
        value={lang}
        onChange={(e) => setLang(e.target.value)}
        className="voice-lang-select"
        title="Voice assistant language"
      >
        <option value="en">EN</option>
        <option value="mr">मराठी</option>
      </select>
      <button
        className={`icon-toggle ${listening ? "listening" : ""}`}
        onClick={startListening}
        title="Voice assistant"
      >
        {listening ? <FiMicOff /> : <FiMic />}
      </button>
      {transcript && <span className="voice-transcript">"{transcript}"</span>}
    </div>
  );
}
