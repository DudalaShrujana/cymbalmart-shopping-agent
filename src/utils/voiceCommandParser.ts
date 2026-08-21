import { EventDetails, ShoppingItem, PartyTemplate } from '../types';
import { PARTY_TEMPLATES } from '../data/templates';
import { DEFAULT_CATALOG_ITEMS } from '../data/catalog';

export interface ParsedVoiceCommand {
  intent:
    | 'SET_EVENT_DETAILS'
    | 'SELECT_TEMPLATE'
    | 'GENERATE_PLAN'
    | 'ADD_ITEM'
    | 'UPDATE_QUANTITY'
    | 'REMOVE_ITEM'
    | 'TOGGLE_ALREADY_HAVE'
    | 'OPTIMIZE_BUDGET'
    | 'READ_TOTAL'
    | 'READ_LIST'
    | 'PROCEED_CHECKOUT'
    | 'SELECT_FULFILLMENT'
    | 'APPLY_PROMO'
    | 'PLACE_ORDER'
    | 'RESET_EVENT'
    | 'OPEN_ASSISTANT'
    | 'ASK_ASSISTANT'
    | 'PRINT_BLUEPRINT'
    | 'HELP'
    | 'NAVIGATE_STEP'
    | 'UNKNOWN';
  payload?: any;
  feedbackText: string;
  speakText: string;
}

// Convert spoken word numbers to digits
const numberWords: Record<string, number> = {
  zero: 0,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  fifteen: 15,
  twenty: 20,
  twentyfive: 25,
  thirty: 30,
  forty: 40,
  fifty: 50,
  hundred: 100,
  'two hundred': 200,
  'three hundred': 300,
};

function extractNumber(text: string): number | null {
  const match = text.match(/\b(\d+)\b/);
  if (match) return parseInt(match[1], 10);

  for (const [word, val] of Object.entries(numberWords)) {
    if (new RegExp(`\\b${word}\\b`, 'i').test(text)) {
      return val;
    }
  }
  return null;
}

