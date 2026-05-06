import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index.tsx";
import Login from "./pages/Login.tsx";
import Register from "./pages/Register.tsx";
import Quiz from "./pages/Quiz.tsx";
import QuizResult from "./pages/QuizResult.tsx";
import Discover from "./pages/Discover.tsx";
import DestinationDetail from "./pages/DestinationDetail.tsx";
import Itinerary from "./pages/Itinerary.tsx";
import Saved from "./pages/Saved.tsx";
import Booking from "./pages/Booking.tsx";
import MyBookings from "./pages/MyBookings.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/discover" element={<Discover />} />

          {/* Traveler protected */}
          <Route path="/quiz" element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
          <Route path="/quiz/result" element={<ProtectedRoute><QuizResult /></ProtectedRoute>} />
          <Route path="/destination/:slug" element={<ProtectedRoute><DestinationDetail /></ProtectedRoute>} />
          <Route path="/booking/:slug" element={<ProtectedRoute><Booking /></ProtectedRoute>} />
          <Route path="/my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
          <Route path="/itinerary" element={<ProtectedRoute><Itinerary /></ProtectedRoute>} />
          <Route path="/saved" element={<ProtectedRoute><Saved /></ProtectedRoute>} />

          {/* Government / admin */}
          <Route path="/dashboard" element={<ProtectedRoute roles={["government","admin"]}><Dashboard /></ProtectedRoute>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
