import { NextRequest, NextResponse } from "next/server";

// Function to extract plain text from document JSON structure
const extractTextFromDocument = (text: string): string => {
  try {
    // Check if the input is JSON
    if (text.trim().startsWith('[') || text.trim().startsWith('{')) {
      const parsed = JSON.parse(text);
      
      // Handle array of blocks (BlockNote format)
      if (Array.isArray(parsed)) {
        const textParts: string[] = [];
        
        for (const block of parsed) {
          if (block.content && Array.isArray(block.content)) {
            for (const contentItem of block.content) {
              if (contentItem.type === 'text' && contentItem.text) {
                textParts.push(contentItem.text);
              }
            }
          }
          // Also check for direct text property in block
          if (block.text) {
            textParts.push(block.text);
          }
        }
        
        const extractedText = textParts.join(' ').trim();
        console.log(`Extracted text from JSON array: "${extractedText}"`);
        return extractedText;
      }
      
      // Handle single block
      if (parsed.content && Array.isArray(parsed.content)) {
        const textParts: string[] = [];
        for (const contentItem of parsed.content) {
          if (contentItem.type === 'text' && contentItem.text) {
            textParts.push(contentItem.text);
          }
        }
        const extractedText = textParts.join(' ').trim();
        console.log(`Extracted text from single block: "${extractedText}"`);
        return extractedText;
      }
      
      // Handle direct text property
      if (parsed.text) {
        console.log(`Extracted text from direct property: "${parsed.text}"`);
        return parsed.text;
      }
    }
    
    // If not JSON or no text found, return original
    console.log(`Using original text: "${text}"`);
    return text;
  } catch (error) {
    // If JSON parsing fails, return original text
    console.log("Failed to parse JSON, using original text:", error);
    return text;
  }
};

// Function to split text into very small chunks to avoid length limits
const splitTextIntoSmallChunks = (text: string, maxChunkSize: number = 400): string[] => {
  // First split by sentences
  const sentences = text.split(/(?<=[.!?])\s+/);
  const chunks: string[] = [];
  let currentChunk = "";

  for (const sentence of sentences) {
    // If adding this sentence would exceed the limit, start a new chunk
    if ((currentChunk + sentence).length > maxChunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += (currentChunk ? " " : "") + sentence;
    }
  }

  // Add the last chunk if it has content
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  // If we still have chunks that are too long, split them further by words
  const finalChunks: string[] = [];
  for (const chunk of chunks) {
    if (chunk.length <= maxChunkSize) {
      finalChunks.push(chunk);
    } else {
      // Split long chunks by words
      const words = chunk.split(/\s+/);
      let wordChunk = "";
      for (const word of words) {
        if ((wordChunk + word).length > maxChunkSize && wordChunk.length > 0) {
          finalChunks.push(wordChunk.trim());
          wordChunk = word;
        } else {
          wordChunk += (wordChunk ? " " : "") + word;
        }
      }
      if (wordChunk.trim()) {
        finalChunks.push(wordChunk.trim());
      }
    }
  }

  return finalChunks.length > 0 ? finalChunks : [text.substring(0, maxChunkSize)];
};

