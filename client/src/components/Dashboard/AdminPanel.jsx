/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  FiUsers,
  FiGlobe,
  FiCheck,
  FiX,
  FiTrash2,
  FiEye,
  FiCamera,
  FiMapPin,
  FiFileText,
  FiDownload,
  FiNavigation,
  FiPlus,
  FiLock,
  FiUnlock,
  FiUserCheck,
  FiUserX,
  FiUser,
  FiClock,
  FiCalendar,
  FiShield,
  FiEdit3,
  FiLink,
} from "react-icons/fi";

// Modal Components
const NewDomainModal = ({
  isOpen,
  onClose,
  onCreate,
  newDomain,
  setNewDomain,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed flex items-center justify-center inset-0 z-50 overflow-hidden p-4 animate-in fade-in zoom-in duration-300">
      <div className="flex items-center justify-center">
        {/* Overlay */}
        <div
          className="fixed inset-0 bg-gray-900/75 backdrop-blur-sm transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Modal Container */}
        <div className="relative w-full max-w-lg mx-auto animate-in slide-in-from-bottom-4 duration-300">
          <div className="h-full bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50/50 px-8 pt-8 pb-6 sm:px-10 sm:pt-10 sm:pb-8 border-b border-white/50 flex-shrink-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-3xl font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent leading-tight">
                    Add New Domain
                  </h3>
                  <p className="text-lg text-gray-600 font-medium mt-1">
                    Create a new domain for your application
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200/50 rounded-2xl transition-all duration-200 group backdrop-blur-sm"
                  aria-label="Close modal"
                >
                  <FiX className="w-6 h-6 group-hover:scale-110 transition-transform" />
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-8 sm:px-10 py-8">
              <div className="space-y-6">
                <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-gray-100/50 shadow-xl">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <FiGlobe className="w-4 h-4 text-indigo-600" />
                        Domain Name *
                      </label>
                      <input
                        type="text"
                        value={newDomain.name}
                        onChange={(e) =>
                          setNewDomain({ ...newDomain, name: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200"
                        placeholder="example.com"
                        required
                      />
                    </div>

                    <div className="flex items-center p-4 bg-gradient-to-r from-indigo-50 to-purple-50/50 rounded-2xl border border-indigo-100">
                      <input
                        type="checkbox"
                        id="isPublic"
                        checked={newDomain.isPublic}
                        onChange={(e) =>
                          setNewDomain({
                            ...newDomain,
                            isPublic: e.target.checked,
                          })
                        }
                        className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-2 border-gray-300 rounded-lg bg-white shadow-sm hover:shadow-md transition-all duration-200"
                      />
                      <label
                        htmlFor="isPublic"
                        className="ml-3 block text-sm font-medium text-gray-900 cursor-pointer select-none"
                      >
                        Make this domain public (available to all users)
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gradient-to-t from-gray-50/80 to-transparent px-8 py-8 sm:px-10 border-t border-gray-100/50 backdrop-blur-sm flex-shrink-0">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 text-lg font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 backdrop-blur-sm border-2 border-indigo-500/50 shadow-xl hover:shadow-2xl rounded-3xl transition-all duration-300 hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 active:scale-[0.98]"
                  onClick={onCreate}
                >
                  <FiPlus className="w-5 h-5" />
                  Create Domain
                </button>
                <button
                  type="button"
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 text-lg font-semibold text-gray-700 bg-white/90 hover:bg-white backdrop-blur-sm border-2 border-gray-200 hover:border-gray-300 shadow-xl hover:shadow-2xl rounded-3xl transition-all duration-300 hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 active:scale-[0.98]"
                  onClick={onClose}
                >
                  <FiX className="w-5 h-5" />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AssignDomainModal = ({
  isOpen,
  onClose,
  onAssign,
  assignDomain,
  setAssignDomain,
  users,
  domains,
}) => {
  // Move ALL hooks to the top level, before any conditionals
  // Get the selected user's assigned domains
  const getAssignedDomainsForUser = () => {
    if (!assignDomain.userId) return [];
    const user = users.find((u) => u._id === assignDomain.userId);
    return user?.permissions?.allowedDomains || [];
  };

  const alreadyAssignedDomains = getAssignedDomainsForUser();

  // Filter out public domains since they're automatically available to all users
  const privateDomains = domains.filter((domain) => !domain.isPublic);

  // Get the pre-selected domain info if opened from domain card
  const preselectedDomain =
    assignDomain.domainIds?.length === 1 && !assignDomain.userId
      ? domains.find((d) => d._id === assignDomain.domainIds[0])
      : null;

  // Initialize domainIds with already assigned domains when user is selected
  // Initialize domainIds with already assigned domains when user is selected
  useEffect(() => {
    if (assignDomain.userId && alreadyAssignedDomains.length > 0) {
      // Check if we have a pre-selected domain
      const preselectedDomainId = assignDomain.domainIds?.find(
        (id) => !alreadyAssignedDomains.includes(id)
      );

      // Combine user's assigned domains with pre-selected domain (if any)
      const combinedDomains = preselectedDomainId
        ? [...new Set([...alreadyAssignedDomains, preselectedDomainId])]
        : [...alreadyAssignedDomains];

      setAssignDomain((prev) => ({
        ...prev,
        domainIds: combinedDomains,
      }));
    } else if (assignDomain.userId) {
      // If user has no assigned domains but has pre-selected domain, keep it
      const currentDomains = assignDomain.domainIds || [];
      setAssignDomain((prev) => ({
        ...prev,
        domainIds: currentDomains.length > 0 ? currentDomains : [],
      }));
    }
  }, [assignDomain.userId, alreadyAssignedDomains, setAssignDomain]);

  // Now you can have the conditional return
  if (!isOpen) return null;

  const handleDomainSelect = (domainId) => {
    const currentDomains = assignDomain.domainIds || [];

    if (currentDomains.includes(domainId)) {
      // Remove domain if already selected
      setAssignDomain({
        ...assignDomain,
        domainIds: currentDomains.filter((id) => id !== domainId),
      });
    } else {
      // Add domain
      setAssignDomain({
        ...assignDomain,
        domainIds: [...currentDomains, domainId],
      });
    }
  };

  const isDomainSelected = (domainId) => {
    return (assignDomain.domainIds || []).includes(domainId);
  };

  return (
    <div className="fixed flex items-center justify-center inset-0 z-50 overflow-hidden p-4 animate-in fade-in zoom-in duration-300">
      <div className="flex items-center justify-center">
        {/* Overlay */}
        <div
          className="fixed inset-0 bg-gray-900/75 backdrop-blur-sm transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Modal Container - Fixed height */}
        <div className="relative w-full max-w-2xl mx-auto animate-in slide-in-from-bottom-4 duration-300">
          <div className="h-auto max-h-[90vh] bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-50 to-indigo-50/50 px-8 pt-8 pb-6 sm:px-10 sm:pt-10 sm:pb-8 border-b border-white/50 flex-shrink-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-3xl font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent leading-tight">
                    Manage User Domains
                  </h3>
                  <p className="text-lg text-gray-600 font-medium mt-1">
                    Select or deselect domains for the user
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200/50 rounded-2xl transition-all duration-200 group backdrop-blur-sm"
                  aria-label="Close modal"
                >
                  <FiX className="w-6 h-6 group-hover:scale-110 transition-transform" />
                </button>
              </div>

              {/* Selection Counter and Info */}
              <div className="mt-4 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    Currently selected: {assignDomain.domainIds?.length || 0}{" "}
                    domains
                  </span>
                  {assignDomain.domainIds?.length > 0 && (
                    <button
                      onClick={() =>
                        setAssignDomain({ ...assignDomain, domainIds: [] })
                      }
                      className="text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                      Deselect All
                    </button>
                  )}
                </div>
                {assignDomain.userId && alreadyAssignedDomains.length > 0 && (
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                    <p className="text-sm text-emerald-800 font-medium">
                      Note: Already assigned domains are pre-selected. Deselect
                      to remove access.
                    </p>
                  </div>
                )}
                {preselectedDomain && !assignDomain.userId && (
                  <div className="p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                    <p className="text-sm text-indigo-800 font-medium">
                      Domain "{preselectedDomain.name}" is pre-selected. Please
                      select a user.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-8 sm:px-10 py-8">
              <div className="space-y-6">
                {/* User Selection */}
                <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-gray-100/50 shadow-xl">
                  <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <FiUser className="w-5 h-5 text-emerald-600" />
                    Select User
                  </h4>
                  <select
                    value={assignDomain.userId}
                    onChange={(e) => {
                      const newUserId = e.target.value;
                      // Just set the user ID, keep existing domain selections
                      setAssignDomain((prev) => ({
                        ...prev,
                        userId: newUserId,
                      }));
                    }}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200 appearance-none bg-no-repeat bg-right pr-10"
                    required
                  >
                    <option value="">Select a user</option>
                    {users
                      .filter((user) => user.isActive && user.role !== "admin")
                      .map((user) => (
                        <option key={user._id} value={user._id}>
                          {user.name} ({user.email})
                        </option>
                      ))}
                  </select>
                </div>

                {/* Domain Selection - Show if user is selected OR if we have a pre-selected domain */}
                {(assignDomain.userId || preselectedDomain) && (
                  <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-gray-100/50 shadow-xl">
                    <div className="flex items-center justify-between mb-6">
                      <h4 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <FiGlobe className="w-5 h-5 text-indigo-600" />
                        {preselectedDomain
                          ? "Select Additional Domains"
                          : "Manage Domains"}
                      </h4>
                      <span className="text-sm text-gray-500">
                        {privateDomains.length} private domains available
                      </span>
                    </div>

                    {privateDomains.length > 0 ? (
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {privateDomains.map((domain) => {
                          const isAlreadyAssigned = assignDomain.userId
                            ? alreadyAssignedDomains.includes(domain._id)
                            : false;
                          const isCurrentlySelected = isDomainSelected(
                            domain._id
                          );
                          const isPreselected =
                            preselectedDomain?._id === domain._id;

                          return (
                            <div
                              key={domain._id}
                              className={`flex items-center p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                                isCurrentlySelected
                                  ? "bg-indigo-50 border-indigo-200 shadow-sm"
                                  : "bg-white border-gray-200 hover:bg-gray-50"
                              } ${
                                isPreselected
                                  ? "ring-2 ring-indigo-500 ring-offset-1"
                                  : ""
                              }`}
                              onClick={() => handleDomainSelect(domain._id)}
                            >
                              <div
                                className={`flex items-center justify-center w-6 h-6 rounded-lg border mr-4 transition-all ${
                                  isCurrentlySelected
                                    ? "bg-indigo-600 border-indigo-600"
                                    : "bg-white border-gray-300"
                                } ${isPreselected ? "border-indigo-500" : ""}`}
                              >
                                {isCurrentlySelected && (
                                  <FiCheck className="w-4 h-4 text-white" />
                                )}
                                {isPreselected && !isCurrentlySelected && (
                                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <h5 className="font-medium text-gray-900">
                                    {domain.name}
                                    {isAlreadyAssigned &&
                                      !isCurrentlySelected && (
                                        <span className="ml-2 text-xs text-red-600 font-medium">
                                          (Will be removed)
                                        </span>
                                      )}
                                    {isPreselected && !assignDomain.userId && (
                                      <span className="ml-2 text-xs text-indigo-600 font-medium bg-indigo-50 px-2 py-0.5 rounded-full">
                                        Pre-selected
                                      </span>
                                    )}
                                  </h5>
                                  <div className="flex items-center gap-2">
                                    {isAlreadyAssigned &&
                                      assignDomain.userId && (
                                        <span className="text-xs text-emerald-600 font-medium px-2 py-1 rounded-full bg-emerald-100">
                                          Currently assigned
                                        </span>
                                      )}
                                    <span
                                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                                        domain.isPublic
                                          ? "bg-blue-100 text-blue-800"
                                          : "bg-yellow-100 text-yellow-800"
                                      }`}
                                    >
                                      {domain.isPublic ? "Public" : "Private"}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                  <span className="text-xs text-gray-400">
                                    Created:{" "}
                                    {new Date(
                                      domain.createdAt
                                    ).toLocaleDateString()}
                                  </span>
                                  <span className="text-xs text-gray-400">
                                    • Allowed users:{" "}
                                    {domain.allowedUsers?.length || 0}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FiGlobe className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-lg font-semibold text-gray-500 mb-2">
                          No private domains available
                        </p>
                        <p className="text-sm text-gray-400">
                          All domains are public and automatically available to
                          users.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gradient-to-t from-gray-50/80 to-transparent px-8 py-8 sm:px-10 border-t border-gray-100/50 backdrop-blur-sm flex-shrink-0">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  disabled={!assignDomain.userId}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-lg font-bold text-white backdrop-blur-sm border-2 shadow-xl hover:shadow-2xl rounded-3xl transition-all duration-300 hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-emerald-500/30 active:scale-[0.98] ${
                    !assignDomain.userId
                      ? "bg-gradient-to-r from-gray-400 to-gray-500 border-gray-400/50 cursor-not-allowed"
                      : "bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-700 hover:to-indigo-700 border-emerald-500/50"
                  }`}
                  onClick={onAssign}
                >
                  <FiLink className="w-5 h-5" />
                  {preselectedDomain && !assignDomain.userId
                    ? "Assign Domain to User"
                    : assignDomain.domainIds?.length ===
                      alreadyAssignedDomains.length
                    ? "Update Domain Access"
                    : "Save Changes"}
                </button>
                <button
                  type="button"
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 text-lg font-semibold text-gray-700 bg-white/90 hover:bg-white backdrop-blur-sm border-2 border-gray-200 hover:border-gray-300 shadow-xl hover:shadow-2xl rounded-3xl transition-all duration-300 hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 active:scale-[0.98]"
                  onClick={onClose}
                >
                  <FiX className="w-5 h-5" />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const UserDetailsModal = ({
  isOpen,
  onClose,
  selectedUser,
  domains,
  removeDomainFromUser,
  permissionLabels,
  permissionIcons,
}) => {
  if (!isOpen || !selectedUser) return null;

  const domainCount = selectedUser.permissions?.allowedDomains?.length || 0;
  const assignedDomains =
    selectedUser.permissions?.allowedDomains
      ?.map((domainId) => domains.find((d) => d._id === domainId))
      .filter(Boolean) || [];

  return (
    <div className="fixed inset-0 z-50 min-h-screen overflow-hidden p-4 animate-in fade-in zoom-in duration-300">
      <div className="flex items-center justify-center min-h-screen">
        {/* Overlay */}
        <div
          className="fixed inset-0 bg-gray-900/75 backdrop-blur-sm transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Modal Container */}
        <div className="relative w-full max-w-4xl mx-auto h-[90vh] max-h-[90vh] animate-in slide-in-from-bottom-4 duration-300">
          <div className="h-full bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50/50 px-8 pt-8 pb-6 sm:px-10 sm:pt-10 sm:pb-8 border-b border-white/50 flex-shrink-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 border-4 border-indigo-200/50 shadow-lg flex items-center justify-center">
                    <span className="text-2xl font-bold text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text">
                      {selectedUser.name?.charAt(0)?.toUpperCase() || "U"}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-3xl font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent leading-tight">
                      {selectedUser.name}'s Profile
                    </h3>
                    <p className="text-lg text-gray-600 font-medium mt-1 truncate max-w-md">
                      {selectedUser.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200/50 rounded-2xl transition-all duration-200 group backdrop-blur-sm"
                  aria-label="Close modal"
                >
                  <FiX className="w-6 h-6 group-hover:scale-110 transition-transform" />
                </button>
              </div>

              {/* Status Badges */}
              <div className="flex flex-wrap gap-2 mt-6">
                <span
                  className={`px-4 py-2 text-sm font-semibold rounded-2xl shadow-sm ${
                    selectedUser.role === "admin"
                      ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-purple-500/25"
                      : "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-200"
                  }`}
                >
                  {selectedUser.role === "admin" ? "🛡️ Admin" : "👤 User"}
                </span>
                <span
                  className={`px-4 py-2 text-sm font-semibold rounded-2xl shadow-sm flex items-center gap-1.5 ${
                    selectedUser.isActive
                      ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-emerald-500/25"
                      : "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-red-500/25"
                  }`}
                >
                  {selectedUser.isActive ? "✅ Active" : "❌ Inactive"}
                </span>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-8 sm:p-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Basic Info & Permissions */}
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-gray-100/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                  <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                      <FiUser className="w-5 h-5 text-white" />
                    </div>
                    Basic Information
                  </h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-3 border-b border-gray-100/50 last:border-b-0">
                      <span className="text-gray-600 font-medium flex items-center gap-2">
                        <FiCalendar className="w-4 h-4" />
                        Joined
                      </span>
                      <span className="font-semibold text-gray-900">
                        {new Date(selectedUser.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-100/50">
                      <span className="text-gray-600 font-medium flex items-center gap-2">
                        <FiClock className="w-4 h-4" />
                        Last Login
                      </span>
                      <span className="font-semibold text-gray-900">
                        {selectedUser.lastLogin
                          ? new Date(selectedUser.lastLogin).toLocaleString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )
                          : "Never"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Permissions */}
                <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-gray-100/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                  <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                      <FiShield className="w-5 h-5 text-white" />
                    </div>
                    Permissions
                  </h4>
                  <div className="space-y-3">
                    {Object.entries(selectedUser.permissions || {}).map(
                      ([key, value]) => {
                        if (key === "allowedDomains") return null;
                        return (
                          <div
                            key={key}
                            className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:bg-gray-100 transition-all duration-200 group"
                          >
                            <div className="flex items-center gap-3 flex-1">
                              {permissionIcons[key]}
                              <span className="font-medium text-gray-900 group-hover:text-gray-800">
                                {permissionLabels[key] ||
                                  key
                                    .replace(/([A-Z])/g, " $1")
                                    .replace(/^./, (str) => str.toUpperCase())}
                              </span>
                            </div>
                            <span
                              className={`px-3 py-1.5 text-sm font-semibold rounded-full shadow-sm flex items-center gap-1.5 ${
                                value
                                  ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-emerald-500/25"
                                  : "bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700 border border-gray-300"
                              }`}
                            >
                              {value ? "✅ Enabled" : "❌ Disabled"}
                            </span>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
              </div>

              {/* Domains */}
              <div className="space-y-6">
                <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-gray-100/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-8">
                    <h4 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                        <FiGlobe className="w-5 h-5 text-white" />
                      </div>
                      Assigned Domains
                    </h4>
                    <span className="text-2xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      {domainCount}
                    </span>
                  </div>

                  {assignedDomains.length > 0 ? (
                    <div className="space-y-3 max-h-80 overflow-y-auto -mx-2 px-2">
                      {assignedDomains.map((domain) => (
                        <div
                          key={domain._id}
                          className="group flex items-center justify-between p-4 bg-gradient-to-r from-white to-gray-50 rounded-2xl border border-gray-200 hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-100 transition-all duration-300 hover:-translate-y-0.5"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center shadow-md border-2 border-indigo-100">
                              <FiGlobe className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-gray-900 truncate">
                                {domain.name}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <FiGlobe className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-lg font-semibold text-gray-500 mb-2">
                        No domains assigned
                      </p>
                      <p className="text-sm text-gray-400">
                        This user doesn't have access to any domains yet.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, userName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed flex items-center justify-center inset-0 z-50 overflow-y-auto  flex items-center justify-center p-4 animate-in fade-in zoom-in duration-200">
      <div className="w-full max-w-md mx-auto">
        {/* Overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-900/75"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Modal Container */}
        <div className="relative bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="p-8 pb-6 sm:p-10 sm:pb-8">
            <div className="mx-auto flex items-start justify-center sm:mx-0 sm:flex sm:items-start mb-6">
              <div className="flex-shrink-0 flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-red-50 to-red-100 border-4 border-red-100/50 shadow-lg sm:mx-0 sm:h-14 sm:w-14">
                <FiTrash2 className="h-8 w-8 text-red-600 drop-shadow-sm" />
              </div>
              <div className="mt-6 sm:mt-0 sm:ml-6 sm:flex-1 sm:text-left text-center">
                <h3 className="text-2xl font-bold text-gray-900 leading-tight mb-2">
                  Delete User
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed max-w-sm mx-auto sm:mx-0">
                  Are you absolutely sure you want to delete{" "}
                  <span className="font-bold text-gray-900 bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">
                    {userName}
                  </span>
                  ? This action is permanent and cannot be undone.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gradient-to-t from-gray-50/50 to-transparent px-6 py-8 sm:px-10 sm:py-8 border-t border-gray-100/50 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row justify-between gap-3">
              {/* Cancel (left) */}
              <button
                type="button"
                className="w-full sm:w-auto px-6 py-3 text-base font-semibold text-gray-700 bg-white/80 hover:bg-white backdrop-blur-sm border-2 border-gray-200 hover:border-gray-300 shadow-lg rounded-2xl transition-all duration-200 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/30 focus:ring-offset-2 focus:ring-offset-white active:shadow-lg active:scale-[0.98]"
                onClick={onClose}
              >
                Cancel
              </button>

              {/* Delete (right) */}
              <button
                type="button"
                className="w-full sm:w-auto px-6 py-3 text-base font-semibold text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 active:from-red-800 active:to-red-900 shadow-xl shadow-red-500/25 border border-red-600/50 rounded-2xl transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-red-500/30 focus:ring-offset-2 focus:ring-offset-white active:translate-y-0 active:shadow-lg"
                onClick={onConfirm}
              >
                <span className="flex items-center justify-center gap-2">
                  <FiTrash2 className="w-5 h-5" />
                  Delete User
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main AdminPanel Component
const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("users");
  const [newDomain, setNewDomain] = useState({
    name: "",
    description: "",
    isPublic: false,
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [assignDomain, setAssignDomain] = useState({
    userId: "",
    domainIds: [],
  });
  const [userToDelete, setUserToDelete] = useState(null);

  // Modal states
  const [showNewDomainModal, setShowNewDomainModal] = useState(false);
  const [showAssignDomainModal, setShowAssignDomainModal] = useState(false);
  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, domainsRes] = await Promise.all([
        axios.get("http://localhost:5000/api/auth/users", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }),
        axios.get("http://localhost:5000/api/domains", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }),
      ]);

      setUsers(usersRes.data);
      setDomains(domainsRes.data);
    } catch (error) {
      console.error("Error fetching admin data:", error);
      toast.error("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  const updateUserPermissions = async (userId, permissions) => {
    try {
      await axios.put(
        `http://localhost:5000/api/auth/users/${userId}/permissions`,
        { permissions },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      setUsers(
        users.map((user) =>
          user._id === userId
            ? { ...user, permissions: { ...user.permissions, ...permissions } }
            : user
        )
      );

      toast.success("Permissions updated successfully");
    } catch (error) {
      toast.error("Failed to update permissions");
    }
  };

  const toggleUserStatus = async (userId, isActive) => {
    try {
      await axios.put(
        `http://localhost:5000/api/auth/users/${userId}/status`,
        { isActive },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      setUsers(
        users.map((user) =>
          user._id === userId ? { ...user, isActive } : user
        )
      );

      toast.success(
        `User ${isActive ? "activated" : "deactivated"} successfully`
      );
    } catch (error) {
      toast.error("Failed to update user status");
    }
  };

  const handleDeleteUser = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      await axios.delete(
        `http://localhost:5000/api/auth/users/${userToDelete._id}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      setUsers(users.filter((user) => user._id !== userToDelete._id));
      toast.success("User deleted successfully");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to delete user");
    } finally {
      setShowDeleteModal(false);
      setUserToDelete(null);
    }
  };

  const createDomain = async () => {
    try {
      if (!newDomain.name.trim()) {
        toast.error("Domain name is required");
        return;
      }

      const response = await axios.post(
        "http://localhost:5000/api/domains",
        newDomain,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      setDomains([...domains, response.data]);
      setNewDomain({ name: "", description: "", isPublic: false });
      setShowNewDomainModal(false);
      toast.success("Domain created successfully");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to create domain");
    }
  };

  const deleteDomain = async (domainId) => {
    if (!window.confirm("Are you sure you want to delete this domain?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/domains/${domainId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      setDomains(domains.filter((domain) => domain._id !== domainId));
      toast.success("Domain deleted successfully");
    } catch (error) {
      toast.error("Failed to delete domain");
    }
  };

  const assignDomainToUser = async () => {
    try {
      if (!assignDomain.userId) {
        toast.error("Please select a user");
        return;
      }

      const user = users.find((u) => u._id === assignDomain.userId);
      if (!user) {
        toast.error("User not found");
        return;
      }

      const alreadyAssignedDomains = user.permissions?.allowedDomains || [];
      const domainsToAdd = assignDomain.domainIds || [];

      // Find domains to add (new assignments)
      const domainsToAssign = domainsToAdd.filter(
        (domainId) => !alreadyAssignedDomains.includes(domainId)
      );

      // Find domains to remove (deselected assignments)
      const domainsToRemove = alreadyAssignedDomains.filter(
        (domainId) => !domainsToAdd.includes(domainId)
      );

      // Assign new domains
      const assignPromises = domainsToAssign.map((domainId) =>
        axios.post(
          `http://localhost:5000/api/domains/${domainId}/assign/${assignDomain.userId}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        )
      );

      // Remove deselected domains
      const removePromises = domainsToRemove.map((domainId) =>
        axios.delete(
          `http://localhost:5000/api/domains/${domainId}/unassign/${assignDomain.userId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        )
      );

      // Wait for all operations to complete
      await Promise.all([...assignPromises, ...removePromises]);

      // Refresh the data to get the latest from server
      await fetchData();

      // Reset state and close modal
      setAssignDomain({ userId: "", domainIds: [] });
      setShowAssignDomainModal(false);

      // Show appropriate success message
      if (domainsToAssign.length > 0 && domainsToRemove.length > 0) {
        toast.success(
          `Updated domains: Added ${domainsToAssign.length}, Removed ${domainsToRemove.length}`
        );
      } else if (domainsToAssign.length > 0) {
        toast.success(`Added ${domainsToAssign.length} domain(s) to user`);
      } else if (domainsToRemove.length > 0) {
        toast.success(`Removed ${domainsToRemove.length} domain(s) from user`);
      } else {
        toast.success("No changes made to domain assignments");
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to update domains");
    }
  };
  const removeDomainFromUser = async (userId, domainId) => {
    try {
      // First update the user's permissions
      const user = users.find((u) => u._id === userId);
      const updatedDomains = user.permissions.allowedDomains.filter(
        (id) => id !== domainId
      );

      // Update user permissions
      await updateUserPermissions(userId, {
        allowedDomains: updatedDomains,
      });

      // Also remove user from domain's allowedUsers
      await axios.delete(
        `http://localhost:5000/api/domains/${domainId}/unassign/${userId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      toast.success("Domain removed from user successfully");
    } catch (error) {
      toast.error("Failed to remove domain from user");
    }
  };

  const viewUserDetails = (user) => {
    setSelectedUser(user);
    setShowUserDetailsModal(true);
  };

  const permissionLabels = {
    cameraAccess: "Camera Access",
    locationAccess: "Location Access",
    lacCellConverter: "LAC/Cell Converter",
    ipdrRequest: "IPDR Request",
    csvDownload: "CSV Download",
  };

  const permissionIcons = {
    cameraAccess: <FiCamera className="w-4 h-4" />,
    locationAccess: <FiMapPin className="w-4 h-4" />,
    lacCellConverter: <FiNavigation className="w-4 h-4" />,
    ipdrRequest: <FiFileText className="w-4 h-4" />,
    csvDownload: <FiDownload className="w-4 h-4" />,
  };

  // Exclude admin users from list and counts
  const nonAdminUsers = users.filter((u) => u.role !== "admin");

  const activeUsers = nonAdminUsers.filter((u) => u.isActive).length;
  const inactiveUsers = nonAdminUsers.filter((u) => !u.isActive).length;
  const adminUsers = users.filter((u) => u.role === "admin").length; // if you still want this number
  const regularUsers = nonAdminUsers.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Modal Components */}
      <NewDomainModal
        isOpen={showNewDomainModal}
        onClose={() => setShowNewDomainModal(false)}
        onCreate={createDomain}
        newDomain={newDomain}
        setNewDomain={setNewDomain}
      />

      <AssignDomainModal
        isOpen={showAssignDomainModal}
        onClose={() => {
          setShowAssignDomainModal(false);
          setAssignDomain({ userId: "", domainIds: [] });
        }}
        onAssign={assignDomainToUser}
        assignDomain={assignDomain}
        setAssignDomain={setAssignDomain}
        users={users}
        domains={domains}
      />

      <UserDetailsModal
        isOpen={showUserDetailsModal}
        onClose={() => {
          setShowUserDetailsModal(false);
          setSelectedUser(null);
        }}
        selectedUser={selectedUser}
        domains={domains}
        removeDomainFromUser={removeDomainFromUser}
        permissionLabels={permissionLabels}
        permissionIcons={permissionIcons}
      />

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setUserToDelete(null);
        }}
        onConfirm={confirmDeleteUser}
        userName={userToDelete?.name || ""}
      />

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab("users")}
              className={`py-4 px-6 text-sm font-medium border-b-2 ${
                activeTab === "users"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center">
                <FiUsers className="w-4 h-4 mr-2" />
                Users ({nonAdminUsers.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab("domains")}
              className={`py-4 px-6 text-sm font-medium border-b-2 ${
                activeTab === "domains"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center">
                <FiGlobe className="w-4 h-4 mr-2" />
                Domains ({domains.length})
              </div>
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === "users" ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  User Management
                </h3>
                <div className="flex gap-4 text-sm text-gray-500">
                  <div>Total: {nonAdminUsers.length}</div>
                  <div>Users: {regularUsers}</div>
                  <div>Active: {activeUsers}</div>
                  <div>Inactive: {inactiveUsers}</div>
                </div>
              </div>

              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role & Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Permissions
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {nonAdminUsers.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              <div
                                className={`h-10 w-10 rounded-full flex items-center justify-center ${
                                  user.role === "admin"
                                    ? "bg-purple-100"
                                    : "bg-indigo-100"
                                }`}
                              >
                                <span
                                  className={`font-semibold ${
                                    user.role === "admin"
                                      ? "text-purple-600"
                                      : "text-indigo-600"
                                  }`}
                                >
                                  {user.name?.charAt(0)?.toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.name}
                                {user.role === "admin" && (
                                  <span className="ml-2 text-xs text-purple-600 font-semibold">
                                    (Admin)
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-gray-500">
                                {user.email}
                              </div>
                              <div className="text-xs text-gray-400">
                                Joined:{" "}
                                {new Date(user.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            <div>
                              <span
                                className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  user.role === "admin"
                                    ? "bg-purple-100 text-purple-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {user.role}
                              </span>
                            </div>
                            <div>
                              <button
                                onClick={() =>
                                  toggleUserStatus(user._id, !user.isActive)
                                }
                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                  user.isActive
                                    ? "bg-green-100 text-green-800 hover:bg-green-200"
                                    : "bg-red-100 text-red-800 hover:bg-red-200"
                                }`}
                              >
                                {user.isActive ? (
                                  <>
                                    <FiUserCheck className="w-3 h-3 mr-1" />
                                    Active
                                  </>
                                ) : (
                                  <>
                                    <FiUserX className="w-3 h-3 mr-1" />
                                    Inactive
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(user.permissions || {}).map(
                              ([key, value]) => {
                                if (key === "allowedDomains") return null;
                                return (
                                  <button
                                    key={key}
                                    onClick={() =>
                                      updateUserPermissions(user._id, {
                                        [key]: !value,
                                      })
                                    }
                                    className={`flex items-center px-2 py-1 rounded text-xs transition-colors ${
                                      value
                                        ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
                                        : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                                    }`}
                                    title={permissionLabels[key] || key}
                                  >
                                    {permissionIcons[key]}
                                    <span className="ml-1">
                                      {value ? "On" : "Off"}
                                    </span>
                                  </button>
                                );
                              }
                            )}
                            <button
                              onClick={() => {
                                setAssignDomain((prev) => ({
                                  ...prev,
                                  userId: user._id,
                                }));
                                setShowAssignDomainModal(true);
                              }}
                              className="flex items-center px-2 py-1 rounded text-xs bg-indigo-100 text-indigo-800 hover:bg-indigo-200"
                              title="Manage Domains"
                            >
                              <FiGlobe className="w-3 h-3 mr-1" />
                              Domains (
                              {user.permissions?.allowedDomains?.length || 0})
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => viewUserDetails(user)}
                              className="p-1.5 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <FiEye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                toggleUserStatus(user._id, !user.isActive)
                              }
                              className="p-1.5 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title={
                                user.isActive
                                  ? "Deactivate User"
                                  : "Activate User"
                              }
                            >
                              {user.isActive ? (
                                <FiLock className="w-4 h-4" />
                              ) : (
                                <FiUnlock className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user)}
                              disabled={user.role === "admin"}
                              className={`p-1.5 rounded-lg transition-colors ${
                                user.role === "admin"
                                  ? "text-gray-400 cursor-not-allowed"
                                  : "text-gray-600 hover:text-red-600 hover:bg-red-50"
                              }`}
                              title={
                                user.role === "admin"
                                  ? "Cannot delete admin"
                                  : "Delete User"
                              }
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Domain Management
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Manage domains and assign them to users
                  </p>
                </div>
                <button
                  onClick={() => setShowNewDomainModal(true)}
                  className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <FiPlus className="w-4 h-4 mr-2" />
                  Add Domain
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {domains.map((domain) => (
                  <div
                    key={domain._id}
                    className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {domain.name}
                          {domain.isPublic && (
                            <span className="ml-2 text-xs text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-full">
                              Public
                            </span>
                          )}
                        </h4>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => deleteDomain(domain._id)}
                          className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                          title="Delete Domain"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <span className="text-gray-600">Status:</span>
                        <span
                          className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                            domain.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {domain.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <div className="flex items-center text-sm">
                        <span className="text-gray-600">Type:</span>
                        <span
                          className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                            domain.isPublic
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {domain.isPublic ? "Public" : "Private"}
                        </span>
                      </div>
                      {!domain.isPublic && (
                        <div className="text-sm text-gray-600">
                          Allowed Users: {domain.allowedUsers?.length || 0}
                        </div>
                      )}
                      {/* Only show "Assign to User" button for private domains */}
                      {!domain.isPublic && (
                        <div className="pt-2">
                          <button
                            onClick={() => {
                              // Pre-select this specific domain in the modal
                              setAssignDomain({
                                userId: "",
                                domainIds: [domain._id], // Pre-select this domain
                              });
                              setShowAssignDomainModal(true);
                            }}
                            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                          >
                            <FiLink className="w-3 h-3" />
                            Assign to User
                          </button>
                        </div>
                      )}

                      {/* Show info for public domains */}
                      {domain.isPublic && (
                        <div className="pt-2">
                          <div className="text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-lg border border-blue-100">
                            <div className="flex items-start gap-2">
                              <FiGlobe className="w-4 h-4 mt-0.5 text-blue-500" />
                              <span className="font-medium">Public Domain</span>
                            </div>
                            <p className="text-xs text-blue-700 mt-1">
                              Automatically available to all users
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
