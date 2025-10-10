-- Create role enum
CREATE TYPE public.app_role AS ENUM ('CO', 'S4', 'OC', 'SQMS', 'Soldier');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create units table
CREATE TABLE public.units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  rank TEXT,
  unit_id UUID REFERENCES public.units(id),
  contact TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create inventory_items table
CREATE TABLE public.inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  serial_number TEXT,
  unit_id UUID REFERENCES public.units(id),
  status TEXT DEFAULT 'Available',
  condition TEXT DEFAULT 'Good',
  assigned_to UUID REFERENCES auth.users(id),
  issued_date TIMESTAMPTZ,
  return_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;

-- Create transactions table
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES public.inventory_items(id) ON DELETE CASCADE,
  issued_by UUID REFERENCES auth.users(id),
  received_by UUID REFERENCES auth.users(id),
  issue_date TIMESTAMPTZ DEFAULT now(),
  return_date TIMESTAMPTZ,
  status TEXT DEFAULT 'Issued',
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create reports table
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID REFERENCES public.units(id),
  created_by UUID REFERENCES auth.users(id),
  created_for UUID REFERENCES auth.users(id),
  type TEXT NOT NULL,
  summary TEXT,
  file_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Create alerts table
CREATE TABLE public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message TEXT NOT NULL,
  priority TEXT DEFAULT 'Medium',
  sender_role public.app_role,
  recipient_role public.app_role,
  unit_id UUID REFERENCES public.units(id),
  acknowledged BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies for units
CREATE POLICY "All authenticated users can view units"
  ON public.units FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "CO and S4 can manage units"
  ON public.units FOR ALL
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'CO') OR 
    public.has_role(auth.uid(), 'S4')
  );

-- RLS Policies for inventory_items
CREATE POLICY "All authenticated users can view items"
  ON public.inventory_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "S4 and SQMS can insert items"
  ON public.inventory_items FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'S4') OR 
    public.has_role(auth.uid(), 'SQMS')
  );

CREATE POLICY "S4, OC, and SQMS can update items"
  ON public.inventory_items FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'S4') OR 
    public.has_role(auth.uid(), 'OC') OR 
    public.has_role(auth.uid(), 'SQMS')
  );

CREATE POLICY "S4 can delete items"
  ON public.inventory_items FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'S4'));

-- RLS Policies for transactions
CREATE POLICY "All authenticated users can view transactions"
  ON public.transactions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "SQMS and S4 can create transactions"
  ON public.transactions FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'SQMS') OR 
    public.has_role(auth.uid(), 'S4')
  );

-- RLS Policies for reports
CREATE POLICY "All authenticated users can view reports"
  ON public.reports FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "CO, S4, OC can create reports"
  ON public.reports FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'CO') OR 
    public.has_role(auth.uid(), 'S4') OR 
    public.has_role(auth.uid(), 'OC')
  );

-- RLS Policies for alerts
CREATE POLICY "Users can view relevant alerts"
  ON public.alerts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create alerts"
  ON public.alerts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can acknowledge alerts"
  ON public.alerts FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Enable realtime for critical tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.inventory_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts;

-- Insert sample units
INSERT INTO public.units (name, location) VALUES
  ('Support Squadron', 'Teteron Barracks'),
  ('EME Squadron', 'Teteron Barracks'),
  ('Resource Troop', 'Teteron Barracks'),
  ('Field Squadron', 'Chaguaramas'),
  ('Construction Squadron', 'Teteron Barracks');

-- Function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, rank)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'rank', 'Recruit')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_inventory_items_updated_at
  BEFORE UPDATE ON public.inventory_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();