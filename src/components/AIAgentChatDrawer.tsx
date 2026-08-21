import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  Sparkles,
  Bot,
  User,
  Lightbulb,
  Plus,
  ArrowRightLeft,
  Check,
  TrendingDown,
} from 'lucide-react';
import { ChatMessage, EventPlan, EventDetails, ShoppingItem } from '../types';

interface AIAgentChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  isLoading: boolean;
  eventDetails: EventDetails;
  plan: EventPlan;
  onAddItem?: (item: ShoppingItem) => void;
  onOptimizeBudget?: (mode: 'reduce_cost' | 'upgrade_premium' | 'exact_match') => Promise<void>;
}

const QUICK_ACTIONS = [
  {
    label: '🧊 Add 10 lbs Ice ($3.49)',
    text: 'Add 10 lbs party ice to my shopping list',
    item: {
      id: 'quick-ice',
      name: 'CymbalMart Pure Ice (10 lb bag)',
      category: 'food_drinks' as const,
      unitPrice: 3.49,
      quantity: 1,
      packageUnit: '10 lb bag',
      portionMath: 'Essential for drink tubs and cooling',
      brandTier: 'CymbalMart Value',
    },
  },
  {
    label: '🍋 Add Lemonade 2-Pack ($5.99)',
    text: 'Add 2 packs of organic lemonade to my list',
    item: {
      id: 'quick-lemonade',
      name: 'Organic Refresh Lemonade (64 fl oz)',
      category: 'food_drinks' as const,
      unitPrice: 2.99,
      quantity: 2,
      packageUnit: '2 x 64 fl oz bottles',
      portionMath: 'Portioned ~2 cups per guest',
      brandTier: 'Cymbal Select',
    },
  },
  {
    label: '✨ Add Party Glow Pack ($8.99)',
    text: 'Add party glow bracelets to my checklist',
    item: {
      id: 'quick-glow',
      name: 'Multi-Color Neon Glow Bracelet Pack (50 ct)',
      category: 'entertainment_favors' as const,
      unitPrice: 8.99,
      quantity: 1,
      packageUnit: '50 bracelets + connectors',
      portionMath: '3 glow bracelets per guest',
      brandTier: 'CymbalMart Value',
    },
  },
  {
    label: '🍽️ Add Heavy-Duty Paper Plates ($6.49)',
    text: 'Add extra heavy-duty paper plates',
    item: {
      id: 'quick-plates',
      name: 'Eco-Compostable Heavy Duty Plates (50 ct)',
      category: 'tableware' as const,
      unitPrice: 6.49,
      quantity: 1,
      packageUnit: '50 ct pack',
      portionMath: '2 plates per guest + buffer',
      brandTier: 'Cymbal Select',
    },
  },
];

const SUGGESTED_QUESTIONS = [
  'How much ice & drinks do I need for this party?',
  'How can I save money on this list without reducing food?',
  'Suggest 3 fun party games for these guests',
  'What is an easy signature mocktail recipe for this theme?',
  'Give me a day-of prep timeline schedule',
];

