import { useState, useEffect, useRef } from 'react';
import { VideoPlayer } from '@/components/VideoPlayer';
import { EmotionTracker } from '@/components/EmotionTracker';
import { AIAssistant } from '@/components/AIAssistant';
import { ControlPanel } from '@/components/ControlPanel';
import { ProgressBadges } from '@/components/ProgressBadges';
import { MoodGraph } from '@/components/MoodGraph';
import BreathingExercise from '../components/BreathingExercise';

const Index = () => {
  const [currentEmotion, setCurrentEmotion] = useState<string | null>(null);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isEmotionTriggered, setIsEmotionTriggered] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isBreathingExerciseOpen, setIsBreathingExerciseOpen] = useState(false);

  // Track last emotion to avoid duplicate popups
  const lastEmotionRef = useRef<string | null>(null);
  const assistantTriggeredRef = useRef<boolean>(false);

  // Handle emotion change from ControlPanel
  const handleEmotionChange = (emotion: string) => {
    console.log(`Index: Emotion changed to ${emotion}`);
    setCurrentEmotion(emotion);
    
    // Check if this is a new negative emotion that should trigger assistant
    const negativeEmotions = ['Confused', 'Frustrated', 'Sleepy', 'Bored'];
    const isNegativeEmotion = negativeEmotions.includes(emotion);
    const isNewEmotion = emotion !== lastEmotionRef.current;
    
    console.log(`Emotion analysis: negative=${isNegativeEmotion}, new=${isNewEmotion}, alreadyTriggered=${assistantTriggeredRef.current}`);
    
    if (isNegativeEmotion && isNewEmotion && !assistantTriggeredRef.current) {
      console.log(`Triggering AI assistant for emotion: ${emotion}`);
      assistantTriggeredRef.current = true;
      
      // Close any existing assistant first
      setIsAssistantOpen(false);
      setIsEmotionTriggered(false);
      
      // Show the popup by opening the assistant (it will show popup first)
      setTimeout(() => {
        setIsEmotionTriggered(true);
        setIsAssistantOpen(true);
        // Reset the trigger after a delay to allow for future triggers
        setTimeout(() => {
          assistantTriggeredRef.current = false;
          console.log("AI assistant trigger reset - ready for next negative emotion");
        }, 15000); // 15 seconds cooldown
      }, 1000); // 1 second delay before showing popup
    }
    
    lastEmotionRef.current = emotion;
  };

  // Map emotion string to emoji for display
  const mapEmotionToEmoji = (emotion: string | null) => {
    if (!emotion) return '😊';
    
    switch (emotion) {
      case 'Confused':
        return '🤔';
      case 'Frustrated':
        return '😫';
      case 'Sleepy':
        return '💤';
      case 'Bored':
        return '😐';
      case 'Engaged':
        return '🎯';
      case 'Happy':
        return '😊';
      case 'Unknown':
        return '❓';
      case 'Face Not Detected':
        return '👤';
      default:
        return '❓';
    }
  };

  // Reset assistant trigger when assistant is closed
  const handleAssistantClose = () => {
    setIsAssistantOpen(false);
    setIsEmotionTriggered(false);
    assistantTriggeredRef.current = false;
  };

  // Handle manual AI assistant button click (opens chat directly)
  const handleManualAssistantToggle = () => {
    setIsEmotionTriggered(false);
    setIsAssistantOpen(!isAssistantOpen);
    // Reset trigger when manually opened
    assistantTriggeredRef.current = false;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e0e7ff] via-[#c7d2fe] to-[#f3e8ff] flex flex-col">
      {/* Header */}
      <header className="bg-white/60 backdrop-blur-xl shadow-lg border-b border-blue-200/40 sticky top-0 z-30 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-lg animate-pulse">
                <span className="text-white font-extrabold text-2xl tracking-wide drop-shadow">E</span>
              </div>
              <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent tracking-tight drop-shadow-lg">
                EmoLearn
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white/70 rounded-3xl px-5 py-2 shadow-md border border-blue-100/30 transition-all duration-300">
                <span className="text-3xl animate-bounce-slow">{mapEmotionToEmoji(currentEmotion)}</span>
                <span className="text-base text-gray-700 font-medium">
                  {currentEmotion || 'No Detection'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column - Video & Controls */}
          <div className="lg:col-span-3 space-y-8">
            {/* Video Player */}
            <div className="rounded-3xl shadow-2xl bg-white/80 backdrop-blur-lg border border-blue-100/30 p-4 transition-all duration-300 hover:scale-[1.01]">
              <VideoPlayer />
            </div>

            {/* Control Panel */}
            <div className="rounded-3xl shadow-xl bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100/30 p-4 transition-all duration-300 hover:scale-[1.01]">
              <ControlPanel 
                isCameraOn={isCameraOn}
                setIsCameraOn={setIsCameraOn}
                isMicOn={isMicOn}
                setIsMicOn={setIsMicOn}
                onBreathingExercise={() => setIsBreathingExerciseOpen(true)}
                onAssistantToggle={handleManualAssistantToggle}
                onEmotionChange={handleEmotionChange}
              />
            </div>

            {/* Emotion Tracker */}
            <div className="rounded-3xl shadow-xl bg-white/80 border border-purple-100/30 p-4 transition-all duration-300 hover:scale-[1.01]">
              <EmotionTracker 
                currentEmotion={currentEmotion}
                isActive={isCameraOn || isMicOn}
              />
            </div>

            {/* Mood Graph */}
            <div className="rounded-3xl shadow-xl bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100/30 p-4 transition-all duration-300 hover:scale-[1.01]">
              <MoodGraph />
            </div>
          </div>

          {/* Right Column - Progress & Badges */}
          <div className="space-y-8">
            <div className="rounded-3xl shadow-xl bg-white/80 border border-blue-100/30 p-4 transition-all duration-300 hover:scale-[1.01]">
              <ProgressBadges />
            </div>
          </div>
        </div>
      </main>

      {/* AI Assistant Modal - Will show popup first */}
      <AIAssistant 
        isOpen={isAssistantOpen}
        onClose={handleAssistantClose}
        currentEmotion={mapEmotionToEmoji(currentEmotion)}
        isEmotionTriggered={isEmotionTriggered}
      />

      {/* Breathing Exercise Modal */}
      <BreathingExercise 
        isOpen={isBreathingExerciseOpen}
        onClose={() => setIsBreathingExerciseOpen(false)}
      />
    </div>
  );
};

export default Index;
