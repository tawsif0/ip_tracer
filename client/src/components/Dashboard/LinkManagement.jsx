/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import {
  PlusIcon,
  TrashIcon,
  LinkIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  ChartBarIcon,
  QrCodeIcon,
  PencilIcon,
  CameraIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import { FiCopy } from "react-icons/fi";

// ===== CONFIG =====
const API_BASE_URL = "https://api.cleanpc.xyz";

const makePublicUrl = (domain, shortCode) => `https://${domain}/${shortCode}`;

const LinkManagement = ({
  links,
  setLinks,
  onLinkCreated,
  permissions = {},
}) => {
  const {
    register,
    handleSubmit,
    reset,
    getValues,
    watch,
    formState: { errors, isValid },
  } = useForm({
    defaultValues: {
      domain: "",
      shortCode: "",
      originalUrl: "",
      enableCamera: false,
      enableLocation: false,
    },
    mode: "onChange",
  });

  const [isCreating, setIsCreating] = useState(false);
  const [newLink, setNewLink] = useState("");
  const [copiedLinks, setCopiedLinks] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [availableDomains, setAvailableDomains] = useState([]);
  const [userPermissions, setUserPermissions] = useState(permissions);
  const watchShortCode = watch("shortCode");
  const watchEnableCamera = watch("enableCamera");
  const watchEnableLocation = watch("enableLocation");
  const watchDomain = watch("domain");

  // Update permissions when props change
  useEffect(() => {
    setUserPermissions(permissions);
  }, [permissions]);

  // Fetch user data and extract domains
  useEffect(() => {
    const fetchUserDomains = async () => {
      try {
        const token = localStorage.getItem("token");

        // Fetch domains from API
        const response = await axios.get(
          `${API_BASE_URL}/api/domains/user/available`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // The API now returns an array of domain names
        const domains =
          response.data.length > 0 ? response.data : ["cleanpc.xyz"];
        setAvailableDomains(domains);

        if (domains.length > 0) {
          reset({
            ...getValues(),
            domain: domains[0],
          });
        }
      } catch (error) {
        console.error("Error fetching user domains:", error);
      }
    };

    fetchUserDomains();
  }, [reset, getValues]);

  // Refresh user permissions
  const refreshUserPermissions = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (response.data.permissions) {
        setUserPermissions(response.data.permissions);
      }
    } catch (error) {
      console.error("Failed to refresh permissions:", error);
    }
  };

  const onSubmit = async (data) => {
    // Check if user has permission for selected options
    if (data.enableCamera && !userPermissions?.cameraAccess) {
      toast.error("Camera access permission has been removed by admin");
      return;
    }

    if (data.enableLocation && !userPermissions?.locationAccess) {
      toast.error("Location access permission has been removed by admin");
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading("Creating your link...");

    try {
      const requestData = {
        originalUrl: data.originalUrl,
        domain: data.domain,
        shortCode: data.shortCode.trim(),
        enableCamera: data.enableCamera,
        enableLocation: data.enableLocation,
      };

      const response = await axios.post(
        `${API_BASE_URL}/api/links`,
        requestData,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      const { shortCode, domain } = response.data;
      const shortUrl = makePublicUrl(domain || data.domain, shortCode);

      setNewLink(shortUrl);
      setLinks([...(links || []), response.data]);
      reset({
        domain: getValues("domain"),
        shortCode: "",
        originalUrl: "",
        enableCamera: false,
        enableLocation: false,
      });
      setIsCreating(false);

      toast.success("Link created successfully!", {
        id: toastId,
        duration: 4000,
      });
      onLinkCreated?.();
    } catch (error) {
      if (error.response?.data?.error === "Short code already exists") {
        toast.error(
          "This custom short code is already taken. Please choose a different one.",
          {
            id: toastId,
            duration: 5000,
          }
        );
      } else {
        toast.error(error?.response?.data?.error || "Failed to create link", {
          id: toastId,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const toastId = toast.loading("Deleting link...");

    try {
      await axios.delete(`${API_BASE_URL}/api/links/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      setLinks((prev) => prev.filter((l) => l._id !== id));
      toast.success("Link deleted successfully!", {
        id: toastId,
        duration: 3000,
      });
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to delete link", {
        id: toastId,
      });
    }
  };

  const handleCopy = (link) => {
    const domain = link.domain || availableDomains[0];
    const linkToCopy = makePublicUrl(domain, link.shortCode);
    navigator.clipboard.writeText(linkToCopy);

    setCopiedLinks((c) => ({ ...c, [link.shortCode]: true }));
    toast.success("Link copied to clipboard!", {
      duration: 2000,
      icon: <FiCopy />,
    });

    setTimeout(() => {
      setCopiedLinks((c) => ({ ...c, [link.shortCode]: false }));
    }, 2000);
  };

  const generateRandomCode = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    };
    return date.toLocaleDateString("en-US", options);
  };

  const handleEdit = async (data) => {
    // Check if user has permission for selected options
    if (data.enableCamera && !userPermissions?.cameraAccess) {
      toast.error("Camera access permission has been removed by admin");
      return;
    }

    if (data.enableLocation && !userPermissions?.locationAccess) {
      toast.error("Location access permission has been removed by admin");
      return;
    }

    setIsUpdating(true);
    const toastId = toast.loading("Updating your link...");

    try {
      const requestData = {
        originalUrl: data.originalUrl,
        domain: data.domain,
        shortCode: data.shortCode.trim(),
        enableCamera: data.enableCamera,
        enableLocation: data.enableLocation,
      };

      const response = await axios.put(
        `${API_BASE_URL}/api/links/${editingLink._id}`,
        requestData,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      // Update the link in the local state
      setLinks((prev) =>
        prev.map((link) =>
          link._id === editingLink._id ? response.data : link
        )
      );

      setEditingLink(null);
      reset();
      toast.success("Link updated successfully!", {
        id: toastId,
        duration: 4000,
      });
    } catch (error) {
      if (error.response?.data?.error === "Short code already exists") {
        toast.error(
          "This custom short code is already taken. Please choose a different one.",
          {
            id: toastId,
            duration: 5000,
          }
        );
      } else {
        toast.error(error?.response?.data?.error || "Failed to update link", {
          id: toastId,
        });
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const startEditing = (link) => {
    setEditingLink(link);
    setIsCreating(false); // Close create form if open

    // Refresh permissions before editing
    refreshUserPermissions();

    // Pre-fill the form with existing data
    reset({
      domain: link.domain || availableDomains[0],
      shortCode: link.shortCode,
      originalUrl: link.originalUrl,
      enableCamera:
        link.enableCamera && userPermissions?.cameraAccess ? true : false,
      enableLocation:
        link.enableLocation && userPermissions?.locationAccess ? true : false,
    });
  };

  const cancelEditing = () => {
    setEditingLink(null);
    reset({
      domain: getValues("domain"),
      shortCode: "",
      originalUrl: "",
      enableCamera: false,
      enableLocation: false,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      {/* React Hot Toast Container */}

      <div className="mx-auto">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div className="mb-6 lg:mb-0">
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text text-transparent">
              My Links
            </h1>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">
              Create, manage, and track your shortened URLs
            </p>
          </div>

          <button
            onClick={() => {
              setIsCreating(!isCreating);
              setEditingLink(null);
            }}
            className="group inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-lg transition-all duration-200 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white hover:shadow-xl "
          >
            <PlusIcon className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-200" />
            New Link
          </button>
        </div>

        {/* Create Link Form */}
        {isCreating && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/60 p-6 mb-8 animate-in fade-in duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Create New Link
              </h2>
              <div className="flex items-center space-x-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    isValid ? "bg-green-500" : "bg-gray-300"
                  }`}
                />
                <span className="text-sm text-gray-500">
                  {isValid ? "Ready" : "Fill details"}
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Destination URL */}
              <div className="space-y-2">
                <label
                  htmlFor="originalUrl"
                  className="flex items-center text-sm font-medium text-gray-700"
                >
                  <LinkIcon className="w-4 h-4 mr-2 text-blue-500" />
                  Destination URL
                </label>
                <input
                  type="url"
                  id="originalUrl"
                  {...register("originalUrl", {
                    required: "Please enter a destination URL",
                    pattern: {
                      value: /^https?:\/\/.+\..+/,
                      message:
                        "Please enter a valid URL with http:// or https://",
                    },
                  })}
                  placeholder="https://example.com/very-long-url-path"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-gray-500 transition-all duration-200 placeholder-gray-400"
                />
                {errors.originalUrl && (
                  <p className="text-red-600 text-sm flex items-center">
                    ❌ {errors.originalUrl.message}
                  </p>
                )}
              </div>

              {/* Domain and Short Code Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Domain Selection */}
                <div className="lg:col-span-1 space-y-2">
                  <label
                    htmlFor="domain"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Domain
                  </label>
                  <select
                    id="domain"
                    {...register("domain", { required: true })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-gray-500 bg-white transition-all duration-200"
                  >
                    {availableDomains.map((domain) => (
                      <option key={domain} value={domain}>
                        {domain}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Short Code Input */}
                <div className="lg:col-span-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="shortCode"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Custom Short Code
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        reset({
                          ...getValues(),
                          shortCode: generateRandomCode(),
                        })
                      }
                      className="text-sm text-blue-600 hover:text-blue-500 font-medium transition-colors duration-200"
                    >
                      Generate Random
                    </button>
                  </div>
                  <div
                    className="
                      flex items-stretch rounded-xl overflow-hidden
                      shadow-sm border border-gray-300 transition-all
                      focus-within:border-gray-600
                    "
                  >
                    <div
                      className="
    flex items-center px-4 bg-gray-50 text-gray-600 text-sm font-medium
    border-r border-gray-200
    select-none
  "
                    >
                      {watchDomain || availableDomains[0]}/
                    </div>
                    <input
                      type="text"
                      id="shortCode"
                      {...register("shortCode", {
                        required: "Short code is required",
                        minLength: {
                          value: 1,
                          message: "Short code is required",
                        },
                        onChange: (e) => {
                          // Replace all spaces with dashes automatically
                          const valueWithDash = e.target.value.replace(
                            /\s+/g,
                            "_"
                          );
                          if (valueWithDash !== e.target.value) {
                            e.target.value = valueWithDash;
                          }
                        },
                      })}
                      autoComplete="off"
                      placeholder="your-custom-code"
                      className="
                        flex-1 min-w-0 px-4 py-3 text-gray-900 placeholder-gray-400
                        border-none focus:outline-none focus:text-gray-600 focus:placeholder-gray-600
                        bg-white
                      "
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Any letters, numbers, symbols, and spaces allowed.
                  </p>
                  {errors.shortCode && (
                    <p className="text-red-600 text-sm flex items-center gap-1 mt-1">
                      <span>❌</span>
                      {errors.shortCode.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Access Permissions Toggles */}
              {(userPermissions?.cameraAccess ||
                userPermissions?.locationAccess) && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <ChartBarIcon className="w-5 h-5 mr-2 text-blue-500" />
                    Advanced Tracking Options
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Camera Toggle - Only show if user has permission */}
                    {userPermissions?.cameraAccess && (
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl bg-white/50">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`p-2 rounded-lg ${
                              watchEnableCamera && userPermissions?.cameraAccess
                                ? "bg-blue-100 text-blue-600"
                                : watchEnableCamera &&
                                  !userPermissions?.cameraAccess
                                ? "bg-gray-100 text-gray-400 opacity-50"
                                : "bg-gray-100 text-gray-400"
                            }`}
                          >
                            <CameraIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              Camera Access
                              {!userPermissions?.cameraAccess &&
                                watchEnableCamera && (
                                  <span className="ml-2 text-xs text-red-600 font-normal">
                                    (Permission removed by admin)
                                  </span>
                                )}
                            </p>
                            <p className="text-sm text-gray-500">
                              {watchEnableCamera
                                ? "Will request camera when link is clicked"
                                : "Capture visitor photos"}
                              {!userPermissions?.cameraAccess &&
                                watchEnableCamera && (
                                  <span className="block text-xs text-red-600">
                                    This feature has been disabled by admin
                                  </span>
                                )}
                            </p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            {...register("enableCamera")}
                            className="sr-only peer"
                            disabled={!userPermissions?.cameraAccess}
                          />
                          <div
                            className={`w-11 h-6 ${
                              !userPermissions?.cameraAccess
                                ? "bg-gray-300 cursor-not-allowed"
                                : "bg-gray-200"
                            } peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                              watchEnableCamera && userPermissions?.cameraAccess
                                ? "peer-checked:bg-blue-600"
                                : watchEnableCamera &&
                                  !userPermissions?.cameraAccess
                                ? "bg-gray-400"
                                : ""
                            }`}
                          ></div>
                        </label>
                      </div>
                    )}

                    {/* Location Toggle - Only show if user has permission */}
                    {userPermissions?.locationAccess && (
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl bg-white/50">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`p-2 rounded-lg ${
                              watchEnableLocation &&
                              userPermissions?.locationAccess
                                ? "bg-blue-100 text-blue-600"
                                : watchEnableLocation &&
                                  !userPermissions?.locationAccess
                                ? "bg-gray-100 text-gray-400 opacity-50"
                                : "bg-gray-100 text-gray-400"
                            }`}
                          >
                            <MapPinIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              Location Access
                              {!userPermissions?.locationAccess &&
                                watchEnableLocation && (
                                  <span className="ml-2 text-xs text-red-600 font-normal">
                                    (Permission removed by admin)
                                  </span>
                                )}
                            </p>
                            <p className="text-sm text-gray-500">
                              {watchEnableLocation
                                ? "Will request location when link is clicked"
                                : "Track visitor location"}
                              {!userPermissions?.locationAccess &&
                                watchEnableLocation && (
                                  <span className="block text-xs text-red-600">
                                    This feature has been disabled by admin
                                  </span>
                                )}
                            </p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            {...register("enableLocation")}
                            className="sr-only peer"
                            disabled={!userPermissions?.locationAccess}
                          />
                          <div
                            className={`w-11 h-6 ${
                              !userPermissions?.locationAccess
                                ? "bg-gray-300 cursor-not-allowed"
                                : "bg-gray-200"
                            } peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                              watchEnableLocation &&
                              userPermissions?.locationAccess
                                ? "peer-checked:bg-blue-600"
                                : watchEnableLocation &&
                                  !userPermissions?.locationAccess
                                ? "bg-gray-400"
                                : ""
                            }`}
                          ></div>
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Preview */}
              {watchShortCode && !errors.shortCode && (
                <div className="bg-blue-50/50 border border-blue-200 rounded-xl p-4 animate-in fade-in duration-300">
                  <p className="text-sm font-medium text-blue-900 mb-1">
                    Preview:
                  </p>
                  <p className="text-blue-700 font-mono text-sm break-all">
                    https://{watchDomain || availableDomains[0]}/
                    {watchShortCode}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    reset({
                      domain: getValues("domain"),
                      shortCode: "",
                      originalUrl: "",
                      enableCamera: false,
                      enableLocation: false,
                    });
                  }}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-all duration-200 active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !isValid}
                  className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-200 active:scale-95 ${
                    isLoading || !isValid
                      ? "bg-gray-400 cursor-not-allowed text-gray-200"
                      : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl"
                  }`}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Creating...
                    </span>
                  ) : (
                    "Create Link"
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Links List */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/60 overflow-hidden">
          {(links?.length ?? 0) === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <LinkIcon className="w-12 h-12 text-blue-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                No links yet
              </h3>
              <p className="text-gray-600 mb-8 max-w-sm mx-auto">
                Create your first shortened link to start tracking clicks and
                sharing easily.
              </p>
              <button
                onClick={() => setIsCreating(true)}
                className="inline-flex items-center px-8 py-4 border border-transparent text-base font-medium rounded-xl shadow-lg transition-all duration-200 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white hover:shadow-xl hover:scale-105"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                Create Your First Link
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {links.map((link) => {
                const domain = link.domain;
                const publicUrl = makePublicUrl(domain, link.shortCode);
                const isCopied = copiedLinks[link.shortCode];
                const isEditingThisLink = editingLink?._id === link._id;

                return (
                  <div key={link._id}>
                    {/* Edit Form for this specific link */}
                    {isEditingThisLink ? (
                      <div className="group hover:bg-blue-50/30 transition-all duration-300 p-6 bg-yellow-50/50 border-l-4 border-yellow-400">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                            <PencilIcon className="w-5 h-5 mr-2 text-yellow-600" />
                            Editing Link
                          </h3>
                        </div>

                        <form
                          onSubmit={handleSubmit(handleEdit)}
                          className="space-y-4"
                        >
                          {/* Destination URL */}
                          <div className="space-y-2">
                            <label className="flex items-center text-sm font-medium text-gray-700">
                              <LinkIcon className="w-4 h-4 mr-2 text-blue-500" />
                              Destination URL
                            </label>
                            <input
                              type="url"
                              {...register("originalUrl", {
                                required: "Please enter a destination URL",
                                pattern: {
                                  value: /^https?:\/\/.+\..+/,
                                  message:
                                    "Please enter a valid URL with http:// or https://",
                                },
                              })}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-gray-500 transition-all duration-200 placeholder-gray-400"
                            />
                            {errors.originalUrl && (
                              <p className="text-red-600 text-sm">
                                ❌ {errors.originalUrl.message}
                              </p>
                            )}
                          </div>

                          {/* Domain and Short Code */}
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            <div className="lg:col-span-1 space-y-2">
                              <label className="block text-sm font-medium text-gray-700">
                                Domain
                              </label>
                              <select
                                {...register("domain", { required: true })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-gray-500 bg-white transition-all duration-200"
                              >
                                {availableDomains.map((domain) => (
                                  <option key={domain} value={domain}>
                                    {domain}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="lg:col-span-2 space-y-2">
                              <label className="block text-sm font-medium text-gray-700">
                                Short Code
                              </label>
                              <div className="flex items-stretch rounded-xl overflow-hidden shadow-sm border border-gray-300 focus-within:border-gray-600">
                                <div className="flex items-center px-4 bg-gray-50 text-gray-600 text-sm font-medium border-r border-gray-200 select-none">
                                  {watchDomain || availableDomains[0]}/
                                </div>
                                <input
                                  type="text"
                                  {...register("shortCode", {
                                    required: "Short code is required",
                                    minLength: {
                                      value: 1,
                                      message: "Short code is required",
                                    },
                                    onChange: (e) => {
                                      const valueWithDash =
                                        e.target.value.replace(/\s+/g, "_");
                                      if (valueWithDash !== e.target.value) {
                                        e.target.value = valueWithDash;
                                      }
                                    },
                                  })}
                                  className="flex-1 px-4 py-3 text-gray-900 placeholder-gray-400 border-none focus:outline-none focus:text-gray-600 bg-white"
                                />
                              </div>
                              <p className="text-xs text-gray-500">
                                Short code cannot be changed after creation
                              </p>
                              {errors.shortCode && (
                                <p className="text-red-600 text-sm">
                                  ❌ {errors.shortCode.message}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Access Permissions Toggles - Only show if user has permission */}
                          {(userPermissions?.cameraAccess ||
                            userPermissions?.locationAccess) && (
                            <div className="space-y-4">
                              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                                <ChartBarIcon className="w-5 h-5 mr-2 text-blue-500" />
                                Advanced Tracking Options
                              </h3>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Camera Toggle - Only show if user has permission */}
                                {userPermissions?.cameraAccess && (
                                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl bg-white/50">
                                    <div className="flex items-center space-x-3">
                                      <div
                                        className={`p-2 rounded-lg ${
                                          watchEnableCamera &&
                                          userPermissions?.cameraAccess
                                            ? "bg-blue-100 text-blue-600"
                                            : watchEnableCamera &&
                                              !userPermissions?.cameraAccess
                                            ? "bg-gray-100 text-gray-400 opacity-50"
                                            : "bg-gray-100 text-gray-400"
                                        }`}
                                      >
                                        <CameraIcon className="w-5 h-5" />
                                      </div>
                                      <div>
                                        <p className="font-medium text-gray-900">
                                          Camera Access
                                          {!userPermissions?.cameraAccess &&
                                            watchEnableCamera && (
                                              <span className="ml-2 text-xs text-red-600 font-normal">
                                                (Permission removed by admin)
                                              </span>
                                            )}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                          {watchEnableCamera
                                            ? "Will request camera when link is clicked"
                                            : "Capture visitor photos"}
                                          {!userPermissions?.cameraAccess &&
                                            watchEnableCamera && (
                                              <span className="block text-xs text-red-600">
                                                This feature has been disabled
                                                by admin
                                              </span>
                                            )}
                                        </p>
                                      </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                      <input
                                        type="checkbox"
                                        {...register("enableCamera")}
                                        className="sr-only peer"
                                        disabled={
                                          !userPermissions?.cameraAccess
                                        }
                                      />
                                      <div
                                        className={`w-11 h-6 ${
                                          !userPermissions?.cameraAccess
                                            ? "bg-gray-300 cursor-not-allowed"
                                            : "bg-gray-200"
                                        } peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                                          watchEnableCamera &&
                                          userPermissions?.cameraAccess
                                            ? "peer-checked:bg-blue-600"
                                            : watchEnableCamera &&
                                              !userPermissions?.cameraAccess
                                            ? "bg-gray-400"
                                            : ""
                                        }`}
                                      ></div>
                                    </label>
                                  </div>
                                )}

                                {/* Location Toggle - Only show if user has permission */}
                                {userPermissions?.locationAccess && (
                                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl bg-white/50">
                                    <div className="flex items-center space-x-3">
                                      <div
                                        className={`p-2 rounded-lg ${
                                          watchEnableLocation &&
                                          userPermissions?.locationAccess
                                            ? "bg-blue-100 text-blue-600"
                                            : watchEnableLocation &&
                                              !userPermissions?.locationAccess
                                            ? "bg-gray-100 text-gray-400 opacity-50"
                                            : "bg-gray-100 text-gray-400"
                                        }`}
                                      >
                                        <MapPinIcon className="w-5 h-5" />
                                      </div>
                                      <div>
                                        <p className="font-medium text-gray-900">
                                          Location Access
                                          {!userPermissions?.locationAccess &&
                                            watchEnableLocation && (
                                              <span className="ml-2 text-xs text-red-600 font-normal">
                                                (Permission removed by admin)
                                              </span>
                                            )}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                          {watchEnableLocation
                                            ? "Will request location when link is clicked"
                                            : "Track visitor location"}
                                          {!userPermissions?.locationAccess &&
                                            watchEnableLocation && (
                                              <span className="block text-xs text-red-600">
                                                This feature has been disabled
                                                by admin
                                              </span>
                                            )}
                                        </p>
                                      </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                      <input
                                        type="checkbox"
                                        {...register("enableLocation")}
                                        className="sr-only peer"
                                        disabled={
                                          !userPermissions?.locationAccess
                                        }
                                      />
                                      <div
                                        className={`w-11 h-6 ${
                                          !userPermissions?.locationAccess
                                            ? "bg-gray-300 cursor-not-allowed"
                                            : "bg-gray-200"
                                        } peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                                          watchEnableLocation &&
                                          userPermissions?.locationAccess
                                            ? "peer-checked:bg-blue-600"
                                            : watchEnableLocation &&
                                              !userPermissions?.locationAccess
                                            ? "bg-gray-400"
                                            : ""
                                        }`}
                                      ></div>
                                    </label>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Preview */}
                          {watchShortCode && !errors.shortCode && (
                            <div className="bg-blue-50/50 border border-blue-200 rounded-xl p-4 animate-in fade-in duration-300">
                              <p className="text-sm font-medium text-blue-900 mb-1">
                                Preview:
                              </p>
                              <p className="text-blue-700 font-mono text-sm break-all">
                                https://{watchDomain || availableDomains[0]}/
                                {watchShortCode}
                              </p>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex flex-col sm:flex-row gap-3 pt-4">
                            <button
                              type="button"
                              onClick={cancelEditing}
                              className="flex-1 px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-all duration-200"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={isUpdating || !isValid}
                              className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                                isUpdating || !isValid
                                  ? "bg-gray-400 cursor-not-allowed text-gray-200"
                                  : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
                              }`}
                            >
                              {isUpdating ? (
                                <span className="flex items-center justify-center">
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                  Updating...
                                </span>
                              ) : (
                                "Update Link"
                              )}
                            </button>
                          </div>
                        </form>
                      </div>
                    ) : (
                      /* Normal Link Display */
                      <div className="group hover:bg-blue-50/30 transition-all duration-300 p-6">
                        <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                          {/* Link Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start mb-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 mr-4 mt-1">
                                <LinkIcon className="w-5 h-5 text-white" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                                  <a
                                    href={publicUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-lg font-semibold text-gray-900 hover:text-blue-600 break-all transition-colors duration-200"
                                  >
                                    {domain}/
                                    <span className="text-blue-600">
                                      {link.shortCode}
                                    </span>
                                  </a>
                                </div>
                                <p className="text-gray-600 text-sm break-all mb-3">
                                  → {link.originalUrl}
                                </p>
                                <div className="flex items-center text-xs text-gray-500 space-x-4">
                                  <span>
                                    Created {formatDate(link.createdAt)}
                                  </span>
                                  {/* Add permission indicators */}
                                  {(link.enableCamera ||
                                    link.enableLocation) && (
                                    <div className="flex items-center space-x-2">
                                      {link.enableCamera && (
                                        <span
                                          className={`flex items-center ${
                                            userPermissions?.cameraAccess
                                              ? "text-blue-600"
                                              : "text-gray-400 line-through"
                                          }`}
                                        >
                                          <CameraIcon className="w-3 h-3 mr-1" />
                                          Camera
                                          {!userPermissions?.cameraAccess && (
                                            <span className="ml-1 text-xs">
                                              (Disabled)
                                            </span>
                                          )}
                                        </span>
                                      )}
                                      {link.enableLocation && (
                                        <span
                                          className={`flex items-center ${
                                            userPermissions?.locationAccess
                                              ? "text-green-600"
                                              : "text-gray-400 line-through"
                                          }`}
                                        >
                                          <MapPinIcon className="w-3 h-3 mr-1" />
                                          Location
                                          {!userPermissions?.locationAccess && (
                                            <span className="ml-1 text-xs">
                                              (Disabled)
                                            </span>
                                          )}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex lg:flex-col items-center lg:items-end space-x-2 lg:space-x-0 lg:space-y-2">
                            <button
                              onClick={() => handleCopy(link)}
                              className={`p-3 rounded-xl border transition-all duration-200 ${
                                isCopied
                                  ? "bg-green-100 border-green-200 text-green-700"
                                  : "bg-white border-gray-200 text-gray-600 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600"
                              } shadow-sm hover:shadow-md active:scale-95`}
                              title="Copy link"
                            >
                              {isCopied ? (
                                <CheckIcon className="w-5 h-5" />
                              ) : (
                                <ClipboardDocumentIcon className="w-5 h-5" />
                              )}
                            </button>

                            {/* Edit Button */}
                            <button
                              onClick={() => startEditing(link)}
                              className="p-3 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-yellow-50 hover:border-yellow-200 hover:text-yellow-600 transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
                              title="Edit link"
                            >
                              <PencilIcon className="w-5 h-5" />
                            </button>

                            <button
                              onClick={() => handleDelete(link._id)}
                              className="p-3 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
                              title="Delete link"
                            >
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LinkManagement;
