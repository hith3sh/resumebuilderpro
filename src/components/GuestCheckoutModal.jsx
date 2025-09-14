import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, X, CreditCard, User, Mail } from 'lucide-react';
import { validateGuestCheckoutData } from '@/api/GuestCheckoutApi';

const GuestCheckoutModal = ({
  isOpen,
  onClose,
  onProceedToCheckout,
  product
}) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailExists, setEmailExists] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Reset email exists check when email changes
    if (name === 'email') {
      setEmailExists(null);
    }
  };

  const validateForm = () => {
    const errors = [];

    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.push('Please enter a valid email address');
    }

    if (!formData.firstName.trim()) {
      errors.push('First name is required');
    }

    if (!formData.lastName.trim()) {
      errors.push('Last name is required');
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateForm();
    if (errors.length > 0) {
      toast({
        variant: 'destructive',
        title: 'Please correct the following errors:',
        description: errors.join(', ')
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare checkout data
      const checkoutData = {
        email: formData.email.toLowerCase().trim(),
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        items: [{
          product_id: product.id,
          product_name: product.title,
          price: product.price_in_cents,
          quantity: 1
        }],
        amount: product.price_in_cents,
        currency: product.currency || 'USD'
      };

      // Validate checkout data
      const validation = validateGuestCheckoutData(checkoutData);
      if (!validation.isValid) {
        toast({
          variant: 'destructive',
          title: 'Checkout Error',
          description: validation.errors.join(', ')
        });
        return;
      }

      // Proceed to guest checkout
      await onProceedToCheckout(checkoutData);

    } catch (error) {
      console.error('Guest checkout error:', error);
      toast({
        variant: 'destructive',
        title: 'Checkout Error',
        description: 'There was a problem starting your checkout. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({ email: '', firstName: '', lastName: '' });
      setEmailExists(null);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center text-xl font-semibold">
              <CreditCard className="mr-2 h-5 w-5 text-blue-600" />
              Quick Checkout
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={isSubmitting}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Enter your details to purchase <span className="font-medium">{product?.title}</span>
          </p>
        </DialogHeader>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="space-y-4">
            <div>
              <Label htmlFor="email" className="flex items-center">
                <Mail className="mr-1 h-4 w-4" />
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="your.email@example.com"
                required
                className="mt-1"
                disabled={isSubmitting}
              />
              {emailExists === true && (
                <p className="text-sm text-amber-600 mt-1">
                  This email has an existing account. You can login or continue as guest.
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="firstName" className="flex items-center">
                  <User className="mr-1 h-4 w-4" />
                  First Name
                </Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="John"
                  required
                  className="mt-1"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Doe"
                  required
                  className="mt-1"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center">
              <div className="text-blue-700">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 text-sm text-blue-700">
                <p className="font-medium">Account Creation</p>
                <p>An account will be automatically created for you after purchase with a welcome email.</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CreditCard className="mr-2 h-4 w-4" />
              )}
              {isSubmitting ? 'Processing...' : 'Continue to Payment'}
            </Button>
          </div>
        </motion.form>

        <div className="text-center pt-2">
          <p className="text-xs text-gray-500">
            🔒 Your information is secure and encrypted
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GuestCheckoutModal;