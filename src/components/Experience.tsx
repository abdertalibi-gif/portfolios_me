import ScrollReveal from "./ScrollReveal";
import { FolderGit2, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useContent } from "../context/ContentContext";
import { pickLocalized } from "../../shared/types";

export default function Experience() {
  const { t, i18n } = useTranslation();
  const { content } = useContent();
  const isAr = i18n.language === 'ar';
  const experienceData = [...content.experiences].sort((a, b) => a.order - b.order);

  return (
    <section id="experience" className="py-32 bg-brand-bg-alt">
      <div className="container mx-auto px-6">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className={`flex items-start gap-6 mb-8 ${isAr ? 'flex-row-reverse text-right' : ''}`}>
              <div className="w-16 h-16 shrink-0 rounded-[1.5rem] bg-brand-orange/10 flex items-center justify-center border border-brand-orange/20 shadow-lg shadow-brand-orange/10">
                <FolderGit2 className="w-8 h-8 text-brand-orange" />
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-brand-text tracking-tight uppercase tracking-tighter leading-tight">
                {t('experience.title')} <span className="text-brand-orange">{t('experience.subtitle')}</span>
              </h2>
            </div>
            <p className={`text-lg text-brand-text-muted font-medium leading-relaxed max-w-3xl mb-20 opacity-90 ${isAr ? 'text-right mr-auto' : 'ml-auto md:ml-24'}`}>
              {t('experience.description')}
            </p>
          </ScrollReveal>

          <div className="space-y-12">
            {experienceData.map((item, index) => {
              const role = pickLocalized(item.role, i18n.language) || item.role.en;
              const company = pickLocalized(item.company, i18n.language) || item.company.en;
              const description = pickLocalized(item.description, i18n.language) || item.description.en;
              const location = pickLocalized(item.location, i18n.language);

              return (
                <ScrollReveal key={item.id} delay={index * 0.08} direction={isAr ? "right" : "left"}>
                  <div className={`relative ${isAr ? 'pr-10 md:pr-12 border-r-2' : 'pl-10 md:pl-12 border-l-2'} border-slate-100 dark:border-white/10`}>
                    <div className={`absolute ${isAr ? '-right-[9px]' : '-left-[9px]'} top-8 w-4 h-4 rounded-full bg-brand-orange shadow-[0_0_15px_rgba(242,140,40,0.5)]`} />

                    <div className="bg-brand-bg p-8 md:p-12 rounded-[3rem] border border-brand-text/10 card-shadow group hover:border-brand-orange/30 transition-all">
                      <div className={`flex flex-col md:flex-row md:items-start justify-between gap-4 md:gap-8 ${isAr ? 'md:flex-row-reverse' : ''}`}>
                        <div className={isAr ? 'text-right' : ''}>
                          <h3 className="text-xl md:text-2xl font-black text-brand-text mb-2 tracking-tight group-hover:text-brand-orange transition-colors">
                            {role}
                          </h3>
                          <p className="text-brand-orange font-black uppercase tracking-[0.18em] text-[11px]">{company}</p>
                          {location && (
                            <p className={`mt-3 flex items-center gap-2 text-[11px] font-bold text-brand-text-muted uppercase tracking-[0.15em] ${isAr ? 'flex-row-reverse' : ''}`}>
                              <MapPin className="w-3.5 h-3.5" />
                              {location}
                            </p>
                          )}
                        </div>
                        <div className={`flex flex-col gap-2 shrink-0 ${isAr ? 'items-start' : 'items-start md:items-end'}`}>
                          <span className="text-[11px] font-black text-brand-text-muted bg-brand-bg-alt px-5 py-2 rounded-full border border-brand-text/5 tabular-nums uppercase tracking-widest">
                            {item.period}
                          </span>
                          {item.employmentType && (
                            <span className="text-[10px] font-black text-brand-orange bg-brand-orange/5 px-4 py-1.5 rounded-full border border-brand-orange/10 uppercase tracking-widest">
                              {item.employmentType}
                            </span>
                          )}
                        </div>
                      </div>

                      <p className={`mt-6 text-base md:text-lg text-brand-text-muted leading-relaxed font-medium opacity-90 ${isAr ? 'text-right' : ''}`}>
                        {description}
                      </p>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
