import { ShoppingItem, EventDetails } from '../types';

export function calculateEstimatedPartyNeeds(event: EventDetails) {
  const totalGuests = Math.max(1, event.guestCount || 10);
  const hours = Math.max(1, event.durationHours || 3);
  const adults = event.adultCount || totalGuests;
  const kids = event.kidCount || 0;

  // Portion formulas
  const drinkUnits = Math.ceil(totalGuests * (1.5 + (hours - 1) * 0.8));
  const iceLbs = Math.ceil(totalGuests * 1.2);
  const appetizerBites = Math.ceil(totalGuests * (hours * 3.5));
  const mainPortions = Math.ceil(adults * 1.3 + kids * 0.8);
  const dessertUnits = Math.ceil(totalGuests * 1.2);
  const platesNeeded = Math.ceil(totalGuests * 2.2);
  const napkinsNeeded = Math.ceil(totalGuests * 4);
  const cupsNeeded = Math.ceil(totalGuests * 2);

  return {
    drinkUnits,
    iceLbs,
    appetizerBites,
    mainPortions,
    dessertUnits,
    platesNeeded,
    napkinsNeeded,
    cupsNeeded,
  };
}

export function generateSmartLocalPlan(event: EventDetails): ShoppingItem[] {
  const needs = calculateEstimatedPartyNeeds(event);
  const theme = (event.theme || '').toLowerCase();
  const partyType = (event.partyType || '').toLowerCase();
  const isDino = theme.includes('dino') || theme.includes('jurassic');
  const isBbq = theme.includes('bbq') || partyType.includes('bbq') || theme.includes('cookout');
  const isTaco = theme.includes('taco') || theme.includes('fiesta');
  const isCocktail = theme.includes('cocktail') || theme.includes('tapas');
  const isMovie = theme.includes('movie') || theme.includes('cinema');
  const isBaby = theme.includes('baby') || theme.includes('shower');

  const budgetPerGuest = event.budget / Math.max(1, event.guestCount);
  const isBudgetConscious = budgetPerGuest < 15;

  const items: ShoppingItem[] = [];

  // 1. Food & Drinks Category
  if (isDino) {
    items.push({
      id: 'item-dino-nuggets',
      name: 'Dino-Bite Crispy Chicken Tenders & Dipping Trio',
      category: 'food_drinks',
      unitPrice: 12.99,
      quantity: Math.max(1, Math.ceil(needs.mainPortions / 10)),
      packageUnit: '32 oz Family Pack (Serves 8-10)',
      portionMath: '4-5 dino bites per child + honey mustard & BBQ sauce',
      brandTier: 'Cymbal Select',
      dietaryTag: event.dietaryNeeds.includes('Gluten-Free') ? 'Gluten-Free Option' : undefined,
    });
    items.push({
      id: 'item-dino-punch',
      name: 'Swamp Green Party Punch (Lime Sherbet & Sparkling Cider Mix)',
      category: 'food_drinks',
      unitPrice: 7.49,
      quantity: Math.max(1, Math.ceil(needs.drinkUnits / 12)),
      packageUnit: 'Makes 2 Gallons',
      portionMath: '2 cups per guest with floating gummy dino fossils',
      brandTier: 'Cymbal Select',
    });
    items.push({
      id: 'item-dino-cupcakes',
      name: 'Jurassic Volcano Chocolate Cupcakes with Toy Dino Toppers',
      category: 'food_drinks',
      unitPrice: 19.99,
      quantity: Math.max(1, Math.ceil(needs.dessertUnits / 12)),
      packageUnit: '12-Pack Themed Frosted Cupcakes',
      portionMath: '1 cupcake per guest + 2 celebratory extras',
      brandTier: 'Artisan Bakery',
      dietaryTag: 'Nut-Free Facility',
    });
  } else if (isBbq) {
    items.push({
      id: 'item-bbq-burgers',
      name: 'Cymbal Select Prime Beef & Cheddar Jalapeno Burgers',
      category: 'food_drinks',
      unitPrice: 15.99,
      quantity: Math.max(1, Math.ceil(needs.mainPortions / 8)),
      packageUnit: '8-Pack Gourmet Patties',
      portionMath: '1.3 burgers per adult guest',
      brandTier: 'Cymbal Select',
      dietaryTag: '100% Angus Beef',
    });
    items.push({
      id: 'item-bbq-buns',
      name: 'Artisan Golden Brioche Burger Buns',
      category: 'food_drinks',
      unitPrice: 4.49,
      quantity: Math.max(1, Math.ceil(needs.mainPortions / 8)),
      packageUnit: '8-Count Sliced',
      portionMath: '1 bun per patty + emergency extra buffer',
      brandTier: 'Cymbal Select',
    });
    items.push({
      id: 'item-bbq-corn',
      name: 'Fresh Sweet Corn on the Cob with Herb Butter Pack',
      category: 'food_drinks',
      unitPrice: 6.99,
      quantity: Math.max(1, Math.ceil(event.guestCount / 6)),
      packageUnit: '6-Ear Tray with Seasoning',
      portionMath: '1 ear per guest',
      brandTier: 'Cymbal Fresh Produce',
    });
  } else if (isTaco) {
    items.push({
      id: 'item-taco-meat',
      name: 'Cymbal Seasoned Carnitas & Fajita Chicken Duo Kit',
      category: 'food_drinks',
      unitPrice: 18.99,
      quantity: Math.max(1, Math.ceil(needs.mainPortions / 6)),
      packageUnit: '3 lb Pre-Seasoned Ready-to-Warm Kit',
      portionMath: '3 tacos per guest (4 oz protein)',
      brandTier: 'Cymbal Select',
      dietaryTag: 'Gluten-Free',
    });
    items.push({
      id: 'item-taco-tortillas',
      name: 'Stone-Ground Corn & Street Flour Tortilla Variety Box',
      category: 'food_drinks',
      unitPrice: 5.49,
      quantity: Math.max(1, Math.ceil(needs.mainPortions / 12)),
      packageUnit: '36 Tortillas Pack',
      portionMath: '3 tortillas per guest',
      brandTier: 'CymbalMart Value',
    });
    items.push({
      id: 'item-taco-guac-salsa',
      name: 'Fresh Molcajete Guacamole & Roasted Fire Salsa Bar Trio',
      category: 'food_drinks',
      unitPrice: 10.99,
      quantity: Math.max(1, Math.ceil(event.guestCount / 8)),
      packageUnit: '32 oz Salsa Trio with Corn Tortilla Chips',
      portionMath: 'Generous dipping for arrival grazing',
      brandTier: 'Cymbal Fresh',
    });
  } else if (isCocktail) {
    items.push({
      id: 'item-cocktail-charcuterie',
      name: 'Artisan Grazing Board (Prosciutto, Manchego, Fig Jam & Crisps)',
      category: 'food_drinks',
      unitPrice: 34.99,
      quantity: Math.max(1, Math.ceil(event.guestCount / 12)),
      packageUnit: 'Extra-Large Wood Look Display Platter',
      portionMath: '5 grazing bites per adult guest during cocktail hour',
      brandTier: 'Artisan / Premium',
    });
    items.push({
      id: 'item-cocktail-skewers',
      name: 'Caprese & Herb-Marinated Grilled Chicken Skewers',
      category: 'food_drinks',
      unitPrice: 16.99,
      quantity: Math.max(1, Math.ceil(needs.appetizerBites / 16)),
      packageUnit: '16-Skewer Platter with Balsamic Glaze',
      portionMath: '2 skewers per guest',
      brandTier: 'Cymbal Select',
    });
  } else if (isMovie) {
    items.push({
      id: 'item-movie-popcorn',
      name: 'Cymbal Cinema Style Theatre Popcorn & 4-Flavor Seasoning Bar',
      category: 'food_drinks',
      unitPrice: 8.99,
      quantity: Math.max(1, Math.ceil(event.guestCount / 6)),
      packageUnit: 'Mega Party Tub + White Cheddar/Jalapeño Shakers',
      portionMath: '2 large theater bowls per guest',
      brandTier: 'CymbalMart Value',
    });
    items.push({
      id: 'item-movie-candy',
      name: 'Classic Cinema Theater Candy Variety Box (M&Ms, Sour Patch, Twizzlers)',
      category: 'food_drinks',
      unitPrice: 11.99,
      quantity: Math.max(1, Math.ceil(event.guestCount / 10)),
      packageUnit: '10 Full-Size Concession Boxes',
      portionMath: '1 box per guest',
      brandTier: 'Cymbal Select',
    });
  } else {
    items.push({
      id: 'item-gen-sliders',
      name: 'Cymbal Fresh Deli Mini Gourmet Sliders Platter',
      category: 'food_drinks',
      unitPrice: 24.99,
      quantity: Math.max(1, Math.ceil(needs.mainPortions / 12)),
      packageUnit: '16-Count Assorted Sliders (Turkey, Roast Beef, Cheddar)',
      portionMath: '2 sliders per guest',
      brandTier: 'Cymbal Select',
    });
    items.push({
      id: 'item-gen-fruits',
      name: 'Fresh Seasonal Melon, Berry & Pineapple Party Bowl',
      category: 'food_drinks',
      unitPrice: 12.99,
      quantity: Math.max(1, Math.ceil(event.guestCount / 10)),
      packageUnit: '4 lb Pre-Cut Fruit Platter',
      portionMath: '1 cup per guest',
      brandTier: 'Cymbal Fresh',
    });
  }

  // Universal Drinks & Ice
  items.push({
    id: 'item-uni-seltzer',
    name: isCocktail ? 'Artisan Botanical Tonic & Sparkling Mixer Variety Pack' : 'Cymbal Sparkling Flavored Seltzer 24-Can Variety',
    category: 'food_drinks',
    unitPrice: isCocktail ? 14.99 : 9.99,
    quantity: Math.max(1, Math.ceil(needs.drinkUnits / 24)),
    packageUnit: '24-Pack 12 oz Cans',
    portionMath: `${Math.ceil(needs.drinkUnits / event.guestCount)} drinks per person across ${event.durationHours} hrs`,
    brandTier: isCocktail ? 'Artisan / Premium' : 'Cymbal Select',
  });

  items.push({
    id: 'item-uni-ice',
    name: 'Glacier Pure Spring Water Ice Cubes',
    category: 'food_drinks',
    unitPrice: 3.49,
    quantity: Math.max(1, Math.ceil(needs.iceLbs / 10)),
    packageUnit: '10 lb Bag',
    portionMath: `${needs.iceLbs} lbs recommended for drinks and chiller bins`,
    brandTier: 'CymbalMart Value',
  });

  // 2. Tableware Category
  items.push({
    id: 'item-tab-plates',
    name: isBudgetConscious ? 'CymbalMart Everyday Heavy Paper Plates' : 'Eco-Craft Bamboo Sustainable Heavy-Duty Party Plates (10")',
    category: 'tableware',
    unitPrice: isBudgetConscious ? 5.99 : 11.99,
    quantity: Math.max(1, Math.ceil(needs.platesNeeded / 50)),
    packageUnit: '50-Count Pack',
    portionMath: `${needs.platesNeeded} plates (includes 20% second-helping buffer)`,
    brandTier: isBudgetConscious ? 'CymbalMart Value' : 'Cymbal Select',
    dietaryTag: 'Compostable',
  });

  items.push({
    id: 'item-tab-napkins',
    name: 'Cymbal Premium 3-Ply Color-Coordinated Dinner Napkins',
    category: 'tableware',
    unitPrice: 4.49,
    quantity: Math.max(1, Math.ceil(needs.napkinsNeeded / 100)),
    packageUnit: '100-Count Pack',
    portionMath: '4 napkins per guest with finger foods',
    brandTier: 'Cymbal Select',
  });

  items.push({
    id: 'item-tab-cups',
    name: 'Crystal Clear Recyclable Party Tumblers (16 oz)',
    category: 'tableware',
    unitPrice: 6.99,
    quantity: Math.max(1, Math.ceil(needs.cupsNeeded / 40)),
    packageUnit: '40-Count Tumblers',
    portionMath: '2 cups per guest with marker name station',
    brandTier: 'Cymbal Select',
  });

  items.push({
    id: 'item-tab-covers',
    name: 'Spill-Resistant Wipeable Party Tablecloth (60" x 102")',
    category: 'tableware',
    unitPrice: 4.99,
    quantity: 2,
    packageUnit: '2-Pack Rectangular Covers',
    portionMath: 'Covers buffet and dining/activity tables',
    brandTier: 'CymbalMart Value',
  });

  // 3. Decor Category
  items.push({
    id: 'item-dec-arch',
    name: isDino
      ? 'Jurassic Jungle Theme Balloon Garland Arch Kit (110 Pcs)'
      : isBbq
      ? 'Rustic Gingham & Burlap Party Pennant Banner Set'
      : isTaco
      ? 'Festive Colorful Papel Picado Banner & Fringe Centerpieces'
      : isCocktail
      ? 'Warm Amber LED Fairy String Lights & Metallic Table Runners'
      : 'Theme Coordinated Balloon Cluster & Welcome Banner Kit',
    category: 'decor',
    unitPrice: 14.99,
    quantity: 1,
    packageUnit: 'Complete DIY Backdrop Kit',
    portionMath: 'Primary photo zone and main wall centerpiece',
    brandTier: 'Cymbal Select',
  });

  items.push({
    id: 'item-dec-accents',
    name: 'Table Confetti & Centerpiece Floral/Accent Picks',
    category: 'decor',
    unitPrice: 6.99,
    quantity: 1,
    packageUnit: '3-Piece Set',
    portionMath: 'Elevates food serving bar presentation',
    brandTier: 'Cymbal Select',
  });

  // 4. Entertainment & Favors Category
  items.push({
    id: 'item-ent-activity',
    name: isDino
      ? 'Mini Dinosaur Fossil Dig Excavation Egg Kits'
      : isBbq
      ? 'Giant Wooden Stacking Tower Lawn Game'
      : isTaco
      ? 'Fiesta Piñata with Fruit & Mexican Candy Filler Pack'
      : isCocktail
      ? 'Conversational Icebreaker & Table Trivia Deck'
      : isMovie
      ? 'Glow-in-the-Dark Cinema Pass Lanyards & Photo Props'
      : 'Party Trivia & Interactive Fun Game Pack',
    category: 'entertainment_favors',
    unitPrice: isBbq ? 22.99 : 14.99,
    quantity: 1,
    packageUnit: isDino ? '12-Pack Individual Dig Kits' : 'Full Game Set',
    portionMath: 'Structured 45-minute group activity during peak party hour',
    brandTier: 'Cymbal Select',
  });

  items.push({
    id: 'item-ent-favors',
    name: 'Theme Guest Thank-You Favor Goody Bags',
    category: 'entertainment_favors',
    unitPrice: 8.99,
    quantity: Math.max(1, Math.ceil(event.guestCount / 12)),
    packageUnit: '12-Count Pre-printed Bags with Twist Ties',
    portionMath: '1 souvenir bag per attending guest/family',
    brandTier: 'Cymbal Select',
  });

  return items;
}
