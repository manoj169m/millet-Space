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
  const [address, setAddress] = useState<Address | null>(null);
  const [fetchingDetails, setFetchingDetails] = useState<boolean>(false); // To show loading indicator while fetching order details

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
    setFetchingDetails(true);
    try {
      // Fetch order items
      const { data: items, error: itemsError } = await supabase
        .from("order_items")
        .select(`
          *,
          products:product_id (*)
        `)
        .eq("order_id", orderId);

      if (itemsError) throw itemsError;
      setOrderItems(items as OrderItem[]);

      // Fetch address details
      if (selectedOrder?.address_id) {
        const { data: addressData, error: addressError } = await supabase
          .from("addresses")
          .select("*")
          .eq("id", selectedOrder.address_id)
          .single();

        if (addressError) throw addressError;
        setAddress(addressData as Address);
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
      showAlert("Error", "Failed to fetch order details", "destructive");
    } finally {
      setFetchingDetails(false);
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

      showAlert("Success", `Order status has been updated to ${status}`);
    } catch (error) {
      console.error("Error updating order status:", error);
      showAlert("Error", "Failed to update order status", "destructive");
    }
  };

  // Utility function to show alerts
  const showAlert = (title: string, description: string, variant: string = "default") => {
    alert({ title, description, variant });
  };

  // Get status badge with professional design
  const getStatusBadge = (status: string) => {
    let badgeClass = "bg-gray-200 text-gray-700"; // Default fallback

    switch (status) {
      case "pending":
        badgeClass = "bg-yellow-400 text-yellow-800";
        break;
      case "processing":
        badgeClass = "bg-blue-400 text-blue-800";
        break;
      case "shipped":
        badgeClass = "bg-purple-400 text-purple-800";
        break;
      case "delivered":
        badgeClass = "bg-green-400 text-green-800";
        break;
      case "cancelled":
        badgeClass = "bg-red-400 text-red-800";
        break;
      default:
        break;
    }

    return <Badge variant="outline" className={`${badgeClass} rounded-md py-1 px-3 text-sm`}>{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 py-6 max-w-7xl mx-auto">
      <h2 className="text-3xl font-semibold text-gray-900">Orders</h2>

      <div className="rounded-lg border border-gray-300 shadow-lg">
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
                <TableCell colSpan={6} className="text-center py-4 text-gray-500">
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
                      variant="outline"
                      color="primary"
                      size="icon"
                      onClick={() => handleViewOrder(order)}
                    >
                      <Eye className="h-5 w-5 text-gray-700 hover:text-blue-600" />
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
        <DialogContent className="sm:max-w-[600px] bg-white shadow-lg rounded-lg p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900">Order Details</DialogTitle>
            <DialogDescription className="text-sm text-gray-600">Order ID: {selectedOrder?.id}</DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Date: {new Date(selectedOrder.created_at).toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Customer ID: {selectedOrder.user_id}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Status:</span>
                  <Select value={selectedOrder.status} onValueChange={handleStatusChange}>
                    <SelectTrigger className="w-[140px] border rounded-md bg-white">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
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
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-800">Shipping Address</h3>
                {address ? (
                  <div className="rounded-lg border p-4 bg-gray-50 text-sm text-gray-700 shadow-md">
                    <p>{address.street}</p>
                    <p>{`${address.city}, ${address.state} ${address.postal_code}`}</p>
                    <p>{address.country}</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Loading address...</p>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-800">Order Items</h3>
                <div className="rounded-lg border bg-gray-50 shadow-md p-4">
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
                      {fetchingDetails ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-4 text-gray-500">
                            Loading order items...
                          </TableCell>
                        </TableRow>
                      ) : (
                        orderItems.map((item) => (
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
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Total Calculation */}
              <div className="rounded-lg border p-4 bg-gray-100">
                <div className="flex justify-between text-sm text-gray-800">
                  <span>Subtotal</span>
                  <span>${(selectedOrder.total_amount / 1.1).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-800">
                  <span>Tax</span>
                  <span>${(selectedOrder.total_amount - selectedOrder.total_amount / 1.1).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold text-gray-900 border-t pt-2 mt-2">
                  <span>Total</span>
                  <span>${selectedOrder.total_amount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
