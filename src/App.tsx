import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import Home from "./pages/Home";
import About from "./pages/About";
import Projects from "./pages/Projects";
import Apps from "./pages/Apps";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import ProjectDetail from "./pages/ProjectDetail";
import Workflows from "./pages/Workflows";
import WorkflowDetail from "./pages/WorkflowDetail";
import Book from "./pages/Book";
import CV from "./pages/CV";
import GenerateDescriptions from "./pages/GenerateDescriptions";
import GenerateEmbeddings from "./pages/admin/GenerateEmbeddings";
import TestOllamaEmbeddings from "./pages/admin/TestOllamaEmbeddings";
import Leads from "./pages/admin/Leads";
import Users from "./pages/admin/Users";
import SEOManagement from "./pages/admin/SEOManagement";
import PaymentLinks from "./pages/admin/PaymentLinks";
import VerifyEmail from "./pages/VerifyEmail";
import PaymentPage from "./pages/PaymentPage";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFailed from "./pages/PaymentFailed";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen bg-hero-bg">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/projects/:slug" element={<ProjectDetail />} />
              <Route path="/workflows" element={<Workflows />} />
              <Route path="/workflows/:id" element={<WorkflowDetail />} />
              <Route path="/apps" element={<Apps />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/book" element={<Book />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/cv" element={<CV />} />
              <Route path="/generate-descriptions" element={<GenerateDescriptions />} />
          <Route path="/admin/generate-embeddings" element={<GenerateEmbeddings />} />
          <Route path="/admin/test-ollama" element={<TestOllamaEmbeddings />} />
          <Route path="/admin/leads" element={<Leads />} />
          <Route path="/admin/users" element={<Users />} />
          <Route path="/admin/seo" element={<SEOManagement />} />
          <Route path="/admin/payment-links" element={<PaymentLinks />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/pay/:slug" element={<PaymentPage />} />
              <Route path="/pay/:slug/success" element={<PaymentSuccess />} />
              <Route path="/pay/:slug/failed" element={<PaymentFailed />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
