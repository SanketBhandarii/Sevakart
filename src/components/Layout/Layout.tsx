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

  // 👇 Define paths where you don't want the sidebar
  const hiddenSidebarPaths = ["/", "/login", "/register", "/signup"];

  const shouldHideSidebar = hiddenSidebarPaths.includes(location.pathname);

  if (!currentUser) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-sc+reen bg-background">
      {!shouldHideSidebar && currentUser && <Navigation />}
      {/* Main Content */}
      <div
        className={`transition-all duration-300 ${
          !shouldHideSidebar ? "lg:pl-64" : ""
        }`}
      >
        <main className="flex-1">
          <div className="py-6 px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
