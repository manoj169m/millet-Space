'use client';

import {  ChevronRight } from 'lucide-react';

const categories = [
  "Millets & Grains",
  "Organic Products",
  "Fresh Produce",
  "Dairy & Eggs",
  "Bakery",
  "Pantry",
  "Beverages",
];

const featuredProducts = [
  {
    id: 1,
    name: "Organic Avocados",
    price: 249,
    image: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=600",
    category: "Fresh Produce"
  },
  {
    id: 2,
    name: "Fresh Sourdough Bread",
    price: 399,
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600",
    category: "Bakery"
  },
  {
    id: 3,
    name: "Farm Fresh Eggs",
    price: 499,
    image: "https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&w=600",
    category: "Dairy & Eggs"
  },
  {
    id: 4,
    name: "Organic Honey",
    price: 599,
    image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600",
    category: "Pantry"
  },
  {
    id: 5,
    name: "Pearl Millet (Bajra)",
    price: 249,
    image: "https://images.unsplash.com/photo-1622542086073-89afc46a0c5c?auto=format&fit=crop&w=600",
    category: "Millets & Grains"
  },
  {
    id: 6,
    name: "Organic Quinoa",
    price: 549,
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600",
    category: "Millets & Grains"
  },
  {
    id: 7,
    name: "Brown Rice",
    price: 349,
    image: "https://images.unsplash.com/photo-1595436301907-0b361827c9b6?auto=format&fit=crop&w=600",
    category: "Millets & Grains"
  },
  {
    id: 8,
    name: "Organic Lentils",
    price: 299,
    image: "https://images.unsplash.com/photo-1515543904379-3d757afe72e3?auto=format&fit=crop&w=600",
    category: "Pantry"
  },
  {
    id: 9,
    name: "Mixed Nuts",
    price: 699,
    image: "https://images.unsplash.com/photo-1606923829579-0cb981a83e2e?auto=format&fit=crop&w=600",
    category: "Pantry"
  },
  {
    id: 10,
    name: "Organic Chickpeas",
    price: 199,
    image: "https://images.unsplash.com/photo-1515543904379-b0a0b6fa5791?auto=format&fit=crop&w=600",
    category: "Pantry"
  },
  {
    id: 11,
    name: "Foxtail Millet",
    price: 329,
    image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600",
    category: "Millets & Grains"
  },
  {
    id: 12,
    name: "Organic Green Tea",
    price: 449,
    image: "https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?auto=format&fit=crop&w=600",
    category: "Beverages"
  }
];

function Millet() {

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
     
      {/* Hero Section */}
      <div className="relative bg-secondary-light h-96">
        <img
          src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1920"
          alt="Fresh produce"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Organic Millets & Groceries
            </h2>
            <p className="text-xl text-white mb-8">
              Delivered right to your doorstep
            </p>
            <button className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-8 rounded-full transition duration-300">
              Shop Now
            </button>
          </div>
        </div>
      </div>

      {/* Categories */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-secondary-dark mb-8">Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((category) => (
            <div
              key={category}
              className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition duration-300 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-secondary">{category}</span>
                <ChevronRight className="h-5 w-5 text-primary" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-secondary-dark mb-8">Featured Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <div className="text-xs text-accent-dark font-semibold mb-2">
                  {product.category}
                </div>
                <h3 className="text-lg font-semibold text-secondary-dark mb-2">
                  {product.name}
                </h3>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-primary">
                    ₹{product.price}
                  </span>
                  <button className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-full text-sm transition duration-300">
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      {/* <footer className="bg-secondary-dark text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Millets Space</h3>
              <p className="text-gray-300">
                Your one-stop shop for organic millets and groceries.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-white">About Us</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Contact</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Order Tracker</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Categories</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-white">Millets & Grains</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Organic Products</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Fresh Produce</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Newsletter</h4>
              <p className="text-gray-300 mb-4">
                Subscribe to get updates on new products and special offers.
              </p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 rounded-l-full focus:outline-none text-gray-900"
                />
                <button className="bg-primary hover:bg-primary-dark px-6 py-2 rounded-r-full transition duration-300">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
            <p>&copy; 2024 Millets Space. All rights reserved.</p>
          </div>
        </div>
      </footer> */}
    </div>
  );
}

export default Millet;