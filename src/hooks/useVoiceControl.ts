import { useState, useEffect, useCallback, useRef } from 'react';
import { VoiceStatus, EventDetails, ShoppingItem, PartyTemplate, OrderReceipt } from '../types';
import { voiceSpeechService } from '../utils/voiceSpeechService';
import { parseVoiceCommand, ParsedVoiceCommand } from '../utils/voiceCommandParser';

interface UseVoiceControlOptions {
  currentStep: number;
  eventDetails: EventDetails;
  items: ShoppingItem[];
  cartTotal: number;
  isCheckoutModalOpen: boolean;
  isChatOpen: boolean;
  onSetEventDetails: (updater: (prev: EventDetails) => EventDetails) => void;
  onApplyTemplate: (template: PartyTemplate) => void;
  onGeneratePlan: (details: EventDetails, useAi: boolean) => void;
  onAddItem: (item: ShoppingItem) => void;
  onUpdateQuantity: (id: string, newQty: number) => void;
  onRemoveItem: (id: string) => void;
  onToggleAlreadyHave: (id: string) => void;
  onOptimizeBudget: (mode: 'reduce_cost' | 'upgrade_premium' | 'exact_match') => Promise<void>;
  onOpenCheckout: () => void;
  onPlaceOrder?: () => void;
  onSelectFulfillment?: (type: 'delivery' | 'pickup') => void;
  onApplyPromoCode?: (code: string) => void;
  onOpenBlueprint: () => void;
  onOpenAssistant: () => void;
  onSendAssistantMessage: (text: string) => Promise<void>;
  onResetEvent: () => void;
  onSetStep: (step: number) => void;
}

export function useVoiceControl(options: UseVoiceControlOptions) {
  const [status, setStatus] = useState<VoiceStatus>({
    isSupported: voiceSpeechService.isSupported(),
    isListening: false,
    isSpeaking: false,
    transcript: '',
    lastCommand: null,
    lastFeedback: null,
    isContinuous: true,
    isTtsEnabled: true,
    confidence: 1,
    error: null,
  });

  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  // Execute a parsed voice command
  const executeCommand = useCallback((parsed: ParsedVoiceCommand) => {
    const opts = optionsRef.current;

    setStatus((prev) => ({
      ...prev,
      lastCommand: parsed.intent,
      lastFeedback: parsed.feedbackText,
      transcript: '',
    }));

    // Voice response
    if (parsed.speakText) {
      setStatus((prev) => ({ ...prev, isSpeaking: true }));
      voiceSpeechService.speak(parsed.speakText, () => {
        setStatus((prev) => ({ ...prev, isSpeaking: false }));
      });
    }

    // Execute state transformations
    switch (parsed.intent) {
      case 'SET_EVENT_DETAILS':
        if (parsed.payload) {
          opts.onSetEventDetails((prev) => ({
            ...prev,
            ...parsed.payload,
          }));
        }
        break;

      case 'SELECT_TEMPLATE':
        if (parsed.payload) {
          opts.onApplyTemplate(parsed.payload);
        }
        break;

      case 'GENERATE_PLAN':
        opts.onGeneratePlan(opts.eventDetails, false);
        break;

      case 'ADD_ITEM':
        if (parsed.payload) {
          opts.onAddItem(parsed.payload);
        }
        break;

      case 'UPDATE_QUANTITY':
        if (parsed.payload) {
          opts.onUpdateQuantity(parsed.payload.id, parsed.payload.newQuantity);
        }
        break;

      case 'REMOVE_ITEM':
        if (parsed.payload) {
          opts.onRemoveItem(parsed.payload.id);
        }
        break;

      case 'TOGGLE_ALREADY_HAVE':
        if (parsed.payload) {
          opts.onToggleAlreadyHave(parsed.payload.id);
        }
        break;

      case 'OPTIMIZE_BUDGET':
        opts.onOptimizeBudget(parsed.payload?.mode || 'reduce_cost');
        break;

      case 'PROCEED_CHECKOUT':
        opts.onOpenCheckout();
        break;

      case 'SELECT_FULFILLMENT':
        if (parsed.payload?.type && opts.onSelectFulfillment) {
          opts.onSelectFulfillment(parsed.payload.type);
        }
        break;

      case 'APPLY_PROMO':
        if (parsed.payload?.code && opts.onApplyPromoCode) {
          opts.onApplyPromoCode(parsed.payload.code);
        }
        break;

      case 'PLACE_ORDER':
        if (opts.onPlaceOrder) {
          opts.onPlaceOrder();
        }
        break;

      case 'OPEN_ASSISTANT':
        opts.onOpenAssistant();
        break;

      case 'ASK_ASSISTANT':
        opts.onOpenAssistant();
        if (parsed.payload?.question) {
          opts.onSendAssistantMessage(parsed.payload.question);
        }
        break;

      case 'PRINT_BLUEPRINT':
        opts.onOpenBlueprint();
        break;

      case 'RESET_EVENT':
        opts.onResetEvent();
        break;

      case 'NAVIGATE_STEP':
        if (parsed.payload?.step) {
          opts.onSetStep(parsed.payload.step);
        }
        break;

      case 'HELP':
        setIsHelpModalOpen(true);
        break;

      default:
        break;
    }
  }, []);

  // Process incoming transcript
  const handleTranscript = useCallback(
    (text: string, isFinal: boolean) => {
      setStatus((prev) => ({ ...prev, transcript: text }));

      if (isFinal && text.trim().length > 1) {
        const opts = optionsRef.current;
        const parsed = parseVoiceCommand(text, {
          currentStep: opts.currentStep,
          eventDetails: opts.eventDetails,
          items: opts.items,
          cartTotal: opts.cartTotal,
          isCheckoutModalOpen: opts.isCheckoutModalOpen,
          isChatOpen: opts.isChatOpen,
        });

        executeCommand(parsed);
      }
    },
    [executeCommand]
  );

  // Set up Speech Service callbacks
  useEffect(() => {
    voiceSpeechService.setCallbacks(
      handleTranscript,
      (newStatus) => {
        setStatus((prev) => ({
          ...prev,
          isListening: newStatus.isListening,
          error: newStatus.error,
        }));
      }
    );
  }, [handleTranscript]);

  const toggleListening = useCallback(() => {
    const isNowListening = voiceSpeechService.toggleListening();
    setStatus((prev) => ({
      ...prev,
      isListening: isNowListening,
      lastFeedback: isNowListening
        ? '🎙️ Voice Control Active. Say "Help" for commands.'
        : 'Voice control paused.',
    }));

    if (isNowListening) {
      voiceSpeechService.speak('CymbalMart Voice Control active. How can I help with your party?');
    }
  }, []);

  const toggleTts = useCallback(() => {
    setStatus((prev) => {
      const nextTts = !prev.isTtsEnabled;
      voiceSpeechService.setTtsEnabled(nextTts);
      return { ...prev, isTtsEnabled: nextTts };
    });
  }, []);

  const triggerDirectCommand = useCallback(
    (text: string) => {
      handleTranscript(text, true);
    },
    [handleTranscript]
  );

  return {
    status,
    isHelpModalOpen,
    setIsHelpModalOpen,
    toggleListening,
    toggleTts,
    triggerDirectCommand,
  };
}
