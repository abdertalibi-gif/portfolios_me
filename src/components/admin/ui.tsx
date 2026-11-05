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
  ImagePlus,
  Loader2,
  Plus,
  Upload,
  X,
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

export function Spinner({ className = "h-5 w-5" }: { className?: string }) {
  return <Loader2 className={cn("animate-spin", className)} aria-hidden="true" />;
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  loading?: boolean;
  icon?: LucideIcon;
}

export function Button({
  variant = "primary",
  loading = false,
  icon: Icon,
  className,
  children,
  disabled,
  ...rest
}: ButtonProps) {
  const variants: Record<string, string> = {
    primary:
      "bg-gradient-to-r from-[#0F7DB8] to-[#2196D3] text-white shadow-lg shadow-[#0F7DB8]/20 hover:brightness-110",
    secondary: "border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10",
    ghost: "text-slate-400 hover:text-white hover:bg-white/5",
    danger: "border border-red-500/20 bg-red-500/10 text-red-300 hover:bg-red-500/20",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        className,
      )}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? <Spinner className="h-4 w-4" /> : Icon ? <Icon className="h-4 w-4" /> : null}
      {children}
    </button>
  );
}

export function Panel({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("admin-card", className)}>{children}</div>;
}

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
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && (
          <p className="mb-2 text-[10px] font-black uppercase tracking-[0.35em] text-[#2196D3]">{eyebrow}</p>
        )}
        <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm text-slate-400">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

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
    <div>
      {label && (
        <label className="admin-label">
          {label} {required && <span className="text-[#F28C28]">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="mt-1.5 text-xs font-medium text-red-400">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
}

export function TextInput({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn("admin-input", className)} {...rest} />;
}

export function TextArea({ className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn("admin-input resize-y", className)} {...rest} />;
}

export function Select({
  className,
  children,
  ...rest
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn("admin-input", className)} {...rest}>
      {children}
    </select>
  );
}

export function Badge({
  children,
  tone = "slate",
}: {
  children: ReactNode;
  tone?: "slate" | "blue" | "green" | "amber" | "red" | "orange";
}) {
  const tones: Record<string, string> = {
    slate: "border-white/10 bg-white/5 text-slate-300",
    blue: "border-[#0F7DB8]/30 bg-[#0F7DB8]/10 text-[#6FC3F0]",
    green: "border-emerald-500/25 bg-emerald-500/10 text-emerald-300",
    amber: "border-amber-500/25 bg-amber-500/10 text-amber-300",
    red: "border-red-500/25 bg-red-500/10 text-red-300",
    orange: "border-[#F28C28]/30 bg-[#F28C28]/10 text-[#F5A65B]",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}

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
    info: "border-[#0F7DB8]/30 bg-[#0F7DB8]/10 text-[#9CD8F5]",
  };
  const Icon = type === "success" ? CheckCircle2 : AlertCircle;
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("mb-6 flex items-start gap-3 rounded-xl border px-4 py-3 text-sm", styles[type])}
      role={type === "error" ? "alert" : "status"}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="flex-1 font-medium">{children}</div>
      {onClose && (
        <button onClick={onClose} className="opacity-60 transition hover:opacity-100" aria-label="Fermer">
          <X className="h-4 w-4" />
        </button>
      )}
    </motion.div>
  );
}

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
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 px-6 py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#0F7DB8]/20 bg-[#0F7DB8]/10">
        <Icon className="h-7 w-7 text-[#2196D3]" />
      </div>
      <h3 className="text-base font-bold text-white">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-slate-400">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-xl bg-white/5", className)} />;
}

