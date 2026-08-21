import React, { useState } from 'react';
import { DollarSign, TrendingDown, TrendingUp, Sparkles, CheckCircle, ArrowUpRight, Zap, RefreshCw } from 'lucide-react';
import { ShoppingItem, EventDetails, CategoryId } from '../types';

interface BudgetSummaryCardProps {
  items: ShoppingItem[];
  eventDetails: EventDetails;
  onOptimizeBudget: (mode: 'reduce_cost' | 'upgrade_premium' | 'exact_match') => Promise<void>;
  isOptimizing: boolean;
}

export const BudgetSummaryCard: React.FC<BudgetSummaryCardProps> = ({
  items,
  eventDetails,
  onOptimizeBudget,
  isOptimizing,
}) => {
  const [showOptimizerOptions, setShowOptimizerOptions] = useState(false);

  // Calculate totals
  const activeItems = items.filter((i) => !i.alreadyHave);
  const homeItems = items.filter((i) => i.alreadyHave);

  const cartTotal = activeItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const homeSavings = homeItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const targetBudget = eventDetails.budget || 150;
  const guestCount = Math.max(1, eventDetails.guestCount || 10);

  const costPerGuest = (cartTotal / guestCount).toFixed(2);
  const budgetDelta = targetBudget - cartTotal;
  const percentSpent = Math.min(150, Math.round((cartTotal / targetBudget) * 100));
  const isOverBudget = budgetDelta < 0;

  // Category totals
  const categoryTotals: Record<CategoryId, number> = {
    food_drinks: 0,
    tableware: 0,
    decor: 0,
    entertainment_favors: 0,
  };

  activeItems.forEach((item) => {
    if (categoryTotals[item.category] !== undefined) {
      categoryTotals[item.category] += item.unitPrice * item.quantity;
    }
  });

  const categoryLabels: Record<CategoryId, { label: string; color: string; dot: string; bg: string }> = {
    food_drinks: { label: 'Food & Beverages', color: 'bg-[#7C8B71]', dot: '#7C8B71', bg: 'text-[#5A6354] bg-[#7C8B71]/10' },
    tableware: { label: 'Tableware & Serveware', color: 'bg-[#A87B4F]', dot: '#A87B4F', bg: 'text-[#8C5E32] bg-[#A87B4F]/10' },
    decor: { label: 'Decor & Atmosphere', color: 'bg-[#8C6B7E]', dot: '#8C6B7E', bg: 'text-[#6D4C61] bg-[#8C6B7E]/10' },
    entertainment_favors: { label: 'Games & Favors', color: 'bg-[#6A8B88]', dot: '#6A8B88', bg: 'text-[#4A6B68] bg-[#6A8B88]/10' },
  };

  return (
    <div className="bg-white rounded-3xl border border-[#E8E6E1] shadow-xs p-5 sm:p-7 mb-6">
      {/* Header & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E8E6E1]">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 bg-[#7C8B71]/15 text-[#5A6354] rounded-lg">
              <DollarSign className="w-4 h-4 text-[#7C8B71]" />
            </span>
            <h2 className="text-xl font-serif text-[#2D332A] font-medium">Live Budget & Portion Alignment</h2>
          </div>
          <p className="text-xs text-[#8B8881] mt-1">
            Real-time balance calculated for {guestCount} guests across {eventDetails.durationHours || 3} hours
          </p>
        </div>

        {/* Dynamic Spend Badge */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#8B8881]">Cart Total</div>
            <div className="text-2xl font-bold font-mono text-[#2D332A]">
              ${cartTotal.toFixed(2)}
            </div>
          </div>
          <div
            className={`px-3.5 py-1.5 rounded-full border text-xs font-bold flex items-center gap-1.5 ${
              isOverBudget
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : 'bg-[#7C8B71]/15 border-[#7C8B71]/30 text-[#2D332A]'
            }`}
          >
            {isOverBudget ? (
              <>
                <TrendingUp className="w-3.5 h-3.5 text-rose-600" />
                <span>${Math.abs(budgetDelta).toFixed(2)} Over</span>
              </>
            ) : (
              <>
                <TrendingDown className="w-3.5 h-3.5 text-[#7C8B71]" />
                <span>${budgetDelta.toFixed(2)} Under Budget</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Progress Bar & Meter */}
      <div className="py-4">
        <div className="flex items-center justify-between text-xs font-semibold mb-2">
          <span className="text-[#5A6354] flex items-center gap-1.5">
            <span className="font-bold">Budget Utilization</span>
            <span className="text-[#8B8881] font-normal font-mono">({percentSpent}% of ${targetBudget.toFixed(0)})</span>
          </span>
          <span className="text-[#2D332A] font-bold font-mono">
            ${costPerGuest} <span className="font-normal text-[#8B8881]">/ guest</span>
          </span>
        </div>

        {/* Multi-segment progress bar */}
        <div className="w-full h-2.5 bg-[#E8E6E1] rounded-full overflow-hidden flex">
          {(['food_drinks', 'tableware', 'decor', 'entertainment_favors'] as CategoryId[]).map(
            (cat) => {
              const catTotal = categoryTotals[cat] || 0;
              const catPercent = targetBudget > 0 ? (catTotal / targetBudget) * 100 : 0;
              if (catPercent <= 0) return null;
              return (
                <div
                  key={cat}
                  style={{ width: `${Math.min(100, catPercent)}%` }}
                  className={`${categoryLabels[cat].color} transition-all duration-300`}
                  title={`${categoryLabels[cat].label}: $${catTotal.toFixed(2)}`}
                />
              );
            }
          )}
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3.5 text-xs">
          {(['food_drinks', 'tableware', 'decor', 'entertainment_favors'] as CategoryId[]).map(
            (cat) => {
              const total = categoryTotals[cat] || 0;
              const pct = cartTotal > 0 ? Math.round((total / cartTotal) * 100) : 0;
              return (
                <div key={cat} className="flex items-center gap-2 p-2 rounded-xl bg-[#FAF9F6] border border-[#E8E6E1]">
                  <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${categoryLabels[cat].color}`} />
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] text-[#8B8881] font-medium truncate">{categoryLabels[cat].label}</div>
                    <div className="font-bold text-[#2D332A] text-xs font-mono">
                      ${total.toFixed(2)} <span className="text-[10px] text-[#8B8881] font-normal">({pct}%)</span>
                    </div>
                  </div>
                </div>
              );
            }
          )}
        </div>
      </div>

      {/* Savings & AI Budget Balancer Actions */}
      <div className="pt-4 border-t border-[#E8E6E1] flex flex-wrap items-center justify-between gap-3">
        {/* Home pantry savings badge */}
        {homeSavings > 0 ? (
          <div className="flex items-center gap-1.5 text-xs text-[#2D332A] bg-[#7C8B71]/15 px-3.5 py-1.5 rounded-full border border-[#7C8B71]/30 font-medium">
            <CheckCircle className="w-3.5 h-3.5 text-[#7C8B71]" />
            <span>Saved <strong className="font-mono">${homeSavings.toFixed(2)}</strong> by checking items already in pantry!</span>
          </div>
        ) : (
          <div className="text-xs text-[#8B8881]">
            Tip: Check <span className="font-semibold text-[#5A6354]">"Have at Home"</span> on any item to save money.
          </div>
        )}

        {/* AI Budget Balancer Button */}
        <div className="relative ml-auto">
          <button
            id="btn-ai-budget-balancer"
            onClick={() => setShowOptimizerOptions(!showOptimizerOptions)}
            disabled={isOptimizing}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#E9EBE6] hover:bg-[#E1E4DC] text-[#2D332A] text-xs font-bold rounded-full border border-[#D1D1CB] transition active:scale-95 shadow-xs"
          >
            {isOptimizing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 text-[#7C8B71] animate-spin" />
                <span>Balancing Budget...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-[#7C8B71]" />
                <span>AI Smart Budget Balancer</span>
                <ArrowUpRight className="w-3 h-3 text-[#5A6354]" />
              </>
            )}
          </button>

          {/* Optimizer Options Dropdown */}
          {showOptimizerOptions && (
            <div className="absolute right-0 bottom-full mb-2 w-76 bg-white rounded-2xl shadow-xl border border-[#E8E6E1] p-2 z-20 text-[#3D3D3D]">
              <div className="px-3 py-1.5 text-[10px] font-bold text-[#8B8881] uppercase tracking-wider">
                Select AI Optimization Goal
              </div>
              <button
                onClick={() => {
                  onOptimizeBudget('reduce_cost');
                  setShowOptimizerOptions(false);
                }}
                className="w-full text-left p-2.5 hover:bg-[#FAF9F6] rounded-xl transition flex items-start gap-2.5"
              >
                <TrendingDown className="w-4 h-4 text-[#7C8B71] mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-[#2D332A]">Maximize Value & Cut Cost</div>
                  <div className="text-[11px] text-[#8B8881]">
                    Swaps branded goods for CymbalMart Value picks & optimizes excess buffer.
                  </div>
                </div>
              </button>
              <button
                onClick={() => {
                  onOptimizeBudget('exact_match');
                  setShowOptimizerOptions(false);
                }}
                className="w-full text-left p-2.5 hover:bg-[#FAF9F6] rounded-xl transition flex items-start gap-2.5"
              >
                <Zap className="w-4 h-4 text-[#A87B4F] mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-[#2D332A]">Hit Exact ${targetBudget} Budget</div>
                  <div className="text-[11px] text-[#8B8881]">
                    Intelligently balances party snacks, decor, and upgrades to match budget.
                  </div>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
