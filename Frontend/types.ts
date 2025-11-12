export interface Ticket {
  id: number;
  status: 'waiting' | 'ready_for_assignment' | 'assigned' | 'serving' | 'done';
}

export interface Room {
  id: string;
  name: string;
  queue: number[]; // Store ticket IDs
  currentlyServing: number | null;
}

export enum QueueMode {
  OneStage = 'one-stage',
  TwoStage = 'two-stage',
}

export enum View {
  Landing = 'landing',
  Login = 'login',
  Admin = 'admin',
  Room = 'room',
}