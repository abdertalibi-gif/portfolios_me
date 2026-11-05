import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Download, ChevronDown, Sun, Moon } from "lucide-react";
import { useTranslation } from "react-i18next";

const languages = [
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "ar", name: "العربية", flag: "🇲🇦" },
];

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [langDropdown, setLangDropdown] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("theme") as "light" | "dark") || "light";
    }
    return "light";
  });

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

  const navLinks = [
    { name: t("nav.home"), href: "#home" },
    { name: t("nav.about"), href: "#about" },
    { name: t("nav.skills"), href: "#skills" },
    { name: t("nav.projects"), href: "#projects" },
    { name: t("nav.education"), href: "#education" },
    { name: t("nav.experience"), href: "#experience" },
    { name: t("nav.certifications"), href: "#certifications" },
    { name: t("nav.contact"), href: "#contact" },
  ];

  const currentLang = languages.find((l) => l.code === i18n.language) || languages[0];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-brand-bg/80 backdrop-blur-xl border-b border-brand-text/10 py-3 shadow-sm"
          : "bg-transparent py-5"
      }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between gap-8">
        {/* Zone 1: Brand */}
        <a
          href="#home"
          className="text-2xl font-bold tracking-tight text-brand-text whitespace-nowrap shrink-0 font-display flex items-center gap-2"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-gradient p-0.5 shadow-lg shadow-brand-primary/20 overflow-hidden">
            <img 
              src="/assets/aistudio/photoabder_3cbc0678.jpeg" 
              className="w-full h-full object-cover rounded-[10px]" 
              alt="Logo" 
            />
          </div>
          <span className="hidden sm:inline">Abderrahim</span>
        </a>

        {/* Zone 2: Nav Links (Desktop) */}
        <div className="hidden lg:flex items-center gap-0.5 p-1 bg-brand-bg-alt rounded-2xl border border-brand-text/10">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="px-3 xl:px-5 py-2 text-[11px] xl:text-[12px] font-bold text-brand-text-muted hover:text-brand-primary hover:bg-brand-bg rounded-xl transition-all whitespace-nowrap shrink-0 uppercase tracking-wider"
            >
              {link.name}
            </a>
          ))}
        </div>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-3 xl:gap-4 shrink-0">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 text-brand-text-muted hover:text-brand-primary bg-brand-bg-alt rounded-xl transition-all border border-brand-text/10"
            aria-label="Toggle Theme"
          >
            {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>

          {/* Language Switcher */}
          <div className="relative">
            <button
              onClick={() => setLangDropdown(!langDropdown)}
              className="flex items-center gap-2 px-3 py-2 text-[13px] font-bold text-brand-text-muted hover:text-brand-primary bg-brand-bg-alt rounded-xl transition-all border border-brand-text/10"
            >
              <span>{currentLang.flag}</span>
              <span className="hidden sm:inline">{currentLang.code.toUpperCase()}</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${langDropdown ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
              {langDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className={`absolute top-full mt-2 w-40 bg-brand-bg border border-brand-text/10 rounded-2xl shadow-xl overflow-hidden ${i18n.language === 'ar' ? 'left-0' : 'right-0'}`}
                >
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        i18n.changeLanguage(l.code);
                        setLangDropdown(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-left transition-colors ${
                        i18n.language === l.code
                          ? "bg-brand-primary/5 text-brand-primary"
                          : "text-brand-text-muted hover:bg-brand-bg-alt"
                      } ${i18n.language === 'ar' ? 'text-right' : ''}`}
                    >
                      <span>{l.flag}</span>
                      <span>{l.name}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <a
            href="/cv.pdf"
            className="hidden sm:flex items-center gap-2 px-5 xl:px-6 py-2.5 text-[13px] font-black text-white bg-brand-orange rounded-xl hover:bg-brand-primary transition-all shadow-lg shadow-brand-orange/20 whitespace-nowrap shrink-0 uppercase tracking-tight"
          >
            <Download className="w-3.5 h-3.5" />
            {t("nav.cv")}
          </a>
          <button
            className="lg:hidden p-2 text-brand-text-muted hover:text-brand-primary transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="absolute top-full left-0 right-0 bg-brand-bg border-b border-brand-text/10 overflow-hidden lg:hidden shadow-xl"
          >
            <div className="flex flex-col p-6 gap-2">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="px-4 py-3 text-lg font-bold text-brand-text-muted hover:text-brand-primary transition-colors rounded-xl hover:bg-brand-bg-alt"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </a>
              ))}
              <a
                href="/cv.pdf"
                className="mt-4 flex items-center justify-center gap-2 px-6 py-4 text-sm font-bold text-white bg-brand-orange rounded-xl hover:bg-brand-primary transition-all shadow-lg shadow-brand-orange/10"
              >
                <Download className="w-4 h-4" />
                {t("nav.cv")}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
