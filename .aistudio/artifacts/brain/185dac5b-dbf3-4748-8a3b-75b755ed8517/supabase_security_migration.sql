-- ==============================================================================
-- PYINNYAR HUB (ပညာ ဟာ့ဘ်) - PRODUCTION SUPABASE DATABASE MIGRATION SCRIPT
-- ==============================================================================
-- Designed specifically for Founder & Super Admin (lyrakaelin@gmail.com)
-- 
-- KEY SECURITY GUARANTEES:
-- 1. Owner Role requires verified Supabase Auth email (email_confirmed_at IS NOT NULL).
-- 2. Non-recursive SECURITY DEFINER helper functions prevent infinite RLS loops.
-- 3. Profiles table protects private information (email, phone, metadata). Public
--    discovery uses the safe `public_instructors` view.
-- 4. Enrollments RLS & triggers prevent students from modifying payment_status,
--    student_id, or verification metadata.
-- 5. Course modifications strictly scoped: Instructors can only modify their own courses.
-- 6. All INSERT and UPDATE policies have strict WITH CHECK constraints.
-- ==============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. ROLE ENUM & TABLES
-- ------------------------------------------------------------------------------

DO $$ BEGIN
  CREATE TYPE public.user_role AS ENUM ('owner', 'admin', 'instructor', 'student');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Profiles table (1-to-1 extension of auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role public.user_role NOT NULL DEFAULT 'student',
  avatar_url TEXT,
  phone TEXT,
  headline TEXT,
  learning_preferences JSONB DEFAULT '{"language":"en","weeklyGoalHours":6,"preferredCategories":[1,2,4],"notificationsEnabled":true}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index for fast email & role lookups
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Courses table
CREATE TABLE IF NOT EXISTS public.courses (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  title_my TEXT,
  description TEXT NOT NULL,
  description_my TEXT,
  category_id INTEGER NOT NULL,
  subcategory TEXT NOT NULL DEFAULT 'General',
  instructor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  instructor_name TEXT NOT NULL,
  instructor_avatar TEXT,
  price_mmk NUMERIC(12, 2) NOT NULL DEFAULT 0,
  course_type TEXT NOT NULL DEFAULT 'free' CHECK (course_type IN ('free', 'paid', 'certificate')),
  level TEXT NOT NULL DEFAULT 'Beginner' CHECK (level IN ('Beginner', 'Intermediate', 'Advanced')),
  duration TEXT NOT NULL DEFAULT '6 weeks',
  thumbnail TEXT NOT NULL,
  is_published BOOLEAN NOT NULL DEFAULT true,
  rating NUMERIC(3, 2) DEFAULT 5.0,
  review_count INTEGER DEFAULT 0,
  modules JSONB DEFAULT '[]'::jsonb,
  quizzes JSONB DEFAULT '[]'::jsonb,
  assignments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_courses_category ON public.courses(category_id);
CREATE INDEX IF NOT EXISTS idx_courses_instructor ON public.courses(instructor_id);
CREATE INDEX IF NOT EXISTS idx_courses_published ON public.courses(is_published);

-- Enrollments table
CREATE TABLE IF NOT EXISTS public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'dropped')),
  progress_percent INTEGER NOT NULL DEFAULT 0 CHECK (progress_percent BETWEEN 0 AND 100),
  completed_lesson_ids TEXT[] DEFAULT ARRAY[]::TEXT[],
  last_accessed_lesson_id TEXT,
  last_accessed_time_seconds INTEGER DEFAULT 0,
  payment_method TEXT CHECK (payment_method IN ('free', 'kbzpay', 'wavepay', 'manual')),
  payment_slip_url TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'verified', 'rejected')),
  verified_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  verified_at TIMESTAMPTZ,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(student_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_enrollments_student ON public.enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON public.enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_payment_status ON public.enrollments(payment_status);

-- ------------------------------------------------------------------------------
-- 2. SECURITY DEFINER HELPER FUNCTIONS (PREVENTS RLS RECURSION)
-- ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.is_owner()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'owner'
      AND lower(email) = lower('lyrakaelin@gmail.com')
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('owner', 'admin')
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_instructor()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('owner', 'admin', 'instructor')
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- ------------------------------------------------------------------------------
-- 3. AUTOMATED USER PROVISIONING & OWNER VERIFICATION TRIGGERS
-- ------------------------------------------------------------------------------

-- Trigger function executed on auth.users signup
-- NOTE: Owner role is ONLY granted if email matches lyrakaelin@gmail.com AND email is verified
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  assigned_role public.user_role := 'student';
BEGIN
  -- Strict Owner Verification:
  -- Only lyrakaelin@gmail.com with verified email confirmation receives 'owner'
  IF lower(NEW.email) = lower('lyrakaelin@gmail.com') THEN
    IF NEW.email_confirmed_at IS NOT NULL THEN
      assigned_role := 'owner';
    ELSE
      -- Unverified signups default to student until email confirmation is completed
      assigned_role := 'student';
    END IF;
  ELSE
    assigned_role := 'student';
  END IF;

  INSERT INTO public.profiles (
    id,
    email,
    name,
    role,
    avatar_url,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    assigned_role,
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'),
    timezone('utc'::text, now()),
    timezone('utc'::text, now())
  )
  ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        updated_at = timezone('utc'::text, now());

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger for email confirmation: When Owner confirms email in inbox, elevate role to 'owner'
CREATE OR REPLACE FUNCTION public.handle_user_email_confirmation()
RETURNS TRIGGER AS $$
BEGIN
  IF lower(NEW.email) = lower('lyrakaelin@gmail.com') 
     AND NEW.email_confirmed_at IS NOT NULL 
     AND (OLD.email_confirmed_at IS NULL OR OLD.email_confirmed_at IS DISTINCT FROM NEW.email_confirmed_at) THEN
    UPDATE public.profiles
    SET role = 'owner', updated_at = timezone('utc'::text, now())
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;
CREATE TRIGGER on_auth_user_confirmed
  AFTER UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_email_confirmation();

-- ------------------------------------------------------------------------------
-- 4. ENROLLMENT TAMPER PROTECTION TRIGGER
-- ------------------------------------------------------------------------------

-- Ensures regular students can never forge payment_status or change student_id
CREATE OR REPLACE FUNCTION public.protect_enrollment_integrity()
RETURNS TRIGGER AS $$
BEGIN
  -- If the caller is NOT an admin or owner, strictly lock protected fields
  IF NOT public.is_admin() THEN
    IF NEW.student_id <> OLD.student_id THEN
      RAISE EXCEPTION 'Access Denied: student_id cannot be modified.';
    END IF;
    IF NEW.course_id <> OLD.course_id THEN
      RAISE EXCEPTION 'Access Denied: course_id cannot be modified.';
    END IF;
    IF NEW.payment_status <> OLD.payment_status THEN
      RAISE EXCEPTION 'Access Denied: Students cannot alter payment verification status.';
    END IF;
    IF NEW.verified_by IS DISTINCT FROM OLD.verified_by THEN
      RAISE EXCEPTION 'Access Denied: Students cannot set verified_by.';
    END IF;
    IF NEW.verified_at IS DISTINCT FROM OLD.verified_at THEN
      RAISE EXCEPTION 'Access Denied: Students cannot set verified_at.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_protect_enrollment_integrity ON public.enrollments;
CREATE TRIGGER trg_protect_enrollment_integrity
  BEFORE UPDATE ON public.enrollments
  FOR EACH ROW EXECUTE FUNCTION public.protect_enrollment_integrity();

-- ------------------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- 5A. PROFILES RLS
-- Security Fix: Never allow public SELECT of entire profiles table (prevents leaking private emails/phones).
-- Users see their own full profile; Admins see all profiles.
DROP POLICY IF EXISTS "Users view own profile or admin views all" ON public.profiles;
CREATE POLICY "Users view own profile or admin views all" ON public.profiles
  FOR SELECT USING (
    auth.uid() = id OR public.is_admin()
  );

-- Users can only update their own non-role profile fields
DROP POLICY IF EXISTS "Users update own non-role fields" ON public.profiles;
CREATE POLICY "Users update own non-role fields" ON public.profiles
  FOR UPDATE USING (
    auth.uid() = id
  )
  WITH CHECK (
    auth.uid() = id
    -- Prevents non-owner users from escalating their own role
    AND (role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid()) OR public.is_owner())
  );

