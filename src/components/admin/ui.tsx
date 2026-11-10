import {
  useEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from "react";
import { AnimatePresence, motion } from "motion/react";
import type { LucideIcon } from "lucide-react";
import {
  AlertCircle,
  CheckCircle2,
  Info,
  Loader2,
  Plus,
  Upload,
  X,
  Moon,
  Sun,
} from "lucide-react";
import { LANGS, type Lang, type LocalizedText } from "../../../shared/types";
import { api } from "../../services/api";

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export const LANG_LABELS: Record<Lang, string> = { en: "EN", fr: "FR", de: "DE", ar: "AR" };
export const LANG_NAMES: Record<Lang, string> = {
  en: "English",
  fr: "Français",
  de: "Deutsch",
  ar: "العربية",
};

export function Spinner({ className = "h-4 w-4" }: { className?: string }) {
  return <Loader2 className={cn("animate-spin", className)} aria-hidden="true" />;
}

// Color palette tokens
export const COLORS = {
  background: "#050B1A",
  backgroundSecondary: "#081127",
  backgroundCard: "#0D1730",
  foreground: "#F4F7FF",
  muted: "#7E8CAB",
  mutedSoft: "#A5B4D4",
  accentPrimary: "#1677FF",
  accentCyan: "#00C8FF",
  border: "rgba(100, 140, 220, 0.16)",
  borderHover: "rgba(100, 140, 220, 0.28)",
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
} as const;

export const LIGHT_THEME = {
  background: "#F8FAFC",
  backgroundSecondary: "#F1F5F9",
  backgroundCard: "#FFFFFF",
  foreground: "#0F172A",
  muted: "#64748B",
  mutedSoft: "#475569",
  accentPrimary: "#1677FF",
  border: "rgba(100, 140, 220, 0.12)",
  borderHover: "rgba(100, 140, 220, 0.2)",
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
} as const;

export function toggleThemeIcon(theme: "dark" | "light") {
  return theme === "dark" ? <Moon className="h-4 w-4 text-slate-400" /> : <Sun className="h-4 w-4 text-amber-500" />;
}

export const motionConfig = {
  fade: { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.2 } },
  slideUp: { initial: { y: 12, opacity: 0 }, animate: { y: 0, opacity: 1 }, transition: { duration: 0.25 } },
};

export function useMotion() {
  return { motion, motionConfig };
}

// ============ BUTTON COMPONENT ============
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "subtle";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: LucideIcon;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  icon: Icon,
  className,
  children,
  disabled,
  ...rest
}: ButtonProps) {
  const variants: Record<string, string> = {
    primary:
      "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-blue-500/20 hover:brightness-110 active:brightness-95",
    secondary:
      "border border-white/10 bg-white/[0.04] text-slate-200 hover:bg-white/[0.08] hover:border-white/20 active:bg-white/[0.02]",
    ghost:
      "text-slate-400 hover:text-white hover:bg-white/[0.06] active:bg-white/[0.02]",
    danger:
      "border border-red-500/25 bg-red-500/10 text-red-300 hover:bg-red-500/20 hover:border-red-500/40 active:bg-red-500/15",
    subtle:
      "bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 border border-blue-500/20",
  };

  const sizes: Record<string, string> = {
    sm: "px-2.5 py-1.5 text-xs gap-1.5 rounded-lg",
    md: "px-3.5 py-2 text-sm gap-2 rounded-lg",
    lg: "px-4.5 py-2.5 text-base gap-2.5 rounded-xl",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-medium transition-all duration-150 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 select-none",
        variants[variant],
        sizes[size],
        className,
      )}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <Spinner className="h-4 w-4 shrink-0" />
      ) : Icon ? (
        <Icon className="h-4 w-4 shrink-0" />
      ) : null}
      {children}
    </button>
  );
}

// ============ PANEL COMPONENT ============
export function Panel({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-white/10 bg-[#0D1730]/75 shadow-sm p-4 sm:p-5 backdrop-blur-sm transition-all duration-200",
        className,
      )}
    >
      {children}
    </div>
  );
}

// ============ PAGE HEADER ============
export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-blue-400">
            {eyebrow}
          </p>
        )}
        <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white leading-none">
          {title}
        </h1>
        {description && (
          <p className="mt-1 max-w-2xl text-[11px] text-slate-400 leading-normal">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 flex-wrap items-center gap-2 self-start sm:self-center">
          {actions}
        </div>
      )}
    </div>
  );
}

