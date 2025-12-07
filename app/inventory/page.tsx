'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useApi } from '@/hooks/useApi';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AppLayout from '@/components/layout/AppLayout';
import PremiumModal from '@/components/ui/PremiumModal';
import PremiumButton from '@/components/forms/PremiumButton';
import PremiumInput from '@/components/forms/PremiumInput';
import PremiumSelect from '@/components/forms/PremiumSelect';
import PremiumTable from '@/components/tables/PremiumTable';
import { TableSkeleton } from '@/components/ui/LoadingSkeleton';
import InventoryCharts from '@/components/charts/InventoryCharts';
import Autocomplete from '@/components/ui/Autocomplete';
import { AlertTriangle, Plus, Search } from 'lucide-react';

interface InventoryItem {
    _id: string;
    name: string;
    unit: string;
    currentStock: number;
    thresholdValue: number;
    openingStock: number;
    lastUpdated: string;
    updatedBy: { name: string };
}

export default function InventoryPage() {
    const { accessToken } = useAuth();
    const api = useApi();
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showPurchaseModal, setShowPurchaseModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
    const [submitError, setSubmitError] = useState<string>('');
    const [filterLowStock, setFilterLowStock] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [nameSuggestions, setNameSuggestions] = useState<Array<{ value: string; label: string }>>([]);

    const [formData, setFormData] = useState({
        name: '',
        unit: 'Kg',
        currentStock: 0,
        thresholdValue: 0,
        openingStock: 0,
    });

    const [purchaseData, setPurchaseData] = useState({
        quantity: 0,
        cost: 0,
        vendor: '',
    });

    const fetchItems = async () => {
        try {
            const url = filterLowStock ? '/api/inventory?lowStock=true' : '/api/inventory';
            const data = await api.get(url);
            const fetchedItems = data.items || [];
            setItems(fetchedItems);

            // Update name suggestions for autocomplete
            const suggestions = fetchedItems.map((item: any) => ({
                value: item.name,
                label: item.name,
            }));
            setNameSuggestions(suggestions);
        } catch (error) {
            console.error('Error fetching items:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
            fetchItems();
    }, [filterLowStock]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError('');

        try {
            const url = selectedItem ? `/api/inventory/${selectedItem._id}` : '/api/inventory';

            if (selectedItem) {
                // Update existing item
                await api.put(url, formData);
            } else {
                // Create new item
                await api.post(url, formData);
            }

            setShowModal(false);
            resetForm();
            fetchItems();
        } catch (error) {
            console.error('Error:', error);
            setSubmitError('Network error. Please try again.');
        }
    };

    const handlePurchaseSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedItem) return;

        try {
            const response = await fetch(`/api/inventory/${selectedItem._id}/purchase`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify(purchaseData),
            });

            if (response.ok) {
                setShowPurchaseModal(false);
                setPurchaseData({ quantity: 0, cost: 0, vendor: '' });
                setSelectedItem(null);
                fetchItems();
            } else {
                const error = await response.json();
                alert(error.error || 'Operation failed');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Operation failed');
        }
    };

    const handleEdit = (item: InventoryItem) => {
        setSelectedItem(item);
        setFormData({
            name: item.name,
            unit: item.unit,
            currentStock: item.currentStock,
            thresholdValue: item.thresholdValue,
            openingStock: item.openingStock,
        });
        setShowModal(true);
    };

    const handleAddPurchase = (item: InventoryItem) => {
        setSelectedItem(item);
        setShowPurchaseModal(true);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            unit: 'Kg',
            currentStock: 0,
            thresholdValue: 0,
            openingStock: 0,
        });
        setSelectedItem(null);
        setSubmitError('');
    };

    const isLowStock = (item: InventoryItem) => item.currentStock <= item.thresholdValue;

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const unitOptions = [
        { value: 'Kg', label: 'Kg' },
        { value: 'Liter', label: 'Liter' },
        { value: 'Number', label: 'Number' },
        { value: 'Packet', label: 'Packet' },
        { value: 'Gram', label: 'Gram' },
        { value: 'ML', label: 'ML' },
        { value: 'Piece', label: 'Piece' },
    ];

    const columns = [
        {
            key: 'name',
            header: 'Name',
            render: (item: InventoryItem) => (
                <span className="font-medium text-foreground">{item.name}</span>
            ),
        },
        {
            key: 'currentStock',
            header: 'Current Stock',
            render: (item: InventoryItem) => (
                <span className="text-foreground">{item.currentStock}</span>
            ),
        },
        {
            key: 'thresholdValue',
            header: 'Threshold',
            render: (item: InventoryItem) => (
                <span className="text-foreground">{item.thresholdValue}</span>
            ),
        },
        {
            key: 'unit',
            header: 'Unit',
            render: (item: InventoryItem) => (
                <span className="text-muted-foreground">{item.unit}</span>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            render: (item: InventoryItem) => (
                isLowStock(item) ? (
                    <span className="px-2 inline-flex items-center text-xs leading-5 font-semibold rounded-full bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Low Stock
                    </span>
                ) : (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
                        In Stock
                    </span>
                )
            ),
        },
        {
            key: 'actions',
            header: 'Actions',
            render: (item: InventoryItem) => (
                <div className="flex space-x-2">
                    <PremiumButton
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleAddPurchase(item);
                        }}
                    >
                        Purchase
                    </PremiumButton>
                    <PremiumButton
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(item);
                        }}
                    >
                        Edit
                    </PremiumButton>
                </div>
            ),
        },
    ];

    return (
        <ProtectedRoute allowedRoles={['Admin', 'Staff', 'Viewer']}>
            <AppLayout>
                    {/* Header */}
                    <div className="mb-8 animate-slide-up">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                            <div>
                                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                                    Inventory Management
                                </h1>
                                <p className="text-muted-foreground">Manage your inventory items and stock levels</p>
                            </div>
                            <PremiumButton
                                onClick={() => {
                                    resetForm();
                                    setShowModal(true);
                                }}
                                leftIcon={<Plus className="w-4 h-4" />}
                            >
                                Add New Item
                            </PremiumButton>
                        </div>

                        {/* Filters and Search */}
                        <div className="flex flex-col sm:flex-row gap-4 mb-6">
                            <div className="flex-1">
                                <PremiumInput
                                    placeholder="Search inventory items..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    leftIcon={<Search className="w-5 h-5" />}
                                />
                            </div>
                            <label className="flex items-center space-x-2 px-4 py-2 bg-card border border-border rounded-lg cursor-pointer hover:bg-muted transition-colors">
                                <input
                                    type="checkbox"
                                    checked={filterLowStock}
                                    onChange={(e) => setFilterLowStock(e.target.checked)}
                                    className="rounded border-border text-primary focus:ring-primary"
                                />
                                <span className="text-sm text-foreground">Show only low stock</span>
                            </label>
                        </div>
                    </div>

                    {/* Inventory Analytics Charts */}
                    {!loading && items.length > 0 && (
                        <div className="mb-8">
                            <InventoryCharts
                                inventoryData={{
                                    total: items.length,
                                    lowStock: items.filter(isLowStock).length,
                                    lowStockItems: items.filter(isLowStock),
                                }}
                            />
                        </div>
                    )}

                    {/* Table */}
                    {loading ? (
                        <TableSkeleton rows={5} columns={6} />
                    ) : (
                        <PremiumTable
                            data={filteredItems}
                            columns={columns}
                            keyExtractor={(item) => item._id}
                            emptyMessage="No inventory items found. Add your first item to get started."
                        />
                    )}

                {/* Add/Edit Modal */}
                <PremiumModal
                    isOpen={showModal}
                    onClose={() => {
                        setShowModal(false);
                        resetForm();
                    }}
                    title={selectedItem ? 'Edit Item' : 'Add New Item'}
                    size="md"
                >
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {submitError && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
                                <p className="text-red-600 dark:text-red-400 text-sm font-medium">
                                    {submitError}
                                </p>
                            </div>
                        )}
                        <Autocomplete
                            label="Name"
                            options={nameSuggestions}
                            value={formData.name}
                            onChange={(value) => setFormData({ ...formData, name: value })}
                            onSelect={(option) => setFormData({ ...formData, name: option.label })}
                            placeholder="Enter item name or search existing items..."
                            showClearButton={true}
                        />
                        <PremiumSelect
                            label="Unit"
                            value={formData.unit}
                            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                            options={unitOptions}
                        />
                        <PremiumInput
                            label="Current Stock"
                            type="number"
                            required
                            min="0"
                            step="0.01"
                            value={formData.currentStock}
                            onChange={(e) => setFormData({ ...formData, currentStock: parseFloat(e.target.value) })}
                        />
                        <PremiumInput
                            label="Threshold Value"
                            type="number"
                            required
                            min="0"
                            step="0.01"
                            value={formData.thresholdValue}
                            onChange={(e) => setFormData({ ...formData, thresholdValue: parseFloat(e.target.value) })}
                        />
                        <PremiumInput
                            label="Opening Stock"
                            type="number"
                            required
                            min="0"
                            step="0.01"
                            value={formData.openingStock}
                            onChange={(e) => setFormData({ ...formData, openingStock: parseFloat(e.target.value) })}
                        />
                        <div className="flex space-x-2 pt-4">
                            <PremiumButton type="submit" className="flex-1">
                                {selectedItem ? 'Update' : 'Create'}
                            </PremiumButton>
                            <PremiumButton
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setShowModal(false);
                                    resetForm();
                                }}
                                className="flex-1"
                            >
                                Cancel
                            </PremiumButton>
                        </div>
                    </form>
                </PremiumModal>

                {/* Purchase Modal */}
                <PremiumModal
                    isOpen={showPurchaseModal}
                    onClose={() => {
                        setShowPurchaseModal(false);
                        setPurchaseData({ quantity: 0, cost: 0, vendor: '' });
                        setSelectedItem(null);
                    }}
                    title={`Add Purchase for ${selectedItem?.name || ''}`}
                    size="md"
                >
                    <form onSubmit={handlePurchaseSubmit} className="space-y-4">
                        <PremiumInput
                            label="Quantity"
                            type="number"
                            required
                            min="0.01"
                            step="0.01"
                            value={purchaseData.quantity}
                            onChange={(e) => setPurchaseData({ ...purchaseData, quantity: parseFloat(e.target.value) })}
                        />
                        <PremiumInput
                            label="Cost"
                            type="number"
                            required
                            min="0"
                            step="0.01"
                            value={purchaseData.cost}
                            onChange={(e) => setPurchaseData({ ...purchaseData, cost: parseFloat(e.target.value) })}
                        />
                        <PremiumInput
                            label="Vendor (Optional)"
                            type="text"
                            value={purchaseData.vendor}
                            onChange={(e) => setPurchaseData({ ...purchaseData, vendor: e.target.value })}
                        />
                        <div className="flex space-x-2 pt-4">
                            <PremiumButton type="submit" className="flex-1">
                                Add Purchase
                            </PremiumButton>
                            <PremiumButton
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setShowPurchaseModal(false);
                                    setPurchaseData({ quantity: 0, cost: 0, vendor: '' });
                                    setSelectedItem(null);
                                }}
                                className="flex-1"
                            >
                                Cancel
                            </PremiumButton>
                        </div>
                    </form>
                </PremiumModal>
            </AppLayout>
        </ProtectedRoute>
    );
}