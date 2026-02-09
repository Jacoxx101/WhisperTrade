// src/app/dashboard/layout.tsx
import { Header } from "@/components/dashboard/header";
import { BottomNav } from "@/components/dashboard/bottom-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Mock unread alerts count - would come from API/database
  const unreadAlerts = 3;

  return (
    <div className="min-h-screen bg-background">
      <Header unreadAlerts={unreadAlerts} />
      <main className="pb-20 md:pb-6">
        {children}
      </main>
      <BottomNav unreadAlerts={unreadAlerts} />
    </div>
  );
}
