'use client';

import type React from 'react';
import { createContext, useContext, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSession, signIn as nextAuthSignIn, signOut as nextAuthSignOut } from 'next-auth/react';
import { Spin } from 'antd';
import type { User } from 'next-auth';

// Define the shape of the AuthContext
type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string | undefined; url?: string | null | undefined; ok?: boolean; status?: number; } | undefined>;
  signUp: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
};

// Create the AuthContext
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider component that wraps the application
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const isLoading = status === 'loading';
  const user = session?.user ?? null;

  const signIn = async (email: string, password: string) => {
    const result = await nextAuthSignIn('credentials', {
      redirect: false, // Do not redirect automatically
      email,
      password,
    });
    return result;
  };

  const signUp = async (email: string, password: string) => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (!response.ok) {
        // Create an error object similar to what signIn might return
        return { error: data.message || 'Sign up failed.' };
    }
    return { data }; // Success
  };

  const signOut = async () => {
    await nextAuthSignOut({ redirect: false });
    // You can add a router.push here if you want to redirect after sign out
  };

  const value = {
    user,
    isLoading,
    signIn,
    signUp,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
        <AuthGuard>{children}</AuthGuard>
    </AuthContext.Provider>
  );
}

// Custom hook to use the AuthContext
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// AuthGuard component to protect routes
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Public routes that do not require authentication
    const isPublicRoute = 
        pathname === '/login' ||
        pathname.startsWith('/_next'); // Allow Next.js internal paths

    if (!isLoading && !user && !isPublicRoute) {
      router.push('/login');
    }
  }, [user, isLoading, router, pathname]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return <>{children}</>;
}
