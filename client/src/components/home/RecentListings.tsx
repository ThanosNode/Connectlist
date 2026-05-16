import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Listing } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocation } from "@/context/LocationContext";
import { ListingStatusTag } from "@/components/ui/ListingStatusTag";

// Component for a specific listing type (personal, job, business, etc.)
function TypedListings({ type, title, viewAllLink }: { 
  type: string; 
  title: string;
  viewAllLink: string;
}) {
  const [page, setPage] = useState(1);
  const { selectedCountry, selectedState, selectedCity } = useLocation();
  
  // Use location context to filter listings by location
  const { data, isLoading, error, isFetching } = useQuery<{
    listings: Listing[];
    hasMore: boolean;
  }>({
    queryKey: ['/api/listings/recent', type, page, selectedCountry, selectedState, selectedCity],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('type', type);
      
      if (selectedCountry) {
        params.append('country', selectedCountry);
      }
      
      if (selectedState) {
        params.append('state', selectedState);
      }
      
      if (selectedCity) {
        params.append('city', selectedCity);
      }
      
      const url = `/api/listings/recent?${params.toString()}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch listings');
      }
      
      const data = await response.json();
      console.log('API Response for listings:', data);
      return data;
    }
  });

  const loadMore = () => {
    setPage(prev => prev + 1);
  };
  
  if (isLoading) {
    return (
      <section className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">{title}</h2>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-gray-200 rounded-md p-4">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-3" />
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return null; // Don't show error state for type-specific sections
  }

  const { listings, hasMore } = data || { listings: [], hasMore: false };

  if (!listings || listings.length === 0) {
    return null; // Don't show empty state for type-specific sections
  }

  return (
    <section className="mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">{title}</h2>
        <Link href={viewAllLink} className="text-blue-700 text-sm hover:underline">
          view all
        </Link>
      </div>
      <div className="divide-y divide-gray-200 border-t border-b border-gray-200">
        {listings.map((listing: Listing) => (
          <div 
            key={listing.id} 
            className="py-3 hover:bg-gray-50 transition"
          >
            <h3 className="font-medium flex items-center gap-2">
              <Link href={`/listing/${listing.id}`} className="text-blue-700 hover:underline">
                {listing.title}
              </Link>
              <ListingStatusTag 
                status={listing.status} 
                type={listing.type} 
                isFeatured={listing.isFeatured} 
                isVerified={listing.isFeatured || listing.isPaid} 
              />
            </h3>
            <div className="flex flex-wrap gap-2 text-xs text-gray-500 mt-1">
              <span>{listing.city}, {listing.state}</span>
              <span>•</span>
              <span>{new Date(listing.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
        {hasMore && (
          <div className="text-center p-3 border-t border-gray-200">
            <button
              onClick={loadMore}
              disabled={isFetching}
              className="text-blue-700 hover:underline text-sm"
            >
              {isFetching ? "Loading..." : "more listings..."}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export default function RecentListings() {
  const { selectedCountry, selectedState } = useLocation();
  
  // Create location text that includes both country and state if selected
  const locationText = selectedCountry 
    ? (selectedState ? ` in ${selectedState}, ${selectedCountry}` : ` in ${selectedCountry}`)
    : "";

  // Create URL search params for view all links
  const getViewAllLink = (type: string) => {
    const params = new URLSearchParams();
    params.append('type', type);
    
    if (selectedCountry) {
      params.append('country', selectedCountry);
    }
    
    if (selectedState) {
      params.append('state', selectedState);
    }
    
    return `/search?${params.toString()}`;
  };

  return (
    <div className="space-y-8">
      {/* Country name as header */}
      {selectedCountry && (
        <div className="text-lg font-semibold text-center mb-4">
          Showing listings for {selectedState ? `${selectedState}, ` : ""}{selectedCountry}
        </div>
      )}
      
      <TypedListings 
        type="personal" 
        title={`Recent Personal Listings${locationText}`}
        viewAllLink={getViewAllLink("personal")}
      />
      
      <TypedListings 
        type="job" 
        title={`Recent Job Listings${locationText}`}
        viewAllLink={getViewAllLink("job")}
      />
      
      <TypedListings 
        type="business" 
        title={`Recent Business Services${locationText}`}
        viewAllLink={getViewAllLink("business")}
      />
      
      <TypedListings 
        type="community" 
        title={`Recent Community Listings${locationText}`}
        viewAllLink={getViewAllLink("community")}
      />
      
      <TypedListings 
        type="casual" 
        title={`Recent Casual Encounters${locationText}`}
        viewAllLink={getViewAllLink("casual")}
      />
    </div>
  );
}
