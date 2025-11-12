import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    tokenNumber: { type: Number, required: true },
    status: {
      type: String,
      enum: ["waiting", "serving", "done"],
      default: "waiting",
    },
    room: { type: String, default: null },
  },
  { timestamps: true }
);

const Ticket = mongoose.model("Ticket", ticketSchema);
export default Ticket;
