
-- Make doctors publicly readable (app uses anon key, no auth context)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'doctors' AND policyname = 'Doctors are publicly readable'
  ) THEN
    CREATE POLICY "Doctors are publicly readable" ON doctors FOR SELECT TO public USING (true);
  END IF;
END $$;

-- Seed doctors
INSERT INTO doctors (id, name, specialization, phone, email, fee, available, schedule, years_experience, qualification, bio, rating, total_reviews)
VALUES
  ('doc-001', 'Dr. Ahmed Hassan', 'Cardiology', '0300-1234567', 'ahmed.hassan@sehat.pk', 2500, true, ARRAY['Mon','Tue','Wed','Thu'], 18, 'MBBS, FCPS (Cardiology), Fellowship - Aga Khan University', 'Leading interventional cardiologist with 18 years experience. Specialist in coronary angioplasty, pacemaker implantation and heart failure management. Formerly at NICVD Karachi.', 4.8, 214),
  ('doc-002', 'Dr. Fatima Malik', 'Orthopedics', '0311-7654321', 'fatima.malik@sehat.pk', 2000, true, ARRAY['Mon','Wed','Fri'], 15, 'MBBS, FCPS (Orthopedics), Fellowship in Joint Replacement', 'Expert in joint replacement surgery and sports medicine. Performed 500+ knee and hip replacements. Specialist in minimally invasive orthopedic procedures.', 4.7, 187),
  ('doc-003', 'Dr. Bilal Mengal', 'Pediatrics', '0321-9988776', 'bilal.mengal@sehat.pk', 1200, true, ARRAY['Tue','Thu','Sat'], 12, 'MBBS, DCH, FCPS (Pediatrics)', 'Dedicated pediatrician with expertise in neonatal care, childhood infections and developmental disorders. Trained at Children Hospital Lahore.', 4.9, 328),
  ('doc-004', 'Dr. Sara Rind', 'Dermatology', '0344-4433221', 'sara.rind@sehat.pk', 1800, true, ARRAY['Mon','Thu','Sat'], 10, 'MBBS, MCPS (Dermatology), Diploma in Laser & Aesthetic Medicine', 'Specialist in medical and cosmetic dermatology. Expert in skin diseases, acne management, laser treatments and anti-aging procedures.', 4.6, 142),
  ('doc-005', 'Dr. Khalid Bugti', 'Orthopedics', '0333-5566778', 'khalid.bugti@sehat.pk', 2200, true, ARRAY['Tue','Wed','Fri'], 20, 'MBBS, FRCS (UK), Fellowship Spine Surgery', 'Senior orthopedic surgeon with 20 years experience. Sub-specialist in spine surgery, trauma and complex fracture management. Trained in UK.', 4.5, 256),
  ('doc-006', 'Dr. Zainab Baloch', 'ENT', '0315-1122334', 'zainab.baloch@sehat.pk', 1500, false, ARRAY['Mon','Tue','Thu'], 8, 'MBBS, DLO, FCPS (ENT)', 'ENT specialist with expertise in endoscopic sinus surgery, hearing disorders and voice problems. Specialist in pediatric ENT conditions.', 4.7, 119),
  ('doc-007', 'Dr. Hamid Kakar', 'General Surgery', '0300-9876543', 'hamid.kakar@sehat.pk', 2000, true, ARRAY['Mon','Tue','Wed','Thu','Fri'], 22, 'MBBS, FRCS (Edinburgh), MS General Surgery', 'Highly experienced general surgeon specializing in laparoscopic surgery, hepatobiliary procedures and oncology surgery. Over 3000 surgeries performed.', 4.8, 298),
  ('doc-008', 'Dr. Nadia Shahwani', 'Gynecology', '0322-4455667', 'nadia.shahwani@sehat.pk', 1800, true, ARRAY['Mon','Wed','Thu','Sat'], 14, 'MBBS, MRCOG (UK), FCPS (Gynecology)', 'Specialist in high-risk pregnancy, infertility treatment and minimally invasive gynecological surgery. Trained at Royal College London.', 4.9, 341),
  ('doc-009', 'Dr. Tariq Lehri', 'Neurology', '0333-7788990', 'tariq.lehri@sehat.pk', 3000, true, ARRAY['Tue','Thu'], 16, 'MBBS, MRCP (UK), Fellowship Neurology - Toronto', 'Consultant neurologist specializing in stroke management, epilepsy, Parkinson''s disease and multiple sclerosis. Trained in UK and Canada.', 4.6, 98),
  ('doc-010', 'Dr. Asma Qureshi', 'General Medicine', '0300-1122345', 'asma.qureshi@sehat.pk', 1000, true, ARRAY['Mon','Tue','Wed','Thu','Fri','Sat'], 11, 'MBBS, FCPS (Internal Medicine)', 'Dedicated general physician with special interest in diabetes, hypertension and thyroid disorders. Available 6 days a week for patient convenience.', 4.5, 412)
