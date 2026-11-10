import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Inbox, Mail, MailOpen, Reply, Search, Trash2 } from "lucide-react";
import type { Message } from "../../../shared/types";
import { api } from "../../services/api";
import {
  Alert,
  Badge,
  Button,
  ConfirmDialog,
  EmptyState,
  LoadingList,
  Modal,
  PageHeader,
  Panel,
  cn,
} from "../../components/admin/ui";

type Filter = "all" | "unread" | "read";

export default function MessagesAdmin() {
  const [items, setItems] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Message | null>(null);
  const [busyId, setBusyId] = useState("");
  const [deleting, setDeleting] = useState<Message | null>(null);
  const [deletingBusy, setDeletingBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const { items: messages } = await api.getMessages();
      setItems(messages);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Impossible de charger les messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const unreadCount = items.filter((message) => !message.read).length;

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return items
      .filter((message) => {
        if (filter === "unread") return !message.read;
        if (filter === "read") return message.read;
        return true;
      })
      .filter(
        (message) =>
          !query ||
          [message.name, message.email, message.subject, message.message].join(" ").toLowerCase().includes(query),
      );
  }, [items, filter, search]);

  const toggleRead = async (message: Message) => {
    setBusyId(message.id);
    setError("");
    try {
      const { item } = await api.updateMessage(message.id, !message.read);
      setItems((current) => current.map((entry) => (entry.id === item.id ? item : entry)));
      setSelected((current) => (current && current.id === item.id ? item : current));
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Échec de la mise à jour");
    } finally {
      setBusyId("");
    }
  };

  const openMessage = async (message: Message) => {
    setSelected(message);
    if (!message.read) await toggleRead(message);
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeletingBusy(true);
    try {
      await api.deleteMessage(deleting.id);
      setItems((current) => current.filter((entry) => entry.id !== deleting.id));
      if (selected?.id === deleting.id) setSelected(null);
      setDeleting(null);
      setNotice("Message supprimé.");
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Échec de la suppression");
    } finally {
      setDeletingBusy(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-5"
    >
      <PageHeader
        eyebrow="Boîte de réception"
        title="Messages reçus"
        description={`${items.length} message${items.length > 1 ? "s" : ""} au total · ${unreadCount} non lu${unreadCount > 1 ? "s" : ""}`}
        actions={
          <Button variant="secondary" icon={Inbox} onClick={() => void load()} loading={loading}>
            Actualiser
          </Button>
        }
      />

      {error && <Alert type="error" onClose={() => setError("")}>{error}</Alert>}
      {notice && <Alert type="success" onClose={() => setNotice("")}>{notice}</Alert>}

      {/* Toolbar: Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="inline-flex items-center rounded-lg border border-white/10 bg-[#081127] p-1 self-start">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-semibold transition cursor-pointer",
              filter === "all"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-white/[0.04]",
            )}
          >
            Tous ({items.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("unread")}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-semibold transition cursor-pointer",
              filter === "unread"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-white/[0.04]",
            )}
          >
            Non lus ({unreadCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter("read")}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-semibold transition cursor-pointer",
              filter === "read"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-white/[0.04]",
            )}
          >
            Lus ({items.length - unreadCount})
          </button>
        </div>

        <div className="relative sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Rechercher par nom, email..."
            className="h-[38px] w-full rounded-lg bg-[#081127] border border-white/10 pl-9 pr-3 text-xs sm:text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {loading ? (
        <LoadingList rows={3} />
      ) : filtered.length === 0 ? (
        <Panel>
          <EmptyState
            icon={Mail}
            title={items.length === 0 ? "Aucun message reçu" : "Aucun résultat trouvé"}
            description={
              items.length === 0
                ? "Les messages envoyés par les visiteurs via le portfolio apparaîtront ici."
                : "Aucun message ne correspond à votre filtre de recherche."
            }
          />
        </Panel>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((message) => (
            <Panel
              key={message.id}
              className={cn(
                "p-3.5 sm:p-4 hover:border-white/20 transition-all duration-150 cursor-pointer",
                !message.read && "border-l-3 border-l-blue-500 bg-[#0D1730]",
              )}
            >
              <div className="flex items-start gap-3.5" onClick={() => void openMessage(message)}>
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                    message.read
                      ? "bg-white/[0.04] text-slate-400 border border-white/5"
                      : "bg-blue-500/15 text-cyan-400 border border-blue-500/30",
                  )}
                >
                  {message.name.slice(0, 2).toUpperCase()}
                </div>

                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className={cn("text-xs sm:text-sm truncate", message.read ? "font-medium text-slate-200" : "font-bold text-white")}>
                      {message.subject}
                    </p>
                    {!message.read && <Badge tone="amber">Nouveau</Badge>}
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">
                    {message.name} · {message.email}
                  </p>
                  <p className="text-xs text-slate-400 line-clamp-1 pt-0.5">
                    {message.message}
                  </p>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-2 pl-2">
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(message.createdAt).toLocaleDateString("fr-FR")}
                  </span>
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => toggleRead(message)}
                      disabled={busyId === message.id}
                      className="rounded p-1 text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                      title={message.read ? "Marquer comme non lu" : "Marquer comme lu"}
                    >
                      {message.read ? <Mail className="h-3.5 w-3.5" /> : <MailOpen className="h-3.5 w-3.5 text-blue-400" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleting(message)}
                      className="rounded p-1 text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer"
                      title="Supprimer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </Panel>
          ))}
        </div>
      )}

      {/* Message Reader Modal */}
      <Modal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected?.subject || "Détail du message"}
        description={selected ? `${selected.name} (${selected.email})` : undefined}
        footer={
          selected ? (
            <div className="flex items-center justify-between w-full">
              <Button variant="danger" size="sm" icon={Trash2} onClick={() => setDeleting(selected)}>
                Supprimer
              </Button>
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" onClick={() => setSelected(null)}>
                  Fermer
                </Button>
                <a
                  href={`mailto:${selected.email}?subject=${encodeURIComponent(`Re: ${selected.subject}`)}`}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-500 px-3 py-1.5 text-xs font-semibold text-white transition"
                >
                  <Reply className="h-3.5 w-3.5" />
                  Répondre par email
                </a>
              </div>
            </div>
          ) : undefined
        }
      >
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-white/5">
              <span>De : <strong className="text-white">{selected.name}</strong> &lt;{selected.email}&gt;</span>
              <span>{new Date(selected.createdAt).toLocaleString("fr-FR")}</span>
            </div>
            <div className="rounded-lg bg-[#081127] border border-white/10 p-4 text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
              {selected.message}
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Supprimer ce message ?"
        description={`Le message de « ${deleting?.name || ""} » sera définitivement supprimé.`}
        loading={deletingBusy}
        onCancel={() => setDeleting(null)}
        onConfirm={() => void confirmDelete()}
      />
    </motion.div>
  );
}
