import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { chatAPI } from '../../services/api';
import { webSocketService } from '../../services/websocket';
import { toast } from 'react-hot-toast';
import { 
  Send, 
  MessageCircle, 
  Users, 
  Plus, 
  Search,
  MoreVertical,
  X,
  User
} from 'lucide-react';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const { user } = useAuth();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    initializeChat();
    return () => {
      webSocketService.disconnect();
    };
  }, []);

  useEffect(() => {
    if (activeRoom) {
      fetchMessages(activeRoom.id);
      subscribeToRoom(activeRoom.id);
    }
  }, [activeRoom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeChat = async () => {
    try {
      setLoading(true);
      
      // Connect to WebSocket
      await webSocketService.connect(user.username);
      
      // Fetch chat rooms
      const roomsResponse = await chatAPI.getRooms();
      console.log('🏠 Chat: Rooms response:', roomsResponse);
      
      // Handle different response formats
      const roomsData = roomsResponse.data || roomsResponse;
      console.log('🏠 Chat: Rooms data:', roomsData);
      
      // Convert rooms object to array format (handle both object and array responses)
      let roomsArray = [];
      if (Array.isArray(roomsData)) {
        roomsArray = roomsData.map(room => ({
          id: room.roomId || room.id,
          name: room.roomName || room.name,
          description: room.description,
          memberCount: room.memberCount || 0,
          lastMessage: '', // Will be populated by WebSocket
        }));
      } else if (roomsData && typeof roomsData === 'object') {
        roomsArray = Object.values(roomsData).map(room => ({
          id: room.roomId || room.id,
          name: room.roomName || room.name,
          description: room.description,
          memberCount: room.memberCount || 0,
          lastMessage: '', // Will be populated by WebSocket
        }));
      }
      
      console.log('🏠 Chat: Processed rooms array:', roomsArray);
      setRooms(roomsArray);
      
      // Set default room if available
      if (roomsArray.length > 0) {
        setActiveRoom(roomsArray[0]);
      }
      
      // Subscribe to room updates
      webSocketService.subscribeToRoomUpdates((roomUpdate) => {
        setRooms(prev => prev.map(room => 
          room.id === roomUpdate.roomId ? { ...room, ...roomUpdate } : room
        ));
      });
      
      // Subscribe to new rooms
      webSocketService.subscribeToNewRooms((newRoom) => {
        setRooms(prev => [...prev, {
          id: newRoom.roomId,
          name: newRoom.roomName,
          description: newRoom.description,
          memberCount: newRoom.memberCount,
          lastMessage: '',
        }]);
      });
      
    } catch (error) {
      console.error('Error initializing chat:', error);
      toast.error('Failed to initialize chat');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (roomId) => {
    try {
      // Clear previous messages
      setMessages([]);
      
      // Note: The API doesn't have a direct endpoint for fetching room messages
      // Messages will be populated via WebSocket subscriptions
      // You might need to implement message history in the backend
      
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    }
  };

  const subscribeToRoom = (roomId) => {
    // Subscribe to room chat messages
    webSocketService.subscribeToRoomChat(roomId, (message) => {
      setMessages(prev => [...prev, {
        id: Date.now() + Math.random(),
        content: message.content,
        senderName: message.sender,
        senderId: message.sender,
        timestamp: message.timestamp || new Date().toISOString(),
      }]);
    });
    
    // Join the room
    webSocketService.joinRoom(roomId);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !activeRoom) return;
    
    // Send message through WebSocket
    webSocketService.sendRoomMessage(activeRoom.id, newMessage);
    
    setNewMessage('');
    inputRef.current?.focus();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) return;
    
    try {
      const roomData = {
        roomId: newRoomName.toLowerCase().replace(/\s+/g, '-'),
        roomName: newRoomName,
        description: `${newRoomName} discussion room`,
        private: false,
      };
      
      const response = await chatAPI.createRoom(roomData);
      
      // Room will be added to the list via WebSocket subscription
      setNewRoomName('');
      setShowRoomModal(false);
      toast.success('Room created successfully');
    } catch (error) {
      console.error('Error creating room:', error);
      toast.error('Failed to create room');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatMessageTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatMessageDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const filteredRooms = rooms.filter(room =>
    room.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="chat-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="chat-sidebar">
        <div className="sidebar-header">
          <h3>
            <MessageCircle size={20} />
            Chat Rooms
          </h3>
          <button 
            className="create-room-btn"
            onClick={() => setShowRoomModal(true)}
          >
            <Plus size={16} />
          </button>
        </div>
        
        <div className="room-search">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search rooms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="rooms-list">
          {filteredRooms.map(room => (
            <div
              key={room.id}
              className={`room-item ${activeRoom?.id === room.id ? 'active' : ''}`}
              onClick={() => setActiveRoom(room)}
            >
              <div className="room-info">
                <h4>{room.name}</h4>
                <p>{room.lastMessage || 'No messages yet'}</p>
              </div>
              <div className="room-meta">
                <span className="member-count">
                  <Users size={14} />
                  {room.memberCount || 0}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="chat-main">
        {activeRoom ? (
          <>
            <div className="chat-header">
              <div className="room-info">
                <h3>{activeRoom.name}</h3>
                <span className="member-count">
                  <Users size={16} />
                  {activeRoom.memberCount || 0} members
                </span>
              </div>
              <button className="room-options-btn">
                <MoreVertical size={20} />
              </button>
            </div>

            <div className="chat-messages">
              {messages.length === 0 ? (
                <div className="no-messages">
                  <MessageCircle size={48} className="no-messages-icon" />
                  <h3>No messages yet</h3>
                  <p>Start the conversation!</p>
                </div>
              ) : (
                <div className="messages-list">
                  {messages.map((message, index) => {
                    const showDate = index === 0 || 
                      formatMessageDate(message.timestamp) !== formatMessageDate(messages[index - 1].timestamp);
                    
                    return (
                      <div key={message.id || index}>
                        {showDate && (
                          <div className="message-date">
                            {formatMessageDate(message.timestamp)}
                          </div>
                        )}
                        <div className={`message ${message.senderId === user.username ? 'own' : 'other'}`}>
                          <div className="message-avatar">
                            <User size={20} />
                          </div>
                          <div className="message-content">
                            <div className="message-header">
                              <span className="sender-name">{message.senderName}</span>
                              <span className="message-time">
                                {formatMessageTime(message.timestamp)}
                              </span>
                            </div>
                            <div className="message-body">
                              {message.content}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            <div className="chat-input">
              <div className="input-container">
                <textarea
                  ref={inputRef}
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  rows="1"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="send-btn"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="no-room-selected">
            <MessageCircle size={64} className="no-room-icon" />
            <h3>Select a room to start chatting</h3>
            <p>Choose a room from the sidebar or create a new one</p>
          </div>
        )}
      </div>

      {showRoomModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Create New Room</h3>
              <button 
                onClick={() => setShowRoomModal(false)}
                className="close-btn"
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-content">
              <div className="form-group">
                <label htmlFor="roomName">Room Name</label>
                <input
                  type="text"
                  id="roomName"
                  placeholder="Enter room name..."
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                />
              </div>
            </div>
            <div className="modal-actions">
              <button 
                onClick={() => setShowRoomModal(false)}
                className="cancel-btn"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateRoom}
                className="create-btn"
                disabled={!newRoomName.trim()}
              >
                Create Room
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
