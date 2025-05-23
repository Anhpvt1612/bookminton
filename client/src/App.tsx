import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { ThemeProvider } from "@/components/ui/theme-provider";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import Home from "@/pages/home";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Courts from "@/pages/courts";
import CourtDetails from "@/pages/courts/court-details";
import ManageCourts from "@/pages/courts/manage";
import Players from "@/pages/players";
import MyBookings from "@/pages/bookings/my-bookings";
import { AuthProvider } from "@/hooks/use-auth";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/courts" component={Courts} />
      <Route path="/courts/:id" component={CourtDetails} />
      <Route path="/manage-courts" component={ManageCourts} />
      <Route path="/players" component={Players} />
      <Route path="/my-bookings" component={MyBookings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-grow">
                <Router />
              </main>
              <Footer />
            </div>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
