import { useState, useEffect } from "react";
import {
  createTicket,
  getAllTickets,
  resetQueue,
  updateTicketStatus,
} from "../api/api";
import { QueueMode } from "../types";

export type Ticket = {
  _id: string;
  tokenNumber: number;
  status: "waiting" | "serving" | "done";
  room?: string | null;
  createdAt?: string;
};

export type QueueState = {
  tickets: Ticket[];
  mode: QueueMode;
  isAuthenticated: boolean;
  // legacy fields for your components compatibility
  oneStageServing?: number | null;
  waitingRoomTickets: Ticket[];
  rooms: Map<string, any>;
  ticketReadyForAssignment?: Ticket | null;
};

export const useQueueState = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [mode, setMode] = useState<QueueMode>(QueueMode.OneStage);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Fetch initial tickets and auto-refresh
  useEffect(() => {
    let mounted = true;
    const fetchTickets = async () => {
      try {
        const data = await getAllTickets();
        if (!mounted) return;
        setTickets(data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchTickets();
    const interval = setInterval(fetchTickets, 10_000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const takeTicket = async () => {
    const newTicket = await createTicket();
    setTickets((p) => [...p, newTicket]);
    return newTicket;
  };

  const changeTicketStatus = async (
    id: string,
    status: string,
    room?: string
  ) => {
    const updated = await updateTicketStatus(id, status, room);
    setTickets((p) => p.map((t) => (t._id === id ? updated : t)));
    return updated;
  };

  const clearQueue = async () => {
    await resetQueue();
    setTickets([]);
  };

  // --- helpers to keep compatibility with your components that expect rooms/map etc.
  const waitingRoomTickets = tickets.filter((t) => t.status === "waiting");
  const oneStageServingTicket = tickets.find((t) => t.status === "serving");
  const oneStageServing = oneStageServingTicket
    ? oneStageServingTicket.tokenNumber
    : null;

  // simple rooms mapping derived from tickets.room
  const roomsMap = new Map<string, any>();
  tickets.forEach((t) => {
    if (t.room) {
      const r = roomsMap.get(t.room) || {
        id: t.room,
        name: t.room,
        queue: [],
        currentlyServing: null,
      };
      if (t.status === "serving") r.currentlyServing = t.tokenNumber;
      if (t.status === "waiting") r.queue.push(t.tokenNumber);
      roomsMap.set(t.room, r);
    }
  });

  // If you want default rooms (pre-created), ensure they exist — optional:
  // e.g., ["Room 1","Room 2"].forEach(...)

  const ticketReadyForAssignment = waitingRoomTickets.length
    ? waitingRoomTickets[0]
    : null;

  const state = {
    tickets,
    mode,
    isAuthenticated,
    oneStageServing,
    waitingRoomTickets,
    rooms: roomsMap,
    ticketReadyForAssignment,
  };

  const actions = {
    takeTicket,
    updateTicketStatus: changeTicketStatus,
    resetQueue: clearQueue,
    setMode,
    setIsAuthenticated,
    // You may keep placeholders for other actions your components call
    callNextOneStage: async () => {
      const waiting = tickets.find((t) => t.status === "waiting");
      if (waiting) await changeTicketStatus(waiting._id, "serving");
    },
    callNextForAssignment: async () => {
      // moves first waiting to ticketReadyForAssignment (no DB change until assignment)
      // in our model ticketReadyForAssignment is computed from waitingRoomTickets[0], so nothing needed
    },
    assignTicketToRoom: async (ticketId: string, roomId: string) => {
      await changeTicketStatus(ticketId, "serving", roomId);
    },
    callNextInRoom: async (roomId: string) => {
      // find waiting ticket assigned to this room (room-specific waiting)
      const next = tickets.find(
        (t) => t.room === roomId && t.status === "waiting"
      );
      if (next) await changeTicketStatus(next._id, "serving", roomId);
    },
  };

  return { state, actions };
};