ON CONFLICT (id) DO NOTHING;

-- Seed availability (doctors across hospitals)
INSERT INTO doctor_hospital_availability (id, doctor_id, hospital_id, working_days, start_time, end_time)
SELECT
  'avail-' || ROW_NUMBER() OVER () as id,
  d.doctor_id,
  h.hospital_id,
  d.working_days,
  d.start_time::time,
  d.end_time::time
FROM (VALUES
  ('doc-001', 'Mon,Tue,Wed', '09:00', '14:00'),
  ('doc-001', 'Thu', '15:00', '19:00'),
  ('doc-002', 'Mon,Wed', '10:00', '15:00'),
  ('doc-002', 'Fri', '09:00', '13:00'),
  ('doc-003', 'Tue,Thu', '09:00', '14:00'),
  ('doc-003', 'Sat', '10:00', '15:00'),
  ('doc-004', 'Mon,Thu', '11:00', '16:00'),
  ('doc-004', 'Sat', '09:00', '13:00'),
  ('doc-005', 'Tue,Wed', '08:00', '13:00'),
  ('doc-005', 'Fri', '14:00', '19:00'),
  ('doc-006', 'Mon,Tue', '09:00', '13:00'),
  ('doc-006', 'Thu', '14:00', '18:00'),
  ('doc-007', 'Mon,Tue,Wed', '07:00', '12:00'),
  ('doc-007', 'Thu,Fri', '13:00', '18:00'),
  ('doc-008', 'Mon,Wed,Thu', '09:00', '14:00'),
  ('doc-008', 'Sat', '10:00', '14:00'),
  ('doc-009', 'Tue', '10:00', '15:00'),
  ('doc-009', 'Thu', '14:00', '19:00'),
  ('doc-010', 'Mon,Tue,Wed,Thu,Fri', '08:00', '13:00'),
  ('doc-010', 'Sat', '09:00', '12:00')
) AS d(doctor_id, working_days, start_time, end_time)
CROSS JOIN (VALUES
  ((SELECT id FROM hospitals WHERE name LIKE '%Quetta Medical%' LIMIT 1)),
  ((SELECT id FROM hospitals WHERE name LIKE '%Civil Hospital%' LIMIT 1)),
  ((SELECT id FROM hospitals WHERE name LIKE '%Bolan%' LIMIT 1)),
  ((SELECT id FROM hospitals WHERE name LIKE '%BIMS%' OR name LIKE '%Balochistan Institute%' LIMIT 1)),
  ((SELECT id FROM hospitals WHERE name LIKE '%Prime Care%' LIMIT 1))
) AS h(hospital_id)
-- Assign hospitals deterministically per doctor
WHERE (
  (d.doctor_id = 'doc-001' AND h.hospital_id = (SELECT id FROM hospitals WHERE name LIKE '%Quetta Medical%' LIMIT 1) AND d.working_days = 'Mon,Tue,Wed') OR
  (d.doctor_id = 'doc-001' AND h.hospital_id = (SELECT id FROM hospitals WHERE name LIKE '%Bolan%' LIMIT 1) AND d.working_days = 'Thu') OR
  (d.doctor_id = 'doc-002' AND h.hospital_id = (SELECT id FROM hospitals WHERE name LIKE '%Quetta Medical%' LIMIT 1) AND d.working_days = 'Mon,Wed') OR
  (d.doctor_id = 'doc-002' AND h.hospital_id = (SELECT id FROM hospitals WHERE name LIKE '%BIMS%' OR name LIKE '%Balochistan Institute%' LIMIT 1) AND d.working_days = 'Fri') OR
  (d.doctor_id = 'doc-003' AND h.hospital_id = (SELECT id FROM hospitals WHERE name LIKE '%Civil Hospital%' LIMIT 1) AND d.working_days = 'Tue,Thu') OR
  (d.doctor_id = 'doc-003' AND h.hospital_id = (SELECT id FROM hospitals WHERE name LIKE '%Prime Care%' LIMIT 1) AND d.working_days = 'Sat') OR
  (d.doctor_id = 'doc-004' AND h.hospital_id = (SELECT id FROM hospitals WHERE name LIKE '%Bolan%' LIMIT 1) AND d.working_days = 'Mon,Thu') OR
  (d.doctor_id = 'doc-004' AND h.hospital_id = (SELECT id FROM hospitals WHERE name LIKE '%Quetta Medical%' LIMIT 1) AND d.working_days = 'Sat') OR
  (d.doctor_id = 'doc-005' AND h.hospital_id = (SELECT id FROM hospitals WHERE name LIKE '%BIMS%' OR name LIKE '%Balochistan Institute%' LIMIT 1) AND d.working_days = 'Tue,Wed') OR
  (d.doctor_id = 'doc-005' AND h.hospital_id = (SELECT id FROM hospitals WHERE name LIKE '%Prime Care%' LIMIT 1) AND d.working_days = 'Fri') OR
  (d.doctor_id = 'doc-006' AND h.hospital_id = (SELECT id FROM hospitals WHERE name LIKE '%Bolan%' LIMIT 1) AND d.working_days = 'Mon,Tue') OR
  (d.doctor_id = 'doc-006' AND h.hospital_id = (SELECT id FROM hospitals WHERE name LIKE '%Civil Hospital%' LIMIT 1) AND d.working_days = 'Thu') OR
  (d.doctor_id = 'doc-007' AND h.hospital_id = (SELECT id FROM hospitals WHERE name LIKE '%Quetta Medical%' LIMIT 1) AND d.working_days = 'Mon,Tue,Wed') OR
  (d.doctor_id = 'doc-007' AND h.hospital_id = (SELECT id FROM hospitals WHERE name LIKE '%BIMS%' OR name LIKE '%Balochistan Institute%' LIMIT 1) AND d.working_days = 'Thu,Fri') OR
  (d.doctor_id = 'doc-008' AND h.hospital_id = (SELECT id FROM hospitals WHERE name LIKE '%Civil Hospital%' LIMIT 1) AND d.working_days = 'Mon,Wed,Thu') OR
  (d.doctor_id = 'doc-008' AND h.hospital_id = (SELECT id FROM hospitals WHERE name LIKE '%Quetta Medical%' LIMIT 1) AND d.working_days = 'Sat') OR
  (d.doctor_id = 'doc-009' AND h.hospital_id = (SELECT id FROM hospitals WHERE name LIKE '%BIMS%' OR name LIKE '%Balochistan Institute%' LIMIT 1) AND d.working_days = 'Tue') OR
  (d.doctor_id = 'doc-009' AND h.hospital_id = (SELECT id FROM hospitals WHERE name LIKE '%Quetta Medical%' LIMIT 1) AND d.working_days = 'Thu') OR
  (d.doctor_id = 'doc-010' AND h.hospital_id = (SELECT id FROM hospitals WHERE name LIKE '%Civil Hospital%' LIMIT 1) AND d.working_days = 'Mon,Tue,Wed,Thu,Fri') OR
  (d.doctor_id = 'doc-010' AND h.hospital_id = (SELECT id FROM hospitals WHERE name LIKE '%Prime Care%' LIMIT 1) AND d.working_days = 'Sat')
)
ON CONFLICT DO NOTHING;

