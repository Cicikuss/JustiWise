import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { marked } from 'marked';

interface Slide {
  text: string;
  imageUrl: string;
}

const styles = {
  container: {
    fontFamily: "'Space Mono', monospace",
    padding: '20px',
    backgroundColor: 'light-dark(#f8f9fa, #212529)',
    color: 'light-dark(#343a40, #f8f9fa)',
    lineHeight: '1.6',
    maxWidth: '1200px',
    margin: '20px auto',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },
  
  title: {
    marginBottom: '40px',
    color: 'light-dark(#212529, #ffffff)',
    textAlign: 'center' as const,
    fontSize: '2rem',
    fontWeight: 'bold',
  },

  error: {
    fontWeight: 'bold',
    padding: '15px 20px',
    backgroundColor: 'light-dark(#ffe7e7, #660b0b)',
    borderRadius: '6px',
    borderLeft: '4px solid light-dark(#d61c1c, #ff6666)',
    marginBottom: '20px',
  },

  examplesList: {
    listStyle: 'none',
    padding: '0',
    cursor: 'pointer',
  },

  exampleItem: {
    marginBottom: '10px',
    padding: '15px 20px',
    border: '1px solid light-dark(#dee2e6, #495057)',
    borderRadius: '6px',
    backgroundColor: 'light-dark(#ffffff, #343a40)',
    transition: 'background-color 0.2s ease-in-out, border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  },

  textarea: {
    width: '100%',
    padding: '15px 20px',
    border: '1px solid light-dark(#ced4da, #495057)',
    borderRadius: '6px',
    fontFamily: "'Space Mono', monospace",
    marginTop: '8px',
    minHeight: '90px',
    resize: 'vertical' as const,
    transition: 'border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
    backgroundColor: 'light-dark(#ffffff, #343a40)',
    color: 'light-dark(#343a40, #f8f9fa)',
    fontSize: '14px',
  },

  loading: {
    textAlign: 'center' as const,
    padding: '20px',
    fontStyle: 'italic',
    color: 'light-dark(#6c757d, #adb5bd)',
  },

  loadingSpinner: {
    display: 'inline-block',
    width: '20px',
    height: '20px',
    border: '3px solid light-dark(#f3f3f3, #495057)',
    borderTop: '3px solid light-dark(#1c7ed6, #66b2ff)',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginRight: '10px',
  },

  slideshow: {
    display: 'flex',
    flexDirection: 'row' as const,
    overflowX: 'auto' as const,
    scrollSnapType: 'x mandatory',
    gap: '25px',
    marginBottom: '40px',
    padding: '10px 5px 20px 5px',
    border: '1px solid light-dark(#e9ecef, #495057)',
    borderRadius: '8px',
    backgroundColor: 'light-dark(#ffffff, #343a40)',
    boxShadow: '0 2px 8px light-dark(rgba(0, 0, 0, 0.05), rgba(255, 255, 255, 0.05))',
  },

  slide: {
    border: '1px solid light-dark(#ced4da, #495057)',
    padding: '25px',
    fontFamily: '"Indie Flower", cursive',
    scrollSnapAlign: 'center',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    minWidth: '380px',
    boxShadow: '0 4px 12px light-dark(rgba(0, 0, 0, 0.08), rgba(255, 255, 255, 0.08))',
    transition: 'transform 0.2s ease-in-out',
  },

  slideImage: {
    height: '320px',
    maxWidth: '100%',
    objectFit: 'contain' as const,
    borderRadius: '6px',
  },

  slideCaption: {
    fontSize: '24px',
    textAlign: 'center' as const,
    marginTop: '20px',
    color: '#495057',
  },
};

export const TinyCats: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userInput, setUserInput] = useState('');
  const [slides, setSlides] = useState<Slide[]>([]);

  const aiRef = useRef<GoogleGenAI | null>(null);
  const chatRef = useRef<any>(null);

  const additionalInstructions = `
Use a fun story about lots of tiny cats as a metaphor.
Keep sentences short but conversational, casual, and engaging.
Generate a cute, minimal illustration for each sentence with black ink on white background.
No commentary, just begin your explanation.
Keep going until you're done.`;

  const examples = [
    'Bir kira sözleşmesinin geçerli olabilmesi için hangi unsurlar gereklidir? Tarafların hak ve yükümlülükleri nelerdir?',
    'Haksız fiil nedir? Haksız fiilin unsurları nelerdir?',
    'Bir sözleşmenin geçersiz olmasının sebepleri nelerdir? Hangi durumlarda sözleşme geçersiz sayılır?',
    'Ceza hukuku açısından suçun unsurları nelerdir? Suçun oluşabilmesi için hangi şartlar gereklidir?',
    'Bir mahkeme kararının temyiz edilebilmesi için hangi şartlar gereklidir? Temyiz süreci nasıl işler?',
  
  ];

  useEffect(() => {
    const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
    if (!apiKey) {
      setError("Google Gemini API Key not found in environment variables. Please check your .env file.");
      return;
    }

    try {
      aiRef.current = new GoogleGenAI({ apiKey });
      chatRef.current = aiRef.current.chats.create({
        model: 'gemini-2.0-flash-preview-image-generation',
        config: { responseModalities: [Modality.TEXT, Modality.IMAGE] },
        history: [],
      });
    } catch (e: any) {
      console.error("Failed to initialize AI:", e);
      setError(`Failed to initialize AI: ${e instanceof Error ? e.message : String(e)}`);
    }
  }, []);

  const initializeAI = useCallback(() => {
    if (!chatRef.current) {
      setError("AI Chat not initialized. Please check API key and refresh the page.");
      return false;
    }
    return true;
  }, []);

  const parseMarkdown = useCallback((text: string): string => {
    try {
      const result = marked.parse(text);
      return typeof result === 'string' ? result : text;
    } catch (error) {
      console.error('Markdown parsing error:', error);
      return text;
    }
  }, []);

  const addSlide = useCallback((text: string, imageUrl: string) => {
    const parsedText = parseMarkdown(text);
    setSlides(prev => [...prev, { text: parsedText, imageUrl }]);
  }, [parseMarkdown]);

  const handleGenerate = useCallback(async (message: string) => {
    if (!initializeAI()) return;
    if (!message.trim()) {
      setError("Please enter a message to generate a story.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSlides([]);

    if (Array.isArray(chatRef.current.history)) {
      chatRef.current.history.length = 0;
    }

    try {
      const result = await chatRef.current.sendMessageStream({ 
        message: message + additionalInstructions 
      });
      
      let text = '';
      let img: string | null = null;

      for await (const chunk of result) {
        if (chunk.candidates) {
          for (const candidate of chunk.candidates) {
            if (candidate.content?.parts) {
              for (const part of candidate.content.parts) {
                if (part.text) {
                  text += part.text;
                } else if (part.inlineData?.data) {
                  img = `data:image/png;base64,${part.inlineData.data}`;
                }
                if (text && img) {
                  addSlide(text, img);
                  text = '';
                  img = null;
                }
              }
            }
          }
        }
      }

      if (text && img) {
        addSlide(text, img);
      }

    } catch (e: unknown) {
      console.error('AI generation error:', e);
      setError(`Something went wrong: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setIsLoading(false);
      setUserInput('');
    }
  }, [initializeAI, additionalInstructions, addSlide]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
      e.preventDefault();
      handleGenerate(userInput);
    }
  };

  const handleExampleClick = (example: string) => {
    handleGenerate(example);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Indie+Flower&family=Space+Mono:ital,wght@0,400;0,700;1,400;1,700&display=swap');
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .example-item:hover {
          background-color: light-dark(#e9ecef, #495057) !important;
          border-color: light-dark(#adb5bd, #adb5bd) !important;
          box-shadow: 0 2px 4px light-dark(rgba(0, 0, 0, 0.05), rgba(255, 255, 255, 0.05)) !important;
        }
        
        .slide-item:hover {
          transform: translateY(-3px) !important;
        }
        
        .textarea-focus:focus {
          outline: none !important;
          border-color: light-dark(#1c7ed6, #66b2ff) !important;
          box-shadow: 0 0 0 2px light-dark(rgba(28, 126, 214, 0.2), rgba(102, 178, 255, 0.2)) !important;
        }
      `}</style>
      
      <div style={styles.container}>
        <h1 style={styles.title}>Bir sürü minik kediyle bir şeyleri açıklayın</h1>
        


        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}

        <p style={{ marginBottom: '8px' }}>Örnekler:</p>
        <ul style={styles.examplesList}>
          {examples.map((example, index) => (
            <li
              key={index}
              className="example-item"
              style={styles.exampleItem}
              onClick={() => handleExampleClick(example)}
            >
              {example}
            </li>
          ))}
        </ul>

        <p style={{ marginTop: '8px', marginBottom: '8px' }}>veya kendi isteminizi girin:</p>
        <textarea
          className="textarea-focus"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Bir komut girin ve Enter'a basın."
          style={styles.textarea}
          disabled={isLoading}
        />

        {isLoading && (
          <div style={styles.loading}>
            <span style={styles.loadingSpinner}></span>
            Minik kedilerle hikaye üretiyoruz...
          </div>
        )}

        {slides.length > 0 && (
          <div style={styles.slideshow}>
            {slides.map((slide, index) => (
              <div
                key={index}
                className="slide-item"
                style={styles.slide}
              >
                <img
                  src={slide.imageUrl}
                  alt={`AI Generated Illustration ${index + 1}`}
                  style={styles.slideImage}
                />
                <div
                  style={styles.slideCaption}
                  dangerouslySetInnerHTML={{ __html: slide.text }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};