-- Seed initial achievements
INSERT INTO achievements (code, name_en, name_km, description_en, description_km, icon_key, criteria, active) VALUES
('FIRST_TEST', 'First Steps', 'ជំហានដំបូង', 'Complete your very first typing test.', 'បញ្ចប់ការធ្វើតេស្តវាយអត្ថបទលើកដំបូងរបស់អ្នក។', 'footprints', '{"minCompletedTests": 1}', true),
('SPEED_50_WPM', 'Steady Typist', 'អ្នកវាយស្ទាត់ជំនាញ', 'Achieve 50+ WPM in an English typing test.', 'សម្រេចបានល្បឿន 50+ WPM ក្នុងការធ្វើតេស្តភាសាអង់គ្លេស។', 'zap', '{"minWpm": 50}', true),
('SPEED_100_WPM', 'Speed Demon', 'កំពូលអ្នកវាយរហ័ស', 'Achieve 100+ WPM in an English typing test.', 'សម្រេចបានល្បឿន 100+ WPM ក្នុងការធ្វើតេស្តភាសាអង់គ្លេស។', 'flame', '{"minWpm": 100}', true),
('KHMER_TYPIST', 'Khmer Practitioner', 'អ្នកហាត់វាយខ្មែរ', 'Complete a Khmer test with at least 90% accuracy.', 'បញ្ចប់ការធ្វើតេស្តភាសាខ្មែរដោយមានភាពត្រឹមត្រូវយ៉ាងតិច 90%។', 'flag', '{"locale": "km", "minAccuracy": 90}', true),
('KHMER_MASTER', 'Khmer Flow', 'ល្បឿនខ្មែរស្ទាត់ជំនាញ', 'Achieve 200+ CPM in a Khmer typing test.', 'សម្រេចបានល្បឿន 200+ CPM ក្នុងការធ្វើតេស្តភាសាខ្មែរ។', 'award', '{"locale": "km", "minCpm": 200}', true),
('ACCURACY_98', 'Precision Typist', 'ភាពសុក្រឹតខ្ពស់', 'Complete a test with 98% or higher accuracy.', 'បញ្ចប់ការធ្វើតេស្តដោយមានភាពត្រឹមត្រូវ 98% ឬលើសពីនេះ។', 'target', '{"minAccuracy": 98}', true),
('PRACTICE_10', 'Dedicated Learner', 'ការតស៊ូហាត់រៀន', 'Complete at least 10 typing sessions.', 'បញ្ចប់ការធ្វើតេស្តវាយអត្ថបទយ៉ាងតិច 10 ដង។', 'book-open', '{"minCompletedTests": 10}', true);
