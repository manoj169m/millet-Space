"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/types/types";
import { Comment } from "@/types/types";
import { useUser } from "@clerk/nextjs";
import { useCart } from "@/context/cart-context";
import { Star, ShoppingCart, ChevronDown, ChevronUp } from "lucide-react";

interface ProductDetailsProps {
  product: Product;
}



export default function ProductDetails({ product }: ProductDetailsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [rating, setRating] = useState(5);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [addingReview, setAddingReview] = useState(false);
  const { user, isLoaded, isSignedIn } = useUser();
  const { addToCart } = useCart();

  const discountedPrice = product.offer
    ? product.price - (product.price * product.offer) / 100
    : product.price;

  useEffect(() => {
    if (!isLoaded) return;

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
      setRating(5);
      setAddingReview(false);
      toast.success("Review added successfully");
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add review");
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isSignedIn) {
     alert("Please sign in to add products to your cart!");
      return;
    }

    addToCart({
      id: product.id,
      name: product.name,
      price: discountedPrice,
      image: product.image,
    });

    toast.success("Added to cart successfully");
  };

  // const handleBuyNow = () => {
  //   if (!isSignedIn) {
  //     toast.error("Please sign in to proceed to checkout!");
  //     return;
  //   }
    
  //   addToCart({
  //     id: product.id,
  //     name: product.name,
  //     price: discountedPrice,
  //     image: product.image,
      
  //   });
    
  //   toast.success("Proceeding to Checkout");
  //   // Add navigation to checkout page here
  // };

  // Calculate average rating
  const averageRating = comments.length 
    ? comments.reduce((sum, comment) => sum + comment.rating, 0) / comments.length 
    : 0;

  // Display only first 3 comments initially
  const displayedComments = showAllReviews ? comments : comments.slice(0, 3);

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

  // Helper function to render stars
  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 gap-12 md:grid-cols-2 bg-slate-200 rounded-xl shadow-sm overflow-hidden">
        {/* Product Image */}
        <div className="overflow-hidden bg-slate-200  flex items-center justify-center p-4">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-contain max-h-[500px] rounded-lg transition-transform hover:scale-105"
          />
        </div>

        {/* Product Details */}
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
              {product.offer && (
                <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-800 dark:bg-red-900/30 dark:text-red-400">
                  {product.offer}% OFF
                </span>
              )}
            </div>
            
            {/* Rating summary */}
            <div className="flex items-center gap-2 mt-2">
              {renderStars(Math.round(averageRating))}
              <span className="text-sm text-gray-500">
                {comments.length > 0 
                  ? `${averageRating.toFixed(1)} (${comments.length} reviews)` 
                  : "No reviews yet"}
              </span>
            </div>

            <div className="flex items-baseline gap-2 mt-4">
              <span className="text-3xl font-bold text-gray-900">₹{discountedPrice.toFixed(2)}</span>
              {product.offer && (
                <span className="text-lg text-gray-500 line-through">
                  ₹{product.price.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          <div className="border-t border-b py-6">
            <p className="text-gray-700 leading-relaxed">{product.description}</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-700">Availability:</span>
              <Badge
  variant={product.stock > 0 ? "secondary" : "destructive"}
  className={product.stock > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
>
  {product.stock > 0 ? `In Stock (${product.stock} available)` : "Out of Stock"}
</Badge>

            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-700">Category:</span>
              <Badge variant="outline" className="bg-gray-100">{product.category}</Badge>
            </div>
          </div>

          {/* Add to Cart and Buy Now Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              className="flex-1 gap-2 py-6 bg-gray-800 hover:bg-gray-700 text-white"
              disabled={product.stock === 0}
              onClick={handleAddToCart}
              aria-label="Add to Cart"
            >
              <ShoppingCart size={18} />
              Add to Cart
            </Button>
            {/* <Button
              className="flex-1 gap-2 py-6 bg-white hover:bg-slate-50"
              disabled={product.stock === 0}
              onClick={handleBuyNow}
              aria-label="Buy Now"
            >
              <CreditCard size={18} />
              Buy Now
            </Button> */}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-12 bg-slate-200 rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Customer Reviews</h3>
          <Button 
            variant="outline" 
            onClick={() => setAddingReview(!addingReview)}
            className="gap-2"
          >
            {addingReview ? "Cancel" : "Write a Review"}
          </Button>
        </div>

        {/* Add Review Form */}
        {addingReview && (
          <div className="mb-8 bg-slate-200 p-6 rounded-lg">
            <Label htmlFor="comment" className="text-lg font-medium">Your Review</Label>
            <div className="flex items-center gap-2 my-3">
              <Label htmlFor="rating" className="font-medium">Rating:</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none"
                  >
                    <Star
                      size={24}
                      className={star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                    />
                  </button>
                ))}
              </div>
            </div>
            
            <Textarea
              id="comment"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts about this product..."
              rows={4}
              className="mt-2 resize-none"
            />
            
            <div className="flex justify-end mt-4">
              <Button 
                onClick={handleAddComment}
                disabled={!user || !newComment.trim()}
                className="gap-2"
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
        )}

        {/* Reviews List */}
        <div className="space-y-4">
          {comments.length > 0 ? (
            <>
              {displayedComments.map((comment) => (
                <div key={comment.id} className="border p-5 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-sm font-bold text-gray-600">
                            {comment.user_id.toString().charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">User {comment.user_id}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(comment.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="ml-10">
                        {renderStars(comment.rating)}
                        <p className="mt-2 text-gray-700">{comment.content}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {comments.length > 3 && (
                <Button
                  variant="ghost"
                  className="w-full mt-4 gap-2 text-gray-600 hover:text-gray-900"
                  onClick={() => setShowAllReviews(!showAllReviews)}
                >
                  {showAllReviews ? (
                    <>Show Less <ChevronUp size={16} /></>
                  ) : (
                    <>See All Reviews ({comments.length}) <ChevronDown size={16} /></>
                  )}
                </Button>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 italic mb-4">No reviews yet. Be the first to add one!</p>
              {!addingReview && (
                <Button 
                  variant="outline" 
                  onClick={() => setAddingReview(true)}
                  disabled={!user}
                >
                  Write a Review
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}