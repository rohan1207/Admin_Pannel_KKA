import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient.js';
import Swal from 'sweetalert2';

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const { data, error } = await supabase
      .from('admin')
      .select('*')
      .eq('username', username)
      .eq('password', password);

    setIsLoading(false);

    if (error) {
      setError('Something went wrong.');
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Something went wrong during authentication.',
        background: '#1a1a2e',
        color: '#fff',
        confirmButtonColor: '#ff6b35'
      });
    } else if (data.length === 0) {
      setError('Invalid username or password.');
      Swal.fire({
        icon: 'warning',
        title: 'Access Denied',
        text: 'Invalid username or password.',
        background: '#1a1a2e',
        color: '#fff',
        confirmButtonColor: '#ff6b35'
      });
    } else {
      // Login success - redirect to home
      setError(null);
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Welcome to the admin dashboard.',
        background: '#1a1a2e',
        color: '#fff',
        confirmButtonColor: '#ff6b35'
      }).then(() => {
        navigate('/home');
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-900 via-gray-900 to-blue-800 p-4">
      {/* Background with subtle radial gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(37,99,235,0.15),rgba(3,7,18,0.5))] z-0"></div>
      
      {/* Content */}
      <div className="z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Admin Portal</h1>
          <p className="text-blue-200">Your secure gateway to management tools</p>
        </div>
        
        <div className="bg-black bg-opacity-90 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-8">
            <div className="flex justify-center mb-6">
              <div className="p-3 bg-orange-500 rounded-full shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
            
            <h2 className="text-xl font-bold text-center text-white mb-6">Authentication Required</h2>
            
            {error && <p className="text-red-400 text-sm mb-4 bg-red-900 bg-opacity-20 p-2 rounded">⚠️ {error}</p>}
            
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="username" className="text-sm font-medium text-gray-300 block mb-2">Username</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10 w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="password" className="text-sm font-medium text-gray-300 block mb-2">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-orange-500 text-white py-3 rounded-lg shadow-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 transition-all font-medium"
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>
            
            <div className="text-center mt-6">
              <a href="#" className="text-sm text-blue-300 hover:text-blue-200 transition">Forgot password?</a>
            </div>
            
            <div className="flex items-center justify-center mt-8">
              <span className="bg-orange-500 p-1 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </span>
              <span className="ml-2 text-xs text-gray-400">Secured with end-to-end encryption</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}