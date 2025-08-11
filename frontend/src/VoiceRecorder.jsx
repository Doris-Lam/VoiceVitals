import { useState, useRef } from 'react';

const VoiceRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const [response, setResponse] = useState('');
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

  const sendToBackend = async () => {
    if (!transcript) return;

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
      setResponse('Error connecting to backend');
    }
  };

  if (!isSupported) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Speech Recognition Not Supported</h2>
        <p>Your browser doesn't support speech recognition. Please try Chrome or Edge.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>VoiceVitals - Voice Health Tracker</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={isRecording ? stopRecording : startRecording}
          style={{
            padding: '15px 30px',
            fontSize: '18px',
            backgroundColor: isRecording ? '#ff4444' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          {isRecording ? '🛑 Stop Recording' : '🎤 Start Recording'}
        </button>
        
        {transcript && (
          <button 
            onClick={sendToBackend}
            style={{
              padding: '15px 30px',
              fontSize: '18px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            📤 Send to Backend
          </button>
        )}
      </div>

      {isRecording && (
        <div style={{ color: '#ff4444', marginBottom: '10px' }}>
          🔴 Recording... Speak now!
        </div>
      )}

      {transcript && (
        <div style={{ marginBottom: '20px' }}>
          <h3>What you said:</h3>
          <div style={{
            padding: '15px',
            backgroundColor: '#f5f5f5',
            borderRadius: '8px',
            border: '1px solid #ddd'
          }}>
            {transcript}
          </div>
        </div>
      )}

      {response && (
        <div style={{ marginBottom: '20px' }}>
          <h3>Backend Response:</h3>
          <pre style={{
            padding: '15px',
            backgroundColor: '#f0f8ff',
            borderRadius: '8px',
            border: '1px solid #ddd',
            overflow: 'auto'
          }}>
            {response}
          </pre>
        </div>
      )}

      <div style={{ marginTop: '30px', fontSize: '14px', color: '#666' }}>
        <p><strong>Instructions:</strong></p>
        <ul>
          <li>Click "Start Recording" and speak about your symptoms or medications</li>
          <li>Click "Stop Recording" when finished</li>
          <li>Click "Send to Backend" to process your speech with AI</li>
        </ul>
      </div>
    </div>
  );
};

export default VoiceRecorder;
