import React, { useState } from 'react';
import { X, Search, Plus, PackagePlus, Check } from 'lucide-react';
import { ShoppingItem, CategoryId } from '../types';
import { DEFAULT_CATALOG_ITEMS, CYMBALMART_CATEGORIES } from '../data/catalog';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddItem: (item: ShoppingItem) => void;
  existingItemIds: string[];
}

export const AddItemModal: React.FC<AddItemModalProps> = ({
  isOpen,
  onClose,
  onAddItem,
  existingItemIds,
}) => {
  const [activeTab, setActiveTab] = useState<'catalog' | 'custom'>('catalog');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'all'>('all');

  // Custom item state
  const [customName, setCustomName] = useState('');
  const [customPrice, setCustomPrice] = useState('4.99');
  const [customCategory, setCustomCategory] = useState<CategoryId>('food_drinks');
  const [customUnit, setCustomUnit] = useState('1 pack');
  const [customPortion, setCustomPortion] = useState('1 per guest');
  const [customQuantity, setCustomQuantity] = useState(1);

  if (!isOpen) return null;

  const filteredCatalog = DEFAULT_CATALOG_ITEMS.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const newItem: ShoppingItem = {
      id: `item-custom-${Date.now()}`,
      name: customName.trim(),
      category: customCategory,
      unitPrice: parseFloat(customPrice) || 3.99,
      quantity: Math.max(1, customQuantity),
      packageUnit: customUnit.trim() || '1 item',
      portionMath: customPortion.trim() || 'Custom party item',
      brandTier: 'Cymbal Select',
    };

    onAddItem(newItem);
    onClose();
    setCustomName('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#2D332A]/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-[#E8E6E1] overflow-hidden animate-in fade-in zoom-in duration-150 flex flex-col max-h-[88vh]">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-[#FAF9F6] border-b border-[#E8E6E1] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#7C8B71]/15 text-[#5A6354] rounded-2xl border border-[#7C8B71]/30">
              <PackagePlus className="w-5 h-5 text-[#7C8B71]" />
            </div>
            <div>
              <h3 className="text-lg font-serif font-semibold text-[#2D332A]">Add Item to Party Checklist</h3>
              <p className="text-xs text-[#8B8881]">
                Browse CymbalMart aisles or add a custom item
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

        {/* Tab switch */}
        <div className="px-6 pt-3 border-b border-[#E8E6E1] flex gap-5 shrink-0 bg-white">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`pb-2.5 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'catalog'
                ? 'border-[#7C8B71] text-[#2D332A]'
                : 'border-transparent text-[#8B8881] hover:text-[#2D332A]'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search CymbalMart Catalog</span>
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`pb-2.5 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'custom'
                ? 'border-[#7C8B71] text-[#2D332A]'
                : 'border-transparent text-[#8B8881] hover:text-[#2D332A]'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Custom Item</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          {activeTab === 'catalog' ? (
            <div>
              {/* Search & Category Filter */}
              <div className="space-y-3 mb-4">
                <div className="relative">
                  <Search className="w-4 h-4 text-[#8B8881] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search party items (burgers, napkins, balloons, ice, games)..."
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#FAF9F6] border border-[#D1D1CB] rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#7C8B71] text-[#2D332A]"
                  />
                </div>

                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-3 py-1 text-xs font-bold rounded-full border transition ${
                      selectedCategory === 'all'
                        ? 'bg-[#2D332A] text-white border-[#2D332A]'
                        : 'bg-[#FAF9F6] text-[#5A6354] border-[#E8E6E1] hover:bg-[#E9EBE6]'
                    }`}
                  >
                    All Aisles
                  </button>
                  {CYMBALMART_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3 py-1 text-xs font-bold rounded-full border transition ${
                        selectedCategory === cat.id
                          ? 'bg-[#2D332A] text-white border-[#2D332A]'
                          : 'bg-[#FAF9F6] text-[#5A6354] border-[#E8E6E1] hover:bg-[#E9EBE6]'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2.5">
                {filteredCatalog.map((item) => {
                  const isAlreadyAdded = existingItemIds.includes(item.id);

                  return (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-2xl border border-[#E8E6E1] hover:border-[#D1D1CB] hover:bg-[#FAF9F6] transition flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[10px] font-bold px-1.5 py-0.2 bg-[#F3F2EE] text-[#5A6354] rounded">
                            {item.brandTier || 'Cymbal Select'}
                          </span>
                          {item.dietaryTag && (
                            <span className="text-[10px] font-semibold text-[#5A6354] bg-[#7C8B71]/15 px-1.5 py-0.2 rounded border border-[#7C8B71]/30">
                              {item.dietaryTag}
                            </span>
                          )}
                        </div>
                        <div className="text-sm font-bold text-[#2D332A] truncate">
                          {item.name}
                        </div>
                        <div className="text-xs text-[#8B8881]">
                          {item.packageUnit} • {item.portionMath}
                        </div>
                      </div>

                      <div className="text-right shrink-0 flex items-center gap-3">
                        <div className="text-sm font-bold font-mono text-[#2D332A]">
                          ${item.unitPrice.toFixed(2)}
                        </div>
                        <button
                          onClick={() => {
                            onAddItem({ ...item, quantity: 1 });
                            onClose();
                          }}
                          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1 ${
                            isAlreadyAdded
                              ? 'bg-[#7C8B71]/15 text-[#2D332A] border border-[#7C8B71]/30 hover:bg-[#7C8B71]/25'
                              : 'bg-[#2D332A] text-white hover:bg-[#3D453A] shadow-xs active:scale-95'
                          }`}
                        >
                          {isAlreadyAdded ? (
                            <>
                              <Check className="w-3 h-3 text-[#7C8B71]" />
                              <span>Add More</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3 h-3 text-[#A3B39A]" />
                              <span>Add</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <form onSubmit={handleAddCustom} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#5A6354] uppercase tracking-wider mb-1">
                  Item Name *
                </label>
                <input
                  type="text"
                  required
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g., Organic Pretzels, Piñata Blindfold, Table Centerpiece"
                  className="w-full px-3.5 py-2.5 text-sm bg-[#FAF9F6] border border-[#D1D1CB] rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#7C8B71] text-[#2D332A] font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#5A6354] uppercase tracking-wider mb-1">
                    Aisle / Category
                  </label>
                  <select
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value as CategoryId)}
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FAF9F6] border border-[#D1D1CB] rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#7C8B71] text-[#2D332A]"
                  >
                    {CYMBALMART_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#5A6354] uppercase tracking-wider mb-1">
                    Estimated Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.50"
                    value={customPrice}
                    onChange={(e) => setCustomPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FAF9F6] border border-[#D1D1CB] rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#7C8B71] text-[#2D332A] font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#5A6354] uppercase tracking-wider mb-1">
                    Package Unit
                  </label>
                  <input
                    type="text"
                    value={customUnit}
                    onChange={(e) => setCustomUnit(e.target.value)}
                    placeholder="e.g., 16 oz tub, 12-pack"
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FAF9F6] border border-[#D1D1CB] rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#7C8B71] text-[#2D332A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#5A6354] uppercase tracking-wider mb-1">
                    Initial Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={customQuantity}
                    onChange={(e) => setCustomQuantity(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FAF9F6] border border-[#D1D1CB] rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#7C8B71] text-[#2D332A] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5A6354] uppercase tracking-wider mb-1">
                  Portion / Host Note
                </label>
                <input
                  type="text"
                  value={customPortion}
                  onChange={(e) => setCustomPortion(e.target.value)}
                  placeholder="e.g., 2 per child guest for afternoon craft"
                  className="w-full px-3.5 py-2.5 text-sm bg-[#FAF9F6] border border-[#D1D1CB] rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#7C8B71] text-[#2D332A]"
                />
              </div>

              <div className="pt-4 border-t border-[#E8E6E1] flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-bold text-[#5A6354] hover:bg-[#FAF9F6] rounded-full transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#2D332A] hover:bg-[#3D453A] text-white text-xs font-bold rounded-full transition shadow-xs"
                >
                  Add Custom Item
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
