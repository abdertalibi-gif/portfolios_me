import { useState } from "react";
import ScrollReveal from "./ScrollReveal";
import { Mail, Linkedin, Github, Send } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useContent } from "../context/ContentContext";
import { api } from "../services/api";

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
      await api.sendMessage(formValues);
      setFormState("success");
      setFormValues(emptyForm);
      setTimeout(() => setFormState("idle"), 3000);
    } catch (error) {
      setFormState("error");
      setErrorMessage(error instanceof Error ? error.message : "Impossible d'envoyer le message.");
    }
  };

  return (
    <section id="contact" className="py-32 bg-brand-bg">
      <div className="container mx-auto px-6">
        <div className={`grid lg:grid-cols-2 gap-20 items-start max-w-6xl mx-auto ${isAr ? 'direction-rtl' : ''}`}>
          <ScrollReveal direction={isAr ? "right" : "left"}>
            <div className={isAr ? 'text-right' : ''}>
              <div className={`inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-brand-primary/10 border border-brand-primary/20 mb-6 ${isAr ? 'flex-row-reverse' : ''}`}>
                <span className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em]">{t('contact.title')}</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-brand-text mb-8 tracking-tight">
                {t('contact.subtitle')}
              </h2>

              <div className="space-y-6">
                <a
                  href={`mailto:${contact.email}`}
                  className={`flex items-center gap-6 p-6 rounded-[2rem] bg-brand-bg border border-brand-text/10 card-shadow hover:card-shadow-hover hover:border-brand-primary/30 transition-all group ${isAr ? 'flex-row-reverse' : ''}`}
                >
                  <div className="w-16 h-16 rounded-2xl bg-brand-primary/10 flex items-center justify-center group-hover:bg-brand-primary transition-colors">
                    <Mail className="w-6 h-6 text-brand-primary group-hover:text-white transition-colors" />
                  </div>
                  <div className={isAr ? 'text-right' : ''}>
                    <p className="text-[10px] text-brand-text-muted uppercase tracking-[0.3em] font-black mb-1 opacity-60">{t('contact.email_me')}</p>
                    <p className="text-lg font-black text-brand-text">{contact.email}</p>
                  </div>
                </a>

                <div className={`flex gap-6 ${isAr ? 'flex-row-reverse' : ''}`}>
                  <a
                    href={contact.linkedin || "https://linkedin.com/in/abderrahim-talibi"}
                    target="_blank"
                    rel="noreferrer"
                    className={`flex-1 flex items-center gap-6 p-6 rounded-[2rem] bg-brand-bg border border-brand-text/10 card-shadow hover:card-shadow-hover hover:border-brand-primary/30 transition-all group ${isAr ? 'flex-row-reverse' : ''}`}
                  >
                    <div className="w-16 h-16 rounded-2xl bg-brand-primary/5 flex items-center justify-center group-hover:bg-brand-primary transition-colors">
                      <Linkedin className="w-6 h-6 text-brand-primary group-hover:text-white transition-colors" />
                    </div>
                    <span className="text-lg font-black text-brand-text uppercase tracking-tighter">LinkedIn</span>
                  </a>
                  <a
                    href={contact.github || "https://github.com/atalibi"}
                    target="_blank"
                    rel="noreferrer"
                    className={`flex-1 flex items-center gap-6 p-6 rounded-[2rem] bg-brand-bg border border-brand-text/10 card-shadow hover:card-shadow-hover hover:border-brand-orange/30 transition-all group ${isAr ? 'flex-row-reverse' : ''}`}
                  >
                    <div className="w-16 h-16 rounded-2xl bg-brand-orange/5 flex items-center justify-center group-hover:bg-brand-orange transition-colors">
                      <Github className="w-6 h-6 text-brand-orange group-hover:text-white transition-colors" />
                    </div>
                    <span className="text-lg font-black text-brand-text uppercase tracking-tighter">GitHub</span>
                  </a>
                </div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal direction={isAr ? "left" : "right"} delay={0.2}>
            <div className={`p-12 rounded-[3.5rem] bg-brand-bg border border-brand-text/10 card-shadow-hover relative overflow-hidden ${isAr ? 'text-right' : ''}`}>
              <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                <div className={`grid md:grid-cols-2 gap-8 ${isAr ? 'direction-rtl' : ''}`}>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-brand-text-muted uppercase tracking-[0.3em] px-2 opacity-60">
                      {t('contact.form.name')}
                    </label>
                    <input
                      required
                      type="text"
                      value={formValues.name}
                      onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
                      className={`w-full bg-brand-bg-alt border border-brand-text/10 rounded-2xl px-6 py-4 text-brand-text focus:outline-none focus:border-brand-primary focus:bg-brand-bg transition-all font-bold ${isAr ? 'text-right' : ''}`}
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-brand-text-muted uppercase tracking-[0.3em] px-2 opacity-60">
                      {t('contact.form.email')}
                    </label>
                    <input
                      required
                      type="email"
                      value={formValues.email}
                      onChange={(e) => setFormValues({ ...formValues, email: e.target.value })}
                      className={`w-full bg-brand-bg-alt border border-brand-text/10 rounded-2xl px-6 py-4 text-brand-text focus:outline-none focus:border-brand-primary focus:bg-brand-bg transition-all font-bold ${isAr ? 'text-right' : ''}`}
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-brand-text-muted uppercase tracking-[0.3em] px-2 opacity-60">
                    {t('contact.form.subject')}
                  </label>
                  <input
                    required
                    type="text"
                    value={formValues.subject}
                    onChange={(e) => setFormValues({ ...formValues, subject: e.target.value })}
                    className={`w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-brand-text focus:outline-none focus:border-brand-primary focus:bg-white transition-all font-bold ${isAr ? 'text-right' : ''}`}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-brand-text-muted uppercase tracking-[0.3em] px-2 opacity-60">
                    {t('contact.form.message')}
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formValues.message}
                    onChange={(e) => setFormValues({ ...formValues, message: e.target.value })}
                    className={`w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-brand-text focus:outline-none focus:border-brand-primary focus:bg-white transition-all font-bold resize-none ${isAr ? 'text-right' : ''}`}
                  />
                </div>

                <button
                  disabled={formState === "sending" || formState === "success"}
                  type="submit"
                  className={`w-full flex items-center justify-center gap-3 px-10 py-5 bg-brand-primary text-white font-black rounded-2xl hover:bg-brand-secondary transition-all disabled:opacity-50 uppercase tracking-widest shadow-xl shadow-brand-primary/20 ${isAr ? 'flex-row-reverse' : ''}`}
                >
                  {formState === "sending" ? (
                    t('contact.form.sending')
                  ) : formState === "success" ? (
                    t('contact.form.success')
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      {t('contact.form.submit')}
                    </>
                  )}
                </button>
                {formState === "error" && (
                  <p className={`text-sm font-bold text-red-500 ${isAr ? 'text-right' : ''}`}>{errorMessage}</p>
                )}
              </form>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
