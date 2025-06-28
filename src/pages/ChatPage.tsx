import React, { useState, useRef, useEffect } from 'react';
import Send from 'lucide-react/dist/esm/icons/send';
import Mic from 'lucide-react/dist/esm/icons/mic';
import Paperclip from 'lucide-react/dist/esm/icons/paperclip';
import Download from 'lucide-react/dist/esm/icons/download';
import History from 'lucide-react/dist/esm/icons/history';
import X from 'lucide-react/dist/esm/icons/x';
import FileText from 'lucide-react/dist/esm/icons/file-text';
import Image from 'lucide-react/dist/esm/icons/image';
import Bot from 'lucide-react/dist/esm/icons/bot';
import User from 'lucide-react/dist/esm/icons/user';
import MicOff from 'lucide-react/dist/esm/icons/mic-off';
import Globe from 'lucide-react/dist/esm/icons/globe';
import AlertCircle from 'lucide-react/dist/esm/icons/alert-circle';
import Header from '../components/Header';
import AnimatedSection from '../components/AnimatedSection';
import LanguageSelector from '../components/LanguageSelector';
import useLanguage from '../contexts/useLanguage';
import useAuth from '../contexts/useAuth';
import { SUPPORTED_LANGUAGES, type Language } from '../contexts/languageData';
import { geminiService, type ChatMessage as GeminiChatMessage } from '../services/geminiService';
import { ChatService } from '../services/chatService';
import type { Database } from '../types/database';

type ChatSession = Database['public']['Tables']['chat_sessions']['Row'];
type ChatMessage = Database['public']['Tables']['chat_messages']['Row'];

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  attachments?: FileAttachment[];
  language?: string;
  isError?: boolean;
}

interface FileAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

