import React from "react";
import Navigation from "./Navigation";
import { useAuth } from "../../contexts/AuthContext";
import { useLocation } from "react-router-dom";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { currentUser } = useAuth();
  const location = useLocation();

  // Define routes where you want to hide the sidebar
  const hiddenSidebarPaths = ["/", "/login", "/register", "/signup"];
  const shouldHideSidebar = hiddenSidebarPaths.includes(location.pathname);

  const showSidebar = currentUser && !shouldHideSidebar;

  return (
    <div className="min-h-screen bg-background">
      {showSidebar && <Navigation />}
      
      {/* Dynamically apply left padding only if sidebar is shown */}
      <div className={showSidebar ? "pl-64" : ""}>
        <main className="flex-1">
          <div className="py-6 px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
