import React from "react";
import { motion } from "framer-motion";
import Button from "./Button";
import { View } from "../../types";

interface HeaderProps {
  isAuthenticated: boolean;
  onLogout: () => void;
  onHomeClick: () => void;
  onLoginClick: () => void;
  currentView: View;
  onDashboardClick: () => void;
}

const Header: React.FC<HeaderProps> = ({
  isAuthenticated,
  onLogout,
  onHomeClick,
  onLoginClick,
  currentView,
  onDashboardClick,
}) => {
  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="bg-white/80 backdrop-blur-md shadow-lg border-b border-slate-200/50 sticky top-0 z-40"
    >
      <div className="container mx-auto px-4 sm:px-6 md:px-8 py-4 flex justify-between items-center">
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center space-x-3 cursor-pointer group"
          onClick={onHomeClick}
        >
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="relative"
          >
            <svg
              className="w-10 h-10 text-blue-600 group-hover:text-blue-700 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            <motion.div
              className="absolute -top-1 -right-1 w-3 h-3 bg-teal-500 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </motion.div>
          <div className="flex flex-col">
            <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
              QueueFlow for Hospitals
            </h1>
            <p className="text-xs text-slate-500 hidden sm:block">
              Smart Patient Queueing for Clinics & Diagnostic Centers
            </p>
          </div>
        </motion.div>
        <div className="flex items-center space-x-2">
          {isAuthenticated ? (
            <>
              {currentView === View.Landing && (
                <Button onClick={onDashboardClick} variant="secondary">
                  Dashboard
                </Button>
              )}
              <Button onClick={onLogout} variant="secondary">
                Logout
              </Button>
            </>
          ) : (
            <Button
              onClick={onLoginClick}
              variant="secondary"
              className="border-2 border-blue-600 text-blue-600 bg-transparent hover:bg-blue-50"
            >
              Staff Login
            </Button>
          )}
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
