import React, { useState } from 'react';
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
  AlertCircle,
  X,
  Send,
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
    requestRefund,
    saveCourseToggle,
    user,
  } = useApp();

  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [refundReason, setRefundReason] = useState('');
  const [refundStatusMessage, setRefundStatusMessage] = useState<string | null>(null);
  const [isSubmittingRefund, setIsSubmittingRefund] = useState(false);

  const course = courses.find((c) => c.id === selectedCourseId) || courses[0];
  const enrollment = enrollments[course.id];
  const isApproved = (enrollment && (enrollment.paymentStatus === 'approved' || enrollment.paymentStatus === 'free')) || user?.role === 'owner' || user?.role === 'admin';
  const isPending = enrollment && enrollment.paymentStatus === 'pending_verification';
  const isRejected = enrollment && enrollment.paymentStatus === 'rejected';
  const isSaved = user?.savedCourseIds?.includes(course.id) ?? false;

  const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);

  const handleEnrollClick = () => {
    if (course.priceMMK === 0) {
      enrollInCourse(course.id, 'none');
    } else {
      openPaymentModal(course.id);
    }
  };

  const handleStartOrResume = () => {
    if (!isApproved) return;
    const firstLessonId = course.modules[0]?.lessons[0]?.id || 'les_1_1';
    const targetLessonId = enrollment?.lastAccessedLessonId || firstLessonId;
    selectLesson(targetLessonId);
  };

  const handleRefundSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollment || !refundReason.trim()) return;
    setIsSubmittingRefund(true);
    const res = await requestRefund(enrollment.id, refundReason);
    setIsSubmittingRefund(false);
    setRefundStatusMessage(res.message);
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

          {/* Action / Enrollment Status Area */}
          {isApproved ? (
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
                Access Verified · {enrollment?.progressPercent || 0}% Completed
              </div>
            </div>
          ) : isPending ? (
            <div className="space-y-3 p-4 rounded-xl bg-amber-50/90 border border-amber-300 text-xs text-stone-800">
              <div className="flex items-start gap-2.5">
                <Clock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold text-amber-950 text-sm">
                    {language === 'my' ? 'ငွေလွှဲစစ်ဆေးဆဲ (ခွင့်ပြုချက်စောင့်ဆိုင်းနေပါသည်)' : 'Payment Receipt Under Review'}
                  </div>
                  <p className="text-stone-700 leading-relaxed text-[11px]">
                    {language === 'my'
                      ? 'သင်၏ ငွေလွှဲပြေစာကို လက်ခံရရှိထားပြီး စီမံခန့်ခွဲသူ (Admin/Owner) မှ လူကိုယ်တိုင် စစ်ဆေးအတည်ပြုနေပါသည်။ အတည်ပြုပြီးပါက သင်ခန်းစာများ စတင်လေ့လာနိုင်ပါမည်။'
                      : 'Your payment slip has been submitted. Automatic access is disabled. An authorized Admin or Owner is manually verifying the receipt.'}
                  </p>
                  {enrollment?.transactionRef && (
                    <div className="font-mono text-[11px] text-amber-900 bg-amber-100/70 px-2 py-1 rounded inline-block">
                      Ref: {enrollment.transactionRef}
                    </div>
                  )}
                </div>
              </div>

              {enrollment?.refundRequested ? (
                <div className="p-2 rounded bg-white/80 border border-amber-200 text-[11px] text-amber-800 font-medium">
                  Refund requested: "{enrollment.refundReason}". Operations board notified.
                </div>
              ) : (
                <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between text-[11px]">
                  <span className="text-stone-500">
                    {language === 'my' ? 'မှားလွှဲမိပါသလား?' : 'Made a transfer error?'}
                  </span>
                  <button
                    onClick={() => setIsRefundModalOpen(true)}
                    className="font-bold text-amber-900 hover:text-amber-950 underline underline-offset-2"
                  >
                    {language === 'my' ? 'Refund တောင်းခံရန်' : 'Request Refund'}
                  </button>
                </div>
              )}
            </div>
          ) : isRejected ? (
            <div className="space-y-3 p-4 rounded-xl bg-red-50/90 border border-red-300 text-xs text-stone-800">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold text-red-950 text-sm">
                    {language === 'my' ? 'ငွေလွှဲစစ်ဆေးမှု မအောင်မြင်ပါ' : 'Payment Verification Declined'}
                  </div>
                  <p className="text-stone-700 leading-relaxed text-[11px]">
                    <strong>{language === 'my' ? 'အကြောင်းပြချက်:' : 'Reviewer Note:'}</strong> {enrollment?.rejectionReason || 'Receipt details could not be matched.'}
                  </p>
                  {enrollment?.reviewedBy && (
                    <div className="text-[10px] text-stone-500">
                      Reviewed by {enrollment.reviewedBy} on {new Date(enrollment.reviewedAt || Date.now()).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-red-200/60 flex items-center gap-2">
                <button
                  onClick={handleEnrollClick}
                  className="flex-1 py-2 rounded-lg bg-red-900 text-white font-bold text-xs hover:bg-red-950 text-center"
                >
                  {language === 'my' ? 'ပြေစာအသစ်တင်မည်' : 'Resubmit Slip'}
                </button>
                <button
                  onClick={() => setIsRefundModalOpen(true)}
                  className="px-3 py-2 rounded-lg border border-red-300 text-red-900 hover:bg-red-100/50 font-bold text-xs"
                >
                  {language === 'my' ? 'Refund တောင်းမည်' : 'Request Refund'}
                </button>
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
                          if (isApproved) selectLesson(lesson.id);
                        }}
                        className={`p-3.5 flex items-center justify-between gap-3 transition-colors ${
                          isApproved ? 'hover:bg-stone-50 cursor-pointer' : 'opacity-80'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {isLessonDone ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : isApproved ? (
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

                        {isApproved ? (
                          <span className="text-xs font-semibold text-[#14243A] shrink-0">
                            {isLessonDone ? 'Review' : 'Play'}
                          </span>
                        ) : (
                          <span className="text-[11px] text-stone-400 shrink-0 flex items-center gap-1">
                            <Lock className="w-3 h-3" /> Locked
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
            Full lecture syllabus and downloadable resources are unlocked immediately upon enrollment approval.
          </p>
        )}
      </div>

      {/* Refund Request Modal */}
      {isRefundModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-700" />
                <h3 className="font-bold text-base text-[#14243A]">
                  {language === 'my' ? 'ငွေပြန်လည်တောင်းခံခြင်း (Refund Request)' : 'Request Payment Refund'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsRefundModalOpen(false);
                  setRefundStatusMessage(null);
                }}
                className="w-8 h-8 rounded-full hover:bg-stone-100 flex items-center justify-center text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {refundStatusMessage ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 space-y-2">
                <div className="font-bold text-sm">Request Submitted</div>
                <p>{refundStatusMessage}</p>
                <button
                  type="button"
                  onClick={() => {
                    setIsRefundModalOpen(false);
                    setRefundStatusMessage(null);
                  }}
                  className="w-full mt-2 py-2 rounded-xl bg-[#14243A] text-white font-bold text-xs"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleRefundSubmit} className="space-y-3 text-xs">
                <p className="text-stone-600 leading-relaxed text-[11px]">
                  {language === 'my'
                    ? 'ငွေလွှဲမှားမိခြင်း၊ အကောင့်မှားခြင်း သို့မဟုတ် ငွေပမာဏမှားယွင်းလွှဲမိပါက အောက်ပါအကွက်တွင် အသေးစိတ်ဖော်ပြပြီး Refund တောင်းခံနိုင်ပါသည်။ စီမံခန့်ခွဲရေးအဖွဲ့မှ ၂၄ နာရီအတွင်း စိစစ်ဆောင်ရွက်ပေးပါမည်။'
                    : 'If you made an accidental transfer, incorrect course selection, or payment mismatch, submit your explanation below. Our finance operations review refund inquiries within 24–48 hours.'}
                </p>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    {language === 'my' ? 'အကြောင်းပြချက် / အသေးစိတ်:' : 'Reason & Transaction Notes:'}
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    placeholder={
                      language === 'my'
                        ? 'ဥပမာ - ငွေပမာဏမှားလွှဲမိပါသဖြင့် ပြန်လည်စစ်ဆေးပေးပါရန်...'
                        : 'e.g. Sent wrong transfer amount / Transferred from wrong bank account...'
                    }
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#C7A66A] focus:outline-none"
                  />
                </div>

                <div className="p-3 bg-stone-50 rounded-xl text-[11px] text-stone-500">
                  Direct Finance Support: <span className="font-mono text-stone-700">support@pyinnyarhub.edu.mm</span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsRefundModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingRefund || !refundReason.trim()}
                    className="px-5 py-2 rounded-xl bg-[#14243A] text-white font-bold hover:bg-[#1E3452] disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmittingRefund ? 'Submitting...' : 'Submit Request'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
