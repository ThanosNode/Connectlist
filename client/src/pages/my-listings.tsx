import { Helmet } from "react-helmet-async";
import { useAuth } from "@/context/AuthContext";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye, Plus, User, AlertCircle } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Listing } from "@shared/schema";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function MyListings() {
  const { user, isAuthenticated } = useAuth();
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const [listingToDelete, setListingToDelete] = useState<number | null>(null);
  
  // Fetch user's listings
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/listings/user'],
    queryFn: async () => {
      if (!isAuthenticated) return null;
      
      const response = await fetch('/api/listings/user');
      if (!response.ok) {
        throw new Error('Failed to fetch your listings');
      }
      return await response.json() as Listing[];
    },
    enabled: !!isAuthenticated,
  });
  
  // Delete listing mutation
  const deleteMutation = useMutation({
    mutationFn: async (listingId: number) => {
      const response = await apiRequest('DELETE', `/api/listings/${listingId}`);
      if (!response.ok) {
        throw new Error('Failed to delete listing');
      }
      return listingId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/listings/user'] });
      toast({
        title: "Listing Deleted",
        description: "Your listing has been successfully removed",
      });
      setListingToDelete(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete listing",
        variant: "destructive",
      });
      setListingToDelete(null);
    }
  });
  
  // Redirect to home if not authenticated
  if (!user) {
    if (typeof window !== "undefined") {
      navigate("/");
    }
    return null;
  }
  
  // Use the API data for listings
  const listings = data || [];
  
  return (
    <>
      <Helmet>
        <title>My Listings | ConnectList</title>
        <meta name="description" content="Manage your listings on ConnectList - the Web3-focused classifieds platform." />
      </Helmet>
      
      <div className="max-w-4xl mx-auto">
        <h1 className="text-xl font-bold mb-6">my listings</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-1">
            <div className="border border-gray-300 p-4">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                  <User size={24} className="text-gray-500" />
                </div>
                <div>
                  <h2 className="font-medium">{user.username}</h2>
                  <p className="text-sm text-gray-600">Member since {new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              
              <nav className="space-y-3">
                <Link href="/profile" className="text-blue-700 hover:underline block">
                  Profile Overview
                </Link>
                <Link href="/my-listings" className="text-blue-700 hover:underline block font-medium">
                  My Listings
                </Link>
                <Link href="/profile/settings" className="text-blue-700 hover:underline block">
                  Account Settings
                </Link>
              </nav>
            </div>
          </div>
          
          <div className="col-span-1 md:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">your listings</h2>
              <Link href="/post">
                <Button className="flex items-center text-sm">
                  <Plus size={16} className="mr-1" /> new listing
                </Button>
              </Link>
            </div>
            
            {isLoading ? (
              <div className="border border-gray-300 p-6 text-center">
                <Spinner className="h-8 w-8 mx-auto mb-4" />
                <p className="text-gray-600">Loading your listings...</p>
              </div>
            ) : error ? (
              <div className="border border-gray-300 p-6 text-center">
                <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-500" />
                <p className="text-gray-600 mb-4">Failed to load your listings.</p>
                <Button 
                  variant="outline" 
                  onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/listings/user'] })}
                >
                  Try Again
                </Button>
              </div>
            ) : listings.length === 0 ? (
              <div className="border border-gray-300 p-6 text-center">
                <p className="text-gray-600 mb-4">You don't have any listings yet</p>
                <Link href="/post">
                  <Button variant="outline" className="flex items-center mx-auto">
                    <Plus size={16} className="mr-1" /> Create Your First Listing
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="border border-gray-300">
                {listings.map((listing) => (
                  <div 
                    key={listing.id} 
                    className="p-4 border-b border-gray-300 last:border-b-0"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium">
                          {listing.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {listing.type} {listing.subcategory && `> ${listing.subcategory}`}
                        </p>
                      </div>
                      <div>
                        <span className={`text-xs px-2 py-1 rounded capitalize ${
                          listing.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : listing.status === 'featured'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                        }`}>
                          {listing.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center mt-3">
                      <div className="text-sm text-gray-600">
                        <span>Price: {listing.price ? `$${listing.price.toLocaleString()}` : 'Free'}</span>
                        <span className="mx-2">•</span>
                        <span>Created: {new Date(listing.createdAt).toLocaleDateString()}</span>
                        <span className="mx-2">•</span>
                        <span>Location: {listing.city}, {listing.state}</span>
                        {listing.isRemote && <span className="ml-1">(Remote)</span>}
                      </div>
                      
                      <div className="flex space-x-2">
                        <Link href={`/listing/${listing.id}`}>
                          <Button variant="ghost" size="sm" className="text-blue-700 hover:bg-blue-50">
                            <Eye size={16} />
                          </Button>
                        </Link>
                        <Link href={`/listing/${listing.id}/edit`}>
                          <Button variant="ghost" size="sm" className="text-blue-700 hover:bg-blue-50">
                            <Edit size={16} />
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-600 hover:bg-red-50"
                          onClick={() => setListingToDelete(listing.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Delete confirmation dialog */}
            <AlertDialog open={!!listingToDelete} onOpenChange={() => setListingToDelete(null)}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete your listing. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => {
                      if (listingToDelete) {
                        deleteMutation.mutate(listingToDelete);
                      }
                    }}
                    className="bg-red-600 text-white hover:bg-red-700"
                  >
                    {deleteMutation.isPending ? (
                      <>
                        <Spinner className="h-4 w-4 mr-2" />
                        Deleting...
                      </>
                    ) : (
                      'Delete Listing'
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </>
  );
}