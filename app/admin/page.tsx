"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductAddComponent from "@/components/admin/admin-product";

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
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="h-12 w-12 animate-spin border-4 border-t-4 border-blue-500 rounded-full"></div>
      </div>
    );
  }

  if (!isSignedIn) {
    router.push("/sign-in");
    return null;
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-sm text-center">
          <h1 className="text-2xl font-semibold text-red-600">Access Denied</h1>
          <p className="mt-4 text-gray-600">You do not have permission to access the admin dashboard.</p>
          <Button
            className="mt-6 w-full bg-blue-600 text-white hover:bg-blue-700"
            onClick={() => router.push("/")}
          >
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10 px-4 sm:px-6 lg:px-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-extrabold text-gray-800">Admin Dashboard</h1>
      <p className="mt-2 text-gray-600">Manage your products, orders, and more.</p>

      <div className="mt-8">
        <Tabs defaultValue="dashboard">
          <TabsList className="w-full flex justify-start border-b border-gray-200">
            <TabsTrigger
              value="dashboard"
              className="py-3 px-5 text-lg font-semibold text-gray-700 hover:text-blue-500 focus:outline-none"
            >
              Dashboard
            </TabsTrigger>
            <TabsTrigger
              value="products"
              className="py-3 px-5 text-lg font-semibold text-gray-700 hover:text-blue-500 focus:outline-none"
            >
              Products
            </TabsTrigger>
            <TabsTrigger
              value="orders"
              className="py-3 px-5 text-lg font-semibold text-gray-700 hover:text-blue-500 focus:outline-none"
            >
              Orders
            </TabsTrigger>
          </TabsList>
          <TabsContent value="dashboard" className="mt-6">
            {/* <AdminDashboard /> */}
          </TabsContent>
          <TabsContent value="products" className="mt-6">
            <ProductAddComponent />
          </TabsContent>
          <TabsContent value="orders" className="mt-6">
            {/* <AdminOrders /> */}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
