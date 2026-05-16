import { Listing } from '@shared/schema';

/**
 * Helper function to categorize listings more intelligently
 * This is a central place for all categorization logic
 */
export function categorizeListing(listing: Listing): string {
  const title = listing.title.toLowerCase();
  const description = listing.description?.toLowerCase() || '';
  
  // Check for personal connections (M4W, W4M, etc.)
  const personalConnectionPatterns = [
    /\bm4w\b/, /\bw4m\b/, /\bm4m\b/, /\bw4w\b/, 
    /\bm4t\b/, /\bw4t\b/, /\bt4m\b/, /\bt4w\b/, /\bt4t\b/,
    /\bcouple4m\b/, /\bcouple4w\b/, /\bcouple4couple\b/
  ];
  
  // Check for explicit casual encounter keywords
  const casualKeywords = [
    'casual encounter', 'hookup', 'hook-up', 'hook up', 'one night',
    'nsa', 'fwb', 'friends with benefits', 'no strings', 
    'discreet', 'discrete', 'adult fun', 'adult dating'
  ];
  
  // Check for crypto/blockchain/community keywords
  const communityKeywords = [
    'crypto', 'blockchain', 'web3', 'nft', 'token', 'dao', 'defi',
    'ethereum', 'bitcoin', 'meetup', 'community group', 'study group'
  ];
  
  // First filter - explicit personal connection patterns
  if (personalConnectionPatterns.some(pattern => pattern.test(title))) {
    // Further check if it's a casual encounter
    if (casualKeywords.some(keyword => title.includes(keyword) || description.includes(keyword))) {
      return 'casual';
    }
    return 'personal';
  }
  
  // Second filter - community/blockchain content
  if (communityKeywords.some(keyword => title.includes(keyword) || description.includes(keyword))) {
    return 'community';
  }
  
  // Check original type if set
  if (listing.type) {
    return listing.type;
  }
  
  // Default fallback to job since it's a common listing type
  return 'job';
}

/**
 * Helper to filter listings by subcategory with special handling for personal/casual
 */
export function filterListingsBySubcategory(
  listings: Listing[],
  type: string,
  subcategory: string
): Listing[] {
  const subCategoryPattern = String(subcategory).toLowerCase();
  
  // For personals or casual encounters, we need more specific filtering for connection types
  if (type === 'personal' || type === 'casual') {
    // For personal/casual connection types (M4W, W4M, etc.), look for exact patterns in title
    const connectionPattern = new RegExp(`\\b${subCategoryPattern}\\b`, 'i');
    return listings.filter(
      listing => connectionPattern.test(listing.title.toLowerCase())
    );
  } else {
    // For other types, use the subcategory field if available, otherwise fall back to title
    return listings.filter(listing => 
      (listing.subcategory && listing.subcategory.toLowerCase() === subCategoryPattern) ||
      listing.title.toLowerCase().includes(subCategoryPattern)
    );
  }
}