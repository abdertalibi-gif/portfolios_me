import { motion } from "framer-motion";
import { Github, Linkedin, Mail, ArrowRight, Download, GraduationCap, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useContent } from "../context/ContentContext";
import { pickLocalized } from "../../shared/types";

export default function Hero() {
  const { t, i18n } = useTranslation();
  const { content } = useContent();
  const contact = content.contact;
  const isAr = i18n.language === 'ar';
  const professionalTitle =
    pickLocalized(content.about.professionalTitle, i18n.language) || t("hero.title");

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center pt-28 pb-16 overflow-hidden bg-brand-bg"
    >
      {/* Subtle Background Blobs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-primary/5 rounded-full blur-[120px] -mr-64 -mt-64" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-orange/5 rounded-full blur-[100px] -ml-64 -mb-64" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Column: Typographic */}
          <motion.div
            initial={{ opacity: 0, x: isAr ? 50 : -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={isAr ? "text-right" : "text-left"}
          >
            <div className={`flex flex-wrap items-center gap-3 mb-8 ${isAr ? "justify-end" : ""}`}>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-[10px] font-black text-brand-primary uppercase tracking-[0.18em]">
                <GraduationCap className="w-3.5 h-3.5" />
                {t("hero.badge")}
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-bg-alt border border-brand-text/10 text-[10px] font-black text-brand-text-muted uppercase tracking-[0.18em]">
                <MapPin className="w-3.5 h-3.5" />
                {contact.location}
              </span>
            </div>

            <h1 className="text-display font-black leading-[1.05] mb-8 text-brand-text">
              <span className="text-brand-text-muted block text-xl font-bold mb-4 tracking-widest uppercase opacity-70">
                {t("hero.greeting")}
              </span>
              <span className="block mb-2">
                {t("hero.name")}
              </span>
              <span className="text-3xl md:text-5xl block mt-4 text-brand-primary font-extrabold tracking-tight">
                {professionalTitle}
              </span>
            </h1>

            <p className="text-lg md:text-xl text-brand-text-muted max-w-xl mb-12 leading-relaxed font-medium opacity-90">
              {t("hero.subtitle")}
            </p>

            <div className={`flex flex-wrap gap-5 ${isAr ? "justify-end" : "justify-start"}`}>
              <a
                href="#projects"
                className="group px-10 py-4 bg-brand-primary text-white font-black rounded-xl hover:bg-brand-secondary transition-all flex items-center gap-3 shadow-xl shadow-brand-primary/30"
              >
                {t("hero.cta_work")}
                <ArrowRight className={`w-5 h-5 transition-transform ${isAr ? "rotate-180 group-hover:-translate-x-2" : "group-hover:translate-x-2"}`} />
              </a>
              <a
                href="/cv"
                className="px-10 py-4 bg-brand-bg text-brand-text font-bold rounded-xl border border-brand-text/10 hover:border-brand-primary hover:text-brand-primary transition-all flex items-center gap-3 shadow-sm shadow-slate-200/10"
              >
                <Download className="w-5 h-5" />
                {t("hero.cta_cv")}
              </a>
            </div>

            <div className={`flex items-center gap-6 mt-14 ${isAr ? "justify-end" : "justify-start"}`}>
              <a
                href={contact.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-brand-text-muted hover:text-brand-primary transition-all group"
                aria-label="GitHub"
              >
                <Github className="w-6 h-6 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-black uppercase tracking-[0.2em] hidden sm:inline">GitHub</span>
              </a>
              <a
                href={contact.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-brand-text-muted hover:text-brand-primary transition-all group"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-6 h-6 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-black uppercase tracking-[0.2em] hidden sm:inline">LinkedIn</span>
              </a>
              <a
                href={`mailto:${contact.email}`}
                className="flex items-center gap-3 text-brand-text-muted hover:text-brand-primary transition-all group"
                aria-label={t("contact.email_me")}
              >
                <Mail className="w-6 h-6 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-black uppercase tracking-[0.2em] hidden sm:inline">Email</span>
              </a>
            </div>
          </motion.div>

          {/* Right Column: Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="relative hidden lg:block"
          >
            <div className="relative z-10 aspect-square max-w-2xl mx-auto">
              {/* Soft Radial Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/10 to-brand-orange/10 rounded-full blur-[80px]" />

              <div className="relative h-full w-full rounded-[3rem] overflow-hidden shadow-2xl group">
                <img
                  src="/assets/aistudio/photoabder_3cbc0678.jpeg"
                  alt="Abderrahim Talibi"
                  className="w-full h-full object-cover transition-transform duration-[3000ms] group-hover:scale-110"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
