'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ShoppingCart, 
  Menu, 
  X, 
  LogOut, 
  User 
} from 'lucide-react';
import { 
  SignInButton, 
  SignedIn, 
  SignedOut, 
  SignOutButton 
} from '@clerk/nextjs';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

// Hooks and Context
import { useCart } from '@/context/cart-context';
import useUserRole from '@/hook/useUserRole';

// UI Components
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

// Navigation Routes Configuration
const routes = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Products' },
];

/**
 * Desktop Navigation Links
 * Renders navigation links for larger screens
 */
const DesktopNavLinks: React.FC<{ 
  role: string | null, 
  isLoading: boolean 
}> = ({ role, isLoading }) => (
  <nav className="hidden md:flex items-center justify-center space-x-8">
    {routes.map(route => (
      <Link
        key={route.href}
        href={route.href}
        className="text-sm font-medium text-gray-600 hover:text-gray-900"
      >
        {route.label}
      </Link>
    ))}
    {!isLoading && role === 'admin' && (
      <Link
        href="/admin"
        className="text-sm font-medium text-gray-600 hover:text-gray-900"
      >
        Admin
      </Link>
    )}
  </nav>
);

/**
 * User Authentication Dropdown
 * Renders user profile and sign-out options
 */
const UserAuthDropdown: React.FC = () => (
  <DropdownMenu >
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" size="icon" className="rounded-full">
        <User className="h-6 w-6 text-gray-600 hover:text-primary" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className='bg-white'>
      <DropdownMenuItem asChild className='hover:bg-slate-200'>
        <Link href="/profile">Profile</Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild className='hover:bg-slate-200'>
        <Link href="/orders">Orders</Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild className='hover:bg-slate-200'>
        <Link href="/addresses">Addresses</Link>
      </DropdownMenuItem>
      <DropdownMenuItem className='hover:bg-slate-200'>
        <SignOutButton>
          <div className="flex items-center">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sign out</span>
          </div>
        </SignOutButton>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

/**
 * Mobile Menu Content
 * Renders navigation links for mobile view
 */
const MobileMenuContent: React.FC<{ 
  role: string | null, 
  isLoading: boolean, 
  onClose: () => void 
}> = ({ role, isLoading, onClose }) => (
  <>
    <VisuallyHidden>
      <h2>Mobile Navigation Menu</h2>
    </VisuallyHidden>
    {routes.map(route => (
      <Link
        key={route.href}
        href={route.href}
        className="block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
        onClick={onClose}
      >
        {route.label}
      </Link>
    ))}
    {!isLoading && role === 'admin' && (
      <Link
        href="/admin"
        className="block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
        onClick={onClose}
      >
        Admin
      </Link>
    )}

    <div className="px-3 py-2">
      <SignedOut>
        <div className="flex flex-col space-y-2">
          <SignInButton mode="modal">
            <button className="w-full text-left text-gray-600 hover:text-gray-900">
              Sign In
            </button>
          </SignInButton>
        </div>
      </SignedOut>
    </div>
  </>
);

/**
 * Main Navbar Component
 * Provides responsive navigation with mobile and desktop views
 */
export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { role, isLoading } = useUserRole();
  const { cart } = useCart();
  
  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0);

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  return (
    <header className="sticky top-0 z-50 w-full  bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex-shrink-0">
          <Link href="/" className="text-xl font-bold">
          <img src="/logo.png" alt="Logo" className="w-[50px] h-[50px]" />
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <DesktopNavLinks role={role} isLoading={isLoading} />

        {/* Right Side - Cart and Auth */}
        <div className="flex items-center space-x-4">
          {/* Cart Link */}
          <Link href="/cart" className=" md:flex relative">
            <Button variant="ghost" size="icon">
              <ShoppingCart className="h-5 w-5" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-xs text-primary-foreground">
                  {cartItemsCount}
                </span>
              )}
            </Button>
          </Link>

          {/* User Authentication */}
          <div className="flex items-center space-x-4">
            <SignedOut>
              <div className="flex items-center space-x-2">
                <SignInButton mode="modal">
                  <Button>Sign In</Button>
                </SignInButton>
              </div>
            </SignedOut>
            <SignedIn>
              <UserAuthDropdown />
            </SignedIn>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden text-gray-600 hover:text-gray-900"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent className="bg-white p-4">
          <MobileMenuContent 
            role={role} 
            isLoading={isLoading} 
            onClose={() => setMobileMenuOpen(false)} 
          />
        </SheetContent>
      </Sheet>
    </header>
  );
}