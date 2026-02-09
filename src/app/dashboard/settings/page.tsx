// src/app/dashboard/settings/page.tsx
"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  Bell, 
  Moon, 
  Globe,
  Shield,
  CreditCard, 
  LogOut,
  ChevronRight,
  Youtube,
  Twitter,
  MessageSquare,
  Link as LinkIcon,
  Check
} from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  const [darkMode, setDarkMode] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailDigest, setEmailDigest] = useState<"never" | "daily" | "weekly">("daily");
  const [alertThreshold, setAlertThreshold] = useState(70);

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text">Settings</h1>
        <p className="text-muted">Manage your account and preferences</p>
      </div>

      {/* Account Section */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">Account</h2>
        
        <Card className="overflow-hidden">
          <div className="p-4 flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
              <span className="text-2xl font-bold text-white">T</span>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-text">Trader</p>
              <p className="text-sm text-muted">trader@example.com</p>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full mt-1">
                Pro Plan
              </span>
            </div>
            <Button variant="secondary" size="sm">Edit</Button>
          </div>
          
          <div className="border-t border-border">
            <Link href="#" className="flex items-center justify-between p-4 hover:bg-surface-hover/50 transition-colors">
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-muted" />
                <span className="text-text">Subscription</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted">Pro ($19/mo)</span>
                <ChevronRight className="w-4 h-4 text-muted" />
              </div>
            </Link>
          </div>
        </Card>
      </div>

      {/* Notifications Section */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">Notifications</h2>
        
        <Card className="overflow-hidden">
          {/* Push Notifications */}
          <div className="p-4 flex items-center justify-between border-b border-border">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-muted" />
              <div>
                <p className="text-text">Push Notifications</p>
                <p className="text-xs text-muted">Get notified about signal changes</p>
              </div>
            </div>
            <button
              onClick={() => setPushNotifications(!pushNotifications)}
              className={cn(
                "w-12 h-6 rounded-full relative transition-colors",
                pushNotifications ? "bg-primary" : "bg-surface-hover"
              )}
            >
              <div className={cn(
                "w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all",
                pushNotifications ? "right-0.5" : "left-0.5"
              )} />
            </button>
          </div>

          {/* Email Digest */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-3 mb-3">
              <Globe className="w-5 h-5 text-muted" />
              <div>
                <p className="text-text">Email Digest</p>
                <p className="text-xs text-muted">How often we email you updates</p>
              </div>
            </div>
            <div className="flex gap-2 ml-8">
              {(["never", "daily", "weekly"] as const).map((option) => (
                <button
                  key={option}
                  onClick={() => setEmailDigest(option)}
                  className={cn(
                    "px-3 py-1.5 text-sm rounded-lg capitalize transition-colors",
                    emailDigest === option
                      ? "bg-primary text-white"
                      : "bg-surface-hover text-muted hover:text-text"
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Alert Threshold */}
          <div className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <Bell className="w-5 h-5 text-muted" />
              <div>
                <p className="text-text">Alert Threshold</p>
                <p className="text-xs text-muted">Only alert when confidence is above {alertThreshold}%</p>
              </div>
            </div>
            <div className="ml-8">
              <input
                type="range"
                min="0"
                max="100"
                value={alertThreshold}
                onChange={(e) => setAlertThreshold(parseInt(e.target.value))}
                className="w-full h-2 bg-surface-hover rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-xs text-muted mt-1">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Preferences Section */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">Preferences</h2>
        
        <Card className="overflow-hidden">
          {/* Dark Mode */}
          <div className="p-4 flex items-center justify-between border-b border-border">
            <div className="flex items-center gap-3">
              <Moon className="w-5 h-5 text-muted" />
              <span className="text-text">Dark Mode</span>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={cn(
                "w-12 h-6 rounded-full relative transition-colors",
                darkMode ? "bg-primary" : "bg-surface-hover"
              )}
            >
              <div className={cn(
                "w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all",
                darkMode ? "right-0.5" : "left-0.5"
              )} />
            </button>
          </div>

          {/* Default View */}
          <Link href="#" className="flex items-center justify-between p-4 hover:bg-surface-hover/50 transition-colors">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-muted" />
              <span className="text-text">Default View</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted">Dashboard</span>
              <ChevronRight className="w-4 h-4 text-muted" />
            </div>
          </Link>
        </Card>
      </div>

      {/* Connected Services */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">Connected Services</h2>
        
        <Card className="overflow-hidden">
          <div className="p-4 flex items-center justify-between border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-sell/10 flex items-center justify-center">
                <Youtube className="w-4 h-4 text-sell" />
              </div>
              <div>
                <p className="text-text">YouTube</p>
                <p className="text-xs text-muted">Connected</p>
              </div>
            </div>
            <Check className="w-5 h-5 text-buy" />
          </div>

          <div className="p-4 flex items-center justify-between border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                <Twitter className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-text">Twitter/X</p>
                <p className="text-xs text-muted">Connected</p>
              </div>
            </div>
            <Check className="w-5 h-5 text-buy" />
          </div>

          <div className="p-4 flex items-center justify-between border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-orange-500/10 flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-orange-500" />
              </div>
              <div>
                <p className="text-text">Reddit</p>
                <p className="text-xs text-muted">Connected</p>
              </div>
            </div>
            <Check className="w-5 h-5 text-buy" />
          </div>

          <Link href="#" className="flex items-center justify-between p-4 hover:bg-surface-hover/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-surface-hover flex items-center justify-center">
                <LinkIcon className="w-4 h-4 text-muted" />
              </div>
              <div>
                <p className="text-text">Brokerage</p>
                <p className="text-xs text-muted">Connect your broker</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted" />
          </Link>
        </Card>
      </div>

      {/* Data & Privacy */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">Data & Privacy</h2>
        
        <Card className="overflow-hidden">
          <Link href="#" className="flex items-center justify-between p-4 border-b border-border hover:bg-surface-hover/50 transition-colors">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-muted" />
              <span className="text-text">Privacy Policy</span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted" />
          </Link>
          
          <Link href="#" className="flex items-center justify-between p-4 border-b border-border hover:bg-surface-hover/50 transition-colors">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-muted" />
              <span className="text-text">Terms of Service</span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted" />
          </Link>
          
          <button className="w-full flex items-center justify-between p-4 hover:bg-surface-hover/50 transition-colors">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-muted" />
              <span className="text-text">Download My Data</span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted" />
          </button>
        </Card>
      </div>

      {/* Logout */}
      <Button variant="danger" className="w-full">
        <LogOut className="w-4 h-4 mr-2" />
        Log Out
      </Button>

      {/* App Version */}
      <p className="text-center text-xs text-muted mt-8">
        WhisperTrade v1.0.0
      </p>
    </div>
  );
}
