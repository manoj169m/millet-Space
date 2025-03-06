"use client";

import { useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import ProductDetails from "@/components/products/ProductDetails";
import { Product } from "@/types/types";
import { Skeleton } from "@/components/ui/skeleton";
import MilletSpaceLoader from "@/app/MilletSpaceLoader";

export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);

        if (!id) {
          return notFound();
        }

        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("id", id)
          .single();

        if (error) {
          console.error("Error fetching product:", error);
          return notFound();
        }

        if (!data) {
          return notFound();
        }

        setProduct(data as Product);
      } catch (error) {
        console.error("Failed to fetch product:", error);
        return notFound();
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return <MilletSpaceLoader />;
  }

  if (!product) {
    return notFound();
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <ProductDetails product={product} />
    </div>
  );
}

// Loading skeleton for the product details page
// function ProductSkeleton() {
//   return (
//     <div className="container mx-auto py-8 px-4">
//       <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
//         {/* Image skeleton */}
//         <Skeleton className="h-96 w-full rounded-lg" />
        
//         {/* Content skeleton */}
//         <div className="space-y-6">
//           <div className="space-y-2">
//             <Skeleton className="h-10 w-3/4" />
//             <Skeleton className="h-8 w-1/3" />
//           </div>
          
//           <Skeleton className="h-24 w-full" />
          
//           <div className="space-y-4">
//             <Skeleton className="h-6 w-full" />
//             <Skeleton className="h-6 w-full" />
//           </div>
          
//           <div className="space-y-4">
//             <Skeleton className="h-10 w-full" />
//             <Skeleton className="h-10 w-full" />
//           </div>
          
//           <div className="mt-6">
//             <Skeleton className="h-8 w-1/4 mb-4" />
//             <div className="space-y-4">
//               <Skeleton className="h-24 w-full rounded-lg" />
//               <Skeleton className="h-24 w-full rounded-lg" />
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
