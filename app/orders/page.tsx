"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Eye, ShoppingBag } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Order, OrderItem, Address } from "@/types/types";
import MilletSpaceLoader from "../MilletSpaceLoader";

export default function OrdersPage() {
  const { isSignedIn, user } = useUser();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [address, setAddress] = useState<Address | null>(null);

  useEffect(() => {
    if (isSignedIn && user) {
      fetchOrders();
    } else if (!isSignedIn && !loading) {
      router.push("/sign-in");
    }
  }, [isSignedIn, user]);

  const fetchOrders = async () => {
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

      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = async (order: Order) => {
    setSelectedOrder(order);
    setOpenDialog(true);

    try {
      const { data: items, error: itemsError } = await supabase
        .from("order_items")
        .select(`
          *,
          products:product_id (*)
        `)
        .eq("order_id", order.id);

      if (itemsError) throw itemsError;
      setOrderItems(items as OrderItem[] || []);

      const { data: addressData, error: addressError } = await supabase
        .from("addresses")
        .select("*")
        .eq("id", order.address_id)
        .single();

      if (addressError) throw addressError;
      setAddress(addressData as Address);
    } catch (error) {
      console.error("Error fetching order details:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-200 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500">Pending</Badge>;
      case "processing":
        return <Badge variant="outline" className="bg-blue-200 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500">Processing</Badge>;
      case "shipped":
        return <Badge variant="outline" className="bg-purple-200 text-purple-800 dark:bg-purple-900/30 dark:text-purple-500">Shipped</Badge>;
      case "delivered":
        return <Badge variant="outline" className="bg-green-200 text-green-800 dark:bg-green-900/30 dark:text-green-500">Delivered</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="bg-red-200 text-red-800 dark:bg-red-900/30 dark:text-red-500">Cancelled</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-200 text-gray-800">Unknown</Badge>;
    }
  };

  if (loading) {
    return (
      <MilletSpaceLoader/>
    );
  }

  if (!isSignedIn) {
    return null;
  }

  if (orders.length === 0) {
    return (
      <div className="container py-10 bg-green-50">
        <div className="mx-auto max-w-2xl space-y-6 text-center">
          <h1 className="text-3xl font-bold text-primary">Your Orders</h1>
          <div className="rounded-lg border p-8 bg-white shadow-lg">
            <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground" />
            <h2 className="mt-4 text-lg font-medium text-gray-700">No orders yet</h2>
            <p className="mt-2 text-gray-500">You haven&apos;t placed any orders yet.</p>
            <Button
              className="mt-4 bg-blue-500 text-white hover:bg-blue-600"
              onClick={() => router.push("/products")}
            >
              Start Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container p-6 bg-green-50 sm:p-10">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-green-700">
          Your Orders <span><ShoppingBag className="inline-block h-6 w-6 text-primary" /></span>
        </h1>

        <div className="rounded-md border bg-white shadow-lg">
          <Table className="w-full">
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id} className="hover:bg-gray-100">
                  <TableCell className="font-medium">{order.id.substring(0, 8)}...</TableCell>
                  <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>₹{order.total_amount.toFixed(2)}</TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleViewOrder(order)}
                      className="hover:text-blue-500 cursor-pointer"
                    >
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">View order</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogContent className="sm:max-w-[600px] bg-green-50 shadow-lg rounded-lg sm:p-8 p-4">
            <DialogHeader>
              <DialogTitle>Order Details</DialogTitle>
              <DialogDescription>Order ID: {selectedOrder?.id}</DialogDescription>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-6">
                <div className="flex justify-between text-sm">
                  <p className="text-muted-foreground">Date: {new Date(selectedOrder.created_at).toLocaleString()}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="font-medium">Status:</span>
                    {getStatusBadge(selectedOrder.status)}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Shipping Address</h3>
                  {address && (
                    <div className="rounded-md border p-3 text-sm bg-white shadow-md">
                      <p>{address.street}</p>
                      <p>
                        {address.city}, {address.state} {address.postal_code}
                      </p>
                      <p>{address.country}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Order Items</h3>
                  <div className="rounded-md border bg-white shadow-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orderItems.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="flex items-center gap-2">
                              <div className="h-8 w-8 overflow-hidden rounded-md">
                                <img
                                  src={item.products.image}
                                  alt={item.products.name}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <span className="text-sm">{item.products.name}</span>
                            </TableCell>
                            <TableCell>₹{item.price.toFixed(2)}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>₹{(item.price * item.quantity).toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <div className="rounded-md border p-4 bg-white shadow-lg">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₹{(selectedOrder.total_amount / 1.1).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span>₹{(selectedOrder.total_amount - selectedOrder.total_amount / 1.1).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 mt-2 text-sm font-medium">
                    <span>Total</span>
                    <span>₹{selectedOrder.total_amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
