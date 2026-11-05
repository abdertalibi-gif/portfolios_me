import { motion, useScroll, useSpring } from "framer-motion";
import { useTranslation } from "react-i18next";

export default function ScrollProgress() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <motion.div
      className={`fixed top-0 left-0 right-0 h-1 bg-brand-primary z-[60] ${isAr ? 'origin-right' : 'origin-left'}`}
      style={{ scaleX }}
    />
  );
}
