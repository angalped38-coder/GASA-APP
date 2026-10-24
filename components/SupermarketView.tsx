'use client';

import React, { useState, useMemo } from 'react';
import {
  ShoppingCart,
  Plus,
  CheckCircle2,
  Circle,
  ExternalLink,
  Sparkles,
  Search,
  Filter,
  Trash2,
  Edit2,
  Tag,
  Info,
  Check,
  ArrowRight,
  TrendingDown,
  ShoppingBag,
  Store,
  Layers,
  ChevronRight,
  Lock,
} from 'lucide-react';
import {
  SupermarketItem,
  SupermarketCategory,
  HouseholdMember,
  formatAmount,
  calculateSupermarketTotals,
  isChildRole,
} from '@/lib/finance-logic';
import {
  COMPRADOR_DIGITAL_CATALOG,
  CompradorDigitalProduct,
  getCompradorDigitalUrl,
  COMPRADOR_DIGITAL_INFO,
} from '@/lib/comprador-digital';

interface SupermarketViewProps {
  items: SupermarketItem[];
  members: HouseholdMember[];
  currencySymbol: string;
  activeMemberId: string | 'all';
  onAddItem: (item: Omit<SupermarketItem, 'id' | 'addedDate'>) => void;
  onUpdateItem: (item: SupermarketItem) => void;
  onDeleteItem: (id: string) => void;
  onConvertToExpense: (purchasedItems: SupermarketItem[], totalAmount: number) => void;
}