export const AIAgentChatDrawer: React.FC<AIAgentChatDrawerProps> = ({
  isOpen,
  onClose,
  messages,
  onSendMessage,
  isLoading,
  eventDetails,
  plan,
  onAddItem,
  onOptimizeBudget,
}) => {
  const [inputText, setInputText] = useState('');
  const [addedItemNotice, setAddedItemNotice] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const handleQuickQuestion = (q: string) => {
    if (isLoading) return;
    onSendMessage(q);
  };

  const handleQuickAdd = (action: typeof QUICK_ACTIONS[0]) => {
    if (onAddItem) {
      onAddItem({
        ...action.item,
        id: `${action.item.id}-${Date.now()}`,
      });
      setAddedItemNotice(`Added "${action.item.name}" to your list! Budget recalculated.`);
      setTimeout(() => setAddedItemNotice(null), 3000);
    }
  };

  const activeItems = plan.items.filter((i) => !i.alreadyHave);
  const cartTotal = activeItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const budgetDelta = eventDetails.budget - cartTotal;
  const isOverBudget = budgetDelta < 0;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#2D332A]/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-[#E8E6E1] animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 bg-[#2D332A] text-white flex items-center justify-between shrink-0 border-b border-[#3D453A]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#7C8B71] flex items-center justify-center text-white shadow-xs">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-serif font-semibold">CymbalMart Assistant</h3>
                <span className="text-[9px] font-bold bg-[#7C8B71] text-white px-1.5 py-0.2 rounded-full">
                  ONLINE
                </span>
              </div>
              <p className="text-[11px] text-[#A3B39A]">
                Portions, live budget updates & item assistant
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#A3B39A] hover:text-white hover:bg-[#3D453A] rounded-lg transition"
            title="Close Assistant"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Shopping List & Budget Status Header */}
        <div className="px-4 py-2.5 bg-[#FAF9F6] border-b border-[#E8E6E1] flex items-center justify-between text-xs text-[#2D332A] shrink-0">
          <div>
            <div className="font-bold text-[#2D332A]">
              {eventDetails.theme || 'Party'} Shopping List
            </div>
            <div className="text-[10px] text-[#8B8881]">
              {activeItems.length} items • {eventDetails.guestCount} guests
            </div>
          </div>
          <div className="text-right">
            <div className="font-bold font-mono text-xs">
              ${cartTotal.toFixed(2)}{' '}
              <span className="text-[10px] text-[#8B8881] font-normal">/ ${eventDetails.budget}</span>
            </div>
            <div
              className={`text-[10px] font-bold ${
                isOverBudget ? 'text-rose-600' : 'text-[#7C8B71]'
              }`}
            >
              {isOverBudget
                ? `+$${Math.abs(budgetDelta).toFixed(2)} Over`
                : `$${budgetDelta.toFixed(2)} Left`}
            </div>
          </div>
        </div>

        {/* Dynamic Notification Toast inside Drawer */}
        {addedItemNotice && (
          <div className="px-4 py-2 bg-[#7C8B71]/20 border-b border-[#7C8B71]/30 text-xs font-semibold text-[#2D332A] flex items-center gap-1.5 animate-in fade-in">
            <Check className="w-3.5 h-3.5 text-[#7C8B71]" />
            <span>{addedItemNotice}</span>
          </div>
        )}

        {/* Message Thread */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#FAF9F6]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-[#7C8B71] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-[#2D332A] text-white font-medium rounded-tr-xs shadow-xs'
                    : 'bg-white text-[#3D3D3D] border border-[#E8E6E1] rounded-tl-xs shadow-xs'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
                <div
                  className={`text-[9px] mt-1.5 text-right ${
                    msg.role === 'user' ? 'text-[#A3B39A]' : 'text-[#8B8881]'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>

              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-full bg-[#3D3D3D] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-[#5A6354] bg-white p-3 rounded-2xl border border-[#E8E6E1] w-fit shadow-xs">
              <div className="w-3.5 h-3.5 border-2 border-[#7C8B71] border-t-transparent rounded-full animate-spin"></div>
              <span>CymbalMart Assistant is preparing response...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 1-Click Shopping List Action Buttons */}
        <div className="p-3 bg-white border-t border-[#E8E6E1] shrink-0">
          <div className="text-[10px] font-bold text-[#8B8881] uppercase tracking-wider mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Plus className="w-3 h-3 text-[#7C8B71]" />
              <span>Quick Add to Shopping List</span>
            </span>
            {onOptimizeBudget && (
              <button
                onClick={() => onOptimizeBudget('reduce_cost')}
                className="text-[10px] font-bold text-[#7C8B71] hover:underline flex items-center gap-0.5"
              >
                <TrendingDown className="w-3 h-3" />
                <span>Auto-Cut Cost</span>
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {QUICK_ACTIONS.map((action, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickAdd(action)}
                className="text-[11px] font-medium bg-[#FAF9F6] hover:bg-[#E9EBE6] text-[#2D332A] px-2.5 py-1.5 rounded-xl border border-[#E8E6E1] transition text-left flex items-center justify-between gap-1 shadow-2xs"
              >
                <span className="truncate">{action.label}</span>
                <Plus className="w-3 h-3 text-[#7C8B71] shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Suggested Quick Prompt Chips */}
        <div className="px-3 pb-2 bg-white shrink-0">
          <div className="text-[10px] font-bold text-[#8B8881] uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <Lightbulb className="w-3 h-3 text-[#7C8B71]" />
            <span>Ask CymbalMart Assistant</span>
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
            {SUGGESTED_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickQuestion(q)}
                disabled={isLoading}
                className="text-[11px] font-medium bg-[#FAF9F6] hover:bg-[#E9EBE6] hover:text-[#2D332A] text-[#5A6354] px-2.5 py-1 rounded-full border border-[#E8E6E1] transition text-left"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-[#E8E6E1] shrink-0">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask CymbalMart Assistant anything..."
              disabled={isLoading}
              className="flex-1 px-3.5 py-2 text-xs bg-[#FAF9F6] border border-[#D1D1CB] rounded-full focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#7C8B71] text-[#2D332A]"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="p-2.5 bg-[#2D332A] hover:bg-[#3D453A] text-white rounded-full transition disabled:opacity-40 shadow-xs"
              title="Send Message"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
