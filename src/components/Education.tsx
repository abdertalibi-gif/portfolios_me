import ScrollReveal from "./ScrollReveal";
import { GraduationCap, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useContent } from "../context/ContentContext";
import { pickLocalized } from "../../shared/types";

export default function Education() {
  const { t, i18n } = useTranslation();
  const { content } = useContent();
  const isAr = i18n.language === 'ar';
  const educationData = [...content.education].sort((a, b) => a.order - b.order);

  return (
    <section id="education" className="py-32 bg-brand-bg">
      <div className="container mx-auto px-6">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className={`flex items-center gap-6 mb-20 ${isAr ? 'flex-row-reverse text-right' : ''}`}>
              <div className="w-16 h-16 shrink-0 rounded-[1.5rem] bg-brand-primary/10 flex items-center justify-center border border-brand-primary/20 shadow-lg shadow-brand-primary/10">
                <GraduationCap className="w-8 h-8 text-brand-primary" />
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-brand-text tracking-tight uppercase tracking-tighter">
                {t('education.title')} <span className="text-brand-primary">{t('education.subtitle')}</span>
              </h2>
            </div>
          </ScrollReveal>

          <div className="space-y-8">
            {educationData.map((item, index) => {
              const description = pickLocalized(item.description, i18n.language);
              return (
                <ScrollReveal key={item.id} delay={index * 0.08} direction={isAr ? "left" : "right"}>
                  <div className={`relative ${isAr ? 'pr-10 md:pr-12 border-r-2' : 'pl-10 md:pl-12 border-l-2'} border-slate-100 dark:border-white/10`}>
                    <div className={`absolute ${isAr ? '-right-[9px]' : '-left-[9px]'} top-8 w-4 h-4 rounded-full bg-brand-primary shadow-[0_0_15px_rgba(15,125,184,0.5)]`} />

                    <div className="bg-brand-bg p-8 md:p-10 rounded-[2.5rem] border border-brand-text/10 card-shadow group hover:border-brand-primary/30 transition-all">
                      <div className={`flex flex-col md:flex-row md:items-start justify-between gap-4 md:gap-6 ${isAr ? 'md:flex-row-reverse' : ''}`}>
                        <div className={isAr ? 'text-right' : ''}>
                          <h3 className="text-xl md:text-2xl font-black text-brand-text group-hover:text-brand-primary transition-colors tracking-tight leading-snug">
                            {pickLocalized(item.degree, i18n.language) || item.degree.fr}
                          </h3>
                          <div className={`mt-3 flex items-center gap-3 text-brand-text-muted ${isAr ? 'flex-row-reverse' : ''}`}>
                            <MapPin className="w-4 h-4 text-brand-primary shrink-0" />
                            <span className="text-xs font-bold uppercase tracking-[0.15em] opacity-80">
                              {pickLocalized(item.institution, i18n.language) || item.institution.fr}
                            </span>
                          </div>
                        </div>
                        <span className="shrink-0 text-[11px] font-black text-brand-primary bg-brand-primary/5 px-5 py-2 rounded-full border border-brand-primary/10 tabular-nums uppercase tracking-widest self-start">
                          {item.period}
                        </span>
                      </div>

                      {description && (
                        <p className={`mt-5 text-sm md:text-base text-brand-text-muted leading-relaxed font-medium opacity-90 ${isAr ? 'text-right' : ''}`}>
                          {description}
                        </p>
                      )}
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
