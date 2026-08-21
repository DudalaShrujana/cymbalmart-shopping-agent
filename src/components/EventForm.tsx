import React, { useState } from 'react';
import { Sparkles, Users, DollarSign, Clock, Utensils, HeartHandshake, Wand2, Compass, Check, AlertCircle, ArrowRight, Baby, Footprints, Flame, UtensilsCrossed, Wine, Film, Gift } from 'lucide-react';
import { EventDetails, PartyTemplate } from '../types';
import { PARTY_TEMPLATES } from '../data/templates';

interface EventFormProps {
  initialDetails: EventDetails;
  onGeneratePlan: (details: EventDetails, useAi: boolean) => Promise<void>;
  isLoading: boolean;
}

const DIETARY_OPTIONS = [
  'Gluten-Free',
  'Vegetarian',
  'Vegan',
  'Nut-Free',
  'Dairy-Free',
  'Halal',
  'Kosher',
  'Pregnancy-Safe',
];

const PARTY_TYPES = [
  'Kids Birthday Party',
  'Adult Birthday / Milestone',
  'Outdoor BBQ & Cookout',
  'Fiesta / Taco Bar',
  'Cocktail & Tapas Soirée',
  'Baby Shower / Brunch',
  'Game Day / Tailgate',
  'Movie Night & Sleepover',
  'Dinner Party & Wine',
  'Holiday / Seasonal Party',
];

const VIBE_STYLES = [
  { id: 'Casual Buffet / Finger Foods', label: 'Casual Buffet / Finger Foods', desc: 'Self-serve grazing, easy mingling' },
  { id: 'Interactive DIY Food Station', label: 'Interactive DIY Food Station', desc: 'Taco bar, burger build, slider station' },
  { id: 'Passed Hors d’oeuvres & Tapas', label: 'Passed Hors d’oeuvres & Tapas', desc: 'Chic appetizers & cocktail bites' },
  { id: 'Full Plated / Sit-Down Dinner', label: 'Full Course Meal', desc: 'Substantial mains, hearty sides' },
  { id: 'Dessert & Sweet Treat Bar', label: 'Dessert & Refreshments Bar', desc: 'Cupcakes, ice cream, mocktails' },
];