// Advanced translation service using multiple free APIs with very small chunks
const translateWithAdvancedService = async (text: string, targetLang: string) => {
  try {
    // Map our language names to language codes
    const languageMap: Record<string, string> = {
      "Hindi": "hi",
      "Spanish": "es", 
      "French": "fr",
      "German": "de",
      "Italian": "it",
      "Portuguese": "pt",
      "Russian": "ru",
      "Japanese": "ja",
      "Korean": "ko",
      "Chinese": "zh",
      "Arabic": "ar",
      "Dutch": "nl",
      "Swedish": "sv",
      "Norwegian": "no",
      "Danish": "da",
      "Finnish": "fi",
      "Polish": "pl",
      "Turkish": "tr",
      "Greek": "el",
      "Hebrew": "he"
    };

    const targetCode = languageMap[targetLang];
    if (!targetCode) {
      throw new Error(`Language ${targetLang} not supported`);
    }

    // Split text into very small chunks to avoid length limits
    const textChunks = splitTextIntoSmallChunks(text, 400); // Much smaller chunks
    const translatedChunks: string[] = [];

    console.log(`Processing ${textChunks.length} chunks for translation`);

    // Translate each chunk
    for (let i = 0; i < textChunks.length; i++) {
      const chunk = textChunks[i];
      let translatedChunk = "";

      console.log(`Translating chunk ${i + 1}/${textChunks.length} (${chunk.length} chars): "${chunk}"`);

      // Try multiple translation services for each chunk
      const services = [
        // Service 1: MyMemory Translation API (free, reliable, handles small chunks well)
        async () => {
          const response = await fetch(
            `https://api.mymemory.translated.net/get?q=${encodeURIComponent(chunk)}&langpair=en|${targetCode}`
          );
          if (!response.ok) throw new Error("MyMemory service failed");
          const data = await response.json();
          return data.responseData?.translatedText || chunk;
        },
        
        // Service 2: Google Translate API (free tier, handles small chunks)
        async () => {
          const response = await fetch(
            `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetCode}&dt=t&q=${encodeURIComponent(chunk)}`
          );
          if (!response.ok) throw new Error("Google Translate service failed");
          const data = await response.json();
          return data[0]?.map((item: any) => item[0]).join('') || chunk;
        },
        
        // Service 3: LibreTranslate alternative endpoint (small chunks)
        async () => {
          const response = await fetch("https://translate.argosopentech.com/translate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              q: chunk,
              source: "en",
              target: targetCode
            }),
          });
          if (!response.ok) throw new Error("LibreTranslate service failed");
          const data = await response.json();
          return data.translatedText || chunk;
        }
      ];

      // Try each service until one works
      for (let j = 0; j < services.length; j++) {
        try {
          translatedChunk = await services[j]();
          if (translatedChunk && translatedChunk.trim()) {
            console.log(`Chunk ${i + 1} translated successfully with service ${j + 1}: "${translatedChunk}"`);
            break;
          }
        } catch (error) {
          console.log(`Translation service ${j + 1} failed for chunk ${i + 1}:`, error);
          continue;
        }
      }

      // If all services failed, use the original chunk
      if (!translatedChunk || !translatedChunk.trim()) {
        console.log(`All services failed for chunk ${i + 1}, using original: "${chunk}"`);
        translatedChunk = chunk;
      }

      translatedChunks.push(translatedChunk);
    }

    // Combine all translated chunks
    const result = translatedChunks.join(" ");
    console.log(`Translation completed. Original: ${text.length} chars, Translated: ${result.length} chars`);
    console.log(`Final result: "${result}"`);
    return result;
  } catch (error) {
    console.error("Advanced translation error:", error);
    throw error;
  }
};

