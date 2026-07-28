-- TEDUCA Database Setup Script
-- Run this in your Neon database to initialize Better Auth and TEDUCA tables

-- Better Auth Tables
CREATE TABLE IF NOT EXISTS "user" (
  id text PRIMARY KEY,
  name text,
  email text NOT NULL UNIQUE,
  emailVerified boolean NOT NULL DEFAULT false,
  image text,
  createdAt timestamp with time zone NOT NULL DEFAULT now(),
  updatedAt timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "session" (
  id text PRIMARY KEY,
  expiresAt timestamp with time zone NOT NULL,
  token text NOT NULL UNIQUE,
  createdAt timestamp with time zone NOT NULL DEFAULT now(),
  updatedAt timestamp with time zone NOT NULL DEFAULT now(),
  ipAddress text,
  userAgent text,
  userId text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "account" (
  id text PRIMARY KEY,
  accountId text NOT NULL,
  providerId text NOT NULL,
  userId text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  accessToken text,
  refreshToken text,
  idToken text,
  accessTokenExpiresAt timestamp with time zone,
  refreshTokenExpiresAt timestamp with time zone,
  scope text,
  password text,
  createdAt timestamp with time zone NOT NULL DEFAULT now(),
  updatedAt timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "verification" (
  id text PRIMARY KEY,
  identifier text NOT NULL,
  value text NOT NULL,
  expiresAt timestamp with time zone NOT NULL,
  createdAt timestamp with time zone DEFAULT now(),
  updatedAt timestamp with time zone DEFAULT now()
);

-- TEDUCA App Tables
CREATE TABLE IF NOT EXISTS "course" (
  id text PRIMARY KEY,
  teacherId text NOT NULL,
  title text NOT NULL,
  description text,
  slug text NOT NULL UNIQUE,
  image text,
  category varchar(50) NOT NULL DEFAULT 'general',
  level varchar(20) NOT NULL DEFAULT 'beginner',
  status varchar(20) NOT NULL DEFAULT 'draft',
  createdAt timestamp with time zone NOT NULL DEFAULT now(),
  updatedAt timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "enrollment" (
  id text PRIMARY KEY,
  studentId text NOT NULL,
  courseId text NOT NULL,
  progress integer NOT NULL DEFAULT 0,
  status varchar(20) NOT NULL DEFAULT 'active',
  enrolledAt timestamp with time zone NOT NULL DEFAULT now(),
  completedAt timestamp with time zone
);

CREATE TABLE IF NOT EXISTS "lesson" (
  id text PRIMARY KEY,
  courseId text NOT NULL,
  title text NOT NULL,
  description text,
  content text,
  videoUrl text,
  "order" integer NOT NULL,
  duration integer DEFAULT 0,
  createdAt timestamp with time zone NOT NULL DEFAULT now(),
  updatedAt timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "assignment" (
  id text PRIMARY KEY,
  courseId text NOT NULL,
  title text NOT NULL,
  description text,
  instructions text,
  dueDate timestamp with time zone,
  maxScore integer NOT NULL DEFAULT 100,
  createdAt timestamp with time zone NOT NULL DEFAULT now(),
  updatedAt timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "submission" (
  id text PRIMARY KEY,
  studentId text NOT NULL,
  assignmentId text NOT NULL,
  content text,
  fileUrl text,
  status varchar(20) NOT NULL DEFAULT 'pending',
  score integer,
  feedback text,
  submittedAt timestamp with time zone NOT NULL DEFAULT now(),
  gradedAt timestamp with time zone
);

CREATE TABLE IF NOT EXISTS "userRole" (
  id text PRIMARY KEY,
  userId text NOT NULL UNIQUE,
  role varchar(20) NOT NULL DEFAULT 'student',
  createdAt timestamp with time zone NOT NULL DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "course_teacherId_idx" ON "course"(teacherId);
CREATE INDEX IF NOT EXISTS "enrollment_studentId_idx" ON "enrollment"(studentId);
CREATE INDEX IF NOT EXISTS "enrollment_courseId_idx" ON "enrollment"(courseId);
CREATE INDEX IF NOT EXISTS "lesson_courseId_idx" ON "lesson"(courseId);
CREATE INDEX IF NOT EXISTS "assignment_courseId_idx" ON "assignment"(courseId);
CREATE INDEX IF NOT EXISTS "submission_studentId_idx" ON "submission"(studentId);
CREATE INDEX IF NOT EXISTS "submission_assignmentId_idx" ON "submission"(assignmentId);
CREATE INDEX IF NOT EXISTS "userRole_userId_idx" ON "userRole"(userId);
