-- Create storage bucket for avatars/assets
INSERT INTO storage.buckets (id, name, public) VALUES ('assets', 'assets', true);

-- Storage Policies
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'assets');
CREATE POLICY "Authenticated Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'assets' AND auth.role() = 'authenticated');
CREATE POLICY "Owner Update/Delete" ON storage.objects FOR UPDATE OR DELETE USING (bucket_id = 'assets' AND auth.uid()::text = (storage.foldername(name))[1]);
