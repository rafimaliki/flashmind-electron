import { useState, useEffect, useRef } from "react";
import {
  Plus,
  Folder,
  FolderOpen,
  Trash2,
  X,
  FileText,
  FolderPlus,
  AlertTriangle,
  Loader2,
  PlayCircle,
  RotateCcw,
  ChevronRight,
} from "lucide-react";

const api = window.electronAPI;

// ── Helpers ───────────────────────────────────────────────────

function shortPath(fullPath) {
  // Show last 2 path segments so the path stays readable when truncated
  const parts = fullPath.replace(/\\/g, "/").split("/");
  if (parts.length <= 2) return fullPath;
  return "…/" + parts.slice(-2).join("/");
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ── Sub-components ────────────────────────────────────────────

function SectionLabel({ children }) {
  return (
    <p
      className="text-[10px] uppercase tracking-widest font-semibold font-mono mb-3"
      style={{ color: "var(--text-muted)" }}
    >
      {children}
    </p>
  );
}

function IconBtn({ icon: Icon, label, danger, onClick, small }) {
  const size = small ? 13 : 15;
  return (
    <button
      title={label}
      onClick={onClick}
      className="flex items-center justify-center rounded-md transition-all duration-100"
      style={{
        width: small ? 24 : 28,
        height: small ? 24 : 28,
        color: danger ? "#f87171" : "var(--text-muted)",
        background: "transparent",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = danger
          ? "rgba(248,113,113,0.12)"
          : "var(--bg-overlay)";
        e.currentTarget.style.color = danger
          ? "#f87171"
          : "var(--text-primary)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.color = danger ? "#f87171" : "var(--text-muted)";
      }}
    >
      <Icon size={size} />
    </button>
  );
}

// ── Profile List (left panel) ─────────────────────────────────

function ProfileItem({ profile, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-3 py-2.5 rounded-lg transition-all duration-100 group relative"
      style={{
        background: isActive ? "var(--accent-dim)" : "transparent",
        color: isActive ? "var(--accent)" : "var(--text-secondary)",
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = "var(--bg-overlay)";
          e.currentTarget.style.color = "var(--text-primary)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = "var(--text-secondary)";
        }
      }}
    >
      <p className="text-sm font-medium truncate">{profile.name}</p>
      <p
        className="text-[11px] mt-0.5 font-mono"
        style={{
          color: isActive ? "rgba(245,158,11,0.6)" : "var(--text-muted)",
        }}
      >
        {profile.folders.length}{" "}
        {profile.folders.length === 1 ? "folder" : "folders"}
      </p>
      {isActive && (
        <span
          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-8 rounded-full"
          style={{ background: "var(--accent)" }}
        />
      )}
    </button>
  );
}

function ProfileList({ profiles, selectedId, onSelect, onNew, loading }) {
  return (
    <div
      className="w-56 flex-shrink-0 flex flex-col h-full"
      style={{
        borderRight: "1px solid var(--border)",
        background: "var(--bg-surface)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-4"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <span
          className="text-sm font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          Profiles
        </span>
        <button
          onClick={onNew}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-100"
          style={{
            background: "var(--accent-dim)",
            color: "var(--accent)",
            border: "1px solid rgba(245,158,11,0.2)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(245,158,11,0.18)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "var(--accent-dim)";
          }}
        >
          <Plus size={12} />
          New
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2
              size={18}
              className="animate-spin"
              style={{ color: "var(--text-muted)" }}
            />
          </div>
        )}
        {!loading && profiles.length === 0 && (
          <div className="px-3 py-6 text-center">
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              No profiles yet.
            </p>
            <button
              onClick={onNew}
              className="text-xs mt-2 underline"
              style={{ color: "var(--accent)" }}
            >
              Create one
            </button>
          </div>
        )}
        {profiles.map((p) => (
          <ProfileItem
            key={p.id}
            profile={p}
            isActive={p.id === selectedId}
            onClick={() => onSelect(p.id)}
          />
        ))}
      </div>
    </div>
  );
}

// ── Folder Item ───────────────────────────────────────────────

function FolderItem({ folderPath, onRemove }) {
  return (
    <div
      className="group flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-100"
      style={{
        background: "var(--bg-overlay)",
        border: "1px solid var(--border)",
      }}
    >
      <Folder size={15} style={{ color: "var(--accent)", flexShrink: 0 }} />
      <span
        className="flex-1 text-xs font-mono truncate"
        style={{ color: "var(--text-secondary)" }}
        title={folderPath}
      >
        {folderPath}
      </span>
      <IconBtn icon={X} label="Remove folder" danger onClick={onRemove} small />
    </div>
  );
}

