import { useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { queryClient } from "./lib/queryClient";

import Home from "./pages/Home";
import Settings from "./pages/Settings";
import Help from "./pages/Help";
import Navbar from "./components/Navbar";
import AnimatedStars from "./components/AnimatedStars";
import AnimatedClouds from "./components/AnimatedClouds";
import { ThemeProvider } from "./providers/ThemeProvider";
import { LanguageProvider } from "./providers/LanguageProvider";
import { StepProvider } from "./providers/StepProvider";
import { getSavedLanguage } from "./lib/i18n";
import { useTheme } from "./providers/ThemeProvider";
import NotFound from "./pages/not-found";

function AppContent() {
  const [location] = useLocation();
  const lang = getSavedLanguage();
  const { theme } = useTheme();

  return (
    <div className="space-background" lang={lang}>
      {theme === "dark" && <AnimatedStars />}
      {theme === "light" && <AnimatedClouds />}
      <div className="relative z-10">
        <Navbar />
        {location === "/" && <Home />}
        {location === "/settings" && <Settings />}
        {location === "/help" && <Help />}
        {location !== "/" && 
         location !== "/settings" && 
         location !== "/help" && <NotFound />}
      </div>
      <Toaster />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <StepProvider>
          <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              <AppContent />
            </TooltipProvider>
          </QueryClientProvider>
        </StepProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
