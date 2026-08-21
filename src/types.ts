export type CategoryId = 'food_drinks' | 'tableware' | 'decor' | 'entertainment_favors';

export interface ShoppingItem {
  id: string;
  name: string;
  category: CategoryId;
  unitPrice: number;
  quantity: number;
  packageUnit: string;
  portionMath: string;
  brandTier?: 'CymbalMart Value' | 'Cymbal Select' | 'Artisan / Premium' | string;
  dietaryTag?: string;
  notes?: string;
  alreadyHave?: boolean;
  inStock?: boolean;
  image?: string;
  sku?: string;
  alternatives?: ItemAlternative[];
}

export interface ItemAlternative {
  id: string;
  name: string;
  unitPrice: number;
  packageUnit: string;
  tier: 'Budget Value' | 'Organic / Gourmet' | 'Dietary Alternative' | 'Standard';
  reason: string;
}

export interface EventDetails {
  partyType: string;
  theme: string;
  budget: number;
  guestCount: number;
  adultCount: number;
  kidCount: number;
  durationHours: number;
  dietaryNeeds: string[];
  vibe: string;
  specialRequests: string;
  eventDate?: string;
  fulfillmentType?: 'delivery' | 'pickup';
}

export interface EventPlan {
  title: string;
  themeSummary: string;
  estimatedTotal: number;
  hostTips: string[];
  timelineAdvice: {
    timeframe: string;
    action: string;
  }[];
  items: ShoppingItem[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestedActions?: {
    label: string;
    action: () => void;
  }[];
}

export interface PartyTemplate {
  id: string;
  name: string;
  icon: string;
  tagline: string;
  partyType: string;
  theme: string;
  defaultGuests: number;
  adultCount: number;
  kidCount: number;
  defaultBudget: number;
  durationHours: number;
  vibe: string;
  dietaryNeeds: string[];
  specialRequests: string;
  colorAccent: string;
  badge: string;
}

export interface StoreLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  distance: string;
  pickupReadyTime: string;
  deliveryWindow: string;
}

export interface OrderReceipt {
  orderNumber: string;
  eventTitle: string;
  eventDate: string;
  guestCount: number;
  totalPaid: number;
  discountApplied: number;
  fulfillmentType: 'delivery' | 'pickup';
  fulfillmentTime: string;
  storeName: string;
  items: ShoppingItem[];
  placedAt: string;
}

export interface VoiceStatus {
  isSupported: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  transcript: string;
  lastCommand: string | null;
  lastFeedback: string | null;
  isContinuous: boolean;
  isTtsEnabled: boolean;
  confidence: number;
  error: string | null;
}

export type VoiceActionIntent =
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
  | 'PLACE_ORDER'
  | 'RESET_EVENT'
  | 'OPEN_ASSISTANT'
  | 'ASK_ASSISTANT'
  | 'PRINT_BLUEPRINT'
  | 'HELP'
  | 'UNKNOWN';

