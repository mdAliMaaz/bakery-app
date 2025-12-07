"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useApi } from "@/hooks/useApi";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AppLayout from "@/components/layout/AppLayout";
import PremiumModal from "@/components/ui/PremiumModal";
import PremiumButton from "@/components/forms/PremiumButton";
import PremiumInput from "@/components/forms/PremiumInput";
import PremiumSelect from "@/components/forms/PremiumSelect";
import PremiumTable from "@/components/tables/PremiumTable";
import { TableSkeleton } from "@/components/ui/LoadingSkeleton";
import {
  AlertTriangle,
  Plus,
  Search,
  Package,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

interface FinishedGoodsItem {
  _id: string;
  name: string;
  recipe: {
    _id: string;
    name: string;
    standardUnit: string;
  };
  unit: string;
  currentStock: number;
  lastProducedDate?: string;
  stockHistory: Array<{
    transactionType: string;
    quantity: number;
    date: string;
    orderId?: string;
    notes?: string;
    updatedBy: {
      name: string;
    };
  }>;
}

export default function FinishedGoodsPage() {
  const { accessToken } = useAuth();
  const api = useApi();
  const [items, setItems] = useState<FinishedGoodsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitError, setSubmitError] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [formData, setFormData] = useState({
    name: "",
    recipe: "",
    unit: "Piece",
    currentStock: 0,
  });

  const [recipes, setRecipes] = useState<
    Array<{ value: string; label: string; data: any }>
  >([]);

  useEffect(() => {
    fetchItems();
    fetchRecipes();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/finished-goods");
      setItems(response.finishedGoods || []);
    } catch (error) {
      console.error("Error fetching finished goods:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecipes = async () => {
    try {
      const response = await api.get("/api/recipes");
      const recipeOptions = response.recipes.map((recipe: any) => ({
        value: recipe._id,
        label: recipe.name,
        data: recipe,
      }));
      setRecipes(recipeOptions);
    } catch (error) {
      console.error("Error fetching recipes:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    try {
      await api.post("/api/finished-goods", formData);
      setShowModal(false);
      setFormData({
        name: "",
        recipe: "",
        unit: "Piece",
        currentStock: 0,
      });
      fetchItems();
    } catch (error: any) {
      setSubmitError(
        error.response?.data?.error || "Failed to create finished goods item",
      );
    }
  };

  // Filter items based on search query
  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.recipe.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = filteredItems.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const columns = [
    {
      key: "name",
      header: "Product Name",
      render: (item: FinishedGoodsItem) => (
        <div className="flex items-center">
          <Package className="w-5 h-5 text-primary mr-3" />
          <span className="font-semibold text-gray-100">{item.name}</span>
        </div>
      ),
    },
    {
      key: "recipe",
      header: "Recipe",
      render: (item: FinishedGoodsItem) => (
        <span className="text-gray-100 font-medium">{item.recipe.name}</span>
      ),
    },
    {
      key: "currentStock",
      header: "Current Stock",
      render: (item: FinishedGoodsItem) => {
        const isLowStock = item.currentStock <= 5;
        return (
          <div className="flex items-center">
            <span
              className={`font-bold text-lg ${isLowStock ? "text-red-400" : "text-green-400"}`}
            >
              {item.currentStock}
            </span>
            {isLowStock && (
              <AlertTriangle className="w-4 h-4 text-red-400 ml-2" />
            )}
          </div>
        );
      },
    },
    {
      key: "unit",
      header: "Unit",
      render: (item: FinishedGoodsItem) => (
        <span className="text-gray-300 font-medium">{item.unit}</span>
      ),
    },
    {
      key: "lastProducedDate",
      header: "Last Produced",
      render: (item: FinishedGoodsItem) => (
        <span className="text-gray-300 font-medium">
          {item.lastProducedDate
            ? new Date(item.lastProducedDate).toLocaleDateString()
            : "Never"}
        </span>
      ),
    },
  ];

  return (
    <ProtectedRoute allowedRoles={["Admin", "Staff", "Viewer"]}>
      <AppLayout>
        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="relative floating-particles">
              <h1 className="text-4xl font-bold gradient-text mb-2 animate-fade-in">
                Finished Goods
              </h1>
              <p
                className="text-gray-400 font-medium animate-fade-in"
                style={{ animationDelay: "0.1s" }}
              >
                Track your completed products and inventory levels
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <PremiumButton
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Product
              </PremiumButton>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border-2 border-gray-600 rounded-xl text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
            <div
              className="colorful-card p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-fade-in animate-glow"
              style={{ animationDelay: "0.1s" }}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                  Total Products
                </h3>
                <Package className="w-6 h-6 text-primary animate-pulse" />
              </div>
              <p className="text-3xl md:text-4xl font-bold cyberpunk-text-secondary animate-count-up">
                {items.length}
              </p>
              <p className="text-xs text-gray-400 mt-2">Active products</p>
            </div>

            <div
              className="colorful-card p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-fade-in"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-red-400 uppercase tracking-wider">
                  Low Stock Items
                </h3>
                <TrendingDown className="w-6 h-6 text-red-400 animate-bounce" />
              </div>
              <p className="text-3xl md:text-4xl font-bold text-red-400 animate-count-up">
                {items.filter((item) => item.currentStock <= 5).length}
              </p>
              <p className="text-xs text-red-300 mt-2">Need attention</p>
            </div>

            <div
              className="colorful-card p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-fade-in"
              style={{ animationDelay: "0.3s" }}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-green-400 uppercase tracking-wider">
                  Total Stock
                </h3>
                <TrendingUp className="w-6 h-6 text-green-400 animate-pulse" />
              </div>
              <p className="text-3xl md:text-4xl font-bold cyberpunk-text-primary animate-count-up">
                {items.reduce((sum, item) => sum + item.currentStock, 0)}
              </p>
              <p className="text-xs text-green-300 mt-2">Units in stock</p>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <TableSkeleton />
          ) : (
            <div className="colorful-card">
              <PremiumTable
                data={paginatedItems}
                columns={columns}
                keyExtractor={(item) => item._id}
                enablePagination={true}
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={setItemsPerPage}
                showItemsPerPage={true}
                emptyMessage="No finished goods found. Add your first product to get started."
              />
            </div>
          )}

          {/* Add Product Modal */}
          <PremiumModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            title="Add New Product"
            size="lg"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {submitError && (
                <div className="bg-red-900/20 border border-red-800 text-red-300 px-4 py-3 rounded-lg animate-fade-in">
                  {submitError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <PremiumInput
                  label="Product Name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  placeholder="e.g., Chocolate Cake"
                />

                <PremiumSelect
                  label="Recipe"
                  value={formData.recipe}
                  onChange={(value) =>
                    setFormData({ ...formData, recipe: String(value) })
                  }
                  options={recipes}
                  required
                  placeholder="Select a recipe"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <PremiumSelect
                  label="Unit"
                  value={formData.unit}
                  onChange={(value) =>
                    setFormData({ ...formData, unit: String(value) })
                  }
                  options={[
                    { value: "Piece", label: "Piece" },
                    { value: "Kg", label: "Kilogram" },
                    { value: "Liter", label: "Liter" },
                    { value: "Box", label: "Box" },
                    { value: "Pack", label: "Pack" },
                  ]}
                  required
                />

                <PremiumInput
                  label="Initial Stock"
                  type="number"
                  value={formData.currentStock}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      currentStock: parseInt(e.target.value) || 0,
                    })
                  }
                  min="0"
                  placeholder="0"
                />
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <PremiumButton
                  type="button"
                  variant="outline"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </PremiumButton>
                <PremiumButton type="submit">Create Product</PremiumButton>
              </div>
            </form>
          </PremiumModal>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
