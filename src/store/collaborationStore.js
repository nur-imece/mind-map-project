import { create } from 'zustand';
import * as signalR from '@microsoft/signalr';

const useCollaborationStore = create((set, get) => ({
  connection: null,
  activeUsers: [],
  currentUser: null,

  initializeConnection: async (userId, userName, mindMapId) => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl("/collaborationHub") // Backend'deki hub URL'inizi buraya yazın
      .withAutomaticReconnect()
      .build();

    connection.on("UserJoined", (user) => {
      set((state) => ({
        activeUsers: [...state.activeUsers, user]
      }));
    });

    connection.on("UserLeft", (userId) => {
      set((state) => ({
        activeUsers: state.activeUsers.filter(u => u.id !== userId)
      }));
    });

    connection.on("UpdateMindMap", (update) => {
      // MindMap store'daki update fonksiyonunu çağır
      // mindMapStore.getState().updateFromCollaboration(update);
    });

    try {
      await connection.start();
      await connection.invoke("JoinMindMap", {
        userId,
        userName,
        mindMapId,
        color: getRandomColor(),
      });

      set({ connection });
    } catch (err) {
      console.error("SignalR Connection Error: ", err);
    }
  },

  sendUpdate: async (update) => {
    const { connection } = get();
    if (connection) {
      try {
        await connection.invoke("SendUpdate", update);
      } catch (err) {
        console.error("Error sending update: ", err);
      }
    }
  },

  disconnect: async () => {
    const { connection } = get();
    if (connection) {
      try {
        await connection.stop();
        set({ connection: null, activeUsers: [] });
      } catch (err) {
        console.error("Error disconnecting: ", err);
      }
    }
  },
}));

function getRandomColor() {
  const colors = [
    '#1976d2', '#2196f3', '#03a9f4', '#00bcd4', '#009688',
    '#4caf50', '#8bc34a', '#cddc39', '#ffc107', '#ff9800',
    '#ff5722', '#f44336', '#e91e63', '#9c27b0', '#673ab7'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

export default useCollaborationStore; 