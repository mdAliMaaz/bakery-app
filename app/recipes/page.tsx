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
import RecipeSalesCharts from '@/components/charts/RecipeSalesCharts';
import PremiumLoader from '@/components/ui/PremiumLoader';
import Autocomplete from '@/components/ui/Autocomplete';
import { Plus, X } from 'lucide-react';

interface Recipe {
    _id: string;
    name: string;
    description?: string;
    standardUnit: string;
    standardQuantity: number;
    ingredients: {
        // Fix inventoryItem type for compatibility with Autocomplete:
        inventoryItem: string; // should be inventoryItem: string (store _id), NOT object. Store just the ID so Autocomplete can update it easily.
        quantity: number;
        unit: string;
    }[];
    createdBy: { name: string };
}


export default function RecipesPage() {
    const { accessToken } = useAuth();
    const api = useApi();
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
    const [recipePerformance, setRecipePerformance] = useState<any[]>([]);
    const [submitError, setSubmitError] = useState<string>('');
    const [inventoryItems, setInventoryItems] = useState<Array<{ value: string; label: string; data: any }>>([]);
    const [recipeNameSuggestions, setRecipeNameSuggestions] = useState<Array<{ value: string; label: string }>>([]);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        standardUnit: 'piece',
        standardQuantity: 1,
        ingredients: [{ inventoryItem: '', quantity: 0, unit: '' }],
    });

    const fetchRecipes = async () => {
        try {
            const data = await api.get('/api/recipes');
            const fetchedRecipes = data.recipes || [];
            setRecipes(fetchedRecipes);
            
            // Update recipe name suggestions for autocomplete
            const suggestions = fetchedRecipes.map((recipe: Recipe) => ({
                value: recipe.name,
                label: recipe.name,
            }));
            setRecipeNameSuggestions(suggestions);
        } catch (error) {
            console.error('Error fetching recipes:', error);
        } finally {
            setLoading(false);
        }
    };


    const fetchRecipePerformance = async () => {
        try {
            const data = await api.get('/api/dashboard/stats?period=monthly');
            if (data.recipes?.performance) {
                setRecipePerformance(data.recipes.performance);
            }
        } catch (error) {
            console.error('Error fetching recipe performance:', error);
        }
    };

    const fetchInventoryItems = async () => {
        try {
            const data = await api.get('/api/inventory');
            const items = data.items?.map((item: any) => ({
                value: item._id,
                label: item.name,
                data: item,
            })) || [];
            setInventoryItems(items);
        } catch (error) {
            console.error('Error fetching inventory items:', error);
            setInventoryItems([]);
        }
    };

    useEffect(() => {
        fetchRecipes();
        fetchInventoryItems();
        fetchRecipePerformance();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError('');

        try {
            const url = selectedRecipe ? `/api/recipes/${selectedRecipe._id}` : '/api/recipes';

            if (selectedRecipe) {
                // Update existing recipe
                await api.put(url, formData);
            } else {
                // Create new recipe
                await api.post(url, formData);
            }

            setShowModal(false);
            resetForm();
            fetchRecipes();
        } catch (error: any) {
            console.error('Error:', error);
            
            // Check if it's a duplicate error message
            if (error.message && error.message.includes('already exists')) {
                setSubmitError(error.message);
            } else {
                setSubmitError(error.message || 'Network error. Please try again.');
            }
        }
    };

    const handleEdit = (recipe: Recipe) => {
        setSelectedRecipe(recipe);
        setFormData({
            name: recipe.name,
            description: recipe.description || '',
            standardUnit: recipe.standardUnit,
            standardQuantity: recipe.standardQuantity,
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
            ingredients: [{ inventoryItem: '', quantity: 0, unit: '' }],
        });
        setSelectedRecipe(null);
        setSubmitError('');
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
            const item = inventoryItems.find(i => i.value === value);
            if (item && item.data) {
                newIngredients[index].unit = item.data.unit;
            }
        }

        setFormData({ ...formData, ingredients: newIngredients });
    };

    return (
        <ProtectedRoute allowedRoles={['Admin', 'Staff', 'Viewer']}>
            <AppLayout>
                    <div className="mb-8 animate-slide-up">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                            <div>
                                <h1 className="text-4xl font-bold text-indigo-300 mb-2">
                                    Recipe Management
                                </h1>
                                <p className="text-gray-400 font-medium">Create and manage recipes for your bakery items</p>
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
                                <div key={recipe._id} className="bg-card border border-border p-6 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                                    <h3 className="text-lg font-bold text-gray-100 mb-2">{recipe.name}</h3>
                                    {recipe.description && (
                                        <p className="text-sm text-gray-300 mb-4 font-medium">{recipe.description}</p>
                                    )}
                                    <div className="mb-4">
                                        <p className="text-sm text-gray-100 font-medium">
                                            <span className="font-semibold">Standard Yield:</span> {recipe.standardQuantity} {recipe.standardUnit}
                                        </p>
                                    </div>
                                    <div className="mb-4">
                                        <p className="text-sm font-semibold text-gray-100 mb-2">Ingredients:</p>
                                        <ul className="text-sm text-gray-300 space-y-1 font-medium">
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
                        <div className="text-center py-12 text-gray-400 font-medium">
                            No recipes found. Add your first recipe to get started.
                        </div>
                    )}

                {/* Add/Edit Modal */}
                <PremiumModal
                    isOpen={showModal}
                    onClose={() => {
                        setShowModal(false);
                        resetForm();
                    }}
                    title={selectedRecipe ? 'Edit Recipe' : 'Add New Recipe'}
                    size="xl"
                >
                    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-visible pr-2">
                        {submitError && (
                            <div className="bg-red-900/20 border border-red-800 p-4 mb-4">
                                <p className="text-red-400 text-sm font-medium">
                                    {submitError}
                                </p>
                            </div>
                        )}
                        <Autocomplete
                            label="Recipe Name"
                            options={recipeNameSuggestions}
                            value={formData.name}
                            onChange={(value) => setFormData({ ...formData, name: value })}
                            onSelect={(option) => setFormData({ ...formData, name: option.label })}
                            placeholder="Enter recipe name or search existing recipes..."
                            showClearButton={true}
                        />
                        <div>
                            <label className="block text-sm font-semibold text-gray-100 mb-2">Description (Optional)</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={2}
                                className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-600 text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 rounded-xl font-medium"
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
                            {inventoryItems.length === 0 && (
                                <div className="text-xs text-amber-400 bg-amber-900/20 px-2 py-1 rounded mb-4">
                                    Create inventory items first to add ingredients to recipes.
                                </div>
                            )}
                            {formData.ingredients.map((ingredient, index) => (
                                <div key={index} className="flex gap-3 mb-3 items-end">
                                    <div className="flex-1 min-w-0">
                                        <Autocomplete
                                            options={inventoryItems.length > 0 ? inventoryItems : [
                                                { value: 'test1', label: 'Flour', data: { unit: 'kg' } },
                                                { value: 'test2', label: 'Sugar', data: { unit: 'kg' } },
                                                { value: 'test3', label: 'Milk', data: { unit: 'liter' } },
                                                { value: 'test4', label: 'Eggs', data: { unit: 'piece' } },
                                                { value: 'test5', label: 'Butter', data: { unit: 'kg' } }
                                            ]}
                                            value={inventoryItems.find(item => item.value === ingredient.inventoryItem)?.label || ''}
                                            onChange={(value) => {
                                                // Find the item by label and update
                                                const allItems = inventoryItems.length > 0 ? inventoryItems : [
                                                    { value: 'test1', label: 'Flour', data: { unit: 'kg' } },
                                                    { value: 'test2', label: 'Sugar', data: { unit: 'kg' } },
                                                    { value: 'test3', label: 'Milk', data: { unit: 'liter' } },
                                                    { value: 'test4', label: 'Eggs', data: { unit: 'piece' } },
                                                    { value: 'test5', label: 'Butter', data: { unit: 'kg' } }
                                                ];
                                                const selectedItem = allItems.find(item =>
                                                    item.label.toLowerCase() === value.toLowerCase()
                                                );
                                                if (selectedItem) {
                                                    updateIngredient(index, 'inventoryItem', selectedItem.value);
                                                }
                                            }}
                                            onSelect={(option) => {
                                                updateIngredient(index, 'inventoryItem', option.value);
                                            }}
                                            placeholder={inventoryItems.length === 0 ? "No inventory items available (showing test data)" : "Search inventory items..."}
                                            showClearButton={true}
                                        />
                                    </div>
                                    <div className="w-32">
                                        <PremiumInput
                                            type="number"
                                            required
                                            min="0.01"
                                            step="0.01"
                                            placeholder="Quantity"
                                            value={ingredient.quantity || ''}
                                            onChange={(e) => updateIngredient(index, 'quantity', parseFloat(e.target.value))}
                                        />
                                    </div>
                                    <div className="w-28">
                                        <PremiumInput
                                            type="text"
                                            required
                                            placeholder="Unit"
                                            value={ingredient.unit}
                                            onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                                        />
                                    </div>
                                    {formData.ingredients.length > 1 && (
                                        <PremiumButton
                                            type="button"
                                            variant="danger"
                                            size="sm"
                                            onClick={() => removeIngredient(index)}
                                            className="flex-shrink-0"
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
            </AppLayout>
        </ProtectedRoute>
    );
}

