import React, { useState, useEffect } from 'react';
import { FaWhatsapp, FaSave, FaTimes } from 'react-icons/fa';

interface WhatsAppSettingsProps {
  onClose?: () => void;
  showHeader?: boolean;
}

const WhatsAppSettings: React.FC<WhatsAppSettingsProps> = ({ 
  onClose, 
  showHeader = true 
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [currentNumber, setCurrentNumber] = useState<string | null>(null);

  // Check if the user already has a WhatsApp number connected
  useEffect(() => {
    const checkWhatsAppStatus = async () => {
      try {
        const response = await fetch('/api/whatsapp');
        const data = await response.json();
        
        if (data.whatsapp_connected) {
          setIsConnected(true);
          setCurrentNumber(data.phone_number);
          setPhoneNumber(data.phone_number);
        }
      } catch (error) {
        console.error('Error checking WhatsApp status:', error);
      }
    };

    checkWhatsAppStatus();
  }, []);

  // Handle form submission to link WhatsApp number
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus('idle');
    setMessage('');

    try {
      // Validate phone number
      if (!phoneNumber.trim()) {
        setMessage('Please enter a valid phone number');
        setStatus('error');
        setLoading(false);
        return;
      }

      // Call the API endpoint to save the WhatsApp number
      const response = await fetch('/api/whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone_number: phoneNumber }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('WhatsApp number linked successfully!');
        setIsConnected(true);
        setCurrentNumber(phoneNumber);
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to link WhatsApp number');
      }
    } catch (error) {
      setStatus('error');
      setMessage('An unexpected error occurred');
      console.error('Error linking WhatsApp number:', error);
    }

    setLoading(false);
  };

  // Format the phone number as the user types
  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits, +, spaces, and hyphens
    let input = e.target.value;
    input = input.replace(/[^\d+\s-]/g, '');
    
    setPhoneNumber(input);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      {showHeader && (
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold flex items-center">
            <FaWhatsapp className="mr-2 text-green-500" /> WhatsApp Notifications
          </h2>
          {onClose && (
            <button 
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-200 transition-colors"
            >
              <FaTimes className="text-gray-500" />
            </button>
          )}
        </div>
      )}

      <div className="mb-4">
        <p className="text-gray-600 mb-2">
          Receive transaction notifications via WhatsApp when new transactions are added to your account.
        </p>
        
        {isConnected && (
          <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-4">
            <p className="text-green-700 text-sm flex items-center">
              <FaWhatsapp className="mr-2" /> 
              WhatsApp notifications are active for: <strong className="ml-1">{currentNumber}</strong>
            </p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
            WhatsApp Phone Number
          </label>
          <input
            type="text"
            id="phoneNumber"
            placeholder="+1 234-567-8901"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={phoneNumber}
            onChange={handlePhoneNumberChange}
            disabled={loading}
          />
          <p className="text-xs text-gray-500 mt-1">
            Please include the country code (e.g., +1 for US)
          </p>
        </div>

        {status === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
            <p className="text-red-700 text-sm">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-4">
            <p className="text-green-700 text-sm">{message}</p>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            disabled={loading}
          >
            {loading ? (
              <span className="inline-block animate-spin mr-2">⏳</span>
            ) : (
              <FaSave className="mr-2" />
            )}
            {isConnected ? 'Update Number' : 'Link WhatsApp'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default WhatsAppSettings;