// ============ FIELD COMPONENT ============
export function Field({
  label,
  hint,
  error,
  required,
  children,
}: {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
          {label} {required && <span className="text-amber-400">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-xs font-medium text-red-400 leading-tight">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-slate-400 leading-tight">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

// ============ TEXT INPUT COMPONENT ============
export function TextInput({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full h-[38px] rounded-lg bg-[#081127] border border-white/10 text-sm px-3 text-slate-100 placeholder:text-slate-500 transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50",
        className,
      )}
      {...rest}
    />
  );
}

// ============ TEXTAREA COMPONENT ============
export function TextArea({ className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full rounded-lg bg-[#081127] border border-white/10 text-sm p-3 text-slate-100 placeholder:text-slate-500 resize-y transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50",
        className,
      )}
      {...rest}
    />
  );
}

// ============ SELECT COMPONENT ============
export function Select({
  className,
  children,
  ...rest
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "w-full h-[38px] rounded-lg bg-[#081127] border border-white/10 text-sm px-3 text-slate-100 cursor-pointer transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500",
        className,
      )}
      {...rest}
    >
      {children}
    </select>
  );
}

// ============ BADGE COMPONENT ============
export function Badge({
  children,
  tone = "slate",
}: {
  children: ReactNode;
  tone?: "slate" | "blue" | "green" | "amber" | "red" | "orange";
}) {
  const tones: Record<string, string> = {
    slate: "border-white/10 bg-white/[0.05] text-slate-300",
    blue: "border-blue-500/25 bg-blue-500/10 text-blue-300",
    green: "border-emerald-500/25 bg-emerald-500/10 text-emerald-300",
    amber: "border-amber-500/25 bg-amber-500/10 text-amber-300",
    red: "border-red-500/25 bg-red-500/10 text-red-300",
    orange: "border-orange-500/25 bg-orange-500/10 text-orange-300",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold tracking-wide",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}

// ============ ALERT COMPONENT ============
export function Alert({
  type = "error",
  children,
  onClose,
}: {
  type?: "error" | "success" | "info";
  children: ReactNode;
  onClose?: () => void;
}) {
  const styles = {
    error: "border-red-500/25 bg-red-500/10 text-red-200",
    success: "border-emerald-500/25 bg-emerald-500/10 text-emerald-200",
    info: "border-blue-500/30 bg-blue-500/10 text-blue-200",
  };

  const Icons = {
    error: AlertCircle,
    success: CheckCircle2,
    info: Info,
  };

  const SelectedIcon = Icons[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("mb-5 flex items-start gap-2.5 rounded-xl border px-3.5 py-2.5 text-xs sm:text-sm", styles[type])}
      role={type === "error" ? "alert" : "status"}
    >
      <SelectedIcon className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="flex-1 font-medium">{children}</div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="opacity-60 transition-opacity hover:opacity-100 p-0.5 cursor-pointer"
          aria-label="Fermer"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </motion.div>
  );
}

// ============ EMPTY STATE COMPONENT ============
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-white/[0.02] px-6 py-6 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
        <Icon className="h-6 w-6 text-blue-400" />
      </div>
      <h3 className="text-sm font-bold text-white">{title}</h3>
      <p className="mt-1 max-w-sm text-xs text-slate-400 leading-normal">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// ============ SKELETON COMPONENT ============
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-white/[0.06] h-6 w-full",
        className,
      )}
    />
  );
}

// ============ LOADING LIST COMPONENT ============
export function LoadingList({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton key={index} className="h-10 w-full rounded-xl" />
      ))}
    </div>
  );
}

// ============ MODAL COMPONENT ============
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  wide = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className={cn(
              "relative z-10 w-full rounded-2xl border border-white/10 bg-[#0D1730] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]",
              wide ? "max-w-4xl" : "max-w-2xl",
            )}
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-white/10 px-4 py-3">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white">
                  {title}
                </h2>
                {description && <p className="mt-0.5 text-xs text-slate-400">{description}</p>}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white cursor-pointer"
                aria-label="Fermer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="admin-scroll flex-1 overflow-y-auto px-4 py-3 space-y-4">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="flex flex-wrap justify-end gap-2 border-t border-white/10 bg-[#081127]/60 px-4 py-2">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ============ CONFIRM DIALOG COMPONENT ============
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Supprimer",
  loading = false,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      footer={
        <>
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            Annuler
          </Button>
          <Button variant="danger" onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm leading-relaxed text-slate-300">
        {description}
      </p>
    </Modal>
  );
}

