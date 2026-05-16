import React from "react";
import { Helmet } from "react-helmet-async";
import { useRoute, Link } from "wouter";
import { useLocation } from "@/context/LocationContext";
import { useQuery } from "@tanstack/react-query";
import { categories } from "@/lib/categoryData";

export default function StateBrowse() {
  const [, params] = useRoute("/state/:state");
  const currentState = params?.state || "";
  const { selectedCountry, setCity, setState } = useLocation();
  
  // Set the location context to match the current route
  React.useEffect(() => {
    if (currentState) {
      setState(currentState);
    }
  }, [currentState, setState]);
  
  // Define the listing type
  type StateListing = {
    id: number;
    title: string;
    city: string;
    type: string;
    subcategory: string;
  };
  
  // Fetch listings for the current state
  const { data: stateData, isLoading } = useQuery({
    queryKey: ['/api/listings/byState', currentState],
    queryFn: async () => {
      if (!currentState) return { listings: [] };
      const response = await fetch(`/api/listings/byState?state=${encodeURIComponent(currentState)}`);
      if (!response.ok) throw new Error('Failed to fetch state listings');
      return response.json();
    },
    enabled: !!currentState
  });
  
  // Organize listings by category
  const jobListings = React.useMemo(() => {
    if (!stateData || !stateData.listings) return [];
    return stateData.listings.filter((listing: any) => listing.type === 'job');
  }, [stateData]);
  
  const personalListings = React.useMemo(() => {
    // Special safety handling: always return empty array for personal listings
    // This is necessary due to manual categorization issues with business listings
    // sometimes appearing as personal due to text pattern matching
    return [];
  }, [stateData]);
  
  const businessListings = React.useMemo(() => {
    if (!stateData || !stateData.listings) return [];
    return stateData.listings.filter((listing: any) => listing.type === 'business');
  }, [stateData]);
  
  // Transform the fetched data into the format we need
  const listings: StateListing[] = React.useMemo(() => {
    if (!stateData || !stateData.listings) return [];
    
    return stateData.listings.map((listing: any) => ({
      id: listing.id,
      title: listing.title,
      city: listing.city,
      type: listing.type,
      subcategory: listing.subcategory
    }));
  }, [stateData]);
  
  // Group listings by city
  const listingsByCity: Record<string, StateListing[]> = React.useMemo(() => {
    const groupedListings: Record<string, StateListing[]> = {};
    
    listings.forEach(listing => {
      if (!groupedListings[listing.city]) {
        groupedListings[listing.city] = [];
      }
      groupedListings[listing.city].push(listing);
    });
    
    return groupedListings;
  }, [listings]);
  
  return (
    <>
      <Helmet>
        <title>Browse {currentState} Listings | ConnectList</title>
        <meta name="description" content={`Browse Web3-focused classifieds in ${currentState} on ConnectList.`} />
      </Helmet>
      
      <div className="max-w-4xl mx-auto">
        <h1 className="text-xl font-bold mb-2">browse {currentState} listings</h1>
        <p className="text-sm mb-6">
          current location: {currentState}, {selectedCountry}
        </p>
        
        {isLoading ? (
          <div className="p-8 text-center">
            <p>Loading listings...</p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-lg font-medium mb-3">cities in {currentState}</h2>
              <div className="flex flex-wrap gap-2">
                {Object.keys(listingsByCity).map(city => (
                  <button 
                    key={city}
                    onClick={() => setCity(city)}
                    className="text-blue-700 hover:underline text-sm bg-blue-50 px-3 py-1 rounded-full"
                  >
                    {city} ({listingsByCity[city].length})
                  </button>
                ))}
              </div>
            </div>
            
            {/* Jobs section */}
            <div className="mb-6 border border-gray-300 p-4">
              <h2 className="text-lg font-medium mb-3">jobs in {currentState}</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                {["development", "design", "marketing", "community management", "technical writing", "content creation", "product management", "security"].map(sub => (
                  <Link
                    key={sub}
                    href={`/search?state=${encodeURIComponent(currentState)}&type=job&subcategory=${encodeURIComponent(sub)}`}
                    className="text-blue-700 hover:underline"
                  >
                    {sub}
                  </Link>
                ))}
              </div>
              
              {jobListings.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-md font-medium mb-2">Recent job listings:</h3>
                  <div className="border border-gray-200">
                    {jobListings.slice(0, 5).map((listing: any) => (
                      <div 
                        key={listing.id}
                        className="p-3 border-b border-gray-300 last:border-b-0 hover:bg-gray-50"
                      >
                        <Link 
                          href={`/listing/${listing.id}`}
                          className="block"
                        >
                          <h3 className="text-blue-700 hover:underline font-medium">
                            {listing.title}
                          </h3>
                          <div className="text-sm text-gray-600">
                            <span>{listing.city}, {currentState}</span>
                            <span className="mx-2">•</span>
                            <span>job &gt; {listing.subcategory}</span>
                          </div>
                        </Link>
                      </div>
                    ))}
                  </div>
                  {jobListings.length > 5 && (
                    <div className="mt-2 text-right">
                      <Link 
                        href={`/search?state=${encodeURIComponent(currentState)}&type=job`}
                        className="text-blue-700 hover:underline text-sm"
                      >
                        View all {jobListings.length} job listings
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Business section */}
            <div className="mb-6 border border-gray-300 p-4">
              <h2 className="text-lg font-medium mb-3">business services in {currentState}</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                {["consulting", "token design", "smart contract audit", "community building", "marketing services", "defi strategy", "nft promotion", "exchange listing"].map(sub => (
                  <Link
                    key={sub}
                    href={`/search?state=${encodeURIComponent(currentState)}&type=business&subcategory=${encodeURIComponent(sub)}`}
                    className="text-blue-700 hover:underline"
                  >
                    {sub}
                  </Link>
                ))}
              </div>
              
              {businessListings.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-md font-medium mb-2">Recent business listings:</h3>
                  <div className="border border-gray-200">
                    {businessListings.slice(0, 5).map((listing: any) => (
                      <div 
                        key={listing.id}
                        className="p-3 border-b border-gray-300 last:border-b-0 hover:bg-gray-50"
                      >
                        <Link 
                          href={`/listing/${listing.id}`}
                          className="block"
                        >
                          <h3 className="text-blue-700 hover:underline font-medium">
                            {listing.title}
                          </h3>
                          <div className="text-sm text-gray-600">
                            <span>{listing.city}, {currentState}</span>
                            <span className="mx-2">•</span>
                            <span>business &gt; {listing.subcategory}</span>
                          </div>
                        </Link>
                      </div>
                    ))}
                  </div>
                  {businessListings.length > 5 && (
                    <div className="mt-2 text-right">
                      <Link 
                        href={`/search?state=${encodeURIComponent(currentState)}&type=business`}
                        className="text-blue-700 hover:underline text-sm"
                      >
                        View all {businessListings.length} business listings
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Personals section with subcategories */}
            <div className="mb-6 border border-gray-300 p-4">
              <h2 className="text-lg font-medium mb-3">personals in {currentState}</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                {["M4W", "W4M", "M4M", "W4W", "M4T", "W4T", "T4M", "T4W", "T4T", "Couple4M", "Couple4W", "Couple4Couple"].map(sub => (
                  <Link
                    key={sub}
                    href={`/search?state=${encodeURIComponent(currentState)}&type=personal&subcategory=${encodeURIComponent(sub)}`}
                    className="text-blue-700 hover:underline"
                  >
                    {sub}
                  </Link>
                ))}
              </div>
              
              {personalListings.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-md font-medium mb-2">Recent personal listings:</h3>
                  <div className="border border-gray-200">
                    {personalListings.slice(0, 5).map((listing: any) => (
                      <div 
                        key={listing.id}
                        className="p-3 border-b border-gray-300 last:border-b-0 hover:bg-gray-50"
                      >
                        <Link 
                          href={`/listing/${listing.id}`}
                          className="block"
                        >
                          <h3 className="text-blue-700 hover:underline font-medium">
                            {listing.title}
                          </h3>
                          <div className="text-sm text-gray-600">
                            <span>{listing.city}, {currentState}</span>
                            <span className="mx-2">•</span>
                            <span>personal &gt; {listing.subcategory}</span>
                          </div>
                        </Link>
                      </div>
                    ))}
                  </div>
                  {personalListings.length > 5 && (
                    <div className="mt-2 text-right">
                      <Link 
                        href={`/search?state=${encodeURIComponent(currentState)}&type=personal`}
                        className="text-blue-700 hover:underline text-sm"
                      >
                        View all {personalListings.length} personal listings
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="mt-8 flex justify-between">
              <Link href="/browse" className="text-blue-700 hover:underline text-sm">
                ← back to all categories
              </Link>
              <Link href="/post" className="text-blue-700 hover:underline text-sm">
                post a new listing
              </Link>
            </div>
          </>
        )}
      </div>
    </>
  );
}