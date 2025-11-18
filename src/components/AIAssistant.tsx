import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Brain, Heart, HelpCircle, BookOpen, Send, XCircle, Youtube, Gamepad2, Loader2 } from 'lucide-react';
import VoiceInput from './VoiceInput';
import { askGroq } from '@/api/groqGPT';
import { YouTubeSummarizer } from './YouTubeSummarizer';
import { GamesSection } from './GamesSection';
import { AITutorSection } from './AITutorSection';
import './voice.css';

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  currentEmotion: string;
  isEmotionTriggered?: boolean;
}

type ChatMessage = {
  type: 'user' | 'ai';
  text: string;
  timestamp: string;
};

export const AIAssistant = ({ isOpen, onClose, currentEmotion, isEmotionTriggered }: AIAssistantProps) => {
  const [message, setMessage] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showYouTubeSummarizer, setShowYouTubeSummarizer] = useState(false);
  const [showGamesSection, setShowGamesSection] = useState(false);
  const [showAITutorSection, setShowAITutorSection] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [conversation, setConversation] = useState<ChatMessage[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Reset internal state when assistant is closed
  useEffect(() => {
    if (!isOpen) {
      setShowConfirm(false);
      setShowChat(false);
      console.log('AI Assistant closed - resetting internal state');
    }
  }, [isOpen]);

  // Handle emotion trigger vs manual trigger
  useEffect(() => {
    console.log(`AI Assistant state: isOpen=${isOpen}, isEmotionTriggered=${isEmotionTriggered}, showChat=${showChat}, showConfirm=${showConfirm}`);

    if (currentEmotion && isOpen && !showChat && !showConfirm) {
      if (isEmotionTriggered) {
        console.log('Showing emotion-triggered popup');
        setShowConfirm(true);
      } else {
        console.log('Opening manual-triggered chat');
        setShowChat(true);
      }

      setConversation([
        {
          type: 'ai',
          text: getEmotionResponse(currentEmotion),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  }, [currentEmotion, isOpen, showChat, showConfirm, isEmotionTriggered]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  // Auto-close confirm popup
  useEffect(() => {
    if (showConfirm) {
      const timer = setTimeout(() => setShowConfirm(false), 10000);
      return () => clearTimeout(timer);
    }
  }, [showConfirm]);

  function getEmotionResponse(emotion: string) {
    switch (emotion) {
      case '🤔':
        return 'I noticed you seem confused. Would you like me to explain this concept differently or provide additional examples?';
      case '😫':
        return "You seem frustrated. Let's take a step back. Would you like a quick breathing exercise or shall I break this down into smaller parts?";
      case '💤':
        return "Feeling a bit drowsy? Let's energize your learning! How about a quick interactive quiz or a short break?";
      case '😐':
        return 'I can see you might be losing interest. Let’s make this more engaging! Want to try a hands-on simulation?';
      case '❓':
        return "I'm here to help optimize your learning experience. How can I assist you today?";
      default:
        return "Hi! I'm here to help optimize your learning experience. How can I assist you today?";
    }
  }

  const getConfirmMessage = (emotion: string) => {
    switch (emotion) {
      case '🤔':
        return 'You seem confused. Want to open AI Assistant?';
      case '😫':
        return 'You seem frustrated. Want to open AI Assistant?';
      case '💤':
        return 'Feeling sleepy? Need a quick quiz or break?';
      case '😐':
        return 'Losing interest? Want something more engaging?';
      case '❓':
        return 'Need help? Want to chat with AI Assistant?';
      default:
        return 'Want to chat with the AI Assistant?';
    }
  };

  const formatMessageText = (text: string) => {
    let html = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/(^|[^*])\*(?!\*)([^*]+)\*(?!\*)/g, '$1<em>$2</em>');
    html = html.replace(/(^|[^_])_([^_]+)_/g, '$1<em>$2</em>');
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    html = html.replace(/^###### (.*)$/gm, '<h6>$1</h6>');
    html = html.replace(/^##### (.*)$/gm, '<h5>$1</h5>');
    html = html.replace(/^#### (.*)$/gm, '<h4>$1</h4>');
    html = html.replace(/^### (.*)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.*)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.*)$/gm, '<h1>$1</h1>');

    html = html.replace(/\n{2,}/g, '</p><p>');
    html = html.replace(/\n/g, '<br/>');
    return `<p>${html}</p>`;
  };

  const handleSendMessage = async () => {
    const trimmed = message.trim();
    if (!trimmed) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setConversation((prev) => [...prev, { type: 'user', text: trimmed, timestamp }]);
    setMessage('');

    let mode = 'simple';
    if (trimmed.includes('youtube.com') || trimmed.includes('youtu.be')) {
      mode = 'youtube';
    }

    const aiText = await askGroq(trimmed, mode);
    setConversation((prev) => [
      ...prev,
      { type: 'ai', text: aiText, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
    ]);
  };

  const interventionOptions = [
    { icon: Brain, title: 'Explain Differently', description: 'Im 5 mode', color: 'from-blue-400 to-blue-600', mode: 'im5' },
    { icon: Heart, title: 'Story Mode', description: 'Concepts as stories', color: 'from-pink-400 to-pink-600', mode: 'story' },
    { icon: HelpCircle, title: 'Quick Quiz', description: 'Test your understanding', color: 'from-green-400 to-green-600', mode: 'quiz' },
    { icon: BookOpen, title: 'Study Resources', description: 'Additional materials', color: 'from-purple-400 to-purple-600', mode: 'resources' },
    { icon: Youtube, title: 'Summarize the Class', description: 'Summarize YouTube videos', color: 'from-red-400 to-red-600', mode: 'youtube' },
    { icon: Gamepad2, title: 'Games', description: 'Play interactive games', color: 'from-orange-400 to-orange-600', mode: 'games' },
    { icon: BookOpen, title: 'AI Tutor', description: 'Learn any topic with AI', color: 'from-indigo-500 to-purple-600', mode: 'aitutor' },
  ];

  const handleIntervention = async (mode: string) => {
    setIsLoading(true);

    if (mode === 'youtube') {
      setShowYouTubeSummarizer(true);
      setIsLoading(false);
      return;
    }

    if (mode === 'games') {
      setShowGamesSection(true);
      setIsLoading(false);
      return;
    }

    if (mode === 'aitutor') {
      setShowAITutorSection(true);
      setIsLoading(false);
      return;
    }

    // Other modes like im5, story, quiz, resources can call askGroq
    setIsLoading(false);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl w-full p-0 bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-blue-200/40 animate-fade-in">
          {/* Emotion-triggered popup */}
          {showConfirm && (
            <div className="flex flex-col items-center justify-center py-10 px-8">
              <DialogHeader>
                <DialogTitle className="text-3xl font-extrabold text-blue-700 mb-2 drop-shadow-lg">AI Assistant</DialogTitle>
              </DialogHeader>
              <div className="text-xl mb-6 text-gray-700 font-medium animate-fade-in-slow">
                {getConfirmMessage(currentEmotion)}
              </div>
              <Button
                variant="default"
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold shadow-lg rounded-xl py-3 text-lg transition-all duration-200 hover:scale-105"
                onClick={() => {
                  setShowConfirm(false);
                  setShowChat(true);
                }}
              >
                Open Chat
              </Button>
              <Button
                variant="ghost"
                className="mt-4 text-gray-500 hover:text-blue-600 transition-all duration-200"
                onClick={onClose}
              >
                <XCircle className="mr-2" /> Close
              </Button>
            </div>
          )}

          {/* Main Chat UI */}
          {showChat && (
            <div className="flex flex-col h-[600px]">
              <div className="flex-1 overflow-y-auto px-8 py-6 space-y-5">
                {conversation.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[70%] px-5 py-3 rounded-2xl shadow-lg text-base transition-all duration-200 ${
                        msg.type === 'user'
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold'
                          : 'bg-white/95 text-gray-900 border border-blue-100/30 font-medium'
                      }`}
                      dangerouslySetInnerHTML={{ __html: formatMessageText(msg.text) }}
                    />
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <div className="px-8 py-6 border-t border-blue-100/30 bg-white/90 rounded-b-3xl flex items-center gap-3">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type your question..."
                  className="flex-1 bg-white/95 border border-blue-100/30 rounded-xl shadow-md focus:ring-2 focus:ring-blue-400 transition-all duration-200 text-lg"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={isLoading || !message.trim()}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg rounded-xl px-5 py-3 text-lg font-bold transition-all duration-200 hover:scale-105"
                >
                  {isLoading ? <Loader2 className="animate-spin" /> : <Send />}
                </Button>
                <VoiceInput onSend={setMessage} disabled={isLoading} />
              </div>
              <div className="px-8 py-3 flex gap-3 flex-wrap">
                {interventionOptions.map((opt) => (
                  <Button
                    key={opt.title}
                    variant="outline"
                    className={`bg-gradient-to-r ${opt.color} text-white shadow-lg rounded-xl px-4 py-3 flex items-center gap-2 text-base font-semibold transition-all duration-200 hover:scale-105`}
                    onClick={() => handleIntervention(opt.mode)}
                  >
                    <opt.icon className="w-6 h-6" /> {opt.title}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* True modal overlays for sections */}
      {showYouTubeSummarizer && (
        <Dialog open={true} onOpenChange={() => setShowYouTubeSummarizer(false)}>
          <DialogContent className="max-w-xl w-full bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-red-200/40 animate-fade-in">
            <YouTubeSummarizer onSummaryComplete={() => {}} onClose={() => setShowYouTubeSummarizer(false)} />
          </DialogContent>
        </Dialog>
      )}
      {showGamesSection && (
        <Dialog open={true} onOpenChange={() => setShowGamesSection(false)}>
          <DialogContent className="max-w-xl w-full bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-orange-200/40 animate-fade-in">
            <GamesSection onClose={() => setShowGamesSection(false)} />
          </DialogContent>
        </Dialog>
      )}
      {showAITutorSection && (
        <Dialog open={true} onOpenChange={() => setShowAITutorSection(false)}>
          <DialogContent className="max-w-xl w-full bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-indigo-200/40 animate-fade-in">
            <AITutorSection onClose={() => setShowAITutorSection(false)} />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};
