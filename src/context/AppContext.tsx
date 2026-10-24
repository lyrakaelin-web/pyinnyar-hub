import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  UserRole,
  Language,
  Course,
  Category,
  Enrollment,
  QuizAttempt,
  Certificate,
  Opportunity,
  CommunityPost,
  Announcement,
} from '../types';
import {
  INITIAL_USER,
  INSTRUCTOR_USER,
  ADMIN_USER,
  CATEGORIES,
  COURSES,
  OPPORTUNITIES,
  COMMUNITY_POSTS,
  ANNOUNCEMENTS,
} from '../data/mockData';

export type ViewType =
  | 'home'
  | 'explore'
  | 'mylearning'
  | 'community'
  | 'opportunities'
  | 'profile'
  | 'course_details'
  | 'learning_room'
  | 'admin'
  | 'certificate_view'
  | 'verify';

interface AppContextType {
  user: User;
  language: Language;
  currentView: ViewType;
  selectedCourseId: string | null;
  selectedCategoryId: number | null;
  selectedLessonId: string | null;
  selectedCertificateId: string | null;
  searchQuery: string;
  courses: Course[];
  categories: Category[];
  enrollments: Record<string, Enrollment>;
  quizAttempts: QuizAttempt[];
  certificates: Certificate[];
  opportunities: Opportunity[];
  communityPosts: CommunityPost[];
  announcements: Announcement[];
  isAiAssistantOpen: boolean;
  isAuthModalOpen: boolean;
  authMode: 'login' | 'register' | 'forgot_password';
  isPaymentModalOpen: boolean;
  pendingPaymentCourseId: string | null;

  // Actions
  setLanguage: (lang: Language) => void;
  setCurrentView: (view: ViewType) => void;
  switchRole: (role: UserRole) => void;
  selectCourse: (courseId: string) => void;
  selectCategory: (categoryId: number | null) => void;
  selectLesson: (lessonId: string) => void;
  selectCertificate: (certId: string) => void;
  setSearchQuery: (query: string) => void;
  openAiAssistant: (open?: boolean) => void;
  openAuthModal: (open?: boolean, mode?: 'login' | 'register' | 'forgot_password') => void;
  openPaymentModal: (courseId?: string | null) => void;

