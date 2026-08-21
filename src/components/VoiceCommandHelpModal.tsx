import React from 'react';
import {
  X,
  Mic,
  Sparkles,
  Volume2,
  Check,
  ArrowRight,
  ListPlus,
  TrendingDown,
  ShoppingBag,
  HelpCircle,
  Play,
} from 'lucide-react';

interface VoiceCommandHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTestCommand: (text: string) => void;
}

const COMMAND_CATEGORIES = [
  {
    title: '1. Event Configuration & Planning (Hands-Free)',
    icon: Sparkles,
    color: 'text-amber-700 bg-amber-50 border-amber-200',
    commands: [
      {
        phrase: 'Plan a backyard BBQ for 20 guests with a budget of 250 dollars',
        description: 'Configures theme, guest count, and budget simultaneously',
      },
      {
        phrase: 'Select Taco Fiesta template',
        description: 'Applies preset theme, guests, and portion settings',
      },
      {
        phrase: 'Set guest count to 25',
        description: 'Updates adult and kid guest calculations',
      },
      {
        phrase: 'Set budget to 300 dollars',
        description: 'Updates target party spend ceiling',
      },
      {
        phrase: 'Create shopping list',
        description: 'Generates portion-calculated shopping plan',
      },
    ],
  },
  {
    title: '2. Shopping List & Item Management',
    icon: ListPlus,
    color: 'text-[#5A6354] bg-[#7C8B71]/15 border-[#7C8B71]/30',
    commands: [
      {
        phrase: 'Add 10 lbs ice',
        description: 'Adds portion-calculated ice bags to your list',
      },
      {
        phrase: 'Add organic lemonade 2-pack',
        description: 'Adds item and recalculates budget totals',
      },
      {
        phrase: 'Add more soda',
        description: 'Increases item quantity by 1',
      },
      {
        phrase: 'Remove paper plates',
        description: 'Removes item and updates live cart total',
      },
      {
        phrase: 'I already have napkins at home',
        description: 'Marks item as owned to save money from cart total',
      },
    ],
  },
  {
    title: '3. Budget Intelligence & Voice Readout',
    icon: TrendingDown,
    color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    commands: [
      {
        phrase: 'What is my total?',
        description: 'Speaks current cart total, budget status & room left',
      },
      {
        phrase: 'Auto balance budget',
        description: 'Swaps premium items for CymbalMart Value brand to cut costs',
      },
      {
        phrase: 'Read shopping list',
        description: 'Audibly summarizes your key party items and quantities',
      },
      {
        phrase: 'Ask assistant how much ice I need',
        description: 'Opens CymbalMart Assistant chatbot with your question',
      },
    ],
  },
  {
    title: '4. Checkout & Order Finalization',
    icon: ShoppingBag,
    color: 'text-sky-700 bg-sky-50 border-sky-200',
    commands: [
      {
        phrase: 'Proceed to checkout',
        description: 'Opens finalization screen and fulfillment options',
      },
      {
        phrase: 'Select doorstep delivery',
        description: 'Chooses scheduled home delivery',
      },
      {
        phrase: 'Apply coupon CYMBALPARTY15',
        description: 'Applies 15% discount coupon code',
      },
      {
        phrase: 'Place order',
        description: 'Finalizes and confirms the grocery order',
      },
      {
        phrase: 'Print blueprint',
        description: 'Opens host preparation timeline & printable checklist',
      },
    ],
  },
];

export const VoiceCommandHelpModal: React.FC<VoiceCommandHelpModalProps> = ({
  isOpen,
  onClose,
  onTestCommand,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#2D332A]/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-[#E8E6E1] overflow-hidden animate-in fade-in zoom-in duration-150 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 bg-[#2D332A] text-white flex items-center justify-between shrink-0 border-b border-[#3D453A]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#7C8B71] flex items-center justify-center text-white shadow-xs">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-serif font-semibold">
                  Hands-Free Voice Control Guide
                </h3>
                <span className="text-[10px] font-bold bg-[#7C8B71] text-white px-2 py-0.5 rounded-full">
                  100% Hands-Free
                </span>
              </div>
              <p className="text-xs text-[#A3B39A] mt-0.5">
                Speak naturally or click any command below to test it
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#A3B39A] hover:text-white hover:bg-[#3D453A] rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 p-5 overflow-y-auto space-y-6 bg-[#FAF9F6]">
          {/* Quick Start Tip */}
          <div className="p-3.5 bg-white rounded-2xl border border-[#E8E6E1] flex items-start gap-3 shadow-2xs">
            <div className="p-2 bg-[#7C8B71]/15 rounded-xl shrink-0 mt-0.5">
              <Volume2 className="w-4 h-4 text-[#7C8B71]" />
            </div>
            <div className="text-xs text-[#2D332A]">
              <div className="font-bold mb-0.5">Continuous Hands-Free Experience</div>
              <p className="text-[#8B8881] leading-relaxed">
                When Voice Control is active, the assistant stays listening so you can plan, add items, balance budgets, and complete checkout without touching your keyboard or screen.
              </p>
            </div>
          </div>

          {/* Categories */}
          {COMMAND_CATEGORIES.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <div key={idx} className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg border ${cat.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#2D332A]">
                    {cat.title}
                  </h4>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {cat.commands.map((cmd, cIdx) => (
                    <div
                      key={cIdx}
                      className="p-3 bg-white hover:bg-[#F3F4F1] border border-[#E8E6E1] hover:border-[#7C8B71]/40 rounded-2xl transition flex items-center justify-between gap-3 group"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-mono font-bold text-[#2D332A] flex items-center gap-1.5">
                          <span className="text-[#7C8B71]">“</span>
                          <span>{cmd.phrase}</span>
                          <span className="text-[#7C8B71]">”</span>
                        </div>
                        <div className="text-[11px] text-[#8B8881] mt-0.5">
                          {cmd.description}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          onTestCommand(cmd.phrase);
                          onClose();
                        }}
                        className="px-2.5 py-1.5 bg-[#FAF9F6] group-hover:bg-[#2D332A] text-[#2D332A] group-hover:text-white text-[11px] font-bold rounded-xl border border-[#D1D1CB] group-hover:border-transparent transition flex items-center gap-1 shrink-0 shadow-2xs"
                        title="Simulate this voice command"
                      >
                        <Play className="w-3 h-3 text-[#7C8B71] group-hover:text-white fill-current" />
                        <span>Try</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-[#E8E6E1] flex items-center justify-between shrink-0">
          <div className="text-[11px] text-[#8B8881]">
            Powered by CymbalMart Web Speech & Intelligent Portions Engine
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#2D332A] hover:bg-[#3D453A] text-white text-xs font-bold rounded-full transition"
          >
            Got it, Let's Plan
          </button>
        </div>
      </div>
    </div>
  );
};
