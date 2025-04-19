import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChartBarIcon,
  FolderIcon,
  PencilSquareIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
  ChevronDownIcon,
  CalendarIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const Sidebar = ({ activeComponent, setActiveComponent, onLogout, isMobile, onClose }) => {
  const [expandedMenus, setExpandedMenus] = useState({});

  const toggleSubmenu = (id) => {
    setExpandedMenus(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: ChartBarIcon
    },
    {
      id: 'blog',
      label: 'Add Blog',
      icon: PencilSquareIcon
    },
    {
      id: 'ManageFiles',
      label: 'Manage Files',
      icon: FolderIcon,
      submenu: [
        { id: 'all-files', label: 'All Files' },
        { id: 'us-documents', label: 'US Documents' },
        { id: 'india-documents', label: 'India Documents' },
        { id: 'client-uploads', label: 'Client Uploads' }
      ]
    },
    {
      id: 'booking-status',
      label: 'Booking Status',
      icon: CalendarIcon,
      submenu: [
        { id: 'pending-bookings', label: 'Pending Bookings' },
        { id: 'confirmed-bookings', label: 'Confirmed Bookings' },
        { id: 'completed-bookings', label: 'Completed Bookings' },
        { id: 'cancelled-bookings', label: 'Cancelled Bookings' }
      ]
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Cog6ToothIcon,
      submenu: [
        { id: 'user-management', label: 'User Management' },
        { id: 'backup-recovery', label: 'Backup & Recovery' },
        { id: 'system-logs', label: 'System Logs' },
        { id: 'preferences', label: 'Preferences' }
      ]
    }
  ];

  return (
    <div className="relative flex">
      <motion.div 
        initial={false}
        animate={{ 
          width: isMobile ? '100vw' : 256,
          transition: { 
            duration: 0.3,
            ease: "easeInOut"
          }
        }}
        className={`
          h-screen 
          bg-gradient-to-b from-gray-100 via-gray-50 to-white
          relative 
          p-5 
          pt-8
          shadow-lg
          border-r border-gray-200
          overflow-y-auto
          scrollbar-thin
          scrollbar-track-transparent
          scrollbar-thumb-gray-300
          hover:scrollbar-thumb-gray-400
          scrollbar-thumb-rounded-full
          overflow-x-hidden
          ${isMobile ? 'fixed top-0 left-0 z-50' : ''}
        `}
      >
        {/* Mobile Close Button - Only visible on mobile */}
        {isMobile && (
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-200/70 md:hidden"
          >
            <XMarkIcon className="w-6 h-6 text-gray-600" />
          </button>
        )}

        {/* Header */}
        <div className="flex items-center gap-x-4 mb-6">
          <div className="min-w-[40px] h-10 rounded-lg bg-gradient-to-br from-gray-700 to-gray-800
                        flex items-center justify-center text-white font-bold
                        shadow-md">
            A
          </div>
          <div className="text-gray-700">
            <h4 className="font-semibold">Admin User</h4>
            <p className="text-xs text-gray-500">admin@gmail.com</p>
          </div>
        </div>

        {/* Menu Items */}
        <div className="flex flex-col gap-2">
          {menuItems.map((item) => (
            <div key={item.id} className="flex flex-col">
              <motion.button
                onClick={() => {
                  if (item.submenu) {
                    toggleSubmenu(item.id);
                  } else {
                    setActiveComponent(item.id);
                    if (isMobile) onClose();
                  }
                }}
                className={`
                  flex items-center gap-x-4 cursor-pointer p-2
                  rounded-lg transition-all duration-200
                  hover:bg-gray-200/60 hover:shadow-sm
                  ${activeComponent === item.id 
                    ? 'bg-gray-200/80 shadow-sm text-gray-800 font-medium' 
                    : 'text-gray-600 hover:text-gray-800'}
                `}
              >
                <div className="flex items-center justify-center">
                  <item.icon className="w-6 h-6 min-w-[24px]" />
                </div>
                <div className="flex items-center justify-between flex-1">
                  <span className="font-medium tracking-wide">
                    {item.label}
                  </span>
                  {item.submenu && (
                    <motion.div
                      animate={{ 
                        rotate: expandedMenus[item.id] ? 180 : 0
                      }}
                      transition={{ 
                        duration: 0.3,
                        ease: "easeInOut"
                      }}
                    >
                      <ChevronDownIcon className="w-4 h-4" />
                    </motion.div>
                  )}
                </div>
              </motion.button>
              
              {/* Submenu */}
              {item.submenu && (
                <motion.div
                  initial={false}
                  animate={{
                    height: expandedMenus[item.id] ? 'auto' : 0,
                    opacity: expandedMenus[item.id] ? 1 : 0,
                    transition: { 
                      duration: 0.3,
                      ease: "easeInOut"
                    }
                  }}
                  className="ml-8 mt-1 space-y-1 overflow-hidden"
                >
                  {item.submenu.map((subItem) => (
                    <motion.button
                      key={subItem.id}
                      onClick={() => {
                        setActiveComponent(subItem.id);
                        if (isMobile) onClose();
                      }}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ 
                        duration: 0.3,
                        ease: "easeInOut"
                      }}
                      className={`
                        w-full p-2 rounded-lg text-sm
                        transition-all duration-200
                        hover:bg-gray-200/60
                        ${activeComponent === subItem.id 
                          ? 'bg-gray-200/80 text-gray-800 font-medium' 
                          : 'text-gray-600 hover:text-gray-800'}
                        flex items-center
                      `}
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mr-2" />
                      {subItem.label}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom Section - Logout Button */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full p-2 rounded-lg text-gray-600 hover:text-gray-800
                     hover:bg-gray-200/60 transition-all duration-200
                     flex items-center gap-x-4"
          >
            <div className="flex items-center justify-center">
              <ArrowLeftOnRectangleIcon className="w-6 h-6 min-w-[24px]" />
            </div>
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Sidebar; 