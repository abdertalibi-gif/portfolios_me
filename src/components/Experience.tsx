import ScrollReveal from "./ScrollReveal";
import { Briefcase } from "lucide-react";
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
            <div className={`flex items-center gap-6 mb-24 ${isAr ? 'flex-row-reverse text-right' : ''}`}>
              <div className="w-16 h-16 rounded-[1.5rem] bg-brand-orange/10 flex items-center justify-center border border-brand-orange/20 shadow-lg shadow-brand-orange/10">
                <Briefcase className="w-8 h-8 text-brand-orange" />
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-brand-text tracking-tight uppercase tracking-tighter">
                {t('experience.title')} <span className="text-brand-orange">{t('experience.subtitle')}</span>
              </h2>
            </div>
          </ScrollReveal>

          <div className="space-y-16">
            {experienceData.map((item, index) => {
              const role = pickLocalized(item.role, i18n.language) || item.role.en;
              const company = pickLocalized(item.company, i18n.language) || item.company.en;
              const description = pickLocalized(item.description, i18n.language) || item.description.en;

              return (
                <ScrollReveal key={item.id} delay={index * 0.1} direction={isAr ? "right" : "left"}>
                  <div className={`relative ${isAr ? 'pr-12 border-r-2' : 'pl-12 border-l-2'} border-slate-100`}>
                    <div className={`absolute ${isAr ? '-right-[9px]' : '-left-[9px]'} top-0 w-4 h-4 rounded-full bg-brand-orange shadow-[0_0_15px_rgba(242,140,40,0.5)]`} />
                    
                    <div className="bg-brand-bg p-12 rounded-[3rem] border border-brand-text/10 card-shadow group hover:border-brand-orange/30 transition-all">
                      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-8 mb-8 ${isAr ? 'md:flex-row-reverse' : ''}`}>
                        <div className={isAr ? 'text-right' : ''}>
                          <h3 className="text-2xl font-black text-brand-text mb-2 tracking-tight group-hover:text-brand-orange transition-colors">
                            {role}
                          </h3>
                          <p className="text-brand-orange font-black uppercase tracking-[0.2em] text-[11px]">{company}</p>
                        </div>
                        <span className="text-[11px] font-black text-brand-text-muted bg-brand-bg-alt px-6 py-2 rounded-full border border-brand-text/5 tabular-nums uppercase tracking-widest">
                          {item.period}
                        </span>
                      </div>
                      
                      <p className={`text-lg text-brand-text-muted leading-relaxed font-medium opacity-90 ${isAr ? 'text-right' : ''}`}>
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
