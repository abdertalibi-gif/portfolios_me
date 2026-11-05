import { useEffect, useMemo, useState } from "react";
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
    <div>
      <PageHeader
        eyebrow="Boîte de réception"
        title="Messages"
        description={`${items.length} message${items.length > 1 ? "s" : ""} · ${unreadCount} non lu${unreadCount > 1 ? "s" : ""}`}
        actions={
          <Button variant="secondary" icon={Inbox} onClick={() => void load()} loading={loading}>
            Actualiser
          </Button>
        }
      />

      {error && <Alert type="error" onClose={() => setError("")}>{error}</Alert>}
      {notice && <Alert type="success" onClose={() => setNotice("")}>{notice}</Alert>}

      <Panel className="mb-4 flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1">
          {[
            { id: "all" as const, label: `Tous (${items.length})` },
            { id: "unread" as const, label: `Non lus (${unreadCount})` },
            { id: "read" as const, label: `Lus (${items.length - unreadCount})` },
          ].map((entry) => (
            <button
              key={entry.id}
              onClick={() => setFilter(entry.id)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-bold transition",
                filter === entry.id ? "bg-[#0F7DB8] text-white" : "text-slate-400 hover:text-white",
              )}
            >
              {entry.label}
            </button>
          ))}
        </div>
        <div className="relative sm:w-72">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Rechercher un message…"
            className="admin-input pl-10"
          />
        </div>
      </Panel>

      {loading ? (
        <LoadingList rows={4} />
      ) : filtered.length === 0 ? (
        <Panel className="p-4">
          <EmptyState
            icon={Mail}
            title={items.length === 0 ? "Aucun message" : "Aucun résultat"}
            description={
              items.length === 0
                ? "Les messages envoyés depuis le formulaire de contact apparaîtront ici."
                : "Modifiez votre recherche ou le filtre appliqué."
            }
          />
        </Panel>
      ) : (
        <div className="space-y-2">
          {filtered.map((message) => (
            <Panel
              key={message.id}
              className={cn(
                "cursor-pointer p-4 transition hover:border-[#0F7DB8]/35",
                !message.read && "border-l-2 border-l-[#F28C28]",
              )}
            >
              <div className="flex items-start gap-3" onClick={() => void openMessage(message)}>
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-black",
                    message.read
                      ? "bg-white/5 text-slate-400"
                      : "bg-[#0F7DB8]/15 text-[#6FC3F0]",
                  )}
                >
                  {message.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className={cn("truncate text-sm", message.read ? "font-semibold text-slate-300" : "font-black text-white")}>
                      {message.subject}
                    </p>
                    {!message.read && <Badge tone="orange">Nouveau</Badge>}
                  </div>
                  <p className="mt-0.5 truncate text-xs text-slate-500">
                    {message.name} · {message.email}
                  </p>
                  <p className="mt-1 line-clamp-1 text-xs text-slate-400">{message.message}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <span className="text-[10px] font-semibold text-slate-600">
                    {new Date(message.createdAt).toLocaleDateString("fr-FR")}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        void toggleRead(message);
                      }}
                      disabled={busyId === message.id}
                      className="rounded-lg p-1.5 text-slate-500 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
                      aria-label={message.read ? "Marquer comme non lu" : "Marquer comme lu"}
                    >
                      {message.read ? <Mail className="h-3.5 w-3.5" /> : <MailOpen className="h-3.5 w-3.5" />}
                    </button>
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        setDeleting(message);
                      }}
                      className="rounded-lg p-1.5 text-slate-500 transition hover:bg-red-500/15 hover:text-red-300"
                      aria-label="Supprimer"
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

      <Modal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected?.subject || "Message"}
        description={selected ? `${selected.name} · ${selected.email}` : undefined}
        footer={
          selected ? (
            <>
              <Button variant="secondary" icon={Trash2} onClick={() => setDeleting(selected)}>
                Supprimer
              </Button>
              <a
                href={`mailto:${selected.email}?subject=${encodeURIComponent(`Re: ${selected.subject}`)}`}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0F7DB8] to-[#2196D3] px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
              >
                <Reply className="h-4 w-4" />
                Répondre par email
              </a>
            </>
          ) : undefined
        }
      >
        {selected && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
              <Badge tone={selected.read ? "slate" : "orange"}>{selected.read ? "Lu" : "Non lu"}</Badge>
              <span>
                Reçu le {new Date(selected.createdAt).toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" })}
              </span>
            </div>
            <div className="admin-panel whitespace-pre-wrap p-4 text-sm leading-relaxed text-slate-200">
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
    </div>
  );
}
