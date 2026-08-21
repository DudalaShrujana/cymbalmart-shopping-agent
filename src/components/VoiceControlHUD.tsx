import React, { useState } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  HelpCircle,
  Sparkles,
  ChevronUp,
  ChevronDown,
  AudioWaveform,
  CheckCircle2,
  AlertCircle,
  Command,
} from 'lucide-react';
import { VoiceStatus } from '../types';

interface VoiceControlHUDProps {
  status: VoiceStatus;
  onToggleListening: () => void;
  onToggleTts: () => void;
  onOpenHelp: () => void;
  currentStep: number;
}

export const VoiceControlHUD: React.FC<VoiceControlHUDProps> = ({
  status,
  onToggleListening,
  onToggleTts,
  onOpenHelp,
  currentStep,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStepSuggestion = () => {
    if (currentStep === 1) {
      return 'Try saying: "Plan a backyard BBQ for 20 guests with a budget of 250 dollars" or "Create shopping list"';
    }
    return 'Try saying: "Add 10 lbs ice", "Auto balance budget", "What is my total?", or "Proceed to checkout"';
  };

  return (
    <div
      id="voice-control-hud"
      className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-xl transition-all duration-300 ease-out"
    >
      <div
        className={`rounded-3xl border shadow-2xl backdrop-blur-md transition-all duration-200 ${
          status.isListening
            ? 'bg-[#2D332A]/95 border-[#7C8B71] text-white ring-4 ring-[#7C8B71]/20'
            : 'bg-white/95 border-[#E8E6E1] text-[#2D332A]'
        }`}
      >
        {/* Main Bar */}
        <div className="p-2.5 sm:p-3 flex items-center justify-between gap-2.5">
          {/* Left: Mic Button & Equalizer */}
          <div className="flex items-center gap-2.5">
            <button
              id="btn-voice-toggle-mic"
              onClick={onToggleListening}
              className={`p-3 rounded-full transition-all duration-200 flex items-center justify-center shadow-md active:scale-95 ${
                status.isListening
                  ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
                  : 'bg-[#7C8B71] hover:bg-[#6A7860] text-white'
              }`}
              title={status.isListening ? 'Pause Voice Control' : 'Start Hands-Free Voice Control'}
            >
              {status.isListening ? (
                <Mic className="w-5 h-5" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </button>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold font-serif tracking-tight">
                  {status.isListening ? 'Hands-Free Voice Active' : 'Hands-Free Voice Control'}
                </span>
                {status.isListening && (
                  <span className="flex items-center gap-1 text-[10px] font-bold bg-[#7C8B71] text-white px-2 py-0.2 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                    LISTENING
                  </span>
                )}
              </div>

              {/* Status or live transcript */}
              <div className="text-[11px] truncate max-w-[200px] sm:max-w-xs opacity-90 mt-0.5">
                {status.transcript ? (
                  <span className="font-semibold italic text-[#D5D8D0] flex items-center gap-1">
                    "{status.transcript}"
                  </span>
                ) : status.lastFeedback ? (
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-[#A3B39A] shrink-0" />
                    <span className="truncate">{status.lastFeedback}</span>
                  </span>
                ) : (
                  <span className="text-opacity-75">{getStepSuggestion()}</span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Audio Waveform, TTS Toggle, Cheatsheet, Expand */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* Visual Equalizer bars when listening */}
            {status.isListening && (
              <div className="hidden sm:flex items-center gap-0.5 px-2 py-1 bg-white/10 rounded-full">
                <div className="w-1 h-3.5 bg-[#A3B39A] rounded-full animate-bounce [animation-delay:0ms]" />
                <div className="w-1 h-5 bg-[#A3B39A] rounded-full animate-bounce [animation-delay:150ms]" />
                <div className="w-1 h-2.5 bg-[#A3B39A] rounded-full animate-bounce [animation-delay:300ms]" />
                <div className="w-1 h-4 bg-[#A3B39A] rounded-full animate-bounce [animation-delay:75ms]" />
              </div>
            )}

            {/* Voice Speaker (TTS) Toggle */}
            <button
              onClick={onToggleTts}
              className={`p-2 rounded-full transition ${
                status.isListening
                  ? 'hover:bg-white/15 text-[#D5D8D0]'
                  : 'hover:bg-[#FAF9F6] text-[#8B8881]'
              }`}
              title={status.isTtsEnabled ? 'Mute Assistant Voice' : 'Enable Assistant Voice'}
            >
              {status.isTtsEnabled ? (
                <Volume2 className="w-4 h-4 text-[#7C8B71]" />
              ) : (
                <VolumeX className="w-4 h-4 opacity-50" />
              )}
            </button>

            {/* Cheatsheet Guide Button */}
            <button
              id="btn-voice-commands-help"
              onClick={onOpenHelp}
              className={`p-2 rounded-full transition ${
                status.isListening
                  ? 'hover:bg-white/15 text-[#D5D8D0]'
                  : 'hover:bg-[#FAF9F6] text-[#8B8881]'
              }`}
              title="Voice Commands Guide"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* Expand / Collapse drawer toggle */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`p-2 rounded-full transition ${
                status.isListening
                  ? 'hover:bg-white/15 text-[#D5D8D0]'
                  : 'hover:bg-[#FAF9F6] text-[#8B8881]'
              }`}
              title={isExpanded ? 'Collapse' : 'Show Suggestions'}
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronUp className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Expanded Quick Voice Suggestion Chips */}
        {isExpanded && (
          <div
            className={`px-3.5 pb-3.5 pt-1 border-t text-xs animate-in slide-in-from-bottom-2 duration-150 ${
              status.isListening
                ? 'border-white/15 bg-white/5'
                : 'border-[#E8E6E1] bg-[#FAF9F6]'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase font-bold tracking-wider opacity-75 flex items-center gap-1">
                <Command className="w-3 h-3 text-[#7C8B71]" />
                <span>Hands-Free Commands for this screen</span>
              </span>
              <button
                onClick={onOpenHelp}
                className="text-[10px] font-bold text-[#7C8B71] hover:underline"
              >
                View all commands →
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {currentStep === 1 ? (
                <>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-black/10 border border-white/10">
                    "Plan a BBQ for 20 guests"
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-black/10 border border-white/10">
                    "Set budget to $250"
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-black/10 border border-white/10">
                    "Select Taco template"
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-black/10 border border-white/10">
                    "Create shopping list"
                  </span>
                </>
              ) : (
                <>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-black/10 border border-white/10">
                    "Add 10 lbs ice"
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-black/10 border border-white/10">
                    "Auto balance budget"
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-black/10 border border-white/10">
                    "What is my total?"
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-black/10 border border-white/10">
                    "Proceed to checkout"
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-black/10 border border-white/10">
                    "Place order"
                  </span>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
