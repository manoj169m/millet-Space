"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { Product } from "@/types/types";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/cart-context";
import { useUser } from "@clerk/nextjs";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const { addToCart } = useCart(); // Destructure the addToCart function
  const {  isSignedIn } = useUser(); // Use isSignedIn to check user status

  const discountedPrice = product.offer
    ? product.price - (product.price * product.offer) / 100
    : product.price;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();

    // Check if the user is signed in
    if (!isSignedIn) {
      alert('Please sign in to add products to your cart!');
      return; // Prevent the function from proceeding if not signed in
    }

    // Add the product to the cart
    addToCart({
      id: product.id,
      name: product.name,
      price: discountedPrice,
      image: product.image,
    });

    // Show a success toast message
    alert("Added to cart successfully");
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    toast.success("Proceeding to checkout");
  };

  const handleCardClick = () => {
    router.push(`/products/${product.id}`);
  };

  return (
    <Card
      className="overflow-hidden hover:shadow-lg cursor-pointer group w-80 h-80 flex flex-col"
      onClick={handleCardClick}
    >
      <div className="relative w-full h-2/3 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform group-hover:scale-105 duration-300"
        />
        {product.offer && (
          <Badge className="absolute right-2 top-2 bg-red-500 hover:bg-red-600">
            {product.offer}% OFF
          </Badge>
        )}
      </div>

      <CardContent className="p-4 flex flex-col justify-between h-1/3">
        <h3 className="font-medium text-base break-words">{product.name}</h3>

        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-1">
            <span className="font-bold text-lg">₹{discountedPrice.toFixed(2)}</span>
            {product.offer && (
              <span className="text-xs text-muted-foreground line-through">
                ₹{product.price.toFixed(2)}
              </span>
            )}
          </div>
          <span className="text-xs text-muted-foreground">{product.quantity}</span>
        </div>

        <div className="flex gap-3 mt-2">
          
          <Button className="flex-1 p-0 h-8 text-sm" onClick={handleAddToCart}>
            <ShoppingCart className="mr-1 h-4 w-4" />
            Cart
          </Button>
          <Button className="flex-1 p-0 h-8 text-sm bg-white text-black" variant="secondary" onClick={handleBuyNow}>
            <CreditCard className="mr-1 h-4 w-4" />
            Buy
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
