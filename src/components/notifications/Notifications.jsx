import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { webSocketService } from '../../services/websocket';
import { toast } from 'react-hot-toast';
import { 
  Bell, 
  BellOff, 
  Check, 
  CheckCheck, 
  X,
  Heart,
  MessageCircle,
  UserPlus,
  BookOpen,
  TrendingUp
} from 'lucide-react';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, read
  
  const { user } = useAuth();

  useEffect(() => {
    initializeNotifications();
    return () => {
      webSocketService.unsubscribe('/topic/system-notifications');
    };
  }, [user.username]);

  const initializeNotifications = async () => {
    try {
      setLoading(true);
      console.log('🔔 Starting notifications initialization...');
      
      // Connect to WebSocket if not already connected
      if (!webSocketService.isConnected()) {
        console.log('🔌 Connecting to WebSocket...');
        await webSocketService.connect(user.username);
        console.log('✅ WebSocket connected');
      } else {
        console.log('✅ WebSocket already connected');
      }
      
      // Initialize with empty notifications (no REST endpoint available)
      setNotifications([]);
      console.log('📝 Notifications initialized');
      
      // Subscribe to system notifications
      console.log('📡 Subscribing to system notifications...');
      try {
        webSocketService.subscribeToSystemNotifications((notification) => {
          console.log('🔔 Received notification:', notification);
          const newNotification = {
            id: Date.now() + Math.random(),
            message: notification.message,
            type: notification.type,
            read: false,
            createdAt: notification.timestamp || new Date().toISOString(),
            actionUrl: notification.data?.blogId ? `/blog/${notification.data.blogId}` : null,
          };
          
          setNotifications(prev => [newNotification, ...prev]);
          
          // Show toast notification
          toast.success(notification.message, {
            duration: 4000,
            position: 'top-right',
          });
        });
        console.log('✅ Successfully subscribed to notifications');
      } catch (subscribeError) {
        console.error('❌ Failed to subscribe to notifications:', subscribeError);
        // Don't throw - continue without real-time notifications
      }
      
    } catch (error) {
      console.error('❌ Error initializing notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
      console.log('🏁 Notifications initialization complete');
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      // Since there's no REST endpoint, just update locally
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      // Since there's no REST endpoint, just update locally
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, read: true }))
      );
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to mark all notifications as read');
    }
  };

  const handleDeleteNotification = (notificationId) => {
    setNotifications(prev =>
      prev.filter(notification => notification.id !== notificationId)
    );
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like':
        return <Heart size={20} className="notification-icon like" />;
      case 'comment':
        return <MessageCircle size={20} className="notification-icon comment" />;
      case 'follow':
        return <UserPlus size={20} className="notification-icon follow" />;
      case 'blog':
        return <BookOpen size={20} className="notification-icon blog" />;
      case 'trending':
        return <TrendingUp size={20} className="notification-icon trending" />;
      default:
        return <Bell size={20} className="notification-icon default" />;
    }
  };

  const formatNotificationTime = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'read') return notification.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="notifications-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="notifications-container">
      <div className="notifications-header">
        <div className="header-content">
          <h1>
            <Bell size={28} />
            Notifications
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}
          </h1>
          <p>Stay updated with your blog activity</p>
        </div>
        
        {unreadCount > 0 && (
          <button 
            className="mark-all-read-btn"
            onClick={handleMarkAllAsRead}
          >
            <CheckCheck size={20} />
            Mark All as Read
          </button>
        )}
      </div>

      <div className="notifications-filters">
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({notifications.length})
          </button>
          <button 
            className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
            onClick={() => setFilter('unread')}
          >
            Unread ({unreadCount})
          </button>
          <button 
            className={`filter-btn ${filter === 'read' ? 'active' : ''}`}
            onClick={() => setFilter('read')}
          >
            Read ({notifications.length - unreadCount})
          </button>
        </div>
      </div>

      <div className="notifications-list">
        {filteredNotifications.length === 0 ? (
          <div className="no-notifications">
            {filter === 'all' ? (
              <>
                <BellOff size={48} className="no-notifications-icon" />
                <h3>No notifications</h3>
                <p>You're all caught up! New notifications will appear here.</p>
              </>
            ) : filter === 'unread' ? (
              <>
                <CheckCheck size={48} className="no-notifications-icon" />
                <h3>No unread notifications</h3>
                <p>You've read all your notifications!</p>
              </>
            ) : (
              <>
                <Bell size={48} className="no-notifications-icon" />
                <h3>No read notifications</h3>
                <p>Read notifications will appear here.</p>
              </>
            )}
          </div>
        ) : (
          filteredNotifications.map(notification => (
            <div 
              key={notification.id} 
              className={`notification-item ${notification.read ? 'read' : 'unread'}`}
            >
              <div className="notification-content">
                <div className="notification-left">
                  {getNotificationIcon(notification.type)}
                  <div className="notification-text">
                    <p className="notification-message">
                      {notification.message}
                    </p>
                    <span className="notification-time">
                      {formatNotificationTime(notification.createdAt)}
                    </span>
                  </div>
                </div>
                
                <div className="notification-actions">
                  {!notification.read && (
                    <button
                      className="mark-read-btn"
                      onClick={() => handleMarkAsRead(notification.id)}
                      title="Mark as read"
                    >
                      <Check size={16} />
                    </button>
                  )}
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteNotification(notification.id)}
                    title="Delete notification"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
              
              {notification.actionUrl && (
                <div className="notification-action">
                  <a 
                    href={notification.actionUrl}
                    className="view-link"
                  >
                    View
                  </a>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
