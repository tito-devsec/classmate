import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { AdminLeadManagement } from "@/components/admin/AdminLeadManagement";
import {
  TrendingUp, Users, DollarSign, BarChart3, CheckCircle,
  ArrowUpRight, ArrowDownLeft, School, Calendar, Percent,
  FileText, Eye, Wallet, TrendingDown, PieChart as PieChartIcon,
  GraduationCap, Building2, MapPin, ClipboardList
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell
} from "recharts";

// Mock data
const monthlyRevenue = [
  { month: "Oct", revenue: 2400000, leads: 45, commissions: 1800000 },
  { month: "Nov", revenue: 3100000, leads: 58, commissions: 2300000 },
  { month: "Dec", revenue: 2800000, leads: 52, commissions: 2100000 },
  { month: "Jan", revenue: 4200000, leads: 78, commissions: 3200000 },
  { month: "Feb", revenue: 5100000, leads: 95, commissions: 3900000 },
  { month: "Mar", revenue: 3800000, leads: 71, commissions: 2900000 },
];

const recentCommissions = [
  { id: "C-301", school: "Bright Academy", student: "Adam Mwalimu", tuition: 5000000, rate: 10, commission: 500000, date: "2026-03-07", status: "paid" },
  { id: "C-302", school: "Star Secondary", student: "Fatma Said", tuition: 3500000, rate: 10, commission: 350000, date: "2026-03-05", status: "pending" },
  { id: "C-303", school: "Uhuru High", student: "John Kimaro", tuition: 4200000, rate: 10, commission: 420000, date: "2026-03-03", status: "paid" },
  { id: "C-304", school: "Mwenge Secondary", student: "Amina Juma", tuition: 3800000, rate: 10, commission: 380000, date: "2026-02-28", status: "pending" },
  { id: "C-305", school: "Victoria Academy", student: "Hassan Ali", tuition: 6000000, rate: 10, commission: 600000, date: "2026-02-25", status: "paid" },
];

const leadsByStatus = [
  { name: "Available", value: 124, color: "hsl(var(--primary))" },
  { name: "Purchased", value: 89, color: "hsl(var(--accent))" },
  { name: "Contacted", value: 56, color: "hsl(var(--secondary))" },
  { name: "Enrolled", value: 32, color: "hsl(var(--chart-4))" },
];

const topSchools = [
  { name: "Bright Academy", leads: 18, enrollments: 6, commission: 3600000 },
  { name: "Star Secondary", leads: 14, enrollments: 5, commission: 2100000 },
  { name: "Uhuru High School", leads: 12, enrollments: 4, commission: 2016000 },
  { name: "Victoria Academy", leads: 10, enrollments: 3, commission: 2160000 },
  { name: "Mwenge Secondary", leads: 8, enrollments: 2, commission: 912000 },
];

const recentTransactions = [
  { id: 1, type: "commission", amount: 600000, date: "2026-03-07", desc: "Commission - Bright Academy (Adam Mwalimu)" },
  { id: 2, type: "lead_sale", amount: 30000, date: "2026-03-06", desc: "Lead sale #L-1063 to Star Secondary" },
  { id: 3, type: "lead_sale", amount: 30000, date: "2026-03-05", desc: "Lead sale #L-1060 to Uhuru High" },
  { id: 4, type: "commission", amount: 504000, date: "2026-03-03", desc: "Commission - Uhuru High (John Kimaro)" },
  { id: 5, type: "lead_sale", amount: 30000, date: "2026-03-02", desc: "Lead sale #L-1055 to Bright Academy" },
];

