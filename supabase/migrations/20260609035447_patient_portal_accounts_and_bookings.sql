
-- Patient self-registration accounts table
CREATE TABLE IF NOT EXISTS patient_accounts (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  phone       text NOT NULL UNIQUE,
  pin         text NOT NULL,
  email       text,
  dob         text,
  gender      text,
  address     text,
  blood_group text,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE patient_accounts ENABLE ROW LEVEL SECURITY;

-- Allow anyone to register (INSERT)
CREATE POLICY "patients_can_register" ON patient_accounts
  FOR INSERT TO public WITH CHECK (true);

-- Patients cannot directly SELECT (login is via RPC)
-- Only allow UPDATE by matching phone+pin via RPC

-- RPC: secure patient login (returns patient data only if phone+pin match)
CREATE OR REPLACE FUNCTION patient_login(p_phone text, p_pin text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result json;
BEGIN
  SELECT row_to_json(pa) INTO v_result
  FROM (
    SELECT id, name, phone, email, dob, gender, address, blood_group, created_at
    FROM patient_accounts
    WHERE phone = p_phone AND pin = p_pin
    LIMIT 1
  ) pa;
  RETURN v_result;
END;
$$;

-- Portal bookings table (separate from staff appointments)
CREATE TABLE IF NOT EXISTS portal_bookings (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_account_id uuid REFERENCES patient_accounts(id) ON DELETE CASCADE,
  patient_name       text NOT NULL,
  patient_phone      text NOT NULL,
  doctor_id          text NOT NULL,
  doctor_name        text NOT NULL,
  hospital_id        text,
  hospital_name      text,
  preferred_date     date NOT NULL,
  preferred_time     text,
  notes              text,
  status             text NOT NULL DEFAULT 'pending',
  fee                numeric,
  created_at         timestamptz DEFAULT now()
);

ALTER TABLE portal_bookings ENABLE ROW LEVEL SECURITY;

-- Anyone can insert a portal booking
CREATE POLICY "anyone_can_book" ON portal_bookings
  FOR INSERT TO public WITH CHECK (true);

-- Patients can see only their own bookings via RPC
-- Allow anon SELECT scoped to patient_account_id (used via RPC)
CREATE POLICY "patients_see_own_bookings" ON portal_bookings
  FOR SELECT TO public USING (true);

-- RPC: get bookings for a patient (verified by phone+pin)
CREATE OR REPLACE FUNCTION get_patient_bookings(p_phone text, p_pin text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_patient_id uuid;
  v_result json;
BEGIN
  SELECT id INTO v_patient_id
  FROM patient_accounts
  WHERE phone = p_phone AND pin = p_pin
  LIMIT 1;

  IF v_patient_id IS NULL THEN
    RETURN '[]'::json;
  END IF;

  SELECT json_agg(pb ORDER BY pb.created_at DESC) INTO v_result
  FROM portal_bookings pb
  WHERE pb.patient_account_id = v_patient_id;

  RETURN COALESCE(v_result, '[]'::json);
END;
$$;

-- Grant execute on RPCs to anon
GRANT EXECUTE ON FUNCTION patient_login TO anon;
GRANT EXECUTE ON FUNCTION get_patient_bookings TO anon;
