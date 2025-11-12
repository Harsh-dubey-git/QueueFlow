import React, { useContext } from 'react';
import { QueueContext } from '../App';
import Card from './common/Card';
import Button from './common/Button';

interface RoomPageProps {
  roomId: string;
  onBack: () => void;
}

const RoomPage: React.FC<RoomPageProps> = ({ roomId, onBack }) => {
  const queueContext = useContext(QueueContext);

  if (!queueContext) return <div>Loading...</div>;
  const { state, actions } = queueContext;

  const room = state.rooms.get(roomId);

  if (!room) {
    return (
      <div>
        <p>Room not found.</p>
        <Button onClick={onBack} variant="secondary">Back to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl space-y-6">
       <div>
        <Button onClick={onBack} variant="secondary">
          &larr; Back to Dashboard
        </Button>
      </div>

      <Card title={`Managing ${room.name}`}>
        <div className="text-center">
          <p className="text-slate-600">Currently Serving</p>
          <p className="text-7xl font-bold my-4 text-teal-700">{room.currentlyServing || '---'}</p>
          <Button onClick={() => actions.callNextInRoom(room.id)} disabled={room.queue.length === 0} className="px-8 py-3 text-lg">
            Call Next in Room
          </Button>
          {room.queue.length === 0 && <p className="text-sm text-slate-500 mt-2">The queue for this room is empty.</p>}
        </div>
      </Card>
      
      <Card title="Room Queue">
        {room.queue.length > 0 ? (
          <ul className="space-y-2">
            {room.queue.map((ticketId, index) => (
              <li key={ticketId} className={`flex items-center justify-between p-3 rounded-lg ${index === 0 ? 'bg-indigo-100' : 'bg-slate-50'}`}>
                <span className={`font-bold text-lg ${index === 0 ? 'text-indigo-700' : ''}`}>Ticket #{ticketId}</span>
                {index === 0 && <span className="text-sm font-semibold text-indigo-700 bg-indigo-200 px-2 py-1 rounded-full">Up Next</span>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-slate-500 text-center py-4">No tickets in this room's queue.</p>
        )}
      </Card>
    </div>
  );
};

export default RoomPage;