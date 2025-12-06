/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  FiMapPin,
  FiNavigation,
  FiCopy,
  FiCheck,
  FiAlertCircle,
  FiGlobe,
} from "react-icons/fi";
import { toast } from "react-hot-toast";

const LacCellConverter = () => {
  // Bangladesh operator information
  const bangladeshOperators = [
    {
      mcc: "470",
      mnc: "01",
      name: "Grameenphone",
      color: "bg-green-100 text-green-800",
    },
    { mcc: "470", mnc: "02", name: "Robi", color: "bg-red-100 text-red-800" },
    {
      mcc: "470",
      mnc: "03",
      name: "Banglalink",
      color: "bg-yellow-100 text-yellow-800",
    },
    {
      mcc: "470",
      mnc: "04",
      name: "Teletalk",
      color: "bg-blue-100 text-blue-800",
    },
    {
      mcc: "470",
      mnc: "06",
      name: "Airtel",
      color: "bg-purple-100 text-purple-800",
    },
    {
      mcc: "470",
      mnc: "07",
      name: "Citycell",
      color: "bg-pink-100 text-pink-800",
    },
  ];

  const [formData, setFormData] = useState({
    mcc: "470", // Default MCC for Bangladesh
    mnc: "01", // Default to Grameenphone
    lac: "",
    cid: "",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [mapUrl, setMapUrl] = useState("");
  const [error, setError] = useState("");
  const [selectedOperator, setSelectedOperator] = useState(
    bangladeshOperators[0]
  );

  // Bangladesh-specific sample data from your CDR
  const bangladeshSampleData = [
    {
      mcc: "470",
      mnc: "01", // Grameenphone
      lac: "5020",
      cid: "65522",
      description: "Dhaka - Grameenphone (From CDR)",
      area: "Gendaria, Dhaka",
    },
    {
      mcc: "470",
      mnc: "01",
      lac: "1182",
      cid: "63744",
      description: "Dhaka - Grameenphone Cell",
      area: "Shyampur, Dhaka",
    },
    {
      mcc: "470",
      mnc: "01",
      lac: "5017",
      cid: "29456",
      description: "Dhaka - Mitford Road",
      area: "Monwara Mansion, Dhaka",
    },
    {
      mcc: "470",
      mnc: "02",
      lac: "12345",
      cid: "67890",
      description: "Sample - Robi",
      area: "Sample area",
    },
  ];

  useEffect(() => {
    // Update selected operator when MNC changes
    const operator = bangladeshOperators.find((op) => op.mnc === formData.mnc);
    if (operator) {
      setSelectedOperator(operator);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.mnc]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value.replace(/\D/g, ""), // Only allow numbers
    }));
  };

  const handleOperatorChange = (mnc) => {
    setFormData((prev) => ({
      ...prev,
      mnc: mnc,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setMapUrl("");
    setError("");

    try {
      // Validate inputs
      if (!formData.mcc || !formData.mnc || !formData.lac || !formData.cid) {
        toast.error("Please fill in all fields");
        setLoading(false);
        return;
      }

      // Validate Bangladesh MCC
      if (formData.mcc !== "470") {
        toast.warning(
          "MCC changed from Bangladesh (470). Make sure this is correct."
        );
      }

      // Get API key from environment variable
      const apiKey = import.meta.env.VITE_OPENCELLID_API_KEY;

      if (!apiKey || apiKey === "your_api_key_here") {
        toast.error(
          "API key not configured. Please add your OpenCellID API key."
        );
        setLoading(false);
        return;
      }

      console.log("Querying OpenCellID with:", {
        mcc: parseInt(formData.mcc),
        mnc: parseInt(formData.mnc),
        lac: parseInt(formData.lac),
        cellid: parseInt(formData.cid),
      });

      // Make API call to OpenCellID
      const response = await axios.get("https://opencellid.org/cell/get", {
        params: {
          key: apiKey,
          mcc: parseInt(formData.mcc),
          mnc: parseInt(formData.mnc),
          lac: parseInt(formData.lac),
          cellid: parseInt(formData.cid),
          format: "json",
        },
        timeout: 15000,
      });

      console.log("OpenCellID Response:", response.data);

      if (response.data && response.data.lat && response.data.lon) {
        // Success - we have coordinates
        const operator = bangladeshOperators.find(
          (op) => op.mnc === formData.mnc
        ) || { name: "Unknown Operator" };

        setResult({
          latitude: response.data.lat,
          longitude: response.data.lon,
          accuracy: response.data.accuracy || "Unknown",
          range: response.data.range || "Unknown",
          samples: response.data.samples || 0,
          status: "success",
          network: `${formData.mcc}-${formData.mnc}`,
          cellId: `${formData.lac}-${formData.cid}`,
          operatorName: operator.name,
          created: response.data.created || "Unknown",
          updated: response.data.updated || "Unknown",
        });

        // Generate Google Maps URL
        const url = `https://www.google.com/maps?q=${response.data.lat},${response.data.lon}&z=15`;
        setMapUrl(url);

        toast.success(`Location found for ${operator.name}!`);
      } else if (response.data?.error) {
        // API returned an error
        setError(response.data.error);
        toast.error(`API Error: ${response.data.error}`);
      } else {
        // No data found
        setError(
          "No location data found for this cell tower in OpenCellID database"
        );
        toast.error("Cell tower not found in database");
      }
    } catch (error) {
      console.error("Error calling OpenCellID API:", error);

      let errorMessage = "Failed to fetch location data";

      if (error.response) {
        if (error.response.status === 400) {
          errorMessage = "Invalid request parameters";
        } else if (error.response.status === 401) {
          errorMessage = "Invalid or missing API key";
        } else if (error.response.status === 404) {
          errorMessage = "Cell tower not found in OpenCellID database";
        } else if (error.response.status === 429) {
          errorMessage = "API rate limit exceeded. Please wait and try again.";
        } else if (error.response.data?.error) {
          errorMessage = error.response.data.error;
        }
      } else if (error.request) {
        errorMessage =
          "No response from server. Check your internet connection.";
      } else if (error.code === "ECONNABORTED") {
        errorMessage = "Request timeout. Please try again.";
      }

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const resetForm = () => {
    setFormData({ mcc: "470", mnc: "01", lac: "", cid: "" });
    setResult(null);
    setMapUrl("");
    setError("");
  };

  const loadSampleData = (sample) => {
    setFormData({
      mcc: sample.mcc,
      mnc: sample.mnc,
      lac: sample.lac,
      cid: sample.cid,
    });
    toast.success(`Loaded: ${sample.description} (${sample.area})`);
  };

  const openInBdMap = (lat, lon) => {
    // Bangladeshi mapping services
    const bdMapsUrl = `https://www.google.com/maps/@${lat},${lon},15z`;
    window.open(bdMapsUrl, "_blank");
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Header with Bangladesh flag */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-green-600 relative">
            <div
              className="absolute w-8 h-8 bg-green-600 rounded-full"
              style={{ left: "12px" }}
            ></div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Bangladesh Cell Tower Locator
          </h1>
        </div>
        <p className="text-gray-600 mt-2">
          Convert LAC (Location Area Code) and Cell ID to geographic coordinates
          for Bangladeshi mobile networks
        </p>

        {/* Country Info */}
        <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
          <FiGlobe className="mr-2" />
          Country: Bangladesh (MCC: 470)
        </div>

        {/* API Key Status */}
        <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 ml-2">
          <FiAlertCircle className="mr-2" />
          API Key:{" "}
          {import.meta.env.VITE_OPENCELLID_API_KEY &&
          import.meta.env.VITE_OPENCELLID_API_KEY !== "your_api_key_here"
            ? "Configured"
            : "Not configured"}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <FiNavigation className="w-6 h-6 text-indigo-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              Cell Tower Information
            </h2>
          </div>

          {/* Bangladesh Operator Selection */}
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-2">
              Select Mobile Operator in Bangladesh:
            </p>
            <div className="flex flex-wrap gap-2">
              {bangladeshOperators.map((operator) => (
                <motion.button
                  key={operator.mnc}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleOperatorChange(operator.mnc)}
                  className={`px-3 py-2 text-sm rounded-lg transition-all ${
                    formData.mnc === operator.mnc
                      ? "ring-2 ring-offset-2 ring-indigo-500 " + operator.color
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  }`}
                >
                  {operator.name}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Selected Operator Info */}
          <div
            className={`mb-6 p-4 rounded-xl ${selectedOperator.color
              .replace("text-", "bg-")
              .replace("800", "100")}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">{selectedOperator.name}</h3>
                <p className="text-sm opacity-80">
                  MCC: 470 | MNC: {selectedOperator.mnc}
                </p>
              </div>
              <span
                className={`px-2 py-1 text-xs rounded-full ${selectedOperator.color}`}
              >
                Selected
              </span>
            </div>
          </div>

          {/* Sample Data from CDR */}
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-2">
              Quick samples from CDR data (Grameenphone):
            </p>
            <div className="grid grid-cols-2 gap-2">
              {bangladeshSampleData
                .filter((sample) => sample.mnc === "01") // Show only Grameenphone samples
                .map((sample, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => loadSampleData(sample)}
                    className="px-3 py-2 text-xs rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors text-left"
                  >
                    <div className="font-medium">{sample.description}</div>
                    <div className="text-xs text-gray-500">
                      LAC: {sample.lac} | CID: {sample.cid}
                    </div>
                    <div className="text-xs text-gray-400 truncate">
                      {sample.area}
                    </div>
                  </motion.button>
                ))}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* MCC (Fixed for Bangladesh) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mobile Country Code (MCC)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="mcc"
                    value={formData.mcc}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50 font-mono"
                    maxLength="3"
                    required
                    readOnly
                  />
                  <div className="absolute right-3 top-3">
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      Bangladesh
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Fixed for Bangladesh (470)
                </p>
              </div>

              {/* MNC (Editable) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mobile Network Code (MNC)
                </label>
                <input
                  type="text"
                  name="mnc"
                  value={formData.mnc}
                  onChange={handleChange}
                  placeholder="01 for Grameenphone"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all font-mono"
                  maxLength="2"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  2-digit operator code
                </p>
              </div>

              {/* LAC */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location Area Code (LAC)
                </label>
                <input
                  type="text"
                  name="lac"
                  value={formData.lac}
                  onChange={handleChange}
                  placeholder="e.g., 5020, 1182, 5017"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all font-mono"
                  maxLength="5"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Location area identifier (from CDR)
                </p>
              </div>

              {/* CID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cell ID (CID)
                </label>
                <input
                  type="text"
                  name="cid"
                  value={formData.cid}
                  onChange={handleChange}
                  placeholder="e.g., 65522, 63744, 29456"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all font-mono"
                  maxLength="5"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Unique cell identifier (from CDR)
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Querying OpenCellID...
                    </span>
                  ) : (
                    "📍 Locate Cell Tower"
                  )}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 rounded-xl font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Reset
                </motion.button>
              </div>
            </div>
          </form>

          {/* Error Display */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 rounded-xl border border-red-200">
              <div className="flex items-center gap-2 text-red-800 mb-2">
                <FiAlertCircle className="w-5 h-5" />
                <span className="font-medium">Location Not Found</span>
              </div>
              <p className="text-sm text-red-700">{error}</p>
              <p className="text-xs text-red-600 mt-2">
                Tips:
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>Verify LAC and CID from CDR data</li>
                  <li>
                    Some cell towers may not be in the OpenCellID database
                  </li>
                  <li>Try different LAC/CID combinations</li>
                  <li>Check operator MNC code (01 for Grameenphone)</li>
                </ul>
              </p>
            </div>
          )}

          {/* CDR Data Tips */}
          <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <h3 className="text-sm font-medium text-blue-800 mb-1">
              📋 Using CDR Data (Call Detail Records)
            </h3>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• LAC = "LAC ID" column in your CDR file</li>
              <li>• Cell ID = "Cell ID" column in your CDR file</li>
              <li>• MCC for Bangladesh is always 470</li>
              <li>• MNC: 01 for Grameenphone (as shown in your data)</li>
              <li>• Each row in CDR represents a call/SMS from a cell tower</li>
            </ul>
          </div>
        </motion.div>

        {/* Results Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 rounded-lg">
              <FiMapPin className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              Location Results
            </h2>
          </div>

          {result ? (
            <div className="space-y-6">
              {/* Operator Info */}
              <div
                className={`p-4 rounded-xl ${selectedOperator.color
                  .replace("text-", "bg-")
                  .replace("800", "100")}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{result.operatorName}</h3>
                    <p className="text-sm opacity-80">Cell Tower Located</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono">{result.network}</p>
                    <p className="text-xs opacity-70">
                      LAC-CID: {result.cellId}
                    </p>
                  </div>
                </div>
              </div>

              {/* Coordinates */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  📍 Geographic Coordinates
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">Latitude</p>
                    <div className="flex items-center justify-between bg-white p-3 rounded-lg border">
                      <code className="text-lg font-mono font-bold text-gray-900">
                        {parseFloat(result.latitude).toFixed(6)}
                      </code>
                      <button
                        onClick={() =>
                          copyToClipboard(result.latitude.toString())
                        }
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Copy latitude"
                      >
                        {copied ? (
                          <FiCheck className="w-4 h-4 text-green-600" />
                        ) : (
                          <FiCopy className="w-4 h-4 text-gray-500" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">Longitude</p>
                    <div className="flex items-center justify-between bg-white p-3 rounded-lg border">
                      <code className="text-lg font-mono font-bold text-gray-900">
                        {parseFloat(result.longitude).toFixed(6)}
                      </code>
                      <button
                        onClick={() =>
                          copyToClipboard(result.longitude.toString())
                        }
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Copy longitude"
                      >
                        {copied ? (
                          <FiCheck className="w-4 h-4 text-green-600" />
                        ) : (
                          <FiCopy className="w-4 h-4 text-gray-500" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Copy Both Button */}
                <div className="mt-4">
                  <button
                    onClick={() =>
                      copyToClipboard(`${result.latitude}, ${result.longitude}`)
                    }
                    className="w-full py-2.5 text-sm font-medium rounded-lg bg-gray-800 text-white hover:bg-gray-900 transition-colors"
                  >
                    📋 Copy Both Coordinates
                  </button>
                </div>
              </div>

              {/* Additional Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <p className="text-sm text-blue-600">Accuracy</p>
                  <p className="text-lg font-semibold text-blue-800">
                    {result.accuracy === "Unknown"
                      ? result.accuracy
                      : `${result.accuracy} meters`}
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <p className="text-sm text-blue-600">Samples in DB</p>
                  <p className="text-lg font-semibold text-blue-800">
                    {result.samples}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    {result.samples > 100
                      ? "Good coverage"
                      : result.samples > 10
                      ? "Moderate coverage"
                      : "Limited data"}
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <p className="text-sm text-blue-600">Cell Range</p>
                  <p className="text-lg font-semibold text-blue-800">
                    {result.range === "Unknown"
                      ? result.range
                      : `${result.range} meters`}
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <p className="text-sm text-blue-600">Status</p>
                  <p className="text-lg font-semibold text-green-600">
                    Located ✓
                  </p>
                </div>
              </div>

              {/* Map Actions */}
              {mapUrl && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <a
                      href={mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block bg-red-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-red-700 transition-colors text-center"
                    >
                      🗺️ Google Maps
                    </a>
                    <button
                      onClick={() =>
                        openInBdMap(result.latitude, result.longitude)
                      }
                      className="bg-green-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-green-700 transition-colors text-center"
                    >
                      🇧🇩 Open Map
                    </button>
                  </div>

                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      Use these coordinates for investigation or mapping
                    </p>
                  </div>
                </div>
              )}

              {/* Cell Tower Details */}
              <div className="bg-gray-50 p-4 rounded-xl">
                <h4 className="font-medium text-gray-900 mb-2">
                  Cell Tower Details
                </h4>
                <div className="text-sm text-gray-600 grid grid-cols-2 gap-2">
                  <div>
                    Operator:{" "}
                    <span className="font-medium">{result.operatorName}</span>
                  </div>
                  <div>
                    MCC-MNC:{" "}
                    <span className="font-medium">{result.network}</span>
                  </div>
                  <div>
                    LAC: <span className="font-medium">{formData.lac}</span>
                  </div>
                  <div>
                    Cell ID: <span className="font-medium">{formData.cid}</span>
                  </div>
                  {result.created !== "Unknown" && (
                    <div className="col-span-2">
                      First sample:{" "}
                      <span className="font-medium">{result.created}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <FiMapPin className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No location data yet
              </h3>
              <p className="text-gray-600 max-w-sm mx-auto mb-4">
                Enter LAC and Cell ID from CDR data to locate the cell tower
              </p>

              {/* Example from CDR */}
              <div className="bg-gray-50 p-4 rounded-xl max-w-sm mx-auto">
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Example from your CDR:
                </h4>
                <div className="text-xs text-gray-600 space-y-1">
                  <div className="flex justify-between">
                    <span>LAC ID:</span>
                    <code className="font-mono">5020</code>
                  </div>
                  <div className="flex justify-between">
                    <span>Cell ID:</span>
                    <code className="font-mono">65522</code>
                  </div>
                  <div className="flex justify-between">
                    <span>Operator:</span>
                    <code className="font-mono">Grameenphone (01)</code>
                  </div>
                  <div className="flex justify-between">
                    <span>Address in CDR:</span>
                    <span className="text-right">Gendaria, Dhaka</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* API Integration Note */}
          {!result && !error && (
            <div className="mt-8 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
              <h3 className="text-sm font-medium text-yellow-800 mb-1">
                ⚠️ Required: OpenCellID API Key
              </h3>
              <p className="text-xs text-yellow-700">
                To locate Bangladeshi cell towers, you need an OpenCellID API
                key:
              </p>
              <ol className="text-xs text-yellow-700 mt-2 space-y-1 list-decimal pl-4">
                <li>
                  Get free API key from{" "}
                  <a
                    href="https://opencellid.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline font-medium"
                  >
                    opencellid.org
                  </a>
                </li>
                <li>
                  Create <code>.env.local</code> file in project root
                </li>
                <li>
                  Add: <code>VITE_OPENCELLID_API_KEY=your_key_here</code>
                </li>
                <li>Restart development server</li>
              </ol>
              <p className="text-xs text-yellow-700 mt-2">
                Note: OpenCellID has limited coverage in Bangladesh. Some cell
                towers may not be in the database.
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Bottom Info Section - Bangladesh Specific */}
      <div className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 border border-green-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          🇧🇩 Bangladesh Mobile Network Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">MCC for Bangladesh</h4>
            <p className="text-sm text-gray-700">
              All mobile operators in Bangladesh use MCC:{" "}
              <code className="bg-gray-100 px-1 rounded">470</code>
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Major Operators</h4>
            <div className="text-sm text-gray-700 space-y-1">
              <div className="flex justify-between">
                <span>Grameenphone:</span>
                <code className="font-mono">MNC 01</code>
              </div>
              <div className="flex justify-between">
                <span>Robi:</span>
                <code className="font-mono">MNC 02</code>
              </div>
              <div className="flex justify-between">
                <span>Banglalink:</span>
                <code className="font-mono">MNC 03</code>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">CDR Data Structure</h4>
            <p className="text-sm text-gray-700">
              Your CDR shows LAC in "LAC ID" column and Cell ID in "Cell ID"
              column. All records show operator as "GRAMEENPHONE" (MNC: 01).
            </p>
          </div>
        </div>

        {/* CDR Data Tips */}
        <div className="mt-4 p-4 bg-white rounded-xl border">
          <h4 className="font-medium text-gray-900 mb-2">
            📊 How to use with your CDR data:
          </h4>
          <ol className="text-sm text-gray-700 space-y-2 list-decimal pl-5">
            <li>Find "LAC ID" and "Cell ID" from any row in your Excel file</li>
            <li>Set MNC to "01" for Grameenphone (all your records)</li>
            <li>MCC is automatically set to 470 for Bangladesh</li>
            <li>Click "Locate Cell Tower" to find the geographic location</li>
            <li>Use results for investigation, mapping, or analysis</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default LacCellConverter;
