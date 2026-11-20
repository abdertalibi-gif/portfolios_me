import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Download,
  Printer,
  ZoomIn,
  ZoomOut,
  RotateCw,
  FileText,
  ExternalLink,
  ChevronLeft,
  Maximize2,
  Minimize2,
  ShieldCheck,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useContent } from "../context/ContentContext";

interface CvViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl?: string;
}

export default function CvViewerModal({ isOpen, onClose, pdfUrl }: CvViewerModalProps) {
  const { t, i18n } = useTranslation();
  const { content } = useContent();
  const [zoom, setZoom] = useState<number>(100);
  const [rotation, setRotation] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const modalContainerRef = useRef<HTMLDivElement>(null);

  const activePdfUrl = pdfUrl || content?.contact?.cvUrl || "/cv.pdf";
  const cvExtension = (activePdfUrl.match(/\.([a-z0-9]+)(?:\?|$)/i)?.[1] || "pdf").toLowerCase();
  const isSpreadsheet = cvExtension === "xls" || cvExtension === "xlsx";
  const isAr = i18n.language === "ar";

  // Reset controls whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setZoom(100);
      setRotation(0);
      setIsLoading(true);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 15, 200));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 15, 60));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  const handlePrint = () => {
    try {
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.focus();
        iframeRef.current.contentWindow.print();
      } else {
        window.open(activePdfUrl, "_blank")?.print();
      }
    } catch {
      window.open(activePdfUrl, "_blank");
    }
  };

  const toggleFullscreen = () => {
    if (!modalContainerRef.current) return;
    if (!document.fullscreenElement) {
      modalContainerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden">
        {/* Backdrop with blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#030712]/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          ref={modalContainerRef}
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative z-10 flex flex-col w-[96vw] max-w-6xl h-[94vh] rounded-3xl bg-[#081127] border border-[#1677FF]/25 shadow-2xl overflow-hidden"
          style={{
            boxShadow: "0 25px 60px -15px rgba(2, 6, 23, 0.8), 0 0 40px 0 rgba(22, 119, 255, 0.15)",
          }}
        >
          {/* Top Header / Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-[#050B1A]/95 border-b border-white/10 shrink-0">
            {/* Left: Title & identity */}
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition text-xs font-bold border border-white/10"
                title="Retour au portfolio"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {isAr ? "الرجوع للمعرض" : "Retour"}
                </span>
              </button>

              <div className="flex items-center gap-2.5 pl-2 border-l border-white/10">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0F7DB8] to-[#2196D3] flex items-center justify-center text-white shadow-md shadow-[#0F7DB8]/30">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white tracking-tight flex items-center gap-2">
                    Abderrahim Talibi — Curriculum Vitae
                    <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <ShieldCheck className="w-3 h-3" /> Officiel
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                    Software Engineer & AI Developer · Document PDF
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Actions & Tools */}
            <div className="flex items-center gap-2">
              {/* Zoom controls */}
              <div className="hidden md:flex items-center bg-[#0D1730] border border-white/10 rounded-xl p-0.5">
                <button
                  onClick={handleZoomOut}
                  disabled={zoom <= 60}
                  className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 rounded-lg hover:bg-white/5 transition"
                  title="Zoom arrière"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-[11px] font-bold text-slate-300 px-2 min-w-[44px] text-center tabular-nums">
                  {zoom}%
                </span>
                <button
                  onClick={handleZoomIn}
                  disabled={zoom >= 200}
                  className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 rounded-lg hover:bg-white/5 transition"
                  title="Zoom avant"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>

              {/* Rotate */}
              <button
                onClick={handleRotate}
                className="hidden sm:flex p-2 text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition"
                title="Pivoter (90°)"
              >
                <RotateCw className="w-4 h-4" />
              </button>

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="hidden lg:flex p-2 text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition"
                title={isFullscreen ? "Quitter le plein écran" : "Plein écran"}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              {/* Print */}
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white border border-white/10 transition text-xs font-bold"
                title="Imprimer le CV"
              >
                <Printer className="w-4 h-4 text-cyan-400" />
                <span className="hidden sm:inline">{isAr ? "طباعة" : "Imprimer"}</span>
              </button>

              {/* Download */}
              <a
                href={activePdfUrl}
                download="Abderrahim_Talibi_CV.pdf"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0F7DB8] hover:bg-[#2196D3] text-white shadow-lg shadow-[#0F7DB8]/30 transition text-xs font-black uppercase tracking-wider"
                title="Télécharger le PDF"
              >
                <Download className="w-4 h-4" />
                <span>{isAr ? "تحميل" : "Télécharger"}</span>
              </a>

              {/* Close */}
              <button
                onClick={onClose}
                className="p-2 ml-1 text-slate-400 hover:text-white hover:bg-red-500/20 rounded-xl border border-white/10 transition"
                title="Fermer (Échap)"
                aria-label="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* PDF Viewer Body */}
          <div className="relative flex-1 w-full h-full bg-[#030712] overflow-auto flex items-center justify-center p-2 sm:p-4">
            {/* Loading Indicator */}
            {isLoading && !isSpreadsheet && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#081127] z-20">
                <div className="w-10 h-10 rounded-full border-2 border-cyan-400/20 border-t-cyan-400 animate-spin" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Chargement du document PDF...
                </p>
              </div>
            )}

            {/* Embedded Iframe Container with Scale & Rotation */}
            <div
              className="w-full h-full flex items-center justify-center transition-transform duration-200"
              style={{
                transform: `rotate(${rotation}deg) scale(${zoom / 100})`,
                transformOrigin: "center center",
              }}
            >
              {isSpreadsheet ? (
                <div className="w-full h-full rounded-2xl bg-[#081127] border border-white/10 flex flex-col items-center justify-center gap-4 p-8 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center">
                    <FileText className="w-7 h-7 text-emerald-400" />
                  </div>
                  <h2 className="text-lg font-black text-white">CV au format Excel</h2>
                  <p className="max-w-md text-sm text-slate-400 leading-relaxed">
                    L’aperçu intégré est réservé aux PDF. Téléchargez le classeur (.xls / .xlsx)
                    pour l’ouvrir dans Excel, LibreOffice ou Google Sheets.
                  </p>
                  <a
                    href={activePdfUrl}
                    download={`Abderrahim_Talibi_CV.${cvExtension}`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0F7DB8] hover:bg-[#2196D3] text-white text-xs font-black uppercase tracking-wider transition"
                  >
                    <Download className="w-4 h-4" />
                    Télécharger le fichier
                  </a>
                </div>
              ) : (
                <iframe
                  ref={iframeRef}
                  src={`${activePdfUrl}#toolbar=1&navpanes=0&scrollbar=1`}
                  title="Curriculum Vitae Abderrahim Talibi"
                  onLoad={() => setIsLoading(false)}
                  className="w-full h-full rounded-2xl bg-white shadow-2xl border-0 min-h-[500px]"
                />
              )}
            </div>
          </div>

          {/* Bottom Bar Info */}
          <div className="flex items-center justify-between px-5 py-2.5 bg-[#050B1A]/95 border-t border-white/10 text-[11px] text-slate-400 shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Visionneuse intégrée · Reste dans le portfolio</span>
            </div>
            <div className="flex items-center gap-4">
              <a
                href={activePdfUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-slate-400 hover:text-cyan-400 transition"
              >
                <span>Lien direct</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <button
                onClick={onClose}
                className="font-bold text-slate-300 hover:text-white transition"
              >
                {isAr ? "إغلاق" : "Fermer [Échap]"}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

