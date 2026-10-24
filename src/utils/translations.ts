import { Language } from '../types';

export const t = (key: string, lang: Language): string => {
  const dictionary: Record<string, { en: string; my: string }> = {
    // Brand & Header
    'brand.name': { en: 'PYINNYAR HUB', my: 'ပညာ ဟာ့ဘ်' },
    'brand.tagline': { en: 'Learn Without Limits', my: 'အကန့်အသတ်မဲ့ လေ့လာစူးစမ်းပါ' },
    'brand.sub': {
      en: 'A digital learning platform making quality education, professional skills, and global opportunities accessible to Myanmar learners.',
      my: 'မြန်မာနိုင်ငံသားများအတွက် အရည်အသွေးမြင့် ပညာရေး၊ လုပ်ငန်းခွင်ကျွမ်းကျင်မှုနှင့် နိုင်ငံတကာ အခွင့်အလမ်းများကို လက်လှမ်းမီစေသော ဒစ်ဂျစ်တယ် သင်ကြားရေးပလက်ဖောင်း။',
    },

    // Navigation
    'nav.home': { en: 'Home', my: 'ပင်မ' },
    'nav.explore': { en: 'Explore', my: 'ရှာဖွေရန်' },
    'nav.mylearning': { en: 'My Learning', my: 'ကျွန်ုပ်သင်ယူမှု' },
    'nav.community': { en: 'Community', my: 'အသိုက်အဝန်း' },
    'nav.opportunities': { en: 'Opportunities', my: 'အခွင့်အလမ်း' },
    'nav.profile': { en: 'Profile', my: 'ပရိုဖိုင်' },
    'nav.admin': { en: 'Admin Portal', my: 'စီမံခန့်ခွဲသူ' },

    // Home Screen
    'home.welcome': { en: 'Welcome back,', my: 'ပြန်လည်ကြိုဆိုပါသည်၊' },
    'home.continue_learning': { en: 'Continue Learning', my: 'ဆက်လက်လေ့လာရန်' },
    'home.resume': { en: 'Resume Lesson', my: 'သင်ခန်းစာ ဆက်လက်လေ့လာပါ' },
    'home.search_placeholder': { en: 'Search courses, subjects, or skills...', my: 'သင်တန်းများ၊ ဘာသာရပ်များ ရှာဖွေပါ...' },
    'home.popular_categories': { en: 'Explore 30 Core Disciplines', my: 'အဓိက ဘာသာရပ်နယ်ပယ် ၃၀' },
    'home.featured_courses': { en: 'Featured Programs', my: 'ရွေးချယ်ထားသော သင်တန်းများ' },
    'home.recommended_courses': { en: 'Recommended for You', my: 'သင့်အတွက် အကြံပြုချက်များ' },
    'home.free_courses': { en: 'Free Access Courses', my: 'အခမဲ့ သင်ယူနိုင်သော သင်တန်းများ' },
    'home.new_courses': { en: 'New Arrivals', my: 'သင်တန်းသစ်များ' },
    'home.ai_banner_title': { en: 'Meet Pyinnyar AI Assistant', my: 'Pyinnyar AI သင်ကြားရေး လက်ထောက်' },
    'home.ai_banner_desc': { en: 'Ask questions, simplify complex topics, and generate practice questions in Myanmar and English.', my: 'နားမလည်သော အကြောင်းအရာများကို မြန်မာလို အလွယ်တကူ ရှင်းလင်းမေးမြန်းနိုင်ပါသည်။' },
    'home.ai_banner_btn': { en: 'Start AI Session', my: 'AI ဖြင့် စတင်လေ့လာရန်' },

    // Categories
    'cat.all': { en: 'All Categories', my: 'ဘာသာရပ် အားလုံး' },
    'cat.coming_soon': { en: 'Coming Soon', my: 'မကြာမီ ဖွင့်လှစ်မည်' },
    'cat.notify_me': { en: 'Notify When Open', my: 'ဖွင့်လှစ်ပါက အသိပေးရန်' },
    'cat.active_courses': { en: 'Active Courses', my: 'ဖွင့်လှစ်ထားသော သင်တန်းများ' },

    // Course
    'course.free': { en: 'Free Course', my: 'အခမဲ့ သင်တန်း' },
    'course.paid': { en: 'Short Course', my: 'လက်တွေ့ တိုတောင်းသောသင်တန်း' },
    'course.certificate': { en: 'Professional Certificate', my: 'လက်မှတ်ရ အဆင့်မြင့်သင်တန်း' },
    'course.enroll_now': { en: 'Enroll Now', my: 'သင်တန်း စာရင်းသွင်းမည်' },
    'course.enrolled': { en: 'Enrolled', my: 'စာရင်းသွင်းပြီး' },
    'course.start_learning': { en: 'Start Learning', my: 'စတင် လေ့လာမည်' },
    'course.level': { en: 'Level', my: 'အဆင့်' },
    'course.duration': { en: 'Duration', my: 'ကြာချိန်' },
    'course.instructor': { en: 'Instructor', my: 'ဆရာ/နည်းပြ' },
    'course.objectives': { en: 'What You Will Learn', my: 'ရရှိမည့် အကျိုးကျေးဇူးများ' },
    'course.syllabus': { en: 'Course Syllabus', my: 'သင်ရိုးညွှန်းတမ်း' },
    'course.reviews': { en: 'Learner Reviews', my: 'ကျောင်းသားများ၏ သုံးသပ်ချက်များ' },

    // Learning System
    'learn.video_lesson': { en: 'Video Lecture', my: 'ဗီဒီယို သင်ခန်းစာ' },
    'learn.notes': { en: 'Study Notes & Guides', my: 'လေ့လာရေး မှတ်စုများ' },
    'learn.downloads': { en: 'Downloadable Resources', my: 'ဒေါင်းလုဒ်ရယူနိုင်သော ဖိုင်များ' },
    'learn.quiz': { en: 'Knowledge Quiz', my: 'ဉာဏ်စမ်း ဉာဏ်စစ်' },
    'learn.assignment': { en: 'Assignment & Mini Project', my: 'လက်တွေ့ လုပ်ဆောင်ချက်' },
    'learn.mark_completed': { en: 'Complete & Next', my: 'ပြီးမြောက်ကြောင်း အတည်ပြုပြီး ရှေ့ဆက်ပါ' },
    'learn.completed': { en: 'Completed', my: 'ပြီးမြောက်ပါပြီ' },
    'learn.certificate_unlocked': { en: 'Certificate Unlocked!', my: 'သင်တန်းဆင်းလက်မှတ် ရရှိပါပြီ!' },
    'learn.view_cert': { en: 'View & Download Certificate', my: 'လက်မှတ် ကြည့်ရှု/ဒေါင်းလုဒ်ဆွဲပါ' },

    // Student Dashboard
    'dash.my_courses': { en: 'My Enrolled Courses', my: 'စာရင်းသွင်းထားသော သင်တန်းများ' },
    'dash.completed_courses': { en: 'Completed Programs', my: 'ပြီးမြောက်ပြီးသော သင်တန်းများ' },
    'dash.learning_progress': { en: 'Overall Learning Progress', my: 'ခြုံငုံ သင်ယူမှု တိုးတက်မှု' },
    'dash.study_history': { en: 'Study Streak & Log', my: 'လေ့လာမှု မှတ်တမ်း' },
    'dash.quiz_results': { en: 'Quiz Results & Grades', my: 'စာမေးပွဲ အမှတ်စာရင်း' },
    'dash.earned_certificates': { en: 'Earned Certificates', my: 'ရရှိထားသော လက်မှတ်များ' },
    'dash.learning_goals': { en: 'Weekly Learning Target', my: 'အပတ်စဉ် လေ့လာမှု ပန်းတိုင်' },
    'dash.saved_courses': { en: 'Saved Courses', my: 'သိမ်းဆည်းထားသော သင်တန်းများ' },

    // Quiz
    'quiz.pass_score': { en: 'Passing Requirement', my: 'အောင်မှတ် လိုအပ်ချက်' },
    'quiz.submit': { en: 'Submit Answers', my: 'အဖြေများ တင်သွင်းမည်' },
    'quiz.retry': { en: 'Retake Quiz', my: 'ထပ်မံ ဖြေဆိုမည်' },
    'quiz.instant_feedback': { en: 'Review Explanation', my: 'ရှင်းလင်းချက် ဖတ်ရှုပါ' },

    // Payment
    'pay.title': { en: 'Course Enrollment & Payment', my: 'သင်တန်းကြေး ပေးသွင်းခြင်း' },
    'pay.kpay': { en: 'KBZPay', my: 'ကမ္ဘောဇ ပေး (KBZPay)' },
    'pay.wave': { en: 'WavePay', my: 'ဝေ့ဗ် ပေး (WavePay)' },
    'pay.transfer': { en: 'Bank Transfer (CB / AYA / KBZ)', my: 'ဘဏ်လွှဲစနစ် (CB / AYA / KBZ)' },
    'pay.slip_label': { en: 'Transaction Screenshot / Slip Ref', my: 'ငွေလွှဲပြေစာ ရည်ညွှန်းနံပါတ် / ပုံ' },
    'pay.confirm_btn': { en: 'Confirm Payment Slip', my: 'ငွေလွှဲပြေစာ အတည်ပြုသည်' },
    'pay.notice': { en: 'Payment Verification Mode: Payments are checked by academic administrators within 2-4 hours.', my: 'ငွေပေးချေမှု စိစစ်ချက်: စီမံခန့်ခွဲသူမှ ၂-၄ နာရီအတွင်း စစ်ဆေးအတည်ပြုပေးပါမည်။' },

    // Certificates
    'cert.official_header': { en: 'Certificate of Competency & Completion', my: 'ကျွမ်းကျင်မှုနှင့် သင်တန်းပြီးမြောက်ခြင်း လက်မှတ်' },
    'cert.verify_btn': { en: 'Verify Certificate Authenticity', my: 'လက်မှတ် စစ်မှန်ကြောင်း စစ်ဆေးရန်' },
    'cert.verify_code': { en: 'Certificate Verification Code', my: 'လက်မှတ် စစ်ဆေးရေး ကုဒ်' },
    'cert.issued_to': { en: 'This is proudly presented to', my: 'ဤဂုဏ်ပြုလက်မှတ်ကို ဂုဏ်ယူစွာ ချီးမြှင့်အပ်ပါသည်' },
    'cert.for_course': { en: 'for successfully completing all coursework, assessments, and practical modules in', my: 'အောက်ဖော်ပြပါ သင်ရိုး၊ မေးခွန်းများနှင့် လက်တွေ့လုပ်ဆောင်ချက်များကို အောင်မြင်စွာ ပြီးမြောက်သည့်အတွက်' },
    'cert.download_pdf': { en: 'Download Official PDF', my: 'တရားဝင် PDF ဒေါင်းလုဒ်ရယူပါ' },
    'cert.disclaimer': { en: 'PYINNYAR HUB Digital Certificate of Professional Competency. Not an externally accredited state qualification.', my: 'PYINNYAR HUB ဒစ်ဂျစ်တယ် ကျွမ်းကျင်မှု လက်မှတ် ဖြစ်ပါသည်။' },

    // Community & Opportunities
    'comm.new_post': { en: 'Start a Discussion', my: 'ဆွေးနွေးချက် အသစ်ရေးမည်' },
    'comm.guidelines': { en: 'Community Code of Conduct', my: 'အသိုက်အဝန်း စည်းကမ်းချက်များ' },
    'opp.apply_now': { en: 'Apply Now / View Details', my: 'အသေးစိတ်ကြည့်ရှု လျှောက်ထားရန်' },
    'opp.deadline': { en: 'Deadline', my: 'လျှောက်ထားရမည့် နောက်ဆုံးရက်' },
    'opp.stipend': { en: 'Financial Coverage', my: 'ထောက်ပံ့မှု ပမာဏ' },
  };

  return dictionary[key]?.[lang] || dictionary[key]?.en || key;
};
