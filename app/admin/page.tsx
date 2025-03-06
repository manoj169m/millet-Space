"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductAddComponent from "@/components/admin/admin-product";
import AdminDashboard from "@/components/admin/admin-dashboard";
import AdminOrders from "@/components/admin/admin-orders";
import MilletSpaceLoader from "../MilletSpaceLoader";
import { ShieldCheck, Package, BarChart3, ShoppingCart } from "lucide-react";

export default function AdminPage() {
  const { isSignedIn, user } = useUser();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = () => {
      if (!isSignedIn || !user) {
        setLoading(false);
        return;
      }

      const role = user?.publicMetadata?.role;
      setIsAdmin(role === "admin");
      setLoading(false);
    };

    checkAdminStatus();
  }, [isSignedIn, user]);

  if (loading) {
    return <MilletSpaceLoader />;
  }

  if (!isSignedIn) {
    router.push("/");
    return null;
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-amber-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
          <div className="mb-4 flex justify-center">
            <ShieldCheck className="h-16 w-16 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="mt-4 text-gray-600">
            You do not have permission to access the admin dashboard. This area is restricted to administrators only.
          </p>
          <Button
            className="mt-6 w-full bg-amber-600 hover:bg-amber-700 text-white font-medium"
            onClick={() => router.push("/")}
          >
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex items-center gap-4 border-b border-amber-100 pb-6">
            <div className="p-3 rounded-full bg-amber-100">
              <ShieldCheck className="h-8 w-8 text-amber-700" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
              <p className="text-gray-600">
                Welcome back, {user?.firstName || "Admin"}. Manage your products, orders, and analytics.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <Tabs defaultValue="dashboard" className="w-full">
            <TabsList className="flex justify-start mb-6 border-b border-gray-200 p-0 space-x-1">
              <TabsTrigger
                value="dashboard"
                className="flex items-center gap-2 py-3 px-5 text-base font-medium text-gray-700 hover:text-amber-600 data-[state=active]:text-amber-600 data-[state=active]:border-b-2 data-[state=active]:border-amber-600 transition-all focus:outline-none"
              >
                <BarChart3 className="h-5 w-5" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger
                value="products"
                className="flex items-center gap-2 py-3 px-5 text-base font-medium text-gray-700 hover:text-amber-600 data-[state=active]:text-amber-600 data-[state=active]:border-b-2 data-[state=active]:border-amber-600 transition-all focus:outline-none"
              >
                <Package className="h-5 w-5" />
                Products
              </TabsTrigger>
              <TabsTrigger
                value="orders"
                className="flex items-center gap-2 py-3 px-5 text-base font-medium text-gray-700 hover:text-amber-600 data-[state=active]:text-amber-600 data-[state=active]:border-b-2 data-[state=active]:border-amber-600 transition-all focus:outline-none"
              >
                <ShoppingCart className="h-5 w-5" />
                Orders
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="mt-4 focus:outline-none">
              <AdminDashboard />
            </TabsContent>
            <TabsContent value="products" className="mt-4 focus:outline-none">
              <ProductAddComponent />
            </TabsContent>
            <TabsContent value="orders" className="mt-4 focus:outline-none">
              <AdminOrders />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}