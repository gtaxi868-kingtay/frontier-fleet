-- Add quantity tracking and category fields to uniforms table
-- This migration adds qty_on_hand, qty_issued, qty_returned, and category columns

ALTER TABLE public.uniforms 
ADD COLUMN IF NOT EXISTS qty_on_hand integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS qty_issued integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS qty_returned integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS category text;

-- Set default values for existing records
UPDATE public.uniforms 
SET qty_on_hand = 0, 
    qty_issued = 0, 
    qty_returned = 0 
WHERE qty_on_hand IS NULL OR qty_issued IS NULL OR qty_returned IS NULL;

-- Add comment for category field
COMMENT ON COLUMN public.uniforms.qty_on_hand IS 'Quantity of this uniform item currently in stock';
COMMENT ON COLUMN public.uniforms.qty_issued IS 'Quantity of this uniform item currently issued';
COMMENT ON COLUMN public.uniforms.qty_returned IS 'Quantity of this uniform item returned';
COMMENT ON COLUMN public.uniforms.category IS 'Category of uniform item: Headwear, Tops, Bottoms, Footwear, Accessories, or Complete Sets';

