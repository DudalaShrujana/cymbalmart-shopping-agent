import React, { useState } from 'react';
import {
  X,
  Truck,
  Store,
  CheckCircle2,
  Calendar,
  Tag,
  Sparkles,
  Printer,
  ShieldCheck,
  ShoppingBag,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ShoppingItem, EventDetails, StoreLocation, OrderReceipt } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: ShoppingItem[];
  eventDetails: EventDetails;
  selectedStore: StoreLocation;
  onOpenBlueprint: () => void;
  onOrderComplete: (receipt: OrderReceipt) => void;
  selectedFulfillment?: 'delivery' | 'pickup';
  onFulfillmentChange?: (mode: 'delivery' | 'pickup') => void;
  appliedPromo?: string;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  eventDetails,
  selectedStore,
  onOpenBlueprint,
  onOrderComplete,
  selectedFulfillment,
  onFulfillmentChange,
  appliedPromo,
}) => {
  const [fulfillment, setFulfillment] = useState<'delivery' | 'pickup'>(selectedFulfillment || 'delivery');
  const [deliverySlot, setDeliverySlot] = useState('Today, 4:00 PM - 6:00 PM');
  const [pickupSlot, setPickupSlot] = useState('Today, Ready in 2 hours');
  const [promoCode, setPromoCode] = useState(appliedPromo || '');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [promoMessage, setPromoMessage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cymbalpay' | 'googlepay'>('cymbalpay');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<OrderReceipt | null>(null);

  React.useEffect(() => {
    if (selectedFulfillment) {
      setFulfillment(selectedFulfillment);
    }
  }, [selectedFulfillment]);

  React.useEffect(() => {
    if (appliedPromo) {
      setPromoCode(appliedPromo);
      const code = appliedPromo.trim().toUpperCase();
      const activeItems = items.filter((i) => !i.alreadyHave);
      const sub = activeItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
      if (code === 'CYMBALPARTY15') {
        setAppliedDiscount(sub * 0.15);
        setPromoMessage('CYMBALPARTY15 applied! 15% discount saved.');
      } else if (code === 'FREESHIP') {
        setAppliedDiscount(5.99);
        setPromoMessage('FREESHIP applied! $5.99 delivery fee waived.');
      }
    }
  }, [appliedPromo, items]);

  if (!isOpen) return null;

  const activeItems = items.filter((i) => !i.alreadyHave);
  const subtotal = activeItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  const deliveryFee = fulfillment === 'delivery' ? (appliedDiscount > 5 ? 0 : 5.99) : 0;
  const tax = subtotal * 0.0825;
  const total = Math.max(0, subtotal + tax + deliveryFee - appliedDiscount);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const code = promoCode.trim().toUpperCase();

    if (code === 'CYMBALPARTY15') {
      const discount = subtotal * 0.15;
      setAppliedDiscount(discount);
      setPromoMessage('CYMBALPARTY15 applied! 15% discount saved.');
    } else if (code === 'FREESHIP') {
      setAppliedDiscount(5.99);
      setPromoMessage('FREESHIP applied! $5.99 delivery fee waived.');
    } else if (code === 'GUEST10') {
      setAppliedDiscount(10.0);
      setPromoMessage('GUEST10 applied! $10.00 credit added.');
    } else {
      setPromoMessage('Invalid promo code. Try CYMBALPARTY15 or FREESHIP');
    }
  };

  const handlePlaceOrder = () => {
    setIsSubmitting(true);

    setTimeout(() => {
      // Trigger confetti celebration
      try {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#7C8B71', '#2D332A', '#A87B4F', '#8C6B7E'],
        });
      } catch (e) {
        console.error(e);
      }

      const newReceipt: OrderReceipt = {
        orderNumber: `CYM-${Math.floor(100000 + Math.random() * 900000)}`,
        eventTitle: eventDetails.theme || `${eventDetails.partyType} Event`,
        eventDate: eventDetails.eventDate || 'Saturday, 2:00 PM',
        guestCount: eventDetails.guestCount,
        totalPaid: total,
        discountApplied: appliedDiscount,
        fulfillmentType: fulfillment,
        fulfillmentTime: fulfillment === 'delivery' ? deliverySlot : pickupSlot,
        storeName: selectedStore.name,
        items: activeItems,
        placedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setReceipt(newReceipt);
      setIsSubmitting(false);
      onOrderComplete(newReceipt);
    }, 1200);
  };

  const downloadCalendarFile = () => {
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//CymbalMart//Party Planner Concierge//EN
BEGIN:VEVENT
SUMMARY:${eventDetails.theme || 'Party Celebration'}
DESCRIPTION:CymbalMart Party Plan with ${eventDetails.guestCount} guests. Order ${receipt?.orderNumber}.
DTSTART:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DURATION:PT${eventDetails.durationHours || 3}H
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `CymbalMart-Party-${receipt?.orderNumber}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#2D332A]/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-[#E8E6E1] overflow-hidden animate-in fade-in zoom-in duration-150 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-[#FAF9F6] border-b border-[#E8E6E1] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#7C8B71]/15 text-[#5A6354] rounded-2xl border border-[#7C8B71]/30">
              <ShoppingBag className="w-5 h-5 text-[#7C8B71]" />
            </div>
            <div>
              <h3 className="text-lg font-serif font-semibold text-[#2D332A]">
                {receipt ? 'Order Confirmed!' : 'Refine & Finalize Checkout'}
              </h3>
              <p className="text-xs text-[#8B8881] mt-0.5">
                {receipt
                  ? `Order #${receipt.orderNumber} successfully scheduled`
                  : 'Select fulfillment, apply coupons, and confirm order'}
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

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {receipt ? (
            /* Order Success View */
            <div className="space-y-6 text-center py-2">
              <div className="w-16 h-16 bg-[#7C8B71]/15 text-[#5A6354] rounded-full flex items-center justify-center mx-auto border border-[#7C8B71]/30 shadow-xs">
                <CheckCircle2 className="w-9 h-9 text-[#7C8B71]" />
              </div>

              <div>
                <h4 className="text-2xl font-serif text-[#2D332A] font-medium">Party Supplies Reserved!</h4>
                <p className="text-xs text-[#8B8881] mt-1">
                  We’ve packed your party order for <strong className="text-[#2D332A]">{receipt.guestCount} guests</strong>.
                </p>
              </div>

              {/* Order Card */}
              <div className="p-5 bg-[#FAF9F6] rounded-2xl border border-[#E8E6E1] text-left space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-[#E8E6E1]">
                  <div>
                    <div className="text-[10px] font-bold text-[#8B8881] uppercase tracking-wider">
                      Order Reference
                    </div>
                    <div className="font-mono text-base font-bold text-[#2D332A]">
                      {receipt.orderNumber}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-bold text-[#8B8881] uppercase tracking-wider">
                      Total Charged
                    </div>
                    <div className="text-lg font-bold font-mono text-[#2D332A]">
                      ${receipt.totalPaid.toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[#8B8881] font-medium">Fulfillment Type:</span>
                    <div className="font-bold text-[#2D332A] capitalize flex items-center gap-1.5 mt-0.5">
                      {receipt.fulfillmentType === 'delivery' ? (
                        <Truck className="w-3.5 h-3.5 text-[#7C8B71]" />
                      ) : (
                        <Store className="w-3.5 h-3.5 text-[#A87B4F]" />
                      )}
                      <span>
                        {receipt.fulfillmentType === 'delivery' ? 'Express Delivery' : 'Curbside Pickup'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[#8B8881] font-medium">Scheduled Time:</span>
                    <div className="font-bold text-[#2D332A] mt-0.5">{receipt.fulfillmentTime}</div>
                  </div>
                  <div>
                    <span className="text-[#8B8881] font-medium">Fulfilling Supercenter:</span>
                    <div className="font-bold text-[#2D332A] mt-0.5">{receipt.storeName}</div>
                  </div>
                  <div>
                    <span className="text-[#8B8881] font-medium">Items Included:</span>
                    <div className="font-bold text-[#2D332A] mt-0.5">
                      {receipt.items.length} items packed
                    </div>
                  </div>
                </div>

                {/* Pickup Barcode / Locker Pin */}
                <div className="pt-3 border-t border-[#E8E6E1] flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-dashed border-[#D1D1CB]">
                  <div className="font-mono text-xs tracking-widest text-[#2D332A] font-bold mb-1">
                    |||||| | |||| ||| ||||||| | |||||
                  </div>
                  <span className="text-[10px] text-[#8B8881]">
                    Scan barcode at CymbalMart Drive-Up Pickup Bay or driver handoff
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={downloadCalendarFile}
                  className="flex-1 py-2.5 px-4 bg-white hover:bg-[#FAF9F6] text-[#2D332A] text-xs font-bold border border-[#E8E6E1] rounded-full transition flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Calendar className="w-3.5 h-3.5 text-[#7C8B71]" />
                  <span>Add to Calendar (.ics)</span>
                </button>
                <button
                  onClick={() => {
                    onClose();
                    onOpenBlueprint();
                  }}
                  className="flex-1 py-2.5 px-4 bg-[#2D332A] hover:bg-[#3D453A] text-white text-xs font-bold rounded-full transition flex items-center justify-center gap-1.5 shadow-xs active:scale-95"
                >
                  <Printer className="w-3.5 h-3.5 text-[#A3B39A]" />
                  <span>Print Party Timeline & Blueprint</span>
                </button>
              </div>
            </div>
          ) : (
            /* Checkout Configuration Form */
            <div className="space-y-6">
              {/* Fulfillment Options */}
              <div>
                <label className="block text-xs font-bold text-[#5A6354] uppercase tracking-wider mb-2">
                  1. Choose Fulfillment Method
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFulfillment('delivery')}
                    className={`p-3.5 rounded-2xl border text-left transition flex items-start gap-3 ${
                      fulfillment === 'delivery'
                        ? 'border-[#7C8B71] bg-[#FAF9F6] ring-1 ring-[#7C8B71]'
                        : 'border-[#E8E6E1] bg-white hover:bg-[#FAF9F6]'
                    }`}
                  >
                    <div className="p-2 bg-[#E9EBE6] text-[#5A6354] rounded-xl shrink-0 mt-0.5 border border-[#D1D1CB]">
                      <Truck className="w-4 h-4 text-[#7C8B71]" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#2D332A] flex items-center justify-between">
                        <span>Same-Day Delivery</span>
                        <span className="text-[#5A6354] font-mono">$5.99</span>
                      </div>
                      <div className="text-[11px] text-[#8B8881] mt-0.5 leading-normal">
                        Direct to your door with temperature-controlled ice pack bins.
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFulfillment('pickup')}
                    className={`p-3.5 rounded-2xl border text-left transition flex items-start gap-3 ${
                      fulfillment === 'pickup'
                        ? 'border-[#7C8B71] bg-[#FAF9F6] ring-1 ring-[#7C8B71]'
                        : 'border-[#E8E6E1] bg-white hover:bg-[#FAF9F6]'
                    }`}
                  >
                    <div className="p-2 bg-[#E9EBE6] text-[#5A6354] rounded-xl shrink-0 mt-0.5 border border-[#D1D1CB]">
                      <Store className="w-4 h-4 text-[#7C8B71]" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#2D332A] flex items-center justify-between">
                        <span>Curbside Pickup</span>
                        <span className="text-[#7C8B71] font-bold">FREE</span>
                      </div>
                      <div className="text-[11px] text-[#8B8881] mt-0.5 leading-normal">
                        Loaded straight into your trunk at {selectedStore.name}.
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Time Slot Picker */}
              <div>
                <label className="block text-xs font-bold text-[#5A6354] uppercase tracking-wider mb-2">
                  2. Select Time Window
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    'Today, 2:00 PM - 4:00 PM',
                    'Today, 4:00 PM - 6:00 PM',
                    'Today, 6:00 PM - 8:00 PM',
                    'Tomorrow, 10:00 AM - 12:00 PM',
                  ].map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() =>
                        fulfillment === 'delivery' ? setDeliverySlot(slot) : setPickupSlot(slot)
                      }
                      className={`p-2.5 rounded-xl border text-left font-medium transition ${
                        (fulfillment === 'delivery' ? deliverySlot : pickupSlot) === slot
                          ? 'bg-[#2D332A] text-white border-[#2D332A] shadow-xs'
                          : 'bg-[#FAF9F6] border-[#E8E6E1] text-[#3D3D3D] hover:bg-[#F3F2EE]'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              {/* Promo Code & Discounts */}
              <div>
                <label className="block text-xs font-bold text-[#5A6354] uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-[#7C8B71]" />
                  <span>3. Promo Codes & Member Credits</span>
                </label>
                <form onSubmit={handleApplyPromo} className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Try CYMBALPARTY15, FREESHIP, or GUEST10"
                    className="flex-1 px-3.5 py-2 text-xs bg-[#FAF9F6] border border-[#D1D1CB] rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#7C8B71] font-mono uppercase text-[#2D332A]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#2D332A] hover:bg-[#3D453A] text-white text-xs font-bold rounded-xl transition shrink-0"
                  >
                    Apply
                  </button>
                </form>
                {promoMessage && (
                  <div className="text-[11px] font-semibold text-[#5A6354] mt-1.5">
                    {promoMessage}
                  </div>
                )}
              </div>

              {/* Order Cost Breakdown Table */}
              <div className="p-4 bg-[#FAF9F6] rounded-2xl border border-[#E8E6E1] text-xs space-y-2">
                <div className="flex justify-between text-[#8B8881]">
                  <span>Shopping Subtotal ({activeItems.length} items)</span>
                  <span className="font-mono text-[#2D332A]">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[#8B8881]">
                  <span>Estimated Local Tax (8.25%)</span>
                  <span className="font-mono text-[#2D332A]">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[#8B8881]">
                  <span>Fulfillment Fee</span>
                  <span className="font-mono text-[#2D332A]">{deliveryFee === 0 ? 'FREE' : `$${deliveryFee.toFixed(2)}`}</span>
                </div>
                {appliedDiscount > 0 && (
                  <div className="flex justify-between text-[#5A6354] font-bold">
                    <span>Discounts Applied</span>
                    <span className="font-mono">-${appliedDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-[#E8E6E1] flex justify-between text-sm font-bold text-[#2D332A]">
                  <span>Final Total</span>
                  <span className="text-[#2D332A] text-base font-mono">${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-bold text-[#5A6354] uppercase tracking-wider mb-2">
                  4. Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cymbalpay')}
                    className={`p-2.5 rounded-xl border text-center text-xs font-bold transition ${
                      paymentMethod === 'cymbalpay'
                        ? 'border-[#7C8B71] bg-[#7C8B71]/15 text-[#2D332A]'
                        : 'border-[#E8E6E1] bg-white text-[#5A6354] hover:bg-[#FAF9F6]'
                    }`}
                  >
                    CymbalPay (1-Tap)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-2.5 rounded-xl border text-center text-xs font-bold transition ${
                      paymentMethod === 'card'
                        ? 'border-[#7C8B71] bg-[#7C8B71]/15 text-[#2D332A]'
                        : 'border-[#E8E6E1] bg-white text-[#5A6354] hover:bg-[#FAF9F6]'
                    }`}
                  >
                    Credit / Debit
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('googlepay')}
                    className={`p-2.5 rounded-xl border text-center text-xs font-bold transition ${
                      paymentMethod === 'googlepay'
                        ? 'border-[#7C8B71] bg-[#7C8B71]/15 text-[#2D332A]'
                        : 'border-[#E8E6E1] bg-white text-[#5A6354] hover:bg-[#FAF9F6]'
                    }`}
                  >
                    Google Pay
                  </button>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-4 border-t border-[#E8E6E1] flex items-center justify-between gap-3">
                <div className="text-[11px] text-[#8B8881] flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-[#7C8B71]" />
                  <span>CymbalMart 100% In-Stock Guarantee</span>
                </div>

                <button
                  id="btn-confirm-place-order"
                  onClick={handlePlaceOrder}
                  disabled={isSubmitting}
                  className="px-7 py-3 bg-[#2D332A] hover:bg-[#3D453A] text-white text-xs font-bold rounded-full transition shadow-sm active:scale-95 flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Authorizing Order...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-[#A3B39A]" />
                      <span>Place Party Order (${total.toFixed(2)})</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
