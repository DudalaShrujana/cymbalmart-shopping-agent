import React, { useState } from 'react';
import {
  Utensils,
  Layers,
  Sparkles,
  Gift,
  Plus,
  Trash2,
  ArrowRightLeft,
  Check,
  Home,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Printer,
  Bot,
} from 'lucide-react';
import { ShoppingItem, CategoryId, EventDetails, EventPlan } from '../types';
import { CYMBALMART_CATEGORIES } from '../data/catalog';
import { BudgetTrackerChart } from './BudgetTrackerChart';
import { BudgetSummaryCard } from './BudgetSummaryCard';

interface ShoppingListReviewProps {
  plan: EventPlan;
  eventDetails: EventDetails;
  onUpdateQuantity: (id: string, newQty: number) => void;
  onToggleAlreadyHave: (id: string) => void;
  onRemoveItem: (id: string) => void;
  onOpenSwapModal: (item: ShoppingItem) => void;
  onOpenAddModal: () => void;
  onOptimizeBudget: (mode: 'reduce_cost' | 'upgrade_premium' | 'exact_match') => Promise<void>;
  isOptimizing: boolean;
  onProceedToCheckout: () => void;
  onOpenBlueprint: () => void;
  onEditEventDetails: () => void;
  onOpenAssistant?: () => void;
}

