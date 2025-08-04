import React, { useState, useRef, useEffect } from 'react';
import { Send, MoreHorizontal, Moon, Sun, Brain, Trash2, History, X, Plus, Download, Star, Globe, MessageCircle, Sparkles } from 'lucide-react';
import '../index.css';

const ChatInterface = () => {
  const [chatSessions, setChatSessions] = useState([
    {
      id: 'session-1',
      name: 'New Chat',
      messages: [
        {
          id: 1,
          type: 'bot',
          content: "Hello! I'm your university AI assistant with advanced memory capabilities. I can remember our conversation and help with follow-up questions. How can I help you today?",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ],
      lastActivity: new Date(),
      context: {}
    }
  ]);
  const [currentSessionId, setCurrentSessionId] = useState('session-1');
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [showMemoryPanel, setShowMemoryPanel] = useState(false);
  const [showChatHistory, setShowChatHistory] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [ratings, setRatings] = useState({});
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Get current session
  const getCurrentSession = () => chatSessions.find(s => s.id === currentSessionId);
  const messages = getCurrentSession()?.messages || [];
  const conversationContext = getCurrentSession()?.context || {};

  // Backend API URL - use environment variable or fallback to localhost
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

  // Language configurations
  const languages = {
    en: { name: 'English', flag: '🇺🇸' },
    tr: { name: 'Türkçe', flag: '🇹🇷' },
    ar: { name: 'العربية', flag: '🇸🇦' },
    fr: { name: 'Français', flag: '🇫🇷' },
    ur: { name: 'اردو', flag: '🇵🇰' },
    fa: { name: 'فارسی', flag: '🇮🇷' }
  };

  // Autocomplete suggestions based on language
  const getAutocompleteData = () => {
    const suggestions = {
      en: [
        "Who is Dr.",
        "What is the email of",
        "Where is the office of",
        "Tell me about",
        "What department is",
        "How can I contact",
        "What are the office hours of",
        "Show me information about",
        "List professors in",
        "What faculty does"
      ],
      tr: [
        "Dr. kim",
        "Hangi bölümde",
        "E-postası nedir",
        "Ofisi nerede",
        "Hakkında bilgi ver",
        "Nasıl iletişim kurabilirim",
        "Ofis saatleri nedir",
        "Profesörlerini listele",
        "Hangi fakültede",
        "İletişim bilgileri"
      ],
      ar: [
        "من هو الدكتور",
        "ما هو البريد الإلكتروني",
        "أين مكتب",
        "أخبرني عن",
        "ما هو القسم",
        "كيف يمكنني الاتصال",
        "ما هي ساعات المكتب",
        "أظهر لي معلومات عن",
        "اذكر الأساتذة في",
        "ما هي الكلية"
      ],
      fr: [
        "Qui est le Dr.",
        "Quel est l'email de",
        "Où est le bureau de",
        "Parlez-moi de",
        "Quel département est",
        "Comment puis-je contacter",
        "Quelles sont les heures de bureau de",
        "Montrez-moi des informations sur",
        "Listez les professeurs dans",
        "Quelle faculté fait"
      ],
      ur: [
        "ڈاکٹر کون ہے",
        "ای میل کیا ہے",
        "دفتر کہاں ہے",
        "کے بارے میں بتائیں",
        "کیا شعبہ ہے",
        "کیسے رابطہ کروں",
        "دفتری اوقات کیا ہیں",
        "کے بارے میں معلومات دکھائیں",
        "میں پروفیسرز کی فہرست",
        "کیا فیکلٹی کرتا"
      ],
      fa: [
        "دکتر کیست",
        "ایمیل چیست",
        "دفتر کجاست",
        "درباره بگویید",
        "چه بخشی است",
        "چگونه تماس بگیرم",
        "ساعات کاری چیست",
        "اطلاعاتی نشان دهید",
        "فهرست اساتید در",
        "چه دانشکده‌ای"
      ]
    };

    return suggestions[currentLanguage] || suggestions.en;
  };

  // Filter suggestions based on input
  const filterSuggestions = (input) => {
    if (!input.trim()) return [];
    const autocompleteData = getAutocompleteData();
    return autocompleteData.filter(suggestion =>
      suggestion.toLowerCase().includes(input.toLowerCase())
    ).slice(0, 5);
  };

  // Check backend connection on component mount
  useEffect(() => {
    checkBackendConnection();
    const interval = setInterval(checkBackendConnection, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  // Handle input changes for autocomplete
  useEffect(() => {
    const filtered = filterSuggestions(inputValue);
    setSuggestions(filtered);
    setShowSuggestions(filtered.length > 0 && inputValue.trim().length > 0);
  }, [inputValue, currentLanguage]);

  const checkBackendConnection = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      if (response.ok) {
        setIsConnected(true);
        console.log('✅ Connected to backend');
      } else {
        setIsConnected(false);
        console.log('❌ Backend not responding');
      }
    } catch (error) {
      setIsConnected(false);
      console.log('❌ Backend connection failed:', error);
    }
  };

  // Create new chat session
  const createNewChatSession = () => {
    const newSessionId = `session-${Date.now()}`;
    const newSession = {
      id: newSessionId,
      name: `Chat ${chatSessions.length + 1}`,
      messages: [
        {
          id: Date.now(),
          type: 'bot',
          content: "Hello! I'm your university AI assistant with advanced memory capabilities. I can remember our conversation and help with follow-up questions. How can I help you today?",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ],
      lastActivity: new Date(),
      context: {}
    };
    
    setChatSessions(prev => [...prev, newSession]);
    setCurrentSessionId(newSessionId);
    setShowChatHistory(false);
  };

  // Switch to different chat session
  const switchToSession = (sessionId) => {
    setCurrentSessionId(sessionId);
    setShowChatHistory(false);
  };

  // Delete chat session
  const deleteChatSession = (sessionId) => {
    if (chatSessions.length === 1) return; // Don't delete if it's the only session
    
    setChatSessions(prev => prev.filter(s => s.id !== sessionId));
    
    if (currentSessionId === sessionId) {
      const remainingSessions = chatSessions.filter(s => s.id !== sessionId);
      setCurrentSessionId(remainingSessions[0]?.id);
    }
  };

  // Update current session
  const updateCurrentSession = (updates) => {
    setChatSessions(prev => prev.map(session => 
      session.id === currentSessionId 
        ? { ...session, ...updates, lastActivity: new Date() }
        : session
    ));
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Update current session with new message
    updateCurrentSession({
      messages: [...messages, userMessage]
    });
    
    setInputValue('');
    setIsTyping(true);
    setShowSuggestions(false);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      if (isConnected) {
        // Send message to backend if connected
        const response = await fetch(`${API_BASE_URL}/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            message: inputValue,
            language: currentLanguage 
          }),
          credentials: 'include',
        });

        const data = await response.json();
        
        // Update context if provided
        if (data.memory && data.memory.context) {
          updateCurrentSession({
            context: data.memory.context
          });
        }
        
        addBotMessage(data.response);
      } else {
        // Fallback to local response if backend not connected
        setTimeout(() => {
          addBotMessage("I understand your message. How else can I assist you?");
        }, 1500);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      addBotMessage("Sorry, I encountered an error. Please try again.");
    }
  };

  const addBotMessage = (content) => {
    const botMessage = {
      id: Date.now() + 1,
      type: 'bot',
      content: content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    
    updateCurrentSession({
      messages: [...messages, botMessage]
    });
    
    setIsTyping(false);
  };

  const startNewChat = async () => {
    createNewChatSession();
    try {
      if (isConnected) {
        await fetch(`${API_BASE_URL}/conversation/clear`, {
          method: 'POST',
          credentials: 'include',
        });
      }
    } catch (error) {
      console.error('Error starting new chat:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const selectSuggestion = (suggestion) => {
    setInputValue(suggestion);
    setShowSuggestions(false);
    textareaRef.current?.focus();
  };

  const rateMessage = (messageId, rating) => {
    setRatings(prev => ({ ...prev, [messageId]: rating }));
  };

  const exportChat = () => {
    const chatContent = messages.map(msg => 
      `[${msg.timestamp}] ${msg.type === 'user' ? 'You' : 'AI'}: ${msg.content}`
    ).join('\n\n');
    
    const blob = new Blob([chatContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  };

  return (
    <div className={`flex h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Chat History Sidebar */}
      <div className={`${showChatHistory ? 'w-80' : 'w-0'} transition-all duration-300 overflow-hidden ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-r`}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Chat History
            </h2>
            <button
              onClick={() => setShowChatHistory(false)}
              className={`p-1 rounded hover:${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}
            >
              <X className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            </button>
          </div>
        </div>
        
        <div className="p-4">
          <button
            onClick={createNewChatSession}
            className={`w-full flex items-center justify-center space-x-2 p-3 rounded-lg border-2 border-dashed ${
              darkMode ? 'border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white' : 
              'border-gray-300 hover:border-gray-400 text-gray-600 hover:text-gray-900'
            } transition-colors`}
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>
        </div>

        <div className="px-4 pb-4 space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
          {chatSessions.map((session) => (
            <div
              key={session.id}
              className={`p-3 rounded-lg cursor-pointer group relative ${
                session.id === currentSessionId 
                  ? (darkMode ? 'bg-blue-900 border-blue-700' : 'bg-blue-50 border-blue-200') 
                  : (darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50')
              } border transition-colors`}
              onClick={() => switchToSession(session.id)}
            >
              <div className="flex items-center space-x-2">
                <MessageCircle className={`w-4 h-4 ${
                  session.id === currentSessionId 
                    ? (darkMode ? 'text-blue-400' : 'text-blue-600') 
                    : (darkMode ? 'text-gray-400' : 'text-gray-500')
                }`} />
                <span className={`text-sm font-medium truncate ${
                  session.id === currentSessionId 
                    ? (darkMode ? 'text-blue-100' : 'text-blue-900') 
                    : (darkMode ? 'text-gray-200' : 'text-gray-700')
                }`}>
                  {session.name}
                </span>
              </div>
              <p className={`text-xs mt-1 truncate ${
                session.id === currentSessionId 
                  ? (darkMode ? 'text-blue-300' : 'text-blue-700') 
                  : (darkMode ? 'text-gray-400' : 'text-gray-500')
              }`}>
                {session.messages[session.messages.length - 1]?.content || 'No messages'}
              </p>
              <p className={`text-xs mt-1 ${
                session.id === currentSessionId 
                  ? (darkMode ? 'text-blue-400' : 'text-blue-600') 
                  : (darkMode ? 'text-gray-500' : 'text-gray-400')
              }`}>
                {new Date(session.lastActivity).toLocaleDateString()}
              </p>
              
              {chatSessions.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteChatSession(session.id);
                  }}
                  className={`absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 rounded hover:${
                    darkMode ? 'bg-gray-600' : 'bg-gray-200'
                  } transition-opacity`}
                >
                  <Trash2 className="w-3 h-3 text-red-500" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className={`px-6 py-4 flex items-center justify-between ${darkMode ? 'bg-gray-800' : 'bg-white'} border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowChatHistory(!showChatHistory)}
              className={`p-2 rounded-full hover:${darkMode ? 'bg-gray-700' : 'bg-gray-100'} transition-colors`}
              title="Chat History"
            >
              <MessageCircle className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            </button>
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                AI Chat Assistant
              </h1>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {isConnected ? '🟢 Connected to server' : '🔴 Working offline'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {/* Memory Controls */}
            <div className="flex items-center space-x-2">
              <button
                onClick={startNewChat}
                className={`p-2 rounded-full hover:${
                  darkMode ? 'bg-gray-700' : 'bg-gray-100'
                }`}
                title="New Chat"
              >
                <Plus className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              </button>
              <button
                onClick={() => setShowMemoryPanel(!showMemoryPanel)}
                className={`p-2 rounded-full hover:${
                  darkMode ? 'bg-gray-700' : 'bg-gray-100'
                } ${showMemoryPanel ? (darkMode ? 'bg-gray-700' : 'bg-gray-100') : ''}`}
                title="Memory Panel"
              >
                <Brain className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              </button>
              <button
                onClick={startNewChat}
                className={`p-2 rounded-full hover:${
                  darkMode ? 'bg-gray-700' : 'bg-gray-100'
                }`}
                title="Clear Conversation"
              >
                <Trash2 className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              </button>
            </div>
            
            {/* Theme Toggle */}
            <div className="flex items-center space-x-2">
              <Sun className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-yellow-500'}`} />
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  darkMode ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    darkMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <Moon className={`w-4 h-4 ${darkMode ? 'text-blue-400' : 'text-gray-400'}`} />
            </div>
          </div>
        </div>

        {/* Messages */}
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`flex items-start space-x-2 max-w-xs lg:max-w-md ${
                  message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                {message.type === 'bot' && (
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                )}
                <div
                  className={`rounded-lg px-4 py-2 ${
                    message.type === 'user'
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                      : darkMode
                      ? 'bg-gray-800 text-white border border-gray-700 shadow-md'
                      : 'bg-white text-gray-900 border border-gray-200 shadow-sm'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <div className="flex items-center justify-between mt-2">
                    <p
                      className={`text-xs ${
                        message.type === 'user'
                          ? 'text-blue-100'
                          : darkMode
                          ? 'text-gray-400'
                          : 'text-gray-500'
                      }`}
                    >
                      {message.timestamp}
                    </p>
                    {/* Rating for bot messages */}
                    {message.type === 'bot' && (
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => rateMessage(message.id, star)}
                            className={`text-xs hover:scale-110 transition-transform ${
                              ratings[message.id] >= star ? 'text-yellow-400' : 
                              darkMode ? 'text-gray-600' : 'text-gray-300'
                            }`}
                          >
                            <Star className="w-3 h-3 fill-current" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-2 max-w-xs lg:max-w-md">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className={`rounded-lg px-4 py-2 ${
                  darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900 border border-gray-200'
                }`}>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Memory Panel */}
        {showMemoryPanel && (
          <div className={`mx-6 mb-4 p-4 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
            <h3 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Conversation Memory
            </h3>
            {Object.keys(conversationContext).length > 0 ? (
              <div className="space-y-2">
                {Object.entries(conversationContext).map(([key, value]) => (
                  <div key={key} className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    <span className="font-medium">{key}:</span> {String(value)}
                  </div>
                ))}
              </div>
            ) : (
              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <p>No conversation context yet. Start chatting to see how I remember details!</p>
                <div className="mt-2 space-y-1">
                  <div className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                    • Try: "Who is Dr. Niyazi?" then "What's his email?"
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Input */}
        <div className="px-6 py-4">
          {/* Language Selector and Export Button */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <button
                  onClick={() => setShowSuggestions(!showSuggestions)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg border ${
                    darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'
                  } hover:border-blue-500 transition-colors`}
                >
                  <Globe className="w-4 h-4" />
                  <span className="text-sm">{languages[currentLanguage].flag} {languages[currentLanguage].name}</span>
                </button>
                
                {/* Language Dropdown */}
                {showSuggestions && (
                  <div className={`absolute bottom-full mb-1 left-0 w-40 rounded-lg border shadow-lg z-10 ${
                    darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
                  }`}>
                    {Object.entries(languages).map(([code, lang]) => (
                      <button
                        key={code}
                        onClick={() => {
                          setCurrentLanguage(code);
                          setShowSuggestions(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-sm hover:${
                          darkMode ? 'bg-gray-700' : 'bg-gray-50'
                        } ${code === currentLanguage ? (darkMode ? 'bg-gray-700' : 'bg-gray-50') : ''}`}
                      >
                        {lang.flag} {lang.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <button
              onClick={exportChat}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg border ${
                darkMode ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700' : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
              } transition-colors`}
            >
              <Download className="w-4 h-4" />
              <span className="text-sm">Export Chat</span>
            </button>
          </div>

          {/* Autocomplete Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div className={`mb-3 p-3 rounded-lg border ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
            }`}>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => selectSuggestion(suggestion)}
                    className={`px-3 py-1 text-sm rounded-full ${
                      darkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    } transition-colors`}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message Input */}
          <div className={`flex items-end space-x-3 p-3 rounded-lg border ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
          }`}>
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                adjustTextareaHeight();
              }}
              onKeyPress={handleKeyPress}
              placeholder={`Type your message in ${languages[currentLanguage].name}...`}
              className={`flex-1 bg-transparent border-none outline-none resize-none ${
                darkMode ? 'text-white placeholder-gray-400' : 'text-gray-900 placeholder-gray-500'
              }`}
              rows="1"
              style={{
                minHeight: '24px',
                maxHeight: '120px',
                lineHeight: '1.5',
              }}
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim()}
              className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 transition-all shadow-md"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
