import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaUserCircle, FaSignOutAlt, FaCaretDown } from 'react-icons/fa';

const UserAvatar: React.FC = () => {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');
  
  // Fetch user information on component mount
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch('/api/user');
        if (response.ok) {
          const data = await response.json();
          setUserEmail(data.email || 'User');
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };
    
    fetchUserInfo();
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (response.ok) {
        // Redirect to login page after logout
        router.push('/auth/login');
      }
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-2 bg-blue-800 hover:bg-blue-900 transition-colors rounded-full py-2 px-3 text-white"
      >
        <FaUserCircle className="text-lg" />
        <span className="text-sm hidden sm:inline max-w-[150px] truncate">
          {userEmail || 'User'}
        </span>
        <FaCaretDown className="text-xs" />
      </button>

      {isDropdownOpen && (
        <div 
          className="absolute right-0 mt-2 py-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200"
          onClick={() => setIsDropdownOpen(false)}
        >
          <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
            Signed in as<br />
            <span className="font-medium">{userEmail}</span>
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2"
          >
            <FaSignOutAlt />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
};

export default UserAvatar;
