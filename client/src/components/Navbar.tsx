import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useTranslation } from "../lib/i18n";

const Navbar = () => {
  const [location] = useLocation();
  const { t } = useTranslation();

  return (
    <header className="relative z-10">
      <nav className="px-4 md:px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold flex items-center">
          <span className="text-accent">IHERO</span>
          <span className="text-foreground">3D AI</span>
        </Link>
        
        <div className="flex space-x-4 md:space-x-8">
          <Link
            href="/"
            className={`relative px-2 py-1 font-medium ${
              location === "/" 
                ? "border-b-2 border-accent text-foreground" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t("nav.home")}
          </Link>
          <Link
            href="/settings"
            className={`relative px-2 py-1 ${
              location === "/settings" 
                ? "border-b-2 border-accent text-foreground font-medium" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t("nav.settings")}
          </Link>
          <Link
            href="/help"
            className={`relative px-2 py-1 ${
              location === "/help" 
                ? "border-b-2 border-accent text-foreground font-medium" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t("nav.help")}
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
