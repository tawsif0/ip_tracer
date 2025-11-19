/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import axios from "axios";
import Analytics from "../components/Dashboard/Analytics";
import LinkManagement from "../components/Dashboard/LinkManagement";
import Settings from "../components/Dashboard/Settings";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiLink,
  FiBarChart2,
  FiSettings,
  FiChevronLeft,
  FiChevronRight,
  FiX,
  FiLogOut,
  FiUser,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

// Memoized content components to prevent unnecessary re-renders
const TabContent = React.memo(
  ({
    activeTab,
    links,
    setLinks,
    stats,
    user,
    onLinkCreated,
    onRefreshAnalytics,
  }) => {
    switch (activeTab) {
      case "links":
        return (
          <LinkManagement
            links={links}
            setLinks={setLinks}
            onLinkCreated={onLinkCreated}
          />
        );
      case "analytics":
        return (
          <Analytics
            stats={stats}
            links={links}
            onRefresh={onRefreshAnalytics}
          />
        );
      case "settings":
        return <Settings user={user} />;
      default:
        return (
          <LinkManagement
            links={links}
            setLinks={setLinks}
            onLinkCreated={onLinkCreated}
          />
        );
    }
  }
);

TabContent.displayName = "TabContent";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  // Get active tab from localStorage or default to "links"
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem("dashboardActiveTab") || "links";
  });
  const [links, setLinks] = useState([]);
  const [stats, setStats] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Check screen size on mount and resize
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsMobileOpen(false);
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Update localStorage whenever activeTab changes
  useEffect(() => {
    const savedTab = localStorage.getItem("dashboardActiveTab");
    if (savedTab) {
      setActiveTab(savedTab);
    }
  }, []);

  const fetchData = async () => {
    try {
      const [linksRes, statsRes] = await Promise.all([
        axios.get("https://api.cleanpc.xyz/api/links/user", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }),
        axios.get("https://api.cleanpc.xyz/api/stats/summary", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }),
      ]);

      setLinks(linksRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, refreshKey]);
  const handleRefreshAnalytics = () => {
    setRefreshKey((prev) => prev + 1);
  };
  const handleLinkCreated = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    localStorage.setItem("dashboardActiveTab", tab);
    if (isMobile) {
      setIsMobileOpen(false);
    }
  };

  const toggleSidebar = () => {
    if (isMobile) {
      setIsMobileOpen(!isMobileOpen);
    } else {
      setSidebarOpen(!sidebarOpen);
    }
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    logout();
    toast.success("Logout successful!");
    setTimeout(() => {
      navigate("/", { replace: true });
    }, 800);
    setShowLogoutConfirm(false);
  };

  const navItems = [
    {
      name: "My Links",
      icon: <FiLink />,
      tab: "links",
    },
    {
      name: "Analytics",
      icon: <FiBarChart2 />,
      tab: "analytics",
    },
    {
      name: "Settings",
      icon: <FiSettings />,
      tab: "settings",
    },
  ];

  return (
    <div className="bg-white min-h-screen flex items-center justify-center p-2 md:p-4 relative">
      {/* Mobile Header */}
      {isMobile && (
        <div
          className="fixed top-0 left-0 right-0 h-16 
          bg-white backdrop-blur-xl border-b border-gray-200 
          flex items-center justify-between px-4 z-50 md:hidden 
          animate-slideDown"
        >
          {/* Left: Menu Button */}
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-2xl text-gray-600 
            hover:text-gray-900 hover:bg-gray-100 
            transition-all duration-300 shadow-md active:scale-90 
            border border-gray-300 hover:border-indigo-500 z-50"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <div className="flex flex-col items-center">
            <h1 className="text-lg font-bold text-gray-900">Dashboard</h1>
            <p className="text-xs text-gray-600">Link Management</p>
          </div>
          <div className="w-10"></div> {/* Spacer for balance */}
        </div>
      )}

      {/* Mobile Overlay */}
      {isMobile && isMobileOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Content */}
      <div
        className={`flex w-full bg-white rounded-3xl md:rounded-3xl shadow-2xl overflow-hidden border border-gray-200 relative ${
          isMobile ? "mt-16 mb-2 h-[calc(100vh-5rem)]" : "h-[95vh]"
        }`}
      >
        {/* Sidebar */}
        {isMobile ? (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: isMobileOpen ? 0 : -300 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col border-r border-gray-200 shadow-xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-3 ml-2 border-b border-gray-200 h-16">
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col"
              >
                <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-xs text-gray-600">Link Management</p>
              </motion.div>

              <button
                onClick={() => setIsMobileOpen(false)}
                className="cursor-pointer rounded-lg text-gray-600 hover:text-gray-900 transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-4 px-4">
              <ul className="space-y-2">
                {navItems.map((item) => {
                  const isActive = activeTab === item.tab;
                  return (
                    <li key={item.tab}>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleTabChange(item.tab)}
                        className={`flex items-center w-full p-4 rounded-xl transition-all justify-start space-x-3 px-4 ${
                          isActive
                            ? "bg-indigo-100 text-indigo-700 shadow-md border border-indigo-200"
                            : "text-gray-700 hover:bg-gray-200 hover:text-gray-900"
                        }`}
                      >
                        <span className="w-5 h-5 flex items-center justify-center">
                          {item.icon}
                        </span>
                        <span className="font-medium text-sm md:text-base">
                          {item.name}
                        </span>
                      </motion.button>
                    </li>
                  );
                })}
              </ul>

              {/* User Info Card */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 mx-2 p-4 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-xl border border-indigo-500/20"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
                  <span className="text-indigo-400 text-sm font-semibold">
                    ACTIVE
                  </span>
                </div>
                <p className="text-gray-700 text-sm">
                  {links.length} links created
                </p>
                <p className="text-gray-700 text-sm">
                  {stats?.totalClicks || 0} total clicks
                </p>
              </motion.div>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200">
              <motion.div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md">
                  {user?.username?.charAt(0)?.toUpperCase() || "U"}
                </div>

                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex-1 min-w-0 ml-3"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-[700] text-gray-900 truncate">
                      {user?.username || "User"}
                    </p>
                    <div className="flex gap-1">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleLogout}
                        className="p-1 rounded-md hover:bg-gray-100 cursor-pointer transition-colors"
                        title="Logout"
                      >
                        <FiLogOut className="w-4 h-4 text-gray-500 hover:text-red-500" />
                      </motion.button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 font-[600] truncate mt-0.5">
                    {user?.email || "user@example.com"}
                  </p>
                </motion.div>
              </motion.div>
            </div>
          </motion.aside>
        ) : (
          <motion.aside
            initial={false}
            animate={{
              width: sidebarOpen ? 256 : 80,
            }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative bg-gradient-to-b from-gray-50 to-gray-100 h-full flex flex-col border-r border-gray-200 shadow-xl overflow-hidden"
          >
            {/* Header */}
            <div
              className="cursor-pointer flex items-center justify-between p-3 ml-2 border-b border-gray-200 h-16"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onClick={toggleSidebar}
            >
              {sidebarOpen ? (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex flex-col"
                >
                  <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
                  <p className="text-xs text-gray-600">Link Management</p>
                </motion.div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md">
                  L
                </div>
              )}

              <motion.button
                whileHover={{}}
                animate={{
                  x: isHovered ? (sidebarOpen ? -4 : 4) : 0,
                  scale: isHovered ? 1.2 : 1,
                }}
                transition={{ type: "spring", stiffness: 300 }}
                className="cursor-pointer rounded-lg text-gray-600 transition-colors"
              >
                {sidebarOpen ? <FiChevronLeft /> : <FiChevronRight />}
              </motion.button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-4 px-4">
              <ul className="space-y-2">
                {navItems.map((item) => {
                  const isActive = activeTab === item.tab;
                  return (
                    <li key={item.tab}>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleTabChange(item.tab)}
                        className={`flex items-center w-full p-4 rounded-xl transition-all ${
                          sidebarOpen
                            ? "justify-start space-x-3 px-4"
                            : "justify-center px-0"
                        } ${
                          isActive
                            ? "bg-indigo-100 text-indigo-700 shadow-md border border-indigo-200"
                            : "text-gray-700 hover:bg-gray-200 hover:text-gray-900"
                        }`}
                      >
                        <span className="w-5 h-5 flex items-center justify-center">
                          {item.icon}
                        </span>
                        {sidebarOpen && (
                          <span className="font-medium text-sm md:text-base">
                            {item.name}
                          </span>
                        )}
                      </motion.button>
                    </li>
                  );
                })}
              </ul>

              {/* User Info Card */}
              {sidebarOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 mx-2 p-4 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-xl border border-indigo-500/20"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
                    <span className="text-indigo-400 text-sm font-semibold">
                      ACTIVE
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm">
                    {links.length} links created
                  </p>
                  <p className="text-gray-700 text-sm">
                    {stats?.totalClicks || 0} total clicks
                  </p>
                </motion.div>
              )}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200">
              <motion.div
                className="flex items-center"
                whileHover={sidebarOpen ? { scale: 1.005 } : {}}
              >
                <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>

                {sidebarOpen && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex-1 min-w-0 ml-3"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-[700] text-gray-900 truncate">
                        {user?.name || "User"}
                      </p>
                      <div className="flex gap-1">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleLogout}
                          className="p-1 rounded-md hover:bg-gray-100 cursor-pointer transition-colors"
                          title="Logout"
                        >
                          <FiLogOut className="w-4 h-4 text-gray-500 hover:text-red-500" />
                        </motion.button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 font-[600] truncate mt-0.5">
                      {user?.email || "user@example.com"}
                    </p>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </motion.aside>
        )}

        {/* Main Content Area */}
        <div className="flex-1 h-full overflow-auto relative bg-gray-50">
          {/* Content Header */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {activeTab === "links" && "My Links"}
                  {activeTab === "analytics" && "Analytics"}
                  {activeTab === "settings" && "Settings"}
                </h1>
                <p className="text-gray-600 mt-1">
                  {activeTab === "links" &&
                    "Manage and create your short links"}
                  {activeTab === "analytics" && "Track your link performance"}
                  {activeTab === "settings" && "Manage your account settings"}
                </p>
              </div>

              {/* Stats Summary */}
              {activeTab !== "settings" && (
                <div className="hidden md:flex items-center space-x-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-indigo-600">
                      {links.length}
                    </div>
                    <div className="text-sm text-gray-600">Total Links</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {stats?.totalClicks || 0}
                    </div>
                    <div className="text-sm text-gray-600">Total Clicks</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {stats?.uniqueVisitors || 0}
                    </div>
                    <div className="text-sm text-gray-600">Unique Visitors</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Rendered Content */}
          <div className="p-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <TabContent
                  activeTab={activeTab}
                  links={links}
                  setLinks={setLinks}
                  stats={stats}
                  user={user}
                  onLinkCreated={handleLinkCreated}
                  onRefreshAnalytics={handleRefreshAnalytics}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-md"
            >
              <div className="p-8 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-500 mb-4">
                  <FiLogOut className="h-5 w-5 text-white" />
                </div>

                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Ready to leave?
                </h3>
                <p className="text-sm text-gray-700 mb-6">
                  Are you sure you want to sign out of your account?
                </p>

                <div className="flex justify-center space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowLogoutConfirm(false)}
                    className="px-5 py-2.5 text-sm font-medium rounded-lg cursor-pointer bg-gray-300 text-gray-700 hover:bg-gray-400 transition-all shadow-sm"
                  >
                    Cancel
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={confirmLogout}
                    className="px-5 py-2.5 text-sm font-medium rounded-lg bg-red-600 cursor-pointer text-white hover:bg-red-700 transition-all shadow-sm"
                  >
                    Logout
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
