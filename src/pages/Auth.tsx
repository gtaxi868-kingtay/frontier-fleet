import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const militaryRanks = [
  'Private',
  'Lance Corporal',
  'Corporal',
  'Sergeant',
  'Staff Sergeant',
  'Warrant Officer II',
  'Warrant Officer I',
  'Second Lieutenant',
  'Lieutenant',
  'Captain',
  'Major',
  'Lieutenant Colonel',
  'Colonel',
];

export default function Auth() {
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [signInData, setSignInData] = useState({
    email: '',
    password: '',
  });

  const [signUpData, setSignUpData] = useState({
    email: '',
    password: '',
    name: '',
    rank: '',
    role: '',
    unit_id: '',
  });
  const [units, setUnits] = useState<Array<{ id: string; name: string }>>([]);
  const [loadingUnits, setLoadingUnits] = useState(false);

  // Fetch units for dropdown
  useEffect(() => {
    const fetchUnits = async () => {
      setLoadingUnits(true);
      try {
        const { data, error } = await supabase
          .from('units')
          .select('id, name')
          .order('name');
        
        if (error) throw error;
        setUnits(data || []);
      } catch (error) {
        console.error('Error fetching units:', error);
        toast.error('Failed to load units');
      } finally {
        setLoadingUnits(false);
      }
    };
    fetchUnits();
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signIn(signInData.email, signInData.password);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Signed in successfully');
    }

    setLoading(false);
  };

  const [pinData, setPinData] = useState({ serviceNumber: '', pin: '' });

  const handlePinSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: email, error: lookupError } = await supabase.rpc('get_email_by_service_number', {
      p_service_number: pinData.serviceNumber,
    });

    if (lookupError || !email) {
      toast.error('Service number not recognized, or no PIN has been set for it');
      setLoading(false);
      return;
    }

    const { error } = await signIn(email, pinData.pin);

    if (error) {
      toast.error('Incorrect PIN');
    } else {
      toast.success('Signed in successfully');
    }

    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    if (!signUpData.unit_id) {
      toast.error('Please select a unit');
      setLoading(false);
      return;
    }

    const { error } = await signUp(
      signUpData.email,
      signUpData.password,
      signUpData.name,
      signUpData.rank,
      signUpData.role as 'CO' | 'S1' | 'S4' | 'S4_ADMIN' | 'OC' | 'SQMS' | 'STOREMAN' | 'MTO' | 'WKSP_WO' | 'RSM' | 'Soldier',
      signUpData.unit_id
    );
    
    if (error) {
      toast.error(error.message || 'Failed to create account');
    } else {
      toast.success('Account created successfully! Profile and role request created. You can now sign in.');
      setSignUpData({ email: '', password: '', name: '', rank: '', role: '', unit_id: '' });
      // Optionally switch to login tab
      setTimeout(() => {
        const loginTab = document.querySelector('[value="signin"]') as HTMLElement;
        if (loginTab) loginTab.click();
      }, 1000);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/10 p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <img
            src="/logo-mark.svg"
            alt="Frontier Fleet"
            className="h-20 w-20 rounded-2xl shadow-glow mb-4"
          />
          <h1 className="text-4xl font-bold text-foreground mb-2">
            IBIMS
          </h1>
          <p className="text-muted-foreground text-center text-sm">
            1st Engineer Battalion<br />Inventory Management System
          </p>
        </div>

        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="pin">PIN</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Welcome Back</CardTitle>
                <CardDescription>
                  Enter your credentials to access the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="soldier@ttdf.mil"
                      value={signInData.email}
                      onChange={(e) =>
                        setSignInData({ ...signInData, email: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      value={signInData.password}
                      onChange={(e) =>
                        setSignInData({ ...signInData, password: e.target.value })
                      }
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full shadow-glow" disabled={loading}>
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pin">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Quick PIN Access</CardTitle>
                <CardDescription>
                  Sign in with your service number and PIN. Set a PIN from your account menu after signing in with your password at least once.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePinSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="pin-service-number">Service Number</Label>
                    <Input
                      id="pin-service-number"
                      type="text"
                      placeholder="e.g., TTDF-12345"
                      value={pinData.serviceNumber}
                      onChange={(e) => setPinData({ ...pinData, serviceNumber: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pin-pin">6-Digit PIN</Label>
                    <Input
                      id="pin-pin"
                      type="password"
                      inputMode="numeric"
                      maxLength={6}
                      value={pinData.pin}
                      onChange={(e) => setPinData({ ...pinData, pin: e.target.value.replace(/\D/g, '') })}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full shadow-glow" disabled={loading}>
                    {loading ? 'Signing in...' : 'Sign In with PIN'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signup">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Create Account</CardTitle>
                <CardDescription>
                  Register for system access
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="John Doe"
                      value={signUpData.name}
                      onChange={(e) =>
                        setSignUpData({ ...signUpData, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-rank">Rank</Label>
                    <Select
                      value={signUpData.rank}
                      onValueChange={(value) =>
                        setSignUpData({ ...signUpData, rank: value })
                      }
                      required
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select your rank" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover z-50">
                        {militaryRanks.map((rank) => (
                          <SelectItem key={rank} value={rank}>
                            {rank}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-unit">Unit *</Label>
                    <Select
                      value={signUpData.unit_id}
                      onValueChange={(value) =>
                        setSignUpData({ ...signUpData, unit_id: value })
                      }
                      required
                      disabled={loadingUnits}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={loadingUnits ? "Loading units..." : "Select your unit"} />
                      </SelectTrigger>
                      <SelectContent className="bg-popover z-50">
                        {units.map((unit) => (
                          <SelectItem key={unit.id} value={unit.id}>
                            {unit.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-role">Role</Label>
                    <Select
                      value={signUpData.role}
                      onValueChange={(value) =>
                        setSignUpData({ ...signUpData, role: value })
                      }
                      required
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover z-50">
                        <SelectItem value="CO">Commanding Officer (CO)</SelectItem>
                        <SelectItem value="RSM">Regimental Sergeant Major (RSM)</SelectItem>
                        <SelectItem value="S1">Adjutant (S1)</SelectItem>
                        <SelectItem value="S4">Logistics Officer (S4)</SelectItem>
                        <SelectItem value="S4_ADMIN">S4 Staff Member (S4 Admin)</SelectItem>
                        <SelectItem value="OC">Officer Commanding (OC)</SelectItem>
                        <SelectItem value="SQMS">Unit Quartermaster (SQMS)</SelectItem>
                        <SelectItem value="STOREMAN">Storeman</SelectItem>
                        <SelectItem value="MTO">Mechanical Transport Officer (MTO)</SelectItem>
                        <SelectItem value="WKSP_WO">Workshop Warrant Officer (Wksp WO)</SelectItem>
                        <SelectItem value="Soldier">Soldier</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="soldier@ttdf.mil"
                      value={signUpData.email}
                      onChange={(e) =>
                        setSignUpData({ ...signUpData, email: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={signUpData.password}
                      onChange={(e) =>
                        setSignUpData({ ...signUpData, password: e.target.value })
                      }
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full shadow-glow" disabled={loading}>
                    {loading ? 'Creating account...' : 'Sign Up'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
