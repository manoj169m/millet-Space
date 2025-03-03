import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { supabase } from '@/lib/supabaseClient';

export default function useUserRole() {
  const { user } = useUser();
  const [role, setRole] = useState<string>('user'); // Default role is 'user'

  useEffect(() => {
    // Ensure the user object is available
    if (user) {
      const fetchRole = async () => {
        try {
          const { data, error } = await supabase
            .from('users')
            .select('role')
            .eq('clerk_user_id', user.id)
            .single(); // Ensure only one row is returned

          if (error) {
            if (error.code === 'PGRST116') {
              // No rows returned (user not found in the database)
              console.log('User not found in the database. Inserting user...');
              const { data: newUser, error: insertError } = await supabase
                .from('users')
                .insert([{
                  clerk_user_id: user.id, 
                  email: user.primaryEmailAddress?.emailAddress, // Safe check for primary email
                  role: user.publicMetadata?.role || 'user' // Use the role from publicMetadata or fallback to 'user'
                }])
                .single();

              if (insertError) {
                console.error('Error inserting user:', insertError.message);
              } else {
                console.log('User inserted successfully:', newUser);
                setRole(newUser.role  || 'user'); // Use the inserted role or 'user'
              }
            } else {
              console.error('Error fetching role:', error.message);
            }
          } else {
            setRole(data?.role || 'user'); // Fallback to 'user' if no role is found
          }
        } catch (err) {
          console.error('Unexpected error:', err);
        }
      };

      fetchRole();
    }
  }, [user]);

  return role;
}