-- Only Founder & Super Admin can modify roles of other users
DROP POLICY IF EXISTS "Owner manages roles" ON public.profiles;
CREATE POLICY "Owner manages roles" ON public.profiles
  FOR UPDATE USING (
    public.is_owner()
  )
  WITH CHECK (
    public.is_owner()
  );

-- Safe public view for discovering instructors without exposing student emails
CREATE OR REPLACE VIEW public.public_instructors AS
  SELECT id, name, avatar_url, headline, role
  FROM public.profiles
  WHERE role IN ('instructor', 'admin', 'owner');

GRANT SELECT ON public.public_instructors TO anon, authenticated;

-- 5B. COURSES RLS
-- Anyone can view published courses; Instructors can view unpublished courses they own
DROP POLICY IF EXISTS "View published courses or own courses" ON public.courses;
CREATE POLICY "View published courses or own courses" ON public.courses
  FOR SELECT USING (
    is_published = true
    OR public.is_admin()
    OR (public.is_instructor() AND instructor_id = auth.uid())
  );

-- Only authorized instructors or admins can insert courses
DROP POLICY IF EXISTS "Instructors can create courses" ON public.courses;
CREATE POLICY "Instructors can create courses" ON public.courses
  FOR INSERT WITH CHECK (
    public.is_admin()
    OR (public.is_instructor() AND instructor_id = auth.uid())
  );

