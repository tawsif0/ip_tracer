// src/components/LinkManagement.jsx
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { toast } from "react-toastify";
import {
  PlusIcon,
  TrashIcon,
  LinkIcon,
  ClipboardDocumentIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";

// ===== CONFIG =====
const API_BASE_URL = "https://api.cleanpc.xyz";
const DEFAULT_PUBLIC_DOMAIN = "cleanpc.xyz";

const makePublicUrl = (domain, shortCode) => `https://${domain}/${shortCode}`;

const LinkManagement = ({ links, setLinks, onLinkCreated }) => {
  const {
    register,
    handleSubmit,
    reset,
    getValues,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      domain: DEFAULT_PUBLIC_DOMAIN,
      shortCode: "",
    },
  });

  const [isCreating, setIsCreating] = useState(false);
  const [newLink, setNewLink] = useState("");
  const [copiedLinks, setCopiedLinks] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const availableDomains = [DEFAULT_PUBLIC_DOMAIN];
  const watchShortCode = watch("shortCode");

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      // Prepare the data with shortCode
      const requestData = {
        originalUrl: data.originalUrl,
        domain: data.domain,
        shortCode: data.shortCode.trim(), // Send the custom short code
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
      });
      setIsCreating(false);
      toast.success("Link created successfully!");
      onLinkCreated && onLinkCreated();
    } catch (error) {
      if (error.response?.data?.error === "Short code already exists") {
        toast.error(
          "This custom short code is already taken. Please choose a different one."
        );
      } else {
        toast.error(error?.response?.data?.error || "Failed to create link");
      }
    } finally {
      setIsLoading(false);
    }
  };
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/links/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      setLinks((prev) => prev.filter((l) => l._id !== id));
      toast.success("Link deleted successfully!");
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to delete link");
    }
  };

  const handleCopy = (link) => {
    const domain = link.domain || DEFAULT_PUBLIC_DOMAIN;
    const linkToCopy = makePublicUrl(domain, link.shortCode);
    navigator.clipboard.writeText(linkToCopy);

    setCopiedLinks((c) => ({ ...c, [link.shortCode]: true }));
    toast.success("Link copied to clipboard!");

    setTimeout(() => {
      setCopiedLinks((c) => ({ ...c, [link.shortCode]: false }));
    }, 2000);
  };

  // Function to generate a random short code (optional)
  const generateRandomCode = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">My Links</h2>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
          New Link
        </button>
      </div>

      {isCreating && (
        <div className="bg-white shadow-lg rounded-xl p-6 mb-8 border border-gray-100">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-4">
                <label
                  htmlFor="originalUrl"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Destination URL
                </label>
                <input
                  type="url"
                  id="originalUrl"
                  {...register("originalUrl", {
                    required: "Destination URL is required",
                    pattern: {
                      value: /^https?:\/\/.+\..+/,
                      message:
                        "Please enter a valid URL with http:// or https://",
                    },
                  })}
                  placeholder="https://example.com"
                  className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none sm:text-sm ${
                    errors.originalUrl
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                  }`}
                />
                {errors.originalUrl && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.originalUrl.message}
                  </p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="domain"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Domain
                </label>
                <select
                  id="domain"
                  {...register("domain", { required: true })}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  {availableDomains.map((domain) => (
                    <option key={domain} value={domain}>
                      {domain}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-6">
                <div className="flex items-center justify-between mb-1">
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
                    className="text-sm text-indigo-600 hover:text-indigo-500"
                  >
                    Generate Random
                  </button>
                </div>
                <div className="flex rounded-md shadow-sm">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                    {getValues("domain")}/
                  </span>
                  <input
                    type="text"
                    id="shortCode"
                    {...register("shortCode", {
                      required: "Short code is required",
                      // Remove all restrictions - allow any characters
                      minLength: {
                        value: 1,
                        message: "Short code is required",
                      },
                      // Auto-replace spaces with underscores
                      onChange: (e) => {
                        const value = e.target.value.replace(/\s+/g, "_");
                        if (value !== e.target.value) {
                          e.target.value = value;
                        }
                      },
                    })}
                    placeholder="your-custom-code"
                    className={`flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border focus:outline-none sm:text-sm ${
                      errors.shortCode
                        ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                        : "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                    }`}
                  />
                </div>
                {errors.shortCode && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.shortCode.message}
                  </p>
                )}
                {watchShortCode && !errors.shortCode && (
                  <p className="mt-1 text-sm text-gray-500">
                    Your link will be: {getValues("domain")}/{watchShortCode}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  reset({
                    domain: getValues("domain"),
                    shortCode: "",
                  });
                }}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 ${
                  isLoading ? "opacity-75 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? "Creating..." : "Create Link"}
              </button>
            </div>
          </form>
        </div>
      )}

      {newLink && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-indigo-800 mb-1">
                Your new tracking link:
              </p>
              <div className="flex items-center">
                <LinkIcon className="h-5 w-5 text-indigo-500 mr-2" />
                <a
                  href={newLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-md font-medium text-indigo-600 hover:text-indigo-500 break-all"
                >
                  {newLink}
                </a>
              </div>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(newLink);
                toast.success("Link copied to clipboard!");
              }}
              className="flex-shrink-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
            >
              <ClipboardDocumentIcon className="-ml-1 mr-2 h-5 w-5" />
              Copy Link
            </button>
          </div>
        </div>
      )}

      <div className="bg-white shadow-lg rounded-xl overflow-hidden">
        {(links?.length ?? 0) === 0 ? (
          <div className="text-center py-12">
            <LinkIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">
              No links yet
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Create your first tracking link to get started.
            </p>
            <div className="mt-6">
              <button
                onClick={() => setIsCreating(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
              >
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                New Link
              </button>
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {links.map((link) => {
              const domain = link.domain || DEFAULT_PUBLIC_DOMAIN;
              const publicUrl = makePublicUrl(domain, link.shortCode);

              return (
                <li
                  key={link._id}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center min-w-0">
                        <LinkIcon className="flex-shrink-0 h-5 w-5 text-indigo-500 mr-3" />
                        <div className="min-w-0">
                          <a
                            href={publicUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-indigo-600 hover:text-indigo-500 truncate"
                          >
                            {domain}/{link.shortCode}
                          </a>
                          <p className="text-xs text-gray-500 mt-1 truncate">
                            → {link.originalUrl}
                          </p>
                        </div>
                      </div>
                      <div className="ml-4 flex-shrink-0 flex space-x-2">
                        <button
                          onClick={() => handleCopy(link)}
                          className="p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                          title="Copy link"
                        >
                          {copiedLinks[link.shortCode] ? (
                            <CheckIcon className="h-5 w-5 text-green-500" />
                          ) : (
                            <ClipboardDocumentIcon className="h-5 w-5" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(link._id)}
                          className="p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                          title="Delete link"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center text-xs text-gray-500">
                      <span>
                        Created{" "}
                        {new Date(link.createdAt).toLocaleString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span className="mx-2">•</span>
                      <span>
                        {link.clicks || 0}{" "}
                        {link.clicks === 1 ? "click" : "clicks"}
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default LinkManagement;
