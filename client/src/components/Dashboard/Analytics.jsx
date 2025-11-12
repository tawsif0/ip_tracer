import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import {
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  ChartBarIcon,
  UsersIcon,
  EyeIcon,
  CameraIcon,
} from "@heroicons/react/24/outline";
import { format } from "date-fns";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
  "#FF6B6B",
  "#4ECDC4",
];

// Component for displaying IP API data
const IPApiDetails = ({ ip }) => {
  const [ipData, setIpData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchIpData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`https://ipapi.co/${ip}/json/`);
        const data = await response.json();
        setIpData(data);
      } catch (err) {
        setError("Failed to fetch IP data");
        console.error("IP API error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchIpData();
  }, [ip]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-full text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold">IP Information</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ipData &&
          Object.entries(ipData).map(([key, value]) => (
            <div key={key} className="border rounded-lg p-3">
              <div className="text-sm font-medium text-gray-500 capitalize">
                {key.replace(/_/g, " ")}
              </div>
              <div className="text-lg font-semibold">{value || "N/A"}</div>
            </div>
          ))}
      </div>
    </div>
  );
};

// Reusable Components
const MetricCard = ({
  icon,
  title,
  value,
  percentage,
  secondaryValue,
  color,
}) => {
  const colorClasses = {
    indigo: {
      bg: "bg-indigo-50",
      border: "border-indigo-100",
      text: "text-indigo-700",
    },
    green: {
      bg: "bg-green-50",
      border: "border-green-100",
      text: "text-green-700",
    },
    blue: {
      bg: "bg-blue-50",
      border: "border-blue-100",
      text: "text-blue-700",
    },
    purple: {
      bg: "bg-purple-50",
      border: "border-purple-100",
      text: "text-purple-700",
    },
  };

  return (
    <div
      className={`p-4 rounded-lg border ${colorClasses[color].bg} ${colorClasses[color].border}`}
    >
      <div className="flex items-center">
        <div className="mr-3 p-2 rounded-full bg-white">{icon}</div>
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className={`text-2xl font-bold ${colorClasses[color].text}`}>
            {typeof value === "number" ? value.toLocaleString() : value}
            {percentage !== undefined && (
              <span className="text-sm ml-1">({percentage}%)</span>
            )}
          </p>
          {secondaryValue && (
            <p className="text-sm text-gray-500 mt-1">
              {secondaryValue.toLocaleString()} clicks
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const ChartCard = ({ title, children }) => (
  <div className="bg-white p-6 rounded-lg shadow">
    <h3 className="text-lg font-medium mb-4">{title}</h3>
    {children}
  </div>
);

const TableHeader = ({ children }) => (
  <th
    scope="col"
    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
  >
    {children}
  </th>
);

const TableRow = ({ children }) => (
  <tr className="hover:bg-gray-50">{children}</tr>
);

const TableCell = ({ children }) => (
  <td className="px-6 py-4 whitespace-nowrap text-sm">{children}</td>
);
const PhotoModal = ({ photoUrl, onClose }) => {
  return (
    <div className="min-h-screen fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-[9999]">
      <div className="bg-white rounded-lg max-w-2xl w-full">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">Visitor Photo</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="p-4">
          <img
            src={photoUrl}
            alt="Visitor"
            className="w-full h-auto rounded-lg shadow-md"
            onError={(e) => {
              e.target.src =
                "https://via.placeholder.com/400x400?text=Photo+Not+Available";
            }}
          />
        </div>
        <div className="p-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
const Analytics = ({ stats, links }) => {
  const [selectedLinkId, setSelectedLinkId] = useState(null);
  const [visitLogs, setVisitLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedIp, setSelectedIp] = useState(null);
  const [showIpModal, setShowIpModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  // Format data for charts
  const linkData =
    links?.map((link) => ({
      name: `${link.domain}/${link.shortCode}`,
      clicks: stats?.clicksByLink?.[link._id] || 0,
      id: link._id,
      url: `${link.domain}/${link.shortCode}`,
    })) || [];

  // Time series data for clicks over time
  const timeSeriesData =
    stats?.timeSeries?.map((item) => ({
      date: format(new Date(item.date), "MMM dd yyyy"),
      clicks: item.count,
    })) || [];
  const handleViewPhoto = (photoUrl) => {
    setSelectedPhoto(photoUrl);
    setShowPhotoModal(true);
  };

  // Close photo modal
  const closePhotoModal = () => {
    setShowPhotoModal(false);
    setSelectedPhoto(null);
  };
  // Fetch visit logs when link is selected
  useEffect(() => {
    const fetchVisitLogs = async () => {
      if (!selectedLinkId) return;

      setLoading(true);
      setError(null);

      try {
        const res = await axios.get(
          `https://api.cleanpc.xyz/api/stats/visits/${selectedLinkId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setVisitLogs(res.data.docs || res.data);
      } catch (err) {
        console.error("Failed to load visit logs", err);
        setError("Failed to load visit data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchVisitLogs();
  }, [selectedLinkId]);

  const handleCheckIp = (ipAddress) => {
    setSelectedIp(ipAddress);
    setShowIpModal(true);
  };

  const closeModal = () => {
    setShowIpModal(false);
    setSelectedIp(null);
  };

  {
    /* const openInNewTab = (url) => {
    window.open(url, "_blank", "noopener,noreferrer");
  }; */
  }

  if (!stats) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">No analytics data available</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* IP Details Modal */}
      {showIpModal && selectedIp && (
        <div className="min-h-screen fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[85vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b shrink-0">
              <div>
                <h3 className="text-lg font-semibold">IP: {selectedIp}</h3>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 p-2"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* IP API Content - Scrollable area */}
            <div className="flex-1 overflow-hidden">
              <div className="h-full overflow-auto p-4">
                <IPApiDetails ip={selectedIp} />
              </div>
            </div>

            {/* External Link Button */}
            {/* <div className="p-4 border-t bg-gray-50 shrink-0">
              <button
                onClick={() =>
                  openInNewTab(`https://ipapi.co/${selectedIp}/json/`)
                }
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
                Open IP API in New Tab
              </button>
            </div> */}
          </div>
        </div>
      )}
      {showPhotoModal && selectedPhoto && (
        <PhotoModal photoUrl={selectedPhoto} onClose={closePhotoModal} />
      )}
      {/* Summary Dashboard */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Summary Dashboard</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <MetricCard
            icon={<ChartBarIcon className="h-6 w-6 text-indigo-600" />}
            title="Total Clicks"
            value={stats?.totalClicks || 0}
            color="indigo"
          />
          <MetricCard
            icon={<UsersIcon className="h-6 w-6 text-green-600" />}
            title="Unique Visitors"
            value={stats?.uniqueVisitors || 0}
            color="green"
          />
        </div>
      </div>

      {/* Clicks Over Time */}
      {timeSeriesData.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Clicks Over Time</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeSeriesData}>
                <defs>
                  <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip
                  formatter={(value) => [`${value} clicks`, "Clicks"]}
                  labelFormatter={(value) => `Date: ${value}`}
                />
                <Area
                  type="monotone"
                  dataKey="clicks"
                  stroke="#8884d8"
                  fillOpacity={1}
                  fill="url(#colorClicks)"
                  name="Clicks"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Charts Row */}

      {/* Link Selector and Visit Logs */}
      <div className="space-y-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="w-full sm:w-auto">
              <label
                htmlFor="linkSelect"
                className="block text-sm font-medium text-gray-700"
              >
                Select a link to view detailed visit logs:
              </label>
              <select
                id="linkSelect"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm"
                onChange={(e) => setSelectedLinkId(e.target.value)}
                value={selectedLinkId || ""}
              >
                <option value="">-- Select Link --</option>
                {links?.map((link) => (
                  <option key={link._id} value={link._id}>
                    {link.domain}/{link.shortCode} (
                    {stats?.clicksByLink?.[link._id] || 0} clicks)
                  </option>
                ))}
              </select>
            </div>
            {selectedLinkId && (
              <span className="text-sm text-gray-500">
                Showing {visitLogs.length} visits
              </span>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Visit Logs Table with Action Column */}
        {selectedLinkId && visitLogs.length > 0 && !loading && (
          <div className="bg-white p-6 rounded-lg shadow overflow-hidden">
            <h3 className="text-lg font-medium mb-4">Visit Logs</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <TableHeader>Time</TableHeader>
                    <TableHeader>IP Address</TableHeader>
                    <TableHeader>Device</TableHeader>
                    <TableHeader>Photo</TableHeader>
                    <TableHeader>Actions</TableHeader>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {visitLogs.map((visit) => (
                    <TableRow key={visit._id}>
                      <TableCell>
                        {format(
                          new Date(visit.timestamp),
                          "MMM dd yyyy, h:mm:ss a"
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{visit.publicIp}</div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {visit.device?.type?.toUpperCase() || "N/A"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {visit.device?.os || "N/A"} /{" "}
                            {visit.device?.browser || "N/A"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {visit.hasPhoto ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Available
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Not Available
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleCheckIp(visit.publicIp)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                          >
                            <EyeIcon className="h-4 w-4 mr-1" />
                            Check IP
                          </button>
                          {visit.hasPhoto && (
                            <button
                              onClick={() => handleViewPhoto(visit.photo)}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                            >
                              <CameraIcon className="h-4 w-4 mr-1" />
                              View Photo
                            </button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Clicks by Link */}
        <ChartCard title="Clicks by Link">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={linkData} layout="vertical" margin={{ left: 30 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={true} />
              <XAxis type="number" />
              <YAxis
                type="category"
                dataKey="name"
                width={100}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                formatter={(value) => [`${value} clicks`, "Clicks"]}
                labelFormatter={(value) => `Link: ${value}`}
              />
              <Bar
                dataKey="clicks"
                fill="#8884d8"
                name="Clicks"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
};

export default Analytics;