const CATEGORY_LABELS: Record<SupermarketCategory, { label: string; icon: string; color: string }> = {
  almacen: { label: 'Almacén', icon: '🥫', color: 'bg-amber-500/10 text-amber-300 border-amber-500/30' },
  lacteos_huevos: { label: 'Lácteos y Huevos', icon: '🥛', color: 'bg-blue-500/10 text-blue-300 border-blue-500/30' },
  carniceria_pollo: { label: 'Carnicería y Pollo', icon: '🥩', color: 'bg-rose-500/10 text-rose-300 border-rose-500/30' },
  verduras_frutas: { label: 'Frutas y Verduras', icon: '🥬', color: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' },
  panaderia: { label: 'Panadería', icon: '🥖', color: 'bg-orange-500/10 text-orange-300 border-orange-500/30' },
  limpieza: { label: 'Limpieza y Hogar', icon: '🧹', color: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30' },
  higiene: { label: 'Higiene Personal', icon: '🧴', color: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30' },
  bebidas: { label: 'Bebidas e Infusiones', icon: '🧉', color: 'bg-teal-500/10 text-teal-300 border-teal-500/30' },
  otros: { label: 'Otros', icon: '📦', color: 'bg-slate-500/10 text-slate-300 border-slate-500/30' },
};

export function SupermarketView({
  items,
  members,
  currencySymbol,
  activeMemberId,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onConvertToExpense,
}: SupermarketViewProps) {
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'purchased'>('all');
  const [selectedCategory, setSelectedCategory] = useState<SupermarketCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [selectedCatalogCategory, setSelectedCatalogCategory] = useState<SupermarketCategory | 'all'>('all');
  const [editingItem, setEditingItem] = useState<SupermarketItem | null>(null);

  // Active member role check
  const activeMember = members.find((m) => m.id === activeMemberId);
  const isChild = isChildRole(activeMember?.role);

  // New Item Form State
  const [formData, setFormData] = useState<{
    name: string;
    category: SupermarketCategory;
    quantity: number;
    unit: string;
    estimatedPrice: number;
    requestedByMemberId: string;
    notes: string;
    isReferencePrice: boolean;
  }>({
    name: '',
    category: 'almacen',
    quantity: 1,
    unit: 'unid',
    estimatedPrice: 10000,
    requestedByMemberId: activeMemberId !== 'all' ? activeMemberId : (members[0]?.id || 'm-galindo'),
    notes: '',
    isReferencePrice: false,
  });

  const totals = useMemo(() => calculateSupermarketTotals(items), [items]);

  // Filtered Items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (filterStatus === 'pending' && item.purchased) return false;
      if (filterStatus === 'purchased' && !item.purchased) return false;
      if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesNotes = item.notes?.toLowerCase().includes(query);
        const member = members.find((m) => m.id === item.requestedByMemberId);
        const matchesMember = member?.name.toLowerCase().includes(query);
        if (!matchesName && !matchesNotes && !matchesMember) return false;
      }
      return true;
    });
  }, [items, filterStatus, selectedCategory, searchQuery, members]);

  // Filtered Catalog
  const filteredCatalog = useMemo(() => {
    return COMPRADOR_DIGITAL_CATALOG.filter((prod) => {
      if (selectedCatalogCategory !== 'all' && prod.category !== selectedCatalogCategory) return false;
      if (catalogSearch.trim()) {
        const term = catalogSearch.toLowerCase();
        return (
          prod.name.toLowerCase().includes(term) ||
          prod.genericName.toLowerCase().includes(term) ||
          prod.categoryLabel.toLowerCase().includes(term)
        );
      }
      return true;
    });
  }, [selectedCatalogCategory, catalogSearch]);

  const handleOpenAddModal = (initialData?: Partial<typeof formData>) => {
    setEditingItem(null);
    setFormData({
      name: initialData?.name || '',
      category: initialData?.category || 'almacen',
      quantity: initialData?.quantity || 1,
      unit: initialData?.unit || 'unid',
      estimatedPrice: initialData?.estimatedPrice || 10000,
      requestedByMemberId:
        activeMemberId !== 'all' ? activeMemberId : (members[0]?.id || 'm-galindo'),
      notes: initialData?.notes || '',
      isReferencePrice: !!initialData?.isReferencePrice,
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (item: SupermarketItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      estimatedPrice: item.estimatedPrice,
      requestedByMemberId: item.requestedByMemberId,
      notes: item.notes || '',
      isReferencePrice: !!item.isReferencePrice,
    });
    setIsAddModalOpen(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingItem) {
      onUpdateItem({
        ...editingItem,
        name: formData.name.trim(),
        category: formData.category,
        quantity: Number(formData.quantity) || 1,
        unit: formData.unit,
        estimatedPrice: Number(formData.estimatedPrice) || 0,
        requestedByMemberId: formData.requestedByMemberId,
        notes: formData.notes.trim(),
        isReferencePrice: formData.isReferencePrice,
      });
    } else {
      onAddItem({
        name: formData.name.trim(),
        category: formData.category,
        quantity: Number(formData.quantity) || 1,
        unit: formData.unit,
        estimatedPrice: Number(formData.estimatedPrice) || 0,
        purchased: false,
        requestedByMemberId: formData.requestedByMemberId,
        notes: formData.notes.trim(),
        isReferencePrice: formData.isReferencePrice,
      });
    }

    setIsAddModalOpen(false);
  };

  const handleAddFromCatalog = (product: CompradorDigitalProduct) => {
    onAddItem({
      name: product.name,
      category: product.category,
      quantity: product.suggestedQty || 1,
      unit: product.unit,
      estimatedPrice: product.averagePriceGs,
      purchased: false,
      requestedByMemberId: activeMemberId !== 'all' ? activeMemberId : (members[0]?.id || 'm-galindo'),
      notes: `Ref. Comprador.digital (${product.tip})`,
      isReferencePrice: true,
      compradorDigitalSlug: product.id,
    });
    setIsCatalogModalOpen(false);
  };

  const handleConvertCart = () => {
    const purchasedItems = items.filter((i) => i.purchased);
    if (purchasedItems.length === 0) return;
    onConvertToExpense(purchasedItems, totals.totalEstimatedPurchased);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950 p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/20">
                <ShoppingCart className="h-5 w-5 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    Lista de Supermercado & Despensa
                  </h2>
                  <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
                    Hogar GASA
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Organización de compras y precios de referencia para la Familia Galindo Salomon
                </p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsCatalogModalOpen(true)}
              className="flex items-center gap-2 rounded-xl border border-teal-500/30 bg-teal-500/10 px-3.5 py-2 text-xs font-bold text-teal-300 hover:bg-teal-500/20 transition-all hover:border-teal-400"
            >
              <Store className="h-4 w-4 text-teal-400" />
              <span>Precios Comprador.digital</span>
            </button>

            <button
              onClick={() => handleOpenAddModal()}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-md shadow-emerald-500/20 hover:opacity-95 transition-all"
            >
              <Plus className="h-4 w-4 stroke-[3]" />
              <span>+ Agregar Producto</span>
            </button>
          </div>
        </div>

        {/* Financial Metrics Strip */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-800/80 pt-5">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Por Comprar (Pendientes)</span>
              <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-500/20">
                {totals.pendingCount} ítems
              </span>
            </div>
            <p className="mt-2 text-xl font-extrabold text-amber-300">
              {currencySymbol}
              {formatAmount(totals.totalEstimatedPending)}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">Estimado canasta faltante</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">En el Carrito / Comprado</span>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/20">
                {totals.purchasedCount} ítems
              </span>
            </div>
            <p className="mt-2 text-xl font-extrabold text-emerald-400">
              {currencySymbol}
              {formatAmount(totals.totalEstimatedPurchased)}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">Listo para asentar al presupuesto</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Total Canasta Estimada</span>
              <span className="text-[11px] text-slate-400">{totals.totalItemsCount} productos</span>
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <p className="text-xl font-bold text-white">
                {currencySymbol}
                {formatAmount(totals.totalEstimatedAll)}
              </p>
              {totals.purchasedCount > 0 && (
                <div>
                  {isChild ? (
                    <span
                      title="Solo los padres o administradores pueden asentar el gasto en las cuentas del hogar"
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2 py-1 text-[10px] font-medium text-slate-400 cursor-not-allowed"
                    >
                      <Lock className="h-3 w-3 text-slate-400" />
                      <span>Solo Padres</span>
                    </span>
                  ) : (
                    <button
                      onClick={handleConvertCart}
                      className="flex items-center gap-1 rounded-xl bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-1 text-xs font-bold text-emerald-300 hover:bg-emerald-500/30 transition-all"
                    >
                      <span>Pasar a Gasto Familiar</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  )}
                </div>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {totals.purchasedCount > 0
                ? '¡Puedes convertir los ítems del carrito directamente en un egreso familiar!'
                : 'Marca ítems en el carrito para pasarlos a egresos del hogar.'}
            </p>
          </div>
        </div>
      </div>

      {/* Comprador Digital Info Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-teal-500/30 bg-gradient-to-r from-teal-950/40 via-slate-900 to-emerald-950/40 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30">
              <Store className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">
                  Comparador de Precios: comprador.digital
                </span>
                <span className="rounded-full bg-teal-500/20 px-2 py-0.5 text-[10px] font-semibold text-teal-300">
                  Paraguay
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 max-w-2xl">
                ¿Sabías que comparar precios de productos sin marcas (arroz, leche, fideos, aceite) entre
                Stock, Superseis, Fortis o Biggie puede ahorrarle a la Familia Galindo Salomon hasta un 25%?
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsCatalogModalOpen(true)}
              className="rounded-xl bg-teal-500/20 px-3 py-1.5 text-xs font-bold text-teal-300 hover:bg-teal-500/30 border border-teal-500/30 transition-colors"
            >
              Ver Canasta Básica
            </button>
            <a
              href="https://comprador.digital"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <span>Ir a comprador.digital</span>
              <ExternalLink className="h-3 w-3 text-slate-400" />
            </a>
          </div>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/60 p-1">
          <button
            onClick={() => setFilterStatus('all')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              filterStatus === 'all'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Todos ({items.length})
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              filterStatus === 'pending'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Pendientes ({totals.pendingCount})
          </button>
          <button
            onClick={() => setFilterStatus('purchased')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              filterStatus === 'purchased'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            En el Carrito ({totals.purchasedCount})
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="flex items-center gap-2 flex-1 md:max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar producto o solicitante..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-900/80 pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as SupermarketCategory | 'all')}
            aria-label="Filtrar por categoría de supermercado"
            className="rounded-xl border border-slate-800 bg-slate-900/80 px-2.5 py-1.5 text-xs font-medium text-slate-300 focus:border-emerald-500 focus:outline-none cursor-pointer"
          >
            <option value="all">Todas las categorías</option>
            {Object.entries(CATEGORY_LABELS).map(([catKey, catInfo]) => (
              <option key={catKey} value={catKey}>
                {catInfo.icon} {catInfo.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Items List */}
      <div className="space-y-2.5">
        {filteredItems.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center">
            <ShoppingCart className="mx-auto h-12 w-12 text-slate-600 mb-3" />
            <h4 className="text-base font-bold text-white">No hay productos en esta lista</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              Agrega productos necesarios para el hogar o importa sugerencias de la canasta básica con precios de referencia de comprador.digital.
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                onClick={() => setIsCatalogModalOpen(true)}
                className="rounded-xl border border-teal-500/30 bg-teal-500/10 px-3.5 py-2 text-xs font-semibold text-teal-300 hover:bg-teal-500/20"
              >
                Explorar Canasta Básica
              </button>
              <button
                onClick={() => handleOpenAddModal()}
                className="rounded-xl bg-emerald-500 px-3.5 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400"
              >
                + Agregar Manualmente
              </button>
            </div>
          </div>
        ) : (
          filteredItems.map((item) => {
            const member = members.find((m) => m.id === item.requestedByMemberId);
            const cat = CATEGORY_LABELS[item.category] || CATEGORY_LABELS.otros;
            const subtotal = Math.round(item.estimatedPrice * (item.quantity || 1));

            return (
              <div
                key={item.id}
                className={`group flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border p-4 transition-all ${
                  item.purchased
                    ? 'border-emerald-500/30 bg-emerald-950/10 opacity-80'
                    : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900/80 shadow-sm'
                }`}
              >
                {/* Left check & info */}
                <div className="flex items-start sm:items-center gap-3">
                  <button
                    onClick={() => onUpdateItem({ ...item, purchased: !item.purchased })}
                    title={item.purchased ? 'Marcar como pendiente' : 'Marcar como comprado en el carrito'}
                    className={`mt-0.5 sm:mt-0 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border transition-all ${
                      item.purchased
                        ? 'border-emerald-500 bg-emerald-500 text-slate-950'
                        : 'border-slate-700 bg-slate-800/80 text-transparent hover:border-emerald-400 hover:text-emerald-400'
                    }`}
                  >
                    <Check className="h-4 w-4 stroke-[3]" />
                  </button>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-sm font-bold ${
                          item.purchased ? 'line-through text-slate-400' : 'text-white'
                        }`}
                      >
                        {item.name}
                      </span>

                      {/* Category Badge */}
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border ${cat.color}`}
                      >
                        {cat.icon} {cat.label}
                      </span>

                      {/* Reference Price Badge */}
                      {item.isReferencePrice && (
                        <a
                          href={getCompradorDigitalUrl(item.name)}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Comparar este producto en comprador.digital"
                          className="flex items-center gap-1 rounded-full bg-teal-500/10 px-2 py-0.5 text-[10px] font-semibold text-teal-300 border border-teal-500/20 hover:bg-teal-500/20"
                        >
                          <span>Ref. comprador.digital</span>
                          <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      )}
                    </div>

                    {/* Quantity, price, notes & requested by */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                      <span>
                        Cantidad:{' '}
                        <strong className="text-slate-200">
                          {item.quantity} {item.unit}
                        </strong>
                      </span>
                      <span>•</span>
                      <span>
                        Precio unit.:{' '}
                        <strong className="text-slate-200">
                          {currencySymbol}
                          {formatAmount(item.estimatedPrice)}
                        </strong>
                      </span>
                      {member && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <span>Pedido por:</span>
                            <span className="font-semibold text-indigo-300">{member.name}</span>
                          </span>
                        </>
                      )}
                    </div>

                    {item.notes && (
                      <p className="text-[11px] text-slate-400 italic">Nota: {item.notes}</p>
                    )}
                  </div>
                </div>

                {/* Right: Subtotal & Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-slate-800/80 pt-2 sm:pt-0">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-slate-400 block">Subtotal</span>
                    <span
                      className={`text-base font-extrabold ${
                        item.purchased ? 'text-emerald-400' : 'text-slate-200'
                      }`}
                    >
                      {currencySymbol}
                      {formatAmount(subtotal)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <a
                      href={getCompradorDigitalUrl(item.name)}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Buscar alternativas en comprador.digital"
                      className="p-1.5 text-slate-400 hover:text-teal-300 hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <Store className="h-3.5 w-3.5" />
                    </a>

                    <button
                      onClick={() => handleOpenEditModal(item)}
                      title="Editar producto"
                      className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>

                    <button
                      onClick={() => onDeleteItem(item.id)}
                      title="Eliminar de la lista"
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL: ADD / EDIT ITEM */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">
                  {editingItem ? 'Editar Producto del Súper' : 'Agregar a la Lista de Supermercado'}
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs font-semibold"
              >
                ✕ Cerrar
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Nombre del Producto *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Leche fluida sachet 1L, Arroz blanco, Detergente..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Categoría</label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value as SupermarketCategory })
                    }
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                  >
                    {Object.entries(CATEGORY_LABELS).map(([catKey, catInfo]) => (
                      <option key={catKey} value={catKey}>
                        {catInfo.icon} {catInfo.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Solicitado por Miembro
                  </label>
                  <select
                    value={formData.requestedByMemberId}
                    onChange={(e) =>
                      setFormData({ ...formData, requestedByMemberId: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                  >
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Cantidad</label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData({ ...formData, quantity: Math.max(1, parseInt(e.target.value) || 1) })
                    }
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Unidad</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="unid">unid (unidad)</option>
                    <option value="kg">kg (kilos)</option>
                    <option value="litro">litro (L)</option>
                    <option value="paquete">paquete</option>
                    <option value="docena">docena</option>
                    <option value="g">gramos (g)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Precio Estimado (Gs.)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    placeholder="10000"
                    value={formData.estimatedPrice}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        estimatedPrice: Math.max(0, parseInt(e.target.value) || 0),
                      })
                    }
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Notas / Detalles (opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej. Preferiblemente sachet o paquete económico"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="chk-ref"
                  checked={formData.isReferencePrice}
                  onChange={(e) =>
                    setFormData({ ...formData, isReferencePrice: e.target.checked })
                  }
                  className="rounded border-slate-700 bg-slate-950 text-emerald-500"
                />
                <label htmlFor="chk-ref" className="text-slate-400 text-xs cursor-pointer">
                  Marcar como precio de referencia de comprador.digital
                </label>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2 text-xs font-bold text-slate-950 hover:opacity-95 shadow-md shadow-emerald-500/20"
                >
                  {editingItem ? 'Guardar Cambios' : 'Agregar al Súper'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: COMPRADOR DIGITAL REFERENCE CATALOG */}
      {isCatalogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-slate-800 bg-slate-950/70">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30">
                      <Store className="h-4 w-4" />
                    </div>
                    <h3 className="text-lg font-bold text-white">
                      Canasta Básica Paraguaya (Precios de Referencia)
                    </h3>
                    <span className="rounded-full bg-teal-500/20 px-2 py-0.5 text-[10px] font-semibold text-teal-300">
                      comprador.digital
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Precios promedio de productos genéricos y sin marcas recopilados en las cadenas de supermercados de Paraguay. Haz clic en <strong>Agregar a la Lista</strong> para cargarlo directamente con precio estimado.
                  </p>
                </div>
                <button
                  onClick={() => setIsCatalogModalOpen(false)}
                  className="text-slate-400 hover:text-white text-xs font-semibold p-1"
                >
                  ✕ Cerrar
                </button>
              </div>

              {/* Search & Category Filter */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Buscar producto genérico (ej. arroz, leche, huevos)..."
                    value={catalogSearch}
                    onChange={(e) => setCatalogSearch(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-teal-500 focus:outline-none"
                  />
                </div>

                <select
                  value={selectedCatalogCategory}
                  onChange={(e) =>
                    setSelectedCatalogCategory(e.target.value as SupermarketCategory | 'all')
                  }
                  className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-teal-500 focus:outline-none cursor-pointer"
                >
                  <option value="all">Todas las categorías de la canasta</option>
                  {Object.entries(CATEGORY_LABELS).map(([catKey, catInfo]) => (
                    <option key={catKey} value={catKey}>
                      {catInfo.icon} {catInfo.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Catalog Grid */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredCatalog.map((prod) => {
                  const cat = CATEGORY_LABELS[prod.category] || CATEGORY_LABELS.otros;

                  return (
                    <div
                      key={prod.id}
                      className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 hover:border-teal-500/40 hover:bg-slate-900/80 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-semibold text-teal-400">
                              {prod.genericName}
                            </span>
                            <h4 className="text-sm font-bold text-white mt-0.5">{prod.name}</h4>
                          </div>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border ${cat.color} shrink-0`}
                          >
                            {cat.icon} {cat.label}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-400 mt-2 line-clamp-2">
                          {prod.description}
                        </p>

                        <div className="mt-2 text-[11px] text-emerald-400/90 bg-emerald-500/10 rounded-xl p-2 border border-emerald-500/20">
                          💡 <strong>Consejo de Ahorro:</strong> {prod.tip}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-500 block">
                            Promedio ({prod.storesComparedCount} súpers)
                          </span>
                          <span className="text-sm font-extrabold text-teal-300">
                            {currencySymbol}
                            {formatAmount(prod.averagePriceGs)}
                          </span>
                          <span className="text-[10px] text-slate-400 ml-1.5">
                            ({formatAmount(prod.minPriceGs)} - {formatAmount(prod.maxPriceGs)})
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <a
                            href={getCompradorDigitalUrl(prod.name)}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Ver comparador en vivo en comprador.digital"
                            className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 text-xs"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>

                          <button
                            onClick={() => handleAddFromCatalog(prod)}
                            className="flex items-center gap-1 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 px-3 py-1.5 text-xs font-bold text-slate-950 hover:opacity-95 shadow"
                          >
                            <Plus className="h-3 w-3 stroke-[3]" />
                            <span>Agregar</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer with direct link info */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="text-slate-400 flex items-center gap-2">
                <span>🌐 Fuente de datos:</span>
                <a
                  href="https://comprador.digital"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-400 hover:underline font-semibold"
                >
                  comprador.digital (Paraguay)
                </a>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline">Monitoreo de 150.000 artículos en Asunción</span>
              </div>
              <button
                onClick={() => setIsCatalogModalOpen(false)}
                className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700"
              >
                Cerrar Catálogo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