// ============ LOCALIZED FIELD COMPONENT ============
export function LocalizedField({
  label,
  value,
  onChange,
  multiline = false,
  rows = 4,
  placeholder,
  hint,
  required = false,
}: {
  label: string;
  value: LocalizedText;
  onChange: (value: LocalizedText) => void;
  multiline?: boolean;
  rows?: number;
  placeholder?: string;
  hint?: string;
  required?: boolean;
}) {
  const [lang, setLang] = useState<Lang>("en");
  const current = value[lang] || "";

  const update = (next: string) => onChange({ ...value, [lang]: next });

  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
          {label} {required && <span className="text-amber-400">*</span>}
        </span>
        <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-[#081127] p-0.5">
          {LANGS.map((code) => {
            const empty = !(value[code] || "").trim();
            return (
              <button
                key={code}
                type="button"
                onClick={() => setLang(code)}
                title={LANG_NAMES[code]}
                className={cn(
                  "relative rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wider transition cursor-pointer",
                  lang === code
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-white/[0.04]",
                )}
              >
                {LANG_LABELS[code]}
                {empty && (
                  <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-amber-500" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {multiline ? (
        <textarea
          dir={lang === "ar" ? "rtl" : "ltr"}
          rows={rows}
          value={current}
          placeholder={placeholder}
          onChange={(event) => update(event.target.value)}
          className={cn(
            "w-full rounded-lg bg-[#081127] border border-white/10 p-3 text-sm text-slate-100 placeholder:text-slate-500 transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500",
            lang === "ar" ? "text-right" : "text-left",
          )}
        />
      ) : (
        <input
          dir={lang === "ar" ? "rtl" : "ltr"}
          value={current}
          placeholder={placeholder}
          onChange={(event) => update(event.target.value)}
          className={cn(
            "w-full h-[38px] rounded-lg bg-[#081127] border border-white/10 px-3 text-sm text-slate-100 placeholder:text-slate-500 transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500",
            lang === "ar" ? "text-right" : "text-left",
          )}
        />
      )}

      <div className="flex items-center justify-between text-[11px] text-slate-400">
        <span>{hint || `Langue en cours : ${LANG_NAMES[lang]}`}</span>
        <span className="font-mono text-slate-500">{current.length} car.</span>
      </div>
    </div>
  );
}

// ============ TAGS INPUT COMPONENT ============
export function TagsInput({
  value,
  onChange,
  label = "Tags",
  hint = "Séparés par des virgules",
}: {
  value: string[];
  onChange: (tags: string[]) => void;
  label?: string;
  hint?: string;
}) {
  const [draft, setDraft] = useState(value.join(", "));

  useEffect(() => {
    setDraft(value.join(", "));
  }, [value]);

  const commit = () => {
    const tags = draft
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)
      .filter((tag, index, list) => list.indexOf(tag) === index);
    onChange(tags);
    setDraft(tags.join(", "));
  };

  const removeTag = (tagToRemove: string) => {
    const updated = value.filter((t) => t !== tagToRemove);
    onChange(updated);
    setDraft(updated.join(", "));
  };

  return (
    <Field label={label} hint={hint}>
      <input
        value={draft}
        placeholder="React, TypeScript, Three.js"
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            commit();
          }
        }}
        className="w-full h-[38px] rounded-lg bg-[#081127] border border-white/10 px-3 text-sm text-slate-100 placeholder:text-slate-500 transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
      />
      {value.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {value.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 text-xs text-slate-300"
            >
              <span>{tag}</span>
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="text-slate-400 hover:text-white cursor-pointer"
                aria-label={`Supprimer ${tag}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </Field>
  );
}

// ============ IMAGE UPLOADER COMPONENT ============
export function ImageUploader({
  value,
  onChange,
  label = "Image",
  hint = "JPEG, PNG ou WebP — 5 Mo maximum",
}: {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  hint?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const url = await api.uploadImage(file);
      onChange(url);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error ? uploadError.message : "Échec de l'import",
      );
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <Field label={label} hint={hint} error={error}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative h-24 w-36 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-[#081127]">
          {value ? (
            <>
              <img
                src={value}
                alt="Aperçu"
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => onChange("")}
                className="absolute right-1.5 top-1.5 rounded-md bg-black/75 p-1 text-white hover:bg-black transition cursor-pointer"
                aria-label="Retirer l'image"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-slate-500">
              <Upload className="h-5 w-5 mb-1 opacity-60" />
              <span className="text-[11px] font-medium uppercase tracking-wider">
                Aperçu
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-2">
          <input
            value={value}
            placeholder="/assets/… ou https://…"
            onChange={(event) => onChange(event.target.value)}
            className="w-full h-[38px] rounded-lg bg-[#081127] border border-white/10 px-3 text-sm text-slate-100 placeholder:text-slate-500 transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
          <div>
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(event) => void handleFile(event.target.files?.[0])}
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              icon={Upload}
              loading={uploading}
              onClick={() => inputRef.current?.click()}
            >
              Parcourir un fichier
            </Button>
          </div>
        </div>
      </div>
    </Field>
  );
}

// ============ TOGGLE COMPONENT ============
export function Toggle({
  checked,
  onChange,
  label,
  disabled = false,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-2.5 text-xs font-semibold text-slate-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 select-none"
      aria-pressed={checked}
    >
      <span
        className={cn(
          "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out",
          checked ? "bg-blue-600" : "bg-white/20",
        )}
      >
        <span
          className={cn(
            "inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out",
            checked ? "translate-x-4.5" : "translate-x-1",
          )}
        />
      </span>
      <span>{label}</span>
    </button>
  );
}

// ============ ADD BUTTON COMPONENT ============
export function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return <Button icon={Plus} onClick={onClick}>{label}</Button>;
}
