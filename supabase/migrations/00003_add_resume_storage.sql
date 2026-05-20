-- Migration: Add Resume Storage Bucket
-- This creates a storage bucket for resume PDFs

-- Create the resumes storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'resumes',
    'resumes',
    false,
    10485760, -- 10MB limit
    ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for the resumes bucket

-- Allow authenticated users to upload their own resumes
CREATE POLICY "Users can upload own resumes"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'resumes' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to view their own resumes
CREATE POLICY "Users can view own resumes"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'resumes' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own resumes
CREATE POLICY "Users can update own resumes"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'resumes' AND
    (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
    bucket_id = 'resumes' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own resumes
CREATE POLICY "Users can delete own resumes"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'resumes' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Add parsed_data column to resumes table for storing extracted info
ALTER TABLE public.resumes
ADD COLUMN IF NOT EXISTS parsed_data JSONB,
ADD COLUMN IF NOT EXISTS summary TEXT,
ADD COLUMN IF NOT EXISTS file_path TEXT,
ADD COLUMN IF NOT EXISTS file_size INTEGER,
ADD COLUMN IF NOT EXISTS parsing_status TEXT CHECK (parsing_status IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending';

-- Create index for faster queries on parsing status
CREATE INDEX IF NOT EXISTS idx_resumes_parsing_status ON public.resumes(parsing_status);
