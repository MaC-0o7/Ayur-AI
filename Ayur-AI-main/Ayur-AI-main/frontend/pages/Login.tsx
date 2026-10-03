import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface LoginProps {
  onLogin: (user: { username: string; role: string }) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }
    
    // In a real app, you would validate credentials against a backend
    // For this demo, we'll just accept any non-empty values
    onLogin({ username, role });
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Ayur AI - Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please sign in to access the Ayurvedic knowledge system
          </p>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center">
            <div className="flex items-center">
              <label className="mr-4 text-sm font-medium text-gray-700">Role:</label>
              <div className="flex space-x-4">
                <div className="flex items-center">
                  <input
                    id="user-role"
                    name="role"
                    type="radio"
                    checked={role === 'user'}
                    onChange={() => setRole('user')}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                  />
                  <label htmlFor="user-role" className="ml-2 block text-sm text-gray-900">
                    User
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="bams-role"
                    name="role"
                    type="radio"
                    checked={role === 'BAMS'}
                    onChange={() => setRole('BAMS')}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                  />
                  <label htmlFor="bams-role" className="ml-2 block text-sm text-gray-900">
                    BAMS
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;