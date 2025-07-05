/**
 * Mock WhatsApp API utilities for SmartSave
 * This is a simulated implementation of a WhatsApp API integration
 */

/**
 * Interface for WhatsApp message options
 */
interface WhatsAppMessageOptions {
  previewUrl?: boolean;
  disableNotification?: boolean;
}

/**
 * Send a WhatsApp message using the mock API
 * 
 * @param phoneNumber - The WhatsApp phone number to send the message to
 * @param message - The message text to send
 * @param options - Additional options for the message
 * @returns Promise with the result of the send operation
 */
export async function sendWhatsAppMessage(
  phoneNumber: string,
  message: string,
  options: WhatsAppMessageOptions = {}
): Promise<{ success: boolean, messageId?: string, error?: string }> {
  try {
    // Validate the phone number (simple validation for mock purposes)
    if (!phoneNumber || !/^\+?[\d\s-]{10,15}$/.test(phoneNumber)) {
      console.error('Invalid WhatsApp phone number format');
      return {
        success: false,
        error: 'Invalid phone number format'
      };
    }
    
    // In a real implementation, this would make an API call to a WhatsApp service
    // For mock purposes, we'll just log the message and simulate a response
    console.log(`[MOCK] WhatsApp message sent to ${phoneNumber}:`);
    console.log(`[MOCK] Message content: ${message}`);
    console.log('[MOCK] Options:', options);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Generate a mock message ID
    const mockMessageId = `whatsapp_msg_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    
    console.log(`[MOCK] WhatsApp message sent successfully with ID: ${mockMessageId}`);
    
    return {
      success: true,
      messageId: mockMessageId
    };
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Format a transaction notification message for WhatsApp
 * 
 * @param transaction - The transaction object
 * @returns Formatted message string
 */
export function formatTransactionMessage(transaction: any): string {
  const amount = parseFloat(transaction.amount);
  const amountFormatted = amount.toLocaleString('en-US', {
    style: 'currency',
    currency: transaction.currency || 'USD',
  });
  
  const transactionType = amount >= 0 ? 'Income' : 'Expense';
  const emoji = amount >= 0 ? '💰' : '💸';
  
  return `${emoji} *New ${transactionType} Transaction*\n\n` +
         `*Description:* ${transaction.description}\n` +
         `*Amount:* ${amountFormatted}\n` +
         `*Category:* ${transaction.category || 'Other'}\n` +
         `*Date:* ${transaction.date}\n\n` +
         `_Track your financial progress with SmartSave!_`;
}

/**
 * Verify if a phone number is valid for WhatsApp
 * This is a mock implementation for demonstration purposes
 * 
 * @param phoneNumber - The phone number to verify
 * @returns Promise that resolves to a boolean indicating if the number is valid
 */
export async function verifyWhatsAppNumber(phoneNumber: string): Promise<boolean> {
  try {
    // In a real implementation, this would call the WhatsApp API to verify the number
    // For mock purposes, we'll just check for a valid format
    const isValidFormat = /^\+?[\d\s-]{10,15}$/.test(phoneNumber);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    console.log(`[MOCK] WhatsApp number verification: ${phoneNumber} is ${isValidFormat ? 'valid' : 'invalid'}`);
    
    return isValidFormat;
  } catch (error) {
    console.error('Error verifying WhatsApp number:', error);
    return false;
  }
}
