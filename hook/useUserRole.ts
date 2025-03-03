import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { supabase } from '@/lib/supabaseClient';

// Define proper types for the user data
interface UserData {
  id?: number;
  clerk_user_id: string;
  email?: string;
  role: string;
  created_at?: string;
}

export default function useUserRole() {
  const { user } = useUser();
  const [role, setRole] = useState<string>('user'); // Default role is 'user'
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reset states when user changes
    setIsLoading(true);
    setError(null);

    // Only proceed if user exists
    if (!user) {
      setIsLoading(false);
      return;
    }

    const fetchRole = async () => {
      try {
        // Try to get the user from the database
        const { data, error } = await supabase
          .from('users')
          .select('role')
          .eq('clerk_user_id', user.id)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            // No rows returned (user not found in the database)
            console.log('User not found in the database. Inserting user...');
            
            // Prepare user data with explicit type
            const userData: UserData = {
              clerk_user_id: user.id,
              email: user.primaryEmailAddress?.emailAddress || '',
              role: typeof user.publicMetadata?.role === 'string' 
                ? user.publicMetadata.role 
                : 'user'
            };

            // Insert new user
            const { data: insertedData, error: insertError } = await supabase
              .from('users')
              .insert([userData])
              .select(); // Use select() to return the inserted data

            if (insertError) {
              console.error('Error inserting user:', insertError.message);
              setError(`Failed to create user: ${insertError.message}`);
            } else if (insertedData && insertedData.length > 0) {
              const newUser = insertedData[0] as UserData;
              console.log('User inserted successfully:', newUser);
              setRole(newUser.role);
            } else {
              // Handle case where insert succeeded but no data was returned
              console.log('User created but no data returned');
              setRole('user');
            }
          } else {
            console.error('Error fetching role:', error.message);
            setError(`Failed to fetch role: ${error.message}`);
          }
        } else {
          // User found in database
          setRole(data?.role || 'user');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        console.error('Unexpected error:', errorMessage);
        setError(`Unexpected error: ${errorMessage}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRole();
  }, [user]);

  return { role, isLoading, error };
}