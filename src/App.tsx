import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";

// Portfolio Pages
import Index from "./pages/Index";
import About from "./pages/About";
import Projects from "./pages/Projects";
import CV from "./pages/CV";
import Contact from "./pages/Contact";
import Apps from "./pages/Apps";
import Blog from "./pages/Blog";
import Book from "./pages/Book";

// Project Detail Pages
import ProjectDetail from "./pages/ProjectDetail";
import StudentAmbassadorsProgram from "./pages/projects/StudentAmbassadorsProgram";
import MoveSportsClub from "./pages/projects/MoveSportsClub";
import RotaractVicePresidency from "./pages/projects/RotaractVicePresidency";

// Automation Hub Pages
import AutomationHome from "./pages/Home";
import Workflows from "./pages/Workflows";
import WorkflowDetail from "./pages/WorkflowDetail";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Collections from "./pages/Collections";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen bg-hero-bg">
            <Navbar />
            <main>
              <Routes>
                {/* Portfolio Routes */}
                <Route path="/" element={<Index />} />
                <Route path="/about" element={<About />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/projects/:slug" element={<ProjectDetail />} />
                <Route path="/projects/stam-cafe" element={<StudentAmbassadorsProgram />} />
                <Route path="/projects/move-sports-club" element={<MoveSportsClub />} />
                <Route path="/projects/rotaract-vice-presidency" element={<RotaractVicePresidency />} />
                <Route path="/cv" element={<CV />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/apps" element={<Apps />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/book" element={<Book />} />

                {/* Automation Hub Routes */}
                <Route path="/automation" element={<AutomationHome />} />
                <Route path="/automation/workflows" element={<Workflows />} />
                <Route path="/automation/workflows/:id" element={<WorkflowDetail />} />
                <Route path="/automation/auth" element={<Auth />} />
                <Route path="/automation/dashboard" element={<Dashboard />} />
                <Route path="/automation/collections" element={<Collections />} />

                {/* Catch-all */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
