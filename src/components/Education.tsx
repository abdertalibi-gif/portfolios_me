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
            <div className={`flex items-center gap-6 mb-24 ${isAr ? 'flex-row-reverse text-right' : ''}`}>
              <div className="w-16 h-16 rounded-[1.5rem] bg-brand-primary/10 flex items-center justify-center border border-brand-primary/20 shadow-lg shadow-brand-primary/10">
                <GraduationCap className="w-8 h-8 text-brand-primary" />
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-brand-text tracking-tight uppercase tracking-tighter">
                {t('education.title')} <span className="text-brand-primary">{t('education.subtitle')}</span>
              </h2>
            </div>
          </ScrollReveal>

          <div className="space-y-12">
            {educationData.map((item, index) => (
              <ScrollReveal key={item.id} delay={index * 0.1} direction={isAr ? "left" : "right"}>
                <div className={`relative ${isAr ? 'pr-12 border-r-2' : 'pl-12 border-l-2'} border-slate-100`}>
                  <div className={`absolute ${isAr ? '-right-[9px]' : '-left-[9px]'} top-0 w-4 h-4 rounded-full bg-brand-primary shadow-[0_0_15px_rgba(15,125,184,0.5)]`} />
                  
                  <div className="bg-brand-bg p-10 rounded-[2.5rem] border border-brand-text/10 card-shadow group hover:border-brand-primary/30 transition-all">
                    <div className={`flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 ${isAr ? 'md:flex-row-reverse' : ''}`}>
                      <h3 className={`text-2xl font-black text-brand-text group-hover:text-brand-primary transition-colors tracking-tight ${isAr ? 'text-right' : ''}`}>
                        {pickLocalized(item.degree, i18n.language) || item.degree.fr}
                      </h3>
                      <span className="text-[11px] font-black text-brand-primary bg-brand-primary/5 px-6 py-2 rounded-full border border-brand-primary/10 tabular-nums uppercase tracking-widest">
                        {item.period}
                      </span>
                    </div>
                    
                    <div className={`flex flex-wrap items-center gap-8 text-brand-text-muted ${isAr ? 'flex-row-reverse' : ''}`}>
                      <div className={`flex items-center gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
                        <div className="w-10 h-10 rounded-xl bg-brand-bg-alt flex items-center justify-center border border-brand-text/5 group-hover:bg-brand-primary/5 group-hover:border-brand-primary/20 transition-colors">
                          <MapPin className="w-5 h-5 text-brand-primary" />
                        </div>
                        <span className="text-sm font-bold uppercase tracking-widest opacity-80">{pickLocalized(item.institution, i18n.language) || item.institution.fr}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
