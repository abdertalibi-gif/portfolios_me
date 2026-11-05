import { motion } from "framer-motion";
import { Award, ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useContent } from "../context/ContentContext";
import { pickLocalized } from "../../shared/types";

export default function Certifications() {
  const { t, i18n } = useTranslation();
  const { content } = useContent();
  const isAr = i18n.language === 'ar';
  const certificationsData = [...content.certifications].sort((a, b) => a.order - b.order);

  if (certificationsData.length === 0) return null;

  return (
    <section id="certifications" className="py-32 bg-brand-bg">
      <div className="container mx-auto px-6">
        <div className="max-w-5xl mx-auto">
          <div className={`flex items-center gap-6 mb-24 ${isAr ? 'flex-row-reverse text-right' : ''}`}>
            <div className="w-16 h-16 rounded-[1.5rem] bg-brand-orange/10 flex items-center justify-center border border-brand-orange/20 shadow-lg shadow-brand-orange/10">
              <Award className="w-8 h-8 text-brand-orange" />
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-brand-text tracking-tight uppercase tracking-tighter">
              {t('certifications.title')} <span className="text-brand-orange">{t('certifications.subtitle')}</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {certificationsData.map((cert, index) => (
              <motion.div
                key={cert.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-brand-bg p-8 rounded-[2.5rem] border border-brand-text/10 card-shadow group hover:border-brand-orange/30 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className={`flex justify-between items-start mb-6 ${isAr ? 'flex-row-reverse' : ''}`}>
                    <div className="w-12 h-12 rounded-xl bg-brand-orange/5 flex items-center justify-center border border-brand-orange/10 overflow-hidden">
                      {cert.image ? (
                        <img src={cert.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Award className="w-6 h-6 text-brand-orange" />
                      )}
                    </div>
                    <span className="text-[10px] font-black text-brand-text-muted bg-brand-bg-alt px-4 py-1.5 rounded-full border border-brand-text/5 uppercase tracking-widest opacity-60">
                      {cert.date}
                    </span>
                  </div>
                  <h3 className={`text-xl font-black text-brand-text mb-2 tracking-tight group-hover:text-brand-orange transition-colors ${isAr ? 'text-right' : ''}`}>
                    {pickLocalized(cert.title, i18n.language) || cert.title.en}
                  </h3>
                  <p className={`text-sm font-bold text-brand-text-muted uppercase tracking-widest opacity-80 mb-4 ${isAr ? 'text-right' : ''}`}>
                    {pickLocalized(cert.issuer, i18n.language) || cert.issuer.en}
                  </p>
                </div>
                
                {cert.link && (
                  <div className={`mt-6 pt-6 border-t border-brand-text/5 ${isAr ? 'flex justify-start' : 'flex justify-end'}`}>
                    <a
                      href={cert.link}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 text-[11px] font-black text-brand-primary hover:text-brand-orange transition-colors uppercase tracking-[0.2em]"
                    >
                      {t('certifications.view')}
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
