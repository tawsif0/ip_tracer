/* eslint-disable react-hooks/exhaustive-deps */
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
  LineChart,
  Line,
} from "recharts";
import {
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  ChartBarIcon,
  UsersIcon,
  EyeIcon,
  CameraIcon,
  MapPinIcon,
  LinkIcon,
  CalendarIcon,
  ClockIcon,
  CursorArrowRaysIcon,
} from "@heroicons/react/24/outline";
import { format } from "date-fns";

const COLORS = [
  "#6366F1", // Indigo
  "#10B981", // Emerald
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#8B5CF6", // Violet
  "#06B6D4", // Cyan
  "#F97316", // Orange
  "#EC4899", // Pink
];

// Enhanced IP API Component
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
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mb-4"></div>
        <p className="text-gray-600">Loading IP information...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-500">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <p className="text-lg font-semibold">{error}</p>
      </div>
    );
  }

  const importantFields = [
    { key: "country_name", label: "Country", icon: "🌍" },
    { key: "city", label: "City", icon: "🏙️" },
    { key: "region", label: "Region", icon: "🗺️" },
    { key: "org", label: "Organization", icon: "🏢" },
    { key: "asn", label: "ASN", icon: "🔗" },
    { key: "timezone", label: "Timezone", icon: "⏰" },
    { key: "currency", label: "Currency", icon: "💰" },
    { key: "languages", label: "Languages", icon: "💬" },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h4 className="text-2xl font-bold text-gray-900">IP Information</h4>
        <p className="text-gray-600 mt-2">
          Details for IP: <span className="font-mono font-semibold">{ip}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {importantFields.map(({ key, label, icon }) => (
          <div
            key={key}
            className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{icon}</span>
              <div>
                <div className="text-sm font-medium text-gray-500">{label}</div>
                <div className="text-lg font-semibold text-gray-900">
                  {ipData[key] || "N/A"}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {ipData && Object.keys(ipData).length > 0 && (
        <div className="mt-6">
          <details className="bg-gray-50 rounded-lg p-4">
            <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
              View All Technical Details
            </summary>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(ipData).map(([key, value]) => (
                <div
                  key={key}
                  className="border-l-4 border-indigo-200 bg-white p-3 rounded"
                >
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    {key.replace(/_/g, " ")}
                  </div>
                  <div className="text-sm font-semibold text-gray-900 mt-1">
                    {value || "N/A"}
                  </div>
                </div>
              ))}
            </div>
          </details>
        </div>
      )}
    </div>
  );
};

// Enhanced Metric Card
const MetricCard = ({ icon, title, value, secondaryValue, color, trend }) => {
  const colorClasses = {
    indigo: {
      bg: "bg-indigo-50",
      border: "border-indigo-100",
      text: "text-indigo-700",
      gradient: "from-indigo-500 to-purple-600",
    },
    green: {
      bg: "bg-green-50",
      border: "border-green-100",
      text: "text-green-700",
      gradient: "from-green-500 to-emerald-600",
    },
    blue: {
      bg: "bg-blue-50",
      border: "border-blue-100",
      text: "text-blue-700",
      gradient: "from-blue-500 to-cyan-600",
    },
    purple: {
      bg: "bg-purple-50",
      border: "border-purple-100",
      text: "text-purple-700",
      gradient: "from-purple-500 to-violet-600",
    },
  };

  return (
    <div
      className={`p-6 rounded-2xl border ${colorClasses[color].border} ${colorClasses[color].bg} backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-lg`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div
            className={`p-3 rounded-xl bg-gradient-to-r ${colorClasses[color].gradient} text-white shadow-lg`}
          >
            {icon}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className={`text-3xl font-bold ${colorClasses[color].text}`}>
              {typeof value === "number" ? value.toLocaleString() : value}
            </p>
            {secondaryValue && (
              <p className="text-sm text-gray-500 mt-1">
                {secondaryValue.toLocaleString()} clicks
              </p>
            )}
          </div>
        </div>
        {trend && (
          <div
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              trend > 0
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {trend > 0 ? "↗" : "↘"} {Math.abs(trend)}%
          </div>
        )}
      </div>
    </div>
  );
};

// Enhanced Photo Modal
const PhotoModal = ({ photoUrl, onClose }) => {
  const [imgError, setImgError] = useState(false);
  const [imgLoading, setImgLoading] = useState(true);

  const handleImageError = () => {
    setImgError(true);
    setImgLoading(false);
  };

  const handleImageLoad = () => {
    setImgLoading(false);
    setImgError(false);
  };

  useEffect(() => {
    setImgError(false);
    setImgLoading(true);
  }, [photoUrl]);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-2xl mx-auto flex flex-col max-h-[90vh] shadow-2xl transform animate-scaleIn">
        <div className="flex justify-between items-center p-6 border-b border-gray-100 shrink-0">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Visitor Photo</h3>
            <p className="text-sm text-gray-600 mt-1">
              Captured during link visit
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors duration-200 group"
            aria-label="Close"
          >
            <svg
              className="w-6 h-6 text-gray-500 group-hover:text-gray-700"
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

        <div className="flex-1 overflow-auto p-6">
          <div className="flex items-center justify-center min-h-[300px] bg-gray-50 rounded-2xl">
            {imgLoading && !imgError && (
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-500"></div>
                <p className="text-gray-600 font-medium">Loading photo...</p>
              </div>
            )}
            <img
              src={photoUrl}
              alt="Visitor photo"
              className={`max-w-full max-h-[60vh] w-auto h-auto object-contain rounded-xl transition-opacity duration-300 ${
                imgLoading || imgError ? "opacity-0" : "opacity-100"
              }`}
              onError={handleImageError}
              onLoad={handleImageLoad}
            />
          </div>

          {imgError && (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CameraIcon className="w-10 h-10 text-red-500" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Photo Unavailable
              </h4>
              <p className="text-gray-600 max-w-md mx-auto">
                The photo could not be loaded. It may have been deleted or there
                might be a temporary server issue.
              </p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50/50 shrink-0 rounded-b-3xl">
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 px-6 rounded-xl hover:from-indigo-700 hover:to-purple-700 active:scale-95 transition-all duration-200 font-semibold shadow-lg"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};

// Enhanced Location Modal
const LocationModal = ({ location, onClose }) => {
  const { latitude, longitude, accuracy } = location || {};

  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${
    longitude - 0.01
  },${latitude - 0.01},${longitude + 0.01},${
    latitude + 0.01
  }&layer=mapnik&marker=${latitude},${longitude}`;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-6xl mx-auto flex flex-col max-h-[90vh] shadow-2xl transform animate-scaleIn">
        <div className="flex justify-between items-center p-6 border-b border-gray-100 shrink-0">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              Visitor Location
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              GPS coordinates and map view
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors duration-200 group"
            aria-label="Close"
          >
            <svg
              className="w-6 h-6 text-gray-500 group-hover:text-gray-700"
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

        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-6 border border-blue-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <MapPinIcon className="w-5 h-5 mr-2 text-blue-600" />
                  Location Details
                </h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-gray-200">
                    <span className="text-sm font-medium text-gray-600">
                      Latitude
                    </span>
                    <span className="font-mono font-semibold text-gray-900">
                      {latitude?.toFixed(6)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-gray-200">
                    <span className="text-sm font-medium text-gray-600">
                      Longitude
                    </span>
                    <span className="font-mono font-semibold text-gray-900">
                      {longitude?.toFixed(6)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-gray-200">
                    <span className="text-sm font-medium text-gray-600">
                      Accuracy
                    </span>
                    <span className="font-semibold text-gray-900">
                      {accuracy ? `${Math.round(accuracy)} meters` : "Unknown"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-100 rounded-2xl p-6 border border-purple-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Quick Links
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    {
                      name: "OpenStreetMap",
                      url: `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=15/${latitude}/${longitude}`,
                      color: "bg-green-500",
                    },
                    {
                      name: "Google Maps",
                      url: `https://maps.google.com/?q=${latitude},${longitude}`,
                      color: "bg-blue-500",
                    },
                    {
                      name: "Bing Maps",
                      url: `https://www.bing.com/maps?cp=${latitude}~${longitude}&lvl=15`,
                      color: "bg-orange-500",
                    },
                  ].map((link, index) => (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-200 group"
                    >
                      <span className="font-medium text-gray-700 group-hover:text-purple-600">
                        {link.name}
                      </span>
                      <div
                        className={`w-2 h-2 rounded-full ${link.color}`}
                      ></div>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <div className="h-96 lg:h-full bg-gray-100 rounded-2xl overflow-hidden border border-gray-200">
              <iframe
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                marginHeight="0"
                marginWidth="0"
                style={{ border: "none" }}
                src={mapUrl}
                title="Visitor Location Map"
                className="rounded-2xl"
              />
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50/50 shrink-0 rounded-b-3xl">
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 px-6 rounded-xl hover:from-indigo-700 hover:to-purple-700 active:scale-95 transition-all duration-200 font-semibold shadow-lg"
          >
            Close Map
          </button>
        </div>
      </div>
    </div>
  );
};

// Enhanced IP Modal
const IPModal = ({ ip, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-6xl mx-auto flex flex-col max-h-[90vh] shadow-2xl transform animate-scaleIn">
        <div className="flex justify-between items-center p-6 border-b border-gray-100 shrink-0">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              IP Address Analysis
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Detailed information for:{" "}
              <span className="font-mono font-semibold">{ip}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors duration-200 group"
            aria-label="Close"
          >
            <svg
              className="w-6 h-6 text-gray-500 group-hover:text-gray-700"
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

        <div className="flex-1 overflow-auto p-6">
          <IPApiDetails ip={ip} />
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50/50 shrink-0 rounded-b-3xl">
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 px-6 rounded-xl hover:from-indigo-700 hover:to-purple-700 active:scale-95 transition-all duration-200 font-semibold shadow-lg"
          >
            Close Analysis
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Analytics Component
const Analytics = ({ stats, links }) => {
  const [selectedLinkId, setSelectedLinkId] = useState(null);
  const [visitLogs, setVisitLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedIp, setSelectedIp] = useState(null);
  const [showIpModal, setShowIpModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      if (selectedLinkId) {
        fetchVisitLogs();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh, selectedLinkId]);

  // Format data for charts
  const linkData =
    links?.map((link) => ({
      name: link.shortCode,
      fullUrl: `${link.domain}/${link.shortCode}`,
      clicks: stats?.clicksByLink?.[link._id] || 0,
      id: link._id,
    })) || [];

  const timeSeriesData =
    stats?.timeSeries?.map((item) => ({
      date: format(new Date(item.date), "MMM dd"),
      fullDate: format(new Date(item.date), "MMM dd, yyyy"),
      clicks: item.count,
    })) || [];

  // Enhanced device data with icons
  const deviceData = [
    { name: "Desktop", value: stats?.devices?.desktop || 0, icon: "💻" },
    { name: "Mobile", value: stats?.devices?.mobile || 0, icon: "📱" },
    { name: "Tablet", value: stats?.devices?.tablet || 0, icon: "📟" },
    { name: "Other", value: stats?.devices?.other || 0, icon: "🔍" },
  ].filter((item) => item.value > 0);

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

  useEffect(() => {
    fetchVisitLogs();
  }, [selectedLinkId]);

  const handleCheckIp = (ipAddress) => {
    setSelectedIp(ipAddress);
    setShowIpModal(true);
  };

  const handleViewPhoto = (photoUrl) => {
    if (!photoUrl) return;
    setSelectedPhoto(photoUrl);
    setShowPhotoModal(true);
  };

  const handleViewLocation = (location) => {
    if (!location) return;
    setSelectedLocation(location);
    setShowLocationModal(true);
  };

  // Enhanced Custom Tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl p-4 shadow-2xl">
          <p className="font-semibold text-gray-900">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: <span className="font-semibold">{entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-500"></div>
        <p className="text-gray-600 text-lg">Loading analytics data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4">
      {/* Auto-refresh Toggle */}
      <div className="flex justify-end">
        <label className="flex items-center space-x-3 bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-200 shadow-sm">
          <span className="text-sm font-medium text-gray-700">
            Auto-refresh
          </span>
          <div className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
          </div>
        </label>
      </div>

      {/* Summary Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        <MetricCard
          icon={<CursorArrowRaysIcon className="h-6 w-6" />}
          title="Total Clicks"
          value={stats?.totalClicks || 0}
          color="indigo"
          trend={12}
        />
        <MetricCard
          icon={<UsersIcon className="h-6 w-6" />}
          title="Unique Visitors"
          value={stats?.uniqueVisitors || 0}
          color="green"
          trend={8}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Clicks Over Time */}
        {timeSeriesData.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <ChartBarIcon className="w-5 h-5 mr-2 text-indigo-600" />
                Clicks Over Time
              </h3>
              <CalendarIcon className="w-5 h-5 text-gray-400" />
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeSeriesData}>
                  <defs>
                    <linearGradient
                      id="colorClicks"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f3f4f6"
                  />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#6b7280", fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#6b7280", fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="clicks"
                    stroke="#6366F1"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorClicks)"
                    name="Clicks"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Device Distribution */}
        {deviceData.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <DevicePhoneMobileIcon className="w-5 h-5 mr-2 text-green-600" />
                Device Distribution
              </h3>
              <span className="text-sm text-gray-500">
                {deviceData.reduce((sum, item) => sum + item.value, 0)} total
              </span>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deviceData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} (${(percent * 100).toFixed(0)}%)`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {deviceData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value} visits`, "Visits"]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Visit Logs Section */}
      <div className="space-y-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-sm">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Detailed Visit Logs
              </h3>
              <p className="text-gray-600">
                Select a link to view individual visit records with advanced
                tracking data
              </p>
            </div>
            <div className="w-full lg:w-64">
              <select
                className="w-full border border-gray-300 rounded-xl shadow-sm py-3 px-4 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 bg-white"
                onChange={(e) => setSelectedLinkId(e.target.value)}
                value={selectedLinkId || ""}
              >
                <option value="">Select Link to Analyze</option>
                {links?.map((link) => (
                  <option key={link._id} value={link._id}>
                    {link.domain}/{link.shortCode} (
                    {stats?.clicksByLink?.[link._id] || 0} clicks)
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 shadow-sm">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-500"></div>
              <p className="text-gray-600 font-medium">Loading visit logs...</p>
              <p className="text-sm text-gray-500">
                Fetching detailed analytics data
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 rounded-2xl p-6 shadow-sm">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-red-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-red-800 mb-2">
                  Unable to Load Data
                </h4>
                <p className="text-red-700">{error}</p>
                <button
                  onClick={fetchVisitLogs}
                  className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Visit Logs Table */}
        {selectedLinkId && visitLogs.length > 0 && !loading && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Visit Records
                  </h3>
                  <p className="text-gray-600 mt-1">
                    Showing {visitLogs.length} recent visits
                  </p>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <ClockIcon className="w-4 h-4" />
                  <span>Auto-refresh: {autoRefresh ? "On" : "Off"}</span>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      IP Address
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Device
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Media
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {visitLogs.map((visit) => (
                    <tr
                      key={visit._id}
                      className="hover:bg-gray-50/80 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {format(new Date(visit.timestamp), "MMM dd, yyyy")}
                        </div>
                        <div className="text-sm text-gray-500">
                          {format(new Date(visit.timestamp), "h:mm:ss a")}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-mono font-medium text-gray-900">
                          {visit.publicIp}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900 capitalize">
                            {visit.device?.type || "Unknown"}
                          </div>
                          <div className="text-xs text-gray-500 space-x-2">
                            <span>{visit.device?.os || "N/A"}</span>
                            <span>•</span>
                            <span>{visit.device?.browser || "N/A"}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          {visit.hasPhoto && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                              📸 Photo
                            </span>
                          )}
                          {visit.hasLocation && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                              📍 Location
                            </span>
                          )}
                          {!visit.hasPhoto && !visit.hasLocation && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                              No Media
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleCheckIp(visit.publicIp)}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-xs font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 shadow-sm hover:shadow-md"
                          >
                            <EyeIcon className="h-3 w-3 mr-1" />
                            Check IP
                          </button>
                          {visit.hasPhoto && (
                            <button
                              onClick={() => handleViewPhoto(visit.photo)}
                              className="inline-flex items-center px-3 py-2 border border-transparent text-xs font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                              <CameraIcon className="h-3 w-3 mr-1" />
                              View Photo
                            </button>
                          )}
                          {visit.hasLocation && (
                            <button
                              onClick={() => handleViewLocation(visit.location)}
                              className="inline-flex items-center px-3 py-2 border border-transparent text-xs font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                              <MapPinIcon className="h-3 w-3 mr-1" />
                              See Location
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      {/* Link Performance */}
      {linkData.length > 0 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <LinkIcon className="w-5 h-5 mr-2 text-blue-600" />
            Link Performance
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={linkData}
                layout="vertical"
                margin={{ left: 100, right: 20 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={true}
                  stroke="#f3f4f6"
                />
                <XAxis type="number" axisLine={false} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={90}
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(value) => [`${value} clicks`, "Clicks"]}
                  labelFormatter={(value) => `Short Code: ${value}`}
                />
                <Bar
                  dataKey="clicks"
                  fill="#6366F1"
                  name="Clicks"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      {/* Modals */}
      {showIpModal && selectedIp && (
        <IPModal ip={selectedIp} onClose={() => setShowIpModal(false)} />
      )}
      {showPhotoModal && selectedPhoto && (
        <PhotoModal
          photoUrl={selectedPhoto}
          onClose={() => setShowPhotoModal(false)}
        />
      )}
      {showLocationModal && selectedLocation && (
        <LocationModal
          location={selectedLocation}
          onClose={() => setShowLocationModal(false)}
        />
      )}
    </div>
  );
};

export default Analytics;
