const API_BASE =
  import.meta.env.VITE_API_BASE || "http://localhost:5000/api/tickets";

// Create Ticket
export async function createTicket() {
  const res = await fetch(`${API_BASE}/create`, { method: "POST" });
  if (!res.ok) throw new Error("Create ticket failed");
  return res.json();
}

// Get All Tickets
export async function getAllTickets() {
  const res = await fetch(`${API_BASE}`);
  if (!res.ok) throw new Error("Fetch tickets failed");
  return res.json();
}

// Update Ticket
export async function updateTicketStatus(id: string, status: string, room?: string) {
  const res = await fetch(`${API_BASE}/${id}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, room }),
  });
  if (!res.ok) throw new Error("Update ticket failed");
  return res.json();
}

// Reset Queue
export async function resetQueue() {
  const res = await fetch(`${API_BASE}/reset`, { method: "DELETE" });
  if (!res.ok) throw new Error("Reset failed");
  return res.json();
}
