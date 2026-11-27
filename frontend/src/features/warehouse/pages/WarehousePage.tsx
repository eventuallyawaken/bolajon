import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import type {
  WarehouseItem,
  DailyMenuItem,
  AddStockInput,
  UpdateStockInput,
  CreateMenuItemInput,
} from '../types';
import { warehouseApi } from '../api';
import { StockTable } from '../components/StockTable';
import { MenuSection } from '../components/MenuSection';
import { AddStockModal } from '../components/AddStockModal';
import { EditStockModal } from '../components/EditStockModal';
import { AddMenuModal } from '../components/AddMenuModal';
import { EditMenuModal } from '../components/EditMenuModal';
import { Button } from '@/shared/ui/Button';
import { useT } from '@/shared/i18n';

export const WarehousePage: React.FC = () => {
  const { t } = useT();
  const [activeTab, setActiveTab] = useState<'stock' | 'menu'>('stock');
  const [stockItems, setStockItems] = useState<WarehouseItem[]>([]);
  const [menuItems, setMenuItems] = useState<DailyMenuItem[]>([]);
  const [isAddStockModalOpen, setIsAddStockModalOpen] = useState(false);
  const [isAddMenuModalOpen, setIsAddMenuModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WarehouseItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState<DailyMenuItem | null>(null);
  const [isEditMenuModalOpen, setIsEditMenuModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([warehouseApi.getWarehouseItems(), warehouseApi.getDailyMenu()]).then(
      ([items, menus]) => {
        setStockItems(items);
        setMenuItems(menus);
        setIsLoading(false);
      }
    );
  }, []);

  const handleAddStock = async (input: AddStockInput) => {
    const created = await warehouseApi.addStockItem(input);
    setStockItems((prev) => [created, ...prev]);
    setIsAddStockModalOpen(false);
    toast.success(`"${created.name}" omborga qabul qilindi (Log: ${created.lastActionAt})`);
  };

  const handleUpdateStock = async (id: string, input: UpdateStockInput) => {
    const updated = await warehouseApi.updateStockItem(id, input);
    setStockItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
    setIsEditModalOpen(false);
    setEditingItem(null);
    toast.success(`"${updated.name}" tahrirlandi (Log: ${updated.lastActionAt})`);
  };

  const handleAddMenuItem = async (input: CreateMenuItemInput) => {
    const created = await warehouseApi.addMenuItem(input);
    setMenuItems((prev) => [...prev, created]);
    setIsAddMenuModalOpen(false);
    toast.success(`"${created.dishName}" taomnomaga muvaffaqiyatli qo‘shildi!`);
  };

  const handleUpdateMenuItem = async (id: string, input: CreateMenuItemInput) => {
    const updated = await warehouseApi.updateMenuItem(id, input);
    setMenuItems((prev) => prev.map((m) => (m.id === id ? updated : m)));
    setIsEditMenuModalOpen(false);
    setEditingMenuItem(null);
    toast.success(`"${updated.dishName}" taomnomasi muvaffaqiyatli tahrirlandi!`);
  };

  const handleDeleteMenuItem = async (id: string, name: string) => {
    if (!window.confirm(`"${name}"ni taomnomadan o‘chirishni tasdiqlaysizmi?`)) return;
    await warehouseApi.deleteMenuItem(id);
    setMenuItems((prev) => prev.filter((m) => m.id !== id));
    toast.warn(`"${name}" taomnomadan o‘chirildi.`);
  };

  const handleOpenEditStock = (item: WarehouseItem) => {
    setEditingItem(item);
    setIsEditModalOpen(true);
  };

  const handleOpenEditMenu = (menu: DailyMenuItem) => {
    setEditingMenuItem(menu);
    setIsEditMenuModalOpen(true);
  };

  const lowStockCount = stockItems.filter(
    (item) => item.status === 'low' || item.status === 'out_of_stock'
  ).length;

  if (isLoading) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center' }}>
        <div className="text-muted">{t('warehouse.loading')}</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Tabs and Action Header */}
      <div className="card" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <div className="filter-group">
            <button
              type="button"
              className={`chip ${activeTab === 'stock' ? 'active' : ''}`}
              onClick={() => setActiveTab('stock')}
            >
              {t('warehouse.stockTab')} ({stockItems.length})
            </button>
            <button
              type="button"
              className={`chip ${activeTab === 'menu' ? 'active' : ''}`}
              onClick={() => setActiveTab('menu')}
            >
              {t('warehouse.menuTab')} ({menuItems.length})
            </button>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {lowStockCount > 0 && activeTab === 'stock' && (
              <span
                style={{
                  fontSize: 12,
                  color: '#b45309',
                  background: '#fef3c7',
                  padding: '4px 10px',
                  borderRadius: 6,
                  fontWeight: 600,
                }}
              >
                ⚠️ {lowStockCount} ta mahsulot kam qolgan
              </span>
            )}

            {activeTab === 'stock' ? (
              <Button variant="primary" size="sm" onClick={() => setIsAddStockModalOpen(true)}>
                + Mahsulot kirimi
              </Button>
            ) : (
              <Button variant="primary" size="sm" onClick={() => setIsAddMenuModalOpen(true)}>
                + Menyu taomi qo‘shish
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Tab content */}
      {activeTab === 'stock' ? (
        <StockTable items={stockItems} onEditItem={handleOpenEditStock} />
      ) : (
        <MenuSection
          menuItems={menuItems}
          onEditMenu={handleOpenEditMenu}
          onDeleteMenu={handleDeleteMenuItem}
        />
      )}

      {/* Stock Modals */}
      <AddStockModal
        isOpen={isAddStockModalOpen}
        onClose={() => setIsAddStockModalOpen(false)}
        onSubmit={handleAddStock}
      />
      <EditStockModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingItem(null);
        }}
        item={editingItem}
        onSubmit={handleUpdateStock}
      />

      {/* Menu Modals */}
      <AddMenuModal
        isOpen={isAddMenuModalOpen}
        onClose={() => setIsAddMenuModalOpen(false)}
        stockItems={stockItems}
        onSubmit={handleAddMenuItem}
      />
      <EditMenuModal
        isOpen={isEditMenuModalOpen}
        onClose={() => {
          setIsEditMenuModalOpen(false);
          setEditingMenuItem(null);
        }}
        item={editingMenuItem}
        stockItems={stockItems}
        onSubmit={handleUpdateMenuItem}
      />
    </div>
  );
};

export default WarehousePage;
