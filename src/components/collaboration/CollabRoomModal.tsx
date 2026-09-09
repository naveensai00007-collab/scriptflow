import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/Dialog";
import { Button } from "../ui/Button";
import { Users2, Copy, Send, Circle, MessageSquare } from "lucide-react";
import { useToast } from "../ui/Toast";

interface CollabRoomModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ChatMessage {
  id: string;
  sender: string;
  role: string;
  avatarColor: string;
  text: string;
  timestamp: string;
}

const INITIAL_COLLABORATORS = [
  { name: "Naveen Sai", role: "Creator & Lead Writer", status: "Active (Cursor at Scene 1)", color: "bg-primary text-white" },
  { name: "Vikram Rao", role: "Co-Writer", status: "Editing Scene 3 Dialogue", color: "bg-emerald-600 text-white" },
  { name: "Maya Sen", role: "Script Doctor", status: "Reviewing Non-Linear Twists", color: "bg-sky-600 text-white" },
];

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "msg-1",
    sender: "Maya Sen",
    role: "Script Doctor",
    avatarColor: "bg-sky-600",
    text: "The flashback in Scene 2 really establishes the emotional stakes without slowing down the first act.",
    timestamp: "10:14 AM",
  },
  {
    id: "msg-2",
    sender: "Vikram Rao",
    role: "Co-Writer",
    avatarColor: "bg-emerald-600",
    text: "Pushed an alternative line for Kabir in Scene 3 into the Scratch Pad. Check it out!",
    timestamp: "10:18 AM",
  },
];

export function CollabRoomModal({ open, onOpenChange }: CollabRoomModalProps) {
  const { showToast } = useToast();

  const [roomCode] = useState("SCRIPTFLOW-ROOM-882");
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputMessage, setInputMessage] = useState("");

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://scriptflow.naveensai.dev/join/${roomCode}`);
    showToast("Copied collaboration room link to clipboard", "success");
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "Naveen Sai",
      role: "Creator & Lead Writer",
      avatarColor: "bg-primary",
      text: inputMessage.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputMessage("");

    // Simulate instant writers room feedback
    setTimeout(() => {
      const responses = [
        "Love that direction! Fits Kabir's character arc perfectly.",
        "Noted! I'll update the breakdown set list accordingly.",
        "Great line. Let's make sure the payoff lands in Act 3.",
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      const botMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: "Vikram Rao",
        role: "Co-Writer",
        avatarColor: "bg-emerald-600",
        text: randomResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 1200);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-6 bg-surface border-border">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Users2 className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold font-sans">
                  Real-Time Writers Room
                </DialogTitle>
                <DialogDescription className="text-xs text-text-muted">
                  Low-latency collaborative screenwriting room powered by ScriptFlow
                </DialogDescription>
              </div>
            </div>

            <Button size="sm" variant="secondary" onClick={handleCopyLink} className="text-xs">
              <Copy className="w-3.5 h-3.5 mr-1" />
              <span>Copy Invite</span>
            </Button>
          </div>
        </DialogHeader>

        {/* Room Code Info Banner */}
        <div className="p-3 bg-surface-2/60 border border-border rounded-card mt-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 font-mono">
            <span className="text-text-muted font-sans font-semibold">Active Room:</span>
            <span className="text-primary font-bold">{roomCode}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
            <Circle className="w-2.5 h-2.5 fill-current animate-pulse" />
            <span>Encrypted Room Connected</span>
          </div>
        </div>

        {/* Active Writers Row */}
        <div className="space-y-1.5 mt-3">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
            Room Presence ({INITIAL_COLLABORATORS.length} Active Writers)
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {INITIAL_COLLABORATORS.map((collab, i) => (
              <div
                key={i}
                className="p-2.5 rounded-card bg-surface-2/40 border border-border/70 flex items-center gap-2 text-xs"
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 ${collab.color}`}
                >
                  {collab.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-text truncate">{collab.name}</div>
                  <div className="text-[10px] text-text-muted truncate">{collab.status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Writers Room Chat */}
        <div className="flex-1 flex flex-col min-h-[220px] max-h-[300px] border border-border rounded-card mt-3 bg-surface overflow-hidden">
          <div className="px-3 py-2 border-b border-border/80 bg-surface-2/50 flex items-center gap-1.5 text-xs font-semibold text-text select-none">
            <MessageSquare className="w-3.5 h-3.5 text-primary" />
            <span>Room Pitch & Discussion Channel</span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 text-xs">
            {messages.map((m) => (
              <div key={m.id} className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-text">{m.sender}</span>
                  <span className="text-[10px] px-1 rounded bg-surface-2 text-text-muted font-medium">
                    {m.role}
                  </span>
                  <span className="text-[10px] text-text-muted font-mono">{m.timestamp}</span>
                </div>
                <p className="text-text/90 leading-relaxed pl-1">{m.text}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendMessage} className="p-2 border-t border-border flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Pitch a twist, drop a line suggestion, or chat with co-writers..."
              className="flex-1 text-xs px-2.5 py-1.5 bg-surface-2 border border-border rounded outline-none focus:border-primary text-text"
            />
            <Button type="submit" size="sm" variant="primary">
              <Send className="w-3.5 h-3.5" />
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
