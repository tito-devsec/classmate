import { useState, useSyncExternalStore } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FeaturedSchoolPreview, SponsoredPreview, UltimateCampaignPreview } from "@/components/promotions/PackagePreview";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Wallet, Users, TrendingUp, CheckCircle, Phone,
  ArrowUpRight, ArrowDownLeft, CreditCard, BarChart3,
  UserCheck, Megaphone, Star, Eye, Zap, Crown, BadgeCheck, ImagePlus, MousePointerClick,
  Bell, Activity, MessageSquare, GraduationCap
} from "lucide-react";
import {
  getTrackedLeads,
  getSchoolNotificationsSnapshot,
  getSchoolUnreadCountSnapshot,
  markAllNotificationsRead,
  addTrackingAction,
  updateTrackingStatus,
  subscribe,
  type TrackingStatus,
} from "@/data/leadStore";
import { toast } from "@/hooks/use-toast";

// Mock data
const walletBalance = 450000;
const walletTransactions = [
  { id: 1, type: "deposit", amount: 300000, date: "2026-03-01", desc: "Wallet deposit" },
  { id: 2, type: "purchase", amount: -30000, date: "2026-03-02", desc: "Purchase Lead #L-1042" },
  { id: 3, type: "purchase", amount: -30000, date: "2026-03-03", desc: "Purchase Lead #L-1051" },
  { id: 4, type: "deposit", amount: 200000, date: "2026-03-05", desc: "Wallet deposit" },
  { id: 5, type: "commission", amount: -570000, date: "2026-03-07", desc: "Commission - Enrollment #E-201" },
];

const availableLeads = [
  { id: "L-1055", level: "O-Level", budget: "3M - 5M", boarding: "Boarding", area: "Kinondoni", gender: "Boy", tier: "A" as const, status: "available", callNotes: "", examScore: "", examNotes: "" },
  { id: "L-1058", level: "A-Level", budget: "5M - 8M", boarding: "Day", area: "Ilala", gender: "Girl", tier: "B" as const, status: "available", callNotes: "Mzazi yuko serious, anataka mtoto aanze mwezi ujao.", examScore: "", examNotes: "" },
  { id: "L-1060", level: "O-Level", budget: "2M - 4M", boarding: "Boarding", area: "Temeke", gender: "Boy", tier: "C" as const, status: "available", callNotes: "Mzazi amekubali kuleta mtoto kwa mtihani.", examScore: "82/100", examNotes: "Math na Science vizuri sana. English inahitaji msaada." },
  { id: "L-1063", level: "A-Level", budget: "4M - 6M", boarding: "Day", area: "Kinondoni", gender: "Girl", tier: "A" as const, status: "available", callNotes: "", examScore: "", examNotes: "" },
];

const purchasedLeads = [
  { id: "L-1042", parent: "Amina Hassan", phone: "+255 712 345 678", level: "O-Level", tier: "A" as const, status: "contacted", callNotes: "", examScore: "", examNotes: "" },
  { id: "L-1051", parent: "John Mwalimu", phone: "+255 754 987 654", level: "A-Level", tier: "B" as const, status: "enrolled", callNotes: "Mzazi ameridhika na shule.", examScore: "", examNotes: "" },
  { id: "L-1039", parent: "***Locked***", phone: "***Locked***", level: "O-Level", tier: "C" as const, status: "new", callNotes: "Mzazi anataka shule ya boarding Dar.", examScore: "78/100", examNotes: "Amefanya vizuri Math.", unlockedContact: false },
];

type Tab = "overview" | "leads" | "purchased" | "wallet" | "enrollments" | "promotions";

