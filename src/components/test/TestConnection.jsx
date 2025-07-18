import { useState } from 'react';
import { testAPI } from '../../services/api';
import { toast } from 'react-hot-toast';

const TestConnection = () => {
  const [testResult, setTestResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testHealthCheck = async () => {
    try {
      setLoading(true);
      const response = await testAPI.healthCheck();
      setTestResult(response.data);
      toast.success('Health check successful!');
    } catch (error) {
      console.error('Health check failed:', error);
      setTestResult('Health check failed');
      toast.error('Health check failed');
    } finally {
      setLoading(false);
    }
  };

  const testWebSocket = async () => {
    try {
      setLoading(true);
      const response = await testAPI.websocketTest();
      setTestResult(response.data);
      toast.success('WebSocket test successful!');
    } catch (error) {
      console.error('WebSocket test failed:', error);
      setTestResult('WebSocket test failed');
      toast.error('WebSocket test failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="test-connection">
      <h2>API Connection Test</h2>
      
      <div className="test-buttons">
        <button 
          onClick={testHealthCheck}
          disabled={loading}
          className="test-btn"
        >
          {loading ? 'Testing...' : 'Test Health Check'}
        </button>
        
        <button 
          onClick={testWebSocket}
          disabled={loading}
          className="test-btn"
        >
          {loading ? 'Testing...' : 'Test WebSocket'}
        </button>
      </div>
      
      {testResult && (
        <div className="test-result">
          <h3>Result:</h3>
          <p>{testResult}</p>
        </div>
      )}
      
      <div className="test-info">
        <h3>API Information:</h3>
        <ul>
          <li>Base URL: http://localhost:8080</li>
          <li>Health Check: /test</li>
          <li>WebSocket Test: /test-websocket</li>
          <li>WebSocket URL: ws://localhost:8080/ws</li>
        </ul>
      </div>
    </div>
  );
};

export default TestConnection;