// ── Profile Detail (right panel) ─────────────────────────────

function SessionBanner({ activeSession, onContinue, onStartFresh }) {
  const { ratedCount, totalCards } = activeSession;
  const pct = totalCards > 0 ? (ratedCount / totalCards) * 100 : 0;
  const [confirmFresh, setConfirmFresh] = useState(false);

  return (
    <div
      className="mb-6 rounded-xl p-4 anim-item"
      style={{
        background: "rgba(245,158,11,0.08)",
        border: "1px solid rgba(245,158,11,0.2)",
      }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold" style={{ color: "var(--accent)" }}>
          Session in progress
        </p>
        <span
          className="text-[11px] font-mono"
          style={{ color: "rgba(245,158,11,0.7)" }}
        >
          {ratedCount} / {totalCards} cards
        </span>
      </div>

      {/* Mini progress bar */}
      <div
        className="h-1 rounded-full mb-3"
        style={{ background: "rgba(245,158,11,0.15)" }}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: "var(--accent)" }}
        />
      </div>

      {/* Action buttons */}
      {!confirmFresh ? (
        <div className="flex gap-2">
          <button
            onClick={onContinue}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex-1 justify-center"
            style={{
              background: "var(--accent-dim)",
              color: "var(--accent)",
              border: "1px solid rgba(245,158,11,0.25)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(245,158,11,0.18)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--accent-dim)";
            }}
          >
            <ChevronRight size={13} />
            Continue
          </button>
          <button
            onClick={() => setConfirmFresh(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{
              color: "var(--text-muted)",
              border: "1px solid var(--border)",
              background: "transparent",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--text-secondary)";
              e.currentTarget.style.background = "var(--bg-overlay)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--text-muted)";
              e.currentTarget.style.background = "transparent";
            }}
          >
            <RotateCcw size={12} />
            Start fresh
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <AlertTriangle
            size={13}
            style={{ color: "#f87171", flexShrink: 0 }}
          />
          <p
            className="flex-1 text-xs"
            style={{ color: "var(--text-secondary)" }}
          >
            Discard progress?
          </p>
          <button
            onClick={onStartFresh}
            className="px-2.5 py-1 rounded-lg text-xs font-medium"
            style={{ background: "#f87171", color: "#0a0a0d" }}
          >
            Yes
          </button>
          <button
            onClick={() => setConfirmFresh(false)}
            className="px-2.5 py-1 rounded-lg text-xs font-medium"
            style={{
              background: "var(--bg-overlay)",
              color: "var(--text-secondary)",
              border: "1px solid var(--border)",
            }}
          >
            No
          </button>
        </div>
      )}
    </div>
  );
}

