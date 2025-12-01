/**
 * Uniform Sets Configuration
 * 
 * Defines complete uniform sets based on military dress regulations.
 * Each set contains the components (individual items) that make up the complete uniform.
 */

export interface UniformSetComponent {
  item_name: string;
  category: 'Headwear' | 'Tops' | 'Bottoms' | 'Footwear' | 'Accessories';
  quantity: number;
  required: boolean;
}

export interface UniformSet {
  set_id: string;
  set_name: string;
  dress_type: string;
  description: string;
  components: UniformSetComponent[];
}

/**
 * Standard Uniform Sets based on Trinidad and Tobago Defence Force regulations
 */
export const STANDARD_UNIFORM_SETS: UniformSet[] = [
  {
    set_id: 'SET-NO1',
    set_name: 'No#1 Ceremonial Uniform',
    dress_type: 'No#1',
    description: 'Full ceremonial dress uniform for formal occasions',
    components: [
      { item_name: 'Service Dress Cap', category: 'Headwear', quantity: 1, required: true },
      { item_name: 'White Tunic', category: 'Tops', quantity: 1, required: true },
      { item_name: 'White Trousers', category: 'Bottoms', quantity: 1, required: true },
      { item_name: 'Chelsea Boots (Black)', category: 'Footwear', quantity: 1, required: true },
      { item_name: 'Sam Browne Belt', category: 'Accessories', quantity: 1, required: true },
      { item_name: 'White Under Vest', category: 'Accessories', quantity: 1, required: true },
      { item_name: 'Stockings (Charcoal)', category: 'Accessories', quantity: 1, required: true },
      { item_name: 'Collar Badges (Dogs)', category: 'Accessories', quantity: 1, required: true },
      { item_name: 'Regiment Buttons (Large)', category: 'Accessories', quantity: 1, required: true },
    ],
  },
  {
    set_id: 'SET-NO4D',
    set_name: 'No#4D Combat Uniform (BDU)',
    dress_type: 'No#4D',
    description: 'Battle Dress Uniform for field operations and combat',
    components: [
      { item_name: 'Boonie Hat', category: 'Headwear', quantity: 1, required: true },
      { item_name: 'BDU Jacket (Camouflage)', category: 'Tops', quantity: 1, required: true },
      { item_name: 'BDU Trousers (Camouflage)', category: 'Bottoms', quantity: 1, required: true },
      { item_name: 'Combat Boots (Rubber Sole)', category: 'Footwear', quantity: 1, required: true },
      { item_name: 'Belt (Staple)', category: 'Accessories', quantity: 1, required: true },
      { item_name: 'Socks (Green)', category: 'Accessories', quantity: 2, required: true },
    ],
  },
  {
    set_id: 'SET-NO2',
    set_name: 'No#2 Service Dress',
    dress_type: 'No#2',
    description: 'Service dress uniform for office and formal duties',
    components: [
      { item_name: 'Forage Cap', category: 'Headwear', quantity: 1, required: true },
      { item_name: 'Service Dress Jacket', category: 'Tops', quantity: 1, required: true },
      { item_name: 'Olive Drab Shirt', category: 'Tops', quantity: 1, required: true },
      { item_name: 'Olive Drab Trousers', category: 'Bottoms', quantity: 1, required: true },
      { item_name: 'Chelsea Boots (Black)', category: 'Footwear', quantity: 1, required: true },
      { item_name: 'Belt (Green Courlene)', category: 'Accessories', quantity: 1, required: true },
      { item_name: 'Tie (Green Knitted)', category: 'Accessories', quantity: 1, required: true },
      { item_name: 'Socks (Black)', category: 'Accessories', quantity: 2, required: true },
    ],
  },
  {
    set_id: 'SET-NO3',
    set_name: 'No#3 Working Dress',
    dress_type: 'No#3',
    description: 'Working dress for daily operational duties',
    components: [
      { item_name: 'Beret (Green)', category: 'Headwear', quantity: 1, required: true },
      { item_name: 'Green Jacket', category: 'Tops', quantity: 1, required: true },
      { item_name: 'Olive Drab Shirt', category: 'Tops', quantity: 1, required: true },
      { item_name: 'Green Pants', category: 'Bottoms', quantity: 1, required: true },
      { item_name: 'Chelsea Boots (Black)', category: 'Footwear', quantity: 1, required: true },
      { item_name: 'Belt (Green Courlene)', category: 'Accessories', quantity: 1, required: true },
      { item_name: 'Socks (Green)', category: 'Accessories', quantity: 2, required: true },
    ],
  },
  {
    set_id: 'SET-NO5',
    set_name: 'No#5 Parade Order',
    dress_type: 'No#5',
    description: 'Parade order uniform for ceremonial parades',
    components: [
      { item_name: 'Service Dress Cap', category: 'Headwear', quantity: 1, required: true },
      { item_name: 'Service Dress Jacket', category: 'Tops', quantity: 1, required: true },
      { item_name: 'Mint Green Shirt (Long Sleeve)', category: 'Tops', quantity: 1, required: true },
      { item_name: 'Olive Drab Trousers', category: 'Bottoms', quantity: 1, required: true },
      { item_name: 'Leather Soled Boots', category: 'Footwear', quantity: 1, required: true },
      { item_name: 'Belt (Green Felt 1.5")', category: 'Accessories', quantity: 1, required: true },
      { item_name: 'Tie (Green with Regiment Logo)', category: 'Accessories', quantity: 1, required: true },
      { item_name: 'Shoulder Titles (TTR)', category: 'Accessories', quantity: 1, required: true },
      { item_name: 'Socks (Black)', category: 'Accessories', quantity: 2, required: true },
    ],
  },
  {
    set_id: 'SET-NO7A',
    set_name: 'No#7A Mess Dress (Officers)',
    dress_type: 'No#7A',
    description: 'Mess dress for formal evening events (Officers only)',
    components: [
      { item_name: 'Regiment Cap', category: 'Headwear', quantity: 1, required: true },
      { item_name: 'Service Dress Jacket', category: 'Tops', quantity: 1, required: true },
      { item_name: 'White Tunic', category: 'Tops', quantity: 1, required: false },
      { item_name: 'White Trousers', category: 'Bottoms', quantity: 1, required: true },
      { item_name: 'Dress Shoes (Black)', category: 'Footwear', quantity: 1, required: true },
      { item_name: 'Belt (Black Dress)', category: 'Accessories', quantity: 1, required: true },
      { item_name: 'Bow Tie', category: 'Accessories', quantity: 1, required: true },
      { item_name: 'Epaulettes (Corded Gold)', category: 'Accessories', quantity: 1, required: true },
      { item_name: 'Stockings (Charcoal)', category: 'Accessories', quantity: 1, required: true },
    ],
  },
  {
    set_id: 'SET-NO10A',
    set_name: 'No#10A PT Uniform',
    dress_type: 'No#10A',
    description: 'Physical Training uniform',
    components: [
      { item_name: 'PT Vest (Red/White)', category: 'Tops', quantity: 1, required: true },
      { item_name: 'PT Shorts (Black)', category: 'Bottoms', quantity: 1, required: true },
      { item_name: 'Track Sneakers', category: 'Footwear', quantity: 1, required: true },
      { item_name: 'Socks (Black)', category: 'Accessories', quantity: 2, required: true },
    ],
  },
  {
    set_id: 'SET-NO10B',
    set_name: 'No#10B Battle PT',
    dress_type: 'No#10B',
    description: 'Battle physical training uniform',
    components: [
      { item_name: 'PT Vest (Green)', category: 'Tops', quantity: 1, required: true },
      { item_name: 'PT Pants (Black)', category: 'Bottoms', quantity: 1, required: true },
      { item_name: 'Sneakers (Black)', category: 'Footwear', quantity: 1, required: true },
      { item_name: 'Socks (Black)', category: 'Accessories', quantity: 2, required: true },
    ],
  },
];

/**
 * Get uniform set by dress type
 */
export function getUniformSetByDressType(dressType: string): UniformSet | undefined {
  return STANDARD_UNIFORM_SETS.find(set => set.dress_type === dressType);
}

/**
 * Get all components for a uniform set
 */
export function getUniformSetComponents(dressType: string): UniformSetComponent[] {
  const set = getUniformSetByDressType(dressType);
  return set?.components || [];
}

/**
 * Get all dress types
 */
export function getAllDressTypes(): string[] {
  return STANDARD_UNIFORM_SETS.map(set => set.dress_type);
}

/**
 * Validate if a uniform set is complete (all required components present)
 */
export function validateUniformSetComplete(
  dressType: string,
  availableItems: { item_name: string; quantity: number }[]
): { complete: boolean; missing: UniformSetComponent[] } {
  const components = getUniformSetComponents(dressType);
  const required = components.filter(c => c.required);
  
  const missing: UniformSetComponent[] = [];
  
  for (const component of required) {
    const available = availableItems.find(
      item => item.item_name === component.item_name
    );
    
    if (!available || available.quantity < component.quantity) {
      missing.push(component);
    }
  }
  
  return {
    complete: missing.length === 0,
    missing,
  };
}