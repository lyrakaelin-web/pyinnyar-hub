export type UserRole = 'owner' | 'admin' | 'instructor' | 'student';

export type Language = 'en' | 'my';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  bio?: string;
  learningPreferences: {
    language: Language;
    weeklyGoalHours: number;
    preferredCategories: number[]; // category IDs (1-30)
    notificationsEnabled: boolean;
  };
  enrolledCourseIds: string[];
  completedCourseIds: string[];
  savedCourseIds: string[];
  createdAt: string;
}

export interface Category {
  id: number;
  number: number;
  name: string;
  nameMy: string;
  description: string;
  descriptionMy: string;
  iconName: string;
  subcategories: string[];
  hasActiveCourses: boolean;
}

export interface Lesson {
  id: string;
  title: string;
  titleMy: string;
  duration: string;
  durationSeconds: number;
  videoUrl: string; // real video stream or sample educational video
  summary: string;
  summaryMy: string;
  pdfUrl?: string;
  notesMarkdown?: string;
  downloadableFiles?: { name: string; size: string; type: string }[];
}

export interface Module {
  id: string;
  title: string;
  titleMy: string;
  lessons: Lesson[];
}

export type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer';

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  question: string;
  questionMy: string;
  options?: string[]; // for multiple choice
  correctAnswer: string | number; // index or string
  explanation: string;
  explanationMy: string;
}

export interface Quiz {
  id: string;
  title: string;
  titleMy: string;
  passingScore: number;
  timeLimitMinutes: number;
  questions: QuizQuestion[];
}

export interface Assignment {
  id: string;
  title: string;
  titleMy: string;
  description: string;
  descriptionMy: string;
  rubric: string[];
  points: number;
}

export type CourseType = 'free' | 'paid' | 'certificate';

export interface Course {
  id: string;
  title: string;
  titleMy: string;
  categoryId: number;
  subcategory: string;
  slug: string;
  description: string;
  descriptionMy: string;
  instructor: {
    id: string;
    name: string;
    title: string;
    avatar: string;
    bio: string;
  };
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  type: CourseType;
  priceMMK: number;
  priceUSD: number;
  rating: number;
  reviewCount: number;
  thumbnail: string;
  objectives: string[];
  objectivesMy: string[];
  modules: Module[];
  quizzes: Quiz[];
  assignments: Assignment[];
  isFeatured?: boolean;
  isPopular?: boolean;
  isNew?: boolean;
  status: 'active' | 'coming_soon';
}

export type PaymentStatus = 'approved' | 'pending_verification' | 'rejected' | 'free';

export interface PaymentHistoryRecord {
  status: PaymentStatus;
  changedBy: string;
  changedAt: string;
  note?: string;
}

export interface Enrollment {
  id: string;
  studentId: string;
  courseId: string;
  enrolledAt: string;
  progressPercent: number; // 0 - 100
  lastAccessedLessonId?: string;
  lastAccessedTimeSeconds?: number;
  completedLessonIds: string[];
  paymentStatus: PaymentStatus;
  paymentMethod?: 'kpay' | 'wave' | 'ayapay' | 'bank_transfer' | 'none';
  transactionSlip?: string;
  transactionRef?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  refundRequested?: boolean;
  refundReason?: string;
  refundStatus?: 'none' | 'requested' | 'processed' | 'declined';
  history?: PaymentHistoryRecord[];
}

export interface QuizAttempt {
  id: string;
  studentId: string;
  courseId: string;
  quizId: string;
  score: number;
  totalQuestions: number;
  passed: boolean;
  answers: Record<string, string | number>;
  attemptedAt: string;
}

export interface AssignmentSubmission {
  id: string;
  studentId: string;
  courseId: string;
  assignmentId: string;
  submissionText: string;
  attachedFile?: string;
  submittedAt: string;
  status: 'pending_review' | 'graded';
  gradeScore?: number;
  feedback?: string;
}

export interface Certificate {
  id: string;
  certificateCode: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseTitle: string;
  courseTitleMy: string;
  instructorName: string;
  completionDate: string;
  verificationHash: string;
  gradeAchieved: string;
  approvedByAdmin: boolean;
}

export interface Opportunity {
  id: string;
  title: string;
  titleMy: string;
  organization: string;
  type: 'scholarship' | 'international_edu' | 'internship' | 'remote_job' | 'freelance' | 'volunteering';
  location: string;
  deadline: string;
  stipendOrSalary: string;
  description: string;
  descriptionMy: string;
  eligibility: string[];
  eligibilityMy: string[];
  applyUrl: string;
  publishedBy: string;
  createdAt: string;
}

export interface CommunityReply {
  id: string;
  authorName: string;
  authorRole: UserRole;
  content: string;
  createdAt: string;
}

export interface CommunityPost {
  id: string;
  title: string;
  content: string;
  category: string;
  authorName: string;
  authorRole: UserRole;
  authorAvatar?: string;
  createdAt: string;
  likes: number;
  replies: CommunityReply[];
  isFlagged?: boolean;
}

export interface Announcement {
  id: string;
  title: string;
  titleMy: string;
  content: string;
  contentMy: string;
  date: string;
  type: 'news' | 'academic' | 'event' | 'maintenance';
}
