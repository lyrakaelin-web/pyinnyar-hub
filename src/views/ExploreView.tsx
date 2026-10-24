import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { t } from '../utils/translations';
import { CourseCard } from '../components/courses/CourseCard';
import { Search, Filter, BookOpen, Bell, CheckCircle2, ChevronRight, X } from 'lucide-react';

export const ExploreView: React.FC = () => {
  const {
    courses,
    categories,
    selectedCategoryId,
    selectCategory,
    language,
    searchQuery,
    setSearchQuery,
  } = useApp();

  const [filterType, setFilterType] = useState<'all' | 'free' | 'paid' | 'certificate'>('all');
  const [filterLevel, setFilterLevel] = useState<'all' | 'Beginner' | 'Intermediate' | 'Advanced'>('all');
  const [notifiedCategories, setNotifiedCategories] = useState<number[]>([]);
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null);

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);

  // Filter courses
  const filteredCourses = courses.filter((c) => {
    // Category check
    if (selectedCategoryId && c.categoryId !== selectedCategoryId) return false;
    // Subcategory check
    if (activeSubcategory && c.subcategory !== activeSubcategory) return false;
    // Type check
    if (filterType !== 'all' && c.type !== filterType) return false;
    // Level check
    if (filterLevel !== 'all' && c.level !== filterLevel) return false;
    // Query check
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = c.title.toLowerCase().includes(q) || (c.titleMy && c.titleMy.toLowerCase().includes(q));
      const matchDesc = c.description.toLowerCase().includes(q) || (c.descriptionMy && c.descriptionMy.toLowerCase().includes(q));
      const matchSub = c.subcategory.toLowerCase().includes(q);
      const matchInst = c.instructor.name.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchSub && !matchInst) return false;
    }
    return true;
  });

  const handleNotifyMe = (catId: number) => {
    setNotifiedCategories((prev) => [...prev, catId]);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header and Search Controls */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-5 sm:p-6 shadow-xs space-y-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#14243A]">
            {language === 'my' ? 'သင်ရိုးနှင့် ဘာသာရပ်ဆိုင်ရာ ကတ်တလောက်' : 'Academic & Professional Course Catalogue'}
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            {language === 'my'
              ? 'အဓိက ပညာရပ်နယ်ပယ် ၃၀ မှ အရည်အသွေးမြင့် သင်တန်းများကို စစ်ထုတ်လေ့လာပါ'
              : 'Explore structured courses across 30 foundational disciplines, vocational crafts, and global skills'}
          </p>
        </div>

        {/* Search and Filters bar */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('home.search_placeholder', language)}
              className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#C7A66A]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Course Type Filter Tabs */}
          <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-xl overflow-x-auto shrink-0">
            {(['all', 'free', 'paid', 'certificate'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                  filterType === type
                    ? 'bg-white text-[#14243A] shadow-xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {type === 'all'
                  ? 'All Types'
                  : type === 'free'
                  ? (language === 'my' ? 'အခမဲ့' : 'Free')
                  : type === 'paid'
                  ? (language === 'my' ? 'အတိုသင်တန်း' : 'Short Course')
                  : (language === 'my' ? 'လက်မှတ်ရ' : 'Certificate')}
              </button>
            ))}
          </div>

          {/* Level Filter Tabs */}
          <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-xl overflow-x-auto shrink-0">
            {(['all', 'Beginner', 'Intermediate', 'Advanced'] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => setFilterLevel(lvl)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                  filterLevel === lvl
                    ? 'bg-white text-[#14243A] shadow-xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {lvl === 'all' ? 'All Levels' : lvl}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 30 Categories Horizontal Bar / Selector */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-stone-500">
            {language === 'my' ? 'ဘာသာရပ် ရွေးချယ်ရန် (၃၀)' : '30 Disciplines'}
          </h2>
          {selectedCategoryId !== null && (
            <button
              onClick={() => {
                selectCategory(null);
                setActiveSubcategory(null);
              }}
              className="text-xs font-semibold text-[#A9874B] hover:underline"
            >
              {language === 'my' ? 'အားလုံး ပြန်လည်ပြသပါ' : 'Clear Category Filter'}
            </button>
          )}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
          <button
            onClick={() => {
              selectCategory(null);
              setActiveSubcategory(null);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors shrink-0 flex items-center gap-1.5 ${
              selectedCategoryId === null
                ? 'bg-[#14243A] text-white shadow-xs'
                : 'bg-white text-stone-700 border border-stone-200 hover:border-[#C7A66A]'
            }`}
          >
            <span>All Categories</span>
          </button>
          {categories.map((cat) => {
            const isSelected = selectedCategoryId === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  selectCategory(cat.id);
                  setActiveSubcategory(null);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors shrink-0 flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#14243A] text-white shadow-xs'
                    : 'bg-white text-stone-700 border border-stone-200 hover:border-[#C7A66A]'
                }`}
              >
                <span className="opacity-70 text-[10px] font-mono">{cat.number}.</span>
                <span>{language === 'my' ? cat.nameMy : cat.name}</span>
                {!cat.hasActiveCourses && (
                  <span className="text-[10px] opacity-75 font-normal ml-0.5">
                    (Soon)
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Category Detail Card (if one is clicked) */}
      {selectedCategory && (
        <div className="p-5 rounded-2xl bg-[#F5F0E6] border border-[#C7A66A]/40 text-[#14243A] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="text-[11px] font-bold tracking-wider uppercase text-[#A9874B]">
                Category {selectedCategory.number} of 30
              </div>
              <h2 className="text-lg sm:text-xl font-bold">
                {language === 'my' ? selectedCategory.nameMy : selectedCategory.name}
              </h2>
            </div>
            {!selectedCategory.hasActiveCourses && (
              <span className="px-3 py-1 rounded-full bg-stone-200 text-stone-700 text-xs font-semibold w-fit">
                {t('cat.coming_soon', language)}
              </span>
            )}
          </div>

          <p className="text-xs sm:text-sm text-stone-700 leading-relaxed max-w-3xl">
            {language === 'my' ? selectedCategory.descriptionMy : selectedCategory.description}
          </p>

          {/* Subcategories */}
          {selectedCategory.subcategories.length > 0 && (
            <div className="pt-2 border-t border-stone-300/60 flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-stone-600 mr-1">
                {language === 'my' ? 'ခေါင်းစဉ်ခွဲများ:' : 'Subfields:'}
              </span>
              <button
                onClick={() => setActiveSubcategory(null)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  activeSubcategory === null
                    ? 'bg-[#14243A] text-white'
                    : 'bg-white/70 text-stone-700 hover:bg-white'
                }`}
              >
                All
              </button>
              {selectedCategory.subcategories.map((sub, i) => (
                <button
                  key={i}
                  onClick={() => setActiveSubcategory(sub)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    activeSubcategory === sub
                      ? 'bg-[#14243A] text-white'
                      : 'bg-white/70 text-stone-700 hover:bg-white'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Coming Soon Category Notice if category has no active courses */}
      {selectedCategory && !selectedCategory.hasActiveCourses && (
        <div className="p-8 text-center bg-white rounded-2xl border border-stone-200/90 space-y-3 max-w-xl mx-auto shadow-xs">
          <div className="w-12 h-12 rounded-full bg-[#F5F0E6] text-[#C7A66A] flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-[#14243A]">
            {language === 'my'
              ? 'ဤဘာသာရပ်အတွက် သင်ရိုးများ မကြာမီ ဖွင့်လှစ်ပါမည်'
              : 'Curriculum Under Development'}
          </h3>
          <p className="text-xs text-stone-500 leading-relaxed">
            {language === 'my'
              ? 'ဆရာများနှင့် ပညာရှင်များမှ အဆင့်မီ သင်ခန်းစာများ စီစဉ်ရေးဆွဲနေပါသည်။ ဖွင့်လှစ်သည်နှင့် အသိပေးချက် ရယူနိုင်ပါသည်။'
              : 'Our academic faculty and verified instructors are currently producing syllabus content, video modules, and practical assessments for this category.'}
          </p>

          <div className="pt-2">
            {notifiedCategories.includes(selectedCategory.id) ? (
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-4 py-2 rounded-xl">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>
                  {language === 'my'
                    ? 'သင့်အား အသိပေးရန် စာရင်းသွင်းပြီးပါပြီ'
                    : 'Notification request saved! We will alert you upon release.'}
                </span>
              </div>
            ) : (
              <button
                onClick={() => handleNotifyMe(selectedCategory.id)}
                className="px-5 py-2.5 rounded-xl bg-[#14243A] text-white hover:bg-[#1E3452] text-xs font-semibold inline-flex items-center gap-2 transition-colors"
              >
                <Bell className="w-3.5 h-3.5 text-[#C7A66A]" />
                <span>{t('cat.notify_me', language)}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Courses Grid */}
      {filteredCourses.length > 0 ? (
        <div className="space-y-3">
          <div className="text-xs text-stone-500 font-medium">
            Showing <span className="font-bold text-[#14243A] tabular-nums">{filteredCourses.length}</span> active course{filteredCourses.length > 1 ? 's' : ''}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCourses.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        </div>
      ) : (
        selectedCategory && selectedCategory.hasActiveCourses && (
          <div className="p-8 text-center bg-white rounded-2xl border border-stone-200/90 text-stone-500 text-sm">
            No courses match your selected filter criteria. Try clearing search or level filters.
          </div>
        )
      )}
    </div>
  );
};
