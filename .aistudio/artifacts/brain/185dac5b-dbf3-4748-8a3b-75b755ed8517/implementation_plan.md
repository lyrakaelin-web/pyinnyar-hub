# PYINNYAR HUB: Production Authentication & Database Migration Plan

A complete, zero-loss architectural plan to transition PYINNYAR HUB from local/ephemeral storage to a production-grade authentication and relational data system using **Supabase Auth** and **PostgreSQL**, with strict server-enforced Role-Based Access Control (RBAC).

---

## User Review & Critical Decisions

> [!IMPORTANT]
> **No application source files have been altered.** This plan details the exact database DDL, server middleware, environment variables, and verification steps. Please review and click **Proceed** (or reply in chat) when you are ready to begin implementation.

* **Designated Founder / Super Admin:** Locked strictly to `OWNER_EMAIL` (`lyrakaelin@gmail.com`). Only this account receives the immutable `owner` role.
* **Public Self-Service Registration:** Creates exclusively `student` accounts. Any role fields submitted in registration payloads are strictly rejected/ignored.
* **Instructor / Admin Onboarding:** Instructors can only be authorized/invited by an Owner or Admin; Admins can only be authorized by the Owner.
* **Security Model:** Express backend validates Supabase JWT Bearer tokens on every protected route. Client `localStorage` is used only for caching user profile displays and is never trusted for authorization.
* **Data Continuity:** All 30 academic & vocational categories, existing course catalogs, quizzes, bilingual Myanmar (Unicode) & English translations, and brand aesthetics (`#14243A` Navy and `#C7A66A` Gold) are 100% preserved.

---

## 1. System Architecture & Request Lifecycle

```
┌────────────────────────────────────────────────────────────────────────┐
│                          CLIENT (BROWSER)                              │
│                                                                        │
│  ┌───────────────────────┐             ┌────────────────────────────┐  │
│  │ Public Registration   │             │ Protected Actions          │  │
│  │ (Role: Student Only)  │             │ (Course edit, Admin panel) │  │
│  └───────────┬───────────┘             └─────────────┬──────────────┘  │
└──────────────┼───────────────────────────────────────┼─────────────────┘
               │                                       │
               │ Supabase Auth (Sign-Up / Login)       │ Bearer JWT (Access Token)
               ▼                                       ▼
┌───────────────────────────────┐       ┌────────────────────────────────┐
│         SUPABASE AUTH         │       │     EXPRESS BACKEND SERVER     │
│  (Managed OAuth / Passwords)  │       │          (server.ts)           │
│                               │       ├────────────────────────────────┤
│ • Cryptographic scrypt hashing│       │ Auth Middleware (requireAuth)  │
│ • Issues signed RS256/HS256   │       │ • Validates JWT via Supabase   │
│   JWT access & refresh tokens │       │ • Checks PostgreSQL Profile    │
│ • Fires database trigger on   │       │                                │
│   new user creation           │       │ Role Middleware (requireRole)  │
└──────────────┬────────────────┘       │ • requireOwner: email & role   │
               │                        │ • requireAdmin: owner | admin  │
               │ Initial insert         │ • requireInstructor: inst+     │
               ▼                        └──────────────┬─────────────────┘
┌──────────────────────────────────────────────────────┴─────────────────┐
│                        POSTGRESQL DATABASE                             │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ public.profiles (Linked to auth.users via foreign key UUID)      │  │
│  │ - id (UUID, PK)                                                  │  │
│  │ - email (TEXT, Unique)                                           │  │
│  │ - role ('owner' | 'admin' | 'instructor' | 'student')            │  │
│  │ - created_at (TIMESTAMPTZ)                                       │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────┐  ┌────────────────┐  ┌──────────────────┐  │
│  │ courses                │  │ enrollments    │  │ certificates     │  │
│  └────────────────────────┘  └────────────────┘  └──────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Exact Supabase Configuration Required

In your [Supabase Dashboard](https://supabase.com/dashboard):

1. **Authentication Providers:**
   * **Email / Password:** Enabled.
   * **Email Confirmations:** Recommended `Enabled` for production (or `Disabled` temporarily if instant activation during staging is desired).
   * **Minimum Password Length:** 8 characters.
2. **JWT Settings:**
   * Keep default token expiry (3600 seconds / 1 hour) with automatic background refresh handled by the Supabase SDK.
3. **Database Extension:**
   * `pgcrypto` or `uuid-ossp` (enabled by default in Supabase).

---

## 3. Database Schema & Tables Required (PostgreSQL DDL)

The following migration script will run in the Supabase SQL Editor. It creates the typed roles, user profiles, seed courses, enrollments, and strict Row Level Security (RLS) policies.

```sql
-- 1. Create Role Enum
CREATE TYPE user_role AS ENUM ('owner', 'admin', 'instructor', 'student');

