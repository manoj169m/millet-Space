"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Edit, Trash, Image, Search } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Define TypeScript interface for product data
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  stock: number;
  quantity: number;
  offer: number | null;
  category: string;
}

interface FormData {
  id: number | null;
  name: string;
  description: string;
  price: string;
  image: string;
  stock: string;
  quantity: string;
  offer: string;
  category: string;
}

export default function ProductManagement() {
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>({
    id: null,
    name: "",
    description: "",
    price: "",
    image: "",
    stock: "",
    quantity: "",
    offer: "",
    category: "",
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Category options for the select dropdown
  const categoryOptions = [
    "Herbal Power Mix",
    "Rice Variety",
    "Millet Flour Variety",
    "Idli Podi Variety",
    "Beauty and Care",
    "Salt Items",
    "Candies and Sweets",
    "Millets"
]


  // Fetch products from the database on load
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.from("products").select("*");
        if (error) {
          throw error;
        }
        setProducts(data || []);
      } catch (error) {
        console.error("Error fetching products:", error);
        toast.error("Failed to load products. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      id: null,
      name: "",
      description: "",
      price: "",
      image: "",
      stock: "",
      quantity: "",
      offer: "",
      category: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        image: formData.image.trim(),
        stock: parseInt(formData.stock),
        quantity: parseInt(formData.quantity),
        offer: formData.offer ? parseFloat(formData.offer) : null,
        category: formData.category.trim(),
      };

      // Basic validation
      if (isNaN(productData.price) || productData.price < 0) {
        throw new Error("Price must be a positive number");
      }
      if (isNaN(productData.stock) || productData.stock < 0) {
        throw new Error("Stock must be a positive number");
      }
      if (isNaN(productData.quantity) || productData.quantity < 1) {
        throw new Error("Quantity must be at least 1");
      }
      if (productData.offer !== null && (isNaN(productData.offer) || productData.offer < 0 || productData.offer > 100)) {
        throw new Error("Offer must be between 0 and 100");
      }

      let response;
      if (formData.id) {
        // Update existing product
        response = await supabase
          .from("products")
          .update(productData)
          .eq("id", formData.id)
          .select();
      } else {
        // Insert new product
        response = await supabase
          .from("products")
          .insert(productData)
          .select();
      }

      if (response.error) throw response.error;

      // Update products state
      if (formData.id) {
        setProducts((prevProducts) =>
          prevProducts.map((product) =>
            product.id === formData.id && response.data?.[0]
              ? { ...response.data[0] }
              : product
          )
        );
        toast.success("Product updated successfully");
      } else if (response.data?.[0]) {
        setProducts((prevProducts) => [...prevProducts, response.data[0]]);
        toast.success("Product added successfully");
      }

      // Close dialog, reset form
      setOpenDialog(false);
      resetForm();
    } catch (error) {
      console.error("Error submitting product:", error);
      toast.error("Failed to save product. Please try again.");
    }
  };

  const confirmDelete = (productId: number) => {
    setProductToDelete(productId);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!productToDelete) return;
    
    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productToDelete);
      
      if (error) throw error;

      // Update UI
      setProducts(products.filter((product) => product.id !== productToDelete));
      toast.success("Product deleted successfully");
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product. Please try again.");
    } finally {
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  const handleEdit = (product: Product) => {
    setFormData({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      image: product.image,
      stock: product.stock.toString(),
      quantity: product.quantity.toString(),
      offer: product.offer ? product.offer.toString() : "",
      category: product.category,
    });
    setOpenDialog(true);
  };

  // Filter products based on search term
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="max-w-7xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-2xl font-bold">Product Management</CardTitle>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-green-600 hover:bg-green-700">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] bg-white">
            <DialogHeader>
              <DialogTitle>{formData.id ? "Edit Product" : "Add New Product"}</DialogTitle>
              <DialogDescription>
                {formData.id ? "Update the product details below" : "Fill in the product details below"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4 ">
                {/* Form fields */}
                <div className="grid grid-cols-2 gap-4 ">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter product name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="input"
                      required
                    >
                      <option value="">Select a category</option>
                      {categoryOptions.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe the product"
                    rows={3}
                    required
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price ($)</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stock">Stock</Label>
                    <Input
                      id="stock"
                      name="stock"
                      type="number"
                      min="0"
                      value={formData.stock}
                      onChange={handleInputChange}
                      placeholder="0"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Unit Quantity</Label>
                    <Input
                      id="quantity"
                      name="quantity"
                      type="number"
                      min="1"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      placeholder="1"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="offer">Discount (%)</Label>
                  <Input
                    id="offer"
                    name="offer"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.offer}
                    onChange={handleInputChange}
                    placeholder="Optional discount percentage"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image">Image URL</Label>
                  <Input
                    id="image"
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    placeholder="https://example.com/image.jpg"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpenDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit">{formData.id ? "Update" : "Save"} Product</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {/* Search Bar */}
        <div className="flex w-full max-w-sm items-center space-x-2 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search products..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {searchTerm && (
            <Button variant="outline" onClick={() => setSearchTerm("")} size="sm">
              Clear
            </Button>
          )}
        </div>

        {/* Product Table */}
        <div className="rounded-md border">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <p>Loading products...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col justify-center items-center py-8">
              <Image className="h-12 w-12 text-gray-400 mb-2" />
              <p className="text-lg font-medium">No products found</p>
              <p className="text-sm text-gray-500">
                {searchTerm ? "Try a different search term" : "Add a new product to get started"}
              </p>
            </div>
          ) : (
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                  <tr>
                    <th scope="col" className="px-4 py-3">Product</th>
                    <th scope="col" className="px-4 py-3">Category</th>
                    <th scope="col" className="px-4 py-3">Price</th>
                    <th scope="col" className="px-4 py-3">Stock</th>
                    <th scope="col" className="px-4 py-3">Discount</th>
                    <th scope="col" className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="bg-white border-b hover:bg-gray-50 text-black">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded bg-gray-100 flex items-center justify-center overflow-hidden">
                            {product.image ? (
                              <img 
                                src={product.image} 
                                alt={product.name} 
                                className="object-cover h-full w-full"
                                onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/40")} 
                              />
                            ) : (
                              <Image className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{product.name}</div>
                            <div className="text-xs text-gray-500 truncate max-w-xs" title={product.description}>
                              {product.description.length > 60
                                ? `${product.description.slice(0, 60)}...`
                                : product.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline">{product.category}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        ₹{product.price.toFixed(2)}
                        {product.offer ? (
                          <span className="ml-1 text-green-600 text-xs">
                            (-{product.offer}%)
                          </span>
                        ) : null}
                      </td>
                      <td className="px-4 py-3">
                      <Badge variant={product.stock > 10 ? "default" : product.stock > 0 ? "secondary" : "destructive"}>
  {product.stock}
</Badge>

                      </td>
                      <td className="px-4 py-3">
                        {product.offer ? `${product.offer}% off` : "No discount"}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            className="h-8 w-8"
                            onClick={() => handleEdit(product)}
                          >
                            <Edit className="h-5 w-5" />
                          </Button>
                          <Button
                            variant="outline"
                            className="h-8 w-8"
                            onClick={() => confirmDelete(product.id)}
                          >
                            <Trash className="h-5 w-5 text-red-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </CardContent>
      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this product?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Yes, Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