const promotionPackages = [
  {
    id: 1,
    title: "Featured School Package",
    emoji: "1️⃣",
    icon: Crown,
    description: "Designed for schools seeking premium visibility and standout positioning.",
    features: [
      { icon: Star, text: "Top-ranking placement in search results" },
      { icon: Eye, text: 'Prominent feature in "Popular Schools" section on Homepage' },
      { icon: BadgeCheck, text: 'Exclusive "Recommended School" badge' },
      { icon: ImagePlus, text: "Expanded profile with extended photo gallery" },
      { icon: MousePointerClick, text: 'Direct "Apply Now" button for instant parent action' },
    ],
    pricing: "300,000 – 500,000 TZS / mwezi",
    value: "Guarantees your school is seen by parents first. Significantly higher volume of inbound leads.",
    idealFor: "International schools, high-end private schools, and boarding schools",
    color: "primary" as const,
  },
  {
    id: 2,
    title: "Sponsored School Promotion",
    emoji: "3️⃣",
    icon: Megaphone,
    description: "High-impact display advertising across the platform to build brand awareness.",
    features: [
      { icon: Eye, text: "Premium banner placement on Homepage and general school pages" },
      { icon: MousePointerClick, text: 'Clear Call-to-Action: "View School Profile"' },
    ],
    pricing: "300,000 – 1,000,000 TZS / mwezi",
    value: "",
    idealFor: "Peak admission seasons, announcing early bird registrations, or launching a new campus",
    color: "accent" as const,
  },
  {
    id: 3,
    title: "Ultimate Admission Campaign",
    emoji: "4️⃣",
    icon: Zap,
    description: "A comprehensive, all-in-one marketing blitz designed for maximum enrollment impact.",
    features: [
      { icon: Star, text: "Featured Listing + Sponsored Banner Ads" },
      { icon: Users, text: "Guaranteed Parent Leads" },
      { icon: Megaphone, text: "Dedicated Social Media Promotion" },
      { icon: TrendingUp, text: "Campaign Duration: 30-day intensive push" },
    ],
    pricing: "1,000,000 – 3,000,000 TZS",
    value: "",
    idealFor: "Schools running major enrollment drives or launching new programs",
    color: "secondary" as const,
  },
];

