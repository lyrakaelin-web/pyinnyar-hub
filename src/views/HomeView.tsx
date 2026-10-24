import React from 'react';
import { useApp } from '../context/AppContext';
import { t } from '../utils/translations';
import { CourseCard } from '../components/courses/CourseCard';
import {
  Search,
  Sparkles,
  ArrowRight,
  BookOpen,
  Award,
  Globe,
  Bell,
  PlayCircle,
  Clock,
  Compass,
  CheckCircle2,
} from 'lucide-react';

export const HomeView: React.FC = () => {
  const {
    user,
    language,
    courses,
    categories,
    enrollments,
    announcements,
    opportunities,
    selectCourse,
    selectCategory,
    setCurrentView,
    searchQuery,
    setSearchQuery,
    openAiAssistant,
  } = useApp();

  // Find enrolled courses with active progress
  const activeEnrolledList = (user?.enrolledCourseIds || [])
    .map((id) => {
      const course = courses.find((c) => c.id === id);
      const enr = enrollments[id];
      return course ? { course, enrollment: enr } : null;
    })
    .filter(Boolean) as { course: any; enrollment: any }[];

  const continueCourse = activeEnrolledList[0];

  const featuredCourses = courses.filter((c) => c.isFeatured);
  const freeCourses = courses.filter((c) => c.type === 'free');
  const newCourses = courses.filter((c) => c.isNew || c.id === 'course_lead_01' || c.id === 'course_sign_01');
  const recommendedCourses = user?.learningPreferences?.preferredCategories
    ? courses.filter((c) => user.learningPreferences.preferredCategories.includes(c.categoryId))
    : courses.filter((c) => c.isFeatured || c.rating >= 4.8);

  return (
    <div className="space-y-8 sm:space-y-12 pb-16">
      {/* Announcements Bar if any */}
      {announcements.length > 0 && (
        <div className="bg-[#14243A] text-white px-4 py-2.5 rounded-2xl flex items-center justify-between gap-3 text-xs shadow-xs border border-white/10">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="shrink-0 text-[#C7A66A] font-bold uppercase tracking-wider text-[10px] bg-white/10 px-2 py-0.5 rounded">
              {language === 'my' ? 'သတင်းလွှာ' : 'Notice'}
            </span>
            <p className="truncate text-white/90">
              {language === 'my' && announcements[0].titleMy
                ? announcements[0].titleMy
                : announcements[0].title}
            </p>
          </div>
          <button
            onClick={() => setCurrentView('community')}
            className="shrink-0 text-[#C7A66A] hover:underline flex items-center gap-1 font-semibold"
          >
            <span>{language === 'my' ? 'ဖတ်ရှုရန်' : 'View'}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden bg-[#14243A] text-white border border-white/10 shadow-lg">
        {/* Background Image with Contrast Scrim */}
        <div className="absolute inset-0 z-0">
          <img
            src="/src/assets/images/hero_learning_students_1792822968176.jpg"
            alt="Myanmar and Southeast Asian students studying together"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-25 object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#14243A] via-[#14243A]/90 to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 p-6 sm:p-10 lg:p-12 max-w-2xl">
          <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-[#C7A66A] uppercase mb-3">
            <div className="w-2 h-2 rounded-full bg-[#C7A66A]" />
            <span>{t('brand.name', language)}</span>
            <span aria-hidden="true">·</span>
            <span>{t('brand.tagline', language)}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight text-balance">
            {language === 'my'
              ? 'အရည်အသွေးမြင့် ပညာရေးနှင့် နိုင်ငံတကာ အခွင့်အလမ်းများကို အကန့်အသတ်မဲ့ လေ့လာစူးစမ်းပါ'
              : 'World-Class Education & Global Skills for Myanmar Learners.'}
          </h1>

          <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-white/80 leading-relaxed max-w-xl">
            {t('brand.sub', language)}
          </p>

          {/* Quick Search Bar */}
          <div className="mt-6 flex flex-col sm:flex-row gap-2 max-w-lg">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') setCurrentView('explore');
                }}
                placeholder={t('home.search_placeholder', language)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white text-stone-900 text-xs sm:text-sm placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#C7A66A]"
              />
            </div>
            <button
              onClick={() => setCurrentView('explore')}
              className="px-5 py-3 rounded-xl bg-[#C7A66A] text-[#14243A] font-bold text-xs sm:text-sm hover:bg-[#D8B77B] transition-transform active:scale-95 shrink-0"
            >
              {language === 'my' ? 'ရှာဖွေမည်' : 'Explore Courses'}
            </button>
          </div>

          {/* Key Trust Metrics */}
          <div className="mt-8 pt-6 border-t border-white/10 flex items-center gap-6 text-xs text-white/70">
            <div>
              <span className="font-extrabold text-white text-base block tabular-nums">30+</span>
              <span className="text-[11px] text-white/60">Core Disciplines</span>
            </div>
            <div className="h-6 w-px bg-white/15" />
            <div>
              <span className="font-extrabold text-white text-base block tabular-nums">100%</span>
              <span className="text-[11px] text-white/60">Verified Certificates</span>
            </div>
            <div className="h-6 w-px bg-white/15" />
            <div>
              <span className="font-extrabold text-white text-base block tabular-nums">Offline</span>
              <span className="text-[11px] text-white/60">Friendly Notes</span>
            </div>
          </div>
        </div>
      </section>

      {/* Prominent Continue Learning Section */}
      {continueCourse && (
        <section className="bg-white rounded-2xl border border-stone-200/90 p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <PlayCircle className="w-5 h-5 text-[#C7A66A]" />
              <h2 className="font-bold text-base sm:text-lg text-[#14243A]">
                {t('home.continue_learning', language)}
              </h2>
            </div>
            <span className="text-xs text-stone-500 font-medium">
              {language === 'my' ? 'လက်ရှိ တက်ရောက်နေဆဲ' : 'In Progress'}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-stone-50 p-4 rounded-xl border border-stone-200/60">
            <div className="flex items-center gap-3.5 min-w-0">
              <img
                src={continueCourse.course.thumbnail}
                alt={continueCourse.course.title}
                referrerPolicy="no-referrer"
                className="w-16 h-12 rounded-lg object-cover shrink-0"
              />
              <div className="min-w-0">
                <span className="text-[11px] text-stone-500 font-medium block">
                  {continueCourse.course.subcategory}
                </span>
                <h3 className="font-bold text-sm text-[#14243A] truncate">
                  {language === 'my' && continueCourse.course.titleMy
                    ? continueCourse.course.titleMy
                    : continueCourse.course.title}
                </h3>
                <div className="flex items-center gap-2 mt-1 text-xs text-stone-500">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Resume at 07:00 mins</span>
                </div>
              </div>
            </div>

            <div className="w-full sm:w-64 shrink-0 flex flex-col justify-end">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-stone-500">Progress</span>
                <span className="font-bold text-[#14243A] tabular-nums">
                  {continueCourse.enrollment.progressPercent}%
                </span>
              </div>
              <div className="w-full bg-stone-200 rounded-full h-2 overflow-hidden mb-3">
                <div
                  className="bg-[#C7A66A] h-full rounded-full"
                  style={{ width: `${continueCourse.enrollment.progressPercent}%` }}
                />
              </div>
              <button
                onClick={() => selectCourse(continueCourse.course.id)}
                className="w-full py-2 rounded-lg bg-[#14243A] text-white hover:bg-[#1E3452] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>{t('home.resume', language)}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* AI Learning Assistant Feature Banner */}
      <section className="bg-linear-to-r from-[#14243A] to-[#1E3452] text-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm border border-white/10">
        <div className="space-y-2 max-w-xl text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#C7A66A]/20 text-[#C7A66A] text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Powered Tutoring</span>
          </div>
          <h2 className="text-lg sm:text-2xl font-bold tracking-tight">
            {t('home.ai_banner_title', language)}
          </h2>
          <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
            {t('home.ai_banner_desc', language)}
          </p>
        </div>
        <button
          onClick={() => openAiAssistant(true)}
          className="px-6 py-3 rounded-xl bg-[#C7A66A] text-[#14243A] hover:bg-[#D8B77B] text-xs sm:text-sm font-bold flex items-center gap-2 shrink-0 transition-transform active:scale-95 shadow-md"
        >
          <Sparkles className="w-4 h-4 text-[#14243A]" />
          <span>{t('home.ai_banner_btn', language)}</span>
        </button>
      </section>

      {/* Popular Categories Grid (Showcasing top categories from the 30) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[#14243A]">
              {t('home.popular_categories', language)}
            </h2>
            <p className="text-xs text-stone-500">
              {language === 'my'
                ? 'သင်ယူလိုသော ပညာရပ်နယ်ပယ်ကို ရွေးချယ်ပါ'
                : 'Choose from 30 structured academic and vocational disciplines'}
            </p>
          </div>
          <button
            onClick={() => setCurrentView('explore')}
            className="text-xs font-semibold text-[#14243A] hover:text-[#C7A66A] flex items-center gap-1 transition-colors"
          >
            <span>{language === 'my' ? 'အားလုံးကြည့်ရန်' : 'View All (30)'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {categories.slice(0, 6).map((cat) => (
            <button
              key={cat.id}
              onClick={() => selectCategory(cat.id)}
              className="p-4 rounded-xl bg-white border border-stone-200/90 hover:border-[#C7A66A] hover:shadow-xs text-left transition-all group flex flex-col justify-between min-h-[110px]"
            >
              <div className="w-8 h-8 rounded-lg bg-stone-100 group-hover:bg-[#C7A66A]/15 text-[#14243A] group-hover:text-[#A9874B] flex items-center justify-center font-bold text-xs transition-colors">
                {cat.number}
              </div>
              <div className="mt-2">
                <h3 className="font-semibold text-xs text-[#14243A] line-clamp-2 group-hover:text-[#A9874B] transition-colors leading-snug">
                  {language === 'my' ? cat.nameMy : cat.name}
                </h3>
                <span className="text-[10px] text-stone-400 mt-1 block">
                  {cat.hasActiveCourses
                    ? (language === 'my' ? 'သင်တန်းဖွင့်လှစ်ထား' : 'Active courses')
                    : (language === 'my' ? 'မကြာမီဖွင့်မည်' : 'Coming soon')}
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Featured Courses */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[#14243A]">
              {t('home.featured_courses', language)}
            </h2>
            <p className="text-xs text-stone-500">
              {language === 'my' ? 'ထိပ်တန်း ပညာရှင်များ၏ လက်မှတ်ရ သင်တန်းများ' : 'Curated signature programs led by veteran educators'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {featuredCourses.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>
      </section>

      {/* Free Courses Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[#14243A]">
              {t('home.free_courses', language)}
            </h2>
            <p className="text-xs text-stone-500">
              {language === 'my' ? 'မည်သူမဆို အခမဲ့ တက်ရောက်လေ့လာနိုင်သော သင်တန်းများ' : 'Accessible without tuition barrier for every Myanmar learner'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {freeCourses.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>
      </section>

      {/* New Arrivals & Recommended */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[#14243A]">
              {t('home.new_courses', language)}
            </h2>
            <p className="text-xs text-stone-500">
              {language === 'my' ? 'မကြာသေးမီက ထပ်မံဖြည့်စွက်ထားသော သင်တန်းများ' : 'Recently published programs and community workshops'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {newCourses.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>
      </section>

      {/* Opportunities Spotlight */}
      <section className="bg-white rounded-2xl border border-stone-200/90 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-[#C7A66A]" />
            <div>
              <h2 className="font-bold text-base sm:text-lg text-[#14243A]">
                {language === 'my' ? 'နိုင်ငံတကာ ပညာသင်ဆုနှင့် အခွင့်အလမ်းများ' : 'Global Opportunities & Fellowships'}
              </h2>
              <p className="text-xs text-stone-500">
                {language === 'my' ? 'တရားဝင် စိစစ်ထားသော ပညာသင်ဆုများနှင့် အဝေးသင် အလုပ်အကိုင်များ' : 'Verified international scholarships, internships, and remote career grants'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setCurrentView('opportunities')}
            className="text-xs font-semibold text-[#14243A] hover:text-[#C7A66A] flex items-center gap-1 transition-colors"
          >
            <span>{language === 'my' ? 'အားလုံးကြည့်ရန်' : 'View All'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {opportunities.slice(0, 2).map((opp) => (
            <div
              key={opp.id}
              onClick={() => setCurrentView('opportunities')}
              className="p-4 rounded-xl bg-stone-50 border border-stone-200/80 hover:border-[#C7A66A] transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
                  <span className="font-semibold text-[#14243A]">{opp.organization}</span>
                  <span className="text-[#A9874B] font-medium">Deadline: {opp.deadline}</span>
                </div>
                <h3 className="font-bold text-sm text-[#14243A] leading-snug">
                  {language === 'my' && opp.titleMy ? opp.titleMy : opp.title}
                </h3>
                <p className="mt-1 text-xs text-stone-600 line-clamp-2">
                  {language === 'my' && opp.descriptionMy ? opp.descriptionMy : opp.description}
                </p>
              </div>
              <div className="mt-3 pt-2.5 border-t border-stone-200/60 flex items-center justify-between text-xs">
                <span className="font-medium text-emerald-700">{opp.stipendOrSalary}</span>
                <span className="text-[#14243A] font-semibold flex items-center gap-1">
                  {t('opp.apply_now', language)}
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