function ProfileDetail({
  profile,
  cardCount,
  scanning,
  activeSession,
  onAddFolder,
  onRemoveFolder,
  onDelete,
  onUpdateCardsPerSession,
  onStartSession,
  onContinueSession,
  onStartFresh,
}) {
  const [localName, setLocalName] = useState(profile.name);
  const [localCPS, setLocalCPS] = useState(profile.cardsPerSession);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Sync when profile changes
  useEffect(() => {
    setLocalName(profile.name);
    setLocalCPS(profile.cardsPerSession);
    setShowDeleteConfirm(false);
  }, [profile.id]);

  return (
    <div className="h-full overflow-y-auto p-8 max-w-2xl mx-auto">
      {/* ── Profile Header ── */}
      <div className="mb-8 anim-item" style={{ animationDelay: "0.05s" }}>
        <p
          className="text-[10px] font-mono uppercase tracking-widest mb-2"
          style={{ color: "var(--text-muted)" }}
        >
          Created {formatDate(profile.createdAt)}
        </p>
        <h2
          className="text-2xl font-semibold tracking-tight"
          style={{ color: "var(--text-primary)" }}
        >
          {profile.name}
        </h2>

        {/* Card count row */}
        <div className="mt-3 flex items-center gap-3 flex-wrap">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg"
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border)",
            }}
          >
            <FileText size={13} style={{ color: "var(--text-muted)" }} />
            {scanning ? (
              <span
                className="text-xs font-mono flex items-center gap-1.5"
                style={{ color: "var(--text-muted)" }}
              >
                <Loader2 size={11} className="animate-spin" /> scanning…
              </span>
            ) : (
              <span
                className="text-xs font-mono"
                style={{
                  color: cardCount > 0 ? "var(--accent)" : "var(--text-muted)",
                }}
              >
                {cardCount ?? "—"} {cardCount === 1 ? "card" : "cards"} found
              </span>
            )}
          </div>

          {/* Only show plain Start Session when no active session */}
          {!activeSession && (
            <button
              onClick={onStartSession}
              disabled={!cardCount}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                background: cardCount
                  ? "var(--accent-dim)"
                  : "var(--bg-elevated)",
                color: cardCount ? "var(--accent)" : "var(--text-muted)",
                border: cardCount
                  ? "1px solid rgba(245,158,11,0.25)"
                  : "1px solid var(--border)",
                cursor: cardCount ? "pointer" : "not-allowed",
              }}
              onMouseEnter={(e) => {
                if (cardCount)
                  e.currentTarget.style.background = "rgba(245,158,11,0.18)";
              }}
              onMouseLeave={(e) => {
                if (cardCount)
                  e.currentTarget.style.background = "var(--accent-dim)";
              }}
            >
              <PlayCircle size={13} />
              Start Session
            </button>
          )}
        </div>
      </div>

      {/* ── Active Session Banner ── */}
      {activeSession && (
        <SessionBanner
          activeSession={activeSession}
          onContinue={onContinueSession}
          onStartFresh={onStartFresh}
        />
      )}

      {/* ── Folders ── */}
      <div className="mb-8 anim-item" style={{ animationDelay: "0.10s" }}>
        <SectionLabel>Folders</SectionLabel>

        {profile.folders.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-10 rounded-xl text-center"
            style={{
              background: "var(--bg-elevated)",
              border: "1px dashed var(--border)",
            }}
          >
            <FolderOpen
              size={28}
              style={{ color: "var(--text-muted)", marginBottom: 8 }}
            />
            <p
              className="text-sm mb-1"
              style={{ color: "var(--text-secondary)" }}
            >
              No folders added
            </p>
            <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
              Add a folder to start scanning Markdown files
            </p>
            <AddFolderButton onClick={onAddFolder} />
          </div>
        ) : (
          <div className="space-y-2">
            {profile.folders.map((fp) => (
              <FolderItem
                key={fp}
                folderPath={fp}
                onRemove={() => onRemoveFolder(fp)}
              />
            ))}
            <div className="pt-1">
              <AddFolderButton onClick={onAddFolder} />
            </div>
          </div>
        )}
      </div>

      {/* ── Settings ── */}
      <div className="mb-8 anim-item" style={{ animationDelay: "0.15s" }}>
        <SectionLabel>Settings</SectionLabel>
        <div
          className="rounded-xl p-5"
          style={{
            background: "var(--bg-elevated)",
            border: "1px solid var(--border)",
          }}
        >
          <label className="flex items-center justify-between gap-4">
            <div>
              <p
                className="text-sm font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                Cards per session
              </p>
              <p
                className="text-xs mt-0.5"
                style={{ color: "var(--text-muted)" }}
              >
                How many cards to review in one session
              </p>
            </div>
            <input
              type="number"
              min={1}
              max={200}
              value={localCPS}
              onChange={(e) => setLocalCPS(Number(e.target.value))}
              onBlur={() => {
                const val = Math.max(1, Math.min(200, localCPS || 20));
                setLocalCPS(val);
                onUpdateCardsPerSession(val);
              }}
              className="w-20 text-center text-sm font-mono rounded-lg px-2 py-1.5 outline-none transition-all"
              style={{
                background: "var(--bg-overlay)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "var(--accent)";
              }}
            />
          </label>
        </div>
      </div>

      {/* ── Danger Zone ── */}
      <div className="anim-item" style={{ animationDelay: "0.20s" }}>
        <SectionLabel>Danger Zone</SectionLabel>
        <div
          className="rounded-xl p-5"
          style={{
            background: "var(--bg-elevated)",
            border: "1px solid rgba(248,113,113,0.15)",
          }}
        >
          {!showDeleteConfirm ? (
            <div className="flex items-center justify-between">
              <div>
                <p
                  className="text-sm font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  Delete profile
                </p>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: "var(--text-muted)" }}
                >
                  Permanently removes the profile and all review history
                </p>
              </div>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{
                  color: "#f87171",
                  background: "rgba(248,113,113,0.1)",
                  border: "1px solid rgba(248,113,113,0.2)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(248,113,113,0.18)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(248,113,113,0.1)";
                }}
              >
                <Trash2 size={13} />
                Delete
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <AlertTriangle
                size={16}
                style={{ color: "#f87171", flexShrink: 0 }}
              />
              <p
                className="flex-1 text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                Are you sure? This cannot be undone.
              </p>
              <button
                onClick={onDelete}
                className="px-3 py-1.5 rounded-lg text-xs font-medium"
                style={{ background: "#f87171", color: "#0a0a0d" }}
              >
                Yes, delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium"
                style={{
                  background: "var(--bg-overlay)",
                  color: "var(--text-secondary)",
                  border: "1px solid var(--border)",
                }}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AddFolderButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-100"
      style={{
        color: "var(--text-secondary)",
        border: "1px solid var(--border)",
        background: "transparent",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = "var(--text-primary)";
        e.currentTarget.style.background = "var(--bg-overlay)";
        e.currentTarget.style.borderColor = "#333348";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = "var(--text-secondary)";
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.borderColor = "var(--border)";
      }}
    >
      <FolderPlus size={14} />
      Add folder
    </button>
  );
}