const SchoolDashboard = () => {
  const SCHOOL_NAME = "Bright Academy";
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [showNotifications, setShowNotifications] = useState(false);
  const [trackingNoteInput, setTrackingNoteInput] = useState<Record<string, string>>({});

  const trackedLeads = useSyncExternalStore(subscribe, getTrackedLeads);
  const getSchoolNotifs = getSchoolNotificationsSnapshot(SCHOOL_NAME);
  const getUnread = getSchoolUnreadCountSnapshot(SCHOOL_NAME);
  const schoolNotifications = useSyncExternalStore(subscribe, getSchoolNotifs);
  const unreadCount = useSyncExternalStore(subscribe, getUnread);

  // Only show leads assigned to this school
  const myTrackedLeads = trackedLeads.filter((t) => t.assignedSchools.includes(SCHOOL_NAME));

  const tabs: { key: Tab; label: string; icon: React.ElementType; badge?: number }[] = [
    { key: "overview", label: "Overview", icon: BarChart3 },
    { key: "leads", label: "Available Leads", icon: Users },
    { key: "purchased", label: "Purchased Leads", icon: UserCheck, badge: myTrackedLeads.length },
    { key: "wallet", label: "Wallet", icon: Wallet },
    { key: "enrollments", label: "Enrollments", icon: CheckCircle },
    { key: "promotions", label: "Promotions", icon: Megaphone },
  ];

  const statusColor = (s: string) => {
    if (s === "new") return "bg-accent/10 text-accent";
    if (s === "contacted") return "bg-primary/10 text-primary";
    if (s === "enrolled") return "bg-secondary/10 text-secondary";
    return "bg-muted text-muted-foreground";
  };

  const tierColor = (t: string) => {
    if (t === "A") return "bg-chart-4/10 text-chart-4";
    if (t === "B") return "bg-primary/10 text-primary";
    return "bg-secondary/10 text-secondary";
  };

  const tierPrice = (t: string) => {
    if (t === "A") return "10,000";
    if (t === "B") return "20,000";
    return "50,000";
  };

  const tierLabel = (t: string) => {
    if (t === "A") return "Raw Lead";
    if (t === "B") return "Verified Lead";
    return "Premium Lead";
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">School Dashboard</h1>
            <p className="text-sm text-muted-foreground">Welcome, {SCHOOL_NAME}</p>
          </div>
          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => { setShowNotifications(!showNotifications); if (!showNotifications) markAllNotificationsRead(SCHOOL_NAME); }}
              className="relative flex h-10 w-10 items-center justify-center rounded-full border bg-card hover:bg-muted transition-colors"
            >
              <Bell className="h-5 w-5 text-foreground" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                  {unreadCount}
                </span>
              )}
            </button>
            {showNotifications && (
              <div className="absolute right-0 top-12 z-50 w-80 rounded-lg border bg-card shadow-lg overflow-hidden">
                <div className="border-b p-3 flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-foreground">Notifications</h4>
                  <span className="text-xs text-muted-foreground">{schoolNotifications.length} total</span>
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  {schoolNotifications.length === 0 ? (
                    <p className="p-4 text-center text-sm text-muted-foreground">No notifications</p>
                  ) : (
                    schoolNotifications.map((n) => (
                      <div key={n.id} className={`border-b p-3 text-sm ${!n.read ? "bg-primary/5" : ""}`}>
                        <div className="flex items-center gap-2">
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                            n.tier === "A" ? "bg-chart-4/10 text-chart-4" : n.tier === "B" ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary"
                          }`}>Tier {n.tier}</span>
                          <span className="text-xs text-muted-foreground">{n.timestamp}</span>
                        </div>
                        <p className="text-foreground mt-1">{n.message}</p>
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-2 text-xs h-7 gap-1"
                          onClick={() => { setActiveTab("purchased"); setShowNotifications(false); }}
                        >
                          <Activity className="h-3 w-3" /> View Purchased Leads
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tab navigation */}
        <div className="mb-6 flex gap-1 overflow-x-auto rounded-lg border bg-card p-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 whitespace-nowrap rounded-md px-4 py-2.5 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
              {tab.badge && tab.badge > 0 && (
                <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === "overview" && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid gap-4 md:grid-cols-4">
              {[
                { icon: Wallet, label: "Wallet Balance", value: `TZS ${walletBalance.toLocaleString()}`, color: "text-primary" },
                { icon: Users, label: "Purchased Leads", value: "12", color: "text-accent" },
                { icon: CheckCircle, label: "Enrollments", value: "4", color: "text-secondary" },
                { icon: TrendingUp, label: "Conversion Rate", value: "33%", color: "text-primary" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-lg border bg-card p-5">
                  <div className="flex items-center justify-between">
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    <span className="text-xs text-muted-foreground">This month</span>
                  </div>
                  <p className="mt-3 font-display text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Recent activity */}
            <div className="rounded-lg border bg-card p-5">
              <h3 className="font-display text-lg font-semibold text-foreground">Recent Activity</h3>
              <div className="mt-4 space-y-3">
                {walletTransactions.slice(0, 3).map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full ${tx.amount > 0 ? "bg-secondary/10" : "bg-destructive/10"}`}>
                        {tx.amount > 0 ? <ArrowDownLeft className="h-4 w-4 text-secondary" /> : <ArrowUpRight className="h-4 w-4 text-destructive" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{tx.desc}</p>
                        <p className="text-xs text-muted-foreground">{tx.date}</p>
                      </div>
                    </div>
                    <span className={`text-sm font-semibold ${tx.amount > 0 ? "text-secondary" : "text-destructive"}`}>
                      {tx.amount > 0 ? "+" : ""}{tx.amount.toLocaleString()} TZS
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Available Leads */}
        {activeTab === "leads" && (
          <div className="animate-fade-in space-y-4">
            {/* Tier Legend */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { tier: "A", label: "Tier A — Raw Lead", price: "10,000 TZS", desc: "Basic info only. No call made yet.", color: "border-chart-4/30 bg-chart-4/5" },
                { tier: "B", label: "Tier B — Verified Lead", price: "20,000 TZS", desc: "Staff called and verified. Call Notes available.", color: "border-primary/30 bg-primary/5" },
                { tier: "C", label: "Tier C — Premium Lead", price: "50,000 TZS", desc: "Student took an exam. Scores/results available.", color: "border-secondary/30 bg-secondary/5" },
              ].map((t) => (
                <div key={t.tier} className={`rounded-lg border-2 ${t.color} p-3`}>
                  <p className="text-sm font-bold text-foreground">{t.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{t.desc}</p>
                  <p className="text-sm font-semibold text-foreground mt-1">{t.price}</p>
                </div>
              ))}
            </div>

            <div className="rounded-lg border bg-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Lead ID</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Level</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Budget</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Type</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Area</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Tier</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Info</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {availableLeads.map((lead) => (
                      <tr key={lead.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-medium text-foreground">{lead.id}</td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">{lead.level}</span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{lead.budget}</td>
                        <td className="px-4 py-3 text-muted-foreground">{lead.boarding}</td>
                        <td className="px-4 py-3 text-muted-foreground">{lead.area}</td>
                        <td className="px-4 py-3">
                          <div>
                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${tierColor(lead.tier)}`}>
                              {tierLabel(lead.tier)}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {lead.tier === "A" && (
                            <span className="text-xs text-muted-foreground italic">Basic info only</span>
                          )}
                          {lead.tier === "B" && lead.callNotes && (
                            <div className="max-w-[200px]">
                              <p className="text-xs text-primary font-medium">📞 Call Notes:</p>
                              <p className="text-xs text-muted-foreground truncate">{lead.callNotes}</p>
                            </div>
                          )}
                          {lead.tier === "C" && (
                            <div className="max-w-[200px]">
                              <p className="text-xs text-secondary font-medium">🎓 Exam: {lead.examScore}</p>
                              {lead.examNotes && <p className="text-xs text-muted-foreground truncate">{lead.examNotes}</p>}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Button size="sm" className="gap-1">
                            <CreditCard className="h-3.5 w-3.5" /> Pay {tierPrice(lead.tier)} TZS
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Purchased Leads + Tracking */}
        {activeTab === "purchased" && (
          <div className="animate-fade-in space-y-6">
            {/* Purchased leads table */}
            <div className="rounded-lg border bg-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Lead ID</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Parent</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Phone</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Level</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Tier</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Details</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchasedLeads.map((lead) => (
                      <tr key={lead.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-medium text-foreground">{lead.id}</td>
                        <td className="px-4 py-3 text-foreground">{lead.parent}</td>
                        <td className="px-4 py-3">
                          {lead.phone === "***Locked***" ? (
                            <span className="text-xs text-destructive italic">🔒 Locked</span>
                          ) : (
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Phone className="h-3.5 w-3.5" /> {lead.phone}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{lead.level}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${tierColor(lead.tier)}`}>
                            {tierLabel(lead.tier)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {lead.tier === "B" && lead.callNotes && (
                            <div className="max-w-[180px]">
                              <p className="text-xs text-primary font-medium">📞 Call Notes:</p>
                              <p className="text-xs text-muted-foreground truncate">{lead.callNotes}</p>
                            </div>
                          )}
                          {lead.tier === "C" && (
                            <div className="max-w-[180px]">
                              {lead.examScore && <p className="text-xs text-secondary font-medium">🎓 Score: {lead.examScore}</p>}
                              {lead.examNotes && <p className="text-xs text-muted-foreground truncate">{lead.examNotes}</p>}
                              {lead.phone === "***Locked***" && (
                                <p className="text-[10px] text-destructive mt-0.5">Pay to unlock parent contacts</p>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusColor(lead.status)}`}>
                            {lead.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {lead.phone === "***Locked***" ? (
                            <Button size="sm" className="gap-1 text-xs">
                              <CreditCard className="h-3.5 w-3.5" /> Pay {tierPrice(lead.tier)} TZS to Unlock
                            </Button>
                          ) : lead.status !== "enrolled" ? (
                            <Button size="sm" variant="outline" className="gap-1 text-xs">
                              <CheckCircle className="h-3.5 w-3.5" /> Confirm Enrollment
                            </Button>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tracking Section for Purchased Leads */}
            {myTrackedLeads.length > 0 && (
              <div className="space-y-4">
                <div className="rounded-lg border bg-card p-4">
                  <h3 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" /> Lead Tracking
                  </h3>
                  <p className="text-sm text-muted-foreground">Track your purchased leads — add actions and status updates</p>
                </div>

                <div className="space-y-4">
                  {myTrackedLeads.map((tracked) => {
                    const trackingStatusConfig: Record<TrackingStatus, { label: string; color: string }> = {
                      approved: { label: "Received", color: "bg-chart-4/10 text-chart-4" },
                      school_contacted: { label: "Contacted", color: "bg-primary/10 text-primary" },
                      parent_responded: { label: "Parent Responded", color: "bg-accent/10 text-accent" },
                      enrolled: { label: "Enrolled", color: "bg-secondary/10 text-secondary" },
                      declined: { label: "Declined", color: "bg-destructive/10 text-destructive" },
                    };
                    const statusInfo = trackingStatusConfig[tracked.trackingStatus];

                    return (
                      <div key={tracked.leadId} className="rounded-lg border bg-card overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b bg-muted/30">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="font-medium text-foreground">{tracked.leadId}</span>
                            <span className="text-sm text-muted-foreground">{tracked.studentName} ({tracked.studentGender})</span>
                            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                              {tracked.category} • {tracked.level}
                            </span>
                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              tracked.tier === "A" ? "bg-chart-4/10 text-chart-4" : tracked.tier === "B" ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary"
                            }`}>
                              Tier {tracked.tier}
                            </span>
                          </div>
                          <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                        </div>

                        <div className="grid gap-4 p-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <div className="text-sm space-y-1">
                              <div className="flex justify-between"><span className="text-muted-foreground">Budget:</span><span className="text-foreground">{tracked.budget}</span></div>
                              <div className="flex justify-between"><span className="text-muted-foreground">Type:</span><span className="text-foreground">{tracked.boardingType}</span></div>
                              <div className="flex justify-between"><span className="text-muted-foreground">Approved:</span><span className="text-foreground">{tracked.approvedAt}</span></div>
                            </div>
                            {tracked.callNotes && (
                              <div className="rounded-md bg-primary/5 p-2 border border-primary/10">
                                <p className="text-xs font-medium text-primary flex items-center gap-1"><MessageSquare className="h-3 w-3" /> Call Notes</p>
                                <p className="text-xs text-foreground mt-1">{tracked.callNotes}</p>
                              </div>
                            )}
                            {tracked.subjectResults && tracked.subjectResults.length > 0 && (
                              <div className="rounded-md bg-secondary/5 p-2 border border-secondary/10">
                                <p className="text-xs font-medium text-secondary flex items-center gap-1"><GraduationCap className="h-3 w-3" /> Results</p>
                                <div className="mt-1 space-y-0.5">
                                  {tracked.subjectResults.map((sr, i) => (
                                    <div key={i} className="flex justify-between text-xs">
                                      <span className="text-foreground">{sr.subject}</span>
                                      <span className="font-bold text-foreground">{sr.score}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="space-y-3">
                            <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                              <Activity className="h-3.5 w-3.5 text-primary" /> Actions Timeline
                            </h4>
                            <div className="space-y-2 max-h-[200px] overflow-y-auto">
                              {tracked.actions.map((act) => (
                                <div key={act.id} className="flex gap-2 text-xs">
                                  <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${act.actor === "admin" ? "bg-primary" : "bg-secondary"}`} />
                                  <div>
                                    <span className="font-medium text-foreground">{act.actorName}</span>
                                    <span className="text-muted-foreground"> — {act.action}</span>
                                    {act.note && <p className="text-muted-foreground mt-0.5">{act.note}</p>}
                                    <p className="text-muted-foreground/60">{act.timestamp}</p>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* School add action */}
                            <div className="rounded-md bg-muted/50 p-3 space-y-2 border">
                              <p className="text-xs font-medium text-foreground">Add Action</p>
                              <Textarea
                                placeholder="E.g., Called the parent, they will visit next week..."
                                value={trackingNoteInput[tracked.leadId] || ""}
                                onChange={(e) => setTrackingNoteInput((prev) => ({ ...prev, [tracked.leadId]: e.target.value }))}
                                className="min-h-[50px]"
                              />
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="flex-1 text-xs"
                                  disabled={!(trackingNoteInput[tracked.leadId] || "").trim()}
                                  onClick={() => {
                                    addTrackingAction(tracked.leadId, {
                                      actor: "school",
                                      actorName: SCHOOL_NAME,
                                      action: "Added note",
                                      note: trackingNoteInput[tracked.leadId],
                                    });
                                    setTrackingNoteInput((prev) => ({ ...prev, [tracked.leadId]: "" }));
                                    toast({ title: "Action added", description: "Admin will see this update" });
                                  }}
                                >
                                  <MessageSquare className="h-3 w-3" /> Add Note
                                </Button>
                              </div>
                              <div className="flex gap-1.5 flex-wrap">
                                <Button
                                  size="sm"
                                  variant={tracked.trackingStatus === "school_contacted" ? "default" : "outline"}
                                  className="text-xs h-7 gap-1"
                                  onClick={() => {
                                    updateTrackingStatus(tracked.leadId, "school_contacted");
                                    addTrackingAction(tracked.leadId, { actor: "school", actorName: SCHOOL_NAME, action: "Contacted parent" });
                                  }}
                                >
                                  <Phone className="h-3 w-3" /> Contacted
                                </Button>
                                <Button
                                  size="sm"
                                  variant={tracked.trackingStatus === "parent_responded" ? "default" : "outline"}
                                  className="text-xs h-7 gap-1"
                                  onClick={() => {
                                    updateTrackingStatus(tracked.leadId, "parent_responded");
                                    addTrackingAction(tracked.leadId, { actor: "school", actorName: SCHOOL_NAME, action: "Parent responded" });
                                  }}
                                >
                                  <MessageSquare className="h-3 w-3" /> Parent Responded
                                </Button>
                                <Button
                                  size="sm"
                                  variant={tracked.trackingStatus === "enrolled" ? "default" : "outline"}
                                  className="text-xs h-7 gap-1"
                                  onClick={() => {
                                    updateTrackingStatus(tracked.leadId, "enrolled");
                                    addTrackingAction(tracked.leadId, { actor: "school", actorName: SCHOOL_NAME, action: "Student enrolled!" });
                                  }}
                                >
                                  <CheckCircle className="h-3 w-3" /> Enrolled
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Wallet */}
        {activeTab === "wallet" && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border bg-card p-6 md:col-span-1">
                <p className="text-sm text-muted-foreground">Wallet Balance</p>
                <p className="mt-2 font-display text-3xl font-bold text-foreground">TZS {walletBalance.toLocaleString()}</p>
                <Button className="mt-4 w-full gap-2">
                  <ArrowDownLeft className="h-4 w-4" /> Add Funds
                </Button>
              </div>
              <div className="rounded-lg border bg-card p-6 md:col-span-2">
                <h3 className="font-display text-lg font-semibold text-foreground">Transaction History</h3>
                <div className="mt-4 space-y-3">
                  {walletTransactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full ${tx.amount > 0 ? "bg-secondary/10" : "bg-destructive/10"}`}>
                          {tx.amount > 0 ? <ArrowDownLeft className="h-4 w-4 text-secondary" /> : <ArrowUpRight className="h-4 w-4 text-destructive" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{tx.desc}</p>
                          <p className="text-xs text-muted-foreground">{tx.date}</p>
                        </div>
                      </div>
                      <span className={`text-sm font-semibold ${tx.amount > 0 ? "text-secondary" : "text-destructive"}`}>
                        {tx.amount > 0 ? "+" : ""}{tx.amount.toLocaleString()} TZS
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enrollments */}
        {activeTab === "enrollments" && (
          <div className="animate-fade-in">
            <div className="rounded-lg border bg-card p-6">
              <h3 className="font-display text-lg font-semibold text-foreground">Confirmed Enrollments</h3>
              <div className="mt-4 space-y-4">
                <div className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">John Mwalimu — Lead #L-1051</p>
                      <p className="text-sm text-muted-foreground">A-Level • Student: Adam Mwalimu</p>
                    </div>
                    <span className="rounded-full bg-secondary/10 px-3 py-1 text-xs font-medium text-secondary">Confirmed</span>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-4 rounded-lg bg-muted/50 p-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Tuition</p>
                      <p className="font-semibold text-foreground">TZS 5,000,000</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Commission (10%)</p>
                      <p className="font-semibold text-foreground">TZS 600,000</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Lead Fee Deducted</p>
                      <p className="font-semibold text-foreground">TZS 30,000</p>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">Amount payable: <span className="font-semibold text-foreground">TZS 570,000</span></p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Promotions */}
        {activeTab === "promotions" && (
          <div className="space-y-6 animate-fade-in">
            <div className="rounded-lg border bg-card p-5">
              <h3 className="font-display text-lg font-semibold text-foreground">Promotion Packages</h3>
              <p className="text-sm text-muted-foreground">Choose the package that best fits your school to increase visibility to parents.</p>
            </div>

            <div className="space-y-10">
              {promotionPackages.map((pkg) => {
                const borderColor = pkg.color === "primary" ? "border-primary/40" : pkg.color === "accent" ? "border-accent/40" : "border-secondary/40";
                const bgHighlight = pkg.color === "primary" ? "bg-primary/5" : pkg.color === "accent" ? "bg-accent/5" : "bg-secondary/5";
                const textColor = pkg.color === "primary" ? "text-primary" : pkg.color === "accent" ? "text-accent" : "text-secondary";
                const badgeBg = pkg.color === "primary" ? "bg-primary/10 text-primary" : pkg.color === "accent" ? "bg-accent/10 text-accent" : "bg-secondary/10 text-secondary";

                return (
                  <div key={pkg.id} className={`rounded-xl border-2 ${borderColor} ${bgHighlight} overflow-hidden transition-shadow hover:shadow-lg`}>
                    {pkg.id === 1 && (
                      <div className="bg-primary px-4 py-1.5 text-center text-xs font-semibold text-primary-foreground">
                        ⭐ Most Popular
                      </div>
                    )}

                    <div className="grid gap-6 p-6 md:grid-cols-2">
                      {/* Left: Package info */}
                      <div className="flex flex-col">
                        <div className="mb-4 flex items-center gap-3">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${badgeBg}`}>
                            <pkg.icon className={`h-5 w-5 ${textColor}`} />
                          </div>
                          <h4 className="font-display text-lg font-bold text-foreground">{pkg.title}</h4>
                        </div>

                        <p className="mb-4 text-sm text-muted-foreground">{pkg.description}</p>

                        <div className="mb-4 space-y-2">
                          {pkg.features.map((f, i) => (
                            <div key={i} className="flex items-start gap-2 text-sm">
                              <f.icon className={`mt-0.5 h-4 w-4 shrink-0 ${textColor}`} />
                              <span className="text-foreground">{f.text}</span>
                            </div>
                          ))}
                        </div>

                        <div className="mt-auto space-y-3 border-t pt-4">
                          <div>
                            <p className="text-xs text-muted-foreground">Price</p>
                            <p className={`font-display text-xl font-bold ${textColor}`}>{pkg.pricing}</p>
                          </div>
                          {pkg.value && (
                            <p className="text-xs text-muted-foreground italic">{pkg.value}</p>
                          )}
                          <div className="rounded-md bg-muted/50 p-2">
                            <p className="text-xs text-muted-foreground">💡 Ideal For:</p>
                            <p className="text-xs font-medium text-foreground">{pkg.idealFor}</p>
                          </div>
                          <Button className="w-full gap-2" variant={pkg.id === 1 ? "default" : "outline"}>
                            <CreditCard className="h-4 w-4" /> Purchase Package
                          </Button>
                        </div>
                      </div>

                      {/* Right: Live preview */}
                      <div>
                        {pkg.id === 1 && <FeaturedSchoolPreview />}
                        {pkg.id === 2 && <SponsoredPreview />}
                        {pkg.id === 3 && <UltimateCampaignPreview />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default SchoolDashboard;
