import React from 'react';
import { X, ArrowRightLeft, Check } from 'lucide-react';
import { ShoppingItem, ItemAlternative } from '../types';

interface ItemSwapModalProps {
  item: ShoppingItem | null;
  onClose: () => void;
  onApplySwap: (originalItem: ShoppingItem, alternative: ItemAlternative) => void;
}

export const ItemSwapModal: React.FC<ItemSwapModalProps> = ({
  item,
  onClose,
  onApplySwap,
}) => {
  if (!item) return null;

  const alternatives = item.alternatives || [
    {
      id: `alt-val-${item.id}`,
      name: `CymbalMart Everyday Essentials ${item.name.replace(/Artisan|Select|Premium/g, '').trim()}`,
      unitPrice: Math.max(1.99, +(item.unitPrice * 0.72).toFixed(2)),
      packageUnit: item.packageUnit,
      tier: 'Budget Value' as const,
      reason: `Save $${(item.unitPrice - item.unitPrice * 0.72).toFixed(2)} per unit with CymbalMart Store Brand`,
    },
    {
      id: `alt-org-${item.id}`,
      name: `Cymbal Pure Organic ${item.name.replace(/Artisan|Select|Value/g, '').trim()}`,
      unitPrice: +(item.unitPrice * 1.25).toFixed(2),
      packageUnit: item.packageUnit,
      tier: 'Organic / Gourmet' as const,
      reason: '100% USDA Organic certified ingredient selection',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-[#2D332A]/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-[#E8E6E1] overflow-hidden animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-[#FAF9F6] border-b border-[#E8E6E1] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#7C8B71]/15 text-[#5A6354] rounded-2xl border border-[#7C8B71]/30">
              <ArrowRightLeft className="w-5 h-5 text-[#7C8B71]" />
            </div>
            <div>
              <h3 className="text-lg font-serif font-semibold text-[#2D332A]">Smart Product Swap</h3>
              <p className="text-xs text-[#8B8881]">
                Choose budget savings or gourmet dietary alternatives
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#8B8881] hover:text-[#2D332A] hover:bg-[#E8E6E1] rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Item Overview */}
        <div className="p-5 border-b border-[#E8E6E1] bg-[#FAF9F6]">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#8B8881] mb-1">
            Currently Selected in Cart:
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-bold text-sm text-[#2D332A]">{item.name}</div>
              <div className="text-xs text-[#8B8881] mt-0.5">{item.packageUnit} • {item.portionMath}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold font-mono text-[#2D332A]">${item.unitPrice.toFixed(2)}</div>
              <div className="text-[11px] text-[#8B8881] font-mono">Qty: {item.quantity} (${(item.unitPrice * item.quantity).toFixed(2)})</div>
            </div>
          </div>
        </div>

        {/* Alternatives List */}
        <div className="p-5 sm:p-6 space-y-3 max-h-80 overflow-y-auto">
          <div className="text-xs font-bold text-[#5A6354] uppercase tracking-wider mb-2">
            Available CymbalMart Swaps:
          </div>

          {alternatives.map((alt) => {
            const priceDiff = alt.unitPrice - item.unitPrice;
            const totalDiff = priceDiff * item.quantity;
            const isCheaper = priceDiff < 0;

            return (
              <div
                key={alt.id}
                className="p-4 rounded-2xl border border-[#E8E6E1] hover:border-[#7C8B71] hover:bg-[#FAF9F6] transition flex flex-col justify-between gap-3 group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          alt.tier === 'Budget Value'
                            ? 'bg-[#7C8B71]/15 text-[#5A6354] border border-[#7C8B71]/30'
                            : alt.tier === 'Organic / Gourmet'
                            ? 'bg-[#A87B4F]/15 text-[#8C5E32] border border-[#A87B4F]/30'
                            : 'bg-[#8C6B7E]/15 text-[#6D4C61] border border-[#8C6B7E]/30'
                        }`}
                      >
                        {alt.tier}
                      </span>
                      {isCheaper && (
                        <span className="text-[10px] font-bold text-[#5A6354] flex items-center font-mono">
                          Save ${Math.abs(totalDiff).toFixed(2)} total
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-bold text-[#2D332A] group-hover:text-[#7C8B71] transition">
                      {alt.name}
                    </div>
                    <div className="text-xs text-[#8B8881] mt-0.5">{alt.packageUnit}</div>
                    <div className="text-xs text-[#5A6354] italic mt-1">{alt.reason}</div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-sm font-bold font-mono text-[#2D332A]">
                      ${alt.unitPrice.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-[#8B8881]">ea</div>
                  </div>
                </div>

                <div className="pt-2.5 border-t border-[#E8E6E1] flex items-center justify-between">
                  <span className="text-xs text-[#8B8881]">
                    New Line Total: <strong className="text-[#2D332A] font-mono">${(alt.unitPrice * item.quantity).toFixed(2)}</strong>
                  </span>
                  <button
                    onClick={() => {
                      onApplySwap(item, alt);
                      onClose();
                    }}
                    className="px-3.5 py-1.5 bg-[#2D332A] hover:bg-[#3D453A] text-white text-xs font-bold rounded-full transition active:scale-95 flex items-center gap-1 shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5 text-[#A3B39A]" />
                    <span>Swap to this</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