// College mock data
const colleges = [
  { id: "COL-1", name: "University of Dar es Salaam", location: "Dar es Salaam", type: "Public", programs: 45, students: 12500, leads: 34, enrollments: 12, commission: 4800000, status: "active" },
  { id: "COL-2", name: "Ardhi University", location: "Dar es Salaam", type: "Public", programs: 22, students: 6800, leads: 18, enrollments: 7, commission: 2100000, status: "active" },
  { id: "COL-3", name: "Institute of Finance Management (IFM)", location: "Dar es Salaam", type: "Public", programs: 15, students: 5200, leads: 25, enrollments: 9, commission: 2700000, status: "active" },
  { id: "COL-4", name: "CBE - College of Business Education", location: "Dar es Salaam", type: "Public", programs: 18, students: 7100, leads: 20, enrollments: 6, commission: 1800000, status: "active" },
  { id: "COL-5", name: "St. Joseph University (SJUIT)", location: "Dar es Salaam", type: "Private", programs: 12, students: 3200, leads: 15, enrollments: 5, commission: 2500000, status: "active" },
  { id: "COL-6", name: "Kampala International University (KIU-DSM)", location: "Dar es Salaam", type: "Private", programs: 20, students: 4500, leads: 12, enrollments: 4, commission: 1600000, status: "pending" },
  { id: "COL-7", name: "Tumaini University Dar es Salaam", location: "Dar es Salaam", type: "Private", programs: 10, students: 2800, leads: 8, enrollments: 3, commission: 900000, status: "active" },
  { id: "COL-8", name: "DIT - Dar es Salaam Institute of Technology", location: "Dar es Salaam", type: "Public", programs: 25, students: 8000, leads: 22, enrollments: 8, commission: 2400000, status: "active" },
];

const collegeLeadsByMonth = [
  { month: "Oct", leads: 18, enrollments: 5 },
  { month: "Nov", leads: 24, enrollments: 8 },
  { month: "Dec", leads: 20, enrollments: 6 },
  { month: "Jan", leads: 35, enrollments: 12 },
  { month: "Feb", leads: 42, enrollments: 15 },
  { month: "Mar", leads: 30, enrollments: 10 },
];

const collegeByType = [
  { name: "Public", value: 5, color: "hsl(var(--primary))" },
  { name: "Private", value: 3, color: "hsl(var(--accent))" },
];

// Cost structure mock data
const costStructure = {
  revenue: {
    leadSales: 2850000,
    commissions: 16200000,
    total: 19050000,
  },
  expenses: {
    marketing: 3200000,
    staffSalaries: 4500000,
    techInfra: 1800000,
    officeRent: 1200000,
    smsNotifications: 450000,
    paymentProcessing: 380000,
    customerSupport: 900000,
    miscellaneous: 320000,
  },
};

const monthlyCostData = [
  { month: "Oct", revenue: 2400000, expenses: 1650000, profit: 750000 },
  { month: "Nov", revenue: 3100000, expenses: 1800000, profit: 1300000 },
  { month: "Dec", revenue: 2800000, expenses: 1720000, profit: 1080000 },
  { month: "Jan", revenue: 4200000, expenses: 2100000, profit: 2100000 },
  { month: "Feb", revenue: 5100000, expenses: 2350000, profit: 2750000 },
  { month: "Mar", revenue: 3800000, expenses: 1900000, profit: 1900000 },
];

const expenseBreakdown = [
  { name: "Marketing", value: 3200000, color: "hsl(var(--primary))" },
  { name: "Staff", value: 4500000, color: "hsl(var(--secondary))" },
  { name: "Tech", value: 1800000, color: "hsl(var(--accent))" },
  { name: "Office", value: 1200000, color: "hsl(var(--chart-4))" },
  { name: "SMS", value: 450000, color: "hsl(var(--chart-5, 280 65% 60%))" },
  { name: "Payments", value: 380000, color: "hsl(var(--muted-foreground))" },
  { name: "Support", value: 900000, color: "hsl(var(--destructive, 0 84% 60%))" },
  { name: "Other", value: 320000, color: "hsl(var(--border))" },
];

