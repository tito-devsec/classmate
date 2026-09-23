import { useState, useEffect, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Users, Eye, CheckCircle, ArrowRight, Phone, MapPin,
  Filter, ClipboardList, ShieldCheck, FileText, GraduationCap,
  Upload, MessageSquare, AlertCircle, Globe, Target, Star, Activity
} from "lucide-react";
import {
  approveLeadToTracking,
  getTrackedLeads,
  addTrackingAction,
  updateTrackingStatus,
  subscribe,
  type TrackedLead,
  type TrackingStatus,
} from "@/data/leadStore";
import { toast } from "@/hooks/use-toast";

type LeadStatus = "tier_a" | "tier_b" | "tier_c";
type LeadSource = "direct" | "general";

type WorkStatus = "idle" | "in_progress" | "done";

interface AdminLead {
  id: string;
  parentName: string;
  phone: string;
  studentName: string;
  studentGender: string;
  category: string;
  level: string;
  budget: string;
  boardingType: string;
  locationFrom: string;
  regionWanted: string;
  status: LeadStatus;
  date: string;
  source: LeadSource;
  schoolChoices: string[];
  assignedSchools: string[];
  callNotes?: string;
  subjectResults?: { subject: string; score: string }[];
  resultsFile?: string;
  examNotes?: string;
  workStatus: WorkStatus;
  assignedStaff?: string;
}

const mockLeads: AdminLead[] = [
  {
    id: "L-1070", parentName: "Amina Hassan", phone: "+255 712 345 678",
    studentName: "Rashid Hassan", studentGender: "Boy", category: "O-Level", level: "Form 1",
    budget: "3M - 5M", boardingType: "Boarding", locationFrom: "Dar es Salaam",
    regionWanted: "Morogoro", status: "tier_a", date: "2026-03-12",
    source: "direct", schoolChoices: ["Bright Academy", "Feza Boys"],
    assignedSchools: [], workStatus: "idle",
  },
  {
    id: "L-1071", parentName: "John Mwalimu", phone: "+255 754 987 654",
    studentName: "Adam Mwalimu", studentGender: "Boy", category: "A-Level", level: "Form 5",
    budget: "5M - 8M", boardingType: "Day", locationFrom: "Arusha",
    regionWanted: "Dar es Salaam", status: "tier_a", date: "2026-03-12",
    source: "general", schoolChoices: [],
    assignedSchools: [], workStatus: "idle",
  },
  {
    id: "L-1068", parentName: "Fatma Said", phone: "+255 689 111 222",
    studentName: "Omar Said", studentGender: "Boy", category: "O-Level", level: "Form 3",
    budget: "2M - 4M", boardingType: "Boarding", locationFrom: "Mwanza",
    regionWanted: "", status: "tier_a", date: "2026-03-11",
    source: "direct", schoolChoices: ["Star Secondary", "Victoria Academy", "Uhuru High School"],
    assignedSchools: ["Star Secondary", "Victoria Academy"], workStatus: "idle",
  },
  {
    id: "L-1065", parentName: "Grace Kimaro", phone: "+255 765 444 333",
    studentName: "Neema Kimaro", studentGender: "Girl", category: "O-Level", level: "Form 1",
    budget: "4M - 6M", boardingType: "Day", locationFrom: "Dodoma",
    regionWanted: "Dar es Salaam", status: "tier_b", date: "2026-03-10",
    source: "general", schoolChoices: [],
    assignedSchools: ["Uhuru High School", "Victoria Academy"],
    callNotes: "Parent is serious, wants the child to start next month. Prefers a school with good labs.",
    workStatus: "done", assignedStaff: "Sarah M.",
  },
  {
    id: "L-1060", parentName: "Hassan Ali", phone: "+255 622 888 999",
    studentName: "Yusuf Ali", studentGender: "Boy", category: "O-Level", level: "Form 1",
    budget: "3M - 5M", boardingType: "Boarding", locationFrom: "Tanga",
    regionWanted: "Dar es Salaam", status: "tier_c", date: "2026-03-08",
    source: "direct", schoolChoices: ["Bright Academy", "Feza Boys"],
    assignedSchools: ["Bright Academy"],
    callNotes: "Parent agreed to bring child for exam. Will arrive on the 15th.",
    subjectResults: [
      { subject: "Mathematics", score: "78" },
      { subject: "English", score: "62" },
      { subject: "Science", score: "85" },
      { subject: "Kiswahili", score: "71" },
    ],
    resultsFile: "yusuf_ali_results.pdf",
    examNotes: "Student performed very well in Math and Science. English needs improvement.",
    workStatus: "done", assignedStaff: "James K.",
  },
];

const allSchools = [
  "Bright Academy", "Star Secondary", "Uhuru High School",
  "Victoria Academy", "Mwenge Secondary", "Feza Boys", "Feza Girls", "St. Mary's"
];