// Advanced fallback translation with very small chunks
const advancedFallbackTranslate = async (text: string, targetLang: string) => {
  const translations: Record<string, Record<string, string>> = {
    // Common phrases and sentences
    "Hello": {
      "Hindi": "नमस्ते",
      "Spanish": "Hola",
      "French": "Bonjour",
      "German": "Hallo",
      "Italian": "Ciao",
      "Portuguese": "Olá",
      "Russian": "Привет",
      "Japanese": "こんにちは",
      "Korean": "안녕하세요",
      "Chinese": "你好",
      "Arabic": "مرحبا",
      "Dutch": "Hallo",
      "Swedish": "Hej",
      "Norwegian": "Hei",
      "Danish": "Hej",
      "Finnish": "Hei",
      "Polish": "Cześć",
      "Turkish": "Merhaba",
      "Greek": "Γεια σας",
      "Hebrew": "שלום"
    },
    "Thank you": {
      "Hindi": "धन्यवाद",
      "Spanish": "Gracias",
      "French": "Merci",
      "German": "Danke",
      "Italian": "Grazie",
      "Portuguese": "Obrigado",
      "Russian": "Спасибо",
      "Japanese": "ありがとう",
      "Korean": "감사합니다",
      "Chinese": "谢谢",
      "Arabic": "شكرا",
      "Dutch": "Dank je",
      "Swedish": "Tack",
      "Norwegian": "Takk",
      "Danish": "Tak",
      "Finnish": "Kiitos",
      "Polish": "Dziękuję",
      "Turkish": "Teşekkürler",
      "Greek": "Ευχαριστώ",
      "Hebrew": "תודה"
    },
    "Goodbye": {
      "Hindi": "अलविदा",
      "Spanish": "Adiós",
      "French": "Au revoir",
      "German": "Auf Wiedersehen",
      "Italian": "Arrivederci",
      "Portuguese": "Adeus",
      "Russian": "До свидания",
      "Japanese": "さようなら",
      "Korean": "안녕히 가세요",
      "Chinese": "再见",
      "Arabic": "وداعا",
      "Dutch": "Tot ziens",
      "Swedish": "Hej då",
      "Norwegian": "Ha det",
      "Danish": "Farvel",
      "Finnish": "Näkemiin",
      "Polish": "Do widzenia",
      "Turkish": "Güle güle",
      "Greek": "Αντίο",
      "Hebrew": "להתראות"
    },
    "Yes": {
      "Hindi": "हाँ",
      "Spanish": "Sí",
      "French": "Oui",
      "German": "Ja",
      "Italian": "Sì",
      "Portuguese": "Sim",
      "Russian": "Да",
      "Japanese": "はい",
      "Korean": "네",
      "Chinese": "是",
      "Arabic": "نعم",
      "Dutch": "Ja",
      "Swedish": "Ja",
      "Norwegian": "Ja",
      "Danish": "Ja",
      "Finnish": "Kyllä",
      "Polish": "Tak",
      "Turkish": "Evet",
      "Greek": "Ναι",
      "Hebrew": "כן"
    },
    "No": {
      "Hindi": "नहीं",
      "Spanish": "No",
      "French": "Non",
      "German": "Nein",
      "Italian": "No",
      "Portuguese": "Não",
      "Russian": "Нет",
      "Japanese": "いいえ",
      "Korean": "아니요",
      "Chinese": "不",
      "Arabic": "لا",
      "Dutch": "Nee",
      "Swedish": "Nej",
      "Norwegian": "Nei",
      "Danish": "Nej",
      "Finnish": "Ei",
      "Polish": "Nie",
      "Turkish": "Hayır",
      "Greek": "Όχι",
      "Hebrew": "לא"
    },
    "How are you": {
      "Hindi": "आप कैसे हैं",
      "Spanish": "¿Cómo estás?",
      "French": "Comment allez-vous?",
      "German": "Wie geht es dir?",
      "Italian": "Come stai?",
      "Portuguese": "Como você está?",
      "Russian": "Как дела?",
      "Japanese": "お元気ですか",
      "Korean": "어떻게 지내세요?",
      "Chinese": "你好吗？",
      "Arabic": "كيف حالك؟",
      "Dutch": "Hoe gaat het?",
      "Swedish": "Hur mår du?",
      "Norwegian": "Hvordan går det?",
      "Danish": "Hvordan går det?",
      "Finnish": "Mitä kuuluu?",
      "Polish": "Jak się masz?",
      "Turkish": "Nasılsın?",
      "Greek": "Πώς είσαι;",
      "Hebrew": "איך אתה?"
    },
    "I love you": {
      "Hindi": "मैं तुमसे प्यार करता हूं",
      "Spanish": "Te amo",
      "French": "Je t'aime",
      "German": "Ich liebe dich",
      "Italian": "Ti amo",
      "Portuguese": "Eu te amo",
      "Russian": "Я люблю тебя",
      "Japanese": "愛してる",
      "Korean": "사랑해요",
      "Chinese": "我爱你",
      "Arabic": "أحبك",
      "Dutch": "Ik hou van je",
      "Swedish": "Jag älskar dig",
      "Norwegian": "Jeg elsker deg",
      "Danish": "Jeg elsker dig",
      "Finnish": "Rakastan sinua",
      "Polish": "Kocham cię",
      "Turkish": "Seni seviyorum",
      "Greek": "Σ' αγαπώ",
      "Hebrew": "אני אוהב אותך"
    }
  };

  // Split text into very small chunks for processing
  const textChunks = splitTextIntoSmallChunks(text, 400);
  const translatedChunks: string[] = [];

  for (const chunk of textChunks) {
    let translatedText = chunk;
    let translationCount = 0;

    // Split chunk into sentences and translate each
    const sentences = chunk.split(/[.!?]+/).filter(s => s.trim());
    
    for (const sentence of sentences) {
      const trimmedSentence = sentence.trim();
      if (!trimmedSentence) continue;

      // Try to find exact matches first
      for (const [english, langMap] of Object.entries(translations)) {
        if (langMap[targetLang] && trimmedSentence.toLowerCase().includes(english.toLowerCase())) {
          translatedText = translatedText.replace(
            new RegExp(trimmedSentence, 'gi'), 
            trimmedSentence.replace(new RegExp(english, 'gi'), langMap[targetLang])
          );
          translationCount++;
          break;
        }
      }

      // If no exact match, try word-by-word translation
      if (translationCount === 0) {
        const words = trimmedSentence.split(/\s+/);
        for (const word of words) {
          const cleanWord = word.replace(/[^\w]/g, '');
          for (const [english, langMap] of Object.entries(translations)) {
            if (langMap[targetLang] && cleanWord.toLowerCase() === english.toLowerCase()) {
              translatedText = translatedText.replace(
                new RegExp(`\\b${cleanWord}\\b`, 'gi'), 
                langMap[targetLang]
              );
              translationCount++;
            }
          }
        }
      }
    }

    translatedChunks.push(translatedText);
  }

  // Combine all translated chunks
  const finalTranslation = translatedChunks.join(" ");

  // If we found translations, return the result
  if (finalTranslation !== text) {
    return finalTranslation;
  }

  // If no translations found, return a helpful message
  return `[Advanced translation to ${targetLang} not available for this text. The system supports common phrases like "Hello", "Thank you", "How are you", "I love you", "Yes", "No", and "Goodbye".]`;
};