type Tab = "overview" | "revenue" | "lead-mgmt" | "leads" | "commissions" | "schools" | "colleges" | "costs";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: "overview", label: "Overview", icon: BarChart3 },
    { key: "revenue", label: "Revenue", icon: DollarSign },
    { key: "lead-mgmt", label: "Lead Management", icon: ClipboardList },
    { key: "leads", label: "Lead Analytics", icon: Users },
    { key: "commissions", label: "Commissions", icon: Percent },
    { key: "schools", label: "Schools", icon: School },
    { key: "colleges", label: "Colleges", icon: GraduationCap },
    { key: "costs", label: "Cost Analysis", icon: Wallet },
  ];

  const totalRevenue = monthlyRevenue.reduce((s, m) => s + m.revenue, 0);
  const totalLeads = monthlyRevenue.reduce((s, m) => s + m.leads, 0);
  const totalCommissions = monthlyRevenue.reduce((s, m) => s + m.commissions, 0);
  const totalEnrollments = 32;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container py-8">
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">Classmate Platform Analytics</p>
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
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === "overview" && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid gap-4 md:grid-cols-4">
              {[
                { icon: DollarSign, label: "Total Revenue", value: `TZS ${(totalRevenue / 1000000).toFixed(1)}M`, sub: "+18% vs last month", color: "text-primary" },
                { icon: Users, label: "Total Leads", value: totalLeads.toString(), sub: "399 this quarter", color: "text-accent" },
                { icon: Percent, label: "Total Commissions", value: `TZS ${(totalCommissions / 1000000).toFixed(1)}M`, sub: "From enrollments", color: "text-secondary" },
                { icon: CheckCircle, label: "Enrollments", value: totalEnrollments.toString(), sub: "33.7% conversion", color: "text-primary" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-lg border bg-card p-5">
                  <div className="flex items-center justify-between">
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    <span className="text-xs text-muted-foreground">All time</span>
                  </div>
                  <p className="mt-3 font-display text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="mt-1 text-xs text-secondary">{stat.sub}</p>
                </div>
              ))}
            </div>

            {/* Revenue chart */}
            <div className="rounded-lg border bg-card p-5">
              <h3 className="font-display text-lg font-semibold text-foreground">Revenue & Commissions Trend</h3>
              <div className="mt-4 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs fill-muted-foreground" />
                    <YAxis className="text-xs fill-muted-foreground" tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                      formatter={(value: number) => [`TZS ${value.toLocaleString()}`, ""]}
                    />
                    <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Revenue" />
                    <Bar dataKey="commissions" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} name="Commissions" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent transactions */}
            <div className="rounded-lg border bg-card p-5">
              <h3 className="font-display text-lg font-semibold text-foreground">Recent Transactions</h3>
              <div className="mt-4 space-y-3">
                {recentTransactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary/10">
                        <ArrowDownLeft className="h-4 w-4 text-secondary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{tx.desc}</p>
                        <p className="text-xs text-muted-foreground">{tx.date}</p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-secondary">
                      +{tx.amount.toLocaleString()} TZS
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Revenue Tab */}
        {activeTab === "revenue" && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border bg-card p-6">
                <p className="text-sm text-muted-foreground">Lead Sales Revenue</p>
                <p className="mt-2 font-display text-3xl font-bold text-foreground">TZS 2,850,000</p>
                <p className="mt-1 text-xs text-secondary">95 leads × 30,000 TZS</p>
              </div>
              <div className="rounded-lg border bg-card p-6">
                <p className="text-sm text-muted-foreground">Commission Revenue</p>
                <p className="mt-2 font-display text-3xl font-bold text-foreground">TZS {(totalCommissions / 1000000).toFixed(1)}M</p>
                <p className="mt-1 text-xs text-secondary">10% of tuition fees</p>
              </div>
              <div className="rounded-lg border bg-card p-6">
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="mt-2 font-display text-3xl font-bold text-foreground">TZS {((totalRevenue) / 1000000).toFixed(1)}M</p>
                <p className="mt-1 text-xs text-secondary">Leads + Commissions</p>
              </div>
            </div>

            <div className="rounded-lg border bg-card p-5">
              <h3 className="font-display text-lg font-semibold text-foreground">Monthly Revenue Trend</h3>
              <div className="mt-4 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs fill-muted-foreground" />
                    <YAxis className="text-xs fill-muted-foreground" tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                      formatter={(value: number) => [`TZS ${value.toLocaleString()}`, ""]}
                    />
                    <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} name="Revenue" />
                    <Line type="monotone" dataKey="commissions" stroke="hsl(var(--secondary))" strokeWidth={2} dot={{ r: 4 }} name="Commissions" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Lead Management Tab */}
        {activeTab === "lead-mgmt" && <AdminLeadManagement />}

        {/* Lead Analytics Tab */}
        {activeTab === "leads" && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border bg-card p-5">
                <h3 className="font-display text-lg font-semibold text-foreground">Lead Distribution</h3>
                <div className="mt-4 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={leadsByStatus}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {leadsByStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-2 flex flex-wrap justify-center gap-4">
                  {leadsByStatus.map((item) => (
                    <div key={item.name} className="flex items-center gap-2 text-sm">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-muted-foreground">{item.name}: <span className="font-semibold text-foreground">{item.value}</span></span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border bg-card p-5">
                <h3 className="font-display text-lg font-semibold text-foreground">Lead Metrics</h3>
                <div className="mt-4 space-y-4">
                  {[
                    { label: "Total Leads Created", value: "301", icon: FileText },
                    { label: "Leads Purchased", value: "89", icon: Users },
                    { label: "Conversion to Enrollment", value: "33.7%", icon: TrendingUp },
                    { label: "Revenue from Lead Sales", value: "TZS 2,670,000", icon: DollarSign },
                  ].map((metric) => (
                    <div key={metric.label} className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
                      <div className="flex items-center gap-3">
                        <metric.icon className="h-5 w-5 text-primary" />
                        <span className="text-sm text-muted-foreground">{metric.label}</span>
                      </div>
                      <span className="font-display text-lg font-bold text-foreground">{metric.value}</span>
                    </div>
                  ))}

                  {/* Lead Tier Breakdown */}
                  <div className="mt-2 rounded-lg border bg-card p-4">
                    <h4 className="text-sm font-semibold text-foreground mb-3">Lead Tier Breakdown</h4>
                    <div className="space-y-3">
                      {[
                        { tier: "Tier A — Raw", count: 156, revenue: "1,560,000", price: "10K", color: "bg-primary" },
                        { tier: "Tier B — Verified", count: 98, revenue: "1,960,000", price: "20K", color: "bg-accent" },
                        { tier: "Tier C — Premium", count: 47, revenue: "2,350,000", price: "50K", color: "bg-secondary" },
                      ].map((t) => (
                        <div key={t.tier} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`h-3 w-3 rounded-full ${t.color}`} />
                            <div>
                              <p className="text-sm font-medium text-foreground">{t.tier}</p>
                              <p className="text-xs text-muted-foreground">{t.count} leads × TZS {t.price}</p>
                            </div>
                          </div>
                          <span className="text-sm font-semibold text-foreground">TZS {t.revenue}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Leads over time */}
            <div className="rounded-lg border bg-card p-5">
              <h3 className="font-display text-lg font-semibold text-foreground">Leads Per Month</h3>
              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs fill-muted-foreground" />
                    <YAxis className="text-xs fill-muted-foreground" />
                    <Tooltip
                      contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                    />
                    <Bar dataKey="leads" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} name="Leads" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Commissions Tab */}
        {activeTab === "commissions" && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border bg-card p-6">
                <p className="text-sm text-muted-foreground">Total Commissions</p>
                <p className="mt-2 font-display text-3xl font-bold text-foreground">TZS {(totalCommissions / 1000000).toFixed(1)}M</p>
              </div>
              <div className="rounded-lg border bg-card p-6">
                <p className="text-sm text-muted-foreground">Paid</p>
                <p className="mt-2 font-display text-3xl font-bold text-secondary">TZS 1,824,000</p>
              </div>
              <div className="rounded-lg border bg-card p-6">
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="mt-2 font-display text-3xl font-bold text-accent">TZS 876,000</p>
              </div>
            </div>

            <div className="rounded-lg border bg-card overflow-hidden">
              <div className="p-5">
                <h3 className="font-display text-lg font-semibold text-foreground">Commission History</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">ID</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">School</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Student</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Tuition</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Rate</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Commission</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentCommissions.map((c) => (
                      <tr key={c.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-medium text-foreground">{c.id}</td>
                        <td className="px-4 py-3 text-foreground">{c.school}</td>
                        <td className="px-4 py-3 text-muted-foreground">{c.student}</td>
                        <td className="px-4 py-3 text-muted-foreground">TZS {c.tuition.toLocaleString()}</td>
                        <td className="px-4 py-3 text-muted-foreground">{c.rate}%</td>
                        <td className="px-4 py-3 font-semibold text-foreground">TZS {c.commission.toLocaleString()}</td>
                        <td className="px-4 py-3 text-muted-foreground">{c.date}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                            c.status === "paid" ? "bg-secondary/10 text-secondary" : "bg-accent/10 text-accent"
                          }`}>
                            {c.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Schools Tab */}
        {activeTab === "schools" && (
          <div className="space-y-6 animate-fade-in">
            <div className="rounded-lg border bg-card overflow-hidden">
              <div className="p-5">
                <h3 className="font-display text-lg font-semibold text-foreground">Top Performing Schools</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">#</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">School</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Leads Purchased</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Enrollments</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Conversion</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Commission Earned</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topSchools.map((school, i) => (
                      <tr key={school.name} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-medium text-foreground">{i + 1}</td>
                        <td className="px-4 py-3 font-medium text-foreground">{school.name}</td>
                        <td className="px-4 py-3 text-muted-foreground">{school.leads}</td>
                        <td className="px-4 py-3 text-muted-foreground">{school.enrollments}</td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-secondary/10 px-2.5 py-0.5 text-xs font-medium text-secondary">
                            {((school.enrollments / school.leads) * 100).toFixed(0)}%
                          </span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-foreground">TZS {school.commission.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Colleges Tab */}
        {activeTab === "colleges" && (
          <div className="space-y-6 animate-fade-in">
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              {[
                { icon: GraduationCap, label: "Total Colleges", value: colleges.length.toString(), sub: `${colleges.filter(c => c.status === "active").length} active`, color: "text-primary" },
                { icon: Users, label: "Total Leads", value: colleges.reduce((s, c) => s + c.leads, 0).toString(), sub: "From all colleges", color: "text-accent" },
                { icon: CheckCircle, label: "Enrollments", value: colleges.reduce((s, c) => s + c.enrollments, 0).toString(), sub: `${((colleges.reduce((s, c) => s + c.enrollments, 0) / colleges.reduce((s, c) => s + c.leads, 0)) * 100).toFixed(0)}% conversion`, color: "text-secondary" },
                { icon: DollarSign, label: "Commission Earned", value: `TZS ${(colleges.reduce((s, c) => s + c.commission, 0) / 1000000).toFixed(1)}M`, sub: "From college enrollments", color: "text-primary" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-lg border bg-card p-5">
                  <div className="flex items-center justify-between">
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    <span className="text-xs text-muted-foreground">All time</span>
                  </div>
                  <p className="mt-3 font-display text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="mt-1 text-xs text-secondary">{stat.sub}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Leads & Enrollments Chart */}
              <div className="rounded-lg border bg-card p-5">
                <h3 className="font-display text-lg font-semibold text-foreground">College Leads & Enrollments</h3>
                <div className="mt-4 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={collegeLeadsByMonth}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" className="text-xs fill-muted-foreground" />
                      <YAxis className="text-xs fill-muted-foreground" />
                      <Tooltip
                        contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                      />
                      <Bar dataKey="leads" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Leads" />
                      <Bar dataKey="enrollments" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} name="Enrollments" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* College Type Distribution */}
              <div className="rounded-lg border bg-card p-5">
                <h3 className="font-display text-lg font-semibold text-foreground">Colleges by Type</h3>
                <div className="mt-4 h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={collegeByType}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {collegeByType.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-2 flex justify-center gap-6">
                  {collegeByType.map((item) => (
                    <div key={item.name} className="flex items-center gap-2 text-sm">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-muted-foreground">{item.name}: <span className="font-semibold text-foreground">{item.value}</span></span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* College Table */}
            <div className="rounded-lg border bg-card overflow-hidden">
              <div className="p-5 flex items-center justify-between">
                <h3 className="font-display text-lg font-semibold text-foreground">All Colleges</h3>
                <span className="text-sm text-muted-foreground">{colleges.length} colleges</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">College</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Location</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Type</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Programs</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Students</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Leads</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Enrollments</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Commission</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {colleges.map((college) => (
                      <tr key={college.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-primary shrink-0" />
                            <span className="font-medium text-foreground">{college.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {college.location}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            college.type === "Public" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"
                          }`}>
                            {college.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{college.programs}</td>
                        <td className="px-4 py-3 text-muted-foreground">{college.students.toLocaleString()}</td>
                        <td className="px-4 py-3 text-muted-foreground">{college.leads}</td>
                        <td className="px-4 py-3 text-muted-foreground">{college.enrollments}</td>
                        <td className="px-4 py-3 font-semibold text-foreground">TZS {college.commission.toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                            college.status === "active" ? "bg-secondary/10 text-secondary" : "bg-accent/10 text-accent"
                          }`}>
                            {college.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Cost Analysis Tab */}
        {activeTab === "costs" && (
          <div className="space-y-6 animate-fade-in">
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              {[
                { icon: DollarSign, label: "Total Revenue", value: `TZS ${(costStructure.revenue.total / 1000000).toFixed(1)}M`, color: "text-secondary" },
                { icon: TrendingDown, label: "Total Expenses", value: `TZS ${(Object.values(costStructure.expenses).reduce((a, b) => a + b, 0) / 1000000).toFixed(1)}M`, color: "text-destructive" },
                { icon: TrendingUp, label: "Net Profit", value: `TZS ${((costStructure.revenue.total - Object.values(costStructure.expenses).reduce((a, b) => a + b, 0)) / 1000000).toFixed(1)}M`, color: "text-primary" },
                { icon: Percent, label: "Profit Margin", value: `${(((costStructure.revenue.total - Object.values(costStructure.expenses).reduce((a, b) => a + b, 0)) / costStructure.revenue.total) * 100).toFixed(1)}%`, color: "text-primary" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-lg border bg-card p-5">
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  <p className="mt-3 font-display text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Revenue vs Expenses vs Profit Chart */}
            <div className="rounded-lg border bg-card p-5">
              <h3 className="font-display text-lg font-semibold text-foreground">Revenue vs Expenses vs Profit</h3>
              <div className="mt-4 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyCostData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs fill-muted-foreground" />
                    <YAxis className="text-xs fill-muted-foreground" tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                      formatter={(value: number) => [`TZS ${value.toLocaleString()}`, ""]}
                    />
                    <Bar dataKey="revenue" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} name="Revenue" />
                    <Bar dataKey="expenses" fill="hsl(var(--destructive, 0 84% 60%))" radius={[4, 4, 0, 0]} name="Expenses" />
                    <Bar dataKey="profit" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Profit" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Expense Breakdown Pie */}
              <div className="rounded-lg border bg-card p-5">
                <h3 className="font-display text-lg font-semibold text-foreground">Expense Breakdown</h3>
                <div className="mt-4 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expenseBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {expenseBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                        formatter={(value: number) => [`TZS ${value.toLocaleString()}`, ""]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {expenseBreakdown.map((item) => (
                    <div key={item.name} className="flex items-center gap-2 text-xs">
                      <div className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-muted-foreground">{item.name}</span>
                      <span className="ml-auto font-semibold text-foreground">{(item.value / 1000000).toFixed(1)}M</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Detailed Cost Table */}
              <div className="rounded-lg border bg-card p-5">
                <h3 className="font-display text-lg font-semibold text-foreground">Cost Structure Details</h3>
                <div className="mt-4 space-y-1">
                  {/* Revenue section */}
                  <div className="rounded-lg bg-secondary/5 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-secondary">Revenue Sources</p>
                    <div className="mt-2 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Lead Sales (95 × 30k)</span>
                        <span className="font-medium text-foreground">TZS {costStructure.revenue.leadSales.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Commissions (10%)</span>
                        <span className="font-medium text-foreground">TZS {costStructure.revenue.commissions.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2 text-sm font-bold">
                        <span className="text-foreground">Total Revenue</span>
                        <span className="text-secondary">TZS {costStructure.revenue.total.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Expenses section */}
                  <div className="rounded-lg bg-destructive/5 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-destructive">Expenses</p>
                    <div className="mt-2 space-y-2">
                      {Object.entries(costStructure.expenses).map(([key, value]) => {
                        const labels: Record<string, string> = {
                          marketing: "Marketing & Ads",
                          staffSalaries: "Staff Salaries",
                          techInfra: "Tech & Infrastructure",
                          officeRent: "Office Rent",
                          smsNotifications: "SMS Notifications",
                          paymentProcessing: "Payment Processing",
                          customerSupport: "Customer Support",
                          miscellaneous: "Miscellaneous",
                        };
                        const totalExpenses = Object.values(costStructure.expenses).reduce((a, b) => a + b, 0);
                        const pct = ((value / totalExpenses) * 100).toFixed(0);
                        return (
                          <div key={key} className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">{labels[key] || key}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">({pct}%)</span>
                              <span className="font-medium text-foreground">TZS {value.toLocaleString()}</span>
                            </div>
                          </div>
                        );
                      })}
                      <div className="flex justify-between border-t pt-2 text-sm font-bold">
                        <span className="text-foreground">Total Expenses</span>
                        <span className="text-destructive">TZS {Object.values(costStructure.expenses).reduce((a, b) => a + b, 0).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Net Profit */}
                  <div className="rounded-lg bg-primary/5 p-3">
                    <div className="flex justify-between text-sm font-bold">
                      <span className="text-foreground">Net Profit</span>
                      <span className="text-primary">
                        TZS {(costStructure.revenue.total - Object.values(costStructure.expenses).reduce((a, b) => a + b, 0)).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default AdminDashboard;
