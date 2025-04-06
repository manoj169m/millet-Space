"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Product } from "@/types/types";
import MilletSpaceLoader from "@/app/MilletSpaceLoader";
import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Choose from "./Choose";
import Image from "next/image";

const categories = [
  {
    name: "Herbal Power Mix",
    image: "/millet-1.webp"
  },
  {
    name: "Rice Variety",
    image: "/rice.webp"
  },
  {
    name: "Millet Flour Variety",
    image: "/flour.webp"
  },
  {
    name: "Idli Podi Variety",
    image: "/idly.webp"
  },
  {
    name: "Beauty and Care",
    image: "/beauty.webp"
  },
  {
    name: "Salt Items",
    image: "/salt.webp"
  },
  {
    name: "Candies and Sweets",
    image: "/candy.webp"
  },
  {
    name: "Millets",
    image: "/millet-1.webp"
  }
];

function Millet() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();  // Initialize Next.js router

  // Fetch products from the database
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase.from("products").select("*");

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
  }, []);

  const handleProductClick = (productId: string) => {
    // Navigate to the product details page
    router.push(`/products/${productId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <MilletSpaceLoader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50">
      {/* Hero Section */}
      <div className="relative bg-secondary-light h-96 group">
        <img
          src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1920"
          alt="Fresh produce"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Organic Millets & Groceries
            </h2>
            <p className="text-xl text-white mb-8">
              Delivered right to your doorstep
            </p>
          </div>
        </div>
      </div>

      {/* Categories */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-green-700 mb-8">Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <div
              key={category.name}
              className="bg-white rounded-lg relative shadow-md  hover:shadow-lg transition duration-300 cursor-pointer group"
            >
              <div className="w-full h-64 relative">
                <Image
                  width={500}
                  height={300}
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover rounded-lg transition-transform duration-300 transform group-hover:scale-105"
                />
              </div>
              <div className="flex items-center justify-between absolute top-15 left-4 right-4">
                <span className="text-lg sm:text-xl md:text-2xl  text-white">{category.name}</span>
                <ChevronRight className="h-5 w-5 text-green-700 transition-transform duration-300 transform group-hover:scale-110" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <Choose />

      {/* Featured Products */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex justify-between">
          <h2 className="text-3xl font-bold text-green-700 mb-8">Featured Products</h2>

          <Link
            href='/products'
            className="text-green-950 font-bold underline italic transition-all duration-300 transform hover:scale-105 hover:text-green-700"
          >
            View All Products
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.slice(0, 5).map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300 cursor-pointer"
              onClick={() => handleProductClick(product.id)}
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-lg font-semibold text-secondary-dark mb-2">{product.name}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-primary">₹{product.price}</span>
                  <button className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-full text-sm transition duration-300">
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer Section */}
      <section className="py-12 bg-green-700 text-white text-center">
        <p>&copy; 2025 Millet Store. All rights reserved.</p>
      </section>
    </div>
  );
}

export default Millet;