  // Business logic
  enrollInCourse: (courseId: string, paymentMethod?: any, slipRef?: string) => void;
  verifyPaymentAdmin: (enrollmentId: string) => void;
  updateLessonProgress: (courseId: string, lessonId: string, timeSeconds: number) => void;
  markLessonComplete: (courseId: string, lessonId: string) => void;
  recordQuizAttempt: (attempt: Omit<QuizAttempt, 'id' | 'attemptedAt'>) => void;
  claimCertificate: (courseId: string) => Certificate;
  saveCourseToggle: (courseId: string) => void;
  addCommunityPost: (title: string, content: string, category: string) => void;
  addCommunityReply: (postId: string, content: string) => void;
  flagPost: (postId: string) => void;
  addOrUpdateCourse: (courseData: Partial<Course>) => void;
  deleteCourse: (courseId: string) => void;
  toggleCategoryStatus: (categoryId: number) => void;
  addOpportunity: (opp: Omit<Opportunity, 'id' | 'createdAt'>) => void;
  updateUserProfile: (updates: Partial<User>) => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load or initialize state from LocalStorage
  const [user, setUser] = useState<User>(() => {
    const saved = localStorage.getItem('ph_user');
    return saved ? JSON.parse(saved) : INITIAL_USER;
  });

  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('ph_lang');
    return (saved as Language) || 'en';
  });

  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [selectedCertificateId, setSelectedCertificateId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [courses, setCourses] = useState<Course[]>(() => {
    const saved = localStorage.getItem('ph_courses');
    return saved ? JSON.parse(saved) : COURSES;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('ph_categories');
    return saved ? JSON.parse(saved) : CATEGORIES;
  });

  const [enrollments, setEnrollments] = useState<Record<string, Enrollment>>(() => {
    const saved = localStorage.getItem('ph_enrollments');
    if (saved) return JSON.parse(saved);
    // Seed initial enrollment for student
    return {
      course_tech_01: {
        id: 'enr_01',
        studentId: INITIAL_USER.id,
        courseId: 'course_tech_01',
        enrolledAt: '2026-02-01T10:00:00Z',
        progressPercent: 45,
        lastAccessedLessonId: 'les_1_1',
        lastAccessedTimeSeconds: 420,
        completedLessonIds: ['les_1_1'],
        paymentStatus: 'approved',
      },
      course_biz_01: {
        id: 'enr_02',
        studentId: INITIAL_USER.id,
        courseId: 'course_biz_01',
        enrolledAt: '2026-02-12T10:00:00Z',
        progressPercent: 15,
        lastAccessedLessonId: 'les_biz_1_1',
        lastAccessedTimeSeconds: 120,
        completedLessonIds: [],
        paymentStatus: 'approved',
      },
    };
  });

  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>(() => {
    const saved = localStorage.getItem('ph_quiz_attempts');
    return saved ? JSON.parse(saved) : [];
  });

  const [certificates, setCertificates] = useState<Certificate[]>(() => {
    const saved = localStorage.getItem('ph_certificates');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'cert_seed_01',
        certificateCode: 'PH-2026-CERT-8842',
        studentId: INITIAL_USER.id,
        studentName: INITIAL_USER.name,
        courseId: 'course_lang_01',
        courseTitle: 'Professional English Communication & Academic Writing',
        courseTitleMy: 'လုပ်ငန်းခွင်နှင့် ပညာသင်ဆုများအတွက် အင်္ဂလိပ်စာ အဆင့်မြင့် ရေးသားပြောဆိုခြင်း',
        instructorName: 'Sarah Mitchell, MA',
        completionDate: 'February 14, 2026',
        verificationHash: '8f7a93c4e12d',
        gradeAchieved: 'High Distinction (96%)',
        approvedByAdmin: true,
      },
    ];
  });

  const [opportunities, setOpportunities] = useState<Opportunity[]>(() => {
    const saved = localStorage.getItem('ph_opportunities');
    return saved ? JSON.parse(saved) : OPPORTUNITIES;
  });

  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>(() => {
    const saved = localStorage.getItem('ph_community_posts');
    return saved ? JSON.parse(saved) : COMMUNITY_POSTS;
  });

  const [announcements] = useState<Announcement[]>(ANNOUNCEMENTS);

  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot_password'>('login');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [pendingPaymentCourseId, setPendingPaymentCourseId] = useState<string | null>(null);

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem('ph_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('ph_lang', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('ph_courses', JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem('ph_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('ph_enrollments', JSON.stringify(enrollments));
  }, [enrollments]);

  useEffect(() => {
    localStorage.setItem('ph_quiz_attempts', JSON.stringify(quizAttempts));
  }, [quizAttempts]);

  useEffect(() => {
    localStorage.setItem('ph_certificates', JSON.stringify(certificates));
  }, [certificates]);

  useEffect(() => {
    localStorage.setItem('ph_opportunities', JSON.stringify(opportunities));
  }, [opportunities]);

  useEffect(() => {
    localStorage.setItem('ph_community_posts', JSON.stringify(communityPosts));
  }, [communityPosts]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    setUser((prev) => ({
      ...prev,
      learningPreferences: { ...prev.learningPreferences, language: lang },
    }));
  };

  const switchRole = (newRole: UserRole) => {
    if (newRole === 'admin') {
      setUser(ADMIN_USER);
      setCurrentView('admin');
    } else if (newRole === 'instructor') {
      setUser(INSTRUCTOR_USER);
      setCurrentView('admin');
    } else {
      setUser(INITIAL_USER);
      setCurrentView('home');
    }
  };

  const selectCourse = (courseId: string) => {
    setSelectedCourseId(courseId);
    setCurrentView('course_details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const selectCategory = (categoryId: number | null) => {
    setSelectedCategoryId(categoryId);
    setCurrentView('explore');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const selectLesson = (lessonId: string) => {
    setSelectedLessonId(lessonId);
    setCurrentView('learning_room');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const selectCertificate = (certId: string) => {
    setSelectedCertificateId(certId);
    setCurrentView('certificate_view');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openAiAssistant = (open = true) => setIsAiAssistantOpen(open);

  const openAuthModal = (open = true, mode = 'login') => {
    setAuthMode(mode as any);
    setIsAuthModalOpen(open);
  };

  const openPaymentModal = (courseId: string | null = null) => {
    setPendingPaymentCourseId(courseId);
    setIsPaymentModalOpen(!!courseId);
  };

  const enrollInCourse = (
    courseId: string,
    paymentMethod: 'kpay' | 'wave' | 'ayapay' | 'bank_transfer' | 'none' = 'none',
    slipRef = ''
  ) => {
    const course = courses.find((c) => c.id === courseId);
    const isFree = !course || course.priceMMK === 0;

    const newEnrollment: Enrollment = {
      id: `enr_${Date.now()}`,
      studentId: user.id,
      courseId,
      enrolledAt: new Date().toISOString(),
      progressPercent: 0,
      completedLessonIds: [],
      paymentStatus: isFree ? 'free' : 'approved', // instant unlock in demo mode
      paymentMethod,
      transactionRef: slipRef || `REF-${Math.floor(100000 + Math.random() * 900000)}`,
    };

    setEnrollments((prev) => ({ ...prev, [courseId]: newEnrollment }));
    setUser((prev) => ({
      ...prev,
      enrolledCourseIds: Array.from(new Set([...prev.enrolledCourseIds, courseId])),
    }));

    setIsPaymentModalOpen(false);
    setPendingPaymentCourseId(null);
    setSelectedCourseId(courseId);
    setCurrentView('course_details');
  };

  const verifyPaymentAdmin = (enrollmentId: string) => {
    setEnrollments((prev) => {
      const updated = { ...prev };
      for (const key in updated) {
        if (updated[key].id === enrollmentId) {
          updated[key].paymentStatus = 'approved';
        }
      }
      return updated;
    });
  };

  const updateLessonProgress = (courseId: string, lessonId: string, timeSeconds: number) => {
    setEnrollments((prev) => {
      const existing = prev[courseId];
      if (!existing) return prev;
      return {
        ...prev,
        [courseId]: {
          ...existing,
          lastAccessedLessonId: lessonId,
          lastAccessedTimeSeconds: timeSeconds,
        },
      };
    });
  };

  const markLessonComplete = (courseId: string, lessonId: string) => {
    const course = courses.find((c) => c.id === courseId);
    setEnrollments((prev) => {
      const existing = prev[courseId];
      if (!existing) return prev;

      const completed = Array.from(new Set([...existing.completedLessonIds, lessonId]));
      // Calculate total lessons in course
      let totalLessons = 0;
      course?.modules.forEach((m) => {
        totalLessons += m.lessons.length;
      });
      if (totalLessons === 0) totalLessons = 1;

      const progress = Math.min(100, Math.round((completed.length / totalLessons) * 100));

      return {
        ...prev,
        [courseId]: {
          ...existing,
          completedLessonIds: completed,
          progressPercent: progress,
        },
      };
    });
  };

  const recordQuizAttempt = (attempt: Omit<QuizAttempt, 'id' | 'attemptedAt'>) => {
    const newAttempt: QuizAttempt = {
      ...attempt,
      id: `qa_${Date.now()}`,
      attemptedAt: new Date().toISOString(),
    };
    setQuizAttempts((prev) => [newAttempt, ...prev]);
  };

  const claimCertificate = (courseId: string): Certificate => {
    const course = courses.find((c) => c.id === courseId);
    const existing = certificates.find((c) => c.courseId === courseId && c.studentId === user.id);
    if (existing) return existing;

    const certCode = `PH-2026-CERT-${Math.floor(1000 + Math.random() * 9000)}`;
    const newCert: Certificate = {
      id: `cert_${Date.now()}`,
      certificateCode: certCode,
      studentId: user.id,
      studentName: user.name,
      courseId,
      courseTitle: course?.title || 'Professional Course Program',
      courseTitleMy: course?.titleMy || 'ပရော်ဖက်ရှင်နယ် သင်တန်းဆင်းလက်မှတ်',
      instructorName: course?.instructor.name || 'PYINNYAR HUB Academic Faculty',
      completionDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      verificationHash: Math.random().toString(36).substring(2, 12),
      gradeAchieved: 'Distinction (92%)',
      approvedByAdmin: true,
    };

    setCertificates((prev) => [newCert, ...prev]);
    setUser((prev) => ({
      ...prev,
      completedCourseIds: Array.from(new Set([...prev.completedCourseIds, courseId])),
    }));

    return newCert;
  };

  const saveCourseToggle = (courseId: string) => {
    setUser((prev) => {
      const isSaved = prev.savedCourseIds.includes(courseId);
      const nextSaved = isSaved
        ? prev.savedCourseIds.filter((id) => id !== courseId)
        : [...prev.savedCourseIds, courseId];
      return { ...prev, savedCourseIds: nextSaved };
    });
  };

  const addCommunityPost = (title: string, content: string, category: string) => {
    const newPost: CommunityPost = {
      id: `post_${Date.now()}`,
      title,
      content,
      category,
      authorName: user.name,
      authorRole: user.role,
      authorAvatar: user.avatar,
      createdAt: 'Just now',
      likes: 0,
      replies: [],
    };
    setCommunityPosts((prev) => [newPost, ...prev]);
  };

  const addCommunityReply = (postId: string, content: string) => {
    setCommunityPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            replies: [
              ...post.replies,
              {
                id: `rep_${Date.now()}`,
                authorName: user.name,
                authorRole: user.role,
                content,
                createdAt: 'Just now',
              },
            ],
          };
        }
        return post;
      })
    );
  };

  const flagPost = (postId: string) => {
    setCommunityPosts((prev) =>
      prev.map((post) => (post.id === postId ? { ...post, isFlagged: true } : post))
    );
  };

  const addOrUpdateCourse = (courseData: Partial<Course>) => {
    if (courseData.id) {
      setCourses((prev) =>
        prev.map((c) => (c.id === courseData.id ? ({ ...c, ...courseData } as Course) : c))
      );
    } else {
      const newCourse: Course = {
        id: `course_${Date.now()}`,
        title: courseData.title || 'Untitled Course',
        titleMy: courseData.titleMy || '',
        categoryId: courseData.categoryId || 1,
        subcategory: courseData.subcategory || 'General',
        slug: (courseData.title || 'course').toLowerCase().replace(/\s+/g, '-'),
        description: courseData.description || '',
        descriptionMy: courseData.descriptionMy || '',
        instructor: {
          id: user.id,
          name: user.name,
          title: 'Course Instructor',
          avatar: user.avatar,
          bio: user.bio || '',
        },
        duration: courseData.duration || '4 weeks',
        level: courseData.level || 'Beginner',
        type: courseData.type || 'free',
        priceMMK: courseData.priceMMK || 0,
        priceUSD: courseData.priceUSD || 0,
        rating: 5.0,
        reviewCount: 1,
        thumbnail: courseData.thumbnail || '/src/assets/images/course_tech_coding_1792822969446.jpg',
        objectives: courseData.objectives || ['Master fundamental concepts'],
        objectivesMy: courseData.objectivesMy || [],
        modules: courseData.modules || [],
        quizzes: courseData.quizzes || [],
        assignments: courseData.assignments || [],
        status: 'active',
      };
      setCourses((prev) => [newCourse, ...prev]);
    }
  };

  const deleteCourse = (courseId: string) => {
    setCourses((prev) => prev.filter((c) => c.id !== courseId));
  };

  const toggleCategoryStatus = (categoryId: number) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId ? { ...cat, hasActiveCourses: !cat.hasActiveCourses } : cat
      )
    );
  };

  const addOpportunity = (oppData: Omit<Opportunity, 'id' | 'createdAt'>) => {
    const newOpp: Opportunity = {
      ...oppData,
      id: `opp_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setOpportunities((prev) => [newOpp, ...prev]);
  };

  const updateUserProfile = (updates: Partial<User>) => {
    setUser((prev) => ({ ...prev, ...updates }));
  };

  const logout = () => {
    setUser(INITIAL_USER);
    setCurrentView('home');
  };

  return (
    <AppContext.Provider
      value={{
        user,
        language,
        currentView,
        selectedCourseId,
        selectedCategoryId,
        selectedLessonId,
        selectedCertificateId,
        searchQuery,
        courses,
        categories,
        enrollments,
        quizAttempts,
        certificates,
        opportunities,
        communityPosts,
        announcements,
        isAiAssistantOpen,
        isAuthModalOpen,
        authMode,
        isPaymentModalOpen,
        pendingPaymentCourseId,
        setLanguage,
        setCurrentView,
        switchRole,
        selectCourse,
        selectCategory,
        selectLesson,
        selectCertificate,
        setSearchQuery,
        openAiAssistant,
        openAuthModal,
        openPaymentModal,
        enrollInCourse,
        verifyPaymentAdmin,
        updateLessonProgress,
        markLessonComplete,
        recordQuizAttempt,
        claimCertificate,
        saveCourseToggle,
        addCommunityPost,
        addCommunityReply,
        flagPost,
        addOrUpdateCourse,
        deleteCourse,
        toggleCategoryStatus,
        addOpportunity,
        updateUserProfile,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