const statusConfig: Record<LeadStatus, { label: string; color: string; price: string; description: string }> = {
  tier_a: { label: "Tier A — Raw", color: "bg-chart-4/10 text-chart-4", price: "10,000 TZS", description: "New lead, no call made yet" },
  tier_b: { label: "Tier B — Verified", color: "bg-primary/10 text-primary", price: "20,000 TZS", description: "Staff spoke with parent, confirmed intent" },
  tier_c: { label: "Tier C — Premium", color: "bg-secondary/10 text-secondary", price: "50,000 TZS", description: "Exam completed, results entered" },
};

const statusSteps: LeadStatus[] = ["tier_a", "tier_b", "tier_c"];

export const AdminLeadManagement = () => {
  const [leads, setLeads] = useState<AdminLead[]>(mockLeads);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterSource, setFilterSource] = useState<string>("all");
  const [filterWork, setFilterWork] = useState<string>("all");
  const [expandedLead, setExpandedLead] = useState<string | null>(null);
  const [callNotesInput, setCallNotesInput] = useState<Record<string, string>>({});
  const [subjectInputs, setSubjectInputs] = useState<Record<string, { subject: string; score: string }[]>>({});
  const [examNotesInput, setExamNotesInput] = useState<Record<string, string>>({});
  const [resultsFileInput, setResultsFileInput] = useState<Record<string, string>>({});
  const [selectedSchools, setSelectedSchools] = useState<Record<string, string[]>>({});
  const [activeView, setActiveView] = useState<"pipeline" | "tracking">("pipeline");
  const [trackingNoteInput, setTrackingNoteInput] = useState<Record<string, string>>({});

  // Subscribe to tracked leads from shared store
  const trackedLeadsSnapshot = useSyncExternalStore(
    subscribe,
    getTrackedLeads
  );


  const filteredLeads = leads.filter((l) => {
    if (filterStatus !== "all" && l.status !== filterStatus) return false;
    if (filterSource !== "all" && l.source !== filterSource) return false;
    if (filterWork !== "all" && l.workStatus !== filterWork) return false;
    return true;
  });

  // Claim lead — staff starts working on it
  const claimLead = (leadId: string) => {
    setLeads((prev) =>
      prev.map((l) =>
        l.id === leadId ? { ...l, workStatus: "in_progress" as WorkStatus, assignedStaff: "You" } : l
      )
    );
    toast({ title: "🔒 Lead Claimed", description: `You are now working on lead ${leadId}` });
  };

  // Mark lead work as done
  const markWorkDone = (leadId: string) => {
    setLeads((prev) =>
      prev.map((l) =>
        l.id === leadId ? { ...l, workStatus: "done" as WorkStatus } : l
      )
    );
  };

  // Assign/match schools to lead (for Tier A)
  const assignSchools = (leadId: string) => {
    const schools = selectedSchools[leadId] || [];
    if (schools.length === 0) return;
    setLeads((prev) =>
      prev.map((l) =>
        l.id === leadId ? { ...l, assignedSchools: [...new Set([...l.assignedSchools, ...schools])] } : l
      )
    );
    setSelectedSchools((prev) => ({ ...prev, [leadId]: [] }));
  };

  // Manually set tier
  const setTier = (leadId: string, tier: LeadStatus) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status: tier } : l))
    );
  };

  // Approve as Tier A (confirm reviewed)
  const approveAsTierA = (leadId: string) => {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return;
    setLeads((prev) =>
      prev.map((l) =>
        l.id === leadId ? { ...l, status: "tier_a" as LeadStatus } : l
      )
    );
    approveLeadToTracking({
      leadId: lead.id,
      parentName: lead.parentName,
      studentName: lead.studentName,
      studentGender: lead.studentGender,
      category: lead.category,
      level: lead.level,
      budget: lead.budget,
      boardingType: lead.boardingType,
      tier: "A",
      assignedSchools: lead.assignedSchools,
    });
    toast({ title: "✅ Lead Approved as Tier A", description: `${lead.studentName} — Notification sent to ${lead.assignedSchools.length} assigned school(s)` });
  };

  // Approve as Tier B (after talking to parent)
  const approveAsTierB = (leadId: string) => {
    const callNotes = callNotesInput[leadId] || "";
    if (!callNotes.trim()) return;
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return;
    setLeads((prev) =>
      prev.map((l) =>
        l.id === leadId ? { ...l, status: "tier_b" as LeadStatus, callNotes } : l
      )
    );
    approveLeadToTracking({
      leadId: lead.id,
      parentName: lead.parentName,
      studentName: lead.studentName,
      studentGender: lead.studentGender,
      category: lead.category,
      level: lead.level,
      budget: lead.budget,
      boardingType: lead.boardingType,
      tier: "B",
      assignedSchools: lead.assignedSchools,
      callNotes,
    });
    setCallNotesInput((prev) => ({ ...prev, [leadId]: "" }));
    toast({ title: "✅ Lead Approved as Tier B", description: `${lead.studentName} — Notification sent to ${lead.assignedSchools.length} school(s)` });
  };

  // Add subject row
  const addSubjectRow = (leadId: string) => {
    setSubjectInputs((prev) => ({
      ...prev,
      [leadId]: [...(prev[leadId] || []), { subject: "", score: "" }],
    }));
  };

  const updateSubjectRow = (leadId: string, index: number, field: "subject" | "score", value: string) => {
    setSubjectInputs((prev) => {
      const rows = [...(prev[leadId] || [])];
      rows[index] = { ...rows[index], [field]: value };
      return { ...prev, [leadId]: rows };
    });
  };

  const removeSubjectRow = (leadId: string, index: number) => {
    setSubjectInputs((prev) => ({
      ...prev,
      [leadId]: (prev[leadId] || []).filter((_, i) => i !== index),
    }));
  };

  // Mark Exam Completed → Tier C (only needs subjects + file, no call notes)
  const markExamCompleted = (leadId: string) => {
    const subjects = subjectInputs[leadId] || [];
    const notes = examNotesInput[leadId] || "";
    const file = resultsFileInput[leadId] || "";
    if (subjects.length === 0 || subjects.some((s) => !s.subject.trim() || !s.score.trim())) return;
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return;
    setLeads((prev) =>
      prev.map((l) =>
        l.id === leadId ? { ...l, status: "tier_c" as LeadStatus, subjectResults: subjects, examNotes: notes, resultsFile: file || undefined } : l
      )
    );
    approveLeadToTracking({
      leadId: lead.id,
      parentName: lead.parentName,
      studentName: lead.studentName,
      studentGender: lead.studentGender,
      category: lead.category,
      level: lead.level,
      budget: lead.budget,
      boardingType: lead.boardingType,
      tier: "C",
      assignedSchools: lead.assignedSchools,
      callNotes: lead.callNotes,
      subjectResults: subjects,
      resultsFile: file || undefined,
      examNotes: notes,
    });
    setSubjectInputs((prev) => ({ ...prev, [leadId]: [] }));
    setExamNotesInput((prev) => ({ ...prev, [leadId]: "" }));
    setResultsFileInput((prev) => ({ ...prev, [leadId]: "" }));
    toast({ title: "✅ Lead Approved as Tier C", description: `${lead.studentName} — Notification sent to ${lead.assignedSchools.length} school(s)` });
  };

  const addSchoolToLead = (leadId: string, school: string) => {
    setSelectedSchools((prev) => {
      const current = prev[leadId] || [];
      if (current.includes(school)) return prev;
      return { ...prev, [leadId]: [...current, school] };
    });
  };

  const removeSchoolFromLead = (leadId: string, school: string) => {
    setSelectedSchools((prev) => ({
      ...prev,
      [leadId]: (prev[leadId] || []).filter((s) => s !== school),
    }));
  };

  const counts = statusSteps.reduce((acc, s) => {
    acc[s] = leads.filter((l) => l.status === s).length;
    return acc;
  }, {} as Record<LeadStatus, number>);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* View Toggle: Pipeline vs Tracking */}
      <div className="flex gap-2 rounded-lg border bg-card p-1">
        <button
          onClick={() => setActiveView("pipeline")}
          className={`flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-colors ${
            activeView === "pipeline" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
          }`}
        >
          <Users className="h-4 w-4" /> Lead Pipeline
        </button>
        <button
          onClick={() => setActiveView("tracking")}
          className={`flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-colors ${
            activeView === "tracking" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
          }`}
        >
          <Activity className="h-4 w-4" /> Lead Tracking ({trackedLeadsSnapshot.length})
        </button>
      </div>

      {activeView === "pipeline" && (<>
      {/* Status Pipeline — 3 steps */}
      <div className="grid grid-cols-3 gap-2">
        {statusSteps.map((step, i) => (
          <button
            key={step}
            onClick={() => setFilterStatus(filterStatus === step ? "all" : step)}
            className={`rounded-lg border p-3 text-center transition-colors ${
              filterStatus === step ? "border-primary bg-primary/5" : "bg-card hover:bg-muted/50"
            }`}
          >
            <p className="font-display text-xl font-bold text-foreground">{counts[step]}</p>
            <p className="text-xs text-muted-foreground">{statusConfig[step].label}</p>
            <p className="text-[10px] text-muted-foreground/70">{statusConfig[step].price}</p>
            {i < statusSteps.length - 1 && (
              <ArrowRight className="mx-auto mt-1 h-3 w-3 text-muted-foreground/50 hidden md:block" />
            )}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="h-4 w-4" />
          Filters:
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {statusSteps.map((s) => (
              <SelectItem key={s} value={s}>{statusConfig[s].label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterSource} onValueChange={setFilterSource}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            <SelectItem value="direct">🎯 Direct (Chose School)</SelectItem>
            <SelectItem value="general">🌐 General (Lead Capture)</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterWork} onValueChange={setFilterWork}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Work Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Work Status</SelectItem>
            <SelectItem value="idle">⬜ Not Started</SelectItem>
            <SelectItem value="in_progress">🔧 In Progress</SelectItem>
            <SelectItem value="done">✅ Completed</SelectItem>
          </SelectContent>
        </Select>
        <span className="ml-auto text-sm text-muted-foreground">
          {filteredLeads.length} lead{filteredLeads.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Lead Table */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Lead</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Parent / Student</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Source</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Category</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Location</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Matching</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((lead) => (
                <>
                  <tr
                    key={lead.id}
                    className="border-b last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => setExpandedLead(expandedLead === lead.id ? null : lead.id)}
                  >
                    <td className="px-4 py-3">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-foreground">{lead.id}</span>
                          {lead.workStatus === "in_progress" && (
                            <span className="flex items-center gap-0.5 rounded-full bg-chart-4/10 px-2 py-0.5 text-[10px] font-medium text-chart-4 animate-pulse">
                              🔧 In Progress
                            </span>
                          )}
                          {lead.workStatus === "done" && (
                            <span className="flex items-center gap-0.5 rounded-full bg-secondary/10 px-2 py-0.5 text-[10px] font-medium text-secondary">
                              ✅ Completed
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{lead.date}</p>
                        {lead.assignedStaff && (
                          <p className="text-[10px] text-muted-foreground">👤 {lead.assignedStaff}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <span className="text-foreground">{lead.parentName}</span>
                        <p className="text-xs text-muted-foreground">{lead.studentName} • {lead.studentGender}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {lead.source === "direct" ? (
                        <span className="flex items-center gap-1 rounded-full bg-secondary/10 px-2.5 py-0.5 text-xs font-medium text-secondary">
                          <Target className="h-3 w-3" /> Direct
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
                          <Globe className="h-3 w-3" /> General
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                        {lead.category} • {lead.level}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-muted-foreground text-xs">
                        <MapPin className="h-3 w-3" />
                        {lead.locationFrom}
                        {lead.regionWanted && <span className="text-primary"> → {lead.regionWanted}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusConfig[lead.status].color}`}>
                        {statusConfig[lead.status].label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {lead.source === "direct" && lead.schoolChoices.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {lead.schoolChoices.slice(0, 2).map((s) => (
                            <span key={s} className="flex items-center gap-0.5 rounded bg-secondary/10 px-1.5 py-0.5 text-[10px] text-secondary">
                              <Star className="h-2.5 w-2.5" /> {s}
                            </span>
                          ))}
                          {lead.schoolChoices.length > 2 && (
                            <span className="text-[10px] text-muted-foreground">+{lead.schoolChoices.length - 2}</span>
                          )}
                        </div>
                      ) : lead.assignedSchools.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {lead.assignedSchools.slice(0, 2).map((s) => (
                            <span key={s} className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-foreground">{s}</span>
                          ))}
                          {lead.assignedSchools.length > 2 && (
                            <span className="text-[10px] text-muted-foreground">+{lead.assignedSchools.length - 2}</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-accent italic">Needs Rec</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Claim / Work Status Buttons */}
                        {lead.workStatus === "idle" && (
                          <Button size="sm" variant="outline" className="gap-1 text-xs h-7 border-chart-4/30 text-chart-4 hover:bg-chart-4/10" onClick={(e) => { e.stopPropagation(); claimLead(lead.id); }}>
                            🔒 Claim
                          </Button>
                        )}
                        {lead.workStatus === "in_progress" && (
                          <Button size="sm" variant="outline" className="gap-1 text-xs h-7 border-secondary/30 text-secondary hover:bg-secondary/10" onClick={(e) => { e.stopPropagation(); markWorkDone(lead.id); }}>
                            ✅ Mark Done
                          </Button>
                        )}

                        {/* Tier-specific actions */}
                        {lead.workStatus !== "done" && lead.status === "tier_a" && (
                          <Button size="sm" variant="outline" className="gap-1 text-xs h-7" onClick={(e) => { e.stopPropagation(); setExpandedLead(lead.id); }}>
                            <Eye className="h-3 w-3" /> Review
                          </Button>
                        )}
                        {lead.workStatus !== "done" && lead.status === "tier_b" && (
                          <Button size="sm" variant="outline" className="gap-1 text-xs h-7" onClick={(e) => { e.stopPropagation(); setExpandedLead(lead.id); }}>
                            <Phone className="h-3 w-3" /> Talk to Parent
                          </Button>
                        )}
                        {lead.workStatus !== "done" && lead.status === "tier_c" && (
                          <Button size="sm" variant="outline" className="gap-1 text-xs h-7" onClick={(e) => { e.stopPropagation(); setExpandedLead(lead.id); }}>
                            <GraduationCap className="h-3 w-3" /> Add Exam
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Detail Row */}
                  {expandedLead === lead.id && (
                    <tr key={`${lead.id}-detail`} className="border-b bg-muted/20">
                      <td colSpan={8} className="px-4 py-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          {/* Lead Details */}
                          <div className="space-y-2 rounded-lg border bg-card p-4">
                            <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                              <ClipboardList className="h-3.5 w-3.5 text-primary" /> Lead Details
                            </h4>
                            <div className="space-y-1.5 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Phone:</span>
                                <span className="flex items-center gap-1 text-foreground"><Phone className="h-3 w-3" /> {lead.phone}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Student:</span>
                                <span className="text-foreground">{lead.studentName} ({lead.studentGender})</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Level:</span>
                                <span className="text-foreground">{lead.category} — {lead.level}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Budget:</span>
                                <span className="text-foreground">{lead.budget}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Type:</span>
                                <span className="text-foreground">{lead.boardingType}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Source:</span>
                                <span className="text-foreground flex items-center gap-1">
                                  {lead.source === "direct" ? (
                                    <><Target className="h-3 w-3 text-secondary" /> Direct — Chose specific school(s)</>
                                  ) : (
                                    <><Globe className="h-3 w-3 text-accent" /> General — Lead Capture Form</>
                                  )}
                                </span>
                              </div>

                              {/* School Choices — for direct leads */}
                              {lead.source === "direct" && lead.schoolChoices.length > 0 && (
                                <div className="mt-2 rounded-md bg-secondary/5 p-2.5 border border-secondary/10">
                                  <p className="text-xs font-medium text-secondary flex items-center gap-1">
                                    <Star className="h-3 w-3" /> Parent's School Choices (Top Choices):
                                  </p>
                                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                                    {lead.schoolChoices.map((s, i) => (
                                      <span key={s} className="flex items-center gap-1 rounded-full bg-secondary/10 px-2.5 py-0.5 text-xs font-medium text-secondary">
                                        #{i + 1} {s}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* General source note */}
                              {lead.source === "general" && (
                                <div className="mt-2 rounded-md bg-accent/5 p-2.5 border border-accent/10">
                                  <p className="text-xs font-medium text-accent flex items-center gap-1">
                                    <Globe className="h-3 w-3" /> Parent did not choose specific schools
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    This lead came from the Lead Capture Form. You need to recommend schools based on budget, location, and level.
                                  </p>
                                </div>
                              )}

                              {lead.callNotes && (
                                <div className="mt-2 rounded-md bg-primary/5 p-2.5 border border-primary/10">
                                  <p className="text-xs font-medium text-primary flex items-center gap-1"><MessageSquare className="h-3 w-3" /> Call Notes:</p>
                                  <p className="text-xs text-foreground mt-1">{lead.callNotes}</p>
                                </div>
                              )}
                              {lead.subjectResults && lead.subjectResults.length > 0 && (
                                <div className="mt-2 rounded-md bg-secondary/5 p-2.5 border border-secondary/10">
                                  <p className="text-xs font-medium text-secondary flex items-center gap-1"><GraduationCap className="h-3 w-3" /> Subject Results:</p>
                                  <div className="mt-1.5 space-y-1">
                                    {lead.subjectResults.map((sr, i) => (
                                      <div key={i} className="flex justify-between text-xs">
                                        <span className="text-foreground">{sr.subject}</span>
                                        <span className="font-bold text-foreground">{sr.score}</span>
                                      </div>
                                    ))}
                                  </div>
                                  {lead.resultsFile && (
                                    <p className="text-[10px] text-muted-foreground mt-1.5 flex items-center gap-1">
                                      <FileText className="h-3 w-3" /> {lead.resultsFile}
                                    </p>
                                  )}
                                  {lead.examNotes && <p className="text-xs text-muted-foreground mt-1">{lead.examNotes}</p>}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Action Panel */}
                          <div className="space-y-2 rounded-lg border bg-card p-4">
                            {/* Manual Tier Assignment */}
                            <div className="rounded-md bg-muted/50 p-3 space-y-2 mb-3">
                              <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Change Tier (Manual Override)
                              </p>
                              <div className="flex gap-1.5">
                                {statusSteps.map((tier) => (
                                  <Button
                                    key={tier}
                                    size="sm"
                                    variant={lead.status === tier ? "default" : "outline"}
                                    className={`flex-1 text-xs h-8 gap-1 ${lead.status === tier ? "" : ""}`}
                                    onClick={(e) => { e.stopPropagation(); setTier(lead.id, tier); }}
                                  >
                                    {statusConfig[tier].label.split(" — ")[0]}
                                    <span className="text-[10px] opacity-70">({statusConfig[tier].price})</span>
                                  </Button>
                                ))}
                              </div>
                            </div>

                            {/* TIER A → Review & Match → Approve as Tier A */}
                            {lead.status === "tier_a" && (
                              <>
                                <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                                  <Eye className="h-3.5 w-3.5 text-primary" /> Review & Match Schools
                                </h4>

                                {/* Matching section */}
                                <div className="rounded-md bg-muted/50 p-3 space-y-2">
                                  <p className="text-xs font-medium text-foreground flex items-center gap-1">
                                    <Target className="h-3 w-3 text-primary" />
                                    {lead.source === "direct" ? "Parent's Choices vs Assigned:" : "Recommend & Assign Schools:"}
                                  </p>

                                  {lead.source === "direct" && lead.schoolChoices.length > 0 && (
                                    <div className="space-y-1">
                                      <p className="text-[10px] text-muted-foreground uppercase font-semibold">Parent's Choices:</p>
                                      <div className="flex flex-wrap gap-1">
                                        {lead.schoolChoices.map((s, i) => (
                                          <span key={s} className="rounded-full bg-secondary/10 px-2 py-0.5 text-xs text-secondary font-medium">
                                            #{i + 1} {s}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {lead.source === "general" && (
                                    <p className="text-xs text-accent italic">
                                      ⚠ Lead capture form — no school choices. Recommend schools based on criteria.
                                    </p>
                                  )}

                                  <Select onValueChange={(val) => addSchoolToLead(lead.id, val)}>
                                    <SelectTrigger>
                                      <SelectValue placeholder={lead.source === "direct" ? "Add another school..." : "Recommend a school..."} />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {allSchools.map((s) => (
                                        <SelectItem key={s} value={s}>{s}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  {(selectedSchools[lead.id] || []).length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                      {(selectedSchools[lead.id] || []).map((s) => (
                                        <span
                                          key={s}
                                          className="flex items-center gap-1 rounded-full bg-chart-4/10 px-2 py-0.5 text-xs text-chart-4 cursor-pointer"
                                          onClick={() => removeSchoolFromLead(lead.id, s)}
                                        >
                                          {s} ×
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="w-full gap-1.5"
                                    onClick={() => assignSchools(lead.id)}
                                    disabled={(selectedSchools[lead.id] || []).length === 0}
                                  >
                                    <Target className="h-3 w-3" /> Assign Schools
                                  </Button>
                                </div>

                                {/* Already assigned */}
                                {lead.assignedSchools.length > 0 && (
                                  <div className="rounded-md bg-chart-4/5 p-2 border border-chart-4/10">
                                    <p className="text-[10px] text-muted-foreground uppercase font-semibold mb-1">Assigned Schools:</p>
                                    <div className="flex flex-wrap gap-1">
                                      {lead.assignedSchools.map((s) => (
                                        <span key={s} className="rounded-full bg-chart-4/10 px-2 py-0.5 text-xs text-chart-4 font-medium">{s}</span>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                <Button
                                  className="w-full gap-1.5 mt-2"
                                  onClick={() => approveAsTierA(lead.id)}
                                >
                                  <CheckCircle className="h-4 w-4" /> ✅ Approve as Tier A (10,000 TZS)
                                </Button>
                              </>
                            )}

                            {/* TIER B → Talk to Parent → Approve as Tier B */}
                            {lead.status === "tier_b" && (
                              <>
                                <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                                  <Phone className="h-3.5 w-3.5 text-primary" /> Talk to Parent (Call Verification)
                                </h4>
                                <p className="text-xs text-muted-foreground">
                                  Staff should speak with the parent to verify genuine enrollment intent. Write call notes below:
                                </p>

                                <div className="rounded-md bg-primary/5 p-3 space-y-2 border border-primary/10">
                                  <p className="text-xs font-medium text-foreground flex items-center gap-1">
                                    <MessageSquare className="h-3 w-3 text-primary" /> Call Notes (Required)
                                  </p>
                                  <Textarea
                                    placeholder="Write call notes... e.g., 'Parent is serious, wants child to start next month. Confirmed budget and location.'"
                                    value={callNotesInput[lead.id] || ""}
                                    onChange={(e) => setCallNotesInput((prev) => ({ ...prev, [lead.id]: e.target.value }))}
                                    className="min-h-[80px]"
                                  />
                                  {!(callNotesInput[lead.id] || "").trim() && (
                                    <p className="text-xs text-destructive flex items-center gap-1">
                                      <AlertCircle className="h-3 w-3" /> Call Notes are required before approving
                                    </p>
                                  )}
                                </div>

                                <Button
                                  className="w-full gap-1.5 mt-2"
                                  onClick={() => approveAsTierB(lead.id)}
                                  disabled={!(callNotesInput[lead.id] || "").trim()}
                                >
                                  <CheckCircle className="h-4 w-4" /> ✅ Approve as Tier B (20,000 TZS)
                                </Button>
                              </>
                            )}

                            {/* TIER C → Exam Results → Approve as Tier C */}
                            {lead.status === "tier_c" && (
                              <>
                                <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                                  <GraduationCap className="h-3.5 w-3.5 text-secondary" /> Exam Results
                                </h4>
                                <p className="text-xs text-muted-foreground">
                                  Enter subject scores and upload results:
                                </p>

                                <div className="space-y-2 mt-2">
                                  {(subjectInputs[lead.id] || []).map((row, idx) => (
                                    <div key={idx} className="flex gap-2 items-center">
                                      <Input
                                        placeholder="Subject (e.g., Mathematics)"
                                        value={row.subject}
                                        onChange={(e) => updateSubjectRow(lead.id, idx, "subject", e.target.value)}
                                        className="flex-1"
                                      />
                                      <Input
                                        placeholder="Score (e.g., 78)"
                                        value={row.score}
                                        onChange={(e) => updateSubjectRow(lead.id, idx, "score", e.target.value)}
                                        className="w-24"
                                      />
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-8 w-8 text-destructive shrink-0"
                                        onClick={() => removeSubjectRow(lead.id, idx)}
                                      >
                                        ×
                                      </Button>
                                    </div>
                                  ))}
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="w-full gap-1.5 text-xs"
                                    onClick={() => addSubjectRow(lead.id)}
                                  >
                                    + Add Subject
                                  </Button>

                                  <div className="rounded-md bg-muted/50 p-3 space-y-2">
                                    <p className="text-xs font-medium text-foreground flex items-center gap-1">
                                      <Upload className="h-3 w-3 text-primary" /> Upload Results (PDF/Image)
                                    </p>
                                    <Input
                                      type="file"
                                      accept=".pdf,.jpg,.jpeg,.png"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          setResultsFileInput((prev) => ({ ...prev, [lead.id]: file.name }));
                                        }
                                      }}
                                      className="text-xs"
                                    />
                                    {resultsFileInput[lead.id] && (
                                      <p className="text-xs text-secondary flex items-center gap-1">
                                        <FileText className="h-3 w-3" /> {resultsFileInput[lead.id]}
                                      </p>
                                    )}
                                  </div>

                                  <Textarea
                                    placeholder="Additional notes... e.g., 'Performed well in Math and Science'"
                                    value={examNotesInput[lead.id] || ""}
                                    onChange={(e) => setExamNotesInput((prev) => ({ ...prev, [lead.id]: e.target.value }))}
                                    className="min-h-[60px]"
                                  />

                                  {lead.subjectResults && lead.subjectResults.length > 0 && (
                                    <div className="rounded-md bg-secondary/5 p-2.5 border border-secondary/10">
                                      <p className="text-xs font-medium text-secondary">✅ Recorded Results:</p>
                                      <div className="mt-1.5 space-y-1">
                                        {lead.subjectResults.map((sr, i) => (
                                          <div key={i} className="flex justify-between text-xs">
                                            <span className="text-foreground">{sr.subject}</span>
                                            <span className="font-bold text-foreground">{sr.score}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  <Button
                                    className="w-full gap-1.5"
                                    variant="default"
                                    onClick={() => markExamCompleted(lead.id)}
                                    disabled={
                                      (subjectInputs[lead.id] || []).length === 0 ||
                                      (subjectInputs[lead.id] || []).some((s) => !s.subject.trim() || !s.score.trim())
                                    }
                                  >
                                    <CheckCircle className="h-4 w-4" /> ✅ Approve as Tier C (50,000 TZS)
                                  </Button>
                                  {(subjectInputs[lead.id] || []).length === 0 && !lead.subjectResults?.length && (
                                    <p className="text-xs text-destructive flex items-center gap-1">
                                      <AlertCircle className="h-3 w-3" /> At least one subject is required before approving
                                    </p>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Status Timeline */}
                        <div className="mt-4 flex items-center gap-1 rounded-lg border bg-card p-3">
                          {statusSteps.map((step, i) => {
                            const stepIndex = statusSteps.indexOf(lead.status);
                            const isActive = i <= stepIndex;
                            const isCurrent = step === lead.status;
                            return (
                              <div key={step} className="flex items-center gap-1 flex-1">
                                <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                                  isCurrent
                                    ? "bg-primary text-primary-foreground"
                                    : isActive
                                    ? "bg-secondary/20 text-secondary"
                                    : "bg-muted text-muted-foreground"
                                }`}>
                                  {i + 1}
                                </div>
                                <span className={`text-xs hidden sm:inline ${isCurrent ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                                  {statusConfig[step].label}
                                </span>
                                {i < statusSteps.length - 1 && (
                                  <div className={`mx-1 h-0.5 flex-1 rounded ${isActive ? "bg-secondary/40" : "bg-muted"}`} />
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Assigned Schools */}
                        {lead.assignedSchools.length > 0 && (
                          <div className="mt-3 rounded-lg border bg-card p-3">
                            <p className="text-xs font-medium text-muted-foreground mb-1.5">Schools assigned to this lead:</p>
                            <div className="flex flex-wrap gap-1.5">
                              {lead.assignedSchools.map((s) => (
                                <span key={s} className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">{s}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      </>)}

      {/* TRACKING VIEW */}
      {activeView === "tracking" && (
        <div className="space-y-4">
          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" /> Lead Tracking
            </h3>
            <p className="text-sm text-muted-foreground">Track approved leads — actions visible on both Admin & School dashboards</p>
          </div>

          {trackedLeadsSnapshot.length === 0 ? (
            <div className="rounded-lg border bg-card p-8 text-center">
              <Activity className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No approved leads yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {trackedLeadsSnapshot.map((tracked) => {
                const trackingStatusConfig: Record<TrackingStatus, { label: string; color: string }> = {
                  approved: { label: "Approved", color: "bg-chart-4/10 text-chart-4" },
                  school_contacted: { label: "School Contacted", color: "bg-primary/10 text-primary" },
                  parent_responded: { label: "Parent Responded", color: "bg-accent/10 text-accent" },
                  enrolled: { label: "Enrolled", color: "bg-secondary/10 text-secondary" },
                  declined: { label: "Declined", color: "bg-destructive/10 text-destructive" },
                };
                const statusInfo = trackingStatusConfig[tracked.trackingStatus];

                return (
                  <div key={tracked.leadId} className="rounded-lg border bg-card overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b bg-muted/30">
                      <div className="flex items-center gap-3">
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

                    {/* Details & Actions */}
                    <div className="grid gap-4 p-4 md:grid-cols-2">
                      {/* Info */}
                      <div className="space-y-2">
                        <div className="text-sm space-y-1">
                          <div className="flex justify-between"><span className="text-muted-foreground">Parent:</span><span className="text-foreground">{tracked.parentName}</span></div>
                          <div className="flex justify-between"><span className="text-muted-foreground">Budget:</span><span className="text-foreground">{tracked.budget}</span></div>
                          <div className="flex justify-between"><span className="text-muted-foreground">Type:</span><span className="text-foreground">{tracked.boardingType}</span></div>
                          <div className="flex justify-between"><span className="text-muted-foreground">Approved:</span><span className="text-foreground">{tracked.approvedAt}</span></div>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          <span className="text-xs text-muted-foreground mr-1">Schools:</span>
                          {tracked.assignedSchools.map((s) => (
                            <span key={s} className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{s}</span>
                          ))}
                        </div>
                        {tracked.callNotes && (
                          <div className="rounded-md bg-primary/5 p-2 border border-primary/10 mt-2">
                            <p className="text-xs font-medium text-primary flex items-center gap-1"><MessageSquare className="h-3 w-3" /> Call Notes</p>
                            <p className="text-xs text-foreground mt-1">{tracked.callNotes}</p>
                          </div>
                        )}
                        {tracked.subjectResults && tracked.subjectResults.length > 0 && (
                          <div className="rounded-md bg-secondary/5 p-2 border border-secondary/10 mt-2">
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

                      {/* Actions Timeline */}
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

                        {/* Admin add action */}
                        <div className="rounded-md bg-muted/50 p-3 space-y-2 border">
                          <p className="text-xs font-medium text-foreground">Add Action (Admin)</p>
                          <Textarea
                            placeholder="Write action details..."
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
                                  actor: "admin",
                                  actorName: "Admin",
                                  action: "Added note",
                                  note: trackingNoteInput[tracked.leadId],
                                });
                                setTrackingNoteInput((prev) => ({ ...prev, [tracked.leadId]: "" }));
                              }}
                            >
                              <MessageSquare className="h-3 w-3" /> Add Note
                            </Button>
                          </div>
                          <div className="flex gap-1.5 flex-wrap">
                            {(["school_contacted", "parent_responded", "enrolled", "declined"] as TrackingStatus[]).map((s) => (
                              <Button
                                key={s}
                                size="sm"
                                variant={tracked.trackingStatus === s ? "default" : "outline"}
                                className="text-[10px] h-6 px-2"
                                onClick={() => {
                                  updateTrackingStatus(tracked.leadId, s);
                                  addTrackingAction(tracked.leadId, {
                                    actor: "admin",
                                    actorName: "Admin",
                                    action: `Status → ${s.replace("_", " ")}`,
                                  });
                                }}
                              >
                                {s.replace("_", " ")}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
