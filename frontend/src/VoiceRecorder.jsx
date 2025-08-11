import { useState, useRef } from 'react';

const VoiceRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const [response, setResponse] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef(null);

  // Check if browser supports speech recognition
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  const startRecording = () => {
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsRecording(true);
      setTranscript('');
      setResponse('');
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      
      if (finalTranscript) {
        setTranscript(finalTranscript);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
  };

  const clearTranscript = () => {
    setTranscript('');
    setResponse('');
  };

  const sendToBackend = async () => {
    if (!transcript) return;

    setIsProcessing(true);
    try {
      const response = await fetch('http://localhost:3001/api/parse-symptoms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcript }),
      });

      const data = await response.json();
      setResponse(JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Error sending to backend:', error);
      setResponse('❌ Error connecting to backend. Make sure the server is running on port 3001.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isSupported) {
    return (
      <div className="container">
        <div className="not-supported">
          <h2>🚫 Speech Recognition Not Supported</h2>
          <p>Your browser doesn't support speech recognition. Please try Chrome, Edge, or Safari.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Header */}
      <div className="header">
        <h1 className="title">🎤 VoiceVitals</h1>
        <p className="subtitle">Track your health with voice - simply speak your symptoms and medications</p>
      </div>

      {/* Voice Controls */}
      <div className="voice-controls">
        <div className="recording-area">
          <button 
            onClick={isRecording ? stopRecording : startRecording}
            className={`voice-button ${isRecording ? 'recording' : ''}`}
            disabled={isProcessing}
          >
            {isRecording ? '🛑' : '🎤'}
            <div className="button-text">
              {isRecording ? 'Stop' : 'Start'}
            </div>
          </button>
          
          {isRecording && (
            <div className="recording-status">
              <div className="recording-dot"></div>
              Recording... Speak now!
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {transcript && (
          <div className="action-buttons">
            <button 
              onClick={sendToBackend}
              className="action-button send-button"
              disabled={isProcessing || !transcript}
            >
              {isProcessing ? '⏳' : '🚀'} 
              {isProcessing ? 'Processing...' : 'Analyze with AI'}
            </button>
            <button 
              onClick={clearTranscript}
              className="action-button clear-button"
              disabled={isProcessing}
            >
              �️ Clear
            </button>
          </div>
        )}
      </div>

      {/* Transcript Display */}
      <div className="transcript-section">
        <h3 className="section-title">
          📝 What you said:
        </h3>
        <div className="transcript-box">
          {transcript || (
            <div className="transcript-placeholder">
              Your speech will appear here...
            </div>
          )}
        </div>
      </div>

      {/* Backend Response */}
      {response && (
        <div className="response-section">
          <h3 className="section-title">
            🤖 AI Analysis:
          </h3>
          <div className="response-box">
            {response}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="instructions">
        <h3>💡 How to use VoiceVitals:</h3>
        <ul>
          <li>Click the microphone button to start recording</li>
          <li>Speak clearly about your symptoms or medications</li>
          <li>Example: "I have a headache and took 2 aspirin at 3pm"</li>
          <li>Click "Stop" when finished speaking</li>
          <li>Click "Analyze with AI" to process your input</li>
        </ul>
      </div>
    </div>
  );
};

export default VoiceRecorder;
