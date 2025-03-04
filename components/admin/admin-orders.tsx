"use client";

import { useState, useEffect, useCallback } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";
import { Order, OrderItem } from "@/types/types";

// Define the structure of the address
interface Address {
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [address, setAddress] = useState<Address | null>(null); // Updated type here

  // Fetch orders with enhanced error handling
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setOrders(data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      showAlert("Error", "Failed to fetch orders", "destructive");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Handle fetching order items and address
  const fetchOrderDetails = async (orderId: string) => {
    try {
      const { data: items, error: itemsError } = await supabase
        .from("order_items")
        .select(`
          *,
          products:product_id (*)
        `)
        .eq("order_id", orderId);

      if (itemsError) throw itemsError;
      setOrderItems(items as OrderItem[]);

      const { data: addressData, error: addressError } = await supabase
        .from("addresses")
        .select("*")
        .eq("id", selectedOrder?.address_id)
        .single();

      if (addressError) throw addressError;
      setAddress(addressData as Address); // Type casting to Address
    } catch (error) {
      console.error("Error fetching order details:", error);
      showAlert("Error", "Failed to fetch order details", "destructive");
    }
  };

  // View order dialog handler
  const handleViewOrder = async (order: Order) => {
    setSelectedOrder(order);
    setOpenDialog(true);
    await fetchOrderDetails(order.id);
  };

  // Status change handler with optimized logic
  const handleStatusChange = async (status: "pending" | "completed" | "cancelled" | "shipped") => {
    if (!selectedOrder) return;

    try {
      const { error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", selectedOrder.id);

      if (error) throw error;

      // Update local state
      setOrders(
        orders.map((order) =>
          order.id === selectedOrder.id ? { ...order, status } : order
        )
      );
      setSelectedOrder({ ...selectedOrder, status });

      alert({
        title: "Status updated",
        description: `Order status has been updated to ${status}`,
      });
    } catch (error) {
      console.error("Error updating order status:", error);
      alert({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    }
  };

  // Utility function to show alerts
  const showAlert = (title: string, description: string, variant: string = "default") => {
    alert({ title, description, variant });
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    let badgeClass = "bg-gray-100 text-gray-800"; // Default fallback

    switch (status) {
      case "pending":
        badgeClass = "bg-yellow-100 text-yellow-800";
        break;
      case "processing":
        badgeClass = "bg-blue-100 text-blue-800";
        break;
      case "shipped":
        badgeClass = "bg-purple-100 text-purple-800";
        break;
      case "delivered":
        badgeClass = "bg-green-100 text-green-800";
        break;
      case "cancelled":
        badgeClass = "bg-red-100 text-red-800";
        break;
      default:
        break;
    }

    return <Badge variant="outline" className={`${badgeClass} dark:bg-opacity-30 dark:text-gray-500`}>{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Orders</h2>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No orders found
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id.substring(0, 8)}...</TableCell>
                  <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>{order.user_id.substring(0, 8)}...</TableCell>
                  <TableCell>${order.total_amount.toFixed(2)}</TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleViewOrder(order)}
                    >
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">View order</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Order Details Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>Order ID: {selectedOrder?.id}</DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Date: {new Date(selectedOrder.created_at).toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Customer ID: {selectedOrder.user_id}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Status:</span>
                  <Select value={selectedOrder.status} onValueChange={handleStatusChange}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Address & Items Details */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Shipping Address</h3>
                {address && (
                  <div className="rounded-md border p-3 text-sm">
                    <p>{address.street}</p>
                    <p>{`${address.city}, ${address.state} ${address.postal_code}`}</p>
                    <p>{address.country}</p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Order Items</h3>
                <div className="rounded-md border">
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
                          <TableCell>${item.price.toFixed(2)}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>${(item.price * item.quantity).toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Total Calculation */}
              <div className="rounded-md border p-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Subtotal</span>
                  <span className="text-sm">
                    ${(selectedOrder.total_amount / 1.1).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Tax</span>
                  <span className="text-sm">
                    ${(selectedOrder.total_amount - selectedOrder.total_amount / 1.1).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2 mt-2">
                  <span className="font-medium">Total</span>
                  <span className="font-medium">${selectedOrder.total_amount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
