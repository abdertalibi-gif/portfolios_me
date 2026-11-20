import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Download,
  Printer,
  ZoomIn,
  ZoomOut,
  RotateCw,
  FileText,
  ChevronLeft,
  ShieldCheck,
  ExternalLink,
  Home,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useContent } from "../context/ContentContext";

export default function CvPage() {
  const { i18n } = useTranslation();
  const { content } = useContent();
  const [zoom, setZoom] = useState<number>(100);
  const [rotation, setRotation] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const activePdfUrl = content?.contact?.cvUrl || "/cv.pdf";
  const cvExtension = (activePdfUrl.match(/\.([a-z0-9]+)(?:\?|$)/i)?.[1] || "pdf").toLowerCase();
  const isSpreadsheet = cvExtension === "xls" || cvExtension === "xlsx";
  const isAr = i18n.language === "ar";

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

  return (
    <div className="min-h-screen bg-[#030712] text-[#F8FAFC] flex flex-col">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-[#050B1A]/90 backdrop-blur-xl border-b border-white/10 px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Left: Brand & Back */}
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white transition text-xs font-bold border border-white/10"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>{isAr ? "الرجوع للمعرض" : "Retour au portfolio"}</span>
          </Link>

          <div className="flex items-center gap-3 pl-3 border-l border-white/10">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0F7DB8] to-[#2196D3] flex items-center justify-center text-white shadow-lg shadow-[#0F7DB8]/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-black text-white tracking-tight flex items-center gap-2">
                Curriculum Vitae — Abderrahim Talibi
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <ShieldCheck className="w-3 h-3" /> Officiel
                </span>
              </h1>
              <p className="text-[11px] text-slate-400 font-medium">
                Software Engineer & AI Developer · Document PDF interactif
              </p>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <div className="hidden sm:flex items-center bg-[#0D1730] border border-white/10 rounded-xl p-0.5">
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
            className="p-2 text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition"
            title="Pivoter (90°)"
          >
            <RotateCw className="w-4 h-4" />
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
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0F7DB8] hover:bg-[#2196D3] text-white shadow-lg shadow-[#0F7DB8]/30 transition text-xs font-black uppercase tracking-wider"
            title="Télécharger le PDF"
          >
            <Download className="w-4 h-4" />
            <span>{isAr ? "تحميل" : "Télécharger"}</span>
          </a>
        </div>
      </header>

      {/* Main PDF Viewer Container */}
      <main className="flex-1 relative flex items-center justify-center p-3 sm:p-6 bg-[#030712] overflow-auto">
        {/* Loading Indicator */}
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#030712] z-20">
            <div className="w-12 h-12 rounded-full border-3 border-cyan-400/20 border-t-cyan-400 animate-spin" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Chargement du CV...
            </p>
          </div>
        )}

        <div
          className="w-full max-w-5xl h-[84vh] rounded-2xl overflow-hidden shadow-2xl border border-white/10 transition-transform duration-200 bg-[#081127]"
          style={{
            transform: `rotate(${rotation}deg) scale(${zoom / 100})`,
            transformOrigin: "center center",
          }}
        >
          {isSpreadsheet ? (
            <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-8 text-center">
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
              title="CV Abderrahim Talibi"
              onLoad={() => setIsLoading(false)}
              className="w-full h-full bg-white border-0"
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#050B1A]/95 border-t border-white/10 px-6 py-3 flex items-center justify-between text-xs text-slate-400">
        <Link to="/" className="flex items-center gap-1.5 hover:text-white transition">
          <Home className="w-3.5 h-3.5" />
          <span>Abderrahim Talibi Portfolio</span>
        </Link>
        <div className="flex items-center gap-4">
          <a
            href={activePdfUrl}
            target="_blank"
            rel="noreferrer"
            className="hover:text-cyan-400 transition flex items-center gap-1"
          >
            <span>Ouvrir en plein écran</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </footer>
    </div>
  );
}

