import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Listing } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocation } from "@/context/LocationContext";
import { ListingStatusTag } from "@/components/ui/ListingStatusTag";

export default function FeaturedListings() {
  const { selectedCountry, selectedState, selectedCity } = useLocation();
  
  const { data: featuredListings, isLoading, error } = useQuery<Listing[]>({
    queryKey: ['/api/listings/featured'],
    queryFn: async () => {
      // For featured listings, we'll show from all locations to ensure we have some content
      const url = `/api/listings/featured`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch featured listings');
      }
      
      const data = await response.json();
      console.log('Featured listings data:', data);
      return data;
    }
  });

  if (isLoading) {
    return (
      <section className="mb-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Featured Listings</h2>
          <Link href="/listings/featured" className="text-blue-700 text-sm hover:underline">
            view all
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-gray-200 rounded-md p-4">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-3" />
              <Skeleton className="h-16 w-full mb-4" />
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-6 w-1/4 rounded" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mb-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Featured Listings</h2>
        </div>
        <div className="p-4 border border-red-300 bg-red-50 rounded-md text-red-500">
          Failed to load featured listings. Please try again later.
        </div>
      </section>
    );
  }

  if (!featuredListings || featuredListings.length === 0) {
    return (
      <section className="mb-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Featured Listings</h2>
        </div>
        <div className="p-4 border border-gray-200 rounded-md text-gray-500 text-center">
          No featured listings available at the moment.
        </div>
      </section>
    );
  }

  return (
    <section className="mb-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Featured Listings</h2>
        <Link href="/listings/featured" className="text-blue-700 text-sm hover:underline">
          view all
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, colIndex) => (
          <div key={colIndex} className="divide-y divide-gray-200 border-t border-b border-gray-200">
            {featuredListings
              .filter((_, index) => index % 3 === colIndex)
              .map((listing) => (
                <div 
                  key={listing.id} 
                  className="py-3 px-2 hover:bg-gray-50 transition"
                >
                  <h3 className="font-medium">
                    <Link href={`/listing/${listing.id}`} className="text-blue-700 hover:underline">
                      {listing.title}
                    </Link>
                    {' '}
                    <span className="ml-2">
                      <ListingStatusTag 
                        status={listing.status} 
                        type={listing.type} 
                        isFeatured={listing.isFeatured} 
                        isVerified={true} 
                      />
                    </span>
                  </h3>
                  <div className="flex flex-wrap gap-2 text-xs text-gray-500 mt-1">
                    <span>{listing.city}, {listing.state}</span>
                    <span>•</span>
                    {listing.price ? (
                      <span>${(listing.price / 100).toFixed(2)}</span>
                    ) : (
                      <span>{listing.type === 'job' ? 'Job' : listing.type === 'business' ? 'Business' : 'Personal'}</span>
                    )}
                  </div>
                </div>
              ))}
          </div>
        ))}
      </div>
    </section>
  );
}
