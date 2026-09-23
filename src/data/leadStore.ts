// Simple in-memory store for lead tracking & notifications (mock, no backend)
// Shared between Admin and School dashboards

export type TrackingStatus = "approved" | "school_contacted" | "parent_responded" | "enrolled" | "declined";

export interface TrackedLead {
  leadId: string;
  parentName: string;
  studentName: string;
  studentGender: string;
  category: string;
  level: string;
  budget: string;
  boardingType: string;
  tier: "A" | "B" | "C";
  assignedSchools: string[];
  approvedAt: string;
  trackingStatus: TrackingStatus;
  callNotes?: string;
  subjectResults?: { subject: string; score: string }[];
  resultsFile?: string;
  examNotes?: string;
  // Tracking actions log
  actions: TrackingAction[];
}

export interface TrackingAction {
  id: string;
  actor: "admin" | "school";
  actorName: string;
  action: string;
  note?: string;
  timestamp: string;
}

export interface SchoolNotification {
  id: string;
  schoolName: string;
  leadId: string;
  tier: "A" | "B" | "C";
  message: string;
  timestamp: string;
  read: boolean;
}

type Listener = () => void;

let trackedLeads: TrackedLead[] = [
  // Pre-existing tracked lead example
  {
    leadId: "L-1060",
    parentName: "Hassan Ali",
    studentName: "Yusuf Ali",
    studentGender: "Boy",
    category: "O-Level",
    level: "Form 1",
    budget: "3M - 5M",
    boardingType: "Boarding",
    tier: "C",
    assignedSchools: ["Bright Academy"],
    approvedAt: "2026-03-08",
    trackingStatus: "school_contacted",
    callNotes: "Parent agreed to bring child for exam.",
    subjectResults: [
      { subject: "Mathematics", score: "78" },
      { subject: "English", score: "62" },
      { subject: "Science", score: "85" },
      { subject: "Kiswahili", score: "71" },
    ],
    resultsFile: "yusuf_ali_results.pdf",
    examNotes: "Performed well in Math and Science.",
    actions: [
      { id: "a1", actor: "admin", actorName: "Admin", action: "Approved as Tier C", timestamp: "2026-03-08 10:00" },
      { id: "a2", actor: "school", actorName: "Bright Academy", action: "Contacted parent", note: "Parent responded, will visit next week.", timestamp: "2026-03-09 14:30" },
    ],
  },
];

let notifications: SchoolNotification[] = [
  {
    id: "n1",
    schoolName: "Bright Academy",
    leadId: "L-1060",
    tier: "C",
    message: "New Tier C lead received! Student: Yusuf Ali (O-Level, Form 1)",
    timestamp: "2026-03-08 10:00",
    read: true,
  },
];

const listeners: Listener[] = [];

function notify() {
  updateCaches();
  listeners.forEach((fn) => fn());
}

export function subscribe(fn: Listener) {
  listeners.push(fn);
  return () => {
    const idx = listeners.indexOf(fn);
    if (idx > -1) listeners.splice(idx, 1);
  };
}

export function getTrackedLeads(): TrackedLead[] {
  return trackedLeads;
}

export function getNotifications(): SchoolNotification[] {
  return notifications;
}

// Cached snapshots for specific schools to avoid new references
const cachedSchoolNotifs: Record<string, SchoolNotification[]> = {};
const cachedUnreadCounts: Record<string, number> = {};

function updateCaches() {
  for (const key of Object.keys(cachedSchoolNotifs)) {
    cachedSchoolNotifs[key] = notifications.filter((n) => n.schoolName === key);
    cachedUnreadCounts[key] = cachedSchoolNotifs[key].filter((n) => !n.read).length;
  }
}

export function getSchoolNotificationsSnapshot(schoolName: string): () => SchoolNotification[] {
  if (!cachedSchoolNotifs[schoolName]) {
    cachedSchoolNotifs[schoolName] = notifications.filter((n) => n.schoolName === schoolName);
    cachedUnreadCounts[schoolName] = cachedSchoolNotifs[schoolName].filter((n) => !n.read).length;
  }
  return () => cachedSchoolNotifs[schoolName];
}

export function getSchoolUnreadCountSnapshot(schoolName: string): () => number {
  if (!(schoolName in cachedUnreadCounts)) {
    cachedUnreadCounts[schoolName] = notifications.filter((n) => n.schoolName === schoolName && !n.read).length;
  }
  return () => cachedUnreadCounts[schoolName];
}

export function markNotificationRead(notifId: string) {
  notifications = notifications.map((n) => (n.id === notifId ? { ...n, read: true } : n));
  notify();
}

export function markAllNotificationsRead(schoolName: string) {
  notifications = notifications.map((n) => (n.schoolName === schoolName ? { ...n, read: true } : n));
  notify();
}

let actionCounter = 100;
let notifCounter = 100;

export function approveLeadToTracking(lead: {
  leadId: string;
  parentName: string;
  studentName: string;
  studentGender: string;
  category: string;
  level: string;
  budget: string;
  boardingType: string;
  tier: "A" | "B" | "C";
  assignedSchools: string[];
  callNotes?: string;
  subjectResults?: { subject: string; score: string }[];
  resultsFile?: string;
  examNotes?: string;
}) {
  const now = new Date().toISOString().slice(0, 16).replace("T", " ");

  // Add tracked lead
  const tracked: TrackedLead = {
    ...lead,
    approvedAt: now,
    trackingStatus: "approved",
    actions: [
      {
        id: `a${++actionCounter}`,
        actor: "admin",
        actorName: "Admin",
        action: `Approved as Tier ${lead.tier}`,
        timestamp: now,
      },
    ],
  };

  // Don't duplicate
  if (!trackedLeads.find((t) => t.leadId === lead.leadId)) {
    trackedLeads = [tracked, ...trackedLeads];
  }

  // Send notification to each assigned school
  lead.assignedSchools.forEach((school) => {
    const notif: SchoolNotification = {
      id: `n${++notifCounter}`,
      schoolName: school,
      leadId: lead.leadId,
      tier: lead.tier,
      message: `New Tier ${lead.tier} lead received! Student: ${lead.studentName} (${lead.category}, ${lead.level})`,
      timestamp: now,
      read: false,
    };
    notifications = [notif, ...notifications];
  });

  notify();
}

export function addTrackingAction(leadId: string, action: Omit<TrackingAction, "id" | "timestamp">) {
  const now = new Date().toISOString().slice(0, 16).replace("T", " ");
  trackedLeads = trackedLeads.map((t) =>
    t.leadId === leadId
      ? { ...t, actions: [...t.actions, { ...action, id: `a${++actionCounter}`, timestamp: now }] }
      : t
  );
  notify();
}

export function updateTrackingStatus(leadId: string, status: TrackingStatus) {
  trackedLeads = trackedLeads.map((t) => (t.leadId === leadId ? { ...t, trackingStatus: status } : t));
  notify();
}
