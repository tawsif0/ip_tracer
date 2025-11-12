import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import axios from "axios";
import Analytics from "../components/Dashboard/Analytics";
import LinkManagement from "../components/Dashboard/LinkManagement";
import Settings from "../components/Dashboard/Settings";

const Dashboard = () => {
  const { user } = useAuth();
  // Get active tab from localStorage or default to "links"
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem("dashboardActiveTab") || "links";
  });
  const [links, setLinks] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Update localStorage whenever activeTab changes
  useEffect(() => {
    localStorage.setItem("dashboardActiveTab", activeTab);
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, refreshKey]);

  const handleLinkCreated = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => handleTabChange("links")}
            className={`${
              activeTab === "links"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            My Links
          </button>
          <button
            onClick={() => handleTabChange("analytics")}
            className={`${
              activeTab === "analytics"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Analytics
          </button>
          {/* <button
            onClick={() => handleTabChange("settings")}
            className={`${
              activeTab === "settings"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Settings
          </button> */}
        </nav>
      </div>

      <div className="mt-6">
        {activeTab === "links" && (
          <LinkManagement
            links={links}
            setLinks={setLinks}
            onLinkCreated={handleLinkCreated}
          />
        )}
        {activeTab === "analytics" && <Analytics stats={stats} links={links} />}
        {activeTab === "settings" && <Settings user={user} />}
      </div>
    </div>
  );
};

export default Dashboard;
