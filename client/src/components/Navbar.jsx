import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeftOnRectangleIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../hooks/useAuth";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/">
                <span className="text-xl font-bold text-indigo-600">
                  LinkTracker
                </span>
              </Link>
            </div>
          </div>
          {user && (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">{user.email}</span>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-1 text-sm text-gray-700 hover:text-gray-900"
              >
                <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-1" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
