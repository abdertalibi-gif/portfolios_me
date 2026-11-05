import ScrollReveal from "./ScrollReveal";
import { Github, ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useContent } from "../context/ContentContext";
import { pickLocalized } from "../../shared/types";

export default function Projects() {
  const { t, i18n } = useTranslation();
  const { content } = useContent();
  const isAr = i18n.language === 'ar';
  const projects = [...content.projects].sort((a, b) => a.order - b.order);

  return (
    <section id="projects" className="py-32 bg-brand-bg-alt relative">
      <div className="container mx-auto px-6">
        <ScrollReveal>
          <div className={`flex flex-col md:flex-row md:items-end justify-between mb-24 gap-8 ${isAr ? 'md:flex-row-reverse' : ''}`}>
            <div className={`max-w-2xl ${isAr ? 'text-right' : 'text-left'}`}>
              <div className={`inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-brand-primary/10 border border-brand-primary/20 mb-6 ${isAr ? 'flex-row-reverse' : ''}`}>
                <span className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em]">{t("projects.title")}</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-brand-text mb-6 tracking-tight">
                {i18n.language === 'ar' ? (
                  <>ابتكارات برمجية <span className="text-brand-primary">مختارة</span></>
                ) : (
                  <>Selected Software <span className="text-brand-primary">Innovations</span></>
                )}
              </h2>
              <p className="text-xl text-brand-text-muted font-medium leading-relaxed">
                {t("projects.description")}
              </p>
            </div>
            <div className="hidden md:block">
              <div className={`flex items-center gap-4 text-[10px] font-black text-brand-text-muted uppercase tracking-[0.4em] opacity-50 ${isAr ? 'flex-row-reverse' : ''}`}>
                <span>{isAr ? 'اكتشف' : 'Discover'}</span>
                <div className="w-16 h-px bg-slate-300" />
                <span>{isAr ? 'مرر' : 'Scroll'}</span>
              </div>
            </div>
          </div>
        </ScrollReveal>

        <div className="grid lg:grid-cols-2 gap-12">
          {projects.map((project, index) => {
            const title = pickLocalized(project.title, i18n.language) || project.title.en;
            const description = pickLocalized(project.description, i18n.language) || project.description.en;
            return (
              <ScrollReveal key={project.id} delay={index * 0.1}>
                <div className={`group relative flex flex-col rounded-[3rem] bg-brand-bg border border-brand-text/10 overflow-hidden card-shadow hover:card-shadow-hover hover:border-brand-primary/20 transition-all h-full ${isAr ? 'text-right' : 'text-left'}`}>
                  <div className="aspect-[16/9] overflow-hidden relative">
                    <img
                      src={project.image}
                      alt={title}
                      className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-bg/20 via-transparent to-transparent" />
                    
                    {/* Tech Badges on image */}
                    <div className={`absolute top-8 flex flex-wrap gap-2 ${isAr ? 'right-8 justify-end' : 'left-8'}`}>
                      {project.tags.map((tag) => (
                        <span key={tag} className="px-4 py-1.5 bg-brand-bg/90 backdrop-blur-md rounded-full text-[10px] font-black text-brand-primary uppercase tracking-widest shadow-sm border border-brand-text/5">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-12 flex flex-col flex-grow relative">
                    <h3 className="text-3xl font-black text-brand-text mb-4 group-hover:text-brand-primary transition-colors tracking-tight">
                      {title}
                    </h3>
                    
                    <p className="text-lg text-brand-text-muted leading-relaxed mb-10 font-medium opacity-90">
                      {description}
                    </p>

                    <div className={`mt-auto flex items-center gap-10 ${isAr ? 'flex-row-reverse' : ''}`}>
                      <a
                        href={project.github}
                        className={`flex items-center gap-2 text-[12px] font-black text-brand-text hover:text-brand-primary transition-all uppercase tracking-widest group/link ${isAr ? 'flex-row-reverse' : ''}`}
                      >
                        <Github className="w-5 h-5 group-hover/link:rotate-12 transition-transform" />
                        {t("projects.view_source")}
                      </a>
                      <a
                        href={project.demo}
                        className={`flex items-center gap-2 text-[12px] font-black text-brand-text hover:text-brand-orange transition-all uppercase tracking-widest group/link ${isAr ? 'flex-row-reverse' : ''}`}
                      >
                        <ExternalLink className={`w-5 h-5 transition-transform ${isAr ? 'group-hover/link:-translate-y-1 group-hover/link:-translate-x-1' : 'group-hover/link:-translate-y-1 group-hover/link:translate-x-1'}`} />
                        {t("projects.live_demo")}
                      </a>
                    </div>
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
