import React from 'react';
import { X, Printer, CheckSquare, Clock, ChefHat } from 'lucide-react';
import { EventPlan, EventDetails } from '../types';

interface EventBlueprintModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: EventPlan;
  eventDetails: EventDetails;
}

export const EventBlueprintModal: React.FC<EventBlueprintModalProps> = ({
  isOpen,
  onClose,
  plan,
  eventDetails,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const activeItems = plan.items.filter((i) => !i.alreadyHave);
  const totalCart = activeItems.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

  const defaultTimeline = [
    {
      timeframe: '2 Days Before',
      action: 'Receive or pick up CymbalMart party groceries. Clear space in refrigerator for drink cans and deli platters.',
    },
    {
      timeframe: '1 Day Before',
      action: 'Assemble decor kit and inflate balloon garland. Prepare self-serve drink station with cups and markers for names.',
    },
    {
      timeframe: 'Morning of Event (T-4 Hours)',
      action: 'Fill drink coolers with 50% ice. Set out wipeable tablecloths, plates, napkins, and serving utensils.',
    },
    {
      timeframe: '1 Hour Before',
      action: 'Top off ice buckets. Warm up hot foods (sliders/tacos/burgers). Turn on party playlist & ambient string lights.',
    },
    {
      timeframe: 'Guest Arrival',
      action: 'Welcome guests with signature beverage and easy arrival grazing bites. Relax and enjoy being the host!',
    },
  ];

  const timeline = plan.timelineAdvice && plan.timelineAdvice.length > 0 ? plan.timelineAdvice : defaultTimeline;

  return (
    <div className="fixed inset-0 z-50 bg-[#2D332A]/40 backdrop-blur-xs flex items-center justify-center p-4 print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-[#E8E6E1] overflow-hidden max-h-[92vh] flex flex-col print:max-h-none print:shadow-none print:border-none print:rounded-none">
        {/* Modal Controls (Hidden in Print) */}
        <div className="p-4 bg-[#2D332A] text-white flex items-center justify-between shrink-0 print:hidden border-b border-[#3D453A]">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-[#A3B39A]" />
            <h3 className="text-sm font-serif font-semibold">CymbalMart Party Blueprint & Master Timeline</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-[#7C8B71] hover:bg-[#6A7860] text-white text-xs font-bold rounded-full transition flex items-center gap-1.5 shadow-xs active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Checklist</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-[#A3B39A] hover:text-white hover:bg-[#3D453A] rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Blueprint Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 text-[#2D332A] space-y-6 print:overflow-visible">
          {/* Header */}
          <div className="border-b-2 border-[#2D332A] pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-[#5A6354]">
                CYMBALMART EVENT MASTER BLUEPRINT
              </div>
              <h1 className="text-2xl font-serif font-semibold text-[#2D332A] tracking-tight mt-1">
                {plan.title || `${eventDetails.theme || 'Party'} Blueprint`}
              </h1>
              <div className="text-xs text-[#8B8881] mt-1">
                Theme: <strong className="text-[#2D332A]">{eventDetails.theme || 'Celebration'}</strong> • Type: {eventDetails.partyType}
              </div>
            </div>

            <div className="text-right text-xs bg-[#FAF9F6] p-3 rounded-2xl border border-[#E8E6E1]">
              <div className="font-bold text-[#2D332A]">
                {eventDetails.guestCount} Guests ({eventDetails.adultCount} adults, {eventDetails.kidCount} kids)
              </div>
              <div className="text-[#5A6354] font-bold mt-0.5 font-mono">
                Total Budget Spent: ${totalCart.toFixed(2)} / ${eventDetails.budget}
              </div>
            </div>
          </div>

          {/* Host Day-of Timeline */}
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#2D332A] mb-3">
              <Clock className="w-4 h-4 text-[#7C8B71]" />
              <span>Day-of Host Timeline & Prep Schedule</span>
            </div>
            <div className="space-y-2.5">
              {timeline.map((step, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-[#FAF9F6] border border-[#E8E6E1] text-xs flex items-start gap-3"
                >
                  <span className="font-bold text-[#5A6354] shrink-0 min-w-[130px] sm:min-w-[160px]">
                    {step.timeframe}:
                  </span>
                  <span className="text-[#3D3D3D] leading-relaxed">{step.action}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Portioned Grocery & Supplies Checklist */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#2D332A] mb-3">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-[#7C8B71]" />
                <span>Portioned Shopping Checklist ({plan.items.length} items)</span>
              </div>
              <span className="text-[11px] font-normal text-[#8B8881] lowercase">
                [ ] check off as items are staged
              </span>
            </div>

            <div className="border border-[#E8E6E1] rounded-2xl overflow-hidden divide-y divide-[#E8E6E1] text-xs">
              {plan.items.map((item) => (
                <div key={item.id} className="p-3 flex items-start justify-between gap-3 bg-white hover:bg-[#FAF9F6] transition">
                  <div className="flex items-start gap-2.5 min-w-0 flex-1">
                    <div className="w-4 h-4 rounded border border-[#D1D1CB] mt-0.5 shrink-0 bg-[#FAF9F6]" />
                    <div>
                      <div className="font-bold text-[#2D332A]">
                        {item.name}{' '}
                        {item.alreadyHave && (
                          <span className="font-normal text-[#7C8B71]">(Pantry Stock)</span>
                        )}
                      </div>
                      <div className="text-[11px] text-[#8B8881]">
                        {item.packageUnit} • <span className="italic">{item.portionMath}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-bold text-[#2D332A] font-mono">Qty: {item.quantity}</span>
                    <div className="text-[11px] text-[#8B8881] font-mono">${(item.unitPrice * item.quantity).toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Host Portions Cheatsheet Guide */}
          <div className="p-4 bg-[#FAF9F6] border border-[#E8E6E1] rounded-2xl text-xs space-y-2">
            <div className="font-bold text-[#2D332A] flex items-center gap-1.5">
              <ChefHat className="w-4 h-4 text-[#7C8B71]" />
              <span>CymbalMart Party Host Portion Rules of Thumb:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-[#5A6354] leading-relaxed">
              <li><strong>Beverages:</strong> Plan 2 drinks per guest in hour 1, plus 1 drink per subsequent hour.</li>
              <li><strong>Ice:</strong> 1 lb of ice per person for chilling drinks + 0.5 lb for cups/mixers.</li>
              <li><strong>Food Buffer:</strong> 15% extra portion buffer already calculated into these pack quantities.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