export function parseVoiceCommand(
  rawTranscript: string,
  context: {
    currentStep: number;
    eventDetails: EventDetails;
    items: ShoppingItem[];
    cartTotal: number;
    isCheckoutModalOpen: boolean;
    isChatOpen: boolean;
  }
): ParsedVoiceCommand {
  const text = rawTranscript.trim().toLowerCase();

  // 1. HELP / WHAT CAN I SAY
  if (
    text.includes('what can i say') ||
    text.includes('help') ||
    text.includes('voice commands') ||
    text.includes('how does this work')
  ) {
    return {
      intent: 'HELP',
      feedbackText: 'Opened Voice Commands guide',
      speakText:
        'You can say commands like: Plan a BBQ for 20 guests, Add ice, Auto balance budget, What is my total, Proceed to checkout, or Place order.',
    };
  }

  // 2. READ TOTAL / BUDGET CHECK
  if (
    text.includes('what is my total') ||
    text.includes('what is the total') ||
    text.includes('read total') ||
    text.includes('read my budget') ||
    text.includes('how much') ||
    text.includes('check budget') ||
    text.includes('am i over budget')
  ) {
    const delta = context.eventDetails.budget - context.cartTotal;
    const isOver = delta < 0;
    const speak = isOver
      ? `Your current total is $${context.cartTotal.toFixed(2)}, which exceeds your $${context.eventDetails.budget} budget by $${Math.abs(delta).toFixed(2)}. Say "Auto balance budget" to fix it.`
      : `Your estimated total is $${context.cartTotal.toFixed(2)} out of your $${context.eventDetails.budget} budget. You have $${delta.toFixed(2)} remaining room.`;

    return {
      intent: 'READ_TOTAL',
      feedbackText: `Cart Total: $${context.cartTotal.toFixed(2)} / Budget: $${context.eventDetails.budget}`,
      speakText: speak,
    };
  }

  // 3. READ SHOPPING LIST
  if (
    text.includes('read shopping list') ||
    text.includes("what's on my list") ||
    text.includes('what is on my list') ||
    text.includes('read my list')
  ) {
    const activeItems = context.items.filter((i) => !i.alreadyHave);
    const top3 = activeItems.slice(0, 4).map((i) => `${i.quantity} ${i.name}`).join(', ');
    return {
      intent: 'READ_LIST',
      feedbackText: `Shopping List: ${activeItems.length} items`,
      speakText: `You have ${activeItems.length} items in your list, including ${top3}. Total estimated at $${context.cartTotal.toFixed(2)}.`,
    };
  }

  // 4. STEP 1: FORM / EVENT SETUP COMMANDS
  // Example: "Plan a backyard BBQ for 20 guests with a budget of 250 dollars"
  const planMatch = text.match(/plan\s+(?:a|an)?\s*(.+?)(?:\s+for\s+(\d+|\w+)\s+guests?)?(?:\s+with\s+(?:a\s+)?budget\s+of\s+(\d+|\w+))?$/i);
  if (text.startsWith('plan ') && (text.includes('guests') || text.includes('budget') || text.includes('party'))) {
    let theme = '';
    let guests = context.eventDetails.guestCount;
    let budget = context.eventDetails.budget;

    const guestMatch = text.match(/(\d+)\s+guests?/i);
    if (guestMatch) guests = parseInt(guestMatch[1], 10);

    const budgetMatch = text.match(/(?:budget\s+(?:of\s+)?|\$)(\d+)/i);
    if (budgetMatch) budget = parseInt(budgetMatch[1], 10);

    const themeClean = text
      .replace(/^plan\s+(a\s+|an\s+)?/i, '')
      .replace(/\s+for\s+\d+\s+guests?.*/i, '')
      .replace(/\s+with\s+a?\s*budget.*/i, '')
      .trim();

    if (themeClean) {
      theme = themeClean.charAt(0).toUpperCase() + themeClean.slice(1);
    }

    return {
      intent: 'SET_EVENT_DETAILS',
      payload: {
        theme: theme || context.eventDetails.theme,
        guestCount: guests,
        budget: budget,
        adultCount: Math.ceil(guests * 0.7),
        kidCount: Math.floor(guests * 0.3),
      },
      feedbackText: `Configured party: "${theme || context.eventDetails.theme}", ${guests} guests, $${budget} budget`,
      speakText: `Got it! Planning ${theme || context.eventDetails.theme} for ${guests} guests with a $${budget} budget. Say "Create shopping list" to generate your plan.`,
    };
  }

  // Set guest count
  if (text.includes('set guest') || text.includes('guests to') || text.includes('change guests to')) {
    const num = extractNumber(text);
    if (num && num > 0) {
      return {
        intent: 'SET_EVENT_DETAILS',
        payload: {
          guestCount: num,
          adultCount: Math.ceil(num * 0.7),
          kidCount: Math.floor(num * 0.3),
        },
        feedbackText: `Updated guests to ${num}`,
        speakText: `Updated guest count to ${num}.`,
      };
    }
  }

  // Set budget
  if (text.includes('set budget') || text.includes('budget to') || text.includes('change budget to')) {
    const num = extractNumber(text);
    if (num && num > 0) {
      return {
        intent: 'SET_EVENT_DETAILS',
        payload: { budget: num },
        feedbackText: `Updated budget to $${num}`,
        speakText: `Target budget set to $${num}.`,
      };
    }
  }

  // Set theme
  if (text.startsWith('set theme to ') || text.startsWith('theme to ')) {
    const themeName = text.replace(/^(set\s+)?theme\s+to\s+/i, '').trim();
    if (themeName) {
      return {
        intent: 'SET_EVENT_DETAILS',
        payload: { theme: themeName.charAt(0).toUpperCase() + themeName.slice(1) },
        feedbackText: `Theme set to: "${themeName}"`,
        speakText: `Theme updated to ${themeName}.`,
      };
    }
  }

  // Select Party Template
  if (
    text.includes('select template') ||
    text.includes('choose template') ||
    text.includes('apply template') ||
    text.includes('dino template') ||
    text.includes('bbq template') ||
    text.includes('taco template') ||
    text.includes('cocktail template') ||
    text.includes('baby shower') ||
    text.includes('movie night')
  ) {
    let matchedTemplate: PartyTemplate | undefined;
    if (text.includes('dino') || text.includes('dinosaur')) {
      matchedTemplate = PARTY_TEMPLATES.find((t) => t.id === 'dino-bday');
    } else if (text.includes('bbq') || text.includes('smokehouse') || text.includes('barbecue')) {
      matchedTemplate = PARTY_TEMPLATES.find((t) => t.id === 'backyard-bbq');
    } else if (text.includes('taco') || text.includes('fiesta')) {
      matchedTemplate = PARTY_TEMPLATES.find((t) => t.id === 'taco-fiesta');
    } else if (text.includes('cocktail') || text.includes('soiree')) {
      matchedTemplate = PARTY_TEMPLATES.find((t) => t.id === 'cocktail-soiree');
    } else if (text.includes('baby') || text.includes('shower')) {
      matchedTemplate = PARTY_TEMPLATES.find((t) => t.id === 'baby-shower');
    } else if (text.includes('movie') || text.includes('cinema')) {
      matchedTemplate = PARTY_TEMPLATES.find((t) => t.id === 'movie-night');
    }

    if (matchedTemplate) {
      return {
        intent: 'SELECT_TEMPLATE',
        payload: matchedTemplate,
        feedbackText: `Selected package: ${matchedTemplate.name}`,
        speakText: `Selected the ${matchedTemplate.name} package for ${matchedTemplate.defaultGuests} guests with a $${matchedTemplate.defaultBudget} budget. Say "Create shopping list" to proceed.`,
      };
    }
  }

  // GENERATE PLAN / CREATE SHOPPING LIST
  if (
    text.includes('generate plan') ||
    text.includes('create shopping list') ||
    text.includes('generate shopping list') ||
    text.includes('create plan') ||
    text.includes('build my list') ||
    (context.currentStep === 1 && (text === 'next' || text === 'submit' || text === 'go' || text === 'continue'))
  ) {
    return {
      intent: 'GENERATE_PLAN',
      feedbackText: 'Generating party shopping list...',
      speakText: `Generating portion-calculated CymbalMart shopping plan for ${context.eventDetails.guestCount} guests.`,
    };
  }

  // 5. STEP 2: SHOPPING LIST REVIEW ACTIONS
  // Auto-Balance / Optimize Budget
  if (
    text.includes('auto balance') ||
    text.includes('balance budget') ||
    text.includes('optimize budget') ||
    text.includes('cut cost') ||
    text.includes('save money') ||
    text.includes('fix over budget') ||
    text.includes('reduce cost')
  ) {
    return {
      intent: 'OPTIMIZE_BUDGET',
      payload: { mode: 'reduce_cost' },
      feedbackText: 'Balancing budget with value swaps...',
      speakText: 'Optimizing your list with CymbalMart Value picks to stay within your budget.',
    };
  }

  // Add Item to Shopping List (e.g. "Add 10 lbs ice", "Add paper plates", "Add 2 boxes lemonade")
  if (text.startsWith('add ') || text.startsWith('put ') || text.startsWith('include ')) {
    const itemQuery = text.replace(/^(add|put|include)\s+/i, '').trim();
    const qty = extractNumber(itemQuery) || 1;
    const cleanQuery = itemQuery.replace(/\b\d+\b/g, '').replace(/\b(lbs|lb|pack|packs|boxes|box|bags|bag|bottles|bottle|ct|pieces|items|cans|can)\b/gi, '').trim();

    // Check catalog matches
    const catalogMatch = DEFAULT_CATALOG_ITEMS.find(
      (ci) =>
        ci.name.toLowerCase().includes(cleanQuery) ||
        cleanQuery.includes(ci.name.toLowerCase().split(' ')[0]) ||
        ci.category.toLowerCase().includes(cleanQuery)
    );

    let itemToAdd: ShoppingItem;
    if (catalogMatch) {
      itemToAdd = {
        ...catalogMatch,
        id: `voice-item-${Date.now()}`,
        quantity: qty,
        alreadyHave: false,
      };
    } else {
      // Dynamic fallback item
      itemToAdd = {
        id: `voice-item-${Date.now()}`,
        name: cleanQuery.charAt(0).toUpperCase() + cleanQuery.slice(1),
        category: 'food_drinks',
        unitPrice: 4.99,
        quantity: qty,
        packageUnit: `${qty} pack`,
        portionMath: 'Custom added item',
        brandTier: 'Cymbal Select',
        alreadyHave: false,
        inStock: true,
      };
    }

    return {
      intent: 'ADD_ITEM',
      payload: itemToAdd,
      feedbackText: `Added "${itemToAdd.name}" (${qty}x)`,
      speakText: `Added ${qty} ${itemToAdd.name} to your shopping list. Budget recalculated.`,
    };
  }

  // Remove Item (e.g. "Remove ice", "Delete burgers")
  if (text.startsWith('remove ') || text.startsWith('delete ') || text.startsWith('drop ')) {
    const itemQuery = text.replace(/^(remove|delete|drop)\s+/i, '').trim();
    const foundItem = context.items.find((i) =>
      i.name.toLowerCase().includes(itemQuery) || itemQuery.includes(i.name.toLowerCase().split(' ')[0])
    );

    if (foundItem) {
      return {
        intent: 'REMOVE_ITEM',
        payload: { id: foundItem.id, name: foundItem.name },
        feedbackText: `Removed "${foundItem.name}"`,
        speakText: `Removed ${foundItem.name} from your list.`,
      };
    }
  }

  // Increase/Decrease quantity (e.g. "Increase quantity of ice", "Add more sodas", "Decrease plates")
  if (text.includes('more ') || text.includes('increase ') || text.includes('extra ')) {
    const itemQuery = text.replace(/(add|more|increase|extra|quantity of|\s)+/gi, ' ').trim();
    const foundItem = context.items.find((i) =>
      i.name.toLowerCase().includes(itemQuery) || itemQuery.includes(i.name.toLowerCase().split(' ')[0])
    );

    if (foundItem) {
      return {
        intent: 'UPDATE_QUANTITY',
        payload: { id: foundItem.id, newQuantity: foundItem.quantity + 1, name: foundItem.name },
        feedbackText: `Increased ${foundItem.name} to ${foundItem.quantity + 1}`,
        speakText: `Increased ${foundItem.name} to ${foundItem.quantity + 1}.`,
      };
    }
  }

  if (text.includes('less ') || text.includes('decrease ') || text.includes('reduce ')) {
    const itemQuery = text.replace(/(less|decrease|reduce|quantity of|\s)+/gi, ' ').trim();
    const foundItem = context.items.find((i) =>
      i.name.toLowerCase().includes(itemQuery) || itemQuery.includes(i.name.toLowerCase().split(' ')[0])
    );

    if (foundItem) {
      const newQty = Math.max(0, foundItem.quantity - 1);
      return {
        intent: 'UPDATE_QUANTITY',
        payload: { id: foundItem.id, newQuantity: newQty, name: foundItem.name },
        feedbackText: `Reduced ${foundItem.name} to ${newQty}`,
        speakText: `Reduced ${foundItem.name} to ${newQty}.`,
      };
    }
  }

  // Mark as Already Have (e.g. "I already have ice", "Mark napkins as already have")
  if (
    text.includes('already have') ||
    text.includes('i have') ||
    text.includes('have at home') ||
    text.includes('own already')
  ) {
    const itemQuery = text
      .replace(/^(mark\s+)?(i\s+)?(already\s+)?(have\s+)?(at\s+home\s+)?/gi, '')
      .replace(/\s+(already|at home|have)$/gi, '')
      .trim();

    const foundItem = context.items.find((i) =>
      i.name.toLowerCase().includes(itemQuery) || itemQuery.includes(i.name.toLowerCase().split(' ')[0])
    );

    if (foundItem) {
      return {
        intent: 'TOGGLE_ALREADY_HAVE',
        payload: { id: foundItem.id, name: foundItem.name },
        feedbackText: `Toggled Have at Home: "${foundItem.name}"`,
        speakText: `Marked ${foundItem.name} as already at home. Deducted from your checkout total.`,
      };
    }
  }

  // PROCEED TO CHECKOUT
  if (
    text.includes('proceed to checkout') ||
    text.includes('go to checkout') ||
    text.includes('checkout now') ||
    text.includes('ready to checkout') ||
    text.includes('review and checkout') ||
    text.includes('finalize order') ||
    (context.currentStep === 2 && (text === 'checkout' || text === 'finish'))
  ) {
    return {
      intent: 'PROCEED_CHECKOUT',
      feedbackText: 'Opening checkout review...',
      speakText: `Proceeding to checkout. Your estimated total is $${context.cartTotal.toFixed(2)}. You can choose delivery or curbside pickup.`,
    };
  }

  // 6. STEP 3: CHECKOUT MODAL COMMANDS
  // Select Fulfillment: Delivery vs Pickup
  if (text.includes('delivery') || text.includes('deliver')) {
    return {
      intent: 'SELECT_FULFILLMENT',
      payload: { type: 'delivery' },
      feedbackText: 'Selected Doorstep Delivery',
      speakText: 'Selected doorstep delivery for this afternoon.',
    };
  }

  if (text.includes('pickup') || text.includes('curbside')) {
    return {
      intent: 'SELECT_FULFILLMENT',
      payload: { type: 'pickup' },
      feedbackText: 'Selected Curbside Express Pickup',
      speakText: 'Selected free curbside pickup at your local CymbalMart.',
    };
  }

  // Apply Promo
  if (text.includes('promo') || text.includes('coupon') || text.includes('discount')) {
    let promo = 'CYMBALPARTY15';
    if (text.includes('free ship')) promo = 'FREESHIP';
    if (text.includes('guest 10')) promo = 'GUEST10';

    return {
      intent: 'APPLY_PROMO',
      payload: { code: promo },
      feedbackText: `Applied promo code: ${promo}`,
      speakText: `Applied promo code ${promo} for extra savings.`,
    };
  }

  // PLACE / CONFIRM ORDER
  if (
    text.includes('place order') ||
    text.includes('confirm order') ||
    text.includes('complete order') ||
    text.includes('pay now') ||
    text.includes('order now') ||
    (context.isCheckoutModalOpen && (text === 'confirm' || text === 'yes' || text === 'buy'))
  ) {
    return {
      intent: 'PLACE_ORDER',
      feedbackText: 'Placing your CymbalMart order...',
      speakText: 'Confirming your CymbalMart order now. Congratulations on planning your party hands-free!',
    };
  }

  // Print Blueprint / Download
  if (text.includes('blueprint') || text.includes('print') || text.includes('download schedule')) {
    return {
      intent: 'PRINT_BLUEPRINT',
      feedbackText: 'Opening Host Blueprint & Timeline',
      speakText: 'Opening your printable Party Blueprint and preparation timeline.',
    };
  }

  // 7. ASSISTANT CHAT COMMANDS
  if (text.startsWith('ask assistant ') || text.startsWith('ask cymbalmart ') || text.includes('open assistant')) {
    const question = text.replace(/^(ask\s+assistant|ask\s+cymbalmart|open\s+assistant)\s*/i, '').trim();
    return {
      intent: question ? 'ASK_ASSISTANT' : 'OPEN_ASSISTANT',
      payload: { question: question || 'How can I stay on budget for this party?' },
      feedbackText: question ? `Asked Assistant: "${question}"` : 'Opened CymbalMart Assistant',
      speakText: question ? `Asking CymbalMart Assistant: ${question}` : 'CymbalMart Assistant is ready.',
    };
  }

  // 8. RESET / START OVER
  if (text.includes('start over') || text.includes('new party') || text.includes('reset')) {
    return {
      intent: 'RESET_EVENT',
      feedbackText: 'Resetting event plan',
      speakText: 'Starting a fresh party plan. What type of party are you planning?',
    };
  }

  // 9. STEP NAVIGATION
  if (text.includes('go to step 1') || text.includes('edit event details') || text.includes('back to details')) {
    return {
      intent: 'NAVIGATE_STEP',
      payload: { step: 1 },
      feedbackText: 'Navigating to Event Details',
      speakText: 'Navigating back to event configuration.',
    };
  }

  if (text.includes('go to step 2') || text.includes('show shopping list')) {
    return {
      intent: 'NAVIGATE_STEP',
      payload: { step: 2 },
      feedbackText: 'Navigating to Shopping List',
      speakText: 'Showing your shopping list.',
    };
  }

  // Default fallback
  return {
    intent: 'UNKNOWN',
    feedbackText: `Heard: "${rawTranscript}"`,
    speakText: `I heard "${rawTranscript}". Say "Help" to see what you can say hands-free.`,
  };
}
