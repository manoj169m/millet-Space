// components/Footer.js
import { Instagram, Facebook } from 'lucide-react';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-green-700 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Follow Us Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
            <p className="text-sm mb-4">Our site is dedicated to promoting millet-based organic products. Stay connected with us for the latest updates and more!</p>
            <div className="flex space-x-4">
              <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-300">
                <Instagram className="w-6 h-6" />
              </a>
              <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-300">
                <Facebook className="w-6 h-6" />
              </a>
            </div>
          </div>

          {/* Quick Links Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <p className="text-sm mb-4">Explore our organic millet products and learn more about the benefits of millet in your daily diet!</p>
            <ul>
              <li><Link href="/" className="hover:text-gray-300">Home</Link></li>
              <li><Link href="/products" className="hover:text-gray-300">Products</Link></li>
              <li><Link href="/orders" className="hover:text-gray-300">Orders</Link></li>
            </ul>
          </div>
        </div>

        <div className="flex justify-between items-center mt-8 border-t border-gray-600 pt-4">
          {/* Copyright Section */}
          <div>
            <p>&copy; 2025 Server, All Rights Reserved</p>
          </div>
          {/* Developed By Section */}
          <div className="text-right">
            <p>Developed by <a href="https://freelance-portfolio-lime.vercel.app/" className="hover:text-gray-300">Just a Common Man</a></p>
          </div>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
