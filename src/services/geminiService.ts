interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

interface ChatMessage {
  role: 'user' | 'model';
  parts: Array<{
    text: string;
  }>;
}

class GeminiService {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!this.apiKey) {
      throw new Error('Gemini API key not found in environment variables');
    }
  }

  private createLegalSystemPrompt(language: string): string {
    const prompts: { [key: string]: string } = {
      'en': `You are Vakeel Saab AI, a helpful legal assistant providing general legal information and guidance. 

IMPORTANT GUIDELINES:
- Provide general legal information, not specific legal advice
- Always remind users to consult with a qualified attorney for specific legal matters
- Be empathetic and understanding of users' legal concerns
- Explain legal concepts in simple, accessible language
- Focus on helping users understand their rights and options
- If asked about specific cases, provide general guidance while emphasizing the need for professional consultation
- Be supportive and encouraging while maintaining professional boundaries

AREAS OF EXPERTISE:
- Employment Law (workplace rights, discrimination, wrongful termination)
- Housing & Tenant Rights (landlord disputes, evictions, lease issues)
- Family Law (divorce, custody, domestic relations)
- Business Law (contracts, partnerships, compliance)
- Personal Injury (accidents, compensation claims)
- Criminal Defense (understanding charges and rights)
- Immigration (visas, citizenship, deportation defense)
- Contract Law (understanding agreements and obligations)

Always respond with compassion and clarity, helping users feel empowered to understand and protect their legal rights.`,

      'hi': `आप वकील साब AI हैं, एक सहायक कानूनी सहायक जो सामान्य कानूनी जानकारी और मार्गदर्शन प्रदान करते हैं।

महत्वपूर्ण दिशानिर्देश:
- सामान्य कानूनी जानकारी प्रदान करें, विशिष्ट कानूनी सलाह नहीं
- हमेशा उपयोगकर्ताओं को विशिष्ट कानूनी मामलों के लिए योग्य वकील से सलाह लेने की याद दिलाएं
- उपयोगकर्ताओं की कानूनी चिंताओं के प्रति सहानुभूतिपूर्ण और समझदार बनें
- कानूनी अवधारणाओं को सरल, सुलभ भाषा में समझाएं
- उपयोगकर्ताओं को उनके अधिकारों और विकल्पों को समझने में मदद करने पर ध्यान दें

विशेषज्ञता के क्षेत्र:
- रोजगार कानून, आवास अधिकार, पारिवारिक कानून, व्यापारिक कानून, व्यक्तिगत चोट, आपराधिक बचाव, आप्रवासन, अनुबंध कानून

हमेशा करुणा और स्पष्टता के साथ जवाब दें।`,

      'ta': `நீங்கள் வகீல் சாப் AI, பொதுவான சட்ட தகவல் மற்றும் வழிகாட்டுதலை வழங்கும் ஒரு உதவிகரமான சட்ட உதவியாளர்.

முக்கியமான வழிகாட்டுதல்கள்:
- பொதுவான சட்ட தகவல்களை வழங்கவும், குறிப்பிட்ட சட்ட ஆலோசனை அல்ல
- குறிப்பிட்ட சட்ட விஷயங்களுக்கு தகுதியான வழக்கறிஞரை அணுகுமாறு பயனர்களுக்கு எப்போதும் நினைவூட்டவும்
- பயனர்களின் சட்ட கவலைகளுக்கு அனுதாபம் மற்றும் புரிதலுடன் இருங்கள்
- சட்ட கருத்துக்களை எளிய, அணுகக்கூடிய மொழியில் விளக்கவும்

நிபுணத்துவ பகுதிகள்:
- வேலைவாய்ப்பு சட்டம், வீட்டு உரிமைகள், குடும்ப சட்டம், வணிக சட்டம், தனிப்பட்ட காயம், குற்றவியல் பாதுகாப்பு, குடியேற்றம், ஒப்பந்த சட்டம்

எப்போதும் இரக்கம் மற்றும் தெளிவுடன் பதிலளிக்கவும்.`
    };

    return prompts[language] || prompts['en'];
  }

  async generateResponse(
    userMessage: string, 
    language: string = 'en',
    conversationHistory: ChatMessage[] = []
  ): Promise<string> {
    try {
      const systemPrompt = this.createLegalSystemPrompt(language);
      
      // Build conversation history with system prompt
      const messages: ChatMessage[] = [
        {
          role: 'user',
          parts: [{ text: systemPrompt }]
        },
        {
          role: 'model',
          parts: [{ text: 'I understand. I am Vakeel Saab AI, your legal assistant. I will provide general legal information and guidance while always reminding users to consult with qualified attorneys for specific legal advice. How can I help you understand your legal rights today?' }]
        },
        ...conversationHistory,
        {
          role: 'user',
          parts: [{ text: userMessage }]
        }
      ];

      const requestBody = {
        contents: messages,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      };

      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Gemini API Error:', errorData);
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data: GeminiResponse = await response.json();
      
      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('No response generated from Gemini API');
      }

      const generatedText = data.candidates[0].content.parts[0].text;
      
      // Add a disclaimer if not already present
      const disclaimer = language === 'hi' 
        ? '\n\n⚖️ कृपया ध्यान दें: यह सामान्य कानूनी जानकारी है। विशिष्ट कानूनी सलाह के लिए एक योग्य वकील से सलाह लें।'
        : language === 'ta'
        ? '\n\n⚖️ கவனிக்கவும்: இது பொதுவான சட்ட தகவல். குறிப்பிட்ட சட்ட ஆலோசனைக்கு தகுதியான வழக்கறிஞரை அணுகவும்.'
        : '\n\n⚖️ Please note: This is general legal information. For specific legal advice, please consult with a qualified attorney.';

      return generatedText.includes('⚖️') ? generatedText : generatedText + disclaimer;

    } catch (error) {
      console.error('Error calling Gemini API:', error);
      
      // Fallback response based on language
      const fallbackResponses: { [key: string]: string } = {
        'en': "I apologize, but I'm experiencing technical difficulties right now. Please try again in a moment, or contact our support team for immediate assistance. For urgent legal matters, please call our 24/7 hotline at 1-800-LEGAL-HELP.",
        'hi': "मुझे खुशी है, लेकिन मैं अभी तकनीकी कठिनाइयों का सामना कर रहा हूं। कृपया एक क्षण में फिर से कोशिश करें, या तत्काल सहायता के लिए हमारी सहायता टीम से संपर्क करें।",
        'ta': "மன்னிக்கவும், நான் இப்போது தொழில்நுட்ப சிக்கல்களை எதிர்கொள்கிறேன். தயவுசெய்து ஒரு கணம் மீண்டும் முயற்சிக்கவும் அல்லது உடனடி உதவிக்கு எங்கள் ஆதரவு குழுவைத் தொடர்பு கொள்ளவும்."
      };

      return fallbackResponses[language] || fallbackResponses['en'];
    }
  }

  async generateFileAnalysisResponse(fileName: string, language: string = 'en'): Promise<string> {
    const analysisPrompt = language === 'hi'
      ? `मैंने आपका दस्तावेज़ "${fileName}" प्राप्त किया है। जबकि मैं फ़ाइल की सामग्री को सीधे पढ़ नहीं सकता, मैं आपको सामान्य मार्गदर्शन दे सकता हूं कि कानूनी दस्तावेज़ों की समीक्षा करते समय क्या देखना चाहिए। क्या आप मुझे बता सकते हैं कि यह किस प्रकार का दस्तावेज़ है और आपकी कोई विशिष्ट चिंताएं हैं?`
      : language === 'ta'
      ? `நான் உங்கள் ஆவணம் "${fileName}" ஐ பெற்றுள்ளேன். நான் கோப்பின் உள்ளடக்கத்தை நேரடியாக படிக்க முடியாவிட்டாலும், சட்ட ஆவணங்களை மதிப்பாய்வு செய்யும் போது என்ன பார்க்க வேண்டும் என்பது பற்றி பொதுவான வழிகாட்டுதலை வழங்க முடியும். இது எந்த வகையான ஆவணம் என்றும் உங்களுக்கு ஏதேனும் குறிப்பிட்ட கவலைகள் உள்ளதா என்றும் சொல்ல முடியுமா?`
      : `I've received your document "${fileName}". While I cannot directly read the file contents, I can provide general guidance on what to look for when reviewing legal documents. Could you tell me what type of document this is and if you have any specific concerns about it?`;

    return this.generateResponse(analysisPrompt, language);
  }
}

export const geminiService = new GeminiService();
export type { ChatMessage };