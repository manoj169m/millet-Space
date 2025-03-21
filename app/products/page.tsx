"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import ProductCard from "@/components/products/ProductCard";
import { Product } from "@/types/types";
import MilletSpaceLoader from "../MilletSpaceLoader";
import { Button } from "@/components/ui/button";
import { Tag, X } from "lucide-react";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Fetch categories from the database
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("category");

        if (error) {
          throw error;
        }

        // Extract unique categories
        const uniqueCategories = Array.from(
          new Set(data?.map(item => item.category))
        );
        setCategories(uniqueCategories as string[]);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  // Fetch products from the database
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        let query = supabase.from("products").select("*");

        // Apply category filter if selected
        if (selectedCategory) {
          query = query.eq("category", selectedCategory);
        }

        const { data, error } = await query;

        if (error) {
          throw error;
        }

        setProducts(data || []);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory]);

  // Handle category selection
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(selectedCategory === category ? null : category);
  };

  // Clear category filter
  const clearCategoryFilter = () => {
    setSelectedCategory(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <MilletSpaceLoader />
      </div>
    );
  }

  return (
    <div className="p-4 bg-green-50 h-auto">
      {/* Category filter */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-green-700 mb-3">Filter by Category</h2>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              className="rounded-full "
              onClick={() => handleCategorySelect(category)}
            >
              <Tag className="h-4 w-4 mr-1" />
              {category}
            </Button>
          ))}
          {selectedCategory && (
            <Button
              variant="outline"
              size="sm"
              className="text-red-500 hover:text-red-700 rounded-full"
              onClick={clearCategoryFilter}
            >
              <X className="h-4 w-4 mr-1" />
              Clear filter
            </Button>
          )}
        </div>
      </div>

      {/* Products display */}
      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-lg text-gray-600 mb-4">No products found</p>
          {selectedCategory && (
            <Button variant="outline" onClick={clearCategoryFilter}>
              Clear filter to see all products
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}