export function LoadingList({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton key={index} className="h-16 w-full" />
      ))}
    </div>
  );
}

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
        <motion.div
          className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto p-4 sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.99 }}
            transition={{ duration: 0.2 }}
            className={cn("admin-card relative my-auto w-full", wide ? "max-w-4xl" : "max-w-2xl")}
          >
            <div className="flex items-start justify-between gap-4 border-b border-white/10 px-6 py-5">
              <div>
                <h2 className="text-lg font-black text-white">{title}</h2>
                {description && <p className="mt-1 text-xs text-slate-400">{description}</p>}
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-white"
                aria-label="Fermer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="admin-scroll max-h-[65vh] overflow-y-auto px-6 py-5">{children}</div>
            {footer && <div className="flex flex-wrap justify-end gap-3 border-t border-white/10 px-6 py-4">{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

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
      <p className="text-sm leading-relaxed text-slate-300">{description}</p>
    </Modal>
  );
}

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
    <div>
      <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
        <span className="admin-label mb-0">
          {label} {required && <span className="text-[#F28C28]">*</span>}
        </span>
        <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] p-0.5">
          {LANGS.map((code) => {
            const empty = !(value[code] || "").trim();
            return (
              <button
                key={code}
                type="button"
                onClick={() => setLang(code)}
                title={LANG_NAMES[code]}
                className={cn(
                  "relative rounded-md px-2 py-1 text-[10px] font-black tracking-wider transition",
                  lang === code ? "bg-[#0F7DB8] text-white" : "text-slate-400 hover:text-white",
                )}
              >
                {LANG_LABELS[code]}
                {empty && (
                  <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-[#F28C28]" />
                )}
              </button>
            );
          })}
        </div>
      </div>
      {multiline ? (
        <TextArea
          dir={lang === "ar" ? "rtl" : "ltr"}
          rows={rows}
          value={current}
          placeholder={placeholder}
          onChange={(event) => update(event.target.value)}
        />
      ) : (
        <TextInput
          dir={lang === "ar" ? "rtl" : "ltr"}
          value={current}
          placeholder={placeholder}
          onChange={(event) => update(event.target.value)}
        />
      )}
      <div className="mt-1.5 flex items-center justify-between gap-2">
        <p className="text-xs text-slate-500">{hint || `Langue affichée : ${LANG_NAMES[lang]}`}</p>
        <p className="text-[10px] font-mono text-slate-600">{current.length}</p>
      </div>
    </div>
  );
}

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

  return (
    <Field label={label} hint={hint}>
      <TextInput
        value={draft}
        placeholder="React, Python, AI"
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            commit();
          }
        }}
      />
      {value.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {value.map((tag) => (
            <Badge key={tag} tone="blue">
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </Field>
  );
}

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
      setError(uploadError instanceof Error ? uploadError.message : "Échec de l'import");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <Field label={label} hint={hint} error={error}>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative h-28 w-full overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] sm:w-44">
          {value ? (
            <>
              <img src={value} alt="Aperçu" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => onChange("")}
                className="absolute right-2 top-2 rounded-lg bg-black/70 p-1.5 text-white transition hover:bg-red-500/80"
                aria-label="Retirer l'image"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-500">
              <ImagePlus className="h-6 w-6" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Aucune image</span>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-2">
          <TextInput
            value={value}
            placeholder="/uploads/… ou https://…"
            onChange={(event) => onChange(event.target.value)}
          />
          <div className="flex items-center gap-2">
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
              icon={Upload}
              loading={uploading}
              onClick={() => inputRef.current?.click()}
            >
              Importer une image
            </Button>
          </div>
        </div>
      </div>
    </Field>
  );
}

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
      className="flex items-center gap-3 text-sm font-medium text-slate-300 disabled:opacity-50"
      aria-pressed={checked}
    >
      <span
        className={cn(
          "relative h-6 w-11 rounded-full border transition-colors",
          checked ? "border-[#0F7DB8] bg-[#0F7DB8]" : "border-white/15 bg-white/10",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all",
            checked ? "left-[22px]" : "left-0.5",
          )}
        />
      </span>
      {label}
    </button>
  );
}

export function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return <Button icon={Plus} onClick={onClick}>{label}</Button>;
}
