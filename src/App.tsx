import React, { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { Capacitor } from "@capacitor/core";
import { PushNotifications } from "@capacitor/push-notifications";

import { supabase } from "./supabaseClient";

import AuthScreen from "./components/AuthScreen";
import Sidebar from "./components/Sidebar";
import InventoryPage from "./components/InventoryPage";
import ProjectsPage from "./components/ProjectsPage";
import TimesheetPage from "./components/TimesheetPage";

type PageKey = "inventory" | "projects" | "timesheets";

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [activePage, setActivePage] = useState<PageKey>("inventory");

  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth < 900;
  });
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return window.innerWidth >= 900;
  });

  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "dark";
    const stored = window.localStorage.getItem("gcss-theme");
    if (stored === "light" || stored === "dark") return stored;
    return "dark";
  });

  /* ===== Auth session handling ===== */
  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      const { data } = await supabase.auth.getSession();
      if (isMounted) {
        setSession(data.session ?? null);
      }
    };

    void init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (!newSession) {
        setActivePage("inventory");
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Error signing out", err);
    } finally {
      setSession(null);
      setActivePage("inventory");
    }
  };

  /* ===== Theme handling ===== */

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    try {
      window.localStorage.setItem("gcss-theme", theme);
    } catch {
      // storage might be blocked, not fatal
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  /* ===== Responsive layout: detect mobile / desktop ===== */

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      const mobile = window.innerWidth < 900;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* ===== Push notifications setup (native only) ===== */

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let initialized = false;

    const initPush = async () => {
      if (initialized) return;
      initialized = true;

      try {
        // Android 13+ will show the permission dialog here if needed
        const permStatus = await PushNotifications.checkPermissions();
        if (permStatus.receive !== "granted") {
          const req = await PushNotifications.requestPermissions();
          if (req.receive !== "granted") {
            console.log("Push permission not granted");
            return;
          }
        }

        await PushNotifications.register();

        PushNotifications.addListener("registration", (token) => {
          console.log("Push registration token:", token.value);
          // TODO: send token to Supabase / backend if you want to store it
        });

        PushNotifications.addListener("registrationError", (err) => {
          console.error("Push registration error:", err);
        });

        PushNotifications.addListener(
          "pushNotificationReceived",
          (notification) => {
            console.log("Push notification received:", notification);
          }
        );
      } catch (err) {
        console.error("Error setting up push notifications", err);
      }
    };

    void initPush();
  }, []);

  /* ===== Page render helpers ===== */

  const handleChangePage = (page: PageKey) => {
    setActivePage(page);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const renderActivePage = () => {
    if (!session) return null;

    switch (activePage) {
      case "projects":
        return <ProjectsPage session={session} />;
      case "timesheets":
        return <TimesheetPage session={session} />;
      case "inventory":
      default:
        return <InventoryPage session={session} />;
    }
  };

  /* ===== Layout ===== */

  if (!session) {
    return (
      <div className="app-root">
        <AuthScreen />
      </div>
    );
  }

  return (
    <div className="app-root">
      <div
        className={`app-shell ${
          isMobile ? "app-shell--mobile" : "app-shell--desktop"
        }`}
      >
        {/* Mobile hamburger ONLY – no theme toggle floating out here */}
        {isMobile && (
          <button
            type="button"
            className="sidebar-toggle"
            onClick={() => setSidebarOpen((open) => !open)}
            aria-label="Toggle navigation"
          >
            <span />
          </button>
        )}

        {/* Sidebar: always visible on desktop, toggle on mobile */}
        {(!isMobile || sidebarOpen) && (
          <Sidebar
            session={session}
            activePage={activePage}
            onChangePage={handleChangePage}
            onSignOut={handleSignOut}
            theme={theme}
            onToggleTheme={toggleTheme}
            isMobile={isMobile}
          />
        )}

        {/* Main content */}
        <main>{renderActivePage()}</main>
      </div>
    </div>
  );
};

export default App;
