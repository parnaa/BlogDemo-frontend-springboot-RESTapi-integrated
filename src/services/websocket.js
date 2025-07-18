import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { WEBSOCKET_CONFIG } from '../config/api';

class WebSocketService {
  constructor() {
    this.client = null;
    this.connected = false;
    this.subscriptions = new Map();
    this.currentUser = null;
  }

  connect(username = null) {
    this.currentUser = username;
    return new Promise((resolve, reject) => {
      try {
        this.client = new Client({
          webSocketFactory: () => new SockJS(WEBSOCKET_CONFIG.URL),
          debug: (str) => {
            console.log('WebSocket Debug:', str);
          },
          onConnect: (frame) => {
            console.log('WebSocket Connected:', frame);
            this.connected = true;
            resolve();
          },
          onDisconnect: (frame) => {
            console.log('WebSocket Disconnected:', frame);
            this.connected = false;
          },
          onStompError: (frame) => {
            console.error('WebSocket Error:', frame);
            reject(new Error('WebSocket connection failed'));
          },
        });

        this.client.activate();
      } catch (error) {
        reject(error);
      }
    });
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.subscriptions.clear();
      this.connected = false;
    }
  }

  subscribe(topic, callback) {
    if (!this.connected) {
      console.warn('WebSocket not connected');
      return null;
    }

    const subscription = this.client.subscribe(topic, (message) => {
      try {
        const data = JSON.parse(message.body);
        callback(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
        callback(message.body);
      }
    });

    this.subscriptions.set(topic, subscription);
    return subscription;
  }

  unsubscribe(topic) {
    const subscription = this.subscriptions.get(topic);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(topic);
    }
  }

  send(destination, message) {
    if (!this.connected) {
      console.warn('WebSocket not connected');
      return;
    }

    this.client.publish({
      destination,
      body: JSON.stringify(message),
    });
  }

  // Public Chat Methods
  subscribeToPublicChat(callback) {
    return this.subscribe(WEBSOCKET_CONFIG.TOPICS.PUBLIC_CHAT, callback);
  }

  sendPublicMessage(message) {
    this.send(WEBSOCKET_CONFIG.DESTINATIONS.SEND_MESSAGE, {
      content: message,
      sender: this.currentUser,
      type: 'CHAT'
    });
  }

  joinPublicChat(username) {
    this.send(WEBSOCKET_CONFIG.DESTINATIONS.ADD_USER, {
      sender: username,
      type: 'JOIN'
    });
  }

  // Room Chat Methods
  subscribeToRoomChat(roomId, callback) {
    const topic = WEBSOCKET_CONFIG.TOPICS.ROOM_CHAT(roomId);
    return this.subscribe(topic, callback);
  }

  sendRoomMessage(roomId, message) {
    this.send(WEBSOCKET_CONFIG.DESTINATIONS.ROOM_SEND_MESSAGE(roomId), {
      content: message,
      sender: this.currentUser,
      type: 'CHAT'
    });
  }

  joinRoom(roomId) {
    this.send(WEBSOCKET_CONFIG.DESTINATIONS.ROOM_JOIN(roomId), {
      sender: this.currentUser,
      type: 'JOIN'
    });
  }

  leaveRoom(roomId) {
    this.send(WEBSOCKET_CONFIG.DESTINATIONS.ROOM_LEAVE(roomId), {
      sender: this.currentUser,
      type: 'LEAVE'
    });
  }

  // Room Management Methods
  subscribeToRoomUpdates(callback) {
    return this.subscribe(WEBSOCKET_CONFIG.TOPICS.ROOM_UPDATES, callback);
  }

  subscribeToNewRooms(callback) {
    return this.subscribe(WEBSOCKET_CONFIG.TOPICS.NEW_ROOMS, callback);
  }

  subscribeToRoomList(callback) {
    return this.subscribe(WEBSOCKET_CONFIG.TOPICS.ROOM_LIST, callback);
  }

  createRoom(roomData) {
    this.send(WEBSOCKET_CONFIG.DESTINATIONS.ROOM_CREATE, {
      ...roomData,
      createdBy: this.currentUser
    });
  }

  requestRoomList() {
    this.send(WEBSOCKET_CONFIG.DESTINATIONS.ROOM_LIST, {});
  }

  // User Presence Methods
  subscribeToUserPresence(callback) {
    return this.subscribe(WEBSOCKET_CONFIG.TOPICS.USER_PRESENCE, callback);
  }

  subscribeToTyping(callback) {
    return this.subscribe(WEBSOCKET_CONFIG.TOPICS.TYPING, callback);
  }

  sendTypingIndicator() {
    this.send(WEBSOCKET_CONFIG.DESTINATIONS.TYPING, {
      sender: this.currentUser,
      type: 'TYPING'
    });
  }

  // Private Message Methods
  subscribeToPrivateMessages(username, callback) {
    const topic = WEBSOCKET_CONFIG.TOPICS.PRIVATE_MESSAGE(username);
    return this.subscribe(topic, callback);
  }

  sendPrivateMessage(recipient, message) {
    this.send(WEBSOCKET_CONFIG.DESTINATIONS.PRIVATE_MESSAGE, {
      content: message,
      sender: this.currentUser,
      room: recipient,
      type: 'CHAT'
    });
  }

  // System Notifications
  subscribeToSystemNotifications(callback) {
    return this.subscribe(WEBSOCKET_CONFIG.TOPICS.SYSTEM_NOTIFICATIONS, callback);
  }

  // Notification Methods
  subscribeToSystemNotifications(callback) {
    return this.subscribe(WEBSOCKET_CONFIG.TOPICS.SYSTEM_NOTIFICATIONS, callback);
  }

  subscribeToUserPresence(callback) {
    return this.subscribe(WEBSOCKET_CONFIG.TOPICS.USER_PRESENCE, callback);
  }

  // Admin Methods
  sendAdminNotification(message) {
    this.send(WEBSOCKET_CONFIG.DESTINATIONS.ADMIN_NOTIFICATION, {
      message: message,
      type: 'SYSTEM',
      sender: this.currentUser
    });
  }

  // Utility Methods
  setCurrentUser(username) {
    this.currentUser = username;
  }

  isConnected() {
    return this.connected;
  }

  getSubscriptions() {
    return Array.from(this.subscriptions.keys());
  }
}

export const webSocketService = new WebSocketService();
export default webSocketService;
