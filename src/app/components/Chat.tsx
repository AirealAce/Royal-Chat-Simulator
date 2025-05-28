'use client';

import { useChat } from 'ai/react';
import { Loader2, Play } from 'lucide-react';
import { useRef, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';

const sampleQuestions = [
  "What is artificial intelligence?",
  "How does photosynthesis work?",
  "Explain quantum computing",
  "Tell me a fun fact"
];

interface CodeProps {
  children: React.ReactNode;
  className?: string;
  node?: any;
  inline?: boolean;
}

interface TextToSpeechProps {
  text: string;
  voiceId?: string;
}

function TextToSpeech({ text, voiceId = 'EXAVITQu4vr4xnSDxMaL' }: TextToSpeechProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = async () => {
    setIsPlaying(true);
    try {
      const res = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice_id: voiceId }),
      });

      if (!res.ok) {
        throw new Error('Failed to generate speech');
      }

      const audioData = await res.arrayBuffer();
      const blob = new Blob([audioData], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(blob);

      const audio = new Audio(url);
      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(url);
      };
      await audio.play();
    } catch (error) {
      console.error('Speech generation error:', error);
      alert('Failed to generate speech');
      setIsPlaying(false);
    }
  };

  return (
    <button
      onClick={handlePlay}
      disabled={isPlaying}
      className="p-2 rounded-full hover:bg-[#2f354c] transition-colors disabled:opacity-50"
      title={isPlaying ? "Playing..." : "Play message"}
    >
      <Play className={`w-4 h-4 ${isPlaying ? 'text-purple-400' : 'text-gray-400'}`} />
    </button>
  );
}

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        // Allow new line when Shift+Enter is pressed
        return;
      } else {
        // Submit the form when only Enter is pressed
        e.preventDefault();
        handleSubmit(e as any);
      }
    }
  };

  const customHandleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleInputChange(e);
    adjustTextareaHeight();
  };

  const markdownComponents: Components = {
    h1: ({ children }) => <h1 className="text-2xl font-bold text-gray-100">{children}</h1>,
    h2: ({ children }) => <h2 className="text-xl font-bold text-gray-100">{children}</h2>,
    h3: ({ children }) => <h3 className="text-lg font-bold text-gray-100">{children}</h3>,
    h4: ({ children }) => <h4 className="text-base font-bold text-gray-100">{children}</h4>,
    p: ({ children }) => <p className="text-gray-100 whitespace-pre-wrap">{children}</p>,
    strong: ({ children }) => <strong className="font-bold text-purple-300">{children}</strong>,
    em: ({ children }) => <em className="italic text-blue-300">{children}</em>,
    code: ({ node, inline, className, children, ...props }: any) => {
      const match = /language-(\w+)/.exec(className || '');
      return !inline ? (
        <code className="block bg-gray-800/50 rounded p-2 my-2 text-purple-300 whitespace-pre" {...props}>
          {children}
        </code>
      ) : (
        <code className="bg-gray-800/50 rounded px-1 py-0.5 text-purple-300" {...props}>
          {children}
        </code>
      );
    },
    ul: ({ children }) => <ul className="list-disc list-inside text-gray-100">{children}</ul>,
    ol: ({ children }) => <ol className="list-decimal list-inside text-gray-100">{children}</ol>,
    li: ({ children }) => <li className="ml-4 text-gray-100">{children}</li>,
  };

  return (
    <div className="flex flex-col h-screen bg-[#1a1b26]">
      {messages.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <h1 className="text-4xl font-semibold text-gray-100 mb-8">How can I help?</h1>
          <div className="grid grid-cols-2 gap-4 w-full max-w-2xl">
            {sampleQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleInputChange({ target: { value: question } } as any)}
                className="p-4 bg-[#24283b] rounded-lg text-gray-100 text-sm hover:bg-[#2f354c] transition-colors text-left border border-[#414868]/20 hover:border-[#414868]"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`${
                message.role === 'assistant'
                  ? 'bg-[#24283b]'
                  : 'bg-[#1a1b26]'
              }`}
            >
              <div className="max-w-3xl mx-auto px-4 py-6">
                <div className="flex items-end gap-4">
                  <div className="flex-shrink-0">
                    {message.role === 'assistant' ? (
                      <div className="flex flex-col items-center">
                        <span className="text-xs font-medium text-purple-400 mb-1">Princess Ayane</span>
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white shadow-lg">
                          🤖
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <span className="text-xs font-medium text-pink-400 mb-1">Prince Miruzu</span>
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-white shadow-lg">
                          👤
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="min-h-[20px] text-gray-100 markdown-body">
                      <ReactMarkdown components={markdownComponents}>
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                  {message.role === 'assistant' && (
                    <div className="flex-shrink-0 self-end">
                      <TextToSpeech text={message.content} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      )}

      <div className="border-t border-[#414868]/20 bg-[#1a1b26] p-4">
        <form 
          onSubmit={handleSubmit}
          className="max-w-3xl mx-auto relative"
        >
          <div className="relative flex items-center">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={customHandleInputChange}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="Send a message... (Shift+Enter for new line)"
              className="w-full p-4 pr-12 rounded-lg bg-[#24283b] text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 border border-[#414868]/20 focus:border-purple-500/50 resize-none"
              style={{
                minHeight: '56px',
                height: 'auto',
                maxHeight: '200px'
              }}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-100 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  className="w-6 h-6 rotate-90"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M7 11L12 6L17 11M12 18V7"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 