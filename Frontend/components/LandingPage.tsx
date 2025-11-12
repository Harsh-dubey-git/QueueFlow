import React, { useContext, useMemo, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { QueueContext } from "../App";
import Card from "./common/Card";
import Button from "./common/Button";
import Toast from "./common/Toast";
import { LOCAL_STORAGE_KEY } from "../constants";

const LandingPage: React.FC = () => {
  const queueContext = useContext(QueueContext);
  const [myTicketId, setMyTicketId] = useState<number | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [currentServing, setCurrentServing] = useState<number | null>(null);
  const [averageTimePerPatient] = useState<number>(
    Math.floor(Math.random() * 3) + 2 // 2–4 minutes per patient
  );
  const [estimatedWait, setEstimatedWait] = useState<number | null>(null);
  const [joinedQueue, setJoinedQueue] = useState(false);

  const simulationRef = useRef<NodeJS.Timeout | null>(null);
  const isRunning = useRef(false);

  if (!queueContext) return <div>Loading...</div>;
  const { state, actions } = queueContext;

  // ⏱️ Simulation Config
  const DEMO_MODE = true; // set false for real timing
  const ONE_MINUTE = DEMO_MODE ? 15000 : 60000; // 15s = 1 min demo

  const handleTakeTicket = async () => {
    try {
      const newTicket = await actions.takeTicket();
      const tokenNumber = newTicket.tokenNumber; // Use tokenNumber, not _id
      setMyTicketId(tokenNumber);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tokenNumber));
      setShowToast(true);
      setJoinedQueue(true);

      // Initialize simulation based on current queue state
      const currentServingValue =
        state.oneStageServing ||
        Math.max(1, tokenNumber - (Math.floor(Math.random() * 4) + 2));
      setCurrentServing(currentServingValue);

      const initialWait = Math.max(
        2,
        (tokenNumber - currentServingValue) * averageTimePerPatient
      );
      setEstimatedWait(initialWait);

      startSimulation(tokenNumber, currentServingValue);
    } catch (err) {
      console.error("Failed to create ticket:", err);
    }
  };

  const handleLeaveQueue = () => {
    setMyTicketId(null);
    setCurrentServing(null);
    setEstimatedWait(null);
    setJoinedQueue(false);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    if (simulationRef.current) clearTimeout(simulationRef.current);
    isRunning.current = false;
  };

  const startSimulation = (token: number, startServing: number) => {
    if (isRunning.current) return;
    isRunning.current = true;

    const serveNext = () => {
      setCurrentServing((prev) => {
        if (prev === null || prev >= token) {
          setEstimatedWait(0);
          isRunning.current = false;
          return prev;
        }
        return prev + 1;
      });
      setEstimatedWait((prev) => (prev && prev > 0 ? prev - 1 : 0));

      simulationRef.current = setTimeout(
        serveNext,
        averageTimePerPatient * ONE_MINUTE
      );
    };
    simulationRef.current = setTimeout(
      serveNext,
      averageTimePerPatient * ONE_MINUTE
    );
  };

  // Sync with real queue state from backend
  useEffect(() => {
    if (myTicketId && state.oneStageServing !== null) {
      // Update currentServing from real backend state
      setCurrentServing(state.oneStageServing);

      // Recalculate wait time
      const waitingCount = Math.max(0, myTicketId - state.oneStageServing);
      const newWaitTime =
        waitingCount > 0
          ? Math.max(2, waitingCount * averageTimePerPatient)
          : 0;
      setEstimatedWait(newWaitTime);
    }
  }, [state.oneStageServing, myTicketId, averageTimePerPatient]);

  // Initialize from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const tokenNum = JSON.parse(stored);
        if (typeof tokenNum === "number" && !isNaN(tokenNum)) {
          setMyTicketId(tokenNum);
          setJoinedQueue(true);

          // Find the ticket in state to get current status
          const myTicket = state.tickets.find(
            (t) => t.tokenNumber === tokenNum
          );
          if (myTicket) {
            const currentServingValue =
              state.oneStageServing || Math.max(1, tokenNum - 3);
            setCurrentServing(currentServingValue);
            const initialWait = Math.max(
              2,
              (tokenNum - currentServingValue) * averageTimePerPatient
            );
            setEstimatedWait(initialWait);
          }
        }
      }
    } catch (e) {
      console.error("Error loading stored token:", e);
    }
  }, [state.tickets, state.oneStageServing, averageTimePerPatient]); // Run when state updates

  // Cleanup simulation on unmount
  useEffect(() => {
    return () => {
      if (simulationRef.current) clearTimeout(simulationRef.current);
    };
  }, []);

  const queueMetrics = useMemo(() => {
    if (!myTicketId || currentServing === null || estimatedWait === null)
      return null;

    // Use real backend state if available, otherwise use simulation
    const actualServing =
      state.oneStageServing !== null ? state.oneStageServing : currentServing;
    const waitingCount = Math.max(0, myTicketId - actualServing);

    // Progress calculation: (currentServing / yourToken) * 100
    const progress =
      actualServing >= myTicketId
        ? 100
        : Math.min(100, Math.max(0, (actualServing / myTicketId) * 100));

    // Recalculate wait time based on actual serving
    const calculatedWait =
      waitingCount > 0 ? Math.max(2, waitingCount * averageTimePerPatient) : 0;

    return {
      currentServing: actualServing,
      yourToken: myTicketId,
      waitingCount,
      estimatedWait: actualServing >= myTicketId ? 0 : calculatedWait,
      progress: Math.round(progress),
      isYourTurn: actualServing >= myTicketId,
    };
  }, [
    myTicketId,
    currentServing,
    estimatedWait,
    state.oneStageServing,
    averageTimePerPatient,
  ]);

  // Animated Number
  const AnimatedNumber = ({
    value,
    prefix = "#",
    className = "",
  }: {
    value: number | string;
    prefix?: string;
    className?: string;
  }) => {
    const [displayValue, setDisplayValue] = useState(value);
    useEffect(() => setDisplayValue(value), [value]);
    return (
      <motion.p
        className={className}
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 0.3 }}
      >
        {prefix}
        {displayValue}
      </motion.p>
    );
  };

  // 💡 Landing Visuals
  const HeroAnimation = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1 }}
      className="relative mx-auto w-64 h-64 sm:w-80 sm:h-80"
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-tr from-blue-200 to-teal-200 rounded-full blur-2xl opacity-60"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.6, 0.8, 0.6],
        }}
        transition={{ repeat: Infinity, duration: 6 }}
      />
      <motion.svg
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute w-full h-full"
      >
        <motion.path
          fill="#2563EB"
          d="M43.7,-60.5C56.2,-52.6,66.3,-42.1,72.8,-29.3C79.3,-16.4,82.2,-1.3,80.4,13.2C78.5,27.7,72,41.6,61.2,52.8C50.4,64,35.3,72.5,19.2,74.8C3.1,77,-13.9,73.1,-29,66.1C-44.2,59.1,-57.4,49,-65.7,35.7C-74.1,22.3,-77.6,5.6,-75.2,-10.2C-72.9,-26,-64.6,-40.9,-52.5,-49.1C-40.5,-57.3,-24.8,-58.9,-9.6,-63.4C5.5,-67.9,20.9,-75.2,43.7,-60.5Z"
          transform="translate(100 100)"
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            repeat: Infinity,
            duration: 30,
            ease: "linear",
          }}
        />
      </motion.svg>
    </motion.div>
  );

  return (
    <>
      <Toast
        message="Your queue number has been generated!"
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        type="success"
      />

      <div className="min-h-[calc(100vh-200px)] bg-gradient-to-br from-blue-50 via-white to-blue-100">
        <div className="container mx-auto max-w-6xl px-6 py-16">
          {!myTicketId || !queueMetrics ? (
            // 💙 Landing Page Section
            <div className="flex flex-col items-center text-center space-y-10">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-800"
              >
                Join the hospital queue digitally
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-lg text-slate-600 max-w-2xl"
              >
                Skip waiting rooms — get your token instantly and track it live.
              </motion.p>
              <HeroAnimation />
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={handleTakeTicket}
                  className="px-10 py-5 text-xl font-semibold bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-lg shadow-lg"
                >
                  🎟️ Join the Queue
                </Button>
              </motion.div>

              {/* 💡 How It Works Section */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 w-full max-w-3xl">
                {[
                  { title: "Take Token", desc: "Generate your digital token" },
                  {
                    title: "Track Live",
                    desc: "Monitor current serving number",
                  },
                  {
                    title: "Get Notified",
                    desc: "Receive alerts when it’s your turn",
                  },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + i * 0.2 }}
                    className="bg-white shadow-md rounded-xl p-6"
                  >
                    <p className="text-xl font-bold text-blue-600 mb-2">
                      {item.title}
                    </p>
                    <p className="text-slate-600">{item.desc}</p>
                  </motion.div>
                ))}
              </div>

              <footer className="text-sm text-gray-400 pt-8">
                © 2025 QueueFlow | Smart Queueing for Hospitals & Clinics
              </footer>
            </div>
          ) : (
            // 🏥 Queue Status Page
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <div className="text-center">
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-2">
                  Your Queue Status
                </h2>
                <p className="text-lg text-slate-600">
                  Track your token in real-time
                </p>
              </div>

              <AnimatePresence>
                {queueMetrics.isYourTurn && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="bg-green-500 text-white p-6 rounded-xl text-center shadow-xl font-semibold"
                  >
                    🎉 It's your turn! Please proceed to the counter. 🎉
                  </motion.div>
                )}
              </AnimatePresence>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 overflow-hidden">
                <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  {/* Left Info */}
                  <div className="space-y-6">
                    <div className="bg-green-50 p-6 rounded-xl shadow border border-green-200">
                      <p className="text-sm font-semibold text-green-700 mb-2">
                        Now Serving
                      </p>
                      <AnimatedNumber
                        value={queueMetrics.currentServing}
                        className="text-4xl sm:text-5xl font-bold text-green-600"
                      />
                    </div>
                    <div className="bg-blue-50 p-6 rounded-xl shadow border border-blue-200">
                      <p className="text-sm font-semibold text-blue-700 mb-2">
                        Your Token
                      </p>
                      <p className="text-4xl sm:text-5xl font-bold text-blue-600">
                        #{queueMetrics.yourToken}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-xl shadow border border-gray-200">
                      <p className="text-sm font-semibold text-gray-700 mb-2">
                        Estimated Wait Time
                      </p>
                      <AnimatedNumber
                        value={queueMetrics.estimatedWait}
                        prefix=""
                        className="text-4xl sm:text-5xl font-bold text-gray-700"
                      />
                      <p className="text-sm text-gray-600 mt-2">mins</p>
                    </div>
                  </div>

                  {/* Right Progress */}
                  <div className="flex flex-col items-center justify-center space-y-6">
                    <div className="w-48 h-48 sm:w-56 sm:h-56">
                      <CircularProgressbar
                        value={queueMetrics.progress}
                        text={`${queueMetrics.progress}%`}
                        styles={buildStyles({
                          pathColor:
                            queueMetrics.progress >= 80 ? "#10B981" : "#2563EB",
                          textColor: "#1F2937",
                          trailColor: "#E5E7EB",
                          textSize: "20px",
                        })}
                      />
                    </div>
                    <Button
                      onClick={handleLeaveQueue}
                      className="bg-red-100 text-red-700 px-6 py-2 rounded-lg text-sm hover:bg-red-200 transition"
                    >
                      Leave Queue
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
};

export default LandingPage;
