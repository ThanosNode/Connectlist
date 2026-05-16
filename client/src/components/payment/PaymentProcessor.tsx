import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Listing } from '@shared/schema';

interface PaymentProcessorProps {
  listing: Listing;
  actionType: 'featured' | 'job' | 'boost';
  onCancel: () => void;
}

export function PaymentProcessor({ listing, actionType, onCancel }: PaymentProcessorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Calculate amount based on action type (as whole number dollars, no cents)
  const getAmount = () => {
    switch (actionType) {
      case 'featured':
        return 5; // $5
      case 'job':
        return 15; // $15
      case 'boost':
        return 5; // $5 (updated from $3)
      default:
        return 0;
    }
  };

  const getAmountDisplay = () => {
    return getAmount().toLocaleString(); // Display dollars as whole numbers
  };

  const getActionTypeDisplay = () => {
    switch (actionType) {
      case 'featured':
        return 'Feature Listing';
      case 'job':
        return 'Job Posting';
      case 'boost':
        return 'Boost Listing';
      default:
        return 'Payment';
    }
  };

  const handlePayment = async () => {
    setIsLoading(true);
    try {
      // Create the charge
      const response = await apiRequest("POST", '/api/payments/create-charge', {
        listingId: listing.id,
        amount: getAmount(),
        paymentType: actionType,
      });

      console.log("Payment response:", response);
      
      // Handle the Response object returned by updated apiRequest
      if (response.ok) {
        const data = await response.json();
        console.log("Payment data:", data);
        
        if (data && data.payment && data.payment.hostedUrl) {
          // Redirect to Coinbase Commerce hosted checkout page
          window.location.href = data.payment.hostedUrl;
        } else {
          throw new Error("Invalid payment response format");
        }
      } else {
        const errorData = await response.text();
        console.error("Payment API error:", response.status, errorData);
        throw new Error(errorData || "Payment processing failed");
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: 'Payment Error',
        description: 'There was an error processing your payment. Please try again.',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{getActionTypeDisplay()}</CardTitle>
        <CardDescription>
          Process payment for {listing.title}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between">
            <span>Listing:</span>
            <span className="font-medium">{listing.title}</span>
          </div>
          <div className="flex justify-between">
            <span>Type:</span>
            <span className="font-medium">{listing.type}</span>
          </div>
          <div className="flex justify-between">
            <span>Location:</span>
            <span className="font-medium">{listing.city}, {listing.state}</span>
          </div>
          <div className="flex justify-between text-lg font-bold mt-4">
            <span>Total:</span>
            <span>${getAmountDisplay()}</span>
          </div>
          <div className="pt-4 text-sm text-gray-500">
            Payment processed securely via Coinbase Commerce. We accept Bitcoin, Ethereum, and many other cryptocurrencies.
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handlePayment} disabled={isLoading}>
          {isLoading ? (
            <>
              <Spinner className="mr-2 h-4 w-4" />
              Processing...
            </>
          ) : (
            'Pay with Crypto'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}