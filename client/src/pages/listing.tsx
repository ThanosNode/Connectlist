import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useLocation } from "@/context/LocationContext";
import { useAuth } from "@/context/AuthContext";
import { AlertTriangle, Heart, Mail, Globe, Ban, Zap } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Spinner } from "@/components/ui/spinner";
import { PaymentProcessor } from "@/components/payment/PaymentProcessor";
import { getQueryFn } from "@/lib/queryClient";
import { Listing } from "@shared/schema";
import { ListingStatusTag } from "@/components/ui/ListingStatusTag";
import { useToast } from "@/hooks/use-toast";

export default function ListingDetail() {
  const { selectedCity, selectedState, selectedCountry } = useLocation();
  const { isAuthenticated, user } = useAuth();
  const [showPayment, setShowPayment] = useState(false);
  const [paymentType, setPaymentType] = useState<'featured' | 'job' | 'boost'>('featured');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Get listing ID from URL
  const [, params] = useRoute("/listing/:id");
  const listingId = params?.id || "0";
  
  // Fetch listing data from API
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/listings', parseInt(listingId)],
    queryFn: async () => {
      const response = await fetch(`/api/listings/${listingId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch listing');
      }
      const data = await response.json();
      console.log('Listing detail data:', data);
      return data as Listing;
    },
  });
  
  // Extract listing data
  const listing = data as Listing | undefined;
  
  // Show loading or error state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold mb-4">Listing Not Found</h2>
        <p className="mb-6 text-gray-600">
          The listing you're looking for might have been removed or doesn't exist.
        </p>
        <Link href="/">
          <Button>Return to Homepage</Button>
        </Link>
      </div>
    );
  }

  // Handle payment rendering
  if (showPayment) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <PaymentProcessor 
          listing={listing} 
          actionType={paymentType} 
          onCancel={() => setShowPayment(false)} 
        />
      </div>
    );
  }

  // Format createdAt date 
  const createdDate = new Date(listing.createdAt).toLocaleDateString();
  
  // Format location info
  const location = `${listing.city}, ${listing.state}`;

  return (
    <>
      <Helmet>
        <title>{listing.title} | ConnectList</title>
        <meta name="description" content={`View details for ${listing.title} listing on ConnectList. Located in ${location}.`} />
      </Helmet>
      
      <div className="max-w-4xl mx-auto">
        <div className="mb-4">
          <Link href={`/search/${listing.type}/${encodeURIComponent(listing.type)}`} className="text-blue-700 hover:underline text-sm">
            ← back to {listing.type} listings
          </Link>
        </div>
        
        <div className="border border-gray-300 p-4 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-xl font-bold">{listing.title}</h1>
              <ListingStatusTag 
                status={listing.status} 
                type={listing.type} 
                isFeatured={listing.isFeatured} 
                isVerified={listing.isFeatured || listing.isPaid} 
                className="mt-1"
              />
            </div>
            <div className="text-lg font-medium">
              {listing.price != null && listing.price > 0 && `$${listing.price.toLocaleString()}`}
            </div>
          </div>
          
          <div className="flex justify-between text-sm text-gray-600 mb-6">
            <div>
              Location: {location}
              {listing.isRemote && <span className="ml-2">(remote available)</span>}
            </div>
            <div>Posted: {createdDate}</div>
          </div>
          
          <div className="whitespace-pre-line mb-6">
            {listing.description}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <Button className="flex items-center gap-2">
              <Mail size={16} />
              <span>contact</span>
            </Button>
            
            <Button variant="outline" className="flex items-center gap-2">
              <Heart size={16} />
              <span>save</span>
            </Button>
            
            {listing.isRemote && (
              <Button variant="outline" className="flex items-center gap-2">
                <Globe size={16} />
                <span>remote available</span>
              </Button>
            )}
            
            {/* Organize buttons in a flex column to ensure vertical stacking */}
            <div className="flex flex-col space-y-4">
              {/* Job payment button - always available for unpaid job listings */}
              {listing.type === 'job' && !listing.isPaid && (
                <Button 
                  onClick={() => {
                    setPaymentType('job');
                    setShowPayment(true);
                  }}
                  variant="default"
                  className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600"
                >
                  <Zap size={16} />
                  <span>Submit Job via Secure Crypto Payment ($15) - Coinbase</span>
                </Button>
              )}
              
              {/* Free listing submission button */}
              {listing.type !== 'job' && !listing.isPaid && isAuthenticated && user?.id === listing.userId && (
                <Button 
                  onClick={async () => {
                    try {
                      const response = await fetch(`/api/listings/${listingId}/submit`, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json'
                        }
                      });
                      
                      if (response.ok) {
                        // Show success toast
                        toast({
                          title: "Listing Submitted",
                          description: "Your listing has been successfully published and is now live!",
                          variant: "success"
                        });
                        
                        // Refresh the listing data
                        queryClient.invalidateQueries({ queryKey: ['/api/listings', parseInt(listingId)] });
                      } else {
                        const errorData = await response.json();
                        toast({
                          title: "Submission Failed",
                          description: errorData.message || "Failed to submit listing. Please try again.",
                          variant: "destructive"
                        });
                      }
                    } catch (error) {
                      console.error('Error submitting listing:', error);
                      toast({
                        title: "Submission Error",
                        description: "An unexpected error occurred. Please try again later.",
                        variant: "destructive"
                      });
                    }
                  }}
                  variant="default"
                  className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600"
                >
                  <Zap size={16} />
                  <span>Submit Listing (Free)</span>
                </Button>
              )}
              
              {/* Edit button placed UNDERNEATH the job payment button */}
              {isAuthenticated && user?.id === listing.userId && (
                <Link href={`/listing/${listingId}/edit`}>
                  <Button 
                    variant="default"
                    className="flex items-center gap-2 w-full"
                  >
                    <span>Edit Listing</span>
                  </Button>
                </Link>
              )}
            </div>
            
            {/* Featured and Boost buttons available for all live listings owned by the current user */}
            {isAuthenticated && user?.id === listing.userId && listing.status === 'active' && (
              <div className="flex flex-col gap-2 mt-2">
                {!listing.isFeatured && (
                  <Button 
                    onClick={() => {
                      setPaymentType('featured');
                      setShowPayment(true);
                    }}
                    variant="default"
                    className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600"
                  >
                    <Zap size={16} />
                    <span>Feature Listing via Crypto Payment ($5) - Coinbase</span>
                  </Button>
                )}
                
                {!listing.isBoosted && (
                  <Button 
                    onClick={() => {
                      setPaymentType('boost');
                      setShowPayment(true);
                    }}
                    variant="default"
                    className="flex items-center gap-2 bg-green-500 hover:bg-green-600"
                  >
                    <Zap size={16} />
                    <span>Boost Visibility via Crypto Payment ($5) - Coinbase</span>
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="border border-gray-300 p-4 mb-6">
          <h2 className="text-lg font-medium mb-2">about the poster</h2>
          <p className="mb-4">
            User ID: {listing.userId}
          </p>
          <p className="text-sm text-gray-600">
            Contact via platform messaging
          </p>
        </div>
        
        <div className="border border-red-200 bg-red-50 p-4 mb-6">
          <div className="flex items-center gap-2 text-red-700 mb-2">
            <AlertTriangle size={18} />
            <h2 className="text-lg font-medium">safety tips</h2>
          </div>
          <ul className="text-sm space-y-2 text-gray-800">
            <li>• Deal locally whenever possible</li>
            <li>• Never send payments in advance</li>
            <li>• Verify all Web3 wallet addresses before transacting</li>
            <li>• Use a secure escrow service for high-value transactions</li>
            <li>• Meet in public places for in-person transactions</li>
          </ul>
        </div>
        
        <div className="text-center space-x-4">
          <Link href="/post" className="text-blue-700 hover:underline text-sm">
            post a similar listing
          </Link>
          <button className="text-red-600 hover:underline text-sm flex items-center gap-1 inline-flex">
            <Ban size={14} /> report this listing
          </button>
        </div>
      </div>
    </>
  );
}