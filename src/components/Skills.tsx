import ScrollReveal from "./ScrollReveal";
import { useTranslation } from "react-i18next";
import { useContent } from "../context/ContentContext";
import { pickLocalized } from "../../shared/types";

export default function Skills() {
  const { t, i18n } = useTranslation();
  const { content } = useContent();
  const isAr = i18n.language === 'ar';
  const categories = [...content.skillCategories].sort((a, b) => a.order - b.order);

  return (
    <section id="skills" className="py-32 bg-brand-bg">
      <div className="container mx-auto px-6">
        <ScrollReveal>
          <div className={`mb-24 text-center max-w-3xl mx-auto ${isAr ? 'direction-rtl' : ''}`}>
            <div className={`inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-brand-orange/10 border border-brand-orange/20 mb-6 ${isAr ? 'flex-row-reverse' : ''}`}>
              <span className="text-[10px] font-black text-brand-orange uppercase tracking-[0.2em]">{t("skills.title")}</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-brand-text mb-6 tracking-tight">
              {i18n.language === 'ar' ? (
                <>خبرة تقنية <span className="text-brand-primary">متخصصة</span></>
              ) : (
                <>Specialized Technical <span className="text-brand-primary">Expertise</span></>
              )}
            </h2>
            <div className="w-24 h-1.5 bg-blue-gradient mx-auto rounded-full" />
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category, index) => {
            const list = content.skills
              .filter((skill) => skill.categoryId === category.id)
              .sort((a, b) => a.order - b.order);
            const categoryTitle =
              pickLocalized(category.name, i18n.language) || t(`skills.categories.${category.key}`) || category.key;

            return (
            <ScrollReveal key={category.id} delay={index * 0.1}>
              <div className={`p-10 rounded-[2.5rem] bg-brand-bg border border-brand-text/10 card-shadow transition-all hover:card-shadow-hover hover:border-brand-primary/20 group relative overflow-hidden h-full ${isAr ? 'text-right' : 'text-left'}`}>
                <div className={`absolute top-0 p-8 text-6xl font-black text-brand-text/5 group-hover:text-brand-primary/5 transition-colors tabular-nums ${isAr ? 'left-0' : 'right-0'}`}>
                  0{index + 1}
                </div>
                
                <h3 className={`text-xl font-black text-brand-text mb-8 uppercase tracking-widest flex items-center gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
                  <span className={`w-3 h-3 rounded-full ${index % 2 === 0 ? "bg-brand-primary" : "bg-brand-orange"}`} />
                  {categoryTitle}
                </h3>
                
                <div className={`flex flex-wrap gap-3 ${isAr ? 'justify-end' : ''}`}>
                  {list.map((skill) => (
                    <span
                      key={skill.id}
                      className="px-4 py-2 text-[12px] font-bold text-brand-text-muted bg-brand-bg-alt rounded-xl border border-brand-text/5 hover:border-brand-primary/40 hover:text-brand-primary hover:bg-brand-bg transition-all cursor-default"
                    >
                      {pickLocalized(skill.name, i18n.language) || skill.name.en}
                    </span>
                  ))}
                </div>
              </div>
            </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

