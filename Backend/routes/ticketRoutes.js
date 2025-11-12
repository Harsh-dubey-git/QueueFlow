import express from "express";
import {
  createTicket,
  getAllTickets,
  updateTicketStatus,
  resetQueue,
} from "../controllers/ticketController.js";

const router = express.Router();

router.post("/create", createTicket); // POST → Create new ticket
router.get("/", getAllTickets); // GET  → Get all tickets
router.put("/:id/status", updateTicketStatus); // PUT  → Update ticket
router.delete("/reset", resetQueue); // DELETE → Reset queue

export default router;
