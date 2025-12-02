/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FiRefreshCw,
  FiGlobe,
  FiSmartphone,
  FiBarChart2,
  FiUsers,
  FiEye,
  FiCamera,
  FiMapPin,
  FiLink,
  FiCalendar,
  FiClock,
  FiMousePointer,
  FiInfo,
  FiDownload,
  FiFileText,
} from "react-icons/fi";
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
          <FiInfo className="w-8 h-8 text-red-500" />
        </div>
        <p className="text-lg font-semibold">{error}</p>
      </div>
    );
  }

  const importantFields = [
    {
      key: "country_name",
      label: "Country",
      icon: <FiGlobe className="w-6 h-6" />,
    },
    { key: "city", label: "City", icon: <FiMapPin className="w-6 h-6" /> },
    { key: "region", label: "Region", icon: <FiGlobe className="w-6 h-6" /> },
    { key: "org", label: "Organization", icon: <FiInfo className="w-6 h-6" /> },
    { key: "asn", label: "ASN", icon: <FiLink className="w-6 h-6" /> },
    {
      key: "timezone",
      label: "Timezone",
      icon: <FiClock className="w-6 h-6" />,
    },
    {
      key: "currency",
      label: "Currency",
      icon: <FiInfo className="w-6 h-6" />,
    },
    {
      key: "languages",
      label: "Languages",
      icon: <FiInfo className="w-6 h-6" />,
    },
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
              <div className="text-gray-600">{icon}</div>
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
        <div className="mt-6 relative">
          <details className="bg-gray-50 rounded-lg p-4 group">
            <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900 flex items-center justify-between">
              <div className="flex items-center">
                <FiInfo className="w-4 h-4 mr-2" />
                View All Technical Details
              </div>
              {/* Dropdown arrow */}
              <svg
                className="w-4 h-4 ml-2 text-gray-600 transition-transform duration-300 group-open:rotate-180"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
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
    },
    green: {
      bg: "bg-green-50",
      border: "border-green-100",
      text: "text-green-700",
    },
  };

  return (
    <div
      className={`p-6 rounded-2xl border ${colorClasses[color].border} ${colorClasses[color].bg} backdrop-blur-sm transition-all duration-300 hover:shadow-lg`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div
            className={`p-3 rounded-xl bg-white border ${colorClasses[color].border} text-gray-700 shadow-lg`}
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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl w-full max-w-2xl mx-auto flex flex-col max-h-[90vh] shadow-2xl border border-gray-200">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 shrink-0">
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
          <div className="flex items-center justify-center min-h-[300px] bg-gray-50 rounded-2xl border border-gray-200">
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
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-200">
                <FiCamera className="w-10 h-10 text-red-500" />
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

        <div className="p-6 border-t border-gray-200 bg-gray-50 shrink-0 rounded-b-3xl">
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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl w-full max-w-6xl mx-auto flex flex-col max-h-[90vh] shadow-2xl border border-gray-200">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 shrink-0">
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
                  <FiMapPin className="w-5 h-5 mr-2 text-blue-600" />
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
                      name: "Open Street Map",
                      url: `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=15/${latitude}/${longitude}`,
                      color: "bg-green-500",
                    },
                    {
                      name: "Google Maps",
                      url: `https://maps.google.com/?q=${latitude},${longitude}`,
                      color: "bg-blue-500",
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

        <div className="p-6 border-t border-gray-200 bg-gray-50 shrink-0 rounded-b-3xl">
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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl w-full max-w-6xl mx-auto flex flex-col max-h-[90vh] shadow-2xl border border-gray-200">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 shrink-0">
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

        <div className="p-6 border-t border-gray-200 bg-gray-50 shrink-0 rounded-b-3xl">
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
// CSV Download Modal
const CSVDownloadModal = ({ links, onClose, visitLogs }) => {
  const [selectedLinks, setSelectedLinks] = useState([]);
  const [selectedIPs, setSelectedIPs] = useState([]);
  const [selectedTimes, setSelectedTimes] = useState([]);
  const [availableIPs, setAvailableIPs] = useState([]);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [step, setStep] = useState(1); // 1: Links, 2: IPs, 3: Times

  // Extract unique IPs and times from visitLogs
  useEffect(() => {
    if (visitLogs && visitLogs.length > 0) {
      const uniqueIPs = [
        ...new Set(visitLogs.map((visit) => visit.publicIp).filter(Boolean)),
      ];

      // Extract timestamps with proper formatting
      const uniqueTimes = [
        ...new Set(
          visitLogs.map((visit) => {
            const date = new Date(visit.timestamp);
            return date.toISOString(); // Use full ISO string for uniqueness
          })
        ),
      ];

      setAvailableIPs(uniqueIPs);
      setAvailableTimes(uniqueTimes.sort());
    }
  }, [visitLogs]);

  // Update available IPs and times when links are selected
  useEffect(() => {
    if (selectedLinks.length > 0 && visitLogs) {
      const filteredLogs = visitLogs.filter((visit) =>
        selectedLinks.includes(visit.linkId)
      );

      const uniqueIPs = [
        ...new Set(filteredLogs.map((visit) => visit.publicIp).filter(Boolean)),
      ];

      setAvailableIPs(uniqueIPs);

      // Reset dependent selections when selectedLinks changes
      setSelectedIPs([]);
      setSelectedTimes([]);
      setAvailableTimes([]);

      setStep(2);
    } else {
      setAvailableIPs([]);
      setSelectedIPs([]);
      setAvailableTimes([]);
      setSelectedTimes([]);
      setStep(1);
    }
  }, [selectedLinks, visitLogs]);
  useEffect(() => {
    if (selectedIPs.length > 0) {
      const filteredLogs = visitLogs.filter(
        (visit) =>
          selectedLinks.includes(visit.linkId) &&
          selectedIPs.includes(visit.publicIp)
      );
      const uniqueTimes = [
        ...new Set(
          filteredLogs.map((visit) => {
            const date = new Date(visit.timestamp);
            return date.toISOString();
          })
        ),
      ];
      setAvailableTimes(uniqueTimes.sort());
      setStep(3);

      // FIX: Only clear selection, don't auto select all
      setSelectedTimes([]); // <-- Only clear, user should select from shown times
    }
  }, [selectedIPs, selectedLinks, visitLogs]);

  // Toggle selection for links
  const toggleLinkSelection = (linkId) => {
    setSelectedLinks((prev) =>
      prev.includes(linkId)
        ? prev.filter((id) => id !== linkId)
        : [...prev, linkId]
    );
  };

  // Toggle selection for IPs
  const toggleIPSelection = (ip) => {
    setSelectedIPs((prev) =>
      prev.includes(ip) ? prev.filter((item) => item !== ip) : [...prev, ip]
    );
  };

  // Toggle selection for times
  const toggleTimeSelection = (time) => {
    setSelectedTimes((prev) =>
      prev.includes(time)
        ? prev.filter((item) => item !== time)
        : [...prev, time]
    );
  };

  // Select all items in current step
  const selectAll = (type) => {
    if (type === "links") {
      setSelectedLinks(availableLinks.map((link) => link.id));
    } else if (type === "ips") {
      setSelectedIPs([...availableIPs]);
    } else if (type === "times") {
      setSelectedTimes([...availableTimes]);
    }
  };

  // Clear all items in current step
  const clearAll = (type) => {
    if (type === "links") {
      setSelectedLinks([]);
    } else if (type === "ips") {
      setSelectedIPs([]);
    } else if (type === "times") {
      setSelectedTimes([]);
    }
  };

  // Function to fetch ISP data for an IP
  const fetchISPData = async (ip) => {
    try {
      const response = await fetch(`https://ipapi.co/${ip}/json/`);
      const data = await response.json();
      return data.org || data.isp || "Unknown ISP";
    } catch (error) {
      console.error(`Failed to fetch ISP data for IP ${ip}:`, error);
      return "Unknown ISP";
    }
  };

  const handleDownloadCSV = async () => {
    if (selectedLinks.length === 0) {
      alert("Please select at least one link");
      return;
    }

    // Filter visit logs based on selections
    let filteredLogs = visitLogs.filter((visit) =>
      selectedLinks.includes(visit.linkId)
    );

    // Filter by IP if selected
    if (selectedIPs.length > 0) {
      filteredLogs = filteredLogs.filter((visit) =>
        selectedIPs.includes(visit.publicIp)
      );
    }

    // Filter by time if selected
    if (selectedTimes.length > 0) {
      filteredLogs = filteredLogs.filter((visit) => {
        const visitTime = new Date(visit.timestamp).toISOString();
        return selectedTimes.includes(visitTime);
      });
    }

    // Generate CSV content
    const headers = [
      "Domain",
      "Date",
      "Day",
      "Time",
      "IP Address",
      "Device",
      "ISP Organization",
    ];

    // Create CSV rows with proper formatting
    const csvRows = await Promise.all(
      filteredLogs.map(async (visit) => {
        const date = new Date(visit.timestamp);
        const link = links.find((l) => l._id === visit.linkId);

        // Use the actual URL without encoding - this will preserve Bengali characters
        const domain = link
          ? `"${link.domain}/${link.shortCode}"`
          : '"Unknown"';

        // Format device information - all in one column separated by commas
        const deviceType = visit.device?.type || "Unknown";
        const deviceOS = visit.device?.os || "Unknown";
        const deviceBrowser = visit.device?.browser || "Unknown";
        const deviceInfo = `${deviceType},${deviceOS},${deviceBrowser}`;

        // Fetch ISP data
        const ispOrganization = visit.publicIp
          ? await fetchISPData(visit.publicIp)
          : "Unknown ISP";

        return [
          domain, // Wrap in quotes to preserve special characters
          date.toISOString().split("T")[0], // Date (YYYY-MM-DD)
          date.toLocaleDateString("en-US", { weekday: "long" }), // Day
          date.toLocaleTimeString("en-US", { hour12: false }), // Time (HH:MM:SS) - 24-hour format
          visit.publicIp || "N/A", // IP Address
          `"${deviceInfo}"`, // Device info as "Mobile,Android,Chrome" in one column with quotes
          `"${ispOrganization}"`, // Wrap ISP in quotes as well
        ].join(",");
      })
    );

    // Add BOM (Byte Order Mark) for UTF-8 encoding to preserve special characters
    const BOM = "\uFEFF";

    // Combine headers and rows
    const csvContent = BOM + [headers.join(","), ...csvRows].join("\n");

    // Create and download file with explicit UTF-8 encoding
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `analytics-export-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    onClose();
  };

  const resetSelections = () => {
    setSelectedLinks([]);
    setSelectedIPs([]);
    setSelectedTimes([]);
    setStep(1);
  };

  // Get all unique link IDs from visitLogs - show ALL links, not just those with visits
  const availableLinks =
    links?.map((link) => {
      const visitCount =
        visitLogs?.filter((v) => v.linkId === link._id).length || 0;
      return {
        id: link._id,
        name: `${link.domain}/${link.shortCode}`,
        domain: link.domain,
        visitCount: visitCount,
      };
    }) || [];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl w-full max-w-2xl mx-auto flex flex-col max-h-[90vh] shadow-2xl border border-gray-200">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 shrink-0">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Export CSV File</h3>
            <p className="text-sm text-gray-600 mt-1">
              Select filters to download analytics data
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
          <div className="space-y-6">
            {/* Progress Steps */}
            <div className="flex justify-between items-center mb-8">
              {[1, 2, 3].map((stepNum) => (
                <div key={stepNum} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      step >= stepNum
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {stepNum}
                  </div>
                  {stepNum < 3 && (
                    <div
                      className={`w-16 h-1 mx-2 ${
                        step > stepNum ? "bg-indigo-600" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Step 1: Link Selection */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-semibold text-gray-900">
                  Select Links (Required)
                </label>
                <div className="space-x-2">
                  <button
                    onClick={() => selectAll("links")}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    Select All
                  </button>
                  <button
                    onClick={() => clearAll("links")}
                    className="text-xs text-gray-600 hover:text-gray-800 font-medium"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              <div className="max-h-64 overflow-y-auto border border-gray-300 rounded-xl p-3 space-y-2">
                {availableLinks.length > 0 ? (
                  availableLinks.map((link) => (
                    <div
                      key={link.id}
                      className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                        selectedLinks.includes(link.id)
                          ? "bg-indigo-50 border border-indigo-200"
                          : "bg-gray-50 border border-gray-200 hover:bg-gray-100"
                      }`}
                      onClick={() => toggleLinkSelection(link.id)}
                    >
                      {/* Square checkbox */}
                      <div
                        className={`w-5 h-5 border-2 flex items-center justify-center transition-all duration-200 ${
                          selectedLinks.includes(link.id)
                            ? "bg-indigo-600 border-indigo-600"
                            : "bg-white border-gray-400"
                        }`}
                        style={{ borderRadius: "4px" }}
                      >
                        {selectedLinks.includes(link.id) && (
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                      <span className="text-sm font-medium text-gray-900 flex-1">
                        {link.name}
                      </span>
                      <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                        {link.visitCount} clicks
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No links available
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-500">
                {selectedLinks.length} of {availableLinks.length} links selected
              </p>
            </div>

            {/* Step 2: IP Selection */}
            {step >= 2 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-semibold text-gray-900">
                    Select IP Addresses (Optional)
                  </label>
                  <div className="space-x-2">
                    <button
                      onClick={() => selectAll("ips")}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      Select All
                    </button>
                    <button
                      onClick={() => clearAll("ips")}
                      className="text-xs text-gray-600 hover:text-gray-800 font-medium"
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                <div className="max-h-64 overflow-y-auto border border-gray-300 rounded-xl p-3 space-y-2">
                  {availableIPs.length > 0 ? (
                    availableIPs.map((ip, index) => (
                      <div
                        key={index}
                        className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                          selectedIPs.includes(ip)
                            ? "bg-indigo-50 border border-indigo-200"
                            : "bg-gray-50 border border-gray-200 hover:bg-gray-100"
                        }`}
                        onClick={() => toggleIPSelection(ip)}
                      >
                        {/* Square checkbox */}
                        <div
                          className={`w-5 h-5 border-2 flex items-center justify-center transition-all duration-200 ${
                            selectedIPs.includes(ip)
                              ? "bg-indigo-600 border-indigo-600"
                              : "bg-white border-gray-400"
                          }`}
                          style={{ borderRadius: "4px" }}
                        >
                          {selectedIPs.includes(ip) && (
                            <svg
                              className="w-3 h-3 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </div>
                        <span className="text-sm font-mono text-gray-900 flex-1">
                          {ip}
                        </span>
                        <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                          {
                            visitLogs.filter(
                              (v) =>
                                v.publicIp === ip &&
                                selectedLinks.includes(v.linkId)
                            ).length
                          }{" "}
                          visits
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No IP addresses available for selected links
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  {selectedIPs.length > 0
                    ? `${selectedIPs.length} of ${availableIPs.length} IPs selected`
                    : `All ${availableIPs.length} IPs will be included`}
                </p>
              </div>
            )}

            {/* Step 3: Time Selection */}
            {step >= 3 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-semibold text-gray-900">
                    Select Times (Optional)
                  </label>
                  <div className="space-x-2">
                    <button
                      onClick={() => selectAll("times")}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      Select All
                    </button>
                    <button
                      onClick={() => clearAll("times")}
                      className="text-xs text-gray-600 hover:text-gray-800 font-medium"
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                <div className="max-h-64 overflow-y-auto border border-gray-300 rounded-xl p-3 space-y-2">
                  {availableTimes.length > 0 ? (
                    availableTimes.map((time, index) => {
                      const date = new Date(time);
                      const formattedDate = date.toLocaleDateString("en-US");
                      const formattedTime = date.toLocaleTimeString("en-US", {
                        hour12: false,
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      });

                      return (
                        <div
                          key={index}
                          className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                            selectedTimes.includes(time)
                              ? "bg-indigo-50 border border-indigo-200"
                              : "bg-gray-50 border border-gray-200 hover:bg-gray-100"
                          }`}
                          onClick={() => toggleTimeSelection(time)}
                        >
                          {/* Square checkbox */}
                          <div
                            className={`w-5 h-5 border-2 flex items-center justify-center transition-all duration-200 ${
                              selectedTimes.includes(time)
                                ? "bg-indigo-600 border-indigo-600"
                                : "bg-white border-gray-400"
                            }`}
                            style={{ borderRadius: "4px" }}
                          >
                            {selectedTimes.includes(time) && (
                              <svg
                                className="w-3 h-3 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={3}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">
                              {formattedDate}
                            </div>
                            <div className="text-xs text-gray-500">
                              {formattedTime}
                            </div>
                          </div>
                          <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                            {
                              visitLogs.filter((v) => {
                                const visitTime = new Date(
                                  v.timestamp
                                ).toISOString();
                                return (
                                  visitTime === time &&
                                  selectedLinks.includes(v.linkId)
                                );
                              }).length
                            }{" "}
                            visits
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No times available for selected links
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  {selectedTimes.length > 0
                    ? `${selectedTimes.length} of ${availableTimes.length} times selected`
                    : `All ${availableTimes.length} times will be included`}
                </p>
              </div>
            )}

            {/* Preview Info */}
            {selectedLinks.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">
                  Export Preview
                </h4>
                <p className="text-sm text-blue-700">
                  {selectedLinks.length} link(s) selected •
                  {selectedIPs.length > 0
                    ? ` ${selectedIPs.length} IP(s)`
                    : " All IPs"}{" "}
                  •
                  {selectedTimes.length > 0
                    ? ` ${selectedTimes.length} time(s)`
                    : " All times"}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Total records to export:{" "}
                  {
                    visitLogs.filter(
                      (visit) =>
                        selectedLinks.includes(visit.linkId) &&
                        (selectedIPs.length === 0 ||
                          selectedIPs.includes(visit.publicIp)) &&
                        (selectedTimes.length === 0 ||
                          selectedTimes.includes(
                            new Date(visit.timestamp).toISOString()
                          ))
                    ).length
                  }
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50 shrink-0 rounded-b-3xl flex justify-between">
          <button
            onClick={resetSelections}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-all duration-200 font-medium"
          >
            Reset All
          </button>
          <div className="space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-all duration-200 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleDownloadCSV}
              disabled={selectedLinks.length === 0}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg"
            >
              Download CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
// IPDR Request Modal Component
// IPDR Request Modal Component
const IPDRRequestModal = ({ links, onClose, visitLogs }) => {
  const [selectedLinks, setSelectedLinks] = useState([]);
  const [selectedIPs, setSelectedIPs] = useState([]);
  const [selectedTimes, setSelectedTimes] = useState([]);
  const [availableIPs, setAvailableIPs] = useState([]);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [ispData, setIspData] = useState({});
  const [loadingISP, setLoadingISP] = useState(false);
  const [step, setStep] = useState(1); // 1: Links, 2: IPs, 3: Times
  const [showEditTable, setShowEditTable] = useState(false);
  const [emailData, setEmailData] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  // Function to fetch ISP data for an IP
  const fetchISPData = async (ip) => {
    try {
      const response = await fetch(`https://ipapi.co/${ip}/json/`);
      const data = await response.json();
      return data.org || data.isp || "Unknown ISP";
    } catch (error) {
      console.error(`Failed to fetch ISP data for IP ${ip}:`, error);
      return "Unknown ISP";
    }
  };

  // Fetch ISP data for all available IPs
  useEffect(() => {
    const fetchAllISPData = async () => {
      if (availableIPs.length > 0) {
        setLoadingISP(true);
        const ispPromises = availableIPs.map(async (ip) => {
          const isp = await fetchISPData(ip);
          return { ip, isp };
        });

        const results = await Promise.all(ispPromises);
        const ispMap = {};
        results.forEach(({ ip, isp }) => {
          ispMap[ip] = isp;
        });

        setIspData(ispMap);
        setLoadingISP(false);
      }
    };

    fetchAllISPData();
  }, [availableIPs]);

  // Extract unique IPs from visitLogs based on selected links
  useEffect(() => {
    if (selectedLinks.length > 0 && visitLogs) {
      const filteredLogs = visitLogs.filter(
        (visit) => selectedLinks.includes(visit.linkId) && visit.publicIp
      );

      // Use a Map to ensure unique IPs while preserving order
      const ipMap = new Map();
      filteredLogs.forEach((visit) => {
        if (visit.publicIp && !ipMap.has(visit.publicIp)) {
          ipMap.set(visit.publicIp, visit);
        }
      });

      const uniqueIPs = Array.from(ipMap.keys());
      setAvailableIPs(uniqueIPs);

      // If we have IPs, move to step 2
      if (uniqueIPs.length > 0) {
        setStep(2);
      }
    } else {
      setAvailableIPs([]);
      setSelectedIPs([]);
      setAvailableTimes([]);
      setSelectedTimes([]);
      setStep(1);
    }
  }, [selectedLinks, visitLogs]);

  // Update available times when IPs are selected
  useEffect(() => {
    if (selectedIPs.length > 0 && visitLogs && selectedLinks.length > 0) {
      const filteredLogs = visitLogs.filter(
        (visit) =>
          selectedLinks.includes(visit.linkId) &&
          selectedIPs.includes(visit.publicIp)
      );

      // Get unique times for the selected IPs
      const timeMap = new Map();
      filteredLogs.forEach((visit) => {
        const time = new Date(visit.timestamp).toISOString();
        if (!timeMap.has(time)) {
          timeMap.set(time, visit);
        }
      });

      const uniqueTimes = Array.from(timeMap.keys()).sort();
      setAvailableTimes(uniqueTimes);
      setStep(3);
    } else {
      setAvailableTimes([]);
      setSelectedTimes([]);
      if (selectedLinks.length > 0) {
        setStep(2);
      }
    }
  }, [selectedIPs, selectedLinks, visitLogs]);

  // Generate email data when selections change
  useEffect(() => {
    if (selectedLinks.length > 0) {
      generateEmailData();
    }
  }, [selectedLinks, selectedIPs, selectedTimes, ispData]);

  // Function to generate time range (2 minutes before and after)
  const generateTimeRange = (time) => {
    const date = new Date(time);

    // Calculate 2 minutes before and after
    const startTime = new Date(date.getTime() - 2 * 60 * 1000);
    const endTime = new Date(date.getTime() + 2 * 60 * 1000);

    // Format as HH:mm:ss
    const formatTime = (dateObj) => {
      return dateObj.toTimeString().split(" ")[0]; // Gets HH:mm:ss
    };

    return `${formatTime(startTime)} to ${formatTime(endTime)}`;
  };

  // Function to format date as YYYY-MM-DD
  const formatDate = (time) => {
    const date = new Date(time);
    return date.toISOString().split("T")[0];
  };

  // Function to get ISP name for an IP
  const getISPName = (ip) => {
    const isp = ispData[ip];
    if (!isp) return "Airtel"; // Default to Airtel if not loaded yet

    // Extract just the ISP name from the organization field
    if (isp.includes("Airtel")) return "Airtel";
    if (isp.includes("BSNL")) return "BSNL";
    if (isp.includes("Jio")) return "Jio";
    if (isp.includes("Vodafone")) return "Vodafone";
    if (isp.includes("ACT")) return "ACT";
    if (isp.includes("Hathway")) return "Hathway";

    // Return the first word or the whole string if no known ISP found
    return isp.split(" ")[0] || "Airtel";
  };

  // Generate email data for the table
  const generateEmailData = () => {
    if (selectedLinks.length === 0) return [];

    // Get all IPs to use (selected IPs or all available IPs if none selected)
    const ipsToUse = selectedIPs.length > 0 ? selectedIPs : availableIPs;

    if (ipsToUse.length === 0) return [];

    // Get all visit times based on selections
    let filteredLogs = visitLogs.filter((visit) =>
      selectedLinks.includes(visit.linkId)
    );

    // Filter by IP if selected
    if (selectedIPs.length > 0) {
      filteredLogs = filteredLogs.filter((visit) =>
        selectedIPs.includes(visit.publicIp)
      );
    }

    // Filter by time if selected
    if (selectedTimes.length > 0) {
      filteredLogs = filteredLogs.filter((visit) => {
        const visitTime = new Date(visit.timestamp).toISOString();
        return selectedTimes.includes(visitTime);
      });
    }

    // Get unique IP-Time combinations to avoid duplicates
    const uniqueCombinations = {};
    filteredLogs.forEach((visit) => {
      const ip = visit.publicIp;
      const time = new Date(visit.timestamp).toISOString();
      const key = `${ip}-${time}`;

      if (!uniqueCombinations[key]) {
        uniqueCombinations[key] = {
          slNo: Object.keys(uniqueCombinations).length + 1,
          ip,
          time,
          date: formatDate(time),
          timeRange: generateTimeRange(time),
          isp: getISPName(ip),
        };
      }
    });

    const emailDataArray = Object.values(uniqueCombinations);
    setEmailData(emailDataArray);
    return emailDataArray;
  };

  // Toggle selection for links
  const toggleLinkSelection = (linkId) => {
    setSelectedLinks((prev) =>
      prev.includes(linkId)
        ? prev.filter((id) => id !== linkId)
        : [...prev, linkId]
    );
  };

  // Toggle selection for IPs
  const toggleIPSelection = (ip) => {
    setSelectedIPs((prev) =>
      prev.includes(ip) ? prev.filter((item) => item !== ip) : [...prev, ip]
    );
  };

  // Toggle selection for times
  const toggleTimeSelection = (time) => {
    setSelectedTimes((prev) =>
      prev.includes(time)
        ? prev.filter((item) => item !== time)
        : [...prev, time]
    );
  };

  // Select all items in current step
  const selectAll = (type) => {
    if (type === "links") {
      setSelectedLinks(availableLinks.map((link) => link.id));
    } else if (type === "ips") {
      setSelectedIPs([...availableIPs]);
    } else if (type === "times") {
      setSelectedTimes([...availableTimes]);
    }
  };

  // Clear all items in current step
  const clearAll = (type) => {
    if (type === "links") {
      setSelectedLinks([]);
    } else if (type === "ips") {
      setSelectedIPs([]);
    } else if (type === "times") {
      setSelectedTimes([]);
    }
  };

  // Handle table data edit
  const handleTableEdit = (index, field, value) => {
    const newData = [...emailData];
    newData[index] = {
      ...newData[index],
      [field]: value,
    };
    setEmailData(newData);
  };

  // Copy table data to clipboard
  const handleCopyTable = () => {
    const tableText = generateTableText();
    navigator.clipboard
      .writeText(tableText)
      .then(() => {
        alert("Table copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy:", err);
        alert("Failed to copy to clipboard");
      });
  };

  // Generate table text for copy
  const generateTableText = () => {
    let tableText =
      "SL #   Operator/ISP         IP Address          Date               Time (BST)\r\n\r\n";

    emailData.forEach((entry) => {
      const slNo = entry.slNo.toString().padEnd(2, " ");
      const isp = (entry.isp || "Airtel").padEnd(15, " ");
      const ipFormatted = (entry.ip || "").padEnd(18, " ");
      const dateFormatted = (entry.date || "").padEnd(18, " ");
      const timeRange = entry.timeRange || "";

      tableText += `${slNo}.         ${isp} ${ipFormatted} ${dateFormatted} ${timeRange}\r\n`;
    });

    return tableText;
  };

  const handleComposeEmail = (useEditedData = false) => {
    if (selectedLinks.length === 0) {
      alert("Please select at least one link");
      return;
    }

    // Use edited data if available and flag is set
    const dataToUse =
      useEditedData && emailData.length > 0 ? emailData : generateEmailData();

    if (dataToUse.length === 0) {
      alert("No data available for the selected filters");
      return;
    }

    // Create email content with proper formatting
    const emailSubject = "Requesting for ipdr/iplog";

    let emailBody = "Dear Sir,\r\n\r\n";
    emailBody +=
      "Provide please IPDR mentioned below target IP within date range.\r\n\r\n";
    emailBody +=
      "SL #   Operator/ISP         IP Address          Date               Time (BST)\r\n\r\n";

    // Create entries from data
    dataToUse.forEach((entry, index) => {
      const slNo = (entry.slNo || index + 1).toString().padEnd(2, " ");
      const isp = (entry.isp || "Airtel").padEnd(15, " ");
      const ipFormatted = (entry.ip || "").padEnd(18, " ");
      const dateFormatted = (entry.date || "").padEnd(18, " ");
      const timeRange = entry.timeRange || "";

      emailBody += `${slNo}.         ${isp} ${ipFormatted} ${dateFormatted} ${timeRange}\r\n`;
    });

    emailBody += "\r\nInvestigation Officer:\r\n";
    emailBody += "Mob:\r\n\r\n";
    emailBody += "Regards:\r\n";
    emailBody += "Name\r\n";
    emailBody += "BP-\r\n";
    emailBody += "Designation\r\n";
    emailBody += "Mob:\r\n";
    emailBody += "Sender:";

    // Create mailto link with proper encoding
    const mailtoLink = `mailto:?subject=${encodeURIComponent(
      emailSubject
    )}&body=${encodeURIComponent(emailBody)}`;

    // Open email client
    window.open(mailtoLink, "_blank");

    if (!useEditedData) {
      onClose();
    }
  };

  const resetSelections = () => {
    setSelectedLinks([]);
    setSelectedIPs([]);
    setSelectedTimes([]);
    setEmailData([]);
    setShowEditTable(false);
    setIsEditing(false);
    setStep(1);
  };

  // Get all unique link IDs from visitLogs - show ALL links, not just those with visits
  const availableLinks =
    links?.map((link) => {
      const visitCount =
        visitLogs?.filter((v) => v.linkId === link._id).length || 0;
      return {
        id: link._id,
        name: `${link.domain}/${link.shortCode}`,
        domain: link.domain,
        visitCount: visitCount,
      };
    }) || [];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl w-full max-w-4xl mx-auto flex flex-col max-h-[90vh] shadow-2xl border border-gray-200">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 shrink-0">
          <div>
            <h3 className="text-xl font-bold text-gray-900">IPDR Request</h3>
            <p className="text-sm text-gray-600 mt-1">
              Select filters to generate IPDR request email
              {loadingISP && " - Loading ISP data..."}
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
          {!showEditTable ? (
            <div className="space-y-6">
              {/* Progress Steps */}
              <div className="flex justify-between items-center mb-8">
                {[1, 2, 3].map((stepNum) => (
                  <div key={stepNum} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                        step >= stepNum
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {stepNum}
                    </div>
                    {stepNum < 3 && (
                      <div
                        className={`w-16 h-1 mx-2 ${
                          step > stepNum ? "bg-indigo-600" : "bg-gray-200"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Step 1: Link Selection */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-semibold text-gray-900">
                    Select Links (Required)
                  </label>
                  <div className="space-x-2">
                    <button
                      onClick={() => selectAll("links")}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      Select All
                    </button>
                    <button
                      onClick={() => clearAll("links")}
                      className="text-xs text-gray-600 hover:text-gray-800 font-medium"
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                <div className="max-h-64 overflow-y-auto border border-gray-300 rounded-xl p-3 space-y-2">
                  {availableLinks.length > 0 ? (
                    availableLinks.map((link) => (
                      <div
                        key={link.id}
                        className={`flex flex-col sm:flex-row sm:items-center sm:space-x-3 p-3 sm:p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                          selectedLinks.includes(link.id)
                            ? "bg-indigo-50 border border-indigo-200"
                            : "bg-gray-50 border border-gray-200 hover:bg-gray-100"
                        }`}
                        onClick={() => toggleLinkSelection(link.id)}
                      >
                        {/* Square checkbox */}
                        <div
                          className={`w-8 h-8 sm:w-5 sm:h-5 border-2 flex items-center justify-center transition-all duration-200 shrink-0 mb-2 sm:mb-0 ${
                            selectedLinks.includes(link.id)
                              ? "bg-indigo-600 border-indigo-600"
                              : "bg-white border-gray-400"
                          }`}
                          style={{ borderRadius: "4px" }}
                        >
                          {selectedLinks.includes(link.id) && (
                            <svg
                              className="w-3.5 h-3.5 sm:w-3 sm:h-3 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </div>

                        {/* Link name */}
                        <span className="text-sm sm:text-base font-medium text-gray-900 flex-1 mb-2 sm:mb-0">
                          {link.name}
                        </span>

                        {/* Visit count badge */}
                        <span className="text-xs sm:text-sm text-gray-500 bg-gray-200 px-3 py-1.5 sm:px-2 sm:py-1 rounded self-start sm:self-center">
                          {link.visitCount} clicks
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No links available
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  {selectedLinks.length} of {availableLinks.length} links
                  selected
                </p>
              </div>

              {/* Step 2: IP Selection */}
              {step >= 2 && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="block text-sm font-semibold text-gray-900">
                      Select IP Addresses (Optional)
                    </label>
                    <div className="space-x-2">
                      <button
                        onClick={() => selectAll("ips")}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        Select All
                      </button>
                      <button
                        onClick={() => clearAll("ips")}
                        className="text-xs text-gray-600 hover:text-gray-800 font-medium"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>

                  <div className="max-h-64 overflow-y-auto border border-gray-300 rounded-xl p-3 space-y-2">
                    {availableIPs.length > 0 ? (
                      availableIPs.map((ip, index) => (
                        <div
                          key={index}
                          className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                            selectedIPs.includes(ip)
                              ? "bg-indigo-50 border border-indigo-200"
                              : "bg-gray-50 border border-gray-200 hover:bg-gray-100"
                          }`}
                          onClick={() => toggleIPSelection(ip)}
                        >
                          {/* Square checkbox */}
                          <div
                            className={`w-5 h-5 border-2 flex items-center justify-center transition-all duration-200 ${
                              selectedIPs.includes(ip)
                                ? "bg-indigo-600 border-indigo-600"
                                : "bg-white border-gray-400"
                            }`}
                            style={{ borderRadius: "4px" }}
                          >
                            {selectedIPs.includes(ip) && (
                              <svg
                                className="w-3 h-3 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={3}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            )}
                          </div>
                          <div className="flex-1">
                            <span className="text-sm font-mono text-gray-900">
                              {ip}
                            </span>
                            {ispData[ip] && (
                              <div className="text-xs text-gray-500 mt-1">
                                ISP: {getISPName(ip)}
                              </div>
                            )}
                          </div>
                          <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                            {
                              visitLogs.filter(
                                (v) =>
                                  v.publicIp === ip &&
                                  selectedLinks.includes(v.linkId)
                              ).length
                            }{" "}
                            visits
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No IP addresses available for selected links
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    {selectedIPs.length > 0
                      ? `${selectedIPs.length} of ${availableIPs.length} IPs selected`
                      : `All ${availableIPs.length} IPs will be included`}
                  </p>
                </div>
              )}

              {/* Step 3: Time Selection (only shown if IPs are selected) */}
              {step >= 3 && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="block text-sm font-semibold text-gray-900">
                      Select Times (Optional)
                    </label>
                    <div className="space-x-2">
                      <button
                        onClick={() => selectAll("times")}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        Select All
                      </button>
                      <button
                        onClick={() => clearAll("times")}
                        className="text-xs text-gray-600 hover:text-gray-800 font-medium"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>

                  <div className="max-h-64 overflow-y-auto border border-gray-300 rounded-xl p-3 space-y-2">
                    {availableTimes.length > 0 ? (
                      availableTimes.map((time, index) => {
                        const date = new Date(time);
                        const formattedDate = date.toLocaleDateString("en-US");
                        const formattedTime = date.toLocaleTimeString("en-US", {
                          hour12: false,
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        });

                        return (
                          <div
                            key={index}
                            className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                              selectedTimes.includes(time)
                                ? "bg-indigo-50 border border-indigo-200"
                                : "bg-gray-50 border border-gray-200 hover:bg-gray-100"
                            }`}
                            onClick={() => toggleTimeSelection(time)}
                          >
                            {/* Square checkbox */}
                            <div
                              className={`w-5 h-5 border-2 flex items-center justify-center transition-all duration-200 ${
                                selectedTimes.includes(time)
                                  ? "bg-indigo-600 border-indigo-600"
                                  : "bg-white border-gray-400"
                              }`}
                              style={{ borderRadius: "4px" }}
                            >
                              {selectedTimes.includes(time) && (
                                <svg
                                  className="w-3 h-3 text-white"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={3}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-900">
                                {formattedDate}
                              </div>
                              <div className="text-xs text-gray-500">
                                {formattedTime}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No times available for selected IPs
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    {selectedTimes.length > 0
                      ? `${selectedTimes.length} of ${availableTimes.length} times selected`
                      : `All ${availableTimes.length} times will be included`}
                  </p>
                </div>
              )}

              {/* Preview Info */}
              {selectedLinks.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-blue-900 mb-2">
                    IPDR Request Preview
                  </h4>
                  <p className="text-sm text-blue-700">
                    {selectedLinks.length} link(s) selected •
                    {selectedIPs.length > 0
                      ? ` ${selectedIPs.length} IP(s)`
                      : " All IPs"}{" "}
                    •
                    {selectedTimes.length > 0
                      ? ` ${selectedTimes.length} time(s)`
                      : " All times"}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    {emailData.length} records generated
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Edit Table View */
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Edit IPDR Table
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Edit the table data before composing email
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleCopyTable}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
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
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    <span>Copy Table</span>
                  </button>
                  <button
                    onClick={() => setShowEditTable(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                  >
                    Back to Filters
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto border border-gray-300 rounded-xl">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        SL #
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Operator/ISP
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        IP Address
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Time (BST)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {emailData.map((entry, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <input
                            type="text"
                            value={entry.slNo}
                            onChange={(e) =>
                              handleTableEdit(index, "slNo", e.target.value)
                            }
                            className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                          />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <input
                            type="text"
                            value={entry.isp}
                            onChange={(e) =>
                              handleTableEdit(index, "isp", e.target.value)
                            }
                            className="w-full px-2 py-1 border border-gray-300 rounded"
                          />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <input
                            type="text"
                            value={entry.ip}
                            onChange={(e) =>
                              handleTableEdit(index, "ip", e.target.value)
                            }
                            className="w-full px-2 py-1 border border-gray-300 rounded font-mono"
                          />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <input
                            type="text"
                            value={entry.date}
                            onChange={(e) =>
                              handleTableEdit(index, "date", e.target.value)
                            }
                            className="w-full px-2 py-1 border border-gray-300 rounded"
                          />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <input
                            type="text"
                            value={entry.timeRange}
                            onChange={(e) =>
                              handleTableEdit(
                                index,
                                "timeRange",
                                e.target.value
                              )
                            }
                            className="w-full px-2 py-1 border border-gray-300 rounded"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {emailData.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No data available. Please select filters first.
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50 shrink-0 rounded-b-3xl">
          {!showEditTable ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                onClick={resetSelections}
                className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-all duration-200 font-medium text-sm sm:text-base"
              >
                Reset All
              </button>

              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <button
                  onClick={() => setShowEditTable(true)}
                  disabled={emailData.length === 0}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-sm sm:text-base shadow-lg"
                >
                  Edit Table
                </button>
                <button
                  onClick={() => handleComposeEmail(false)}
                  disabled={selectedLinks.length === 0 || loadingISP}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-sm sm:text-base shadow-lg"
                >
                  {loadingISP ? "Loading ISP..." : "Compose Email"}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between w-full">
              <button
                onClick={() => setShowEditTable(false)}
                className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-all duration-200 font-medium text-sm sm:text-base"
              >
                Back to Filters
              </button>

              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <button
                  onClick={() => handleComposeEmail(true)}
                  disabled={emailData.length === 0}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-sm sm:text-base shadow-lg"
                >
                  Compose with Edited Data
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
// Main Analytics Component
const Analytics = ({ stats, links }) => {
  const [selectedLinkId, setSelectedLinkId] = useState(null);
  const [visitLogs, setVisitLogs] = useState([]);
  const [allVisitLogs, setAllVisitLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedIp, setSelectedIp] = useState(null);
  const [showIpModal, setShowIpModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showCSVModal, setShowCSVModal] = useState(false);
  const [loadingAllLogs, setLoadingAllLogs] = useState(false);
  const [showIPDRModal, setShowIPDRModal] = useState(false);
  useEffect(() => {
    if (links && links.length > 0) {
      fetchAllVisitLogs();
    }
  }, [links]);

  const fetchVisitLogs = async (linkId) => {
    if (!linkId) return;

    setLoading(true);
    setError(null);

    try {
      const res = await axios.get(
        `https://api.cleanpc.xyz/api/stats/visits/${linkId}`,
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

  const fetchAllVisitLogs = async () => {
    setLoadingAllLogs(true);
    try {
      const allLogs = [];

      if (links && links.length > 0) {
        for (const link of links) {
          try {
            const res = await axios.get(
              `https://api.cleanpc.xyz/api/stats/visits/${link._id}`,
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              }
            );
            const linkLogs = res.data.docs || res.data;
            if (linkLogs && linkLogs.length > 0) {
              linkLogs.forEach((log) => {
                log.linkId = link._id;
              });
              allLogs.push(...linkLogs);
            }
          } catch (err) {
            console.error(`Failed to load visits for link ${link._id}`, err);
          }
        }
      }

      setAllVisitLogs(allLogs);
      return allLogs;
    } catch (err) {
      console.error("Failed to load all visit logs", err);
      return [];
    } finally {
      setLoadingAllLogs(false);
    }
  };

  // Handle CSV modal open - use pre-fetched data
  const handleCSVModalOpen = () => {
    setShowCSVModal(true);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  useEffect(() => {
    if (selectedLinkId) {
      fetchVisitLogs(selectedLinkId);
    }
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

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-500"></div>
        <p className="text-gray-600 text-lg">Loading analytics data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Control Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-end items-stretch sm:items-center">
        <button
          onClick={() => setShowIPDRModal(true)}
          disabled={loadingAllLogs || !links || links.length === 0}
          className="flex items-center justify-center sm:justify-start space-x-2 w-full sm:w-auto bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-2xl px-4 sm:px-6 py-3.5 sm:py-4 border border-blue-200 shadow-sm hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
        >
          <FiFileText className="w-5 h-5 flex-shrink-0" />
          <span>{loadingAllLogs ? "Loading..." : "IPDR Request"}</span>
        </button>

        <button
          onClick={handleCSVModalOpen}
          disabled={loadingAllLogs || !links || links.length === 0}
          className="flex items-center justify-center sm:justify-start space-x-2 w-full sm:w-auto bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl px-4 sm:px-6 py-3.5 sm:py-4 border border-green-200 shadow-sm hover:from-green-700 hover:to-emerald-700 transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
        >
          <FiDownload className="w-5 h-5 flex-shrink-0" />
          <span>{loadingAllLogs ? "Loading..." : "CSV File"}</span>
        </button>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center justify-center sm:justify-start space-x-2 w-full sm:w-auto bg-white rounded-2xl px-4 sm:px-6 py-3.5 sm:py-4 border border-gray-200 shadow-sm hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
        >
          <FiRefreshCw
            className={`w-5 h-5 text-gray-600 flex-shrink-0 ${
              refreshing ? "animate-spin" : ""
            }`}
          />
          <span className="text-gray-700">
            {refreshing ? "Refreshing..." : "Refresh Data"}
          </span>
        </button>
      </div>

      {/* Summary Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        <MetricCard
          icon={<FiMousePointer className="h-6 w-6" />}
          title="Total Clicks"
          value={stats?.totalClicks || 0}
          color="indigo"
          trend={12}
        />
        <MetricCard
          icon={<FiUsers className="h-6 w-6" />}
          title="Unique Visitors"
          value={stats?.uniqueVisitors || 0}
          color="green"
          trend={8}
        />
      </div>

      {/* Visit Logs Section */}
      <div className="space-y-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
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
            <div className="relative w-full max-w-xs mx-auto">
              <select
                className="
                  w-full bg-gradient-to-r from-white via-gray-50 to-gray-100
                  border border-gray-200 rounded-2xl px-4 py-2.5 pr-10 text-sm text-gray-900
                  focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 shadow-md
                  transition-all duration-200
                  appearance-none
                  outline-none
                  hover:shadow-lg
                  cursor-pointer
                  truncate
                "
                onChange={(e) => setSelectedLinkId(e.target.value)}
                value={selectedLinkId || ""}
                style={{ minWidth: "170px" }}
              >
                <option value="" className="text-gray-400">
                  Select Link to Analyze
                </option>
                {links?.map((link) => (
                  <option
                    key={link._id}
                    value={link._id}
                    className="text-gray-700 truncate"
                  >
                    {link.domain}/
                    {link.shortCode.length > 20
                      ? link.shortCode.substring(0, 20) + "..."
                      : link.shortCode}{" "}
                    ({stats?.clicksByLink?.[link._id] || 0} clicks)
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2">
                <svg
                  className="w-5 h-5 text-indigo-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
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
                  <FiInfo className="w-6 h-6 text-red-500" />
                </div>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-red-800 mb-2">
                  Unable to Load Data
                </h4>
                <p className="text-red-700">{error}</p>
                <button
                  onClick={() => fetchVisitLogs(selectedLinkId)}
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
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
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
                  <FiClock className="w-4 h-4" />
                  <span>Last refreshed: {new Date().toLocaleTimeString()}</span>
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
                      className="hover:bg-gray-50 transition-colors duration-150"
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
                              <FiCamera className="w-3 h-3 mr-1" />
                              Photo
                            </span>
                          )}
                          {visit.hasLocation && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                              <FiMapPin className="w-3 h-3 mr-1" />
                              Location
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
                            <FiEye className="h-3 w-3 mr-1" />
                            Check IP
                          </button>
                          {visit.hasPhoto && (
                            <button
                              onClick={() => handleViewPhoto(visit.photo)}
                              className="inline-flex items-center px-3 py-2 border border-transparent text-xs font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                              <FiCamera className="h-3 w-3 mr-1" />
                              View Photo
                            </button>
                          )}
                          {visit.hasLocation && (
                            <button
                              onClick={() => handleViewLocation(visit.location)}
                              className="inline-flex items-center px-3 py-2 border border-transparent text-xs font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                              <FiMapPin className="h-3 w-3 mr-1" />
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
      {showIPDRModal && (
        <IPDRRequestModal
          links={links}
          visitLogs={allVisitLogs}
          onClose={() => setShowIPDRModal(false)}
        />
      )}
      {/* CSV Download Modal */}
      {showCSVModal && (
        <CSVDownloadModal
          links={links}
          visitLogs={allVisitLogs} // Pass all visit logs, not just current ones
          onClose={() => setShowCSVModal(false)}
        />
      )}
    </div>
  );
};

export default Analytics;
