import React from 'react';
import { Course } from '../../types';
import { useApp } from '../../context/AppContext';
import { t } from '../../utils/translations';
import { Star, Clock, Bookmark, ArrowRight, CheckCircle2 } from 'lucide-react';

interface CourseCardProps {
  course: Course;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const { language, selectCourse, user, enrollments, saveCourseToggle } = useApp();

  const isEnrolled = !!enrollments[course.id];
  const isSaved = user.savedCourseIds.includes(course.id);
  const enrollment = enrollments[course.id];

  return (
    <div className="group bg-white rounded-2xl border border-stone-200/90 overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col">
      {/* Thumbnail area */}
      <div className="relative aspect-video w-full overflow-hidden bg-stone-100">
        <img
          src={course.thumbnail}
          alt={course.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
          onError={(e) => {
            // Elegant CSS fallback
            (e.target as HTMLElement).style.display = 'none';
          }}
        />

        {/* Fallback pattern behind img */}
        <div className="absolute inset-0 -z-10 bg-linear-to-br from-[#14243A] to-[#1E3452] flex items-center justify-center text-white/40 p-4 text-center">
          <span className="text-xs font-semibold">{course.subcategory}</span>
        </div>

        {/* Save/Bookmark action */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            saveCourseToggle(course.id);
          }}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-colors backdrop-blur-xs ${
            isSaved
              ? 'bg-[#C7A66A] text-[#14243A]'
              : 'bg-black/40 text-white hover:bg-black/60'
          }`}
          title={isSaved ? 'Remove from saved' : 'Save course'}
        >
          <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
        </button>

        {/* Course Type tag */}
        <div className="absolute bottom-2.5 left-2.5">
          <span className="text-[11px] font-semibold tracking-wide text-white bg-[#14243A]/85 backdrop-blur-xs px-2 py-0.5 rounded-md">
            {course.type === 'free'
              ? (language === 'my' ? 'အခမဲ့' : 'Free')
              : course.type === 'certificate'
              ? (language === 'my' ? 'ကျွမ်းကျင်လက်မှတ်' : 'Certificate')
              : (language === 'my' ? 'အတိုသင်တန်း' : 'Short Course')}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Unboxed metadata row with typographic separators */}
          <div className="flex items-center gap-2 text-xs text-stone-500 font-medium mb-1.5 flex-wrap">
            <span>{course.subcategory}</span>
            <span aria-hidden="true">·</span>
            <span>{course.level}</span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1 text-[#14243A]">
              <Star className="w-3.5 h-3.5 fill-[#C7A66A] text-[#C7A66A]" />
              <span className="font-semibold tabular-nums">{course.rating}</span>
              <span className="text-stone-400">({course.reviewCount})</span>
            </span>
          </div>

          {/* Title */}
          <h3
            onClick={() => selectCourse(course.id)}
            className="font-bold text-[#14243A] text-base leading-snug line-clamp-2 hover:text-[#C7A66A] cursor-pointer transition-colors"
          >
            {language === 'my' && course.titleMy ? course.titleMy : course.title}
          </h3>

          {/* Description */}
          <p className="mt-2 text-xs sm:text-sm text-stone-600 line-clamp-2 leading-relaxed">
            {language === 'my' && course.descriptionMy ? course.descriptionMy : course.description}
          </p>

          {/* Enrolled progress bar if already studying */}
          {isEnrolled && enrollment && (
            <div className="mt-3.5 pt-3 border-t border-stone-100">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-stone-500 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  {language === 'my' ? 'တိုးတက်မှု' : 'Progress'}
                </span>
                <span className="font-bold text-[#14243A] tabular-nums">
                  {enrollment.progressPercent}%
                </span>
              </div>
              <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-[#C7A66A] h-full rounded-full transition-all duration-300"
                  style={{ width: `${enrollment.progressPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Card Footer: Instructor, Duration & Price / Action */}
        <div className="mt-4 pt-3.5 border-t border-stone-100 flex items-center justify-between gap-2">
          {/* Instructor & Duration */}
          <div className="flex items-center gap-2 min-w-0">
            <img
              src={course.instructor.avatar}
              alt={course.instructor.name}
              referrerPolicy="no-referrer"
              className="w-6 h-6 rounded-full object-cover shrink-0"
            />
            <div className="truncate text-xs">
              <span className="font-medium text-stone-700 truncate block">
                {course.instructor.name}
              </span>
            </div>
          </div>

          {/* Pricing or CTA */}
          <div className="shrink-0 text-right">
            {isEnrolled ? (
              <button
                onClick={() => selectCourse(course.id)}
                className="px-3 py-1.5 rounded-lg bg-[#14243A] text-white hover:bg-[#1E3452] text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <span>{language === 'my' ? 'ဆက်လက်လေ့လာမည်' : 'Resume'}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-[#14243A] tabular-nums">
                  {course.priceMMK === 0
                    ? (language === 'my' ? 'အခမဲ့' : 'Free')
                    : `${course.priceMMK.toLocaleString()} Ks`}
                </span>
                <button
                  onClick={() => selectCourse(course.id)}
                  className="px-3 py-1.5 rounded-lg border border-[#14243A] text-[#14243A] hover:bg-[#14243A] hover:text-white text-xs font-semibold transition-colors"
                >
                  {t('course.enroll_now', language)}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
