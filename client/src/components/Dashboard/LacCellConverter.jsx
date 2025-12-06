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
  FiDatabase,
  FiCpu,
  FiLoader,
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
    mnc: "", // Default to Grameenphone
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
  const [apiSource, setApiSource] = useState("UnwiredLabs"); // Track which API is used
  const [apiStatus, setApiStatus] = useState({
    unwiredlabs: false,
    opencellid: false,
  });

  // Bangladesh-specific sample data from your CDR
  const bangladeshSampleData = [
    {
      mcc: "470",
      mnc: "01", // Grameenphone
      lac: "5020",
      cid: "65522",
    },
    {
      mcc: "470",
      mnc: "01",
      lac: "1182",
      cid: "63744",
    },
  ];

  // LAC to approximate area mapping from your CDR data
  const lacAreaMapping = {
    5017: "Mitford Road/Lalbagh Area, Dhaka",
    1182: "Shyampur/Dania Area, Dhaka",
    5020: "Gendaria/Postogola Area, Dhaka",
    5019: "Gandaria/Sutrapur Area, Dhaka",
    60301: "System Tower/SMS Center",
    60331: "System Tower/SMS Center",
    60371: "System Tower/SMS Center",
    60321: "System Tower/SMS Center",
    1203: "New Market/Shahbag Area, Dhaka",
    1111: "Gulistan Area, Dhaka",
  };

  useEffect(() => {
    // Update selected operator when MNC changes
    const operator = bangladeshOperators.find((op) => op.mnc === formData.mnc);
    if (operator) {
      setSelectedOperator(operator);
    }

    // Check API keys on component mount
    checkApiKeys();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.mnc]);

  const checkApiKeys = () => {
    const unwiredKey = import.meta.env.VITE_UNWIREDLABS_API_KEY;
    const opencellidKey = import.meta.env.VITE_OPENCELLID_API_KEY;

    setApiStatus({
      unwiredlabs: !!(
        unwiredKey && unwiredKey !== "your_unwiredlabs_api_key_here"
      ),
      opencellid: !!(
        opencellidKey && opencellidKey !== "your_opencellid_api_key_here"
      ),
    });
  };

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

  // Query Unwired Labs (UnwiredLocation) API
  const queryUnwiredLabsAPI = async () => {
    try {
      const apiKey = import.meta.env.VITE_UNWIREDLABS_API_KEY;

      if (!apiKey || apiKey === "your_unwiredlabs_api_key_here") {
        throw new Error("UnwiredLabs API key not configured");
      }

      // Unwired Labs API endpoint
      const response = await axios.post(
        "https://us1.unwiredlabs.com/v2/process.php",
        {
          token: apiKey,
          radio: "gsm",
          mcc: parseInt(formData.mcc),
          mnc: parseInt(formData.mnc),
          cells: [
            {
              lac: parseInt(formData.lac),
              cid: parseInt(formData.cid),
            },
          ],
          address: 1, // Get address information
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 15000,
        }
      );

      console.log("UnwiredLabs API Response:", response.data);
      return response.data;
    } catch (error) {
      console.error("UnwiredLabs API Error:", error);
      throw error;
    }
  };

  // Fallback: Try OpenCellID if UnwiredLabs fails
  const queryOpenCellID = async () => {
    try {
      const apiKey = import.meta.env.VITE_OPENCELLID_API_KEY;

      if (!apiKey || apiKey === "your_opencellid_api_key_here") {
        return null;
      }

      const response = await axios.get("https://opencellid.org/cell/get", {
        params: {
          key: apiKey,
          mcc: parseInt(formData.mcc),
          mnc: parseInt(formData.mnc),
          lac: parseInt(formData.lac),
          cellid: parseInt(formData.cid),
          format: "json",
        },
        timeout: 10000,
      });

      console.log("OpenCellID Fallback Response:", response.data);
      return response.data;
    } catch (error) {
      console.log("OpenCellID fallback failed:", error.message);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setMapUrl("");
    setError("");
    setApiSource("UnwiredLabs");

    try {
      // Validate inputs
      if (!formData.mcc || !formData.mnc || !formData.lac || !formData.cid) {
        toast.error("Please fill in all fields");
        setLoading(false);
        return;
      }

      const operator = bangladeshOperators.find(
        (op) => op.mnc === formData.mnc
      ) || { name: "Unknown Operator" };

      // Show loading toast
      const loadingToast = toast.loading(`Locating ${operator.name} tower...`);

      // First try Unwired Labs API
      let apiResponse;
      try {
        apiResponse = await queryUnwiredLabsAPI();
        console.log("UnwiredLabs Response:", apiResponse);
      } catch (unwiredError) {
        console.log("UnwiredLabs failed, trying OpenCellID...");
        toast.loading("Trying alternative database...", { id: loadingToast });
        apiResponse = await queryOpenCellID();
        setApiSource("OpenCellID");
      }

      // Dismiss loading toast
      toast.dismiss(loadingToast);

      // Process API response
      if (apiResponse && apiResponse.status === "ok") {
        // Unwired Labs successful response
        setResult({
          latitude: apiResponse.lat,
          longitude: apiResponse.lon,
          accuracy: apiResponse.accuracy
            ? `${apiResponse.accuracy} meters`
            : "Unknown",
          address: apiResponse.address || "Not available",
          balance: apiResponse.balance || 0,
          status: "success",
          network: `${formData.mcc}-${formData.mnc}`,
          cellId: `${formData.lac}-${formData.cid}`,
          operatorName: operator.name,
          source: apiSource,
          area: lacAreaMapping[formData.lac] || "Unknown area",
          message: apiResponse.message || "Success",
        });

        const url = `https://www.google.com/maps?q=${apiResponse.lat},${apiResponse.lon}&z=15`;
        setMapUrl(url);

        toast.success(`Location found using ${apiSource}!`);
      } else if (apiResponse && apiResponse.lat && apiResponse.lon) {
        // OpenCellID successful response
        setResult({
          latitude: apiResponse.lat,
          longitude: apiResponse.lon,
          accuracy: apiResponse.accuracy
            ? `${apiResponse.accuracy} meters`
            : "Unknown",
          address: "Not available from OpenCellID",
          balance: "N/A",
          status: "success",
          network: `${formData.mcc}-${formData.mnc}`,
          cellId: `${formData.lac}-${formData.cid}`,
          operatorName: operator.name,
          source: apiSource,
          area: lacAreaMapping[formData.lac] || "Unknown area",
          samples: apiResponse.samples || 0,
          message: "Success",
        });

        const url = `https://www.google.com/maps?q=${apiResponse.lat},${apiResponse.lon}&z=15`;
        setMapUrl(url);

        toast.success(`Location found using ${apiSource}!`);
      } else {
        // No data found
        let errorMsg = "Cell tower not found in databases";

        if (apiResponse?.message) {
          errorMsg = apiResponse.message;
        } else if (apiResponse?.error) {
          errorMsg = apiResponse.error;
        }

        setError(errorMsg);

        // Show approximate area from LAC mapping if available
        if (lacAreaMapping[formData.lac]) {
          setResult({
            latitude: null,
            longitude: null,
            accuracy: "Area approximation only",
            address: lacAreaMapping[formData.lac],
            status: "approximate",
            network: `${formData.mcc}-${formData.mnc}`,
            cellId: `${formData.lac}-${formData.cid}`,
            operatorName: operator.name,
            source: "CDR Area Mapping",
            area: lacAreaMapping[formData.lac],
            note: "Exact coordinates not found. Showing approximate area from CDR data.",
          });
          toast(`Showing approximate area: ${lacAreaMapping[formData.lac]}`, {
            icon: "⚠️",
          });
        } else {
          toast.error("Cell tower not found in any database");
        }
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);

      let errorMessage = "Failed to fetch location data";

      if (error.response) {
        if (error.response.status === 401) {
          errorMessage =
            "Invalid API key. Please check your UnwiredLabs API key.";
        } else if (error.response.status === 402) {
          errorMessage =
            "Insufficient balance. Please top up your UnwiredLabs account.";
        } else if (error.response.status === 403) {
          errorMessage = "Access forbidden. Check your API permissions.";
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data?.error) {
          errorMessage = error.response.data.error;
        }
      } else if (error.request) {
        errorMessage =
          "No response from server. Check your internet connection.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const resetForm = () => {
    setFormData({ mcc: "470", mnc: "", lac: "", cid: "" });
    setResult(null);
    setMapUrl("");
    setError("");
    setApiSource("UnwiredLabs");
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
    if (!lat || !lon) return;
    const bdMapsUrl = `https://www.google.com/maps/@${lat},${lon},15z`;
    window.open(bdMapsUrl, "_blank");
  };

  const openUnwiredLabsDashboard = () => {
    window.open("https://my.unwiredlabs.com/dashboard", "_blank");
  };

  const testUnwiredLabsConnection = async () => {
    try {
      const apiKey = import.meta.env.VITE_UNWIREDLABS_API_KEY;

      if (!apiKey || apiKey === "your_unwiredlabs_api_key_here") {
        toast.error("UnwiredLabs API key not configured");
        return;
      }

      toast.loading("Testing UnwiredLabs connection...");

      // Test with a known cell (using sample data)
      const testResponse = await axios.post(
        "https://us1.unwiredlabs.com/v2/process.php",
        {
          token: apiKey,
          radio: "gsm",
          mcc: 470,
          mnc: 1,
          cells: [
            {
              lac: 5017,
              cid: 29456,
            },
          ],
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 10000,
        }
      );

      toast.dismiss();

      if (testResponse.data.status === "ok") {
        toast.success("UnwiredLabs API is working correctly!");
        console.log("Test response:", testResponse.data);
      } else {
        toast.error(`API returned: ${testResponse.data.message}`);
      }
    } catch (error) {
      toast.dismiss();
      toast.error(`Connection test failed: ${error.message}`);
    }
  };

  return (
    <div className="mx-auto p-4">
      {/* Header with Bangladesh flag */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">
              Cell Tower Locator
            </h1>
          </div>
        </div>
        <p className="text-gray-600 mt-2">
          Convert LAC (Location Area Code) and Cell ID to geographic coordinates
        </p>

        {/* Country and API Info */}
        <div className="flex flex-wrap gap-2 mt-3">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <FiGlobe className="mr-2" />
            Country: Bangladesh (MCC: 470)
          </div>
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
              {bangladeshSampleData.map((sample, index) => (
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
                  Unique cell identifier
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading || !apiStatus.unwiredlabs}
                  className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Querying {apiSource}...
                    </span>
                  ) : !apiStatus.unwiredlabs ? (
                    "Configure API Key First"
                  ) : (
                    " Locate Cell Tower"
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
                <span className="font-medium">API Error</span>
              </div>
              <p className="text-sm text-red-700">{error}</p>
              <p className="text-xs text-red-600 mt-2">
                <span className="font-medium">Tips:</span>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>Verify LAC and CID </li>
                  <li>Try different LAC/CID combinations</li>
                  <li>Make sure MNC is correct</li>
                </ul>
              </p>
            </div>
          )}
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
                    <p className="text-sm opacity-80">
                      {result.status === "success"
                        ? "Cell Tower Located"
                        : "Approximate Area"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono">{result.network}</p>
                    <p className="text-xs opacity-70">
                      LAC-CID: {result.cellId}
                    </p>
                  </div>
                </div>
              </div>

              {result.status === "success" ? (
                <>
                  {/* Coordinates */}
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-5">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Geographic Coordinates
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
                          copyToClipboard(
                            `${result.latitude}, ${result.longitude}`
                          )
                        }
                        className="w-full py-2.5 text-sm font-medium rounded-lg bg-gray-800 text-white hover:bg-gray-900 transition-colors"
                      >
                        Copy Both Coordinates
                      </button>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                      <p className="text-sm text-blue-600">Accuracy</p>
                      <p className="text-lg font-semibold text-blue-800">
                        {result.accuracy}
                      </p>
                    </div>

                    {result.balance && typeof result.balance === "number" && (
                      <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                        <p className="text-sm text-green-600">API Balance</p>
                        <p className="text-lg font-semibold text-green-800">
                          {result.balance.toLocaleString()} credits
                        </p>
                      </div>
                    )}
                    <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                      <p className="text-sm text-green-600">Status</p>
                      <p className="text-lg font-semibold text-green-600">
                        Located ✓
                      </p>
                    </div>
                  </div>

                  {/* Address Information */}
                  {result.address && result.address !== "Not available" && (
                    <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                      <h4 className="font-medium text-yellow-800 mb-2">
                        Address
                      </h4>
                      <p className="text-sm text-yellow-700">
                        {result.address}
                      </p>
                    </div>
                  )}

                  {/* Map Actions */}
                  {result.latitude && result.longitude && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 gap-3">
                        <a
                          href={`https://www.google.com/maps?q=${result.latitude},${result.longitude}&z=15`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block bg-red-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-red-700 transition-colors text-center"
                        >
                          🗺️ Google Maps
                        </a>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* Approximate Location Display */
                <div className="space-y-4">
                  <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                    <h3 className="font-semibold text-yellow-800 mb-2">
                      ⚠️ Approximate Location Only
                    </h3>
                    <p className="text-sm text-yellow-700 mb-3">
                      {result.note || "Exact coordinates not found "}
                    </p>
                    <div className="bg-white p-3 rounded-lg border">
                      <h4 className="font-medium text-gray-900 mb-1">
                        Approximate Area:
                      </h4>
                      <p className="text-lg font-semibold text-gray-800">
                        {result.area || result.address}
                      </p>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-xl">
                    <h4 className="font-medium text-blue-800 mb-2">
                      Why approximate?
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• This specific cell tower is not in the database</li>
                      <li>• The LAC area is known from CDR address patterns</li>
                      <li>• Try neighboring cell IDs for exact location</li>
                    </ul>
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
                {!apiStatus.unwiredlabs ? (
                  <>Fix the error locate cell towers</>
                ) : (
                  "Enter LAC and Cell ID  to locate the cell tower"
                )}
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default LacCellConverter;
