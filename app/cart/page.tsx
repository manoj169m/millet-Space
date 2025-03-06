"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2, ShoppingBag, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/context/cart-context";
import { useUser } from "@clerk/nextjs";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, totalPrice } = useCart();
  const { isSignedIn } = useUser();

  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCheckout = () => {
    if (!isSignedIn) {
      alert('Please sign in to see cart');
      return;
    }

    setIsProcessing(true);
    
    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false);
      router.push("/checkout");
    }, 1000);
  };

  if (!isSignedIn) {
    return (
      <div className="container py-10 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="mx-auto max-w-2xl space-y-6 text-center">
          <h1 className="text-3xl font-bold text-indigo-800">Your Cart</h1>
          <div className="rounded-lg border border-indigo-100 p-8 bg-white shadow-md">
            <ShoppingBag className="mx-auto h-12 w-12 text-indigo-400" />
            <h2 className="mt-4 text-lg font-medium text-indigo-700">Your cart is empty</h2>
            <p className="mt-2 text-gray-600">
              Please sign in to view your cart
            </p>
            <Button asChild className="mt-4 bg-indigo-600 hover:bg-indigo-700">
              <Link href="/sign-in">Sign In</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="container py-10 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="mx-auto max-w-2xl space-y-6 text-center">
          <h1 className="text-3xl font-bold text-indigo-800">Your Cart</h1>
          <div className="rounded-lg border border-indigo-100 p-8 bg-white shadow-md">
            <ShoppingBag className="mx-auto h-12 w-12 text-indigo-400" />
            <h2 className="mt-4 text-lg font-medium text-indigo-700">Your cart is empty</h2>
            <p className="mt-2 text-gray-600">
              Add items to your cart to see them here
            </p>
            <Button asChild className="mt-4 bg-indigo-600 hover:bg-indigo-700">
              <Link href="/products">Continue Shopping</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10 bg-gradient-to-r from-blue-50 to-indigo-50 min-h-screen">
      <div className="mx-auto max-w-4xl space-y-8 bg-white rounded-lg p-6 shadow-lg">
        <h1 className="text-3xl font-bold text-indigo-800">Your Cart</h1>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="md:col-span-2">
            <div className="rounded-lg border border-indigo-100">
              <div className="p-6 bg-indigo-50 rounded-t-lg">
                <h2 className="text-lg font-medium text-indigo-800">Items ({cart.length})</h2>
              </div>
              <div className="divide-y divide-indigo-100">
                {cart.map((item) => (
                  <div key={item.id} className="flex p-6 hover:bg-blue-50 transition-colors duration-200">
                    <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-indigo-100">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="ml-4 flex flex-1 flex-col">
                      <div className="flex justify-between">
                        <h3 className="text-sm font-medium">
                          <Link
                            href={`/products/${item.id}`}
                            className="text-indigo-700 hover:text-indigo-900 hover:underline"
                          >
                            {item.name}
                          </Link>
                        </h3>
                        <p className="text-sm font-medium text-indigo-800">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center">
                          <label htmlFor={`quantity-${item.id}`} className="sr-only">
                            Quantity
                          </label>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="h-8 w-8 border-indigo-200 text-indigo-700 hover:bg-indigo-100"
                            >
                              -
                            </Button>
                            <Input
                              id={`quantity-${item.id}`}
                              type="number"
                              min="1"
                              value={item.quantity}
                              readOnly
                              className="h-8 w-16 text-center border-indigo-200"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="h-8 w-8 border-indigo-200 text-indigo-700 hover:bg-indigo-100"
                            >
                              +
                            </Button>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Remove item</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="rounded-lg border border-indigo-100 p-6 bg-indigo-50 shadow-md">
              <h2 className="text-lg font-medium text-indigo-800">Order Summary</h2>
              <div className="mt-4 space-y-4">
                <div className="flex justify-between">
                  <span className="text-indigo-600">Subtotal</span>
                  <span className="font-medium">₹{totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-indigo-600">Shipping</span>
                  <span className="font-medium text-green-600">Free</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-indigo-600">Tax</span>
                  <span className="font-medium">₹{(totalPrice * 0.1).toFixed(2)}</span>
                </div>
                <div className="border-t border-indigo-200 pt-4">
                  <div className="flex justify-between font-medium">
                    <span className="text-lg text-indigo-800">Total</span>
                    <span className="text-lg text-indigo-800">₹{(totalPrice + totalPrice * 0.1).toFixed(2)}</span>
                  </div>
                </div>
                <Button
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md transition-all duration-300 transform hover:scale-105" 
                  onClick={handleCheckout}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    "Processing..."
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Checkout
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}