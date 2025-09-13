import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';

export const usePurchaseIntent = () => {
  const navigate = useNavigate();
  const { user, justLoggedIn, clearJustLoggedIn } = useAuth();

  useEffect(() => {
    // Only run if user just logged in
    if (!justLoggedIn || !user) return;

    const purchaseIntentString = sessionStorage.getItem('purchaseIntent');
    if (purchaseIntentString) {
      try {
        const purchaseIntent = JSON.parse(purchaseIntentString);
        
        // Check if the intent is recent (within 10 minutes) and valid
        const isRecent = Date.now() - purchaseIntent.timestamp < 10 * 60 * 1000;
        
        if (purchaseIntent.type === 'purchase' && purchaseIntent.productData && isRecent) {
          // Clear the intent from storage
          sessionStorage.removeItem('purchaseIntent');
          
          // Navigate to checkout with the stored product data
          navigate('/stripe-checkout', {
            state: {
              items: [purchaseIntent.productData]
            }
          });
        } else {
          // Clean up expired or invalid intents
          sessionStorage.removeItem('purchaseIntent');
        }
      } catch (error) {
        console.error('Error processing purchase intent:', error);
        sessionStorage.removeItem('purchaseIntent');
      }
    }

    // Clear the just logged in flag
    clearJustLoggedIn();
  }, [user, justLoggedIn, navigate, clearJustLoggedIn]);
};