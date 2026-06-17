"use client";
import { useEffect } from "react";
import { Heart, UserPlus, Coins, Bell, MessageSquare, ShoppingBag, Loader2 } from "lucide-react";
import { useNotifications, useMarkNotificationsRead } from "../../hooks/useApi";
import { ListSkeleton } from "../../components/ui/Skeleton";

const ICONS: Record<string, any> = { like: Heart, follow: UserPlus, tip: Coins, comment: MessageSquare, purchase: ShoppingBag };

/** Bildirimler — kalici gecmis (API), acilinca okundu isaretlenir. */
export function Notifications() {
  const { data, isLoading } = useNotifications();
  const markRead = useMarkNotificationsRead();

  useEffect(() => {
    if (data && data.unread > 0) markRead.mutate();
  }, [data?.unread]);

  return (
    <div className="notifs">
      <header className="topbar">
        <h1>Bildirimler {data && data.unread > 0 && <span className="badge">{data.unread}</span>}</h1>
      </header>
      {isLoading && <ListSkeleton count={5} />}
      {!isLoading && (data?.items.length ?? 0) === 0 && (
        <p className="muted center" style={{ padding: 40 }}><Bell size={28} /><br />Yeni bildirim yok</p>
      )}
      {data?.items.map((n: any) => {
        const Icon = ICONS[n.kind] ?? Bell;
        return (
          <div key={n.id} className={`notif ${n.read ? "" : "unread"}`}>
            <Icon size={20} className="notif-icon" />
            <span>{n.text}</span>
          </div>
        );
      })}
    </div>
  );
}
