"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { Product, Order } from "@/types/types";
import { Package, ShoppingCart, DollarSign, AlertCircle } from "lucide-react"; // Importing Lucide icons

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    lowStock: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch products
        const { data: productsData } = await supabase
          .from("products")
          .select("*");

        if (productsData) {
          setProducts(productsData);
          setStats(prev => ({
            ...prev,
            totalProducts: productsData.length,
            lowStock: productsData.filter(p => p.stock < 10).length
          }));
        }

        // Fetch orders
        const { data: ordersData } = await supabase
          .from("orders")
          .select("*");

        if (ordersData) {
          setOrders(ordersData);
          setStats(prev => ({
            ...prev,
            totalOrders: ordersData.length,
            totalRevenue: ordersData.reduce((sum, order) => sum + order.total_amount, 0)
          }));
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Prepare data for charts
  const categoryCounts = products.reduce((acc, product) => {
    acc[product.category] = (acc[product.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryData = Object.entries(categoryCounts).map(([name, value]) => ({
    name,
    value,
  }));

  const orderStatusCounts = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const orderStatusData = Object.entries(orderStatusCounts).map(([name, value]) => ({
    name,
    value,
  }));

  // Updated color palette for better user experience
  const PIE_COLORS = ['#0088FE', '#FF8042', '#00C49F', '#FFBB28', '#FF6666']; // More distinct colors
  const BAR_COLOR = '#4CAF50'; // Green for positive representation (orders processed or delivered)
//   const CARD_HIGHLIGHT = '#F3F4F6'; // Soft background color for highlighting cards

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Products */}
        <Card className="hover:shadow-lg transition duration-300 ease-in-out transform hover:scale-105 bg-gradient-to-r from-blue-100 to-blue-50">
          <CardHeader className="pb-2 flex items-center space-x-2">
            <Package size={24} className="text-blue-600" />
            <CardTitle className="text-sm font-semibold text-muted-foreground">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
          </CardContent>
        </Card>

        {/* Total Orders */}
        <Card className="hover:shadow-lg transition duration-300 ease-in-out transform hover:scale-105 bg-gradient-to-r from-green-100 to-green-50">
          <CardHeader className="pb-2 flex items-center space-x-2">
            <ShoppingCart size={24} className="text-green-600" />
            <CardTitle className="text-sm font-semibold text-muted-foreground">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
          </CardContent>
        </Card>

        {/* Total Revenue */}
        <Card className="hover:shadow-lg transition duration-300 ease-in-out transform hover:scale-105 bg-gradient-to-r from-yellow-100 to-yellow-50">
          <CardHeader className="pb-2 flex items-center space-x-2">
            <DollarSign size={24} className="text-yellow-600" />
            <CardTitle className="text-sm font-semibold text-muted-foreground">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>

        {/* Low Stock Items */}
        <Card className="hover:shadow-lg transition duration-300 ease-in-out transform hover:scale-105 bg-gradient-to-r from-red-100 to-red-50">
          <CardHeader className="pb-2 flex items-center space-x-2">
            <AlertCircle size={24} className="text-red-600" />
            <CardTitle className="text-sm font-semibold text-muted-foreground">Low Stock Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lowStock}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Pie Chart for Categories */}
        <Card className="hover:shadow-lg transition duration-300 ease-in-out transform hover:scale-105 bg-white">
          <CardHeader>
            <CardTitle>Products by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Bar Chart for Orders by Status */}
        <Card className="hover:shadow-lg transition duration-300 ease-in-out transform hover:scale-105 bg-white">
          <CardHeader>
            <CardTitle>Orders by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={orderStatusData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill={BAR_COLOR} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