// Handles POST request for translating text
export async function POST(req: NextRequest) {
  try {
    const { text, targetLang } = await req.json();

    if (!text || !targetLang) {
      return new Response("Text and target language are required", {
        status: 400,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }

    // Check if text is not empty
    if (text.trim().length === 0) {
      return new Response("Text cannot be empty", {
        status: 400,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }

    // Extract plain text from document JSON structure
    const plainText = extractTextFromDocument(text);
    
    if (!plainText || plainText.trim().length === 0) {
      return new Response("No text content found in document", {
        status: 400,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }

    console.log(`Starting translation: ${plainText.length} characters to ${targetLang}`);
    console.log(`Original input: ${text.substring(0, 200)}...`);
    console.log(`Extracted text: "${plainText}"`);

    // Try advanced translation service first
    try {
      const translated = await translateWithAdvancedService(plainText, targetLang);
      
      console.log(`Translation successful: ${translated.length} characters`);
      console.log(`Final translated result: "${translated}"`);
      
      // Return only the translated text, not JSON
      return new Response(translated, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
        },
      });
    } catch (advancedError) {
      console.error("Advanced translation failed, trying fallback:", advancedError);
      
      // Try advanced fallback translation
      const fallbackTranslated = await advancedFallbackTranslate(plainText, targetLang);
      
      console.log(`Fallback translation completed: ${fallbackTranslated.length} characters`);
      console.log(`Fallback result: "${fallbackTranslated}"`);
      
      // Return only the translated text, not JSON
      return new Response(fallbackTranslated, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
        },
      });
    }
  } catch (error: any) {
    console.error("Translation error:", error);
    
    return new Response("Translation service temporarily unavailable. Please try again.", {
      status: 500,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
  }
}
