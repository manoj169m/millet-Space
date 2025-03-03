"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/types/types";
import { Comment } from "@/types/types";
import { useUser } from "@clerk/nextjs";
import Image from 'next/image';

interface ProductDetailsProps {
  product: Product;
}

export default function ProductDetails({ product }: ProductDetailsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [rating, setRating] = useState(5);
  const { user, isLoaded } = useUser();

  const discountedPrice = product.offer
    ? product.price - (product.price * product.offer) / 100
    : product.price;

  // Fixed: useEffect is now declared before any conditional returns
  useEffect(() => {
    if (!isLoaded) return; // This is fine as it's inside the effect

    const fetchComments = async () => {
      try {
        const { data, error } = await supabase
          .from("comments")
          .select("*")
          .eq("product_id", product.id)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching comments:", error);
          toast.error("Failed to fetch comments");
        } else {
          setComments(data || []);
        }
      } catch (e) {
        console.error("Exception fetching comments:", e);
        toast.error("An unexpected error occurred");
      }
    };

    fetchComments();
  }, [product.id, isLoaded]);

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      toast.error("Comments cannot be empty");
      return;
    }

    if (!user || !user.id) {
      toast.error("You must be logged in to post a comment.");
      return;
    }

    try {
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("clerk_user_id", user.id)
        .single();

      if (userError) {
        console.error("Error fetching user ID:", userError);
        toast.error("Failed to fetch user ID");
        return;
      }

      const userId = userData.id;

      const { data, error } = await supabase
        .from("comments")
        .insert([
          {
            user_id: userId,
            product_id: product.id,
            content: newComment,
            rating: rating,
          },
        ])
        .select();

      if (error) throw error;

      setComments((prev) => [data[0], ...prev]);
      setNewComment("");
      setRating(5); // Reset rating to default after submission
      toast.success("Comment added successfully");
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
    }
  };

  const handleAddToCart = () => {
    toast.success("Product added to cart");
  };

  const handleBuyNow = () => {
    toast.success("Proceeding to Checkout");
  };

  // Render loading state if user data is not yet loaded
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading product details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
      {/* Product Image */}
      <div className="overflow-hidden rounded-lg bg-gray-100">
        <Image
          src={product.image}
          alt={product.name}
          width={500}
          height={500}
          className="h-full w-full object-cover"
          priority // Add priority for LCP improvement
        />
      </div>

      {/* Product Details */}
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">₹{discountedPrice.toFixed(2)}</span>
            {product.offer && (
              <span className="text-lg text-muted-foreground line-through">
                ₹{product.price.toFixed(2)}
              </span>
            )}
            {product.offer && (
              <span className="rounded-md bg-red-100 px-2 py-1 text-xs font-medium text-red-800 dark:bg-red-900/30 dark:text-red-400">
                {product.offer}% OFF
              </span>
            )}
          </div>
        </div>

        <p className="text-muted-foreground">{product.description}</p>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-medium">Availability:</span>
            <span
              className={`${
                product.stock > 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {product.stock > 0
                ? `In Stock (${product.stock} available)`
                : "Out of Stock"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium">Category:</span>
            <span>{product.category}</span>
          </div>
        </div>

        {/* Add to Cart and Buy Now Buttons */}
        <div className="flex gap-4">
          <Button
            className="flex-1"
            disabled={product.stock === 0}
            onClick={handleAddToCart}
            aria-label="Add to Cart"
          >
            Add to Cart
          </Button>
          <Button
            className="flex-1"
            disabled={product.stock === 0}
            onClick={handleBuyNow}
            aria-label="Buy Now"
          >
            Buy Now
          </Button>
        </div>

        {/* Comments Section */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">Customer Reviews</h3>
          <div className="space-y-4">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.id} className="border p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{comment.content}</p>
                    <Badge variant="outline">{comment.rating}/5</Badge>
                  </div>
                  <p className="text-sm text-gray-500">
                    Posted on {new Date(comment.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 italic">No reviews yet. Be the first to add one!</p>
            )}
          </div>

          {/* Add Comment Form */}
          <div className="mt-6">
            <Label htmlFor="comment">Add a Review</Label>
            <Textarea
              id="comment"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts about this product..."
              rows={3}
              className="mt-2"
            />
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center space-x-2">
                <Label htmlFor="rating">Rating</Label>
                <Input
                  id="rating"
                  type="number"
                  min="1"
                  max="5"
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="w-16"
                />
                <span className="text-sm text-muted-foreground">(1-5)</span>
              </div>
              <Button 
                onClick={handleAddComment}
                disabled={!user}
                aria-label="Post Comment"
              >
                Post Review
              </Button>
            </div>
            {!user && (
              <p className="text-sm text-red-500 mt-2">
                You must be logged in to post a review.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}