import { useState } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  GraduationCap, Clock, CheckCircle, XCircle, Eye,
  FileText, MessageSquare, ArrowRight, Building2
} from "lucide-react";

const myApplications = [
  {
    id: "APP-001",
    school: "Bright Academy",
    level: "O-Level",
    type: "Boarding",
    status: "contacted",
    date: "2026-03-02",
    student: "Ali Hassan",
    category: "school" as const,
  },
  {
    id: "APP-002",
    school: "Star Secondary School",
    level: "A-Level",
    type: "Day",
    status: "enrolled",
    date: "2026-02-20",
    student: "Ali Hassan",
    category: "school" as const,
  },
  {
    id: "APP-003",
    school: "Uhuru High School",
    level: "O-Level",
    type: "Boarding",
    status: "pending",
    date: "2026-03-08",
    student: "Amina Hassan",
    category: "school" as const,
  },
  {
    id: "APP-004",
    school: "University of Dar es Salaam",
    level: "Degree",
    type: "Public",
    status: "pending",
    date: "2026-03-05",
    student: "Ali Hassan",
    category: "college" as const,
  },
  {
    id: "APP-005",
    school: "IFM",
    level: "Diploma",
    type: "Public",
    status: "contacted",
    date: "2026-03-01",
    student: "Amina Hassan",
    category: "college" as const,
  },
];

const recommendedSchools = [
  { name: "Mwenge Secondary", level: "O-Level", tuition: "3.5M - 4.5M", area: "Kinondoni", category: "school" as const },
  { name: "Victoria Academy", level: "O-Level", tuition: "2.8M - 3.8M", area: "Ilala", category: "school" as const },
  { name: "CBE", level: "Diploma", tuition: "1.5M - 3.5M", area: "Ilala", category: "college" as const },
  { name: "Ardhi University", level: "Degree", tuition: "1.8M - 4M", area: "Ubungo", category: "college" as const },
];

type Tab = "overview" | "applications" | "recommended";

const MyDashboard = () => {
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const statusConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
    pending: { icon: Clock, color: "bg-primary/10 text-primary", label: "Pending" },
    contacted: { icon: MessageSquare, color: "bg-accent/10 text-accent", label: "Contacted" },
    enrolled: { icon: CheckCircle, color: "bg-secondary/10 text-secondary", label: "Enrolled" },
    rejected: { icon: XCircle, color: "bg-destructive/10 text-destructive", label: "Rejected" },
  };

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: "overview", label: "Overview", icon: GraduationCap },
    { key: "applications", label: "My Applications", icon: FileText },
    { key: "recommended", label: "Recommendations", icon: Eye },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container py-8">
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">My Dashboard</h1>
          <p className="text-sm text-muted-foreground">Welcome, Amina</p>
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
                { icon: FileText, label: "Total Applications", value: String(myApplications.length), color: "text-primary" },
                { icon: Building2, label: "College Apps", value: String(myApplications.filter(a => a.category === "college").length), color: "text-accent" },
                { icon: MessageSquare, label: "Contacted", value: String(myApplications.filter(a => a.status === "contacted").length), color: "text-accent" },
                { icon: CheckCircle, label: "Enrolled", value: String(myApplications.filter(a => a.status === "enrolled").length), color: "text-secondary" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-lg border bg-card p-5">
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  <p className="mt-3 font-display text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Recent applications */}
            <div className="rounded-lg border bg-card p-5">
              <h3 className="font-display text-lg font-semibold text-foreground">Recent Applications</h3>
              <div className="mt-4 space-y-3">
                {myApplications.map((app) => {
                  const config = statusConfig[app.status];
                  return (
                    <div key={app.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${app.category === "college" ? "bg-accent/10" : "bg-primary/10"}`}>
                          {app.category === "college" ? <Building2 className="h-5 w-5 text-accent" /> : <GraduationCap className="h-5 w-5 text-primary" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-foreground">{app.school}</p>
                            <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${app.category === "college" ? "bg-accent/10 text-accent" : "bg-primary/10 text-primary"}`}>
                              {app.category === "college" ? "Chuo" : "Shule"}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">{app.student} • {app.level} • {app.type}</p>
                        </div>
                      </div>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${config.color}`}>
                        {config.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Applications */}
        {activeTab === "applications" && (
          <div className="space-y-4 animate-fade-in">
            {myApplications.map((app) => {
              const config = statusConfig[app.status];
              const StatusIcon = config.icon;
              return (
                <div key={app.id} className="rounded-lg border bg-card p-5 card-hover">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-display text-lg font-semibold text-foreground">{app.school}</h3>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${app.category === "college" ? "bg-accent/10 text-accent" : "bg-primary/10 text-primary"}`}>
                          {app.category === "college" ? "Chuo" : "Shule"}
                        </span>
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${config.color}`}>
                          <StatusIcon className="mr-1 inline h-3 w-3" />{config.label}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Student: {app.student} • {app.level} • {app.type}
                      </p>
                      <p className="text-xs text-muted-foreground">Date: {app.date} • Ref: {app.id}</p>
                    </div>
                    <Link to={`/shule/1`}>
                      <Button variant="outline" size="sm" className="gap-1">
                        <Eye className="h-3.5 w-3.5" /> View School
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}

            <div className="text-center pt-4">
              <Link to="/omba-nafasi">
                <Button className="gap-2">
                  New Application <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Recommended */}
        {activeTab === "recommended" && (
          <div className="space-y-4 animate-fade-in">
            <p className="text-sm text-muted-foreground">Based on your applications, we recommend these:</p>
            {recommendedSchools.map((school) => (
              <div key={school.name} className="rounded-lg border bg-card p-5 card-hover">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-display text-lg font-semibold text-foreground">{school.name}</h3>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${school.category === "college" ? "bg-accent/10 text-accent" : "bg-primary/10 text-primary"}`}>
                        {school.category === "college" ? "Chuo" : "Shule"}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{school.level} • {school.area} • Tuition: TZS {school.tuition}</p>
                  </div>
                  <Link to="/omba-nafasi">
                    <Button size="sm" className="gap-1">
                      Apply <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default MyDashboard;
