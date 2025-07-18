// WebSocket service with lazy loading to avoid initialization issues
let stompClient = null;
let isConnected = false;

// Lazy import function for WebSocket dependencies
const getWebSocketDependencies = async () => {
  try {
    const { Client } = await import('@stomp/stompjs');
    const SockJS = await import('sockjs-client');
    return { Client, SockJS: SockJS.default };
  } catch (error) {
    console.error('Failed to load WebSocket dependencies:', error);
    return null;
  }
};

export const websocketService = {
  connect: async (onConnected, onError) => {
    try {
      const deps = await getWebSocketDependencies();
      if (!deps) {
        console.error('WebSocket dependencies not available');
        return;
      }

      const { Client, SockJS } = deps;
      
      stompClient = new Client({
        webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
        connectHeaders: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        debug: (str) => {
          console.log('WebSocket Debug:', str);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onConnect: (frame) => {
          console.log('WebSocket Connected:', frame);
          isConnected = true;
          if (onConnected) onConnected(frame);
        },
        onStompError: (frame) => {
          console.error('WebSocket Error:', frame);
          isConnected = false;
          if (onError) onError(frame);
        },
        onWebSocketClose: (event) => {
          console.log('WebSocket Closed:', event);
          isConnected = false;
        },
        onWebSocketError: (error) => {
          console.error('WebSocket Error:', error);
          isConnected = false;
          if (onError) onError(error);
        },
      });

      stompClient.activate();
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      if (onError) onError(error);
    }
  },

  disconnect: () => {
    if (stompClient && isConnected) {
      stompClient.deactivate();
      stompClient = null;
      isConnected = false;
      console.log('WebSocket Disconnected');
    }
  },

  isConnected: () => isConnected,

  subscribe: (topic, callback) => {
    if (stompClient && isConnected) {
      return stompClient.subscribe(topic, callback);
    } else {
      console.warn('WebSocket not connected. Cannot subscribe to:', topic);
      return null;
    }
  },

  publish: (destination, body = {}) => {
    if (stompClient && isConnected) {
      stompClient.publish({
        destination,
        body: JSON.stringify(body),
      });
    } else {
      console.warn('WebSocket not connected. Cannot publish to:', destination);
    }
  },

  // Chat specific methods
  sendChatMessage: (message) => {
    websocketService.publish('/app/chat.sendMessage', message);
  },

  sendPrivateMessage: (message) => {
    websocketService.publish('/app/chat.private', message);
  },

  joinRoom: (roomId) => {
    websocketService.publish(`/app/room/${roomId}/join`, {});
  },

  leaveRoom: (roomId) => {
    websocketService.publish(`/app/room/${roomId}/leave`, {});
  },

  sendRoomMessage: (roomId, message) => {
    websocketService.publish(`/app/room/${roomId}/sendMessage`, message);
  },
};

export default websocketService;
