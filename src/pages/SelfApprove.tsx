import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function SelfApprove() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [pendingRole, setPendingRole] = useState<{ id: string; role: string } | null>(null);
  const [canSelfApprove, setCanSelfApprove] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    // Check if user has a pending S4 role and if they can self-approve
    const checkPendingRole = async () => {
      try {
        // Check if there's any approved S4
        const { data: approvedS4, error: approvedError } = await supabase
          .from('user_roles')
          .select('id')
          .eq('role', 'S4')
          .eq('status', 'approved')
          .limit(1);

        if (approvedError) throw approvedError;

        // If no approved S4 exists, check if this user has pending S4
        if (!approvedS4 || approvedS4.length === 0) {
          const { data: myRole, error: roleError } = await supabase
            .from('user_roles')
            .select('id, role, status')
            .eq('user_id', user.id)
            .eq('role', 'S4')
            .eq('status', 'pending')
            .single();

          if (!roleError && myRole) {
            setPendingRole({ id: myRole.id, role: myRole.role });
            setCanSelfApprove(true);
          }
        } else {
          // There's already an approved S4, can't self-approve
          setCanSelfApprove(false);
        }
      } catch (error) {
        console.error('Error checking role:', error);
      }
    };

    checkPendingRole();
  }, [user, navigate]);

  const handleSelfApprove = async () => {
    if (!pendingRole) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ status: 'approved' })
        .eq('id', pendingRole.id);

      if (error) throw error;

      toast.success('S4 role approved! Refreshing...');
      
      // Wait a moment then reload to get new role
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
    } catch (error: any) {
      console.error('Error self-approving:', error);
      toast.error(error.message || 'Failed to approve role');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/10 p-4">
      <Card className="w-full max-w-md border-border/50">
        <CardHeader className="text-center">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Role Approval Required</CardTitle>
          <CardDescription>
            Your S4 role request is pending approval
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {canSelfApprove && pendingRole ? (
            <>
              <div className="flex items-start gap-3 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-900 dark:text-yellow-200">
                    First S4 Self-Approval
                  </p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    You're the first S4 user. You can approve your own role to get started.
                  </p>
                </div>
              </div>
              <Button
                onClick={handleSelfApprove}
                disabled={loading}
                className="w-full shadow-glow"
                size="lg"
              >
                {loading ? (
                  'Approving...'
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve My S4 Role
                  </>
                )}
              </Button>
            </>
          ) : (
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                Your role request is pending. Please wait for CO or S4 to approve your request.
              </p>
              <Button
                onClick={() => navigate('/auth')}
                variant="outline"
                className="w-full"
              >
                Return to Login
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

