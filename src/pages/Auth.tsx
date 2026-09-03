import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Delete } from 'lucide-react';
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

type LoginMethod = 'pin' | 'password' | 'signup';

function FieldLabel({ children, htmlFor }: { children: React.ReactNode; htmlFor: string }) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-1.5"
    >
      {children}
    </label>
  );
}

export default function Auth() {
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState<LoginMethod>('pin');

  const [stats, setStats] = useState<{ tracked_assets: number; squadrons: number; arms_reconciled_pct: number } | null>(null);

  useEffect(() => {
    supabase.rpc('get_public_login_stats').then(({ data, error }) => {
      if (!error && data && data.length > 0) {
        setStats(data[0]);
      }
    });
  }, []);

  const [signInData, setSignInData] = useState({ email: '', password: '' });
  const [pinData, setPinData] = useState({ serviceNumber: '', pin: '' });
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

  useEffect(() => {
    const fetchUnits = async () => {
      setLoadingUnits(true);
      try {
        const { data, error } = await supabase.from('units').select('id, name').order('name');
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

  useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(signInData.email, signInData.password);
    if (error) toast.error(error.message);
    else toast.success('Signed in successfully');
    setLoading(false);
  };

  const handlePinSignIn = async () => {
    if (pinData.serviceNumber.trim().length === 0 || pinData.pin.length !== 6) return;
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
    if (error) toast.error('Incorrect PIN');
    else toast.success('Signed in successfully');
    setLoading(false);
  };

  const pressDigit = (d: string) => {
    setPinData((prev) => (prev.pin.length >= 6 ? prev : { ...prev, pin: prev.pin + d }));
  };
  const clearPin = () => setPinData((prev) => ({ ...prev, pin: '' }));
  const backspacePin = () => setPinData((prev) => ({ ...prev, pin: prev.pin.slice(0, -1) }));

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
      setMethod('password');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Left: identity / mission panel */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden border-r border-primary/10">
        <div className="absolute inset-0 fuel-tank-grid opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-primary/5" />

        <div className="relative flex items-center gap-3">
          <div className="h-11 w-11 rounded-md border border-gold/40 flex items-center justify-center shrink-0">
            <span className="font-mono text-sm font-bold text-gold">S4</span>
          </div>
          <div>
            <p className="text-sm font-bold tracking-wide">1 ENGINEER BATTALION</p>
            <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
              Trinidad &amp; Tobago Defence Force
            </p>
          </div>
        </div>

        <div className="relative max-w-lg space-y-6">
          <p className="text-[11px] font-mono uppercase tracking-widest text-gold">
            Asset Accounting &amp; Command Oversight
          </p>
          <h1 className="text-5xl font-bold leading-[1.05] text-foreground text-balance">
            Every serial accounted for, every signature held.
          </h1>
          <p className="text-muted-foreground max-w-md">
            Arms, explosives, POL, motor transport and barrack stores on one ledger, from the
            storeman's issue to the CO's approval.
          </p>

          {stats && (
            <div className="flex gap-8 pt-2">
              <div>
                <p className="text-2xl font-bold font-mono">{stats.tracked_assets.toLocaleString()}</p>
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                  Tracked Assets
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold font-mono">{stats.squadrons}</p>
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                  Squadrons
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold font-mono text-success">{stats.arms_reconciled_pct}%</p>
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                  Arms Reconciled
                </p>
              </div>
            </div>
          )}
        </div>

        <p className="relative text-[10px] font-mono uppercase tracking-widest text-muted-foreground/50">
          Restricted &middot; Authorised Personnel Only &middot; All Activity Audited
        </p>
      </div>

      {/* Right: sign-in */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm space-y-6">
          <div className="lg:hidden flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-md border border-gold/40 flex items-center justify-center shrink-0">
              <span className="font-mono text-sm font-bold text-gold">S4</span>
            </div>
            <div>
              <p className="text-sm font-bold tracking-wide">1 ENGINEER BATTALION</p>
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                Inventory Management System
              </p>
            </div>
          </div>

          <div>
            <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-1">
              Sign In
            </p>
            <h2 className="text-2xl font-bold">
              {method === 'signup' ? 'Create account' : 'Quick access'}
            </h2>
            {method !== 'signup' && (
              <p className="text-sm text-muted-foreground mt-1">
                Service number and 6-digit PIN. Set the PIN once in your profile, it saves typing a
                full password in the store.
              </p>
            )}
          </div>

          <div className="inline-flex rounded-full bg-muted p-1 gap-1">
            {(['pin', 'password', 'signup'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMethod(m)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  method === m
                    ? 'bg-gold text-gold-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {m === 'pin' ? 'PIN' : m === 'password' ? 'Password' : 'Sign Up'}
              </button>
            ))}
          </div>

          {method === 'pin' && (
            <div className="space-y-5">
              <div>
                <FieldLabel htmlFor="pin-service-number">Service Number</FieldLabel>
                <Input
                  id="pin-service-number"
                  placeholder="e.g., 0263"
                  value={pinData.serviceNumber}
                  onChange={(e) => setPinData({ ...pinData, serviceNumber: e.target.value })}
                  className="font-mono"
                />
              </div>

              <div className="flex gap-2 justify-center">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-11 w-9 rounded-md border flex items-center justify-center font-mono text-lg ${
                      i === pinData.pin.length ? 'border-gold' : 'border-border'
                    }`}
                  >
                    {pinData.pin[i] ? '•' : ''}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-2">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => pressDigit(d)}
                    className="h-12 rounded-md bg-muted hover:bg-muted/70 font-mono text-lg font-medium transition-colors"
                  >
                    {d}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={clearPin}
                  className="h-12 rounded-md bg-muted hover:bg-muted/70 font-mono text-xs font-semibold uppercase tracking-wide transition-colors"
                >
                  Clr
                </button>
                <button
                  type="button"
                  onClick={() => pressDigit('0')}
                  className="h-12 rounded-md bg-muted hover:bg-muted/70 font-mono text-lg font-medium transition-colors"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={backspacePin}
                  className="h-12 rounded-md bg-muted hover:bg-muted/70 flex items-center justify-center transition-colors"
                  aria-label="Backspace"
                >
                  <Delete className="h-4 w-4" />
                </button>
              </div>

              <Button
                onClick={handlePinSignIn}
                disabled={loading || pinData.pin.length !== 6 || !pinData.serviceNumber.trim()}
                className="w-full bg-gold text-gold-foreground hover:bg-gold/90"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </div>
          )}

          {method === 'password' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <FieldLabel htmlFor="signin-email">Email</FieldLabel>
                <Input
                  id="signin-email"
                  type="email"
                  placeholder="soldier@ttdf.mil"
                  value={signInData.email}
                  onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <FieldLabel htmlFor="signin-password">Password</FieldLabel>
                <Input
                  id="signin-password"
                  type="password"
                  value={signInData.password}
                  onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-gold text-gold-foreground hover:bg-gold/90">
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          )}

          {method === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <FieldLabel htmlFor="signup-name">Full Name</FieldLabel>
                <Input
                  id="signup-name"
                  value={signUpData.name}
                  onChange={(e) => setSignUpData({ ...signUpData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <FieldLabel htmlFor="signup-rank">Rank</FieldLabel>
                <Select value={signUpData.rank} onValueChange={(value) => setSignUpData({ ...signUpData, rank: value })} required>
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
              <div>
                <FieldLabel htmlFor="signup-unit">Unit</FieldLabel>
                <Select
                  value={signUpData.unit_id}
                  onValueChange={(value) => setSignUpData({ ...signUpData, unit_id: value })}
                  required
                  disabled={loadingUnits}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={loadingUnits ? 'Loading units...' : 'Select your unit'} />
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
              <div>
                <FieldLabel htmlFor="signup-role">Role</FieldLabel>
                <Select value={signUpData.role} onValueChange={(value) => setSignUpData({ ...signUpData, role: value })} required>
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
                <p className="text-xs text-muted-foreground mt-1.5">
                  Every role request — including command roles — needs approval from the CO or S4
                  before you can sign in. You'll see a pending-approval screen until then.
                </p>
              </div>
              <div>
                <FieldLabel htmlFor="signup-email">Email</FieldLabel>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="soldier@ttdf.mil"
                  value={signUpData.email}
                  onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <FieldLabel htmlFor="signup-password">Password</FieldLabel>
                <Input
                  id="signup-password"
                  type="password"
                  value={signUpData.password}
                  onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-gold text-gold-foreground hover:bg-gold/90">
                {loading ? 'Creating account...' : 'Sign Up'}
              </Button>
            </form>
          )}

          {method === 'pin' && (
            <p className="text-xs text-muted-foreground text-center">
              No PIN set yet? Sign in with{' '}
              <button type="button" onClick={() => setMethod('password')} className="underline underline-offset-2">
                password
              </button>{' '}
              once, then set one from your profile.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
