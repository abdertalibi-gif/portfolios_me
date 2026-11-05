import ScrollReveal from "./ScrollReveal";
import { Code2, Brain, Cloud, Database, GraduationCap, Target, Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { useContent } from "../context/ContentContext";
import { pickLocalized } from "../../shared/types";

export default function About() {
  const { t, i18n } = useTranslation();
  const { content } = useContent();
  const isAr = i18n.language === 'ar';

  const icons = [Code2, Brain, Cloud, Database];
  
  const managedFocus = content.about.focus
    .map((item) => pickLocalized(item.text, i18n.language) || item.text.en)
    .filter(Boolean);

  const focusItems = managedFocus.length > 0
    ? managedFocus
    : [
        t("about.academic"),
        t("about.specialization"),
        t("about.goals"),
        t("about.strengths")
      ];

  const focusIcons = [GraduationCap, Star, Target, Brain];

  return (
    <section id="about" className="py-32 bg-brand-bg-alt relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
      
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className={`flex flex-col lg:flex-row gap-20 items-center ${isAr ? 'lg:flex-row-reverse' : ''}`}>
              <div className={`lg:w-1/2 ${isAr ? 'text-right' : 'text-left'}`}>
                <div className={`inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-brand-primary/10 border border-brand-primary/20 mb-6 ${isAr ? 'flex-row-reverse' : ''}`}>
                  <span className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em]">{t("about.title")}</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-brand-text mb-8 tracking-tight">
                  {i18n.language === 'fr' ? (
                    <>L'innovation par <span className="text-brand-primary">l'IA et les données</span></>
                  ) : i18n.language === 'de' ? (
                    <>Innovation durch <span className="text-brand-primary">KI & Daten</span></>
                  ) : i18n.language === 'ar' ? (
                    <>قيادة الابتكار من خلال <span className="text-brand-primary">الذكاء الاصطناعي والبيانات</span></>
                  ) : (
                    <>Driving Innovation through <span className="text-brand-primary">AI & Data</span></>
                  )}
                </h2>
                <p className="text-xl text-brand-text-muted leading-relaxed font-medium mb-10 opacity-90">
                  {pickLocalized(content.about.description, i18n.language) || t("about.description")}
                </p>
                <div className={`grid grid-cols-2 gap-5 ${isAr ? 'direction-rtl' : ''}`}>
                  <div className="p-6 rounded-3xl bg-brand-bg border border-brand-text/10 card-shadow transition-all hover:card-shadow-hover hover:border-brand-primary/30 group">
                    <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center mb-4 group-hover:bg-brand-primary transition-colors">
                      <Brain className="w-6 h-6 text-brand-primary group-hover:text-white" />
                    </div>
                    <p className="text-sm font-black text-brand-text uppercase tracking-widest">{t("about.specialization")}</p>
                    <p className="text-[10px] text-brand-text-muted font-bold uppercase mt-1 tracking-widest opacity-60">Licence d'Excellence</p>
                  </div>
                  <div className="p-6 rounded-3xl bg-brand-bg border border-brand-text/10 card-shadow transition-all hover:card-shadow-hover hover:border-brand-orange/30 group">
                    <div className="w-12 h-12 rounded-2xl bg-brand-orange/10 flex items-center justify-center mb-4 group-hover:bg-brand-orange transition-colors">
                      <Code2 className="w-6 h-6 text-brand-orange group-hover:text-white" />
                    </div>
                    <p className="text-sm font-black text-brand-text uppercase tracking-widest">{t("about.backend_dev")}</p>
                    <p className="text-[10px] text-brand-text-muted font-bold uppercase mt-1 tracking-widest opacity-60">{t("about.scalable_systems")}</p>
                  </div>
                </div>
              </div>

              <div className="lg:w-1/2 grid gap-4 w-full">
                {focusItems.map((item, index) => {
                  const Icon = focusIcons[index];
                  return (
                    <motion.div
                      key={item}
                      whileHover={{ x: isAr ? -10 : 10, scale: 1.02 }}
                      className={`flex items-center gap-6 p-6 rounded-3xl bg-brand-bg border border-brand-text/10 card-shadow hover:card-shadow-hover transition-all group cursor-default ${isAr ? 'flex-row-reverse' : ''}`}
                    >
                      <div className="w-14 h-14 rounded-2xl bg-brand-bg-alt flex items-center justify-center group-hover:bg-brand-primary transition-colors shadow-inner">
                        <Icon className="w-6 h-6 text-brand-primary group-hover:text-white transition-colors" />
                      </div>
                      <span className={`text-lg font-bold text-brand-text group-hover:text-brand-primary transition-colors ${isAr ? 'text-right' : 'text-left'}`}>
                        {item}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

