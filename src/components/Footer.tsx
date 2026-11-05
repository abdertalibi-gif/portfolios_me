import { useTranslation } from "react-i18next";
import { useContent } from "../context/ContentContext";

export default function Footer() {
  const { t, i18n } = useTranslation();
  const { content } = useContent();
  const isAr = i18n.language === 'ar';
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-20 bg-brand-bg border-t border-brand-text/10 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-primary/10 to-transparent" />
      
      <div className="container mx-auto px-6">
        <div className={`flex flex-col md:flex-row items-center justify-between gap-12 ${isAr ? 'md:flex-row-reverse' : ''}`}>
          <div className="text-2xl font-black tracking-tight text-brand-text font-display flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-gradient p-0.5 overflow-hidden">
              <img 
                src="/assets/aistudio/photoabder_3cbc0678.jpeg" 
                className="w-full h-full object-cover rounded-[6px]" 
                alt="Logo" 
              />
            </div>
            AT<span className="text-brand-orange">.</span>
          </div>

          <p className="text-[11px] font-black text-brand-text-muted uppercase tracking-[0.3em] text-center opacity-60">
            © {currentYear} Abderrahim Talibi. {t('footer.rights')}
          </p>

          <div className={`flex items-center gap-8 ${isAr ? 'flex-row-reverse' : ''}`}>
            <a
              href={content.contact.github || "https://github.com/atalibi"}
              className="text-[10px] font-black text-brand-text-muted hover:text-brand-primary uppercase tracking-[0.4em] transition-all"
            >
              GitHub
            </a>
            <a
              href="https://linkedin.com/in/abderrahim-talibi"
              className="text-[10px] font-black text-brand-text-muted hover:text-brand-primary uppercase tracking-[0.4em] transition-all"
            >
              LinkedIn
            </a>
            <a
              href="/admin/login"
              className="text-[8px] font-black text-brand-text-muted hover:text-brand-primary uppercase tracking-[0.4em] transition-all opacity-10 hover:opacity-100"
            >
              Admin
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
