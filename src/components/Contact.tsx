import { useState } from "react";
import ScrollReveal from "./ScrollReveal";
import { Mail, Linkedin, Github, Send, MapPin, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useContent } from "../context/ContentContext";
import { api } from "../services/api";
import { GITHUB_URL, LINKEDIN_URL } from "../../shared/site";

const emptyForm = { name: "", email: "", subject: "", message: "" };

export default function Contact() {
  const { t, i18n } = useTranslation();
  const { content } = useContent();
  const contact = content.contact;
  const isAr = i18n.language === 'ar';
  const [formState, setFormState] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [formValues, setFormValues] = useState(emptyForm);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState("sending");
    setErrorMessage("");
    try {
      await api.sendContactEmail(formValues);
      setFormState("success");
      setFormValues(emptyForm);
      setTimeout(() => setFormState("idle"), 4000);
    } catch (error) {
      setFormState("error");
      setErrorMessage(error instanceof Error ? error.message : t("contact.form.error"));
    }
  };

  const fieldClass = `w-full bg-brand-bg-alt border border-brand-text/10 rounded-2xl px-6 py-4 text-brand-text placeholder:text-brand-text-muted/50 focus:outline-none focus:border-brand-primary focus:bg-brand-bg focus:ring-2 focus:ring-brand-primary/20 transition-all font-bold ${isAr ? 'text-right' : ''}`;
  const labelClass = "text-[10px] font-black text-brand-text-muted uppercase tracking-[0.3em] px-2 opacity-70";

  return (
    <section id="contact" className="py-32 bg-brand-bg">
      <div className="container mx-auto px-6">
        <div className={`grid lg:grid-cols-2 gap-16 lg:gap-20 items-start max-w-6xl mx-auto ${isAr ? 'direction-rtl' : ''}`}>
          <ScrollReveal direction={isAr ? "right" : "left"}>
            <div className={isAr ? 'text-right' : ''}>
              <div className={`inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-brand-primary/10 border border-brand-primary/20 mb-6 ${isAr ? 'flex-row-reverse' : ''}`}>
                <span className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em]">{t('contact.title')}</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-brand-text mb-8 tracking-tight">
                {t('contact.subtitle')}
              </h2>

              <div className="space-y-5">
                <a
                  href={`mailto:${contact.email}`}
                  className={`flex items-center gap-6 p-6 rounded-[2rem] bg-brand-bg border border-brand-text/10 card-shadow hover:card-shadow-hover hover:border-brand-primary/30 transition-all group ${isAr ? 'flex-row-reverse' : ''}`}
                >
                  <div className="w-14 h-14 shrink-0 rounded-2xl bg-brand-primary/10 flex items-center justify-center group-hover:bg-brand-primary transition-colors">
                    <Mail className="w-6 h-6 text-brand-primary group-hover:text-white transition-colors" />
                  </div>
                  <div className={`min-w-0 ${isAr ? 'text-right' : ''}`}>
                    <p className="text-[10px] text-brand-text-muted uppercase tracking-[0.3em] font-black mb-1 opacity-70">{t('contact.email_me')}</p>
                    <p className="text-base sm:text-lg font-black text-brand-text break-all">{contact.email}</p>
                  </div>
                </a>

                <div className={`flex flex-col sm:flex-row gap-5 ${isAr ? 'sm:flex-row-reverse' : ''}`}>
                  <a
                    href={contact.linkedin || LINKEDIN_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex-1 flex items-center gap-4 p-6 rounded-[2rem] bg-brand-bg border border-brand-text/10 card-shadow hover:card-shadow-hover hover:border-brand-primary/30 transition-all group ${isAr ? 'flex-row-reverse' : ''}`}
                  >
                    <div className="w-14 h-14 shrink-0 rounded-2xl bg-brand-primary/5 flex items-center justify-center group-hover:bg-brand-primary transition-colors">
                      <Linkedin className="w-6 h-6 text-brand-primary group-hover:text-white transition-colors" />
                    </div>
                    <span className="text-base font-black text-brand-text uppercase tracking-tighter">LinkedIn</span>
                  </a>
                  <a
                    href={contact.github || GITHUB_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex-1 flex items-center gap-4 p-6 rounded-[2rem] bg-brand-bg border border-brand-text/10 card-shadow hover:card-shadow-hover hover:border-brand-orange/30 transition-all group ${isAr ? 'flex-row-reverse' : ''}`}
                  >
                    <div className="w-14 h-14 shrink-0 rounded-2xl bg-brand-orange/5 flex items-center justify-center group-hover:bg-brand-orange transition-colors">
                      <Github className="w-6 h-6 text-brand-orange group-hover:text-white transition-colors" />
                    </div>
                    <span className="text-base font-black text-brand-text uppercase tracking-tighter">GitHub</span>
                  </a>
                </div>

                <div className={`flex items-center gap-4 px-6 py-4 text-brand-text-muted ${isAr ? 'flex-row-reverse' : ''}`}>
                  <MapPin className="w-4 h-4 text-brand-primary" />
                  <span className="text-xs font-bold uppercase tracking-[0.2em]">{contact.location}</span>
                </div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal direction={isAr ? "left" : "right"} delay={0.2}>
            <div className={`p-8 sm:p-12 rounded-[3rem] bg-brand-bg border border-brand-text/10 card-shadow-hover relative overflow-hidden ${isAr ? 'text-right' : ''}`}>
              <form onSubmit={handleSubmit} className="space-y-6 relative z-10" noValidate={false}>
                <div className={`grid sm:grid-cols-2 gap-6 ${isAr ? 'direction-rtl' : ''}`}>
                  <div className="space-y-2.5">
                    <label htmlFor="contact-name" className={labelClass}>{t('contact.form.name')}</label>
                    <input
                      id="contact-name"
                      required
                      type="text"
                      autoComplete="name"
                      value={formValues.name}
                      onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
                      className={fieldClass}
                    />
                  </div>
                  <div className="space-y-2.5">
                    <label htmlFor="contact-email" className={labelClass}>{t('contact.form.email')}</label>
                    <input
                      id="contact-email"
                      required
                      type="email"
                      autoComplete="email"
                      value={formValues.email}
                      onChange={(e) => setFormValues({ ...formValues, email: e.target.value })}
                      className={fieldClass}
                    />
                  </div>
                </div>
                <div className="space-y-2.5">
                  <label htmlFor="contact-subject" className={labelClass}>{t('contact.form.subject')}</label>
                  <input
                    id="contact-subject"
                    required
                    type="text"
                    value={formValues.subject}
                    onChange={(e) => setFormValues({ ...formValues, subject: e.target.value })}
                    className={fieldClass}
                  />
                </div>
                <div className="space-y-2.5">
                  <label htmlFor="contact-message" className={labelClass}>{t('contact.form.message')}</label>
                  <textarea
                    id="contact-message"
                    required
                    rows={5}
                    value={formValues.message}
                    onChange={(e) => setFormValues({ ...formValues, message: e.target.value })}
                    className={`${fieldClass} resize-none`}
                  />
                </div>

                <button
                  disabled={formState === "sending" || formState === "success"}
                  type="submit"
                  className={`w-full flex items-center justify-center gap-3 px-10 py-5 bg-brand-primary text-white font-black rounded-2xl hover:bg-brand-secondary transition-all disabled:opacity-60 uppercase tracking-widest shadow-xl shadow-brand-primary/20 ${isAr ? 'flex-row-reverse' : ''}`}
                >
                  {formState === "sending" ? (
                    t('contact.form.sending')
                  ) : formState === "success" ? (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      {t('contact.form.success')}
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      {t('contact.form.submit')}
                    </>
                  )}
                </button>
                {formState === "error" && (
                  <p className={`text-sm font-bold text-red-500 ${isAr ? 'text-right' : ''}`} role="alert">{errorMessage}</p>
                )}
                <p className={`text-[10px] font-bold text-brand-text-muted uppercase tracking-[0.2em] opacity-60 text-center ${isAr ? 'text-right' : ''}`}>
                  {t('contact.form.privacy')}
                </p>
              </form>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
