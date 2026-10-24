import React from 'react';
import { useApp } from '../context/AppContext';
import { t } from '../utils/translations';
import {
  ArrowLeft,
  Clock,
  BookOpen,
  Award,
  Star,
  CheckCircle2,
  FileText,
  Play,
  Lock,
  Download,
  Share2,
  Bookmark,
  ShieldCheck,
} from 'lucide-react';

export const CourseDetailsView: React.FC = () => {
  const {
    selectedCourseId,
    courses,
    enrollments,
    language,
    setCurrentView,
    selectLesson,
    openPaymentModal,
    enrollInCourse,
    saveCourseToggle,
    user,
  } = useApp();

  const course = courses.find((c) => c.id === selectedCourseId) || courses[0];
  const isEnrolled = !!enrollments[course.id];
  const enrollment = enrollments[course.id];
  const isSaved = user.savedCourseIds.includes(course.id);

  const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);

  const handleEnrollClick = () => {
    if (course.priceMMK === 0) {
      enrollInCourse(course.id, 'none');
    } else {
      openPaymentModal(course.id);
    }
  };

  const handleStartOrResume = () => {
    const firstLessonId = course.modules[0]?.lessons[0]?.id || 'les_1_1';
    const targetLessonId = enrollment?.lastAccessedLessonId || firstLessonId;
    selectLesson(targetLessonId);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Back button navigation */}
      <button
        onClick={() => setCurrentView('explore')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-[#14243A] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{language === 'my' ? 'သင်ရိုးများသို့ ပြန်သွားမည်' : 'Back to Courses'}</span>
      </button>

      {/* Main Course Header Hero Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
        {/* Left 2 Cols: Main Info */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 text-xs text-stone-500 font-medium">
            <span>{course.subcategory}</span>
            <span aria-hidden="true">·</span>
            <span>{course.level}</span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1 text-[#14243A]">
              <Star className="w-3.5 h-3.5 fill-[#C7A66A] text-[#C7A66A]" />
              <span className="font-semibold tabular-nums">{course.rating}</span>
              <span className="text-stone-400">({course.reviewCount} reviews)</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#14243A] leading-tight">
            {language === 'my' && course.titleMy ? course.titleMy : course.title}
          </h1>

          <p className="text-sm sm:text-base text-stone-700 leading-relaxed">
            {language === 'my' && course.descriptionMy ? course.descriptionMy : course.description}
          </p>

          {/* Instructor Bio Box */}
          <div className="p-4 rounded-xl bg-white border border-stone-200/90 flex items-center gap-3.5">
            <img
              src={course.instructor.avatar}
              alt={course.instructor.name}
              referrerPolicy="no-referrer"
              className="w-12 h-12 rounded-full object-cover shrink-0 ring-1 ring-stone-200"
            />
            <div>
              <div className="text-[11px] font-semibold text-[#A9874B] uppercase tracking-wider">
                Instructor
              </div>
              <h3 className="font-bold text-sm text-[#14243A]">{course.instructor.name}</h3>
              <p className="text-xs text-stone-600">{course.instructor.title}</p>
              <p className="text-xs text-stone-500 mt-1 line-clamp-2">{course.instructor.bio}</p>
            </div>
          </div>
        </div>

        {/* Right Col: Course Pricing & Enrollment Action Card */}
        <div className="bg-white rounded-2xl border border-stone-200/90 overflow-hidden shadow-sm p-5 space-y-4 lg:sticky lg:top-20">
          <div className="aspect-video w-full rounded-xl overflow-hidden bg-stone-100 relative">
            <img
              src={course.thumbnail}
              alt={course.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>

          <div>
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-2xl font-black text-[#14243A] tabular-nums">
                  {course.priceMMK === 0
                    ? (language === 'my' ? 'အခမဲ့' : 'Free')
                    : `${course.priceMMK.toLocaleString()} MMK`}
                </span>
                {course.priceUSD > 0 && (
                  <span className="text-xs text-stone-500 ml-2">(${course.priceUSD} USD)</span>
                )}
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-stone-100 text-stone-700">
                {course.type.toUpperCase()}
              </span>
            </div>
            <p className="text-[11px] text-stone-500 mt-1">
              {course.priceMMK === 0
                ? 'Full open access with completion certificate'
                : 'One-time enrollment. Lifetime access to materials & verified certificate.'}
            </p>
          </div>

          {/* Action Button */}
          {isEnrolled ? (
            <div className="space-y-2">
              <button
                onClick={handleStartOrResume}
                className="w-full py-3 rounded-xl bg-[#14243A] text-white hover:bg-[#1E3452] font-bold text-sm flex items-center justify-center gap-2 transition-transform active:scale-98 shadow-sm"
              >
                <Play className="w-4 h-4 fill-current text-[#C7A66A]" />
                <span>
                  {enrollment?.progressPercent && enrollment.progressPercent > 0
                    ? (language === 'my' ? 'ဆက်လက်လေ့လာမည်' : 'Resume Learning')
                    : (language === 'my' ? 'စတင်လေ့လာမည်' : 'Start First Lesson')}
                </span>
              </button>
              <div className="text-center text-xs text-stone-500">
                Enrolled · {enrollment?.progressPercent || 0}% Completed
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <button
                onClick={handleEnrollClick}
                className="w-full py-3 rounded-xl bg-[#14243A] text-white hover:bg-[#1E3452] font-bold text-sm flex items-center justify-center gap-2 transition-transform active:scale-98 shadow-sm"
              >
                <span>{t('course.enroll_now', language)}</span>
              </button>
              <button
                onClick={() => saveCourseToggle(course.id)}
                className="w-full py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current text-[#C7A66A]' : ''}`} />
                <span>{isSaved ? 'Saved in Wishlist' : 'Save for Later'}</span>
              </button>
            </div>
          )}

          {/* Course Features Checklist */}
          <div className="pt-3 border-t border-stone-100 space-y-2 text-xs text-stone-600">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#A9874B] shrink-0" />
              <span>{course.duration}</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#A9874B] shrink-0" />
              <span>{totalLessons > 0 ? `${totalLessons} Video Lectures & Notes` : 'Comprehensive Modules'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-[#A9874B] shrink-0" />
              <span>PYINNYAR HUB Digital Certificate upon completion</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#A9874B] shrink-0" />
              <span>Verified Instructor Q&A Support</span>
            </div>
          </div>
        </div>
      </div>

      {/* Course Objectives */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-6 shadow-xs space-y-4">
        <h2 className="text-lg font-bold text-[#14243A]">
          {t('course.objectives', language)}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(language === 'my' && course.objectivesMy && course.objectivesMy.length > 0
            ? course.objectivesMy
            : course.objectives
          ).map((obj, i) => (
            <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-stone-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{obj}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Course Syllabus / Modules */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#14243A]">
            {t('course.syllabus', language)}
          </h2>
          <span className="text-xs text-stone-500 font-medium">
            {course.modules.length} Modules · {totalLessons} Lessons
          </span>
        </div>

        {course.modules.length > 0 ? (
          <div className="space-y-4">
            {course.modules.map((mod, modIdx) => (
              <div key={mod.id} className="border border-stone-200 rounded-xl overflow-hidden">
                <div className="bg-stone-50 px-4 py-3 border-b border-stone-200 flex items-center justify-between">
                  <h3 className="font-bold text-xs sm:text-sm text-[#14243A]">
                    {language === 'my' && mod.titleMy ? mod.titleMy : mod.title}
                  </h3>
                  <span className="text-xs text-stone-500">{mod.lessons.length} lessons</span>
                </div>

                <div className="divide-y divide-stone-100">
                  {mod.lessons.map((lesson) => {
                    const isLessonDone = enrollment?.completedLessonIds?.includes(lesson.id);
                    return (
                      <div
                        key={lesson.id}
                        onClick={() => {
                          if (isEnrolled) selectLesson(lesson.id);
                        }}
                        className={`p-3.5 flex items-center justify-between gap-3 transition-colors ${
                          isEnrolled ? 'hover:bg-stone-50 cursor-pointer' : 'opacity-90'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {isLessonDone ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : isEnrolled ? (
                            <Play className="w-4 h-4 text-[#C7A66A] shrink-0" />
                          ) : (
                            <Lock className="w-4 h-4 text-stone-400 shrink-0" />
                          )}
                          <div className="truncate">
                            <span className="text-xs font-medium text-[#14243A] block truncate">
                              {language === 'my' && lesson.titleMy ? lesson.titleMy : lesson.title}
                            </span>
                            <span className="text-[11px] text-stone-500">{lesson.duration}</span>
                          </div>
                        </div>

                        {isEnrolled && (
                          <span className="text-xs font-semibold text-[#14243A] shrink-0">
                            {isLessonDone ? 'Review' : 'Play'}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-stone-500 italic">
            Full lecture syllabus and downloadable resources are unlocked immediately upon enrollment.
          </p>
        )}
      </div>
    </div>
  );
};