-- Instructors can ONLY update their OWN courses; Admins can update any course
DROP POLICY IF EXISTS "Instructors update own courses" ON public.courses;
CREATE POLICY "Instructors update own courses" ON public.courses
  FOR UPDATE USING (
    public.is_admin()
    OR (public.is_instructor() AND instructor_id = auth.uid())
  )
  WITH CHECK (
    public.is_admin()
    OR (public.is_instructor() AND instructor_id = auth.uid())
  );

-- Only Admins/Owner can delete courses
DROP POLICY IF EXISTS "Admins can delete courses" ON public.courses;
CREATE POLICY "Admins can delete courses" ON public.courses
  FOR DELETE USING (
    public.is_admin()
  );

-- 5C. ENROLLMENTS RLS
-- Students view their own enrollments; Admins view all enrollments
DROP POLICY IF EXISTS "Students view own enrollments" ON public.enrollments;
CREATE POLICY "Students view own enrollments" ON public.enrollments
  FOR SELECT USING (
    auth.uid() = student_id OR public.is_admin()
  );

-- Students can insert an enrollment for themselves with initial status pending
DROP POLICY IF EXISTS "Students can self-enroll" ON public.enrollments;
CREATE POLICY "Students can self-enroll" ON public.enrollments
  FOR INSERT WITH CHECK (
    auth.uid() = student_id
    AND (
      payment_status = 'pending'
      OR (payment_status = 'verified' AND payment_method = 'free')
      OR public.is_admin()
    )
  );

-- Students can update progress or upload slip; Admins can update verification
DROP POLICY IF EXISTS "Students update own progress or admins verify" ON public.enrollments;
CREATE POLICY "Students update own progress or admins verify" ON public.enrollments
  FOR UPDATE USING (
    auth.uid() = student_id OR public.is_admin()
  )
  WITH CHECK (
    (auth.uid() = student_id AND student_id = (SELECT e.student_id FROM public.enrollments e WHERE e.id = enrollments.id))
    OR public.is_admin()
  );