export const ShoppingListReview: React.FC<ShoppingListReviewProps> = ({
  plan,
  eventDetails,
  onUpdateQuantity,
  onToggleAlreadyHave,
  onRemoveItem,
  onOpenSwapModal,
  onOpenAddModal,
  onOptimizeBudget,
  isOptimizing,
  onProceedToCheckout,
  onOpenBlueprint,
  onEditEventDetails,
  onOpenAssistant,
}) => {
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  const toggleCategoryCollapse = (catId: string) => {
    setCollapsedCategories((prev) => ({ ...prev, [catId]: !prev[catId] }));
  };

  const getCategoryIcon = (catId: CategoryId) => {
    switch (catId) {
      case 'food_drinks':
        return <Utensils className="w-4 h-4 text-[#7C8B71]" />;
      case 'tableware':
        return <Layers className="w-4 h-4 text-[#A87B4F]" />;
      case 'decor':
        return <Sparkles className="w-4 h-4 text-[#8C6B7E]" />;
      case 'entertainment_favors':
        return <Gift className="w-4 h-4 text-[#6A8B88]" />;
    }
  };

  const activeItems = plan.items.filter((i) => !i.alreadyHave);
  const cartTotal = activeItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const budgetDelta = eventDetails.budget - cartTotal;
  const isOverBudget = budgetDelta < 0;

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 pb-28">
      {/* Step Header & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-3 py-0.5 bg-[#7C8B71]/15 text-[#5A6354] text-xs font-bold rounded-full border border-[#7C8B71]/30">
              CUJ STEP 2: REVIEW & ALIGN LIST
            </span>
            <span className="text-xs text-[#8B8881] font-medium">
              {eventDetails.guestCount} Guests • {eventDetails.durationHours} Hours
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif text-[#2D332A] font-medium">
            {plan.title || `${eventDetails.theme || 'Party'} Shopping Checklist`}
          </h1>
          <p className="text-xs text-[#8B8881] mt-1 max-w-2xl">
            {plan.themeSummary ||
              'Items curated and portioned specifically for your guest count, dietary constraints, and budget.'}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
          {onOpenAssistant && (
            <button
              onClick={onOpenAssistant}
              className="px-3.5 py-2 bg-[#E9EBE6] hover:bg-[#E1E4DC] text-[#2D332A] text-xs font-bold border border-[#D1D1CB] rounded-full transition shadow-xs flex items-center gap-1.5 active:scale-95"
            >
              <Bot className="w-3.5 h-3.5 text-[#7C8B71]" />
              <span>Ask CymbalMart Assistant</span>
            </button>
          )}
          <button
            onClick={onEditEventDetails}
            className="px-3.5 py-2 bg-white hover:bg-[#FAF9F6] text-[#2D332A] text-xs font-bold border border-[#E8E6E1] rounded-full transition shadow-xs"
          >
            Edit Parameters
          </button>
          <button
            onClick={onOpenAddModal}
            className="px-4 py-2 bg-[#2D332A] hover:bg-[#3D453A] text-white text-xs font-bold rounded-full transition shadow-xs flex items-center gap-1.5 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 text-[#A3B39A]" />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* Visual Budget Tracker (Recharts Bar Chart with Color-Coded Alerts) */}
      <BudgetTrackerChart
        items={plan.items}
        eventDetails={eventDetails}
        onOptimizeBudget={onOptimizeBudget}
        isOptimizing={isOptimizing}
      />

      {/* Host AI Tips Banner (if present) */}
      {plan.hostTips && plan.hostTips.length > 0 && (
        <div className="mb-6 p-4 bg-[#F3F2EE] border border-[#D1D1CB] rounded-3xl">
          <div className="flex items-center gap-2 text-xs font-bold text-[#2D332A] mb-2">
            <Sparkles className="w-4 h-4 text-[#7C8B71]" />
            <span>CymbalMart AI Host Preparation Insights:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#5A6354]">
            {plan.hostTips.map((tip, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-[#7C8B71] font-bold">•</span>
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Live Budget & Portion Balancer Widget */}
      <BudgetSummaryCard
        items={plan.items}
        eventDetails={eventDetails}
        onOptimizeBudget={onOptimizeBudget}
        isOptimizing={isOptimizing}
      />

      {/* Shopping Categories List */}
      <div className="space-y-6">
        {CYMBALMART_CATEGORIES.map((category) => {
          const categoryItems = plan.items.filter((item) => item.category === category.id);
          const categoryTotal = categoryItems
            .filter((i) => !i.alreadyHave)
            .reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

          const isCollapsed = collapsedCategories[category.id] || false;

          return (
            <div
              key={category.id}
              className="bg-white rounded-3xl border border-[#E8E6E1] shadow-xs overflow-hidden"
            >
              {/* Category Header Bar */}
              <div
                onClick={() => toggleCategoryCollapse(category.id)}
                className="p-4 sm:p-5 bg-[#FAF9F6] border-b border-[#E8E6E1] flex items-center justify-between cursor-pointer hover:bg-[#F3F2EE] transition"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-2xl shadow-xs border border-[#E8E6E1]">
                    {getCategoryIcon(category.id)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-serif font-semibold text-[#2D332A]">
                        {category.name}
                      </h2>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-[#E9EBE6] text-[#5A6354] rounded-full border border-[#D1D1CB]">
                        {categoryItems.length} {categoryItems.length === 1 ? 'item' : 'items'}
                      </span>
                    </div>
                    <div className="text-xs text-[#8B8881] hidden sm:block">
                      {category.description}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm font-bold font-mono text-[#2D332A]">
                      ${categoryTotal.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-[#8B8881]">Aisle Total</div>
                  </div>
                  <div className="text-[#8B8881]">
                    {isCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
                  </div>
                </div>
              </div>

              {/* Items in Category */}
              {!isCollapsed && (
                <div className="divide-y divide-[#E8E6E1]">
                  {categoryItems.length === 0 ? (
                    <div className="p-6 text-center text-xs text-[#8B8881]">
                      No items currently in this section.{' '}
                      <button
                        onClick={onOpenAddModal}
                        className="text-[#7C8B71] font-bold hover:underline"
                      >
                        Add one now
                      </button>
                    </div>
                  ) : (
                    categoryItems.map((item) => {
                      const itemTotal = item.unitPrice * item.quantity;

                      return (
                        <div
                          key={item.id}
                          className={`p-4 sm:p-5 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                            item.alreadyHave
                              ? 'bg-[#FAF9F6] opacity-60'
                              : 'bg-white hover:bg-[#FAF9F6]/60'
                          }`}
                        >
                          {/* Item Info */}
                          <div className="flex items-start gap-3 min-w-0 flex-1">
                            {/* "Have at home" toggle checkbox */}
                            <button
                              type="button"
                              onClick={() => onToggleAlreadyHave(item.id)}
                              className={`mt-1 w-5 h-5 rounded-md border flex items-center justify-center transition shrink-0 ${
                                item.alreadyHave
                                  ? 'bg-[#7C8B71] border-[#7C8B71] text-white'
                                  : 'border-[#D1D1CB] hover:border-[#7C8B71] bg-white'
                              }`}
                              title={
                                item.alreadyHave
                                  ? 'Marked as already in pantry (cost excluded from cart)'
                                  : 'Mark if you already have this at home to save budget'
                              }
                            >
                              {item.alreadyHave && <Check className="w-3.5 h-3.5" />}
                            </button>

                            <div className="min-w-0 flex-1">
                              {/* Tags */}
                              <div className="flex flex-wrap items-center gap-1.5 mb-1">
                                {item.brandTier && (
                                  <span className="text-[10px] font-bold px-1.5 py-0.2 bg-[#F3F2EE] text-[#5A6354] rounded">
                                    {item.brandTier}
                                  </span>
                                )}
                                {item.dietaryTag && (
                                  <span className="text-[10px] font-semibold text-[#5A6354] bg-[#7C8B71]/15 px-1.5 py-0.2 rounded border border-[#7C8B71]/30">
                                    {item.dietaryTag}
                                  </span>
                                )}
                                {item.alreadyHave && (
                                  <span className="text-[10px] font-bold text-[#2D332A] bg-[#7C8B71]/20 px-2 py-0.2 rounded-full flex items-center gap-1">
                                    <Home className="w-2.5 h-2.5" />
                                    <span>Already at home (Free)</span>
                                  </span>
                                )}
                              </div>

                              {/* Title */}
                              <div
                                className={`text-sm font-bold text-[#2D332A] ${
                                  item.alreadyHave ? 'line-through text-[#8B8881]' : ''
                                }`}
                              >
                                {item.name}
                              </div>

                              {/* Package & Portion math note */}
                              <div className="text-xs text-[#8B8881] mt-0.5 flex flex-wrap items-center gap-1.5">
                                <span className="font-semibold text-[#5A6354]">{item.packageUnit}</span>
                                <span>•</span>
                                <span className="text-[#8B8881] italic">{item.portionMath}</span>
                              </div>
                            </div>
                          </div>

                          {/* Controls: Swap, Stepper with direct quantity input, Subtotal, Delete */}
                          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E8E6E1]">
                            {/* Swap Button */}
                            <button
                              onClick={() => onOpenSwapModal(item)}
                              className="px-2.5 py-1.5 text-xs font-bold text-[#2D332A] bg-[#E9EBE6] hover:bg-[#E1E4DC] border border-[#D1D1CB] rounded-full transition active:scale-95 flex items-center gap-1"
                              title="Swap for budget value or organic alternative"
                            >
                              <ArrowRightLeft className="w-3 h-3 text-[#7C8B71]" />
                              <span className="hidden sm:inline">Swap Pick</span>
                            </button>

                            {/* Quantity Stepper & Input */}
                            <div className="flex items-center border border-[#D1D1CB] rounded-full bg-[#FAF9F6] overflow-hidden">
                              <button
                                type="button"
                                onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                                className="w-7 h-7 flex items-center justify-center text-[#5A6354] hover:bg-[#E8E6E1] rounded-l-full transition font-bold"
                                title="Decrease quantity"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                min="1"
                                max="99"
                                value={item.quantity}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value, 10);
                                  if (!isNaN(val)) {
                                    onUpdateQuantity(item.id, Math.max(0, val));
                                  }
                                }}
                                className="w-9 text-center text-xs font-bold text-[#2D332A] font-mono bg-transparent focus:outline-none focus:bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                title="Edit quantity directly"
                              />
                              <button
                                type="button"
                                onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                                className="w-7 h-7 flex items-center justify-center text-[#5A6354] hover:bg-[#E8E6E1] rounded-r-full transition font-bold"
                                title="Increase quantity"
                              >
                                +
                              </button>
                            </div>

                            {/* Price / Subtotal */}
                            <div className="text-right min-w-[70px]">
                              <div
                                className={`text-sm font-bold font-mono ${
                                  item.alreadyHave ? 'line-through text-[#8B8881]' : 'text-[#2D332A]'
                                }`}
                              >
                                ${itemTotal.toFixed(2)}
                              </div>
                              <div className="text-[10px] text-[#8B8881] font-mono">
                                ${item.unitPrice.toFixed(2)} ea
                              </div>
                            </div>

                            {/* Delete button */}
                            <button
                              onClick={() => onRemoveItem(item.id)}
                              className="p-1.5 text-[#8B8881] hover:text-rose-600 hover:bg-rose-50 rounded-full transition"
                              title="Remove item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Floating Bottom Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-md border-t border-[#E8E6E1] shadow-2xl p-3 sm:p-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
            <div>
              <div className="text-[10px] font-bold text-[#8B8881] uppercase tracking-wider">
                CymbalMart Cart Total ({activeItems.length} items)
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl sm:text-2xl font-bold font-mono text-[#2D332A]">
                  ${cartTotal.toFixed(2)}
                </span>
                <span className="text-xs font-semibold text-[#8B8881] font-mono">
                  (~${(cartTotal / Math.max(1, eventDetails.guestCount)).toFixed(2)} / guest)
                </span>
              </div>
            </div>

            <div
              className={`px-3 py-1 rounded-full text-xs font-bold border ${
                isOverBudget
                  ? 'bg-rose-50 border-rose-200 text-rose-700'
                  : 'bg-[#7C8B71]/15 border-[#7C8B71]/30 text-[#2D332A]'
              }`}
            >
              {isOverBudget ? (
                <span>+${Math.abs(budgetDelta).toFixed(2)} Over Target</span>
              ) : (
                <span>${budgetDelta.toFixed(2)} Under Budget</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={onOpenBlueprint}
              className="hidden md:flex items-center gap-1.5 px-4 py-2.5 bg-white hover:bg-[#FAF9F6] border border-[#E8E6E1] text-[#2D332A] text-xs font-bold rounded-full transition shadow-xs"
            >
              <Printer className="w-3.5 h-3.5 text-[#7C8B71]" />
              <span>Party Blueprint</span>
            </button>

            <button
              id="btn-proceed-to-checkout"
              onClick={onProceedToCheckout}
              disabled={activeItems.length === 0}
              className="flex-1 sm:flex-none px-7 py-3 bg-[#2D332A] hover:bg-[#3D453A] text-white font-bold text-sm rounded-full shadow-sm hover:shadow transition active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>Refine & Checkout</span>
              <ArrowRight className="w-4 h-4 text-[#A3B39A]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
