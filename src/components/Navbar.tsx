import React, { useState } from 'react';
import {
  Sparkles,
  ShoppingBag,
  Store,
  Printer,
  RotateCcw,
  MessageSquareHeart,
  CheckCircle2,
  ChevronDown,
  Mic,
  MicOff,
} from 'lucide-react';
import { STORE_LOCATIONS } from '../data/catalog';
import { StoreLocation } from '../types';

interface NavbarProps {
  selectedStore: StoreLocation;
  onSelectStore: (store: StoreLocation) => void;
  cartItemCount: number;
  cartTotal: number;
  budget: number;
  currentStep: number;
  onOpenChat: () => void;
  onOpenBlueprint: () => void;
  onResetEvent: () => void;
  onGoToStep: (step: number) => void;
  isVoiceListening?: boolean;
  onToggleVoice?: () => void;
  onOpenVoiceHelp?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  selectedStore,
  onSelectStore,
  cartItemCount,
  cartTotal,
  budget,
  currentStep,
  onOpenChat,
  onOpenBlueprint,
  onResetEvent,
  onGoToStep,
  isVoiceListening = false,
  onToggleVoice,
  onOpenVoiceHelp,
}) => {
  const [storeDropdownOpen, setStoreDropdownOpen] = useState(false);

  const budgetDelta = budget - cartTotal;
  const isOverBudget = budgetDelta < 0;

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-[#E8E6E1] shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
      {/* Top Banner / Store status */}
      <div className="bg-[#2D332A] text-[#FAF9F6] text-xs px-4 sm:px-8 py-1.5 flex flex-wrap items-center justify-between gap-2 border-b border-[#3D453A]">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 font-medium text-[#A3B39A]">
            <span className="w-2 h-2 rounded-full bg-[#7C8B71] animate-pulse"></span>
            CymbalMart Assistant
          </span>
          <span className="hidden md:inline text-[#6E786B]">•</span>
          <span className="hidden md:inline text-[#D5D8D0] text-[11px]">
            Same-Day Party Delivery & Curbside Pickup Available
          </span>
        </div>

        {/* Store Location Selector */}
        <div className="relative">
          <button
            id="store-selector-btn"
            onClick={() => setStoreDropdownOpen(!storeDropdownOpen)}
            className="flex items-center gap-1.5 text-[#FAF9F6] hover:text-white hover:bg-[#3D453A] px-2.5 py-0.5 rounded-lg transition text-xs"
          >
            <Store className="w-3.5 h-3.5 text-[#A3B39A]" />
            <span className="font-medium truncate max-w-[190px] sm:max-w-[280px]">
              {selectedStore.name}
            </span>
            <ChevronDown className="w-3 h-3 text-[#A3B39A]" />
          </button>

          {storeDropdownOpen && (
            <div className="absolute right-0 mt-1 w-80 bg-white rounded-xl shadow-xl border border-[#E8E6E1] py-2 z-50 text-[#3D3D3D]">
              <div className="px-3 py-1.5 border-b border-[#E8E6E1] text-[11px] font-bold text-[#8B8881] uppercase tracking-wider">
                Select Your CymbalMart Store
              </div>
              {STORE_LOCATIONS.map((st) => (
                <button
                  key={st.id}
                  onClick={() => {
                    onSelectStore(st);
                    setStoreDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 hover:bg-[#FAF9F6] flex items-start gap-2.5 transition ${
                    st.id === selectedStore.id ? 'bg-[#F3F2EE] border-l-3 border-[#7C8B71]' : ''
                  }`}
                >
                  <Store className="w-4 h-4 text-[#7C8B71] mt-0.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-[#2D332A] flex items-center justify-between">
                      <span>{st.name}</span>
                      <span className="text-[11px] font-normal text-[#8B8881]">{st.distance}</span>
                    </div>
                    <div className="text-[11px] text-[#8B8881] truncate">{st.address}, {st.city}</div>
                    <div className="text-[10px] text-[#5A6354] font-semibold mt-0.5">
                      {st.pickupReadyTime} • {st.deliveryWindow}
                    </div>
                  </div>
                  {st.id === selectedStore.id && (
                    <CheckCircle2 className="w-4 h-4 text-[#7C8B71] shrink-0 mt-0.5" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main App Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 gap-4">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onGoToStep(1)}
              className="flex items-center gap-3 group text-left focus:outline-none"
            >
              <div className="w-10 h-10 bg-[#7C8B71] rounded-full flex items-center justify-center text-white font-bold text-xl shadow-xs group-hover:bg-[#6E7C64] transition">
                C
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-serif font-bold tracking-tight text-[#2D332A]">
                    CymbalMart Shopping Agent
                  </h1>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#7C8B71]/15 text-[#5A6354] border border-[#7C8B71]/30">
                    Retail AI
                  </span>
                </div>
                <p className="text-[10px] text-[#8B8881] uppercase tracking-widest font-semibold">
                  Smart Party Planning & Budget Assistant
                </p>
              </div>
            </button>
          </div>

          {/* Stepper Navigation */}
          <nav className="hidden lg:flex items-center gap-1.5 bg-[#F3F2EE] p-1 rounded-full border border-[#E8E6E1]">
            <button
              id="nav-step-1"
              onClick={() => onGoToStep(1)}
              className={`px-4 py-1.5 text-xs font-bold rounded-full transition flex items-center gap-1.5 ${
                currentStep === 1
                  ? 'bg-white text-[#2D332A] shadow-xs border border-[#E8E6E1]'
                  : 'text-[#8B8881] hover:text-[#2D332A]'
              }`}
            >
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                currentStep === 1 ? 'bg-[#7C8B71] text-white' : 'bg-[#E8E6E1] text-[#8B8881]'
              }`}>
                1
              </span>
              Define Event
            </button>
            <span className="text-[#D1D1CB] text-xs">•</span>
            <button
              id="nav-step-2"
              onClick={() => onGoToStep(2)}
              className={`px-4 py-1.5 text-xs font-bold rounded-full transition flex items-center gap-1.5 ${
                currentStep === 2
                  ? 'bg-white text-[#2D332A] shadow-xs border border-[#E8E6E1]'
                  : 'text-[#8B8881] hover:text-[#2D332A]'
              }`}
            >
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                currentStep === 2 ? 'bg-[#7C8B71] text-white' : 'bg-[#E8E6E1] text-[#8B8881]'
              }`}>
                2
              </span>
              Review List
              {cartItemCount > 0 && (
                <span className="bg-[#7C8B71] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {cartItemCount}
                </span>
              )}
            </button>
            <span className="text-[#D1D1CB] text-xs">•</span>
            <button
              id="nav-step-3"
              onClick={() => onGoToStep(3)}
              className={`px-4 py-1.5 text-xs font-bold rounded-full transition flex items-center gap-1.5 ${
                currentStep === 3
                  ? 'bg-white text-[#2D332A] shadow-xs border border-[#E8E6E1]'
                  : 'text-[#8B8881] hover:text-[#2D332A]'
              }`}
            >
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                currentStep === 3 ? 'bg-[#7C8B71] text-white' : 'bg-[#E8E6E1] text-[#8B8881]'
              }`}>
                3
              </span>
              Refine & Checkout
            </button>
          </nav>

          {/* Action Bar & Budget Counter */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live Budget Counter */}
            {budget > 0 && (
              <div
                onClick={() => onGoToStep(2)}
                className={`cursor-pointer px-3.5 py-1.5 rounded-xl border text-right hidden sm:block transition ${
                  isOverBudget
                    ? 'bg-rose-50 border-rose-200 text-rose-800'
                    : 'bg-[#FAF9F6] border-[#E8E6E1] text-[#2D332A] hover:bg-[#F3F2EE]'
                }`}
              >
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#8B8881] flex items-center justify-end gap-1">
                  <ShoppingBag className="w-3 h-3 text-[#7C8B71]" />
                  <span>Cart Total: ${cartTotal.toFixed(2)}</span>
                </div>
                <div className="text-xs font-bold font-mono">
                  {isOverBudget ? (
                    <span className="text-rose-600">
                      ${Math.abs(budgetDelta).toFixed(2)} over
                    </span>
                  ) : (
                    <span className="text-[#5A6354]">
                      ${budgetDelta.toFixed(2)} left (${budget.toFixed(0)} budget)
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Voice Control Button */}
            {onToggleVoice && (
              <button
                id="btn-navbar-voice-toggle"
                onClick={onToggleVoice}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-full transition active:scale-95 shadow-xs ${
                  isVoiceListening
                    ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
                    : 'bg-white hover:bg-[#FAF9F6] text-[#2D332A] border border-[#E8E6E1]'
                }`}
                title={isVoiceListening ? 'Pause Voice Control' : 'Start Hands-Free Voice Control'}
              >
                <Mic className={`w-3.5 h-3.5 ${isVoiceListening ? 'text-white' : 'text-[#7C8B71]'}`} />
                <span className="hidden sm:inline">
                  {isVoiceListening ? 'Voice Listening...' : 'Voice Control'}
                </span>
              </button>
            )}

            {/* CymbalMart Assistant Button */}
            <button
              id="btn-open-ai-chat"
              onClick={onOpenChat}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#2D332A] bg-[#E9EBE6] hover:bg-[#E1E4DC] border border-[#D1D1CB] rounded-full transition active:scale-95 shadow-xs"
              title="Open CymbalMart Assistant"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#7C8B71]" />
              <span className="hidden sm:inline">CymbalMart Assistant</span>
            </button>

            {/* Print Blueprint */}
            {cartItemCount > 0 && (
              <button
                id="btn-open-blueprint"
                onClick={onOpenBlueprint}
                className="hidden md:flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#3D3D3D] bg-white hover:bg-[#F3F2EE] border border-[#E8E6E1] rounded-full transition active:scale-95 shadow-xs"
                title="Print Party Blueprint & Prep Timeline"
              >
                <Printer className="w-3.5 h-3.5 text-[#8B8881]" />
                <span>Blueprint</span>
              </button>
            )}

            {/* Reset / New Event */}
            <button
              id="btn-reset-event"
              onClick={onResetEvent}
              className="p-2 text-[#8B8881] hover:text-[#2D332A] hover:bg-[#F3F2EE] rounded-full transition"
              title="Start New Party Plan"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
