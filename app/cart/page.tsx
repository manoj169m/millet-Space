"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2, ShoppingBag, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/context/cart-context";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";


export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, totalPrice } = useCart();
  const { isSignedIn } = useUser();

  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCheckout = () => {
    if (!isSignedIn) {
      toast.error('please sign in to see cart')
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
      <div className="container py-10">
        <div className="mx-auto max-w-2xl space-y-6 text-center">
          <h1 className="text-3xl font-bold">Your Cart</h1>
          <div className="rounded-lg border p-8">
            <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground" />
            <h2 className="mt-4 text-lg font-medium">Your cart is empty</h2>
            <p className="mt-2 text-muted-foreground">
              Please sign in to view your cart
            </p>
            <Button asChild className="mt-4">
              <Link href="/sign-in">Sign In</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="container py-10">
        <div className="mx-auto max-w-2xl space-y-6 text-center">
          <h1 className="text-3xl font-bold">Your Cart</h1>
          <div className="rounded-lg border p-8">
            <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground" />
            <h2 className="mt-4 text-lg font-medium">Your cart is empty</h2>
            <p className="mt-2 text-muted-foreground">
              Add items to your cart to see them here
            </p>
            <Button asChild className="mt-4">
              <Link href="/products">Continue Shopping</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="mx-auto max-w-4xl space-y-8">
        <h1 className="text-3xl font-bold">Your Cart</h1>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="md:col-span-2">
            <div className="rounded-lg border">
              <div className="p-6">
                <h2 className="text-lg font-medium">Items ({cart.length})</h2>
              </div>
              <div className="divide-y">
                {cart.map((item) => (
                  <div key={item.id} className="flex p-6">
                    <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md">
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
                            className="hover:underline"
                          >
                            {item.name}
                          </Link>
                        </h3>
                        <p className="text-sm font-medium">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center">
                          <label htmlFor={`quantity-${item.id}`} className="sr-only">
                            Quantity
                          </label>
                          <Input
                            id={`quantity-${item.id}`}
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              updateQuantity(item.id, parseInt(e.target.value, 10))
                            }
                            className="h-8 w-16"
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.id)}
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
            <div className="rounded-lg border p-6">
              <h2 className="text-lg font-medium">Order Summary</h2>
              <div className="mt-4 space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span>${(totalPrice * 0.1).toFixed(2)}</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>${(totalPrice + totalPrice * 0.1).toFixed(2)}</span>
                  </div>
                </div>
                <Button
                  className="w-full"
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