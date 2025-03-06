"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useCart } from "@/context/cart-context";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Truck, CreditCard, ShoppingBag } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { Address } from "@/types/types";


export default function CheckoutPage() {
  const { isSignedIn, user } = useUser();
  const { cart, totalPrice, clearCart } = useCart();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<"shipping" | "payment" | "confirmation">("shipping");
  const [shippingAddress, setShippingAddress] = useState({
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "United States",
  });
  const [paymentMethod, setPaymentMethod] = useState<"card" | "paypal">("card");
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
  });
  const [address, setAddress] = useState<Address | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAddress = async () => {
      if (!user) return;

      try {
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("id")
          .eq("clerk_user_id", user.id)
          .single();

        if (userError) {
          throw new Error(userError.message);
        }

        const userId = userData.id;

        const { data: addressData, error: addressError } = await supabase
          .from("addresses")
          .select("*")
          .eq("user_id", userId)
          .limit(1)
          .single();

        if (addressError) {
          throw new Error(addressError.message);
        }

        setAddress(addressData || null);
      } catch (error) {
        console.error("Error fetching address:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAddress();
  }, [user]);

  if (!isSignedIn) {
    router.push("/sign-in");
    return null;
  }

  if (cart.length === 0) {
    router.push("/cart");
    return null;
  }

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("payment");
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
  
    try {
      // Fetch user data based on the clerk_user_id
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("clerk_user_id", user?.id)
        .single();
  
      if (userError || !userData) throw userError || new Error("User not found");
  
      const userId = userData.id;
  
      // If address is not set, create a new one
      if (!address) {
        const { data: newAddressData, error: addressError } = await supabase
          .from("addresses")
          .insert({
            user_id: userId,
            street: shippingAddress.street,
            city: shippingAddress.city,
            state: shippingAddress.state,
            postal_code: shippingAddress.postalCode,
            country: shippingAddress.country,
            is_default: true,
          })
          .select();
  
        if (addressError) throw addressError;
  
        // Set the new address in state
        setAddress(newAddressData[0]);
      }
  
      // Ensure that address is not null before inserting the order
      if (!address) {
        throw new Error("Address is required.");
      }
  
      // Insert the order
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: userId,
          total_amount: totalPrice + totalPrice * 0.1,
          status: "pending",
          address_id: address.id, // Ensure address is not null
        })
        .select();
  
      if (orderError) throw orderError;
  
      // Map through cart items and create order items
      const orderItems = cart.map((item) => ({
        order_id: orderData[0].id,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
      }));
  
      // Insert the order items into the database
      const { error: orderItemsError } = await supabase
        .from("order_items")
        .insert(orderItems);
  
      if (orderItemsError) throw orderItemsError;
  
      // Wait for 2 seconds before proceeding
      await new Promise((resolve) => setTimeout(resolve, 2000));
  
      // Clear the cart and move to the next step
      clearCart();
      setStep("confirmation");
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error('An error occurred, please try again');
    } finally {
      setIsProcessing(false);
    }
  };
  

  // Progress indicator based on current step
  const getStepProgress = () => {
    switch (step) {
      case "shipping": return 33;
      case "payment": return 66;
      case "confirmation": return 100;
      default: return 0;
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="container py-10">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Secure Checkout</h1>
            <div className="mt-6 relative">
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-slate-200">
                <div 
                  style={{ width: `${getStepProgress()}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                ></div>
              </div>
              <div className="flex justify-between">
                <div className={`flex flex-col items-center ${step === "shipping" ? "text-indigo-600 font-medium" : "text-slate-500"}`}>
                  <div className={`w-8 h-8 flex items-center justify-center rounded-full mb-1 ${step === "shipping" ? "bg-indigo-100 text-indigo-600" : "bg-slate-200"}`}>
                    <Truck size={16} />
                  </div>
                  <span className="text-xs">Shipping</span>
                </div>
                <div className={`flex flex-col items-center ${step === "payment" ? "text-indigo-600 font-medium" : "text-slate-500"}`}>
                  <div className={`w-8 h-8 flex items-center justify-center rounded-full mb-1 ${step === "payment" ? "bg-indigo-100 text-indigo-600" : "bg-slate-200"}`}>
                    <CreditCard size={16} />
                  </div>
                  <span className="text-xs">Payment</span>
                </div>
                <div className={`flex flex-col items-center ${step === "confirmation" ? "text-indigo-600 font-medium" : "text-slate-500"}`}>
                  <div className={`w-8 h-8 flex items-center justify-center rounded-full mb-1 ${step === "confirmation" ? "bg-indigo-100 text-indigo-600" : "bg-slate-200"}`}>
                    <CheckCircle size={16} />
                  </div>
                  <span className="text-xs">Confirmation</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className={`md:col-span-2 space-y-6 ${step === "confirmation" ? "md:col-span-3" : ""}`}>
              {step === "shipping" && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 transition-all">
                  <div className="flex items-center mb-4">
                    <Truck className="h-5 w-5 text-indigo-600 mr-2" />
                    <h2 className="text-xl font-medium">Shipping Information</h2>
                  </div>
                  {loading ? (
                    <div className="flex justify-center items-center h-40">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                    </div>
                  ) : address ? (
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <h3 className="font-medium text-indigo-600 mb-2">Saved Address</h3>
                      <p className="text-slate-700">{address.street}</p>
                      <p className="text-slate-700">{address.city}, {address.state} {address.postal_code}</p>
                      <p className="text-slate-700">{address.country}</p>
                      <Button 
                        onClick={() => setStep("payment")} 
                        className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white"
                      >
                        Use This Address
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleShippingSubmit} className="mt-4 space-y-4">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="street" className="text-slate-700">Street Address</Label>
                          <Input
                            id="street"
                            value={shippingAddress.street}
                            onChange={(e) =>
                              setShippingAddress({
                                ...shippingAddress,
                                street: e.target.value,
                              })
                            }
                            className="border-slate-200 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="city" className="text-slate-700">City</Label>
                          <Input
                            id="city"
                            value={shippingAddress.city}
                            onChange={(e) =>
                              setShippingAddress({
                                ...shippingAddress,
                                city: e.target.value,
                              })
                            }
                            className="border-slate-200 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="state" className="text-slate-700">State/Province</Label>
                          <Input
                            id="state"
                            value={shippingAddress.state}
                            onChange={(e) =>
                              setShippingAddress({
                                ...shippingAddress,
                                state: e.target.value,
                              })
                            }
                            className="border-slate-200 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="postalCode" className="text-slate-700">Postal Code</Label>
                          <Input
                            id="postalCode"
                            value={shippingAddress.postalCode}
                            onChange={(e) =>
                              setShippingAddress({
                                ...shippingAddress,
                                postalCode: e.target.value,
                              })
                            }
                            className="border-slate-200 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                            required
                          />
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                          <Label htmlFor="country" className="text-slate-700">Country</Label>
                          <Input
                            id="country"
                            value={shippingAddress.country}
                            onChange={(e) =>
                              setShippingAddress({
                                ...shippingAddress,
                                country: e.target.value,
                              })
                            }
                            className="border-slate-200 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                            required
                          />
                        </div>
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                      >
                        Continue to Payment
                      </Button>
                    </form>
                  )}
                </div>
              )}

              {step === "payment" && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 transition-all">
                  <div className="flex items-center mb-4">
                    <CreditCard className="h-5 w-5 text-indigo-600 mr-2" />
                    <h2 className="text-xl font-medium">Payment Method</h2>
                  </div>
                  <form onSubmit={handlePaymentSubmit} className="mt-4 space-y-6">
                    <Tabs
                      defaultValue="card"
                      value={paymentMethod}
                      onValueChange={(value) => setPaymentMethod(value as "card" | "paypal")}
                      className="w-full"
                    >
                      <TabsList className="grid w-full grid-cols-2 bg-slate-100">
                        <TabsTrigger 
                          value="card" 
                          className="data-[state=active]:bg-white data-[state=active]:text-indigo-600"
                        >
                          <CreditCard className="h-4 w-4 mr-2" />
                          Credit Card
                        </TabsTrigger>
                        <TabsTrigger 
                          value="paypal"
                          className="data-[state=active]:bg-white data-[state=active]:text-indigo-600"
                        >
                          <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20.5 7.5H16.5M3.5 7.5H7.5M7.5 7.5C7.5 5.01472 9.51472 3 12 3C14.4853 3 16.5 5.01472 16.5 7.5M7.5 7.5C7.5 9.98528 9.51472 12 12 12C14.4853 12 16.5 9.98528 16.5 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M16.5 16.5H20.5M3.5 16.5H7.5M7.5 16.5C7.5 14.0147 9.51472 12 12 12C14.4853 12 16.5 14.0147 16.5 16.5M7.5 16.5C7.5 18.9853 9.51472 21 12 21C14.4853 21 16.5 18.9853 16.5 16.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          PayPal
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent value="card" className="mt-6 space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="cardNumber" className="text-slate-700">Card Number</Label>
                          <Input
                            id="cardNumber"
                            placeholder="1234 5678 9012 3456"
                            value={cardDetails.cardNumber}
                            onChange={(e) =>
                              setCardDetails({
                                ...cardDetails,
                                cardNumber: e.target.value,
                              })
                            }
                            className="border-slate-200 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cardName" className="text-slate-700">Name on Card</Label>
                          <Input
                            id="cardName"
                            placeholder="John Doe"
                            value={cardDetails.cardName}
                            onChange={(e) =>
                              setCardDetails({
                                ...cardDetails,
                                cardName: e.target.value,
                              })
                            }
                            className="border-slate-200 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="expiryDate" className="text-slate-700">Expiry Date</Label>
                            <Input
                              id="expiryDate"
                              placeholder="MM/YY"
                              value={cardDetails.expiryDate}
                              onChange={(e) =>
                                setCardDetails({
                                  ...cardDetails,
                                  expiryDate: e.target.value,
                                })
                              }
                              className="border-slate-200 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="cvv" className="text-slate-700">CVV</Label>
                            <Input
                              id="cvv"
                              placeholder="123"
                              value={cardDetails.cvv}
                              onChange={(e) =>
                                setCardDetails({
                                  ...cardDetails,
                                  cvv: e.target.value,
                                })
                              }
                              className="border-slate-200 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                              required
                            />
                          </div>
                        </div>
                      </TabsContent>
                      <TabsContent value="paypal" className="mt-6">
                        <div className="rounded-lg bg-slate-50 border border-slate-200 p-6 text-center">
                          <svg className="h-12 w-12 mx-auto mb-3 text-blue-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20.5 7.5H16.5M3.5 7.5H7.5M7.5 7.5C7.5 5.01472 9.51472 3 12 3C14.4853 3 16.5 5.01472 16.5 7.5M7.5 7.5C7.5 9.98528 9.51472 12 12 12C14.4853 12 16.5 9.98528 16.5 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M16.5 16.5H20.5M3.5 16.5H7.5M7.5 16.5C7.5 14.0147 9.51472 12 12 12C14.4853 12 16.5 14.0147 16.5 16.5M7.5 16.5C7.5 18.9853 9.51472 21 12 21C14.4853 21 16.5 18.9853 16.5 16.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <p className="text-slate-600 mb-4">
                            You will be redirected to PayPal to complete your payment securely.
                          </p>
                          <p className="text-xs text-slate-500">
                            PayPal protects your payment information with encryption technology.
                          </p>
                        </div>
                      </TabsContent>
                    </Tabs>
                    <Button 
                      type="submit" 
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-6" 
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center">
                          Complete Order
                          <svg className="ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </span>
                      )}
                    </Button>
                  </form>
                </div>
              )}

              {step === "confirmation" && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center transition-all transform animate-fadeIn">
                  <div className="mb-6 flex justify-center">
                    <div className="rounded-full bg-green-100 p-3">
                      <CheckCircle className="h-16 w-16 text-green-600" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold mb-4">Order Confirmation</h2>
                  <p className="text-slate-600 mb-6">
  Your order has been placed successfully! We&#39;ve sent a confirmation email with all the details.
</p>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button 
                      onClick={() => router.push("/orders")} 
                      className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      View My Orders
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => router.push("/")}
                      className="border-slate-200 text-slate-700 hover:bg-slate-50"
                    >
                      Continue Shopping
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {step !== "confirmation" && (
              <div className="md:col-span-1">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sticky top-6">
                  <div className="flex items-center mb-4">
                    <ShoppingBag className="h-5 w-5 text-indigo-600 mr-2" />
                    <h2 className="text-xl font-medium">Order Summary</h2>
                  </div>
                  <div className="mt-4 space-y-4">
                    <div className="max-h-64 overflow-auto pr-2 -mr-2">
                      {cart.map((item) => (
                        <div key={item.id} className="flex items-center py-3 border-b border-slate-100 last:border-0">
                          <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-slate-200 bg-slate-50">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="ml-4 flex flex-1 flex-col">
                            <div className="flex justify-between">
                              <h3 className="text-sm font-medium text-slate-800">{item.name}</h3>
                              <p className="text-sm font-medium text-slate-800">
                                ${(item.price * item.quantity).toFixed(2)}
                              </p>
                            </div>
                            <p className="text-sm text-slate-500">
                              Qty: {item.quantity}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Separator className="my-4 bg-slate-100" />
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal</span>
                      <span>${totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Shipping</span>
                      <span className="text-green-600">Free</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Tax</span>
                      <span>${(totalPrice * 0.1).toFixed(2)}</span>
                    </div>
                    <Separator className="my-4 bg-slate-100" />
                    <div className="flex justify-between font-medium text-lg">
                      <span>Total</span>
                      <span className="text-indigo-600">${(totalPrice + totalPrice * 0.1).toFixed(2)}</span>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100">
                      <div className="flex items-center mb-2">
                        <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <span className="text-sm text-slate-600">Secure Checkout</span>
                      </div>
                      <div className="flex items-center mb-2">
                        <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <span className="text-sm text-slate-600">Free Shipping</span>
                      </div>
                      <div className="flex items-center">
                        <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <span className="text-sm text-slate-600">Easy Returns</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}