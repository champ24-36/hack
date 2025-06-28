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
import Header from '../components/Header';
import AnimatedSection from '../components/AnimatedSection';
import LanguageSelector from '../components/LanguageSelector';
import useLanguage from '../contexts/useLanguage';
import { SUPPORTED_LANGUAGES, type Language } from '../contexts/languageData';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  attachments?: FileAttachment[];
  language?: string;
}

interface FileAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

interface ChatSession {
  id: string;
  title: string;
  timestamp: Date;
  messages: Message[];
  language: string;
}

const ChatPage: React.FC = () => {
  const { selectedLanguage } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState('current');
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  // Initialize with welcome message in selected language
  useEffect(() => {
    const welcomeMessage = getWelcomeMessage(selectedLanguage.code);
    setMessages([{
      id: '1',
      type: 'bot',
      content: welcomeMessage,
      timestamp: new Date(),
      language: selectedLanguage.code
    }]);
  }, [selectedLanguage]);

  // Only auto-scroll after user has sent their first message
  useEffect(() => {
    if (hasUserInteracted) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, hasUserInteracted]);

  // Initialize with some sample chat history
  useEffect(() => {
    const sampleSessions: ChatSession[] = [
      {
        id: 'session-1',
        title: 'Employment Rights Question',
        timestamp: new Date(Date.now() - 86400000), // 1 day ago
        language: 'en',
        messages: [
          {
            id: '1',
            type: 'user',
            content: 'Can my employer fire me without notice?',
            timestamp: new Date(Date.now() - 86400000)
          },
          {
            id: '2',
            type: 'bot',
            content: 'Employment termination laws vary by state, but generally, most employment in the US is "at-will," meaning either party can end the relationship at any time. However, there are important exceptions...',
            timestamp: new Date(Date.now() - 86400000),
            language: 'en'
          }
        ]
      },
      {
        id: 'session-2',
        title: 'Tenant Rights Inquiry',
        timestamp: new Date(Date.now() - 172800000), // 2 days ago
        language: 'hi',
        messages: [
          {
            id: '1',
            type: 'user',
            content: 'My landlord wants to increase my rent by 50%. Is this legal?',
            timestamp: new Date(Date.now() - 172800000)
          },
          {
            id: '2',
            type: 'bot',
            content: 'किराया वृद्धि कानून आपके स्थान और पट्टे की शर्तों पर निर्भर करते हैं। अधिकांश क्षेत्रों में, मकान मालिकों को उचित नोटिस देना होगा और स्थानीय किराया नियंत्रण अध्यादेशों का पालन करना होगा...',
            timestamp: new Date(Date.now() - 172800000),
            language: 'hi'
          }
        ]
      }
    ];
    setChatSessions(sampleSessions);
  }, []);

  const getWelcomeMessage = (languageCode: string): string => {
    const welcomeMessages: { [key: string]: string } = {
      'en': "Hello! I'm your AI legal assistant. I'm here to help you understand your rights and provide legal guidance. What legal question can I help you with today?",
      'hi': "नमस्ते! मैं आपका AI कानूनी सहायक हूं। मैं यहां आपके अधिकारों को समझने और कानूनी मार्गदर्शन प्रदान करने के लिए हूं। आज मैं आपकी किस कानूनी समस्या में मदद कर सकता हूं?",
      'ta': "வணக்கம்! நான் உங்கள் AI சட்ட உதவியாளர். உங்கள் உரிமைகளைப் புரிந்துகொள்ளவும் சட்ட வழிகாட்டுதலை வழங்கவும் நான் இங்கே இருக்கிறேன். இன்று நான் உங்களுக்கு எந்த சட்டக் கேள்வியில் உதவ முடியும்?",
      'te': "నమస్కారం! నేను మీ AI న్యాయ సహాయకుడను. మీ హక్కులను అర్థం చేసుకోవడంలో మరియు న్యాయ మార్గదర్శకత్వం అందించడంలో సహాయం చేయడానికి నేను ఇక్కడ ఉన్నాను. ఈరోజు నేను మీకు ఏ న్యాయ ప్రశ్నలో సహాయం చేయగలను?",
      'bn': "নমস্কার! আমি আপনার AI আইনি সহায়ক। আমি এখানে আপনার অধিকারগুলি বুঝতে এবং আইনি নির্দেশনা প্রদান করতে সাহায্য করার জন্য আছি। আজ আমি আপনাকে কোন আইনি প্রশ্নে সাহায্য করতে পারি?",
      'kn': "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ AI ಕಾನೂನು ಸಹಾಯಕ. ನಿಮ್ಮ ಹಕ್ಕುಗಳನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಲು ಮತ್ತು ಕಾನೂನು ಮಾರ್ಗದರ್ಶನ ನೀಡಲು ನಾನು ಇಲ್ಲಿದ್ದೇನೆ. ಇಂದು ನಾನು ನಿಮಗೆ ಯಾವ ಕಾನೂನು ಪ್ರಶ್ನೆಯಲ್ಲಿ ಸಹಾಯ ಮಾಡಬಹುದು?",
      'mr': "नमस्कार! मी तुमचा AI कायदेशीर सहाय्यक आहे. तुमचे अधिकार समजून घेण्यासाठी आणि कायदेशीर मार्गदर्शन प्रदान करण्यासाठी मी येथे आहे. आज मी तुम्हाला कोणत्या कायदेशीर प्रश्नात मदत करू शकतो?",
      'gu': "નમસ્તે! હું તમારો AI કાનૂની સહાયક છું. તમારા અધિકારોને સમજવામાં અને કાનૂની માર્ગદર્શન પ્રદાન કરવામાં મદદ કરવા માટે હું અહીં છું. આજે હું તમને કયા કાનૂની પ્રશ્નમાં મદદ કરી શકું?",
      'pa': "ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਤੁਹਾਡਾ AI ਕਾਨੂੰਨੀ ਸਹਾਇਕ ਹਾਂ। ਮੈਂ ਤੁਹਾਡੇ ਅਧਿਕਾਰਾਂ ਨੂੰ ਸਮਝਣ ਅਤੇ ਕਾਨੂੰਨੀ ਮਾਰਗਦਰਸ਼ਨ ਪ੍ਰਦਾਨ ਕਰਨ ਲਈ ਇੱਥੇ ਹਾਂ। ਅੱਜ ਮੈਂ ਤੁਹਾਡੀ ਕਿਸ ਕਾਨੂੰਨੀ ਸਮੱਸਿਆ ਵਿੱਚ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ?",
      'ur': "السلام علیکم! میں آپ کا AI قانونی معاون ہوں۔ میں یہاں آپ کے حقوق کو سمجھنے اور قانونی رہنمائی فراہم کرنے کے لیے ہوں۔ آج میں آپ کے کس قانونی سوال میں مدد کر سکتا ہوں؟"
    };
    
    return welcomeMessages[languageCode] || welcomeMessages['en'];
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    // Mark that user has interacted
    setHasUserInteracted(true);

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Use requestAnimationFrame for better performance instead of setTimeout
    const startTime = performance.now();
    const checkTime = () => {
      if (performance.now() - startTime >= 1500) {
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          content: generateBotResponse(inputValue, selectedLanguage.code),
          timestamp: new Date(),
          language: selectedLanguage.code
        };
        setMessages(prev => [...prev, botResponse]);
        setIsTyping(false);
      } else {
        requestAnimationFrame(checkTime);
      }
    };
    requestAnimationFrame(checkTime);
  };

  const generateBotResponse = (userInput: string, languageCode: string): string => {
    const input = userInput.toLowerCase();
    
    // Response templates for different languages
    const responses: { [key: string]: { [key: string]: string } } = {
      'en': {
        employment: "I understand you have an employment-related question. Employment law can be complex, but I'm here to help. In general, most employment in the US is 'at-will,' but there are important protections against discrimination, wrongful termination, and violations of labor laws. Could you provide more specific details about your situation so I can give you more targeted guidance?",
        housing: "Housing and tenant rights are crucial protections. Landlord-tenant laws vary significantly by state and locality, but generally include protections around rent increases, eviction procedures, habitability standards, and security deposits. What specific housing issue are you facing? This will help me provide more relevant information about your rights.",
        contract: "Contract law governs agreements between parties. For a contract to be valid, it typically needs offer, acceptance, consideration, and mutual consent. If you're having issues with a contract, I can help you understand your rights and potential remedies. What type of contract are you dealing with, and what specific concerns do you have?",
        family: "Family law matters can be emotionally challenging. Whether dealing with divorce, child custody, support issues, or other family legal matters, it's important to understand your rights and options. Each state has different laws governing family matters. What specific family law issue can I help you understand better?",
        injury: "Personal injury law covers situations where you've been harmed due to someone else's negligence or intentional actions. This can include car accidents, slip and falls, medical malpractice, and more. The key factors are typically duty of care, breach of that duty, causation, and damages. Can you tell me more about the circumstances of your situation?",
        default: "Thank you for your question. I'm here to help you understand your legal rights and options. Legal matters can be complex, and while I can provide general information, it's always advisable to consult with a qualified attorney for specific legal advice. Could you provide more details about your situation so I can offer more targeted guidance? You can also ask me about employment law, housing rights, contracts, family law, personal injury, or any other legal topic."
      },
      'hi': {
        employment: "मैं समझता हूं कि आपका रोजगार संबंधी प्रश्न है। रोजगार कानून जटिल हो सकता है, लेकिन मैं मदद के लिए यहां हूं। सामान्यतः, अमेरिका में अधिकांश रोजगार 'इच्छानुसार' है, लेकिन भेदभाव, गलत तरीके से बर्खास्तगी, और श्रम कानूनों के उल्लंघन के खिलाफ महत्वपूर्ण सुरक्षा है। क्या आप अपनी स्थिति के बारे में अधिक विशिष्ट विवरण दे सकते हैं ताकि मैं आपको अधिक लक्षित मार्गदर्शन दे सकूं?",
        housing: "आवास और किरायेदार अधिकार महत्वपूर्ण सुरक्षा हैं। मकान मालिक-किरायेदार कानून राज्य और स्थानीयता के अनुसार काफी भिन्न होते हैं, लेकिन आम तौर पर किराया वृद्धि, बेदखली प्रक्रियाओं, रहने योग्यता मानकों, और सिक्यूरिटी डिपॉजिट के आसपास सुरक्षा शामिल है। आप किस विशिष्ट आवास समस्या का सामना कर रहे हैं? इससे मुझे आपके अधिकारों के बारे में अधिक प्रासंगिक जानकारी प्रदान करने में मदद मिलेगी।",
        default: "आपके प्रश्न के लिए धन्यवाद। मैं आपके कानूनी अधिकारों और विकल्पों को समझने में आपकी मदद करने के लिए यहां हूं। कानूनी मामले जटिल हो सकते हैं, और जबकि मैं सामान्य जानकारी प्रदान कर सकता हूं, विशिष्ट कानूनी सलाह के लिए हमेशा एक योग्य वकील से सलाह लेना उचित है। क्या आप अपनी स्थिति के बारे में अधिक विवरण दे सकते हैं ताकि मैं अधिक लक्षित मार्गदर्शन दे सकूं?"
      },
      'ta': {
        employment: "உங்களுக்கு வேலைவாய்ப்பு தொடர்பான கேள்வி இருப்பதை நான் புரிந்துகொள்கிறேன். வேலைவாய்ப்பு சட்டம் சிக்கலானதாக இருக்கலாம், ஆனால் நான் உதவ இங்கே இருக்கிறேன். பொதுவாக, அமெரிக்காவில் பெரும்பாலான வேலைவாய்ப்புகள் 'விருப்பப்படி' உள்ளன, ஆனால் பாகுபாடு, தவறான பணிநீக்கம் மற்றும் தொழிலாளர் சட்ட மீறல்களுக்கு எதிராக முக்கியமான பாதுகாப்புகள் உள்ளன। நான் உங்களுக்கு மிகவும் இலக்கு வைத்த வழிகாட்டுதலை வழங்க முடியும் என்பதற்காக உங்கள் நிலைமை பற்றி மிகவும் குறிப்பிட்ட விவரங்களை வழங்க முடியுமா?",
        default: "உங்கள் கேள்விக்கு நன்றி. உங்கள் சட்ட உரிமைகள் மற்றும் விருப்பங்களைப் புரிந்துகொள்ள உதவ நான் இங்கே இருக்கிறேன். சட்ட விஷயங்கள் சிக்கலானதாக இருக்கலாம், நான் பொதுவான தகவல்களை வழங்க முடியும் என்றாலும், குறிப்பிட்ட சட்ட ஆலோசனைக்கு எப்போதும் தகுதியான வழக்கறிஞரை அணுகுவது நல்லது. நான் மிகவும் இலக்கு வைத்த வழிகாட்டுதலை வழங்க முடியும் என்பதற்காக உங்கள் நிலைமை பற்றி மேலும் விவரங்களை வழங்க முடியுமா?"
      }
    };

    const langResponses = responses[languageCode] || responses['en'];
    
    if (input.includes('employment') || input.includes('job') || input.includes('work') || input.includes('fired')) {
      return langResponses.employment || langResponses.default;
    } else if (input.includes('rent') || input.includes('landlord') || input.includes('tenant') || input.includes('eviction')) {
      return langResponses.housing || langResponses.default;
    } else if (input.includes('contract') || input.includes('agreement')) {
      return langResponses.contract || langResponses.default;
    } else if (input.includes('divorce') || input.includes('custody') || input.includes('family')) {
      return langResponses.family || langResponses.default;
    } else if (input.includes('accident') || input.includes('injury') || input.includes('insurance')) {
      return langResponses.injury || langResponses.default;
    } else {
      return langResponses.default;
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    // Mark that user has interacted
    setHasUserInteracted(true);

    Array.from(files).forEach(file => {
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

      // Simulate bot response to file upload using requestAnimationFrame
      const startTime = performance.now();
      const checkTime = () => {
        if (performance.now() - startTime >= 1000) {
          const botResponse: Message = {
            id: (Date.now() + 1).toString(),
            type: 'bot',
            content: generateFileUploadResponse(file.name, selectedLanguage.code),
            timestamp: new Date(),
            language: selectedLanguage.code
          };
          setMessages(prev => [...prev, botResponse]);
        } else {
          requestAnimationFrame(checkTime);
        }
      };
      requestAnimationFrame(checkTime);
    });

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const generateFileUploadResponse = (fileName: string, languageCode: string): string => {
    const responses: { [key: string]: string } = {
      'en': `I've received your document "${fileName}". While I can see that you've uploaded a file, I recommend having important legal documents reviewed by a qualified attorney who can provide specific advice based on the document's contents. Is there anything specific about this document you'd like me to help explain in general terms?`,
      'hi': `मैंने आपका दस्तावेज़ "${fileName}" प्राप्त किया है। जबकि मैं देख सकता हूं कि आपने एक फ़ाइल अपलोड की है, मैं सुझाता हूं कि महत्वपूर्ण कानूनी दस्तावेज़ों की समीक्षा एक योग्य वकील से कराएं जो दस्तावेज़ की सामग्री के आधार पर विशिष्ट सलाह दे सकता है। क्या इस दस्तावेज़ के बारे में कुछ विशिष्ट है जिसे मैं सामान्य शब्दों में समझाने में मदद कर सकता हूं?`,
      'ta': `நான் உங்கள் ஆவணம் "${fileName}" ஐ பெற்றுள்ளேன். நீங்கள் ஒரு கோப்பை பதிவேற்றியுள்ளீர்கள் என்பதை நான் பார்க்க முடிந்தாலும், முக்கியமான சட்ட ஆவணங்களை ஒரு தகுதியான வழக்கறிஞரால் மதிப்பாய்வு செய்ய பரிந்துரைக்கிறேன், அவர் ஆவணத்தின் உள்ளடக்கத்தின் அடிப்படையில் குறிப்பிட்ட ஆலோசனை வழங்க முடியும். இந்த ஆவணத்தைப் பற்றி ஏதேனும் குறிப்பிட்ட விஷயம் உள்ளதா, அதை நான் பொதுவான சொற்களில் விளக்க உதவ முடியுமா?`
    };
    
    return responses[languageCode] || responses['en'];
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
        // In a real implementation, you would send this to a speech-to-text service
        // For demo purposes, we'll simulate transcription
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
    // Simulate speech-to-text transcription
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

  const loadChatSession = (session: ChatSession) => {
    setMessages(session.messages);
    setCurrentSessionId(session.id);
    setIsHistoryOpen(false);
    setHasUserInteracted(true); // Allow scrolling for loaded sessions
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
                  <h1 className="text-2xl font-bold text-black">AI Legal Assistant</h1>
                  <p className="text-gray-600">Get instant legal guidance and understand your rights</p>
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

        {/* Enlarged Chat Container - Takes full remaining height */}
        <AnimatedSection animation="fadeIn" delay={200} className="flex-1 bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col overflow-hidden">
          {/* Messages Area - Much larger now */}
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
                        : 'bg-gray-100'
                    }`}>
                      {message.type === 'user' ? (
                        <User className="h-6 w-6 text-white" />
                      ) : (
                        <Bot className="h-6 w-6 text-gray-600" />
                      )}
                    </div>
                    
                    <div className={`rounded-2xl p-6 text-lg leading-relaxed ${
                      message.type === 'user'
                        ? 'bg-[#B88271] text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      <p className="leading-relaxed">{message.content}</p>
                      
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

          {/* Input Area - Larger and more prominent */}
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
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask me about your legal rights..."
                className="flex-1 px-6 py-4 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B88271] focus:border-transparent"
              />
              
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className="flex-shrink-0 p-4 bg-[#B88271] text-white rounded-xl hover:bg-[#a86f5e] transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-6 w-6" />
              </button>
            </div>
            
            <p className="text-sm text-gray-500 mt-3 text-center">
              This AI assistant provides general legal information in {selectedLanguage.nativeName}. For specific legal advice, consult with a qualified attorney.
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
                <div
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    currentSessionId === 'current' 
                      ? 'border-[#B88271] bg-[#f2e8e5]' 
                      : 'border-gray-200 hover:border-[#B88271]'
                  }`}
                  onClick={() => {
                    setCurrentSessionId('current');
                    setIsHistoryOpen(false);
                  }}
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
                      currentSessionId === session.id 
                        ? 'border-[#B88271] bg-[#f2e8e5]' 
                        : 'border-gray-200 hover:border-[#B88271]'
                    }`}
                    onClick={() => loadChatSession(session)}
                  >
                    <h3 className="font-medium text-black">{session.title}</h3>
                    <p className="text-sm text-gray-600">
                      {session.messages[session.messages.length - 1]?.content.substring(0, 60)}...
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-gray-500">
                        {session.timestamp.toLocaleDateString()} • {session.messages.length} messages
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