import React, { useState } from 'react';
import { Modal } from '@/shared/ui/Modal';
import { Button } from '@/shared/ui/Button';
import type { WarehouseItem, DailyMenuItem, CreateMenuItemInput, MenuIngredient } from '../types';

interface EditMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: DailyMenuItem | null;
  stockItems: WarehouseItem[];
  onSubmit: (id: string, input: CreateMenuItemInput) => void;
}

export const EditMenuModal: React.FC<EditMenuModalProps> = ({
  isOpen,
  onClose,
  item,
  stockItems,
  onSubmit,
}) => {
  if (!item) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Taomnoma tahrirlash: ${item.dishName}`} size="lg">
      <EditMenuForm key={item.id} item={item} stockItems={stockItems} onClose={onClose} onSubmit={onSubmit} />
    </Modal>
  );
};

interface EditMenuFormProps {
  item: DailyMenuItem;
  stockItems: WarehouseItem[];
  onClose: () => void;
  onSubmit: (id: string, input: CreateMenuItemInput) => void;
}

const EditMenuForm: React.FC<EditMenuFormProps> = ({ item, stockItems, onClose, onSubmit }) => {
  const [dishName, setDishName] = useState(item.dishName);
  const [mealType, setMealType] = useState<CreateMenuItemInput['mealType']>(item.mealType);
  const [time, setTime] = useState(item.time);
  const [calories, setCalories] = useState(item.calories);
  const [description, setDescription] = useState(item.description);
  const [ingredients, setIngredients] = useState<MenuIngredient[]>(item.ingredients || []);

  const handleAddIngredient = () => {
    const available = stockItems.find((p) => p.quantity > 0);
    if (!available) return alert('Omborda mavjud mahsulot topilmadi!');
    setIngredients((prev) => [
      ...prev,
      { productId: available.id, productName: available.name, amountPerChild: 0.05, unit: available.unit },
    ]);
  };

  const handleUpdateIngredient = (index: number, field: keyof MenuIngredient, val: string | number) => {
    setIngredients((prev) =>
      prev.map((ing, i) => {
        if (i !== index) return ing;
        if (field === 'productId') {
          const matched = stockItems.find((p) => p.id === val);
          return matched ? { ...ing, productId: matched.id, productName: matched.name, unit: matched.unit } : ing;
        }
        return { ...ing, [field]: val };
      })
    );
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dishName.trim()) return alert('Iltimos, taom nomini kiriting.');
    if (ingredients.length === 0) return alert('Iltimos, kamida bitta ombor mahsulotini qoldiring.');
    if (ingredients.some((ing) => !ing.amountPerChild || ing.amountPerChild <= 0)) {
      return alert('Iltimos, har bir mahsulot miqdorini to‘g‘ri kiriting (0 dan katta bo‘lsin).');
    }

    onSubmit(item.id, {
      dishName: dishName.trim(),
      mealType,
      time: time.trim(),
      calories: calories.trim(),
      description: description.trim() || 'Bolalar uchun parhezli taom',
      ingredients,
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 5 }}>Taom nomi *</label>
        <input
          type="text"
          className="branch-select"
          style={{ width: '100%', height: 38 }}
          value={dishName}
          onChange={(e) => setDishName(e.target.value)}
          required
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        <div>
          <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, marginBottom: 5 }}>Taomnoma vaqti</label>
          <select
            className="branch-select"
            style={{ width: '100%', height: 38 }}
            value={mealType}
            onChange={(e) => setMealType(e.target.value as CreateMenuItemInput['mealType'])}
          >
            <option value="Nonushta">Nonushta</option>
            <option value="Ikkinchi nonushta">Ikkinchi nonushta</option>
            <option value="Tushlik">Tushlik</option>
            <option value="Kechki ovqat">Kechki ovqat</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, marginBottom: 5 }}>Berish soati</label>
          <input
            type="text"
            className="branch-select"
            style={{ width: '100%', height: 38 }}
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, marginBottom: 5 }}>Kaloriya</label>
          <input
            type="text"
            className="branch-select"
            style={{ width: '100%', height: 38 }}
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, marginBottom: 5 }}>Taom tavsifi</label>
        <input
          type="text"
          className="branch-select"
          style={{ width: '100%', height: 38 }}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      {/* Dynamic Ingredients Section with Prominent Button */}
      <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div>
            <strong style={{ fontSize: 13, color: 'var(--text-primary)' }}>Tarkibidagi ombor mahsulotlari:</strong>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Davomat saqlanganda avtomatik ayriladi</div>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', fontSize: 12.5 }}
            onClick={handleAddIngredient}
          >
            + Mahsulot qo‘shish
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {ingredients.map((ing, idx) => (
            <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: 8, alignItems: 'center', background: '#f8fafc', padding: '6px 10px', borderRadius: 6, border: '1px solid #e2e8f0' }}>
              <select
                className="branch-select"
                style={{ height: 36, width: '100%' }}
                value={ing.productId}
                onChange={(e) => handleUpdateIngredient(idx, 'productId', e.target.value)}
              >
                {stockItems.map((prod) => {
                  const isOut = prod.quantity === 0 || prod.status === 'out_of_stock';
                  return (
                    <option key={prod.id} value={prod.id} disabled={isOut} style={{ color: isOut ? '#94a3b8' : undefined }}>
                      {prod.name} {isOut ? '🚫 (Qolmagan)' : `(${prod.quantity} ${prod.unit})`}
                    </option>
                  );
                })}
              </select>

              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <input
                  type="number"
                  step="any"
                  min="0"
                  className="branch-select"
                  style={{ height: 36, width: '100%' }}
                  placeholder="0.05"
                  value={ing.amountPerChild === 0 ? '' : ing.amountPerChild}
                  onChange={(e) => {
                    const val = e.target.value;
                    handleUpdateIngredient(idx, 'amountPerChild', val === '' ? 0 : parseFloat(val));
                  }}
                  required
                />
                <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-secondary)', minWidth: 24 }}>{ing.unit}</span>
              </div>

              <button
                type="button"
                className="btn btn-outline btn-sm"
                style={{ color: '#ef4444', borderColor: '#fca5a5', padding: '4px 8px' }}
                onClick={() => handleRemoveIngredient(idx)}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 10 }}>
        <Button type="button" variant="secondary" onClick={onClose}>Bekor qilish</Button>
        <Button type="submit" variant="primary">O‘zgarishlarni saqlash</Button>
      </div>
    </form>
  );
};
