import React, { useState } from 'react';
import { Bot, Sparkles, MessageCircle, Mic } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { EventForm } from './components/EventForm';
import { ShoppingListReview } from './components/ShoppingListReview';
import { AIAgentChatDrawer } from './components/AIAgentChatDrawer';
import { ItemSwapModal } from './components/ItemSwapModal';
import { AddItemModal } from './components/AddItemModal';
import { CheckoutModal } from './components/CheckoutModal';
import { EventBlueprintModal } from './components/EventBlueprintModal';
import { VoiceControlHUD } from './components/VoiceControlHUD';
import { VoiceCommandHelpModal } from './components/VoiceCommandHelpModal';
import { useVoiceControl } from './hooks/useVoiceControl';
import { STORE_LOCATIONS, DEFAULT_CATALOG_ITEMS } from './data/catalog';
import { PARTY_TEMPLATES } from './data/templates';
import { generateSmartLocalPlan } from './utils/portionMath';
import {
  EventDetails,
  EventPlan,
  ShoppingItem,
  StoreLocation,
  ChatMessage,
  ItemAlternative,
  OrderReceipt,
  PartyTemplate,
} from './types';

export default function App() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedStore, setSelectedStore] = useState<StoreLocation>(STORE_LOCATIONS[0]);

  // Event Configuration State
  const [eventDetails, setEventDetails] = useState<EventDetails>({
    partyType: 'Kids Birthday Party',
    theme: 'Jurassic Dinosaur Adventure',
    budget: 220,
    guestCount: 15,
    adultCount: 5,
    kidCount: 10,
    durationHours: 3,
    dietaryNeeds: ['Nut-Free'],
    vibe: 'Casual Buffet / Finger Foods',
    specialRequests: 'Include dinosaur fossil egg hunt and themed green punch with toy dinosaur favor bags.',
    eventDate: 'This Saturday, 2:00 PM',
  });

  // Event Plan & Items State
  const [plan, setPlan] = useState<EventPlan>(() => {
    const initialItems = generateSmartLocalPlan({
      partyType: 'Kids Birthday Party',
      theme: 'Jurassic Dinosaur Adventure',
      budget: 220,
      guestCount: 15,
      adultCount: 5,
      kidCount: 10,
      durationHours: 3,
      dietaryNeeds: ['Nut-Free'],
      vibe: 'Casual Buffet / Finger Foods',
      specialRequests: '',
    });

    return {
      title: 'Jurassic Dinosaur Adventure Plan',
      themeSummary: 'Complete portion-calculated party checklist for 15 guests with nut-free options and dinosaur activity kits.',
      estimatedTotal: initialItems.reduce((s, i) => s + i.unitPrice * i.quantity, 0),
      hostTips: [
        'Chill green punch and seltzers 24 hours prior.',
        'Set up a dinosaur fossil dig table with paper plates for easy clean up.',
        'Keep 15% extra paper cups at the beverage dispenser with a black Sharpie for guest names.',
      ],
      timelineAdvice: [
        { timeframe: '2 Days Before', action: 'Receive CymbalMart grocery order. Freeze ice packs.' },
        { timeframe: 'Morning of Party', action: 'Inflate Jurassic balloon arch and arrange snack tables.' },
        { timeframe: '1 Hour Before', action: 'Bake/warm dino nuggets and prepare green punch bowl.' },
        { timeframe: 'Guest Arrival', action: 'Distribute explorer name tags and begin dinosaur hunt!' },
      ],
      items: initialItems,
    };
  });

  // UI Modals & Drawers State
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [selectedSwapItem, setSelectedSwapItem] = useState<ShoppingItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isBlueprintModalOpen, setIsBlueprintModalOpen] = useState(false);
  const [completedReceipt, setCompletedReceipt] = useState<OrderReceipt | null>(null);

  // Chat Messages State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      role: 'assistant',
      content:
        '👋 Hi! I am your CymbalMart Assistant. I can help calculate ice & drink portions, suggest budget savings, or update your shopping list directly with real-time budget calculations. How can I help you today?',
      timestamp: 'Just now',
    },
  ]);

  // Action: Generate Plan via Gemini or local mathematical engine
  const handleGeneratePlan = async (details: EventDetails, useAi: boolean) => {
    setIsAiLoading(true);
    setEventDetails(details);

    try {
      if (useAi) {
        const response = await fetch('/api/plan-event', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(details),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.plan && data.plan.items) {
            // Normalize items with IDs if missing
            const normalizedItems: ShoppingItem[] = data.plan.items.map((item: any, idx: number) => ({
              id: item.id || `item-ai-${idx}-${Date.now()}`,
              name: item.name,
              category: item.category || 'food_drinks',
              unitPrice: typeof item.unitPrice === 'number' ? item.unitPrice : 4.99,
              quantity: item.quantity || 1,
              packageUnit: item.packageUnit || '1 pack',
              portionMath: item.portionMath || 'Portioned per guest',
              brandTier: item.brandTier || 'Cymbal Select',
              dietaryTag: item.dietaryTag,
              notes: item.notes,
              alreadyHave: false,
              inStock: true,
            }));

            setPlan({
              title: data.plan.title || `${details.theme} Party Plan`,
              themeSummary: data.plan.themeSummary || 'Tailored to your budget and guest count.',
              estimatedTotal: normalizedItems.reduce((s, i) => s + i.unitPrice * i.quantity, 0),
              hostTips: data.plan.hostTips || [],
              timelineAdvice: data.plan.timelineAdvice || [],
              items: normalizedItems,
            });

            setCurrentStep(2);
            setIsAiLoading(false);
            return;
          }
        }
      }
    } catch (err) {
      console.warn('Falling back to local calculation engine:', err);
    }

    // Local fallback generator
    const localItems = generateSmartLocalPlan(details);
    setPlan({
      title: `${details.theme || details.partyType} Plan`,
      themeSummary: `Curated shopping list for ${details.guestCount} guests with automated portion calculations.`,
      estimatedTotal: localItems.reduce((s, i) => s + i.unitPrice * i.quantity, 0),
      hostTips: [
        `Plan ~${Math.ceil(details.guestCount * 1.2)} lbs of ice for cooling and drinks.`,
        'Set up a self-serve beverage station to keep hosting stress-free.',
        'Wipeable tablecloths save 30 minutes of post-party cleanup.',
      ],
      timelineAdvice: [
        { timeframe: '2 Days Before', action: 'Confirm grocery pickup/delivery order.' },
        { timeframe: 'Morning of Event', action: 'Arrange tables and inflate theme decor.' },
        { timeframe: '1 Hour Before', action: 'Set out appetizers and warm foods.' },
      ],
      items: localItems,
    });

    setCurrentStep(2);
    setIsAiLoading(false);
  };

  // Action: Item Quantity Update
  const handleUpdateQuantity = (id: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(id);
      return;
    }

    setPlan((prev) => {
      const updatedItems = prev.items.map((item) =>
        item.id === id ? { ...item, quantity: newQty } : item
      );
      return {
        ...prev,
        items: updatedItems,
        estimatedTotal: updatedItems
          .filter((i) => !i.alreadyHave)
          .reduce((s, i) => s + i.unitPrice * i.quantity, 0),
      };
    });
  };

  // Action: Toggle "Already Have at Home"
  const handleToggleAlreadyHave = (id: string) => {
    setPlan((prev) => {
      const updatedItems = prev.items.map((item) =>
        item.id === id ? { ...item, alreadyHave: !item.alreadyHave } : item
      );
      return {
        ...prev,
        items: updatedItems,
        estimatedTotal: updatedItems
          .filter((i) => !i.alreadyHave)
          .reduce((s, i) => s + i.unitPrice * i.quantity, 0),
      };
    });
  };

  // Action: Remove Item
  const handleRemoveItem = (id: string) => {
    setPlan((prev) => {
      const updatedItems = prev.items.filter((item) => item.id !== id);
      return {
        ...prev,
        items: updatedItems,
        estimatedTotal: updatedItems
          .filter((i) => !i.alreadyHave)
          .reduce((s, i) => s + i.unitPrice * i.quantity, 0),
      };
    });
  };

  // Action: Add Item from Catalog or Custom
  const handleAddItem = (newItem: ShoppingItem) => {
    setPlan((prev) => {
      const existing = prev.items.find((i) => i.id === newItem.id);
      let updatedItems: ShoppingItem[];

      if (existing) {
        updatedItems = prev.items.map((i) =>
          i.id === newItem.id ? { ...i, quantity: i.quantity + newItem.quantity } : i
        );
      } else {
        updatedItems = [newItem, ...prev.items];
      }

      return {
        ...prev,
        items: updatedItems,
        estimatedTotal: updatedItems
          .filter((i) => !i.alreadyHave)
          .reduce((s, i) => s + i.unitPrice * i.quantity, 0),
      };
    });
  };

  // Action: Apply Item Swap
  const handleApplySwap = (originalItem: ShoppingItem, alternative: ItemAlternative) => {
    setPlan((prev) => {
      const updatedItems = prev.items.map((item) => {
        if (item.id === originalItem.id) {
          return {
            ...item,
            name: alternative.name,
            unitPrice: alternative.unitPrice,
            packageUnit: alternative.packageUnit || item.packageUnit,
            brandTier: alternative.tier === 'Budget Value' ? 'CymbalMart Value' : 'Cymbal Select',
            notes: alternative.reason,
          };
        }
        return item;
      });

      return {
        ...prev,
        items: updatedItems,
        estimatedTotal: updatedItems
          .filter((i) => !i.alreadyHave)
          .reduce((s, i) => s + i.unitPrice * i.quantity, 0),
      };
    });
  };

  // Action: AI Budget Optimizer
  const handleOptimizeBudget = async (mode: 'reduce_cost' | 'upgrade_premium' | 'exact_match') => {
    setIsOptimizing(true);

    try {
      const response = await fetch('/api/optimize-budget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentItems: plan.items,
          targetBudget: eventDetails.budget,
          mode,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.adjustedItems) {
          const newItems: ShoppingItem[] = data.data.adjustedItems.map((item: any, idx: number) => ({
            id: `opt-${idx}-${Date.now()}`,
            name: item.name,
            category: item.category || 'food_drinks',
            unitPrice: item.unitPrice,
            quantity: item.quantity,
            packageUnit: item.packageUnit,
            portionMath: item.portionMath,
            brandTier: item.brandTier || 'CymbalMart Value',
            dietaryTag: item.dietaryTag,
            alreadyHave: false,
          }));

          setPlan((prev) => ({
            ...prev,
            items: newItems,
            estimatedTotal: newItems.reduce((s, i) => s + i.unitPrice * i.quantity, 0),
          }));
          setIsOptimizing(false);
          return;
        }
      }
    } catch (e) {
      console.warn('AI optimizer error, performing local smart value swap:', e);
    }

    // Local smart optimization: swap high-priced brand items for store brand (save 25%)
    setPlan((prev) => {
      const optimized = prev.items.map((item) => {
        if (item.unitPrice > 8 && !item.name.includes('Value')) {
          return {
            ...item,
            name: `CymbalMart Value ${item.name.replace(/Artisan|Select|Premium/g, '').trim()}`,
            unitPrice: +(item.unitPrice * 0.75).toFixed(2),
            brandTier: 'CymbalMart Value',
          };
        }
        return item;
      });

      return {
        ...prev,
        items: optimized,
        estimatedTotal: optimized
          .filter((i) => !i.alreadyHave)
          .reduce((s, i) => s + i.unitPrice * i.quantity, 0),
      };
    });

    setIsOptimizing(false);
  };

  // Action: Chat Assistant
  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setIsAiLoading(true);

    try {
      const response = await fetch('/api/chat-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...chatMessages, userMsg],
          currentPlan: plan,
          eventDetails,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const botMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          role: 'assistant',
          content: data.reply || "I'm ready to help you coordinate your CymbalMart party order!",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setChatMessages((prev) => [...prev, botMsg]);
        setIsAiLoading(false);
        return;
      }
    } catch (e) {
      console.warn('Chat error:', e);
    }

    // Fallback response
    const fallbackBotMsg: ChatMessage = {
      id: `bot-${Date.now()}`,
      role: 'assistant',
      content: `For a party of ${eventDetails.guestCount} guests, our CymbalMart party formula recommends:\n• Drinks: ${Math.ceil(eventDetails.guestCount * 2.5)} units (seltzer/soda/beer)\n• Ice: ${Math.ceil(eventDetails.guestCount * 1.2)} lbs\n• Paper plates & cups: ${Math.ceil(eventDetails.guestCount * 2)} units with 15% safety buffer.\n\nYou can click 'AI Smart Budget Balancer' or swap any item in your list!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setChatMessages((prev) => [...prev, fallbackBotMsg]);
    setIsAiLoading(false);
  };

  // Voice control options & state
  const [voiceFulfillment, setVoiceFulfillment] = useState<'delivery' | 'pickup'>('delivery');
  const [voicePromo, setVoicePromo] = useState<string>('');

  const {
    status: voiceStatus,
    isHelpModalOpen: isVoiceHelpOpen,
    setIsHelpModalOpen: setIsVoiceHelpOpen,
    toggleListening: handleToggleVoiceListening,
    toggleTts: handleToggleVoiceTts,
    triggerDirectCommand: handleTriggerVoiceCommand,
  } = useVoiceControl({
    currentStep,
    eventDetails,
    items: plan.items,
    cartTotal: plan.items.filter((i) => !i.alreadyHave).reduce((s, i) => s + i.unitPrice * i.quantity, 0),
    isCheckoutModalOpen,
    isChatOpen,
    onSetEventDetails: (updater) => setEventDetails(updater),
    onApplyTemplate: (tmpl: PartyTemplate) => {
      setEventDetails((prev) => ({
        ...prev,
        theme: tmpl.theme,
        partyType: tmpl.partyType,
        budget: tmpl.defaultBudget,
        guestCount: tmpl.defaultGuests,
        adultCount: tmpl.adultCount,
        kidCount: tmpl.kidCount,
        durationHours: tmpl.durationHours,
        dietaryNeeds: tmpl.dietaryNeeds,
        vibe: tmpl.vibe,
        specialRequests: tmpl.specialRequests,
      }));
    },
    onGeneratePlan: (details) => handleGeneratePlan(details, false),
    onAddItem: (item) => handleAddItem(item),
    onUpdateQuantity: (id, qty) => handleUpdateQuantity(id, qty),
    onRemoveItem: (id) => handleRemoveItem(id),
    onToggleAlreadyHave: (id) => handleToggleAlreadyHave(id),
    onOptimizeBudget: (mode) => handleOptimizeBudget(mode),
    onOpenCheckout: () => setIsCheckoutModalOpen(true),
    onSelectFulfillment: (type) => setVoiceFulfillment(type),
    onApplyPromoCode: (code) => setVoicePromo(code),
    onOpenBlueprint: () => setIsBlueprintModalOpen(true),
    onOpenAssistant: () => setIsChatOpen(true),
    onSendAssistantMessage: (text) => handleSendMessage(text),
    onResetEvent: () => setCurrentStep(1),
    onSetStep: (step) => setCurrentStep(step),
  });

  const handleResetEvent = () => {
    if (window.confirm('Start a fresh party plan?')) {
      setCurrentStep(1);
    }
  };

  const activeItems = plan.items.filter((i) => !i.alreadyHave);
  const cartTotal = activeItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  return (
    <div className="min-h-screen bg-[#FAF9F6] font-sans text-[#3D3D3D] flex flex-col selection:bg-[#7C8B71] selection:text-white pb-20">
      {/* Navigation Header */}
      <Navbar
        selectedStore={selectedStore}
        onSelectStore={setSelectedStore}
        cartItemCount={activeItems.length}
        cartTotal={cartTotal}
        budget={eventDetails.budget}
        currentStep={currentStep}
        onOpenChat={() => setIsChatOpen(true)}
        onOpenBlueprint={() => setIsBlueprintModalOpen(true)}
        onResetEvent={handleResetEvent}
        onGoToStep={(step) => setCurrentStep(step)}
        isVoiceListening={voiceStatus.isListening}
        onToggleVoice={handleToggleVoiceListening}
        onOpenVoiceHelp={() => setIsVoiceHelpOpen(true)}
      />

      {/* Main Content Area based on CUJ Steps */}
      <main className="flex-1">
        {currentStep === 1 ? (
          <EventForm
            initialDetails={eventDetails}
            onGeneratePlan={handleGeneratePlan}
            isLoading={isAiLoading}
          />
        ) : (
          <ShoppingListReview
            plan={plan}
            eventDetails={eventDetails}
            onUpdateQuantity={handleUpdateQuantity}
            onToggleAlreadyHave={handleToggleAlreadyHave}
            onRemoveItem={handleRemoveItem}
            onOpenSwapModal={(item) => {
              setSelectedSwapItem(item);
              setIsSwapModalOpen(true);
            }}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onOptimizeBudget={handleOptimizeBudget}
            isOptimizing={isOptimizing}
            onProceedToCheckout={() => setIsCheckoutModalOpen(true)}
            onOpenBlueprint={() => setIsBlueprintModalOpen(true)}
            onEditEventDetails={() => setCurrentStep(1)}
            onOpenAssistant={() => setIsChatOpen(true)}
          />
        )}
      </main>

      {/* Floating Hands-Free Voice Control HUD */}
      <VoiceControlHUD
        status={voiceStatus}
        onToggleListening={handleToggleVoiceListening}
        onToggleTts={handleToggleVoiceTts}
        onOpenHelp={() => setIsVoiceHelpOpen(true)}
        currentStep={currentStep}
      />

      {/* Floating CymbalMart Assistant Launcher Button */}
      {!isChatOpen && (
        <button
          id="btn-floating-cymbalmart-assistant"
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-24 sm:bottom-28 right-5 z-30 flex items-center gap-2.5 px-4 py-3 bg-[#2D332A] hover:bg-[#3D453A] text-white rounded-full shadow-2xl border border-[#7C8B71]/40 transition active:scale-95 group"
          title="Chat with CymbalMart Assistant"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-[#A3B39A] group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#7C8B71] rounded-full ring-2 ring-[#2D332A] animate-pulse" />
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-xs font-bold leading-none">CymbalMart Assistant</div>
            <div className="text-[10px] text-[#A3B39A] leading-tight">Portions & budget helper</div>
          </div>
        </button>
      )}

      {/* Modals & Drawers */}
      <AIAgentChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        messages={chatMessages}
        onSendMessage={handleSendMessage}
        isLoading={isAiLoading}
        eventDetails={eventDetails}
        plan={plan}
        onAddItem={handleAddItem}
        onOptimizeBudget={handleOptimizeBudget}
      />

      <ItemSwapModal
        item={selectedSwapItem}
        onClose={() => {
          setIsSwapModalOpen(false);
          setSelectedSwapItem(null);
        }}
        onApplySwap={handleApplySwap}
      />

      <AddItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddItem={handleAddItem}
        existingItemIds={plan.items.map((i) => i.id)}
      />

      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        items={plan.items}
        eventDetails={eventDetails}
        selectedStore={selectedStore}
        selectedFulfillment={voiceFulfillment}
        onFulfillmentChange={(m) => setVoiceFulfillment(m)}
        appliedPromo={voicePromo}
        onOpenBlueprint={() => {
          setIsCheckoutModalOpen(false);
          setIsBlueprintModalOpen(true);
        }}
        onOrderComplete={(rcpt) => setCompletedReceipt(rcpt)}
      />

      <EventBlueprintModal
        isOpen={isBlueprintModalOpen}
        onClose={() => setIsBlueprintModalOpen(false)}
        plan={plan}
        eventDetails={eventDetails}
      />

      <VoiceCommandHelpModal
        isOpen={isVoiceHelpOpen}
        onClose={() => setIsVoiceHelpOpen(false)}
        onTestCommand={handleTriggerVoiceCommand}
      />
    </div>
  );
}
