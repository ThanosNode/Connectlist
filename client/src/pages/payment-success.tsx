import { useEffect, useState } from 'react';
import { Link, useLocation, useRoute } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import { queryClient } from '@/lib/queryClient';

export default function PaymentSuccess() {
  const [match, params] = useRoute('/listing/:id/payment-success');
  const [, setLocation] = useLocation();
  const [paymentType, setPaymentType] = useState<'featured' | 'job' | 'boost'>('featured');
  
  // Get listingId and payment type from route params or search params
  const listingId = match ? params.id : null;
  
  useEffect(() => {
    // Extract payment type from URL search params if available
    const searchParams = new URLSearchParams(window.location.search);
    const type = searchParams.get('type');
    if (type && ['featured', 'job', 'boost'].includes(type)) {
      setPaymentType(type as 'featured' | 'job' | 'boost');
    }
  }, []);
  
  useEffect(() => {
    // If we don't have a listing ID, redirect to home
    if (!listingId) {
      setLocation('/');
      return;
    }
    
    // Invalidate queries to refresh data after payment
    queryClient.invalidateQueries({ queryKey: ['/api/listings', parseInt(listingId)] });
    queryClient.invalidateQueries({ queryKey: ['/api/listings/featured'] });
    queryClient.invalidateQueries({ queryKey: ['/api/listings/recent'] });
  }, [listingId, setLocation]);
  
  if (!listingId) {
    return null; // Will redirect to home
  }
  
  return (
    <div className="container max-w-3xl py-12">
      <Card className="w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Payment Successful</CardTitle>
          <CardDescription>
            Thank you for your payment. Your transaction has been completed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4 text-center">
            <p className="text-sm font-medium">
              Your payment is being processed. It may take a few minutes for the cryptocurrency transaction to be confirmed on the blockchain.
            </p>
          </div>
          <div className="rounded-lg bg-muted p-4">
            <h3 className="mb-2 font-medium">What happens next?</h3>
            <ul className="ml-5 list-disc text-sm">
              {paymentType === 'featured' && (
                <>
                  <li className="mb-1">Your listing will be featured at the top of search results</li>
                  <li className="mb-1">It will be highlighted on the homepage and category pages</li>
                  <li className="mb-1">Featured status remains until your listing expires</li>
                </>
              )}
              
              {paymentType === 'job' && (
                <>
                  <li className="mb-1">Your job posting will be active for 60 days (twice the standard period)</li>
                  <li className="mb-1">It will be promoted in the jobs section with special tagging</li>
                  <li className="mb-1">You'll get detailed analytics on views and applications</li>
                </>
              )}
              
              {paymentType === 'boost' && (
                <>
                  <li className="mb-1">Your listing will receive increased visibility for 7 days</li>
                  <li className="mb-1">It will appear higher in search results and category pages</li>
                  <li className="mb-1">You'll get priority placement in email newsletters</li>
                </>
              )}
              
              <li className="mb-1">You'll receive a confirmation email with your transaction details</li>
              <li className="mb-1">You can view your transaction history in your account dashboard</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center gap-4">
          <Button asChild variant="outline">
            <Link href={`/listing/${listingId}`}>View Listing</Link>
          </Button>
          <Button asChild>
            <Link href="/my-listings">My Listings</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}