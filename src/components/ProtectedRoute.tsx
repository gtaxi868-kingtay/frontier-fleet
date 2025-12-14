import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Array<'CO' | 'S1' | 'S4' | 'S4_ADMIN' | 'OC' | 'SQMS' | 'STOREMAN' | 'Soldier' | 'MTO' | 'WKSP_WO'>;
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, role, loading } = useAuth();
  const [checkingSelfApprove, setCheckingSelfApprove] = useState(false);
  const [canSelfApprove, setCanSelfApprove] = useState(false);

  useEffect(() => {
    // Check if user can self-approve (first S4)
    if (!role && user && allowedRoles) {
      const checkSelfApprove = async () => {
        try {
          // Check if there's any approved S4
          const { data: approvedS4 } = await supabase
            .from('user_roles')
            .select('id')
            .eq('role', 'S4')
            .eq('status', 'approved')
            .limit(1);

          // If no approved S4, check if this user has pending S4
          if (!approvedS4 || approvedS4.length === 0) {
            const { data: myRole } = await supabase
              .from('user_roles')
              .select('id, role')
              .eq('user_id', user.id)
              .eq('role', 'S4')
              .eq('status', 'pending')
              .single();

            if (myRole) {
              setCanSelfApprove(true);
            }
          }
        } catch (error) {
          console.error('Error checking self-approve:', error);
        } finally {
          setCheckingSelfApprove(false);
        }
      };

      setCheckingSelfApprove(true);
      checkSelfApprove();
    }
  }, [user, role, allowedRoles]);

  if (loading || checkingSelfApprove) {
    return <LoadingSpinner fullScreen />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Check if user has no approved role yet
  if (!role && allowedRoles) {
    // If they can self-approve, redirect to self-approve page
    if (canSelfApprove) {
      return <Navigate to="/self-approve" replace />;
    }
    
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <h1 className="text-2xl font-bold mb-2">Role Approval Pending</h1>
          <p className="text-muted-foreground">
            Your role is pending approval from CO/S4.<br />
            You'll be able to access the system once approved.
          </p>
        </div>
      </div>
    );
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground">
            You don't have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
