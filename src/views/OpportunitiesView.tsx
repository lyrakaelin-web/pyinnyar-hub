import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { t } from '../utils/translations';
import { Opportunity } from '../types';
import {
  Globe,
  GraduationCap,
  Briefcase,
  Laptop,
  HeartHandshake,
  Calendar,
  MapPin,
  ExternalLink,
  CheckCircle2,
  Filter,
  DollarSign,
} from 'lucide-react';

export const OpportunitiesView: React.FC = () => {
  const { opportunities, language } = useApp();

  const [activeFilter, setActiveFilter] = useState<'all' | 'scholarship' | 'international_edu' | 'internship' | 'remote_job' | 'freelance' | 'volunteering'>('all');

  const filteredOpportunities = opportunities.filter((opp) => {
    if (activeFilter !== 'all' && opp.type !== activeFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6 pb-20">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-5 sm:p-6 shadow-xs space-y-3">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#A9874B] uppercase tracking-wider">
          <Globe className="w-4 h-4" />
          <span>Opportunity & Career Center</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#14243A]">
          {language === 'my'
            ? 'နိုင်ငံတကာ ပညာသင်ဆုနှင့် အသက်မွေးဝမ်းကျောင်း အခွင့်အလမ်းများ'
            : 'International Scholarships, Fellowships & Remote Jobs'}
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 max-w-2xl leading-relaxed">
          {language === 'my'
            ? 'မြန်မာကျောင်းသားများနှင့် လူငယ်များအတွက် တရားဝင် စိစစ်ထားသော ပညာသင်ဆုများ၊ နိုင်ငံတကာ အလုပ်သင်နှင့် အဝေးသင် အလုပ်အကိုင်များကို စုစည်းဖော်ပြပေးထားပါသည်။'
            : 'Curated and verified opportunities making global higher education, funded fellowships, and remote international employment accessible to Myanmar talent.'}
        </p>

        {/* Filter Pills */}
        <div className="pt-2 flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin text-xs">
          {[
            { id: 'all', label: 'All Opportunities' },
            { id: 'scholarship', label: 'Scholarships' },
            { id: 'internship', label: 'Internships' },
            { id: 'remote_job', label: 'Remote Jobs' },
            { id: 'volunteering', label: 'Volunteering' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl font-medium whitespace-nowrap transition-colors shrink-0 ${
                activeFilter === tab.id
                  ? 'bg-[#14243A] text-white font-semibold'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Opportunities List */}
      <div className="space-y-5">
        {filteredOpportunities.map((opp) => (
          <div
            key={opp.id}
            className="bg-white rounded-2xl border border-stone-200/90 p-5 sm:p-6 shadow-xs hover:border-[#C7A66A] transition-all flex flex-col md:flex-row md:items-start justify-between gap-6"
          >
            <div className="space-y-3 flex-1">
              {/* Type and Location Badges */}
              <div className="flex items-center gap-2 text-xs text-stone-500 font-medium flex-wrap">
                <span className="font-bold text-[#A9874B] uppercase tracking-wide">
                  {opp.type.replace('_', ' ')}
                </span>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-1 text-stone-700">
                  <MapPin className="w-3.5 h-3.5 text-stone-400" />
                  {opp.location}
                </span>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-1 text-rose-600 font-semibold">
                  <Calendar className="w-3.5 h-3.5" />
                  Deadline: {opp.deadline}
                </span>
              </div>

              <div>
                <h2 className="text-base sm:text-lg font-bold text-[#14243A]">
                  {language === 'my' && opp.titleMy ? opp.titleMy : opp.title}
                </h2>
                <span className="text-xs font-semibold text-stone-600 block mt-0.5">
                  Host: {opp.organization}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                {language === 'my' && opp.descriptionMy ? opp.descriptionMy : opp.description}
              </p>

              {/* Stipend / Salary badge */}
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-2 text-xs text-emerald-900 font-medium">
                <DollarSign className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>{opp.stipendOrSalary}</span>
              </div>

              {/* Eligibility Criteria */}
              <div className="space-y-1.5 pt-2">
                <span className="text-xs font-bold text-stone-700 block">
                  {language === 'my' ? 'လျှောက်ထားရန် လိုအပ်ချက်များ:' : 'Key Eligibility Criteria:'}
                </span>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-600">
                  {(language === 'my' && opp.eligibilityMy && opp.eligibilityMy.length > 0
                    ? opp.eligibilityMy
                    : opp.eligibility
                  ).map((req, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right Action */}
            <div className="shrink-0 flex flex-col justify-end pt-2 md:pt-0">
              <a
                href={opp.applyUrl}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-3 rounded-xl bg-[#14243A] text-white hover:bg-[#1E3452] text-xs font-bold flex items-center justify-center gap-1.5 transition-transform active:scale-95 shadow-sm whitespace-nowrap"
              >
                <span>{t('opp.apply_now', language)}</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#C7A66A]" />
              </a>
              <span className="text-[11px] text-stone-400 text-center mt-2 block">
                Official external portal
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
