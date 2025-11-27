'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Navbar from '@/components/ui/Navbar';
import PremiumModal from '@/components/ui/PremiumModal';
import PremiumButton from '@/components/forms/PremiumButton';
import PremiumInput from '@/components/forms/PremiumInput';
import PremiumSelect from '@/components/forms/PremiumSelect';
import RecipeSalesCharts from '@/components/charts/RecipeSalesCharts';
import PremiumLoader from '@/components/ui/PremiumLoader';
import { Plus, X } from 'lucide-react';
import { formatINR } from '@/lib/utils/currency';

interface Recipe {
    _id: string;
    name: string;
    description?: string;
    standardUnit: string;
    standardQuantity: number;
    unitPrice: number;
    ingredients: {
        inventoryItem: { _id: string; name: string; unit: string };
        quantity: number;
        unit: string;
    }[];
    createdBy: { name: string };
}

interface InventoryItem {
    _id: string;
    name: string;
    unit: string;
}

export default function RecipesPage() {
    const { accessToken } = useAuth();
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
    const [recipePerformance, setRecipePerformance] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        standardUnit: 'piece',
        standardQuantity: 1,
        unitPrice: 0,
        ingredients: [{ inventoryItem: '', quantity: 0, unit: '' }],
    });

    const fetchRecipes = async () => {
        try {
            const response = await fetch('/api/recipes', {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            const data = await response.json();
            setRecipes(data.recipes || []);
        } catch (error) {
            console.error('Error fetching recipes:', error);
        }
    };

    const fetchInventoryItems = async () => {
        try {
            const response = await fetch('/api/inventory', {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            const data = await response.json();
            setInventoryItems(data.items || []);
        } catch (error) {
            console.error('Error fetching inventory items:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRecipePerformance = async () => {
        try {
            const response = await fetch('/api/dashboard/stats?period=monthly', {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            const data = await response.json();
            if (data.recipes?.performance) {
                setRecipePerformance(data.recipes.performance);
            }
        } catch (error) {
            console.error('Error fetching recipe performance:', error);
        }
    };

    useEffect(() => {
        if (accessToken) {
            fetchRecipes();
            fetchInventoryItems();
            fetchRecipePerformance();
        }
    }, [accessToken]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const url = selectedRecipe ? `/api/recipes/${selectedRecipe._id}` : '/api/recipes';
            const method = selectedRecipe ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setShowModal(false);
                resetForm();
                fetchRecipes();
            } else {
                const error = await response.json();
                alert(error.error || 'Operation failed');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Operation failed');
        }
    };

    const handleEdit = (recipe: Recipe) => {
        setSelectedRecipe(recipe);
        setFormData({
            name: recipe.name,
            description: recipe.description || '',
            standardUnit: recipe.standardUnit,
            standardQuantity: recipe.standardQuantity,
            unitPrice: recipe.unitPrice || 0,
            ingredients: recipe.ingredients.map(ing => ({
                inventoryItem: ing.inventoryItem._id,
                quantity: ing.quantity,
                unit: ing.unit,
            })),
        });
        setShowModal(true);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            standardUnit: 'piece',
            standardQuantity: 1,
            unitPrice: 0,
            ingredients: [{ inventoryItem: '', quantity: 0, unit: '' }],
        });
        setSelectedRecipe(null);
    };

    const addIngredient = () => {
        setFormData({
            ...formData,
            ingredients: [...formData.ingredients, { inventoryItem: '', quantity: 0, unit: '' }],
        });
    };

    const removeIngredient = (index: number) => {
        const newIngredients = formData.ingredients.filter((_, i) => i !== index);
        setFormData({ ...formData, ingredients: newIngredients });
    };

    const updateIngredient = (index: number, field: string, value: any) => {
        const newIngredients = [...formData.ingredients];
        newIngredients[index] = { ...newIngredients[index], [field]: value };

        // Auto-fill unit when inventory item is selected
        if (field === 'inventoryItem') {
            const item = inventoryItems.find(i => i._id === value);
            if (item) {
                newIngredients[index].unit = item.unit;
            }
        }

        setFormData({ ...formData, ingredients: newIngredients });
    };

    return (
        <ProtectedRoute allowedRoles={['Admin', 'Staff', 'Viewer']}>
            <div className="min-h-screen bg-background">
                <Navbar />
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                    <div className="mb-8 animate-slide-up">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                            <div>
                                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                                    Recipe Management
                                </h1>
                                <p className="text-muted-foreground">Create and manage recipes for your bakery items</p>
                            </div>
                            <PremiumButton
                                onClick={() => {
                                    resetForm();
                                    setShowModal(true);
                                }}
                                leftIcon={<Plus className="w-4 h-4" />}
                            >
                                Add New Recipe
                            </PremiumButton>
                        </div>
                    </div>

                    {/* Recipe Sales Execution Charts */}
                    {!loading && recipePerformance.length > 0 && (
                        <div className="mb-8">
                            <RecipeSalesCharts
                                recipePerformance={recipePerformance}
                            />
                        </div>
                    )}

                    {loading ? (
                        <div className="text-center py-12">
                            <PremiumLoader size="lg" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {recipes.map((recipe) => (
                                <div key={recipe._id} className="bg-card border border-border rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                                    <h3 className="text-lg font-semibold text-foreground mb-2">{recipe.name}</h3>
                                    {recipe.description && (
                                        <p className="text-sm text-muted-foreground mb-4">{recipe.description}</p>
                                    )}
                                    <div className="mb-4">
                                        <p className="text-sm text-foreground">
                                            <span className="font-medium">Standard Yield:</span> {recipe.standardQuantity} {recipe.standardUnit}
                                        </p>
                                        <p className="text-sm text-foreground">
                                            <span className="font-medium">Unit Price:</span> {formatINR(recipe.unitPrice || 0)}
                                        </p>
                                    </div>
                                    <div className="mb-4">
                                        <p className="text-sm font-medium text-foreground mb-2">Ingredients:</p>
                                        <ul className="text-sm text-muted-foreground space-y-1">
                                            {recipe.ingredients.map((ing, idx) => (
                                                <li key={idx}>
                                                    • {ing.inventoryItem.name}: {ing.quantity} {ing.unit}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <PremiumButton
                                        variant="outline"
                                        onClick={() => handleEdit(recipe)}
                                        className="w-full"
                                    >
                                        Edit Recipe
                                    </PremiumButton>
                                </div>
                            ))}
                        </div>
                    )}

                    {!loading && recipes.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">
                            No recipes found. Add your first recipe to get started.
                        </div>
                    )}
                </div>

                {/* Add/Edit Modal */}
                <PremiumModal
                    isOpen={showModal}
                    onClose={() => {
                        setShowModal(false);
                        resetForm();
                    }}
                    title={selectedRecipe ? 'Edit Recipe' : 'Add New Recipe'}
                    size="lg"
                >
                    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                        <PremiumInput
                            label="Recipe Name"
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Description (Optional)</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={2}
                                className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <PremiumInput
                                label="Standard Quantity"
                                type="number"
                                required
                                min="1"
                                value={formData.standardQuantity}
                                onChange={(e) => setFormData({ ...formData, standardQuantity: parseInt(e.target.value) })}
                            />
                            <PremiumInput
                                label="Standard Unit"
                                type="text"
                                required
                                value={formData.standardUnit}
                                onChange={(e) => setFormData({ ...formData, standardUnit: e.target.value })}
                            />
                            <PremiumInput
                                label="Unit Price (₹)"
                                type="number"
                                required
                                min="0"
                                step="0.01"
                                value={formData.unitPrice}
                                onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) })}
                            />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-foreground">Ingredients</label>
                                <PremiumButton
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={addIngredient}
                                    leftIcon={<Plus className="w-4 h-4" />}
                                >
                                    Add Ingredient
                                </PremiumButton>
                            </div>
                            {formData.ingredients.map((ingredient, index) => (
                                <div key={index} className="flex gap-2 mb-2">
                                    <PremiumSelect
                                        value={ingredient.inventoryItem}
                                        onChange={(e) => updateIngredient(index, 'inventoryItem', e.target.value)}
                                        options={[
                                            { value: '', label: 'Select Item' },
                                            ...inventoryItems.map((item) => ({ value: item._id, label: item.name })),
                                        ]}
                                        className="flex-1"
                                    />
                                    <PremiumInput
                                        type="number"
                                        required
                                        min="0.01"
                                        step="0.01"
                                        placeholder="Quantity"
                                        value={ingredient.quantity || ''}
                                        onChange={(e) => updateIngredient(index, 'quantity', parseFloat(e.target.value))}
                                        className="w-24"
                                    />
                                    <PremiumInput
                                        type="text"
                                        required
                                        placeholder="Unit"
                                        value={ingredient.unit}
                                        onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                                        className="w-20"
                                    />
                                    {formData.ingredients.length > 1 && (
                                        <PremiumButton
                                            type="button"
                                            variant="danger"
                                            size="sm"
                                            onClick={() => removeIngredient(index)}
                                        >
                                            <X className="w-4 h-4" />
                                        </PremiumButton>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="flex space-x-2 pt-4">
                            <PremiumButton type="submit" className="flex-1">
                                {selectedRecipe ? 'Update' : 'Create'}
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
            </div>
        </ProtectedRoute>
    );
}

