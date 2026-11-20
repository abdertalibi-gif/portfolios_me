import ScrollReveal from "./ScrollReveal";
import { Github, ExternalLink, ArrowUpRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useContent } from "../context/ContentContext";
import { pickLocalized } from "../../shared/types";

export default function Projects() {
  const { t, i18n } = useTranslation();
  const { content } = useContent();
  const isAr = i18n.language === 'ar';
  const projects = [...content.projects]
    .filter((project) => project.published !== false)
    .sort((a, b) => a.order - b.order);

  const hasLink = (url?: string) => Boolean(url && url.trim() && url !== "#");

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
                {isAr ? (
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
            const isLastOdd = projects.length % 2 === 1 && index === projects.length - 1;

            return (
              <div
                key={project.id}
                className={isLastOdd ? "lg:col-span-2 lg:mx-auto lg:w-[calc(50%-1.5rem)]" : ""}
              >
                <ScrollReveal delay={index * 0.1}>
                  <article className={`group relative flex flex-col h-full rounded-[3rem] bg-brand-bg border border-brand-text/10 overflow-hidden card-shadow hover:card-shadow-hover hover:border-brand-primary/20 transition-all ${isAr ? 'text-right' : 'text-left'}`}>
                    <div className="aspect-[16/9] overflow-hidden relative">
                      <img
                        src={project.image}
                        alt={title}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-brand-bg/30 via-transparent to-transparent" />

                      <div className={`absolute top-8 flex flex-wrap gap-2 ${isAr ? 'right-8 justify-end' : 'left-8'}`}>
                        {project.tags.map((tag) => (
                          <span key={tag} className="px-3.5 py-1.5 bg-brand-bg/90 backdrop-blur-md rounded-full text-[10px] font-black text-brand-primary uppercase tracking-widest shadow-sm border border-brand-text/5">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-10 lg:p-12 flex flex-col flex-grow relative">
                      <h3 className="text-2xl md:text-3xl font-black text-brand-text mb-4 group-hover:text-brand-primary transition-colors tracking-tight">
                        {title}
                      </h3>

                      <p className="text-base md:text-lg text-brand-text-muted leading-relaxed mb-10 font-medium opacity-90">
                        {description}
                      </p>

                      <div className={`mt-auto flex flex-wrap items-center gap-8 ${isAr ? 'flex-row-reverse' : ''}`}>
                        {hasLink(project.github) && (
                          <a
                            href={project.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex items-center gap-2 text-[11px] font-black text-brand-text hover:text-brand-primary transition-all uppercase tracking-widest group/link ${isAr ? 'flex-row-reverse' : ''}`}
                          >
                            <Github className="w-4 h-4 group-hover/link:rotate-12 transition-transform" />
                            {t("projects.view_source")}
                          </a>
                        )}
                        {hasLink(project.demo) && (
                          <a
                            href={project.demo}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex items-center gap-2 text-[11px] font-black text-brand-text hover:text-brand-orange transition-all uppercase tracking-widest group/link ${isAr ? 'flex-row-reverse' : ''}`}
                          >
                            <ExternalLink className="w-4 h-4 transition-transform group-hover/link:-translate-y-0.5" />
                            {t("projects.live_demo")}
                          </a>
                        )}
                        {!hasLink(project.github) && !hasLink(project.demo) && (
                          <span className={`inline-flex items-center gap-2 text-[11px] font-black text-brand-text-muted uppercase tracking-widest opacity-60 ${isAr ? 'flex-row-reverse' : ''}`}>
                            <ArrowUpRight className="w-4 h-4" />
                            {t("projects.repository_private")}
                          </span>
                        )}
                      </div>
                    </div>
                  </article>
                </ScrollReveal>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
