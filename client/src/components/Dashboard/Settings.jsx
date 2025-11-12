// client/src/components/Dashboard/Settings.jsx
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../../hooks/useAuth";

const Settings = ({ user }) => {
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
  } = useForm({
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      domains: user?.domains?.join(", ") || "",
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPasswordForm,
  } = useForm();

  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const { logout } = useAuth();

  const onSubmitProfile = async (data) => {
    setIsLoading(true);
    try {
      // Process domains - if empty string, set to empty array
      const domainsArray = data.domains
        ? data.domains
            .split(",")
            .map((domain) => domain.trim())
            .filter((domain) => domain.length > 0)
        : [];

      const updatedData = {
        ...data,
        domains: domainsArray,
      };

      // Use the correct endpoint
      const response = await axios.put(
        "https://api.cleanpc.xyz/api/auth/profile",
        updatedData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // Update local storage with new user data
      const updatedUser = response.data;
      localStorage.setItem("user", JSON.stringify(updatedUser));

      toast.success("Profile updated successfully!");

      // Reload the page to reflect changes in the app
      window.location.reload();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitPassword = async (data) => {
    setIsPasswordLoading(true);
    try {
      await axios.put(
        "https://api.cleanpc.xyz/api/auth/change-password",
        data,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      toast.success("Password changed successfully! Please login again.");
      resetPasswordForm();
      setTimeout(() => {
        logout();
      }, 2000);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to change password");
    } finally {
      setIsPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium mb-6">Profile Settings</h3>
        <form onSubmit={handleSubmitProfile(onSubmitProfile)}>
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Name
              </label>
              <input
                type="text"
                id="name"
                {...registerProfile("name", { required: "Name is required" })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              {profileErrors.name && (
                <p className="mt-1 text-sm text-red-600">
                  {profileErrors.name.message}
                </p>
              )}
            </div>

            <div className="sm:col-span-3">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                {...registerProfile("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              {profileErrors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {profileErrors.email.message}
                </p>
              )}
            </div>

            <div className="sm:col-span-6">
              <label
                htmlFor="domains"
                className="block text-sm font-medium text-gray-700"
              >
                Your Domains (comma separated)
              </label>
              <input
                type="text"
                id="domains"
                {...registerProfile("domains")} // Removed required validation
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="example1.com, example2.com (optional)"
              />
              <p className="mt-1 text-sm text-gray-500">
                Optional: Add your domains separated by commas
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium mb-6">Change Password</h3>
        <form onSubmit={handleSubmitPassword(onSubmitPassword)}>
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label
                htmlFor="currentPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Current Password
              </label>
              <input
                type="password"
                id="currentPassword"
                {...registerPassword("currentPassword", {
                  required: "Current password is required",
                })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              {passwordErrors.currentPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {passwordErrors.currentPassword.message}
                </p>
              )}
            </div>

            <div className="sm:col-span-3">
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-gray-700"
              >
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                {...registerPassword("newPassword", {
                  required: "New password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters",
                  },
                })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              {passwordErrors.newPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {passwordErrors.newPassword.message}
                </p>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={isPasswordLoading}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isPasswordLoading ? "Changing..." : "Change Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
