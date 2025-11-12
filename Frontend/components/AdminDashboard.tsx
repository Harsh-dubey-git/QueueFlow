import React, { useContext, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { QueueContext } from "../App";
import { QueueMode } from "../types";
import Card from "./common/Card";
import Button from "./common/Button";
import Toast from "./common/Toast";
import { Activity, Users, Clock, Building2, DoorOpen } from "lucide-react";

// ✅ Import backend APIs
import { getAllTickets, resetQueue, updateTicketStatus } from "../api/api";

interface AdminDashboardProps {
  onNavigateToRoom: (roomId: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onNavigateToRoom,
}) => {
  const queueContext = useContext(QueueContext);
  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string>("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  if (!queueContext) return <div>Loading...</div>;
  const { state, actions } = queueContext;

  // ---- Fetch tickets from backend ----
  const fetchTickets = async () => {
    const data = await getAllTickets();
    setTickets(data);
  };

  useEffect(() => {
    fetchTickets();
    const interval = setInterval(fetchTickets, 8000); // auto-refresh every 8s
    return () => clearInterval(interval);
  }, []);

  // ---- Metrics from DB ----
  const totalTickets = tickets.length;
  const servingTickets = tickets.filter((t) => t.status === "serving");
  const waitingTickets = tickets.filter((t) => t.status === "waiting");
  const completedTickets = tickets.filter((t) => t.status === "done");
  const currentServing =
    servingTickets.length > 0
      ? servingTickets[servingTickets.length - 1].tokenNumber
      : "---";

  const waitingCount = waitingTickets.length;

  // ---- Handlers ----
  const handleModeToggle = () => {
    const newMode =
      state.mode === QueueMode.OneStage
        ? QueueMode.TwoStage
        : QueueMode.OneStage;
    actions.setMode(newMode);
    setToastMessage(
      `Switched to ${
        newMode === QueueMode.OneStage ? "One-Stage" : "Two-Stage"
      } Mode`
    );
    setShowToast(true);
  };

  const handleResetQueue = async () => {
    await resetQueue();
    await fetchTickets();
    setToastMessage("✅ Queue reset successfully");
    setShowToast(true);
  };

  const handleCallNext = async () => {
    const nextTicket = waitingTickets[0];
    if (!nextTicket) {
      setToastMessage("No waiting patients!");
      setShowToast(true);
      return;
    }
    await updateTicketStatus(nextTicket._id, "serving");
    await fetchTickets();
    setToastMessage(`Now serving ticket #${nextTicket.tokenNumber}`);
    setShowToast(true);
  };

  const handleAssign = async () => {
    if (!selectedRoom || waitingTickets.length === 0) return;

    const nextTicket = waitingTickets[0];
    await updateTicketStatus(nextTicket._id, "serving", selectedRoom);
    await fetchTickets();
    setToastMessage(
      `Ticket #${nextTicket.tokenNumber} assigned to ${selectedRoom}`
    );
    setSelectedRoom("");
    setShowToast(true);
  };

  // ---- Main UI ----
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 pb-16">
      <Toast
        message={toastMessage}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        type="success"
      />

      {/* Header */}
      <div className="flex flex-wrap justify-between items-center px-6 pt-8 mb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800">
            🏥 Staff Dashboard
          </h1>
          <p className="text-slate-500 mt-1">
            Monitor and manage queues efficiently
          </p>
        </div>
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <Button
            onClick={handleResetQueue}
            variant="danger"
            className="px-4 py-2"
          >
            Reset Queue
          </Button>

          <Button
            onClick={handleModeToggle}
            variant="secondary"
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-teal-600 text-white"
          >
            Switch Mode
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 px-6 mb-6">
        <StatCard
          icon={<Users />}
          title="Total Tokens"
          value={totalTickets}
          color="blue"
        />
        <StatCard
          icon={<Activity />}
          title="Currently Serving"
          value={currentServing}
          color="green"
        />
        <StatCard
          icon={<Clock />}
          title="Waiting"
          value={waitingCount}
          color="amber"
        />
        <StatCard
          icon={<Building2 />}
          title="Completed"
          value={completedTickets.length}
          color="teal"
        />
      </div>

      {/* Queue Mode */}
      <div className="container mx-auto max-w-6xl space-y-6 px-4 sm:px-6">
        <Card>
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <div className="text-center sm:text-left mb-4 sm:mb-0">
              <h3 className="text-lg font-semibold text-slate-700">
                Queue Mode
              </h3>
              <p className="text-slate-600">
                Current Mode:{" "}
                <span
                  className={`font-bold ${
                    state.mode === QueueMode.OneStage
                      ? "text-green-600"
                      : "text-indigo-700"
                  }`}
                >
                  {state.mode === QueueMode.OneStage
                    ? "One-Stage"
                    : "Two-Stage"}
                </span>
              </p>
            </div>
            <Button
              onClick={handleModeToggle}
              className="bg-gradient-to-r from-blue-600 to-teal-600 text-white font-semibold px-6 py-2 rounded-lg shadow"
            >
              Switch Mode
            </Button>
          </div>
        </Card>

        {/* One-Stage Queue */}
        {state.mode === QueueMode.OneStage ? (
          <Card title="One-Stage Queue Control" className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-slate-600 mb-2">Currently Serving</p>
              <motion.p
                key={currentServing}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="text-6xl font-bold text-green-600 mb-6"
              >
                {currentServing || "---"}
              </motion.p>

              <Button
                onClick={handleCallNext}
                className="px-10 py-3 text-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl shadow-lg transition-all"
              >
                Call Next Patient
              </Button>
            </motion.div>
          </Card>
        ) : (
          // Two-Stage Queue Layout
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="md:col-span-2 lg:col-span-1"
            >
              <Card title="Waiting Room Control" className="h-full">
                <div className="space-y-4 text-center">
                  <div>
                    <p className="text-slate-600">Tickets Waiting</p>
                    <p className="text-4xl font-bold text-blue-600">
                      {waitingCount}
                    </p>
                  </div>

                  <Button
                    onClick={handleAssign}
                    disabled={waitingCount === 0 || !selectedRoom}
                    fullWidth
                    className="mt-2"
                  >
                    Assign Next to Room
                  </Button>

                  <hr className="my-4 border-slate-200" />

                  <div className="space-y-3 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                    <p className="text-slate-600">Select Room</p>
                    <select
                      value={selectedRoom}
                      onChange={(e) => setSelectedRoom(e.target.value)}
                      className="block w-full pl-3 pr-8 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    >
                      <option value="" disabled>
                        Select Room
                      </option>
                      {Array.from(state.rooms.values()).map((room) => (
                        <option key={room.id} value={room.id}>
                          {room.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Rooms */}
            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {Array.from(state.rooms.values()).map((room) => (
                <motion.div
                  key={room.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card
                    title={room.name}
                    className={`hover:shadow-lg transition-all border ${
                      room.currentlyServing
                        ? "border-green-400 bg-green-50"
                        : room.queue.length > 0
                        ? "border-blue-300 bg-blue-50"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <div className="space-y-3">
                      <p className="text-slate-600">
                        Patients in Queue:{" "}
                        <span className="font-bold">{room.queue.length}</span>
                      </p>
                      <p className="text-slate-600">
                        Next Ticket:{" "}
                        <span className="font-bold text-blue-700">
                          {room.queue[0] || "---"}
                        </span>
                      </p>
                      <p className="text-slate-600">
                        Currently Serving:{" "}
                        <span className="font-bold text-teal-700">
                          {room.currentlyServing || "---"}
                        </span>
                      </p>

                      <Button
                        onClick={() => onNavigateToRoom(room.id)}
                        fullWidth
                        className="mt-2 flex items-center justify-center space-x-2"
                      >
                        <DoorOpen className="w-4 h-4" />
                        <span>Manage {room.name}</span>
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="text-center text-gray-400 text-sm mt-12 pb-6">
        © 2025 QueueFlow | Smart Queueing for Hospitals & Clinics
      </footer>
    </div>
  );
};

// ✅ Subcomponent for stats
const StatCard: React.FC<{
  icon: JSX.Element;
  title: string;
  value: any;
  color: string;
}> = ({ icon, title, value, color }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className={`bg-white/90 backdrop-blur-sm shadow-md rounded-xl p-4 border-t-4 border-${color}-400`}
  >
    <div className="flex items-center space-x-3">
      <span className={`text-${color}-500`}>{icon}</span>
      <div>
        <p className="text-sm text-slate-500">{title}</p>
        <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
      </div>
    </div>
  </motion.div>
);

export default AdminDashboard;
