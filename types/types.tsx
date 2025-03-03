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