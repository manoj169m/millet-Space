"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { MapPin, Plus, Pencil, Trash2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/lib/supabaseClient";
import { Address } from "@/types/types";
import MilletSpaceLoader from "../MilletSpaceLoader";

export default function AddressesPage() {
  const { isSignedIn, user } = useUser();
  const router = useRouter();
  const [address, setAddress] = useState<Address | null>(null); // Store a single address
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "United States",
    isDefault: false,
  });

  useEffect(() => {
    if (isSignedIn && user) {
      fetchAddress(); // Fetch the single address
    } else if (!isSignedIn && !loading) {
      router.push("/sign-in");
    }
  }, [isSignedIn, user]);

  const fetchAddress = async () => {
    if (!user) return;

    try {
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("clerk_user_id", user.id)
        .single(); // Fetch user ID from the users table

      if (userError) {
        throw new Error(userError.message);
      }

      const userId = userData.id;

      // Fetch a single address for the user
      const { data: addressData, error: addressError } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", userId)
        .limit(1) // Add limit to ensure only one address is fetched
        .single(); // This will now fetch just one row even if there are multiple

      if (addressError) {
        throw new Error(addressError.message);
      }

      setAddress(addressData || null); // Store the fetched address
    } catch (error) {
      console.error("Error fetching address:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isDefault: checked }));
  };

  const resetForm = () => {
    setFormData({
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "United States",
      isDefault: false,
    });
  };

  const handleOpenDialog = (address?: Address) => {
    if (address) {
      setFormData({
        street: address.street,
        city: address.city,
        state: address.state,
        postalCode: address.postal_code, // map postal_code to postalCode
        country: address.country,
        isDefault: address.is_default ?? false, // map is_default to isDefault
      });
    } else {
      resetForm();
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    try {
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("clerk_user_id", user.id)
        .single(); // Fetch user ID from the users table

      if (userError) {
        throw new Error(userError.message);
      }

      const userId = userData.id;

      const addressData = {
        user_id: userId, // Use the clerk_user_id here
        street: formData.street,
        city: formData.city,
        state: formData.state,
        postal_code: formData.postalCode, // map postalCode to postal_code
        country: formData.country,
        is_default: formData.isDefault, // map isDefault to is_default
      };

      if (address) {
        // Update the existing address
        const { error } = await supabase
          .from("addresses")
          .update(addressData)
          .eq("id", address.id);

        if (error) throw error;

        toast.success('address updated successfully')
      } else {
        // Insert new address if none exists
        const { error } = await supabase.from("addresses").insert(addressData);

        if (error) throw error;

        toast.success('address added successfully')

      }

      handleCloseDialog();
      fetchAddress(); // Fetch the updated address
    } catch (error) {
      console.error("Error saving address:", error);
             toast.success('Failed to save address')

    }
  };

  const handleDeleteAddress = async () => {
    if (!address) return;

    try {
      const { error } = await supabase.from("addresses").delete().eq("id", address.id);

      if (error) throw error;

      toast.success('address has been deleted')


      setAddress(null); // Clear the address after deletion
    } catch (error) {
      console.error("Error deleting address:", error);
      toast.success('Failed to delete address')

    }
  };

  if (loading) {
    return (
    <MilletSpaceLoader/>
    );
  }

  if (!isSignedIn) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="container p-10 bg-green-50">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold text-green-700">Your Address</h1>
          <Button onClick={() => handleOpenDialog()}   className="border border-green-700 cursor-pointer bg-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            {address ? "Edit Address" : "Add Address"}
          </Button>
        </div>

        {!address ? (
          <div className="rounded-lg border p-8 text-center">
            <MapPin className="mx-auto h-12 w-12 text-muted-foreground" />
            <h2 className="mt-4 text-lg font-medium">No address yet</h2>
            <p className="mt-2 text-muted-foreground">
              Add your address to make checkout easier
            </p>
            <Button className="mt-4" onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Address
            </Button>
          </div>
        ) : (
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Address</span>
                {address.is_default && (
                  <span className="rounded-full bg-green-700 px-2 py-1 text-xs font-medium text-white">
                    Default
                  </span>
                )}
              </CardTitle>
              <CardDescription>Shipping address for your orders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p>{address.street}</p>
                <p>
                  {address.city}, {address.state} {address.postal_code}
                </p>
                <p>{address.country}</p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
            <Button 
  variant="outline" 
  size="sm" 
  onClick={() => handleOpenDialog(address)} 
>                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeleteAddress}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </CardFooter>
          </Card>
        )}

        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {address ? "Edit Address" : "Add New Address"}
              </DialogTitle>
              <DialogDescription>
                {address ? "Update your address details below" : "Fill in your address details below"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="street">Street Address</Label>
                  <Input
                    id="street"
                    name="street"
                    value={formData.street}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State/Province</Label>
                    <Input
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input
                      id="postalCode"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isDefault"
                    checked={formData.isDefault}
                    onCheckedChange={handleSwitchChange}
                  />
                  <Label htmlFor="isDefault">Set as default address</Label>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button type="submit">
                  {address ? "Update Address" : "Add Address"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