// ── Empty state (no profile selected) ────────────────────────

function EmptyDetail({ onNew, noProfiles }) {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center anim-item">
        <FolderOpen
          size={40}
          style={{ color: "var(--text-muted)", margin: "0 auto 16px" }}
        />
        <p
          className="text-base font-medium mb-1"
          style={{ color: "var(--text-secondary)" }}
        >
          {noProfiles ? "No profiles yet" : "Select a profile"}
        </p>
        <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
          {noProfiles
            ? "Profiles group folders of Markdown files into review sets"
            : "Choose a profile from the list to manage it"}
        </p>
        {noProfiles && (
          <button
            onClick={onNew}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: "var(--accent-dim)",
              color: "var(--accent)",
              border: "1px solid rgba(245,158,11,0.25)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(245,158,11,0.18)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--accent-dim)";
            }}
          >
            <Plus size={15} />
            Create your first profile
          </button>
        )}
      </div>
    </div>
  );
}

// ── Create Profile Modal ──────────────────────────────────────

function CreateModal({ onCreate, onClose }) {
  const [name, setName] = useState("");
  const [cps, setCps] = useState(20);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    try {
      await onCreate(name.trim(), cps);
    } finally {
      setBusy(false);
    }
  }

  function handleKey(e) {
    if (e.key === "Escape") onClose();
  }

  const inputStyle = {
    background: "var(--bg-overlay)",
    border: "1px solid var(--border)",
    color: "var(--text-primary)",
    borderRadius: 8,
    padding: "8px 12px",
    fontSize: 14,
    width: "100%",
    outline: "none",
    transition: "border-color 0.1s",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onKeyDown={handleKey}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative z-10 w-full max-w-md rounded-2xl p-6 anim-item"
        style={{
          background: "var(--bg-elevated)",
          border: "1px solid var(--border)",
          boxShadow: "0 32px 64px rgba(0,0,0,0.5)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2
            className="text-base font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            New Profile
          </h2>
          <IconBtn icon={X} label="Close" onClick={onClose} small />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label
              className="block text-xs font-medium mb-1.5"
              style={{ color: "var(--text-secondary)" }}
            >
              Profile name
            </label>
            <input
              ref={inputRef}
              type="text"
              placeholder="e.g. Programming Notes"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={inputStyle}
              onFocus={(e) => {
                e.target.style.borderColor = "var(--accent)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "var(--border)";
              }}
            />
          </div>

          {/* Cards per session */}
          <div>
            <label
              className="block text-xs font-medium mb-1.5"
              style={{ color: "var(--text-secondary)" }}
            >
              Cards per session
            </label>
            <input
              type="number"
              min={1}
              max={200}
              value={cps}
              onChange={(e) => setCps(Number(e.target.value))}
              style={{ ...inputStyle, width: 100 }}
              onFocus={(e) => {
                e.target.style.borderColor = "var(--accent)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "var(--border)";
              }}
            />
            <p
              className="text-[11px] mt-1.5"
              style={{ color: "var(--text-muted)" }}
            >
              You can adjust this later in the profile settings.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                background: "var(--bg-overlay)",
                color: "var(--text-secondary)",
                border: "1px solid var(--border)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--text-primary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--text-secondary)";
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || busy}
              className="flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
              style={{
                background: name.trim() ? "var(--accent)" : "var(--bg-overlay)",
                color: name.trim() ? "#0a0a0d" : "var(--text-muted)",
                cursor: name.trim() ? "pointer" : "not-allowed",
              }}
            >
              {busy ? <Loader2 size={14} className="animate-spin" /> : null}
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────

export default function Profiles({ onStartSession, onResumeSession }) {
  const [profiles, setProfiles] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [cardCount, setCardCount] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeSession, setActiveSession] = useState(null);

  const selectedProfile = profiles.find((p) => p.id === selectedId) ?? null;

  useEffect(() => {
    loadProfiles();
  }, []);

  useEffect(() => {
    if (selectedId) {
      scanCards(selectedId);
      loadActiveSession(selectedId);
    } else {
      setCardCount(null);
      setActiveSession(null);
    }
  }, [selectedId]);

  async function loadProfiles() {
    setLoading(true);
    try {
      const list = await api.profiles.getAll();
      setProfiles(list);
      if (list.length > 0) setSelectedId(list[0].id);
    } finally {
      setLoading(false);
    }
  }

  async function loadActiveSession(profileId) {
    const session = await api.sessions.getActive(profileId);
    setActiveSession(session);
  }

  async function scanCards(profileId) {
    setScanning(true);
    setCardCount(null);
    try {
      const result = await api.profiles.scan(profileId);
      setCardCount(result.count);
    } finally {
      setScanning(false);
    }
  }

  async function handleCreate(name, cardsPerSession) {
    const profile = await api.profiles.create({ name, cardsPerSession });
    setProfiles((prev) => [...prev, profile]);
    setSelectedId(profile.id);
    setShowCreate(false);
  }

  async function handleDelete() {
    if (!selectedId) return;
    await api.profiles.delete(selectedId);
    const remaining = profiles.filter((p) => p.id !== selectedId);
    setProfiles(remaining);
    setSelectedId(remaining[0]?.id ?? null);
  }

  async function handleAddFolder() {
    if (!selectedId) return;
    const folderPath = await api.dialog.openFolder();
    if (!folderPath) return;
    const updated = await api.profiles.addFolder(selectedId, folderPath);
    setProfiles((prev) => prev.map((p) => (p.id === selectedId ? updated : p)));
    scanCards(selectedId);
  }

  async function handleRemoveFolder(folderPath) {
    if (!selectedId) return;
    const updated = await api.profiles.removeFolder(selectedId, folderPath);
    setProfiles((prev) => prev.map((p) => (p.id === selectedId ? updated : p)));
    scanCards(selectedId);
  }

  async function handleUpdateCardsPerSession(value) {
    if (!selectedId) return;
    const updated = await api.profiles.update(selectedId, {
      cardsPerSession: value,
    });
    setProfiles((prev) => prev.map((p) => (p.id === selectedId ? updated : p)));
  }

  async function handleStartFresh() {
    if (!selectedId || !selectedProfile) return;
    await api.sessions.clearActive(selectedId);
    setActiveSession(null);
    onStartSession?.(selectedProfile);
  }

  function handleContinueSession() {
    if (!selectedProfile) return;
    onResumeSession?.(selectedProfile);
  }

  return (
    <div className="h-full flex" style={{ background: "var(--bg-base)" }}>
      <ProfileList
        profiles={profiles}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onNew={() => setShowCreate(true)}
        loading={loading}
      />

      <main className="flex-1 overflow-hidden dot-grid">
        {selectedProfile ? (
          <ProfileDetail
            key={selectedProfile.id}
            profile={selectedProfile}
            cardCount={cardCount}
            scanning={scanning}
            activeSession={activeSession}
            onAddFolder={handleAddFolder}
            onRemoveFolder={handleRemoveFolder}
            onDelete={handleDelete}
            onUpdateCardsPerSession={handleUpdateCardsPerSession}
            onStartSession={() => onStartSession?.(selectedProfile)}
            onContinueSession={handleContinueSession}
            onStartFresh={handleStartFresh}
          />
        ) : (
          <EmptyDetail
            onNew={() => setShowCreate(true)}
            noProfiles={!loading && profiles.length === 0}
          />
        )}
      </main>

      {showCreate && (
        <CreateModal
          onCreate={handleCreate}
          onClose={() => setShowCreate(false)}
        />
      )}
    </div>
  );
}
