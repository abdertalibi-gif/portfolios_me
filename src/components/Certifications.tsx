import { motion } from "framer-motion";
import { Trophy, ArrowUpRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useContent } from "../context/ContentContext";
import { pickLocalized } from "../../shared/types";

export default function Certifications() {
  const { t, i18n } = useTranslation();
  const { content } = useContent();
  const isAr = i18n.language === 'ar';
  const achievements = [...content.certifications].sort((a, b) => a.order - b.order);

  if (achievements.length === 0) return null;

  return (
    <section id="certifications" className="py-32 bg-brand-bg">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className={`flex items-center gap-6 mb-20 ${isAr ? 'flex-row-reverse text-right' : ''}`}>
            <div className="w-16 h-16 shrink-0 rounded-[1.5rem] bg-brand-orange/10 flex items-center justify-center border border-brand-orange/20 shadow-lg shadow-brand-orange/10">
              <Trophy className="w-8 h-8 text-brand-orange" />
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-brand-text tracking-tight uppercase tracking-tighter">
              {t('certifications.title')} <span className="text-brand-orange">{t('certifications.subtitle')}</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((item, index) => {
              const hasLink = Boolean(item.link && item.link.trim() && item.link !== "#");
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-brand-bg p-8 rounded-[2.5rem] border border-brand-text/10 card-shadow group hover:border-brand-orange/30 transition-all flex flex-col justify-between h-full"
                >
                  <div>
                    <div className={`flex justify-between items-start gap-4 mb-6 ${isAr ? 'flex-row-reverse' : ''}`}>
                      <div className="w-12 h-12 shrink-0 rounded-xl bg-brand-orange/5 flex items-center justify-center border border-brand-orange/10 overflow-hidden">
                        {item.image ? (
                          <img src={item.image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Trophy className="w-6 h-6 text-brand-orange" />
                        )}
                      </div>
                      <span className="text-[10px] font-black text-brand-text-muted bg-brand-bg-alt px-4 py-1.5 rounded-full border border-brand-text/5 uppercase tracking-widest opacity-70 tabular-nums">
                        {item.date}
                      </span>
                    </div>
                    <h3 className={`text-lg font-black text-brand-text mb-2 tracking-tight leading-snug group-hover:text-brand-orange transition-colors ${isAr ? 'text-right' : ''}`}>
                      {pickLocalized(item.title, i18n.language) || item.title.en}
                    </h3>
                    <p className={`text-[11px] font-bold text-brand-text-muted uppercase tracking-[0.15em] opacity-80 ${isAr ? 'text-right' : ''}`}>
                      {pickLocalized(item.issuer, i18n.language) || item.issuer.en}
                    </p>
                  </div>

                  {hasLink && (
                    <div className={`mt-6 pt-5 border-t border-brand-text/5 flex ${isAr ? 'justify-start' : 'justify-end'}`}>
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-[10px] font-black text-brand-primary hover:text-brand-orange transition-colors uppercase tracking-[0.2em]"
                      >
                        {t('certifications.view')}
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
