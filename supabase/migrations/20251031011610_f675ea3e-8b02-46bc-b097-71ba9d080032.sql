-- Add additional weapon tracking fields to match the Excel structure
ALTER TABLE public.weapons ADD COLUMN IF NOT EXISTS store_location text;
ALTER TABLE public.weapons ADD COLUMN IF NOT EXISTS service_number text;
ALTER TABLE public.weapons ADD COLUMN IF NOT EXISTS rank text;
ALTER TABLE public.weapons ADD COLUMN IF NOT EXISTS name text;
ALTER TABLE public.weapons ADD COLUMN IF NOT EXISTS mag_amount integer;
ALTER TABLE public.weapons ADD COLUMN IF NOT EXISTS page_64_no text;

COMMENT ON COLUMN public.weapons.store_location IS 'Store or location of the weapon (e.g., Alpha Coy)';
COMMENT ON COLUMN public.weapons.service_number IS 'Service number of person issued to';
COMMENT ON COLUMN public.weapons.rank IS 'Rank of person issued to';
COMMENT ON COLUMN public.weapons.name IS 'Name of person issued to';
COMMENT ON COLUMN public.weapons.mag_amount IS 'Number of magazines issued with weapon';
COMMENT ON COLUMN public.weapons.page_64_no IS 'Page number in 64 book';