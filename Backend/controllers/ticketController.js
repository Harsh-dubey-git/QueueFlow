import Ticket from "../models/Ticket.js";

// Create new ticket
export const createTicket = async (req, res) => {
  try {
    const lastTicket = await Ticket.findOne().sort({ tokenNumber: -1 });
    const tokenNumber = lastTicket ? lastTicket.tokenNumber + 1 : 1;
    const newTicket = await Ticket.create({ tokenNumber });
    res.status(201).json(newTicket);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all tickets
export const getAllTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find().sort({ createdAt: -1 });
    res.status(200).json(tickets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update status or assign room
export const updateTicketStatus = async (req, res) => {
  try {
    const { status, room } = req.body;
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { status, room },
      { new: true }
    );
    res.status(200).json(ticket);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Reset queue (delete all)
export const resetQueue = async (req, res) => {
  try {
    await Ticket.deleteMany({});
    res.status(200).json({ message: "✅ Queue reset successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
