/*
  # Create DTC Diagnostics Tables

  1. New Tables
    - `dtc_likely_causes`
      - `id` (uuid, primary key)
      - `dtc_code` (text, unique) - The DTC code (e.g., P0101)
      - `causes` (text[]) - Array of likely causes for the code
      - `severity` (text) - Severity level
      - `created_at` (timestamp)
    
    - `dtc_procedures`
      - `id` (uuid, primary key)
      - `dtc_code` (text) - Reference to DTC code
      - `vehicle_pattern` (text) - Vehicle pattern matching (year, brand, model)
      - `procedure` (text) - Detailed step-by-step procedure
      - `created_at` (timestamp)

  2. Security
    - Both tables are public (no RLS needed as they're reference data)
    - Indexes on dtc_code for fast lookups

  3. Important Notes
    - These tables store reference data for all users
    - Data is read-only from the client perspective
*/

CREATE TABLE IF NOT EXISTS dtc_likely_causes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dtc_code text UNIQUE NOT NULL,
  causes text[] NOT NULL DEFAULT ARRAY[]::text[],
  severity text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS dtc_procedures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dtc_code text NOT NULL,
  vehicle_pattern text,
  procedure text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS dtc_likely_causes_code_idx ON dtc_likely_causes(dtc_code);
CREATE INDEX IF NOT EXISTS dtc_procedures_code_idx ON dtc_procedures(dtc_code);

INSERT INTO dtc_likely_causes (dtc_code, causes, severity) VALUES
('P0101', ARRAY['Mass Air Flow (MAF) sensor contamination', 'MAF sensor wiring issues', 'Air intake leak', 'Faulty PCM', 'Vacuum leak in engine bay'], 'high'),
('P0171', ARRAY['Leaking fuel injectors', 'Faulty oxygen sensor', 'Low fuel pressure', 'Vacuum leak', 'Mass air flow sensor issue'], 'high'),
('P0172', ARRAY['Faulty oxygen sensor', 'Fuel pressure regulator malfunction', 'Leaking fuel injectors', 'Mass air flow sensor issue', 'Engine control module problem'], 'high'),
('P0300', ARRAY['Spark plug failure', 'Bad ignition coil', 'Fuel delivery issue', 'Compression problem', 'Vacuum leak'], 'critical'),
('P0301', ARRAY['Bad spark plug in cylinder 1', 'Faulty ignition coil pack', 'Fuel injector malfunction', 'Engine compression issue', 'Valve clearance problem'], 'high'),
('P0302', ARRAY['Bad spark plug in cylinder 2', 'Faulty ignition coil pack', 'Fuel injector malfunction', 'Engine compression issue', 'Valve clearance problem'], 'high'),
('P0303', ARRAY['Bad spark plug in cylinder 3', 'Faulty ignition coil pack', 'Fuel injector malfunction', 'Engine compression issue', 'Valve clearance problem'], 'high'),
('P0304', ARRAY['Bad spark plug in cylinder 4', 'Faulty ignition coil pack', 'Fuel injector malfunction', 'Engine compression issue', 'Valve clearance problem'], 'high'),
('P0420', ARRAY['Faulty catalytic converter', 'Oxygen sensor malfunction', 'Exhaust leak before catalyst', 'Fuel trim issues', 'Engine misfire'], 'medium'),
('P0442', ARRAY['Loose or damaged fuel cap', 'Leaking fuel vapor line', 'Faulty purge valve', 'Charcoal canister leak', 'Fuel tank filler neck issue'], 'medium'),
('P0500', ARRAY['Vehicle Speed Sensor (VSS) failure', 'Faulty wheel speed sensor', 'Transmission issues', 'ABS module problem', 'Wiring harness damage'], 'high'),
('P0700', ARRAY['Transmission solenoid malfunction', 'Low transmission fluid', 'Torque converter issue', 'Transmission control module fault', 'Wiring harness damage'], 'critical'),
('P0750', ARRAY['Faulty shift solenoid A', 'Low transmission fluid', 'Solenoid wiring issue', 'Transmission control module problem', 'Mechanical transmission failure'], 'high'),
('B0001', ARRAY['Airbag squib short circuit', 'Faulty airbag module', 'Wiring harness damage', 'Loose connector', 'Failed airbag component'], 'critical'),
('C0001', ARRAY['Corroded wheel speed sensor', 'ABS sensor malfunction', 'Loose ABS sensor connector', 'Damaged sensor wiring', 'Brake module issue'], 'medium'),
('U0001', ARRAY['CAN bus communication failure', 'Module communication error', 'Faulty gateway module', 'Loose connector', 'Corroded wiring'], 'medium');
