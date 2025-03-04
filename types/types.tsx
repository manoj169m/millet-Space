export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    stock: number;
    quantity: number;
    offer?: number;
    category: string;
    created_at?: string;
    updated_at?: string;
  }

  export interface Comment {
    id: string;
    user_id: string;
    product_id: string;
    content: string;
    rating: number;
    created_at: string;
    updated_at: string;
  }

  export interface Order {
    id: string; // The unique identifier for the order (UUID)
    user_id: string; // The user ID associated with the order (referencing the 'users' table)
    total_amount: number; // The total amount of the order
    status: "pending" | "completed" | "cancelled" | "shipped"; // The status of the order (can be expanded if more statuses are added)
    address_id: string; // The address ID associated with the order (referencing the 'addresses' table)
    created_at: string; // The timestamp when the order was created
    updated_at: string; // The timestamp when the order was last updated
  }

  export interface OrderItem {
    id: string;
    order_id: string;
    product_id: string;  // This is a reference to the product
    quantity: number;
    price: number;
    products: {         // This is the additional product info you're trying to access
      name: string;
      image: string;
    };
  }
  
  