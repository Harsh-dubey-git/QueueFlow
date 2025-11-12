import React from "react";
import { motion } from "framer-motion";

const Footer: React.FC = () => {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="mt-auto py-6 border-t border-slate-200 bg-white/50 backdrop-blur-sm"
    >
      <div className="container mx-auto px-4 sm:px-6 md:px-8 text-center">
        <p className="text-sm text-slate-600">
          © 2025 QueueFlow | Smart Queueing for Hospitals & Clinics
        </p>
      </div>
    </motion.footer>
  );
};

export default Footer;
