import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { t } from '../utils/translations';
import { CourseCard } from '../components/courses/CourseCard';
import {
  BookOpen,
  Award,
  Clock,
  Flame,
  CheckCircle2,
  Calendar,
  Bookmark,
  TrendingUp,
  FileCheck,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

export const MyLearningView: React.FC = () => {
  const {
    user,
    courses,
    enrollments,
    certificates,
    quizAttempts,
    language,
    selectCourse,
    selectCertificate,
    updateUserProfile,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'enrolled' | 'completed' | 'saved' | 'certificates' | 'quizzes'>('enrolled');

  // Enrolled courses
  const enrolledCourses = user.enrolledCourseIds
    .map((id) => courses.find((c) => c.id === id))
    .filter(Boolean) as any[];

  // Completed courses
  const completedCourses = user.completedCourseIds
    .map((id) => courses.find((c) => c.id === id))
    .filter(Boolean) as any[];

  // Saved courses
  const savedCourses = user.savedCourseIds
    .map((id) => courses.find((c) => c.id === id))
    .filter(Boolean) as any[];

  // Metrics
  const totalCompletedLessons = Object.values(enrollments).reduce(
    (acc, enr) => acc + (enr.completedLessonIds?.length || 0),
    0
  );
  const estimatedHoursLearned = (totalCompletedLessons * 0.4 + 4.5).toFixed(1);

  return (
    <div className="space-y-6 pb-20">
      {/* Top Welcome & Learning Target Card */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={user.avatar}
              alt={user.name}
              referrerPolicy="no-referrer"
              className="w-14 h-14 rounded-full object-cover ring-2 ring-[#C7A66A]/60"
            />
            <div>
              <div className="text-xs font-semibold text-[#A9874B] uppercase tracking-wider">
                {t('home.welcome', language)}
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#14243A]">{user.name}</h1>
              <p className="text-xs text-stone-500 mt-0.5">{user.email}</p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-3 border-t md:border-t-0 md:border-l border-stone-100 pt-4 md:pt-0 md:pl-6">
            <div className="text-center md:text-left">
              <span className="text-xs text-stone-500 flex items-center justify-center md:justify-start gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                Streak
              </span>
              <span className="font-extrabold text-lg text-[#14243A] tabular-nums">7 Days</span>
            </div>
            <div className="text-center md:text-left">
              <span className="text-xs text-stone-500 flex items-center justify-center md:justify-start gap-1">
                <Clock className="w-3.5 h-3.5 text-blue-500" />
                Hours
              </span>
              <span className="font-extrabold text-lg text-[#14243A] tabular-nums">
                {estimatedHoursLearned}h
              </span>
            </div>
            <div className="text-center md:text-left">
              <span className="text-xs text-stone-500 flex items-center justify-center md:justify-start gap-1">
                <Award className="w-3.5 h-3.5 text-[#C7A66A]" />
                Certs
              </span>
              <span className="font-extrabold text-lg text-[#14243A] tabular-nums">
                {certificates.length}
              </span>
            </div>
          </div>
        </div>

        {/* Weekly Goal Progress Bar */}
        <div className="mt-6 pt-5 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex-1 max-w-md">
            <div className="flex items-center justify-between font-medium mb-1">
              <span className="text-stone-700">
                {t('dash.learning_goals', language)} (Weekly Target: {user.learningPreferences.weeklyGoalHours} hrs)
              </span>
              <span className="font-bold text-[#14243A] tabular-nums">4.5 / {user.learningPreferences.weeklyGoalHours} hrs</span>
            </div>
            <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-[#C7A66A] h-full rounded-full"
                style={{ width: `${Math.min(100, (4.5 / user.learningPreferences.weeklyGoalHours) * 100)}%` }}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-stone-500">Adjust Target:</span>
            {[4, 6, 8, 12].map((hrs) => (
              <button
                key={hrs}
                onClick={() =>
                  updateUserProfile({
                    learningPreferences: { ...user.learningPreferences, weeklyGoalHours: hrs },
                  })
                }
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  user.learningPreferences.weeklyGoalHours === hrs
                    ? 'bg-[#14243A] text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {hrs}h
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Segmented Controls */}
      <div className="flex items-center gap-1.5 p-1 bg-stone-200/70 rounded-2xl overflow-x-auto text-xs shrink-0">
        <button
          onClick={() => setActiveTab('enrolled')}
          className={`px-4 py-2 rounded-xl font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'enrolled' ? 'bg-white text-[#14243A] shadow-xs font-bold' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>{t('dash.my_courses', language)} ({enrolledCourses.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`px-4 py-2 rounded-xl font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'completed' ? 'bg-white text-[#14243A] shadow-xs font-bold' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{t('dash.completed_courses', language)} ({completedCourses.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('certificates')}
          className={`px-4 py-2 rounded-xl font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'certificates' ? 'bg-white text-[#14243A] shadow-xs font-bold' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>{t('dash.earned_certificates', language)} ({certificates.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('quizzes')}
          className={`px-4 py-2 rounded-xl font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'quizzes' ? 'bg-white text-[#14243A] shadow-xs font-bold' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>{t('dash.quiz_results', language)} ({quizAttempts.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('saved')}
          className={`px-4 py-2 rounded-xl font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'saved' ? 'bg-white text-[#14243A] shadow-xs font-bold' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>{t('dash.saved_courses', language)} ({savedCourses.length})</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'enrolled' && (
        <div className="space-y-4">
          {enrolledCourses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {enrolledCourses.map((c) => (
                <CourseCard key={c.id} course={c} />
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-white rounded-2xl border border-stone-200 text-stone-500 text-sm">
              You have not enrolled in any courses yet. Browse the 30 categories to start learning!
            </div>
          )}
        </div>
      )}

      {activeTab === 'completed' && (
        <div className="space-y-4">
          {completedCourses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {completedCourses.map((c) => (
                <CourseCard key={c.id} course={c} />
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-white rounded-2xl border border-stone-200 text-stone-500 text-sm">
              No programs completed yet. Keep learning and completing lesson quizzes!
            </div>
          )}
        </div>
      )}

      {activeTab === 'certificates' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                onClick={() => selectCertificate(cert.id)}
                className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-xs hover:border-[#C7A66A] transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
                    <span className="font-mono font-bold text-[#A9874B]">{cert.certificateCode}</span>
                    <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                      Verified
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-[#14243A]">
                    {language === 'my' && cert.courseTitleMy ? cert.courseTitleMy : cert.courseTitle}
                  </h3>
                  <div className="mt-2 text-xs text-stone-600 space-y-0.5">
                    <p>Awarded to: <span className="font-semibold text-stone-900">{cert.studentName}</span></p>
                    <p>Date: {cert.completionDate}</p>
                    <p>Grade: <span className="text-[#14243A] font-semibold">{cert.gradeAchieved}</span></p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                  <span className="text-stone-400">Issuer: PYINNYAR HUB</span>
                  <span className="text-[#14243A] font-bold flex items-center gap-1 hover:underline">
                    View & Print
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'quizzes' && (
        <div className="bg-white rounded-2xl border border-stone-200/90 overflow-hidden shadow-xs">
          <div className="p-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
            <h3 className="font-bold text-xs uppercase tracking-wider text-stone-700">
              Quiz Examination History
            </h3>
            <span className="text-xs text-stone-500 font-mono">{quizAttempts.length} Attempts</span>
          </div>

          {quizAttempts.length > 0 ? (
            <div className="divide-y divide-stone-100">
              {quizAttempts.map((qa) => (
                <div key={qa.id} className="p-4 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-[#14243A] text-sm block">
                      Course Assessment #{qa.quizId}
                    </span>
                    <span className="text-stone-500">{new Date(qa.attemptedAt).toLocaleDateString()}</span>
                  </div>
                  <div className="text-right">
                    <span className={`font-bold text-sm tabular-nums block ${qa.passed ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {qa.score}%
                    </span>
                    <span className="text-stone-500">{qa.passed ? 'Passed' : 'Needs Review'}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-stone-500">
              No quizzes recorded yet. Take the interactive assessments inside course lectures!
            </div>
          )}
        </div>
      )}

      {activeTab === 'saved' && (
        <div className="space-y-4">
          {savedCourses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {savedCourses.map((c) => (
                <CourseCard key={c.id} course={c} />
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-white rounded-2xl border border-stone-200 text-stone-500 text-sm">
              Your saved wishlist is empty. Tap the bookmark icon on any course to save it here.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
