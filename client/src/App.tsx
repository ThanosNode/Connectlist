import { Switch, Route, Router as WouterRouter } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import About from "@/pages/about";
import Terms from "@/pages/terms";
import Privacy from "@/pages/privacy";
import FAQ from "@/pages/faq";
import Contact from "@/pages/contact";
import Browse from "@/pages/browse";
import Post from "@/pages/post";
import SearchResults from "@/pages/search";
import StateBrowse from "@/pages/state-browse";
import ListingDetail from "@/pages/listing";
import Profile from "@/pages/profile";
import MyListings from "@/pages/my-listings";
import ProfileSettings from "@/pages/profile/settings";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminReports from "@/pages/admin/reports";
import PaymentSuccess from "@/pages/payment-success";
import EditListing from "@/pages/edit-listing";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "./context/AuthContext";
import { LocationProvider } from "./context/LocationContext";
import { LanguageProvider } from "./context/LanguageContext";
import { ModalProvider } from "./context/ModalContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import LocationBar from "@/components/layout/LocationBar";
import LoginModal from "@/components/auth/LoginModal";
import RegisterModal from "@/components/auth/RegisterModal";

// Create a proper client-side router
function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/terms" component={Terms} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/faq" component={FAQ} />
      <Route path="/contact" component={Contact} />
      <Route path="/browse" component={Browse} />
      <Route path="/post" component={Post} />
      <Route path="/search" component={SearchResults} />
      <Route path="/search/:type/:subcategory" component={SearchResults} />
      <Route path="/state/:state" component={StateBrowse} />
      <Route path="/listing/:id" component={ListingDetail} />
      <Route path="/listing/:id/edit" component={EditListing} />
      <Route path="/listing/:id/payment-success" component={PaymentSuccess} />
      <Route path="/profile" component={Profile} />
      <Route path="/my-listings" component={MyListings} />
      <Route path="/profile/settings" component={ProfileSettings} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/reports" component={AdminReports} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <LanguageProvider>
            <LocationProvider>
              <ModalProvider>
                <TooltipProvider>
                  <WouterRouter base="">
                    <Toaster />
                    <div className="flex flex-col min-h-screen">
                      <Header />
                      <LocationBar />
                      <main className="flex-grow container mx-auto px-4 py-6">
                        <Router />
                      </main>
                      <Footer />
                      <LoginModal />
                      <RegisterModal />
                    </div>
                  </WouterRouter>
                </TooltipProvider>
              </ModalProvider>
            </LocationProvider>
          </LanguageProvider>
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
