import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AIChatBubble } from "@/components/AIChatBubble";
import { FeedbackTab } from "@/components/FeedbackTab";
import { CompareWidget } from "@/components/CompareWidget";
import Index from "./pages/Index";
import SignUp from "./pages/SignUp";
import SchoolListing from "./pages/SchoolListing";
import SchoolProfile from "./pages/SchoolProfile";
import CollegeProfile from "./pages/CollegeProfile";
import LeadCapture from "./pages/LeadCapture";
import ForSchools from "./pages/ForSchools";
import SchoolDashboard from "./pages/SchoolDashboard";
import Blog from "./pages/Blog";
import MyDashboard from "./pages/MyDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import CompareSchools from "./pages/CompareSchools";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/jisajili" element={<SignUp />} />
          {/* The site reads in English too, so the English spellings land on the same page
              rather than a 404. /jisajili stays the one canonical URL. */}
          <Route path="/register" element={<Navigate to="/jisajili" replace />} />
          <Route path="/signup" element={<Navigate to="/jisajili" replace />} />
          <Route path="/sign-up" element={<Navigate to="/jisajili" replace />} />
          <Route path="/shule" element={<SchoolListing />} />
          <Route path="/shule/:id" element={<SchoolProfile />} />
          <Route path="/chuo/:id" element={<CollegeProfile />} />
          <Route path="/linganisha" element={<CompareSchools />} />
          <Route path="/omba-nafasi" element={<LeadCapture />} />
          <Route path="/kwa-shule" element={<ForSchools />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/dashboard/school" element={<SchoolDashboard />} />
          <Route path="/dashboard/me" element={<MyDashboard />} />
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <AIChatBubble />
        <FeedbackTab />
        <CompareWidget />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