export const EventForm: React.FC<EventFormProps> = ({
  initialDetails,
  onGeneratePlan,
  isLoading,
}) => {
  const [details, setDetails] = useState<EventDetails>(initialDetails);
  const [naturalPrompt, setNaturalPrompt] = useState('');
  const [showAiPromptBox, setShowAiPromptBox] = useState(false);

  const handleApplyTemplate = (template: PartyTemplate) => {
    setDetails({
      partyType: template.partyType,
      theme: template.theme,
      budget: template.defaultBudget,
      guestCount: template.defaultGuests,
      adultCount: template.adultCount,
      kidCount: template.kidCount,
      durationHours: template.durationHours,
      dietaryNeeds: template.dietaryNeeds,
      vibe: template.vibe,
      specialRequests: template.specialRequests,
    });
  };

  const handleGuestCountChange = (adults: number, kids: number) => {
    const safeAdults = Math.max(0, adults);
    const safeKids = Math.max(0, kids);
    const total = Math.max(1, safeAdults + safeKids);
    setDetails((prev) => ({
      ...prev,
      adultCount: safeAdults,
      kidCount: safeKids,
      guestCount: total,
    }));
  };

  const toggleDietary = (diet: string) => {
    setDetails((prev) => {
      const exists = prev.dietaryNeeds.includes(diet);
      return {
        ...prev,
        dietaryNeeds: exists
          ? prev.dietaryNeeds.filter((d) => d !== diet)
          : [...prev.dietaryNeeds, diet],
      };
    });
  };

  const handleParseNaturalPrompt = () => {
    if (!naturalPrompt.trim()) return;

    const lower = naturalPrompt.toLowerCase();

    let guestMatch = lower.match(/(\d+)\s*(guests?|people|kids?|adults?|friends?)/i);
    let budgetMatch = lower.match(/\$(\d+)|(\d+)\s*(dollars|bucks|budget)/i);

    let parsedGuests = guestMatch ? parseInt(guestMatch[1], 10) : details.guestCount;
    let parsedBudget = budgetMatch
      ? parseInt(budgetMatch[1] || budgetMatch[2], 10)
      : details.budget;

    let matchedDietary: string[] = [];
    DIETARY_OPTIONS.forEach((diet) => {
      if (lower.includes(diet.toLowerCase())) {
        matchedDietary.push(diet);
      }
    });

    let detectedPartyType = details.partyType;
    if (lower.includes('birthday') || lower.includes('bday')) detectedPartyType = 'Kids Birthday Party';
    if (lower.includes('bbq') || lower.includes('cookout') || lower.includes('grill')) detectedPartyType = 'Outdoor BBQ & Cookout';
    if (lower.includes('taco') || lower.includes('fiesta')) detectedPartyType = 'Fiesta / Taco Bar';
    if (lower.includes('cocktail') || lower.includes('wine')) detectedPartyType = 'Cocktail & Tapas Soirée';
    if (lower.includes('baby shower') || lower.includes('shower')) detectedPartyType = 'Baby Shower / Brunch';
    if (lower.includes('movie') || lower.includes('cinema')) detectedPartyType = 'Movie Night & Sleepover';

    const updated = {
      ...details,
      partyType: detectedPartyType,
      theme: naturalPrompt.slice(0, 50),
      budget: parsedBudget || details.budget,
      guestCount: parsedGuests || details.guestCount,
      adultCount: Math.round(parsedGuests * 0.7) || details.adultCount,
      kidCount: Math.round(parsedGuests * 0.3) || details.kidCount,
      dietaryNeeds: matchedDietary.length > 0 ? matchedDietary : details.dietaryNeeds,
      specialRequests: naturalPrompt,
    };

    setDetails(updated);
    setShowAiPromptBox(false);
  };

  const costPerGuest = (details.budget / Math.max(1, details.guestCount)).toFixed(2);

  const getTemplateIcon = (iconName: string) => {
    switch (iconName) {
      case 'Footprints': return <Footprints className="w-4 h-4 text-[#7C8B71]" />;
      case 'Flame': return <Flame className="w-4 h-4 text-[#A87B4F]" />;
      case 'UtensilsCrossed': return <UtensilsCrossed className="w-4 h-4 text-[#7C8B71]" />;
      case 'Wine': return <Wine className="w-4 h-4 text-[#8C6B7E]" />;
      case 'Baby': return <Baby className="w-4 h-4 text-[#6A8B88]" />;
      case 'Film': return <Film className="w-4 h-4 text-[#A86B6B]" />;
      default: return <Gift className="w-4 h-4 text-[#7C8B71]" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
      {/* Hero Welcome Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-[#7C8B71]/15 text-[#5A6354] text-xs font-bold rounded-full border border-[#7C8B71]/30 mb-3.5">
          <Sparkles className="w-3.5 h-3.5 text-[#7C8B71]" />
          <span>CUJ STEP 1: DEFINE EVENT & PARAMETERS</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif text-[#2D332A] tracking-tight font-normal">
          Plan Your CymbalMart Party in Minutes
        </h1>
        <p className="text-[#8B8881] text-base mt-2.5 leading-relaxed">
          Tell us about your event, and our AI shopping agent will curate the perfect grocery,
          tableware, decor, and favor checklist mathematically tailored to your guest count and budget.
        </p>
      </div>

      {/* Quick Inspiration Templates */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#7C8B71]" />
            <h2 className="text-xs font-bold text-[#2D332A] uppercase tracking-widest">
              Quick Inspiration Packages (1-Click Load)
            </h2>
          </div>
          <button
            onClick={() => setShowAiPromptBox(!showAiPromptBox)}
            className="text-xs font-bold text-[#5A6354] hover:text-[#2D332A] flex items-center gap-1.5 bg-[#E9EBE6] hover:bg-[#E1E4DC] px-3 py-1.5 rounded-full border border-[#D1D1CB] transition"
          >
            <Wand2 className="w-3.5 h-3.5 text-[#7C8B71]" />
            {showAiPromptBox ? 'Hide Prompt Box' : 'Describe with Custom Prompt'}
          </button>
        </div>

        {/* Natural Language Prompt Drawer */}
        {showAiPromptBox && (
          <div className="mb-6 p-4 bg-[#F3F2EE] border border-[#D1D1CB] rounded-2xl">
            <div className="flex items-center gap-2 text-xs font-bold text-[#2D332A] mb-2">
              <Sparkles className="w-4 h-4 text-[#7C8B71]" />
              <span>Paste or type your event vision in plain English:</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                id="natural-prompt-input"
                type="text"
                value={naturalPrompt}
                onChange={(e) => setNaturalPrompt(e.target.value)}
                placeholder="e.g., Planning an outdoor garden birthday party for 15 guests under $220 with gluten-free options"
                className="flex-1 px-3.5 py-2 text-sm bg-white border border-[#D1D1CB] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#7C8B71] focus:border-[#7C8B71] text-[#3D3D3D]"
              />
              <button
                id="btn-apply-prompt"
                onClick={handleParseNaturalPrompt}
                className="px-5 py-2 bg-[#2D332A] hover:bg-[#3D453A] text-[#FAF9F6] text-xs font-bold rounded-xl transition active:scale-95 flex items-center justify-center gap-1.5 shrink-0 shadow-xs"
              >
                <Wand2 className="w-3.5 h-3.5 text-[#A3B39A]" />
                Auto-Fill Details
              </button>
            </div>
          </div>
        )}

        {/* Templates Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {PARTY_TEMPLATES.map((tmpl) => (
            <button
              key={tmpl.id}
              onClick={() => handleApplyTemplate(tmpl)}
              className={`p-4 sm:p-4.5 rounded-2xl border text-left transition-all duration-150 flex flex-col justify-between group active:scale-[0.99] ${
                details.theme === tmpl.theme
                  ? 'border-[#7C8B71] bg-[#FAF9F6] shadow-sm ring-2 ring-[#7C8B71]/35'
                  : 'border-[#E8E6E1] bg-white hover:border-[#7C8B71]/50 hover:shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="p-2 bg-[#F3F2EE] group-hover:bg-[#E9EBE6] rounded-xl transition">
                    {getTemplateIcon(tmpl.icon)}
                  </div>
                  <span className="text-[10px] font-bold text-[#5A6354] bg-[#E9EBE6] group-hover:bg-[#E1E4DC] px-2.5 py-0.5 rounded-full border border-[#D1D1CB] transition">
                    {tmpl.badge}
                  </span>
                </div>
                <div className="font-serif font-bold text-[#2D332A] text-base group-hover:text-[#1A1F18] transition">{tmpl.name}</div>
                <div className="text-xs text-[#8B8881] line-clamp-2 mt-1 leading-normal">{tmpl.tagline}</div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#E8E6E1] flex items-center justify-between text-xs text-[#5A6354] font-semibold">
                <span className="text-[11px] text-[#8B8881]">{tmpl.defaultGuests} guests • {tmpl.durationHours}h</span>
                <span className="font-bold text-[#2D332A] text-sm font-mono">${tmpl.defaultBudget}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Event Details Form */}
      <div className="bg-white rounded-3xl border border-[#E8E6E1] shadow-xs p-6 sm:p-8">
        <div className="flex items-center justify-between pb-6 border-b border-[#E8E6E1] mb-6">
          <div>
            <h2 className="text-2xl font-serif text-[#2D332A] font-medium">Event Configuration & Specifications</h2>
            <p className="text-xs text-[#8B8881] mt-1">
              Customize guest demographics, budget, theme, and dietary needs.
            </p>
          </div>
          <div className="text-right hidden sm:block">
            <span className="text-xs text-[#8B8881] uppercase tracking-wider font-semibold">Spending Guide:</span>
            <div className="text-base font-bold text-[#2D332A] font-mono">
              ~${costPerGuest} / guest
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Row 1: Party Type & Theme */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#5A6354] uppercase tracking-wider mb-1.5">
                Event Category
              </label>
              <select
                id="select-party-type"
                value={details.partyType}
                onChange={(e) => setDetails({ ...details, partyType: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-[#FAF9F6] border border-[#D1D1CB] rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#7C8B71] font-medium text-[#2D332A]"
              >
                {PARTY_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#5A6354] uppercase tracking-wider mb-1.5">
                Theme / Atmosphere
              </label>
              <input
                id="input-party-theme"
                type="text"
                value={details.theme}
                onChange={(e) => setDetails({ ...details, theme: e.target.value })}
                placeholder="e.g., Botanical Garden, Vintage Vineyard, Fiesta, Golden Sunset"
                className="w-full px-3.5 py-2.5 text-sm bg-[#FAF9F6] border border-[#D1D1CB] rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#7C8B71] font-medium text-[#2D332A]"
              />
            </div>
          </div>

          {/* Row 2: Budget & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Total Budget Slider & Input */}
            <div className="p-4 bg-[#FAF9F6] border border-[#E8E6E1] rounded-2xl">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-[#5A6354] uppercase tracking-wider flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-[#7C8B71]" />
                  Total Target Budget
                </label>
                <div className="flex items-center gap-1 font-bold text-[#2D332A] text-base font-mono">
                  <span>$</span>
                  <input
                    id="input-budget-number"
                    type="number"
                    min={40}
                    max={2000}
                    step={10}
                    value={details.budget}
                    onChange={(e) =>
                      setDetails({ ...details, budget: Math.max(10, parseInt(e.target.value, 10) || 100) })
                    }
                    className="w-20 px-2 py-0.5 text-right font-bold text-[#2D332A] bg-white border border-[#D1D1CB] rounded-lg focus:ring-1 focus:ring-[#7C8B71]"
                  />
                </div>
              </div>

              <input
                id="slider-budget"
                type="range"
                min={50}
                max={1000}
                step={10}
                value={details.budget}
                onChange={(e) => setDetails({ ...details, budget: parseInt(e.target.value, 10) })}
                className="w-full accent-[#7C8B71] cursor-pointer h-2 bg-[#E8E6E1] rounded-lg mt-2"
              />

              <div className="flex justify-between text-[10px] text-[#8B8881] font-semibold mt-1.5">
                <span>$50 (Budget)</span>
                <span>$250 (Standard)</span>
                <span>$500 (Deluxe)</span>
                <span>$1,000+ (Grand)</span>
              </div>
            </div>

            {/* Duration & Guest Demographics */}
            <div className="p-4 bg-[#FAF9F6] border border-[#E8E6E1] rounded-2xl flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#5A6354] uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#7C8B71]" />
                  Party Duration
                </label>
                <span className="text-xs font-bold text-[#2D332A] bg-[#E9EBE6] px-2.5 py-0.5 rounded-full border border-[#D1D1CB]">
                  {details.durationHours} Hours
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {[2, 3, 4, 5].map((hrs) => (
                  <button
                    key={hrs}
                    type="button"
                    onClick={() => setDetails({ ...details, durationHours: hrs })}
                    className={`py-2 text-xs font-bold rounded-xl border transition ${
                      details.durationHours === hrs
                        ? 'bg-[#2D332A] text-white border-[#2D332A] shadow-xs'
                        : 'bg-white text-[#3D3D3D] border-[#E8E6E1] hover:bg-[#F3F2EE]'
                    }`}
                  >
                    {hrs} hrs
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Row 3: Guest Counts Breakdown */}
          <div className="p-4 bg-[#FAF9F6] border border-[#E8E6E1] rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold text-[#5A6354] uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#7C8B71]" />
                Guest Demographics (For Automated Portion Math)
              </label>
              <div className="text-xs font-bold text-[#2D332A] bg-[#E9EBE6] px-3 py-1 rounded-full border border-[#D1D1CB]">
                Total: {details.guestCount} Guests
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Adults Counter */}
              <div className="bg-white p-3.5 rounded-xl border border-[#E8E6E1] flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-[#2D332A]">Adult Guests</div>
                  <div className="text-[11px] text-[#8B8881]">Calculates cocktails, beer, larger portions</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleGuestCountChange(details.adultCount - 1, details.kidCount)}
                    className="w-8 h-8 rounded-lg bg-[#F3F2EE] hover:bg-[#E8E6E1] text-[#2D332A] font-bold flex items-center justify-center transition"
                  >
                    -
                  </button>
                  <span className="w-7 text-center font-bold text-sm text-[#2D332A] font-mono">
                    {details.adultCount}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleGuestCountChange(details.adultCount + 1, details.kidCount)}
                    className="w-8 h-8 rounded-lg bg-[#F3F2EE] hover:bg-[#E8E6E1] text-[#2D332A] font-bold flex items-center justify-center transition"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Kids Counter */}
              <div className="bg-white p-3.5 rounded-xl border border-[#E8E6E1] flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-[#2D332A]">Children / Kids</div>
                  <div className="text-[11px] text-[#8B8881]">Calculates kid-friendly snacks & favors</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleGuestCountChange(details.adultCount, details.kidCount - 1)}
                    className="w-8 h-8 rounded-lg bg-[#F3F2EE] hover:bg-[#E8E6E1] text-[#2D332A] font-bold flex items-center justify-center transition"
                  >
                    -
                  </button>
                  <span className="w-7 text-center font-bold text-sm text-[#2D332A] font-mono">
                    {details.kidCount}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleGuestCountChange(details.adultCount, details.kidCount + 1)}
                    className="w-8 h-8 rounded-lg bg-[#F3F2EE] hover:bg-[#E8E6E1] text-[#2D332A] font-bold flex items-center justify-center transition"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Row 4: Food Style / Vibe */}
          <div>
            <label className="block text-xs font-bold text-[#5A6354] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Utensils className="w-3.5 h-3.5 text-[#7C8B71]" />
              Meal & Serving Format
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {VIBE_STYLES.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setDetails({ ...details, vibe: v.id })}
                  className={`p-3.5 rounded-2xl border text-left transition ${
                    details.vibe === v.id
                      ? 'border-[#7C8B71] bg-[#FAF9F6] ring-1 ring-[#7C8B71]'
                      : 'border-[#E8E6E1] bg-white hover:bg-[#F3F2EE]'
                  }`}
                >
                  <div className="text-xs font-bold text-[#2D332A] flex items-center justify-between">
                    <span>{v.label}</span>
                    {details.vibe === v.id && <Check className="w-3.5 h-3.5 text-[#7C8B71]" />}
                  </div>
                  <div className="text-[11px] text-[#8B8881] mt-1">{v.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Row 5: Dietary Preferences Multi-Select */}
          <div>
            <label className="block text-xs font-bold text-[#5A6354] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <HeartHandshake className="w-3.5 h-3.5 text-[#7C8B71]" />
              Dietary & Allergy Accommodations
            </label>
            <div className="flex flex-wrap gap-2">
              {DIETARY_OPTIONS.map((diet) => {
                const isSelected = details.dietaryNeeds.includes(diet);
                return (
                  <button
                    key={diet}
                    type="button"
                    onClick={() => toggleDietary(diet)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#7C8B71]/15 border-[#7C8B71] text-[#2D332A] shadow-xs'
                        : 'bg-white border-[#E8E6E1] text-[#5A6354] hover:bg-[#F3F2EE]'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-[#7C8B71]" />}
                    {diet}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 6: Special Requests / Host Notes */}
          <div>
            <label className="block text-xs font-bold text-[#5A6354] uppercase tracking-wider mb-1.5">
              Special Requests & Entertainment Notes (Optional)
            </label>
            <textarea
              id="textarea-special-requests"
              rows={2}
              value={details.specialRequests}
              onChange={(e) => setDetails({ ...details, specialRequests: e.target.value })}
              placeholder="e.g., Please include outdoor yard games, extra ice for drink tubs, compostable tableware, and mocktail garnishes"
              className="w-full px-3.5 py-2.5 text-sm bg-[#FAF9F6] border border-[#D1D1CB] rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#7C8B71] font-medium text-[#2D332A]"
            />
          </div>
        </div>

        {/* Submit Action Buttons */}
        <div className="mt-8 pt-6 border-t border-[#E8E6E1] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-[#8B8881] flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-[#7C8B71] shrink-0" />
            <span>Calculates quantities with an automated 15% safety buffer.</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              id="btn-generate-plan-gemini"
              onClick={() => onGeneratePlan(details, true)}
              disabled={isLoading}
              className="flex-1 sm:flex-none px-7 py-3.5 bg-[#2D332A] hover:bg-[#3D453A] text-white font-bold text-sm rounded-full shadow-sm hover:shadow transition active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Curating CymbalMart Plan...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#A3B39A]" />
                  <span>Generate Curated Shopping List</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
