import { useEffect, useState, useCallback } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:3000');

const ChatComponent = () => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [sessionId, setSessionId] = useState(() => localStorage.getItem('sessionId') || '');

  useEffect(() => {
    if (!sessionId) {
        const newSessionId = 'session-' + Date.now() + '-' + Math.floor(Math.random() * 10000);
      setSessionId(newSessionId);
      localStorage.setItem('sessionId', newSessionId);
    }

    socket.on('bot', (data) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: 'bot', text: data.message },
      ]);
    });

    socket.on('agent', (data) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: 'agent', text: data.message },
      ]);
    });

    return () => {
      socket.off('bot');
      socket.off('agent');
    };
  }, [sessionId]);

  const sendMessage = useCallback(() => {
    if (message.trim()) {
      socket.emit('message', { sessionId, message });

      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: 'user', text: message },
      ]);
      setMessage('');
    }
  }, [message, sessionId]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-center text-blue-600">Chatting</h2>
        <div className="h-64 overflow-y-auto border border-gray-200 rounded p-2 mb-4 space-y-2 bg-gray-50">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`p-2 rounded-lg w-fit max-w-[75%] ${
                msg.sender === 'user'
                  ? 'bg-blue-500 text-white self-end ml-auto'
                  : msg.sender === 'bot'
                  ? 'bg-green-100 text-gray-800'
                  : 'bg-yellow-100 text-gray-800'
              }`}
            >
              {msg.text}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={message}
            onKeyDown={(e) => {
                if (e.key === 'Enter') sendMessage(e.target.value);
              }}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="write your message"
            className="flex-grow px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={sendMessage}
            className="bg-blue-600 text-blue-600 border-2 border-blue-600 px-4 py-2 rounded  transition"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatComponent;
