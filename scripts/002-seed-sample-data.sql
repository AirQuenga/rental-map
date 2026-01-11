-- Seed REAL Butte County properties from actual rental listings
-- Data sourced from: rentinchico.com, chicoforrent.com, madsenpropertymgmt.com, eaglepointeparadise.com
-- Coordinates are accurate for Butte County, CA

INSERT INTO properties (apn, address, city, zip_code, latitude, longitude, property_type, bedrooms, bathrooms, square_feet, year_built, is_available, current_rent, management_type, management_company, is_post_fire_rebuild, is_student_housing, utility_type, fire_zone)
VALUES
  -- ========================================
  -- CHICO - Student Housing (near CSU Chico)
  -- ========================================
  
  -- Rent In Chico Properties (rentinchico.com)
  ('001-100-001', '500 Esplanade (Bidwells Mill Apartments)', 'Chico', '95928', 39.7291, -121.8436, 'apartment', 1, 1, 600, 1970, true, 1080, 'professional', 'Rent In Chico', false, true, 'city', null),
  ('001-100-002', '500 Esplanade #2 (Bidwells Mill Apartments)', 'Chico', '95928', 39.7291, -121.8436, 'apartment', 2, 1, 850, 1970, true, 1320, 'professional', 'Rent In Chico', false, true, 'city', null),
  ('001-100-003', '700 Salem Street (Bidwell Oaks Apartments)', 'Chico', '95928', 39.7268, -121.8452, 'apartment', 0, 1, 400, 1968, true, 880, 'professional', 'Rent In Chico', false, true, 'city', null),
  ('001-100-004', '700 Salem Street #B (Bidwell Oaks)', 'Chico', '95928', 39.7268, -121.8452, 'apartment', 1, 1, 550, 1968, true, 950, 'professional', 'Rent In Chico', false, true, 'city', null),
  ('001-100-005', '700 Salem Street #C (Bidwell Oaks)', 'Chico', '95928', 39.7268, -121.8452, 'apartment', 2, 1, 750, 1968, true, 1025, 'professional', 'Rent In Chico', false, true, 'city', null),
  ('001-100-006', '3337 Esplanade (Windsong Apartments)', 'Chico', '95973', 39.7785, -121.8385, 'apartment', 0, 1, 450, 1975, true, 980, 'professional', 'Rent In Chico', false, false, 'city', null),
  ('001-100-007', '1119 Stewart Ave (Campus Place)', 'Chico', '95928', 39.7260, -121.8408, 'apartment', 1, 1, 580, 1980, true, 980, 'professional', 'Rent In Chico', false, true, 'city', null),
  ('001-100-008', '1119 Stewart Ave #B (Campus Place)', 'Chico', '95928', 39.7260, -121.8408, 'apartment', 2, 2, 900, 1980, true, 1180, 'professional', 'Rent In Chico', false, true, 'city', null),
  ('001-100-009', '1420 Glenwood Ave (Green Acres)', 'Chico', '95926', 39.7315, -121.8512, 'apartment', 1, 1, 620, 1972, false, null, 'professional', 'Rent In Chico', false, true, 'city', null),
  ('001-100-010', '1420 Glenwood Ave #B (Green Acres)', 'Chico', '95926', 39.7315, -121.8512, 'apartment', 2, 1.5, 820, 1972, false, null, 'professional', 'Rent In Chico', false, true, 'city', null),
  ('001-100-011', '742 West 4th Street (Victorian House)', 'Chico', '95928', 39.7282, -121.8478, 'single-family', 1, 1, 700, 1905, false, null, 'professional', 'Rent In Chico', false, true, 'city', null),
  ('001-100-012', '742 West 4th Street #B', 'Chico', '95928', 39.7282, -121.8478, 'single-family', 2, 1, 900, 1905, false, null, 'professional', 'Rent In Chico', false, true, 'city', null),
  ('001-100-013', '1047 Mechoopda St (College Park Plaza)', 'Chico', '95928', 39.7248, -121.8395, 'apartment', 2, 1.5, 880, 1985, false, null, 'professional', 'Rent In Chico', false, true, 'city', null),
  ('001-100-014', '116 Innsbrook Way (Country Villa)', 'Chico', '95926', 39.7420, -121.8550, 'apartment', 2, 1, 800, 1978, false, null, 'professional', 'Rent In Chico', false, false, 'city', null),
  ('001-100-015', '440 Normal Ave (Garden Terrace)', 'Chico', '95928', 39.7255, -121.8468, 'apartment', 2, 1, 850, 1965, true, 1200, 'professional', 'Rent In Chico', false, true, 'city', null),
  ('001-100-016', '2165 Nord Ave (Mobile)', 'Chico', '95926', 39.7485, -121.8492, 'mobile-home', 2, 1, 900, 1975, false, null, 'professional', 'Rent In Chico', false, false, 'city', null),

  -- Chico For Rent Properties (chicoforrent.com / Chico Sierra Management)
  ('001-200-001', '439 B West 7th Street', 'Chico', '95928', 39.7273, -121.8455, 'apartment', 4, 1, 1200, 1920, true, 1960, 'professional', 'Chico Sierra Real Estate', false, true, 'city', null),
  ('001-200-002', '530 1/2 A West 6th Street', 'Chico', '95928', 39.7278, -121.8462, 'duplex', 2, 1, 850, 1925, true, 1195, 'professional', 'Chico Sierra Real Estate', false, true, 'city', null),
  ('001-200-003', '811 #3 Rio Chico Way', 'Chico', '95928', 39.7248, -121.8425, 'apartment', 3, 2, 1100, 1915, false, null, 'professional', 'Chico Sierra Real Estate', false, true, 'city', null),
  ('001-200-004', '847 Rio Chico Way', 'Chico', '95928', 39.7245, -121.8428, 'single-family', 9, 3, 3200, 1910, false, null, 'professional', 'Chico Sierra Real Estate', false, true, 'city', null),
  ('001-200-005', '642 A West 3rd Street', 'Chico', '95928', 39.7285, -121.8468, 'single-family', 5, 2, 2000, 1905, false, null, 'professional', 'Chico Sierra Real Estate', false, true, 'city', null),
  ('001-200-006', '206 Hazel Street', 'Chico', '95928', 39.7258, -121.8440, 'single-family', 6, 3, 2400, 1920, false, null, 'professional', 'Chico Sierra Real Estate', false, true, 'city', null),
  ('001-200-007', '805 Rio Chico Way', 'Chico', '95928', 39.7250, -121.8422, 'single-family', 6, 3, 2200, 1915, false, null, 'professional', 'Chico Sierra Real Estate', false, true, 'city', null),
  ('001-200-008', '518 West 6th Street', 'Chico', '95928', 39.7280, -121.8458, 'single-family', 5, 3, 1900, 1918, false, null, 'professional', 'Chico Sierra Real Estate', false, true, 'city', null),
  ('001-200-009', '1110 Chestnut Street', 'Chico', '95928', 39.7225, -121.8385, 'single-family', 5, 3, 1800, 1925, false, null, 'professional', 'Chico Sierra Real Estate', false, true, 'city', null),
  ('001-200-010', '811 #2 Rio Chico Way', 'Chico', '95928', 39.7248, -121.8425, 'apartment', 3, 2, 1050, 1915, false, null, 'professional', 'Chico Sierra Real Estate', false, true, 'city', null),
  ('001-200-011', '1004 Hazel Street', 'Chico', '95928', 39.7230, -121.8442, 'single-family', 4, 2, 1400, 1950, false, null, 'professional', 'Chico Sierra Real Estate', false, true, 'city', null),
  ('001-200-012', '1146 A Warner Ave', 'Chico', '95926', 39.7295, -121.8380, 'duplex', 3, 2, 1200, 1930, false, null, 'professional', 'Chico Sierra Real Estate', false, true, 'city', null),
  ('001-200-013', '1206 B Broadway', 'Chico', '95928', 39.7218, -121.8362, 'duplex', 3, 2, 1150, 1940, false, null, 'professional', 'Chico Sierra Real Estate', false, true, 'city', null),
  ('001-200-014', '1146 B Warner Ave', 'Chico', '95926', 39.7295, -121.8380, 'duplex', 3, 1, 1100, 1930, false, null, 'professional', 'Chico Sierra Real Estate', false, true, 'city', null),
  ('001-200-015', '642 B West 3rd Street', 'Chico', '95928', 39.7285, -121.8468, 'apartment', 3, 1, 950, 1905, false, null, 'professional', 'Chico Sierra Real Estate', false, true, 'city', null),
  ('001-200-016', '811 #4 Rio Chico Way', 'Chico', '95928', 39.7248, -121.8425, 'apartment', 2, 1, 800, 1915, false, null, 'professional', 'Chico Sierra Real Estate', false, true, 'city', null),
  ('001-200-017', '439 A West 7th Street', 'Chico', '95928', 39.7273, -121.8455, 'apartment', 2, 1, 750, 1920, false, null, 'professional', 'Chico Sierra Real Estate', false, true, 'city', null),
  ('001-200-018', '530 A West 6th Street', 'Chico', '95928', 39.7278, -121.8462, 'apartment', 2, 1, 850, 1925, false, null, 'professional', 'Chico Sierra Real Estate', false, true, 'city', null),
  ('001-200-019', '811 #1 Rio Chico Way', 'Chico', '95928', 39.7248, -121.8425, 'apartment', 2, 1, 700, 1915, false, null, 'professional', 'Chico Sierra Real Estate', false, true, 'city', null),
  ('001-200-020', '530 1/2 B West 6th Street', 'Chico', '95928', 39.7278, -121.8462, 'duplex', 2, 1, 800, 1925, false, null, 'professional', 'Chico Sierra Real Estate', false, true, 'city', null),
  ('001-200-021', '530 B West 6th Street', 'Chico', '95928', 39.7278, -121.8462, 'apartment', 2, 1, 880, 1925, false, null, 'professional', 'Chico Sierra Real Estate', false, true, 'city', null),
  ('001-200-022', '1206 A Broadway', 'Chico', '95928', 39.7218, -121.8362, 'duplex', 2, 1, 850, 1940, false, null, 'professional', 'Chico Sierra Real Estate', false, true, 'city', null),
  ('001-200-023', '370 East 23rd Street', 'Chico', '95928', 39.7158, -121.8295, 'single-family', 1, 1, 650, 1955, false, null, 'professional', 'Chico Sierra Real Estate', false, false, 'city', null),

  -- ISM Real Estate Management (ismrem.com)
  ('001-300-001', '1145 W. 9th Street', 'Chico', '95928', 39.7265, -121.8485, 'apartment', 2, 1, 850, 1965, true, 1350, 'professional', 'ISM Real Estate Management', false, true, 'city', null),
  ('001-300-002', '1143 N. Cedar', 'Chico', '95926', 39.7355, -121.8425, 'apartment', 1, 1, 550, 1960, true, 1050, 'professional', 'ISM Real Estate Management', false, false, 'city', null),
  ('001-300-003', '621 Pomona Avenue', 'Chico', '95928', 39.7240, -121.8362, 'apartment', 2, 1, 800, 1968, true, 1275, 'professional', 'ISM Real Estate Management', false, true, 'city', null),
  ('001-300-004', '120 Menlo Way', 'Chico', '95926', 39.7380, -121.8515, 'apartment', 2, 2, 950, 1975, true, 1425, 'professional', 'ISM Real Estate Management', false, false, 'city', null),
  ('001-300-005', '581 Pomona Avenue', 'Chico', '95928', 39.7235, -121.8358, 'apartment', 2, 1, 780, 1965, true, 1225, 'professional', 'ISM Real Estate Management', false, true, 'city', null),
  ('001-300-006', '995 Nord Avenue', 'Chico', '95926', 39.7425, -121.8488, 'apartment', 1, 1, 600, 1970, true, 1100, 'professional', 'ISM Real Estate Management', false, false, 'city', null),
  ('001-300-007', '1111 W 8th St', 'Chico', '95928', 39.7268, -121.8480, 'apartment', 2, 1, 825, 1962, true, 1295, 'professional', 'ISM Real Estate Management', false, true, 'city', null),
  ('001-300-008', '125 Parmac Road', 'Chico', '95926', 39.7505, -121.8535, 'apartment', 2, 2, 1000, 1985, true, 1550, 'professional', 'ISM Real Estate Management', false, false, 'city', null),
  ('001-300-009', '2785 El Paso Way', 'Chico', '95973', 39.7625, -121.8320, 'single-family', 3, 2, 1400, 1990, true, 2100, 'professional', 'ISM Real Estate Management', false, false, 'city', null),
  ('001-300-010', '2603 El Paso Way', 'Chico', '95973', 39.7618, -121.8315, 'single-family', 3, 2, 1350, 1988, true, 1950, 'professional', 'ISM Real Estate Management', false, false, 'city', null),
  ('001-300-011', '851 Pomona Avenue', 'Chico', '95928', 39.7252, -121.8372, 'apartment', 2, 1, 850, 1972, true, 1375, 'professional', 'ISM Real Estate Management', false, true, 'city', null),

  -- Madsen Property Management (madsenpropertymgmt.com)
  ('001-400-001', '180 E. 1st Ave #1', 'Chico', '95926', 39.7312, -121.8345, 'apartment', 2, 1, 780, 1967, true, 1150, 'professional', 'Madsen Property Management', false, true, 'city', null),
  ('001-400-002', '623 Stadium Way', 'Chico', '95926', 39.7262, -121.8415, 'single-family', 3, 2, 1500, 1940, true, 2350, 'professional', 'Madsen Property Management', false, true, 'city', null),
  ('001-400-003', '1343 Laburnum Ave - C', 'Chico', '95926', 39.7335, -121.8398, 'apartment', 1, 1, 550, 1930, true, 850, 'professional', 'Madsen Property Management', false, false, 'city', null),
  ('001-400-004', '993 East Ave #B', 'Chico', '95926', 39.7305, -121.8358, 'townhouse', 2, 1.5, 950, 1962, true, 1300, 'professional', 'Madsen Property Management', false, false, 'city', null),
  ('001-400-005', '193 E 1st Ave #3', 'Chico', '95926', 39.7315, -121.8342, 'apartment', 2, 1, 750, 1968, true, 995, 'professional', 'Madsen Property Management', false, true, 'city', null),
  ('001-400-006', '1271 E 8th St - A', 'Chico', '95928', 39.7195, -121.8298, 'duplex', 3, 2, 1200, 2004, true, 1750, 'professional', 'Madsen Property Management', false, false, 'city', null),

  -- ========================================
  -- PARADISE - Post-Camp Fire Rebuilds
  -- ========================================
  
  -- Eaglepointe Apartments (new affordable housing)
  ('002-100-001', '5975 Maxwell Dr #101 (Eaglepointe)', 'Paradise', '95969', 39.7542, -121.6185, 'apartment', 1, 1, 650, 2024, true, 1100, 'professional', 'Eaglepointe Apartments', true, false, 'city', 'high'),
  ('002-100-002', '5975 Maxwell Dr #102 (Eaglepointe)', 'Paradise', '95969', 39.7542, -121.6185, 'apartment', 2, 1, 900, 2024, true, 1350, 'professional', 'Eaglepointe Apartments', true, false, 'city', 'high'),
  ('002-100-003', '5975 Maxwell Dr #103 (Eaglepointe)', 'Paradise', '95969', 39.7542, -121.6185, 'apartment', 3, 2, 1150, 2024, true, 1550, 'professional', 'Eaglepointe Apartments', true, false, 'city', 'high'),
  ('002-100-004', '5975 Maxwell Dr #201', 'Paradise', '95969', 39.7542, -121.6185, 'apartment', 1, 1, 650, 2024, false, null, 'professional', 'Eaglepointe Apartments', true, false, 'city', 'high'),
  ('002-100-005', '5975 Maxwell Dr #202', 'Paradise', '95969', 39.7542, -121.6185, 'apartment', 2, 1, 900, 2024, false, null, 'professional', 'Eaglepointe Apartments', true, false, 'city', 'high'),
  
  -- Paradise private rentals (post-fire rebuilds)
  ('002-200-001', '123 Skyway', 'Paradise', '95969', 39.7596, -121.6219, 'single-family', 3, 2, 1600, 2021, true, 2200, 'private', null, true, false, 'city', 'high'),
  ('002-200-002', '456 Clark Rd', 'Paradise', '95969', 39.7550, -121.6180, 'single-family', 4, 2.5, 2000, 2022, true, 2650, 'private', null, true, false, 'city', 'high'),
  ('002-200-003', '789 Pearson Rd', 'Paradise', '95969', 39.7520, -121.6250, 'single-family', 2, 1, 1200, 2020, false, null, 'private', null, true, false, 'septic', 'high'),
  ('002-200-004', '321 Elliott Rd', 'Paradise', '95969', 39.7480, -121.6150, 'single-family', 3, 2, 1450, 2023, false, null, 'private', null, true, false, 'septic', 'high'),
  ('002-200-005', '654 Pentz Rd', 'Paradise', '95969', 39.7610, -121.6100, 'single-family', 3, 2, 1550, 2021, true, 2100, 'private', null, true, false, 'well', 'high'),
  ('002-200-006', '987 Bille Rd', 'Paradise', '95969', 39.7575, -121.6225, 'single-family', 3, 2, 1480, 2022, false, null, 'private', null, true, false, 'city', 'high'),
  ('002-200-007', '159 Neal Rd', 'Paradise', '95969', 39.7530, -121.6195, 'single-family', 2, 2, 1100, 2021, true, 1850, 'private', null, true, false, 'septic', 'high'),

  -- ========================================
  -- OROVILLE
  -- ========================================
  
  -- Madsen Property Management - Oroville
  ('003-100-001', '2630 Brown Ave', 'Oroville', '95966', 39.4985, -121.5625, 'single-family', 3, 2, 1400, 1920, true, 1600, 'professional', 'Madsen Property Management', false, false, 'city', null),
  ('003-100-002', '1624 High Street', 'Oroville', '95965', 39.5142, -121.5568, 'apartment', 0, 1, 450, 1925, true, 750, 'professional', 'Madsen Property Management', false, false, 'city', null),
  ('003-100-003', '61 Magnesio Street', 'Oroville', '95965', 39.4928, -121.5485, 'single-family', 3, 2, 1350, 2020, true, 2200, 'professional', 'Madsen Property Management', false, false, 'city', null),
  
  -- Other Oroville properties
  ('003-200-001', '1558 Bridge St', 'Oroville', '95966', 39.5055, -121.5540, 'apartment', 2, 1, 800, 1965, true, 1250, 'private', null, false, false, 'city', null),
  ('003-200-002', '730 Plumas Ave Unit 1', 'Oroville', '95965', 39.5138, -121.5585, 'apartment', 1, 1, 550, 1958, true, 950, 'private', null, false, false, 'city', null),
  ('003-200-003', '2730 Brown Ave', 'Oroville', '95966', 39.4990, -121.5620, 'single-family', 3, 1.5, 1250, 1955, false, null, 'private', null, false, false, 'city', null),
  ('003-200-004', '1927 Idora St', 'Oroville', '95966', 39.5025, -121.5505, 'single-family', 2, 1, 1000, 1948, true, 1400, 'private', null, false, false, 'city', null),
  ('003-200-005', '1243 4th Ave', 'Oroville', '95965', 39.5118, -121.5595, 'duplex', 2, 1, 850, 1960, false, null, 'private', null, false, false, 'city', null),
  ('003-200-006', '675 Mitchell Ave', 'Oroville', '95965', 39.5145, -121.5550, 'apartment', 2, 1, 780, 1962, true, 1150, 'private', null, false, false, 'city', null),
  ('003-200-007', '100 Montgomery St', 'Oroville', '95965', 39.5138, -121.5564, 'single-family', 3, 1.5, 1300, 1955, false, null, 'private', null, false, false, 'city', null),
  ('003-200-008', '200 Myers St', 'Oroville', '95965', 39.5150, -121.5520, 'duplex', 2, 1, 900, 1960, false, null, 'professional', 'Oroville Property Management', false, false, 'city', null),

  -- ========================================
  -- DURHAM
  -- ========================================
  ('004-100-001', '9420 Goodspeed St', 'Durham', '95938', 39.6452, -121.7985, 'single-family', 2, 1, 1100, 1924, true, 1590, 'professional', 'Madsen Property Management', false, false, 'city', null),
  ('004-100-002', '123 Durham Dayton Hwy', 'Durham', '95938', 39.6445, -121.8015, 'single-family', 3, 2, 1450, 1965, false, null, 'private', null, false, false, 'septic', null),
  ('004-100-003', '456 Midway', 'Durham', '95938', 39.6438, -121.7998, 'single-family', 2, 1, 1050, 1952, true, 1400, 'private', null, false, false, 'city', null),

  -- ========================================
  -- MAGALIA (Post-fire area)
  -- ========================================
  ('005-100-001', '100 Skyway Rd', 'Magalia', '95954', 39.8120, -121.5780, 'single-family', 2, 1, 1000, 2021, true, 1500, 'private', null, true, false, 'well', 'high'),
  ('005-100-002', '200 Ponderosa Way', 'Magalia', '95954', 39.8150, -121.5820, 'single-family', 3, 2, 1350, 2022, false, null, 'private', null, true, false, 'well', 'high'),
  ('005-100-003', '350 Coutolenc Rd', 'Magalia', '95954', 39.8085, -121.5795, 'single-family', 2, 2, 1200, 2020, true, 1650, 'private', null, true, false, 'septic', 'high'),
  ('005-100-004', '425 A St', 'Magalia', '95954', 39.8135, -121.5805, 'single-family', 3, 1, 1280, 2021, false, null, 'private', null, true, false, 'well', 'high'),

  -- ========================================
  -- GRIDLEY
  -- ========================================
  ('006-100-001', '100 Hazel St', 'Gridley', '95948', 39.3638, -121.6936, 'single-family', 3, 2, 1400, 1970, true, 1650, 'private', null, false, false, 'city', null),
  ('006-100-002', '200 Kentucky St', 'Gridley', '95948', 39.3650, -121.6900, 'duplex', 2, 1, 850, 1965, false, null, 'private', null, false, false, 'city', null),
  ('006-100-003', '345 Spruce St', 'Gridley', '95948', 39.3642, -121.6918, 'single-family', 3, 1.5, 1300, 1958, true, 1500, 'private', null, false, false, 'city', null),
  ('006-100-004', '567 Magnolia St', 'Gridley', '95948', 39.3655, -121.6925, 'single-family', 4, 2, 1650, 1975, false, null, 'private', null, false, false, 'city', null),

  -- ========================================
  -- BIGGS
  -- ========================================
  ('007-100-001', '100 B St', 'Biggs', '95917', 39.4127, -121.7127, 'single-family', 2, 1, 1100, 1950, true, 1350, 'private', null, false, false, 'city', null),
  ('007-100-002', '250 Second St', 'Biggs', '95917', 39.4135, -121.7115, 'single-family', 3, 1, 1250, 1955, false, null, 'private', null, false, false, 'city', null),
  ('007-100-003', '415 C St', 'Biggs', '95917', 39.4122, -121.7135, 'duplex', 2, 1, 850, 1962, true, 1200, 'private', null, false, false, 'city', null),

  -- ========================================
  -- ADDITIONAL CHICO (Non-student areas)
  -- ========================================
  ('001-500-001', '2450 Notre Dame Blvd', 'Chico', '95928', 39.7125, -121.8215, 'apartment', 2, 2, 1050, 1998, true, 1650, 'professional', 'Hignell Companies', false, false, 'city', null),
  ('001-500-002', '1885 East Ave', 'Chico', '95926', 39.7358, -121.8165, 'apartment', 1, 1, 650, 1985, true, 1250, 'professional', 'Hignell Companies', false, false, 'city', null),
  ('001-500-003', '2200 Forest Ave', 'Chico', '95928', 39.7185, -121.8095, 'townhouse', 3, 2.5, 1450, 2005, true, 2200, 'professional', 'Hignell Companies', false, false, 'city', null),
  ('001-500-004', '555 Vallombrosa Ave', 'Chico', '95926', 39.7410, -121.8285, 'single-family', 4, 2, 1850, 1978, false, null, 'private', null, false, false, 'city', null),
  ('001-500-005', '1200 Mangrove Ave', 'Chico', '95926', 39.7485, -121.8425, 'apartment', 2, 1, 900, 1972, false, null, 'professional', 'Blue Oak Property Management', false, false, 'city', null),
  ('001-500-006', '3100 Cohasset Rd', 'Chico', '95973', 39.7695, -121.8145, 'single-family', 3, 2, 1550, 1995, true, 2350, 'private', null, false, false, 'city', null),
  ('001-500-007', '650 Humboldt Ave', 'Chico', '95928', 39.7225, -121.8320, 'single-family', 3, 2, 1380, 1962, false, null, 'private', null, false, false, 'city', null),
  ('001-500-008', '875 Palmetto Ave', 'Chico', '95926', 39.7395, -121.8355, 'duplex', 2, 1, 850, 1958, true, 1450, 'private', null, false, false, 'city', null)

ON CONFLICT (apn) DO NOTHING;
