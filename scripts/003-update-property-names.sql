-- Extract property names from addresses and update the property_name column
-- Many addresses contain the property name in parentheses like "(Bidwells Mill Apartments)"

UPDATE properties
SET property_name = 
  CASE 
    WHEN address LIKE '%(%' THEN 
      TRIM(SUBSTRING(address FROM '$$([^)]+)$$'))
    ELSE NULL
  END
WHERE property_name IS NULL;

-- Also clean up addresses to remove the parenthetical names for display
-- We'll keep the original address column intact and just populate property_name