-- Seed reviews
INSERT INTO doctor_reviews (id, doctor_id, patient_name, rating, comment)
VALUES
  ('rev-001', 'doc-001', 'Muhammad Tariq', 5, 'Dr. Ahmed is outstanding. He explained my heart condition clearly and the angioplasty was smooth. Highly recommend.'),
  ('rev-002', 'doc-001', 'Khadija Raisani', 5, 'Very professional and caring. He took time to answer all my questions. One of the best cardiologists in Quetta.'),
  ('rev-003', 'doc-001', 'Ghulam Mustafa', 4, 'Good doctor, thorough diagnosis. Wait time was long but worth it for his expertise.'),
  ('rev-004', 'doc-002', 'Sobia Baloch', 5, 'My knee replacement went perfectly. Dr. Fatima is an excellent surgeon. Recovery was faster than expected.'),
  ('rev-005', 'doc-002', 'Iftikhar Ahmed', 4, 'Very skilled orthopedic specialist. She diagnosed my sports injury correctly and treatment was effective.'),
  ('rev-006', 'doc-003', 'Amina Shah', 5, 'Dr. Bilal is amazing with children! My 4 year old was scared but he made the whole visit fun. Very knowledgeable.'),
  ('rev-007', 'doc-003', 'Rashid Mengal', 5, 'Excellent pediatrician. Very caring, explains everything to parents patiently. My kids love him.'),
  ('rev-008', 'doc-003', 'Zeenat Kakar', 5, 'Best pediatrician in Quetta without doubt. Always available and very thorough in examination.'),
  ('rev-009', 'doc-004', 'Nasreen Bugti', 5, 'Dr. Sara treated my skin condition after years of failed treatments. Finally got results!'),
  ('rev-010', 'doc-004', 'Imran Lehri', 4, 'Good dermatologist. The laser treatment for my scars was effective. Would recommend.'),
  ('rev-011', 'doc-005', 'Abdul Qadir', 4, 'Very experienced spine surgeon. My back pain is gone after the procedure. Professional and reassuring.'),
  ('rev-012', 'doc-005', 'Ruqaiya Khan', 5, 'Dr. Khalid did my hip surgery successfully. His UK training really shows in his technique.'),
  ('rev-013', 'doc-006', 'Irfan Shahwani', 5, 'Excellent ENT specialist. Diagnosed my sinus problem correctly after others missed it.'),
  ('rev-014', 'doc-006', 'Samia Qureshi', 4, 'Good doctor but appointment scheduling could be better. Treatment was effective though.'),
  ('rev-015', 'doc-007', 'Habib Rind', 5, 'Dr. Hamid performed my gallbladder surgery laparoscopically. Quick recovery, minimal pain. Highly skilled.'),
  ('rev-016', 'doc-007', 'Zubaida Mengal', 5, 'Outstanding surgeon. Very confident and experienced. My family trusts him completely.'),
  ('rev-017', 'doc-007', 'Akbar Baloch', 5, 'Had appendix surgery - he was calm, professional and the procedure was a complete success.'),
  ('rev-018', 'doc-008', 'Mariam Kakar', 5, 'Dr. Nadia managed my high-risk pregnancy perfectly. Both mother and baby are healthy. Forever grateful.'),
  ('rev-019', 'doc-008', 'Saira Bugti', 5, 'Best gynecologist in Quetta. Very gentle, understanding and knowledgeable. Delivered my baby safely.'),
  ('rev-020', 'doc-008', 'Tanveer Hussain', 5, 'My wife was very anxious but Dr. Nadia made everything comfortable. Exceptional doctor.'),
  ('rev-021', 'doc-009', 'Javed Iqbal', 4, 'Good neurologist. He was thorough and prescribed the right medication for my migraines.'),
  ('rev-022', 'doc-009', 'Parveen Shahwani', 5, 'Dr. Tariq diagnosed my epilepsy correctly when others couldnt. Life changing treatment.'),
  ('rev-023', 'doc-010', 'Bashir Ahmed', 5, 'Very accessible and caring general physician. Always available, manages my diabetes excellently.'),
  ('rev-024', 'doc-010', 'Fatima Raisani', 4, 'Good doctor for routine checkups. She takes time to explain things properly.'),
  ('rev-025', 'doc-010', 'Noor Hassan', 5, 'Been her patient for 5 years. She knows my full medical history and provides personalized care.')
ON CONFLICT (id) DO NOTHING;
