import express from "express";
import Ticket from "../models/Ticket.js";

const router = express.Router();

// Create new ticket
router.post("/create", async (req, res) => {
  try {
    const lastTicket = await Ticket.findOne().sort({ tokenNumber: -1 });
    const tokenNumber = lastTicket ? lastTicket.tokenNumber + 1 : 1;
    const newTicket = await Ticket.create({ tokenNumber });
    res.json(newTicket);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all tickets
router.get("/", async (req, res) => {
  try {
    const tickets = await Ticket.find().sort({ createdAt: -1 });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update status or assign room
router.put("/:id/status", async (req, res) => {
  try {
    const { status, room } = req.body;
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { status, room },
      { new: true }
    );
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reset (delete all tickets)
router.delete("/reset", async (req, res) => {
  try {
    await Ticket.deleteMany({});
    res.json({ message: "All tickets cleared successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
