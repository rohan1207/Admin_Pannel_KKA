import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import Dashboard from '../components/Dashboard';
import AddBlog from '../components/AddBlog';
import Settings from '../components/Settings';
import Files from '../components/Files';

const Home = ({ onLogout }) => {
  const navigate = useNavigate();
  const [activeComponent, setActiveComponent] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    navigate('/', { replace: true });
  };

  const renderComponent = () => {
    switch (activeComponent) {
      case 'dashboard':
        return <Dashboard />;
      case 'blog':
        return <AddBlog />;
      case 'files':
        return <Files />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 z-50 w-full"
          >
            <Sidebar 
              activeComponent={activeComponent} 
              setActiveComponent={setActiveComponent}
              onLogout={handleLogout}
              isMobile={true}
              onClose={() => setIsSidebarOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar 
          activeComponent={activeComponent} 
          setActiveComponent={setActiveComponent}
          onLogout={handleLogout}
          isMobile={false}
        />
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto">
        {/* Mobile Header */}
        <div className="md:hidden bg-white shadow-sm p-4 flex items-center justify-between">
          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </motion.button>
          <h1 className="text-xl font-semibold text-gray-800">
            {activeComponent === 'all-files' ? 'All Files' : activeComponent.charAt(0).toUpperCase() + activeComponent.slice(1)}
          </h1>
          <div className="w-6" /> {/* Spacer for alignment */}
        </div>

        <div className="container mx-auto px-4 md:px-6 py-4 md:py-8">
          {renderComponent()}
        </div>
      </main>
    </div>
  );
};

export default Home; 