-- 2. Create Profiles Table (1-to-1 extension of auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'student',
  avatar_url TEXT,
  phone TEXT,
  headline TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Trigger to Automatically Create Profile on Auth Signup
-- Notice: If the signup email matches the designated Owner, assign 'owner'; otherwise ALWAYS 'student'.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  assigned_role user_role := 'student';
BEGIN
  IF lower(NEW.email) = lower('lyrakaelin@gmail.com') THEN
    assigned_role := 'owner';
  ELSE
    assigned_role := 'student';
  END IF;

  INSERT INTO public.profiles (id, email, name, role, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    assigned_role,
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Courses Table (Persistent Course Catalog)
CREATE TABLE public.courses (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  title_my TEXT,
  description TEXT NOT NULL,
  instructor_id UUID REFERENCES public.profiles(id),
  instructor_name TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'MMK',
  level TEXT NOT NULL DEFAULT 'All Levels',
  thumbnail TEXT NOT NULL,
  duration TEXT NOT NULL,
  is_published BOOLEAN NOT NULL DEFAULT true,
  rating NUMERIC(3, 2) DEFAULT 5.0,
  review_count INTEGER DEFAULT 0,
  modules JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. Enrollments Table
CREATE TABLE public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active',
  progress INTEGER NOT NULL DEFAULT 0,
  payment_slip_url TEXT,
  payment_verified BOOLEAN NOT NULL DEFAULT false,
  verified_by UUID REFERENCES public.profiles(id),
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(user_id, course_id)
);

-- 6. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies
-- Profiles: Users can view all profiles (for instructor bio/names), but only edit their own name/avatar. Role can never be updated by standard user.
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own non-role profile fields" ON public.profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()));

-- Courses: Anyone can read published courses; only instructors/admins/owner can insert/update
CREATE POLICY "Published courses are viewable by everyone" ON public.courses
  FOR SELECT USING (is_published = true OR auth.uid() IN (
    SELECT id FROM public.profiles WHERE role IN ('owner', 'admin', 'instructor')
  ));

-- Enrollments: Students see their own; Owner/Admin can see and verify all
CREATE POLICY "Users view own enrollments" ON public.enrollments
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() IN (
    SELECT id FROM public.profiles WHERE role IN ('owner', 'admin')
  ));
```

---

## 4. Authentication Migration Steps

### Phase A: Install Client & Server SDKs
* Install `@supabase/supabase-js` in `package.json`.

### Phase B: Frontend Auth Layer (`src/lib/supabase.ts` & `src/context/AppContext.tsx`)
1. Create Supabase client instance using `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
2. Update `login()` to call `supabase.auth.signInWithPassword({ email, password })`.
3. Update `register()` to call `supabase.auth.signUp({ email, password, options: { data: { name } } })`.
   * Completely remove role input parameters. Public registration defaults strictly to `student`.
4. Update `logout()` to call `await supabase.auth.signOut()`, invalidate server session cookies/headers, and clear state.
5. In `AppContext`, subscribe to `supabase.auth.onAuthStateChange` to retrieve the current user and their verified role from `public.profiles`.

### Phase C: Express Backend Middleware (`server.ts`)
1. Initialize backend Supabase Admin client using `SUPABASE_SERVICE_ROLE_KEY` (never exposed to frontend).
2. Implement verification middlewares:
   * `authenticateToken`: Inspects `Authorization: Bearer <token>` and validates with `supabase.auth.getUser(token)`.
   * `requireOwner`: Validates `req.user.email === OWNER_EMAIL` and `profile.role === 'owner'`.
   * `requireAdmin`: Validates `profile.role IN ('owner', 'admin')`.
   * `requireInstructor`: Validates `profile.role IN ('owner', 'admin', 'instructor')`.
3. Wrap all administrative endpoints (`/api/admin/*`, course creation/deletion, payment approvals) with these server checks.

---

## 5. Owner Account Creation & Verification Procedure

1. **Owner Registration:**
   * The Owner creates their account through the regular login/register modal or Supabase dashboard using the designated email:
     **`lyrakaelin@gmail.com`**
2. **Server-Side Enforcement:**
   * The database trigger (`handle_new_user`) automatically detects `lyrakaelin@gmail.com` and assigns the `owner` role.
   * `server.ts` checks `process.env.OWNER_EMAIL`. If any API request attempts an Owner operation, the server cross-verifies:
     ```ts
     if (user.email !== process.env.OWNER_EMAIL || profile.role !== 'owner') {
       return res.status(403).json({ error: 'Forbidden: Owner privileges required.' });
     }
     ```
3. **Role Promotion Protocol:**
   * An Owner Admin panel allows the Owner (and only the Owner) to promote an existing user to `admin` or `instructor`.
   * Standard users, instructors, and even other admins cannot promote anyone to `owner`.

---

## 6. Environment Variables (Render & Local)

### Render (Backend & Deployment) Environment Variables:
```env
PORT=3000
NODE_ENV=production
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1...
OWNER_EMAIL=lyrakaelin@gmail.com
```

### Local Development (`.env`):
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1...
OWNER_EMAIL=lyrakaelin@gmail.com
```

> [!NOTE]
> `SUPABASE_SERVICE_ROLE_KEY` will only ever be read by `server.ts` and will never have a `VITE_` prefix, preventing Vite from bundling it into client JavaScript.

---

## 7. Existing Files That Must Be Modified

| File | Exact Changes |
| :--- | :--- |
| `src/types/index.ts` | Expand `UserRole` to `'owner' \| 'admin' \| 'instructor' \| 'student'`. Add `owner` capabilities. |
| `src/views/ProfileView.tsx` | Remove the **"Switch Role (Demo Mode)"** section completely. Display role as a read-only verified badge. |
| `src/components/navigation/Header.tsx` | Remove the role switcher button in the top navigation bar. |
| `src/components/modals/AuthModal.tsx` | Remove the Role dropdown (`Admin` / `Instructor`) from registration. Registration is strictly Student. |
| `src/context/AppContext.tsx` | Remove `switchRole()`. Integrate Supabase Auth and token session management. |
| `server.ts` | Remove substring-based role logic (`email.includes('admin')`). Add Supabase JWT verification and RBAC route middlewares. Seed courses into database or serve persistent courses via Supabase. |
| `package.json` | Add `@supabase/supabase-js`. |

---

## 8. Safe Migration & Rollback Plan

### Safe Migration Order:
1. **Local Schema Setup**: Execute the PostgreSQL DDL in Supabase SQL Editor.
2. **Backward-Compatible Backend**: Update `server.ts` to support both Supabase Auth tokens and fallback mock authentication (if credentials are not yet set in environment), ensuring zero downtime or dev-server crashes.
3. **Frontend UI Cleanup**: Remove all role switcher buttons and public admin registration fields.
4. **Owner Verification Test**: Log in with `lyrakaelin@gmail.com` to confirm owner role assignment and access to protected controls.
5. **Role Boundary Test**: Register a test account (`test-student@example.com`), verify it cannot access admin tools or alter courses.

### Rollback Plan:
* If Supabase credentials are misconfigured or unreachable:
  * The backend gracefully logs a warning and prevents unauthorized escalation.
  * The frontend gracefully displays connection status rather than crashing.
  * Git commit snapshot will allow immediate one-click revert to the previous release commit if needed.

---

## Ready for Approval

When you approve this implementation plan, the changes will be executed step-by-step according to this exact specification.