const ChatPage: React.FC = () => {
  const { selectedLanguage } = useLanguage();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<GeminiChatMessage[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  // Initialize with welcome message and create session
  useEffect(() => {
    const initializeChat = async () => {
      if (!user) return;

      const welcomeMessage = getWelcomeMessage(selectedLanguage.code);
      setMessages([{
        id: '1',
        type: 'bot',
        content: welcomeMessage,
        timestamp: new Date(),
        language: selectedLanguage.code
      }]);

      // Create a new chat session
      const session = await ChatService.createSession(
        user.id, 
        selectedLanguage.code, 
        'New Chat Session'
      );
      
      if (session) {
        setCurrentSession(session);
        // Save welcome message to database
        await ChatService.saveMessage(
          session.id,
          'assistant',
          welcomeMessage,
          selectedLanguage.code
        );
      }

      // Load user's chat sessions
      const sessions = await ChatService.getUserSessions(user.id);
      setChatSessions(sessions);
    };

    initializeChat();
    setConversationHistory([]);
  }, [selectedLanguage, user]);

  // Auto-scroll after user interaction
  useEffect(() => {
    if (hasUserInteracted) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, hasUserInteracted]);

  const getWelcomeMessage = (languageCode: string): string => {
    const welcomeMessages: { [key: string]: string } = {
      'en': "Hello! I'm Vakeel Saab AI, your legal assistant powered by advanced AI. I'm here to help you understand your rights and provide legal guidance. What legal question can I help you with today?",
      'hi': "नमस्ते! मैं वकील साब AI हूं, उन्नत AI द्वारा संचालित आपका कानूनी सहायक। मैं यहां आपके अधिकारों को समझने और कानूनी मार्गदर्शन प्रदान करने के लिए हूं। आज मैं आपकी किस कानूनी समस्या में मदद कर सकता हूं?",
      'ta': "வணக்கம்! நான் வகீல் சாப் AI, மேம்பட்ட AI ஆல் இயக்கப்படும் உங்கள் சட்ட உதவியாளர். உங்கள் உரிமைகளைப் புரிந்துகொள்ளவும் சட்ட வழிகாட்டுதலை வழங்கவும் நான் இங்கே இருக்கிறேன். இன்று நான் உங்களுக்கு எந்த சட்டக் கேள்வியில் உதவ முடியும்?",
      'te': "నమస్కారం! నేను వకీల్ సాబ్ AI, అధునాతన AI చే శక్తివంతం చేయబడిన మీ న్యాయ సహాయకుడను। మీ హక్కులను అర్థం చేసుకోవడంలో మరియు న్యాయ మార్గదర్శకత్వం అందించడంలో సహాయం చేయడానికి నేను ఇక్కడ ఉన్నాను। ఈరోజు నేను మీకు ఏ న్యాయ ప్రశ్నలో సహాయం చేయగలను?",
      'bn': "নমস্কার! আমি ভকিল সাহেব AI, উন্নত AI দ্বারা চালিত আপনার আইনি সহায়ক। আমি এখানে আপনার অধিকারগুলি বুঝতে এবং আইনি নির্দেশনা প্রদান করতে সাহায্য করার জন্য আছি। আজ আমি আপনাকে কোন আইনি প্রশ্নে সাহায্য করতে পারি?",
      'kn': "ನಮಸ್ಕಾರ! ನಾನು ವಕೀಲ್ ಸಾಬ್ AI, ಸುಧಾರಿತ AI ಯಿಂದ ಚಾಲಿತ ನಿಮ್ಮ ಕಾನೂನು ಸಹಾಯಕ. ನಿಮ್ಮ ಹಕ್ಕುಗಳನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಲು ಮತ್ತು ಕಾನೂನು ಮಾರ್ಗದರ್ಶನ ನೀಡಲು ನಾನು ಇಲ್ಲಿದ್ದೇನೆ. ಇಂದು ನಾನು ನಿಮಗೆ ಯಾವ ಕಾನೂನು ಪ್ರಶ್ನೆಯಲ್ಲಿ ಸಹಾಯ ಮಾಡಬಹುದು?",
      'mr': "नमस्कार! मी वकील साहेब AI आहे, प्रगत AI द्वारे चालवलेला तुमचा कायदेशीर सहाय्यक. तुमचे अधिकार समजून घेण्यासाठी आणि कायदेशीर मार्गदर्शन प्रदान करण्यासाठी मी येथे आहे. आज मी तुम्हाला कोणत्या कायदेशीर प्रश्नात मदत करू शकतो?",
      'gu': "નમસ્તે! હું વકીલ સાહેબ AI છું, અદ્યતન AI દ્વારા સંચાલિત તમારો કાનૂની સહાયક. તમારા અધિકારોને સમજવામાં અને કાનૂની માર્ગદર્શન પ્રદાન કરવામાં મદદ કરવા માટે હું અહીં છું. આજે હું તમને કયા કાનૂની પ્રશ્નમાં મદદ કરી શકું?",
      'pa': "ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਵਕੀਲ ਸਾਹਿਬ AI ਹਾਂ, ਉੱਨਤ AI ਦੁਆਰਾ ਸੰਚਾਲਿਤ ਤੁਹਾਡਾ ਕਾਨੂੰਨੀ ਸਹਾਇਕ। ਮੈਂ ਤੁਹਾਡੇ ਅਧਿਕਾਰਾਂ ਨੂੰ ਸਮਝਣ ਅਤੇ ਕਾਨੂੰਨੀ ਮਾਰਗਦਰਸ਼ਨ ਪ੍ਰਦਾਨ ਕਰਨ ਲਈ ਇੱਥੇ ਹਾਂ। ਅੱਜ ਮੈਂ ਤੁਹਾਡੀ ਕਿਸ ਕਾਨੂੰਨੀ ਸਮੱਸਿਆ ਵਿੱਚ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ?",
      'ur': "السلام علیکم! میں وکیل صاحب AI ہوں، جدید AI کے ذریعے چلنے والا آپ کا قانونی معاون۔ میں یہاں آپ کے حقوق کو سمجھنے اور قانونی رہنمائی فراہم کرنے کے لیے ہوں۔ آج میں آپ کے کس قانونی سوال میں مدد کر سکتا ہوں؟"
    };
    
    return welcomeMessages[languageCode] || welcomeMessages['en'];
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !user || !currentSession) return;

    setHasUserInteracted(true);

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');
    setIsTyping(true);

    // Save user message to database
    await ChatService.saveMessage(
      currentSession.id,
      'user',
      currentInput,
      selectedLanguage.code
    );

    try {
      // Generate AI response using Gemini
      const aiResponse = await geminiService.generateResponse(
        currentInput,
        selectedLanguage.code,
        conversationHistory
      );

      // Update conversation history for context
      const newHistory: GeminiChatMessage[] = [
        ...conversationHistory,
        {
          role: 'user',
          parts: [{ text: currentInput }]
        },
        {
          role: 'model',
          parts: [{ text: aiResponse }]
        }
      ];
      setConversationHistory(newHistory);

      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: aiResponse,
        timestamp: new Date(),
        language: selectedLanguage.code
      };

      setMessages(prev => [...prev, botResponse]);

      // Save AI response to database
      await ChatService.saveMessage(
        currentSession.id,
        'assistant',
        aiResponse,
        selectedLanguage.code
      );

      // Update session title if it's the first user message
      if (conversationHistory.length === 0) {
        const title = currentInput.length > 50 
          ? currentInput.substring(0, 50) + '...' 
          : currentInput;
        await ChatService.updateSessionTitle(currentSession.id, title);
        
        // Refresh sessions list
        const sessions = await ChatService.getUserSessions(user.id);
        setChatSessions(sessions);
      }

    } catch (error) {
      console.error('Error generating AI response:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: getErrorMessage(selectedLanguage.code),
        timestamp: new Date(),
        language: selectedLanguage.code,
        isError: true
      };

      setMessages(prev => [...prev, errorMessage]);

      // Save error message to database
      await ChatService.saveMessage(
        currentSession.id,
        'assistant',
        errorMessage.content,
        selectedLanguage.code,
        [],
        true
      );
    } finally {
      setIsTyping(false);
    }
  };

  const getErrorMessage = (languageCode: string): string => {
    const errorMessages: { [key: string]: string } = {
      'en': "I apologize, but I'm experiencing technical difficulties right now. Please try again in a moment, or contact our support team for immediate assistance. For urgent legal matters, please call our 24/7 hotline at 1-800-LEGAL-HELP.",
      'hi': "मुझे खुशी है, लेकिन मैं अभी तकनीकी कठिनाइयों का सामना कर रहा हूं। कृपया एक क्षण में फिर से कोशिश करें, या तत्काल सहायता के लिए हमारी सहायता टीम से संपर्क करें।",
      'ta': "மன்னிக்கவும், நான் இப்போது தொழில்நுட்ப சிக்கல்களை எதிர்கொள்கிறேன். தயவுசெய்து ஒரு கணம் மீண்டும் முயற்சிக்கவும் அல்லது உடனடி உதவிக்கு எங்கள் ஆதரவு குழுவைத் தொடர்பு கொள்ளவும்."
    };
    
    return errorMessages[languageCode] || errorMessages['en'];
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !user || !currentSession) return;

    setHasUserInteracted(true);

    Array.from(files).forEach(async (file) => {
      const attachment: FileAttachment = {
        id: Date.now().toString(),
        name: file.name,
        type: file.type,
        size: file.size,
        url: URL.createObjectURL(file)
      };

      const message: Message = {
        id: Date.now().toString(),
        type: 'user',
        content: `Uploaded: ${file.name}`,
        timestamp: new Date(),
        attachments: [attachment]
      };

      setMessages(prev => [...prev, message]);
      setIsTyping(true);

      // Save file upload message to database
      await ChatService.saveMessage(
        currentSession.id,
        'user',
        `Uploaded: ${file.name}`,
        selectedLanguage.code,
        [attachment]
      );

      try {
        // Generate AI response for file upload
        const aiResponse = await geminiService.generateFileAnalysisResponse(
          file.name,
          selectedLanguage.code
        );

        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          content: aiResponse,
          timestamp: new Date(),
          language: selectedLanguage.code
        };

        setMessages(prev => [...prev, botResponse]);

        // Save AI response to database
        await ChatService.saveMessage(
          currentSession.id,
          'assistant',
          aiResponse,
          selectedLanguage.code
        );
      } catch (error) {
        console.error('Error generating file analysis response:', error);
        
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          content: getErrorMessage(selectedLanguage.code),
          timestamp: new Date(),
          language: selectedLanguage.code,
          isError: true
        };

        setMessages(prev => [...prev, errorMessage]);

        // Save error message to database
        await ChatService.saveMessage(
          currentSession.id,
          'assistant',
          errorMessage.content,
          selectedLanguage.code,
          [],
          true
        );
      } finally {
        setIsTyping(false);
      }
    });

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const audioChunks: Blob[] = [];
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        simulateTranscription();
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Unable to access microphone. Please check your permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const simulateTranscription = () => {
    const sampleTranscriptions = [
      "I have a question about my employment rights",
      "Can you help me understand my lease agreement",
      "What should I do if I was injured in an accident",
      "I need help with a contract dispute"
    ];
    const randomTranscription = sampleTranscriptions[Math.floor(Math.random() * sampleTranscriptions.length)];
    setInputValue(randomTranscription);
  };

  const downloadChat = () => {
    const chatContent = messages.map(msg => 
      `[${msg.timestamp.toLocaleString()}] ${msg.type === 'user' ? 'You' : 'AI Assistant'}: ${msg.content}`
    ).join('\n\n');

    const blob = new Blob([chatContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `legal-chat-${selectedLanguage.code}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const loadChatSession = async (session: ChatSession) => {
    if (!user) return;

    setCurrentSession(session);
    setIsHistoryOpen(false);
    setHasUserInteracted(true);
    setConversationHistory([]);

    // Load messages from database
    const dbMessages = await ChatService.getSessionMessages(session.id);
    
    // Convert database messages to UI messages
    const uiMessages: Message[] = dbMessages.map(msg => ({
      id: msg.id,
      type: msg.role === 'user' ? 'user' : 'bot',
      content: msg.content,
      timestamp: new Date(msg.created_at || ''),
      language: msg.language || undefined,
      attachments: msg.attachments as FileAttachment[] || undefined,
      isError: msg.is_error || false
    }));

    setMessages(uiMessages);
  };

  const createNewSession = async () => {
    if (!user) return;

    const session = await ChatService.createSession(
      user.id,
      selectedLanguage.code,
      'New Chat Session'
    );

    if (session) {
      setCurrentSession(session);
      setMessages([]);
      setConversationHistory([]);
      setHasUserInteracted(false);

      // Add welcome message
      const welcomeMessage = getWelcomeMessage(selectedLanguage.code);
      const welcomeMsg: Message = {
        id: '1',
        type: 'bot',
        content: welcomeMessage,
        timestamp: new Date(),
        language: selectedLanguage.code
      };

      setMessages([welcomeMsg]);

      // Save welcome message to database
      await ChatService.saveMessage(
        session.id,
        'assistant',
        welcomeMessage,
        selectedLanguage.code
      );

      // Refresh sessions list
      const sessions = await ChatService.getUserSessions(user.id);
      setChatSessions(sessions);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-black mb-4">Please Sign In</h2>
          <p className="text-gray-600 mb-6">You need to be signed in to use the chat feature.</p>
          <a href="/login" className="bg-[#B88271] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#a86f5e] transition-all shadow-lg">
            Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <div className="flex-1 flex flex-col px-4 sm:px-6 lg:px-8 py-6 overflow-hidden">
        {/* Chat Header */}
        <AnimatedSection animation="slideInDown" className="mb-6 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-[#B88271] p-3 rounded-lg">
                  <Bot className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-black">Vakeel Saab AI</h1>
                  <p className="text-gray-600">Powered by Gemini AI - Get instant legal guidance</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-sm text-gray-500">Language:</span>
                    <span className="text-sm font-medium" style={{ color: '#B88271' }}>
                      {selectedLanguage.flag} {selectedLanguage.nativeName}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowLanguageSelector(!showLanguageSelector)}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors relative"
                  title="Change Language"
                >
                  <Globe className="h-4 w-4" />
                  <span className="hidden sm:inline">Language</span>
                  
                  {showLanguageSelector && (
                    <div className="absolute top-full right-0 mt-2 z-10">
                      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-80">
                        <LanguageSelector 
                          showLabel={false} 
                          size="sm"
                          className="w-full"
                        />
                        <button
                          onClick={() => setShowLanguageSelector(false)}
                          className="mt-3 w-full bg-[#B88271] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#a86f5e] transition-colors"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  )}
                </button>
                
                <button
                  onClick={() => setIsHistoryOpen(true)}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <History className="h-4 w-4" />
                  <span className="hidden sm:inline">History</span>
                </button>
                <button
                  onClick={downloadChat}
                  className="flex items-center space-x-2 px-4 py-2 bg-[#B88271] text-white rounded-lg hover:bg-[#a86f5e] transition-all shadow-lg"
                >
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Download</span>
                </button>
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* Chat Container */}
        <AnimatedSection animation="fadeIn" delay={200} className="flex-1 bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col overflow-hidden">
          {/* Messages Area */}
          <div className="flex-1 p-8 overflow-y-auto">
            <div className="space-y-8">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-4 max-w-4xl ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                      message.type === 'user' 
                        ? 'bg-[#B88271]' 
                        : message.isError
                        ? 'bg-red-100'
                        : 'bg-gray-100'
                    }`}>
                      {message.type === 'user' ? (
                        <User className="h-6 w-6 text-white" />
                      ) : message.isError ? (
                        <AlertCircle className="h-6 w-6 text-red-600" />
                      ) : (
                        <Bot className="h-6 w-6 text-gray-600" />
                      )}
                    </div>
                    
                    <div className={`rounded-2xl p-6 text-lg leading-relaxed ${
                      message.type === 'user'
                        ? 'bg-[#B88271] text-white'
                        : message.isError
                        ? 'bg-red-50 text-red-800 border border-red-200'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>
                      
                      {message.attachments && (
                        <div className="mt-4 space-y-3">
                          {message.attachments.map((attachment) => (
                            <div key={attachment.id} className="flex items-center space-x-3 p-3 bg-white/20 rounded-lg">
                              {getFileIcon(attachment.type)}
                              <span className="font-medium">{attachment.name}</span>
                              <span className="text-sm opacity-75">({formatFileSize(attachment.size)})</span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between mt-3">
                        <p className="text-sm opacity-75">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                        {message.language && message.type === 'bot' && (
                          <div className="flex items-center space-x-1 text-sm opacity-75">
                            <Globe className="h-3 w-3" />
                            <span>{SUPPORTED_LANGUAGES.find((lang: Language) => lang.code === message.language)?.flag}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-4 max-w-4xl">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                      <Bot className="h-6 w-6 text-gray-600" />
                    </div>
                    <div className="bg-gray-100 rounded-2xl p-6">
                      <div className="flex space-x-2">
                        <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-6 flex-shrink-0">
            <div className="flex items-center space-x-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                className="hidden"
                multiple
              />
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-shrink-0 p-4 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                title="Upload document"
              >
                <Paperclip className="h-6 w-6 text-gray-600" />
              </button>
              
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`flex-shrink-0 p-4 rounded-xl transition-colors ${
                  isRecording 
                    ? 'bg-red-500 text-white hover:bg-red-600' 
                    : 'border border-gray-300 hover:bg-gray-50'
                }`}
                title={isRecording ? "Stop recording" : "Start voice input"}
              >
                {isRecording ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6 text-gray-600" />}
              </button>
              
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                placeholder="Ask me about your legal rights..."
                className="flex-1 px-6 py-4 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B88271] focus:border-transparent"
                disabled={isTyping}
              />
              
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
                className="flex-shrink-0 p-4 bg-[#B88271] text-white rounded-xl hover:bg-[#a86f5e] transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-6 w-6" />
              </button>
            </div>
            
            <p className="text-sm text-gray-500 mt-3 text-center">
              Powered by Gemini AI • This assistant provides general legal information in {selectedLanguage.nativeName}. For specific legal advice, consult with a qualified attorney.
            </p>
          </div>
        </AnimatedSection>
      </div>

      {/* Chat History Sidebar */}
      {isHistoryOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
          <div className="bg-white w-full max-w-md h-full shadow-xl">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-black">Chat History</h2>
                <button
                  onClick={() => setIsHistoryOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto h-full">
              <div className="space-y-4">
                <button
                  onClick={createNewSession}
                  className="w-full p-4 border-2 border-dashed border-[#B88271] text-[#B88271] rounded-lg hover:bg-[#f2e8e5] transition-colors"
                >
                  + Start New Chat
                </button>

                <div
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    currentSession?.id === 'current' 
                      ? 'border-[#B88271] bg-[#f2e8e5]' 
                      : 'border-gray-200 hover:border-[#B88271]'
                  }`}
                >
                  <h3 className="font-medium text-black">Current Session</h3>
                  <p className="text-sm text-gray-600">Active conversation</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-500">
                      {messages.length} messages
                    </p>
                    <span className="text-lg">{selectedLanguage.flag}</span>
                  </div>
                </div>
                
                {chatSessions.map((session) => (
                  <div
                    key={session.id}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      currentSession?.id === session.id 
                        ? 'border-[#B88271] bg-[#f2e8e5]' 
                        : 'border-gray-200 hover:border-[#B88271]'
                    }`}
                    onClick={() => loadChatSession(session)}
                  >
                    <h3 className="font-medium text-black">{session.title || 'Untitled Chat'}</h3>
                    <p className="text-sm text-gray-600">
                      {session.title && session.title.length > 60 
                        ? session.title.substring(0, 60) + '...'
                        : session.title || 'No messages yet'
                      }
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-gray-500">
                        {new Date(session.created_at || '').toLocaleDateString()}
                      </p>
                      <span className="text-lg">
                        {SUPPORTED_LANGUAGES.find((lang: Language) => lang.code === session.language)?.flag}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Language Selector Backdrop */}
      {showLanguageSelector && (
        <div 
          className="fixed inset-0 z-5" 
          onClick={() => setShowLanguageSelector(false)}
        />
      )}
    </div>
  );
};

export default ChatPage;