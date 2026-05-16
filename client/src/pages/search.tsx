import { Helmet } from "react-helmet-async";
import { useLocation, Link } from "wouter";
import { useLocation as useLocationContext } from "@/context/LocationContext";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { Spinner } from "@/components/ui/spinner";
import { Listing } from "@shared/schema";
import { useState, useEffect } from "react";

export default function SearchResults({ params }: { params?: { type?: string, subcategory?: string } }) {
  const { selectedCountry, selectedState, selectedCity } = useLocationContext();
  const [location] = useLocation();
  
  // Parse search parameters from URL query or path params
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  
  // Get all parameters with path parameters taking priority
  const type = params?.type || searchParams.get('type');
  const subcategory = params?.subcategory || searchParams.get('subcategory');
  
  // For country, use query param first, then context
  let country = searchParams.get('country');
  if (!country) {
    country = selectedCountry;
  }
  
  // For state, use query param first, then context state
  // If this is a category/subcategory path-based URL, always default to California
  let state = searchParams.get('state');
  if (!state) {
    state = params?.type && !searchParams.get('state') ? "California" : selectedState;
  }
  
  // Log the parameters for debugging
  useEffect(() => {
    console.log("Search params:", { 
      type, 
      subcategory, 
      country,
      state, 
      pathParams: params 
    });
    
    // If we have path parameters but no state, set a default state
    if (params && !state) {
      console.log("Path-based search with no state provided, using default state: California");
    }
  }, [type, subcategory, country, state, params]);
  
  // Create the title based on search parameters including country
  const title = subcategory 
    ? `${subcategory} in ${state}, ${country}`
    : type 
      ? `${type} listings in ${state}, ${country}`
      : `Listings in ${state}, ${country}`;
  
  // Fetch listings based on parameters
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/listings/search', country, state, type, subcategory],
    queryFn: async () => {
      // Build query parameters 
      const queryParams = new URLSearchParams();
      if (country) queryParams.append("country", country);
      if (state) queryParams.append("state", state);
      if (type) queryParams.append("type", type);
      if (subcategory) queryParams.append("subcategory", subcategory);
      
      console.log("Fetching with query params:", queryParams.toString());
      
      const response = await fetch(`/api/listings/search?${queryParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch listings');
      }
      const data = await response.json();
      
      return {
        listings: data.listings as Listing[],
        hasMore: data.hasMore
      };
    },
  });

  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="text-center py-12">
        <h1 className="text-xl font-medium mb-4">Error loading listings</h1>
        <p className="text-gray-600">
          There was a problem fetching the listings. Please try again.
        </p>
      </div>
    );
  }

  const listings = data?.listings || [];
  const hasMore = data?.hasMore || false;

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <Helmet>
        <title>{title} | ConnectList</title>
        <meta name="description" content={`Browse ${title} on ConnectList, the Web3-powered marketplace`} />
      </Helmet>
      
      <h1 className="text-2xl font-medium mb-6">{title}</h1>
      
      {/* Category navigation for direct path URLs */}
      {type === 'personal' && (
        <div className="mb-4 p-4 border border-gray-300">
          <h3 className="mb-2 font-medium">Browse personal categories in {state}, {country}:</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
            {["M4W", "W4M", "M4M", "W4W", "M4T", "W4T", "T4M", "T4W", "T4T", "Couple4M", "Couple4W", "Couple4Couple"].map(sub => (
              <Link
                key={sub}
                href={`/search?country=${encodeURIComponent(country)}&state=${encodeURIComponent(state)}&type=personal&subcategory=${encodeURIComponent(sub)}`}
                className="text-blue-700 hover:underline"
              >
                {sub}
              </Link>
            ))}
          </div>
        </div>
      )}
        
      {listings.length === 0 ? (
        <div className="text-center py-12 border border-gray-300">
          <p className="text-gray-600">No listings found.</p>
          <Link 
            href="/post" 
            className="mt-4 inline-block text-blue-700 hover:underline"
          >
            Be the first to post in this category
          </Link>
        </div>
      ) : (
        <div className="border border-gray-300">
          {listings.map((listing) => (
            <div 
              key={listing.id}
              className="p-3 border-b border-gray-300 last:border-b-0 hover:bg-gray-50"
            >
              <Link 
                href={`/listing/${listing.id}`}
                className="block"
              >
                <div className="flex justify-between">
                  <h3 className="text-blue-700 hover:underline font-medium">
                    {listing.title}
                  </h3>
                  {listing.price !== null && listing.price > 0 && (
                    <span className="text-green-700">${listing.price}</span>
                  )}
                </div>
                <div className="text-gray-600 text-sm mt-1">
                  {listing.city}, {listing.state}
                  {listing.isRemote && <span className="ml-2">(Remote Available)</span>}
                  <span className="ml-2">
                    {format(new Date(listing.createdAt), 'MMM d')}
                  </span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
      
      {hasMore && (
        <div className="text-center mt-4">
          <button 
            className="px-4 py-2 text-blue-700 hover:underline"
          >
            Load more
          </button>
        </div>
      )}
    </div>
  );
}