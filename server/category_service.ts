import { Listing } from '@shared/schema';

/**
 * Helper function to categorize listings more intelligently
 * This is a central place for all categorization logic
 */
export function categorizeListing(listing: Listing): Listing {
  const title = listing.title.toLowerCase();
  const description = listing.description?.toLowerCase() || '';
  
  // Personal pattern detection - STRICT formats only with word boundaries
  const personalPattern = /\b(m4w|w4m|m4m|w4w|m4t|w4t|t4m|t4w|t4t|couple4m|couple4w|couple4couple)\b/i;
  
  // Words that should never be classified as personal listings
  const nonPersonalKeywords = [
    'dao', 'token', 'nft', 'blockchain', 'crypto', 'workshop', 'design', 'developer', 
    'economics', 'job', 'position', 'hiring', 'business', 'service', 'development',
    'governance', 'platform', 'ui/ux', 'designer', 'engineer', 'architect'
  ];
  
  // Check if title contains any non-personal keywords
  const containsNonPersonalKeyword = nonPersonalKeywords.some(keyword => 
    title.toLowerCase().includes(keyword)
  );
  
  // Only classify as personal if it has a valid connection pattern AND doesn't contain non-personal keywords
  if (personalPattern.test(title) && !containsNonPersonalKeyword) {
    // Extract the connection type (M4W, W4M, etc.) and standardize to uppercase
    const match = title.match(personalPattern)?.[0] || '';
    // Standardize the connection type format
    let connectionType = match.toUpperCase();
    
    return { 
      ...listing, 
      type: 'personal',
      subcategory: connectionType || null
    };
  }
  
  // Casual pattern detection
  const casualPattern = /casual|hook\s*up|one\s*night|nsa|fwb|friends\s*with\s*benefits/i;
  if (casualPattern.test(title) || casualPattern.test(description)) {
    return { ...listing, type: 'casual' };
  }
  
  // Job pattern detection
  const jobPattern = /hiring|job|position|career|employment|remote\s*work|work\s*from\s*home|apply|resume/i;
  if (jobPattern.test(title) || jobPattern.test(description)) {
    return { ...listing, type: 'job' };
  }
  
  // Business pattern detection
  const businessPattern = /business|service|professional|company|startup|entrepreneur|consulting|enterprise/i;
  if (businessPattern.test(title) || businessPattern.test(description)) {
    return { ...listing, type: 'business' };
  }
  
  // Community pattern detection
  const communityPattern = /community|crypto|blockchain|web3|nft|token|defi|meetup|group|event/i;
  if (communityPattern.test(title) || communityPattern.test(description)) {
    return { ...listing, type: 'community' };
  }
  
  // Return original if no patterns match
  return listing;
}

/**
 * Helper to filter listings by subcategory with special handling for personal/casual
 */
export function filterListingsBySubcategory(
  listings: Listing[],
  type: string | null,
  subcategory: string | null
): Listing[] {
  if (!subcategory) return listings;
  
  const subCategoryPattern = String(subcategory).toLowerCase();
  
  // Non-personal keywords that should NEVER be included in personal listings
  const nonPersonalKeywords = [
    'dao', 'token', 'nft', 'blockchain', 'crypto', 'workshop', 'design', 'developer', 
    'economics', 'job', 'position', 'hiring', 'business', 'service', 'development',
    'governance', 'platform', 'ui/ux', 'designer', 'engineer', 'architect'
  ];

  // For personals or casual, handle connection types (M4W, W4M, etc.)
  if (type === 'personal' || type === 'casual') {
    // Standardize the search pattern
    let searchPattern = subCategoryPattern;
    
    // Normalize abbreviated patterns
    if (searchPattern === 'm4') searchPattern = 'm4m';
    if (searchPattern === 'w4') searchPattern = 'w4w';
    if (searchPattern === 't4') searchPattern = 't4t';
    if (searchPattern === '4m') searchPattern = 'm4m';
    if (searchPattern === '4w') searchPattern = 'w4w';
    if (searchPattern === '4t') searchPattern = 't4t';
    
    return listings.filter(listing => {
      const title = listing.title.toLowerCase();
      
      // Exclude listings with non-personal keywords
      const hasNonPersonalKeywords = nonPersonalKeywords.some(keyword => 
        title.includes(keyword)
      );
      
      if (hasNonPersonalKeywords) {
        return false;
      }
      
      // Primary check: Look at the subcategory field first (which was set in categorizeListing)
      if (listing.subcategory && listing.subcategory.toLowerCase() === searchPattern) {
        return true;
      }
      
      // Secondary check: Check if the standardized pattern appears in the title
      // Use word boundary for more precise matching
      const connectionPattern = new RegExp(`\\b${searchPattern}\\b`, 'i');
      if (connectionPattern.test(title)) {
        return true;
      }
      
      // Check if this should be a personal listing at all - must have a connection pattern
      const hasConnectionPattern = /\b(m4w|w4m|m4m|w4w|m4t|w4t|t4m|t4w|t4t|couple4m|couple4w|couple4couple)\b/i.test(title);
      if (!hasConnectionPattern) {
        return false;
      }
      
      // Last resort: Check if original subcategory appears anywhere in title
      return title.includes(subCategoryPattern);
    });
  }
  
  // For other types, check subcategory field or title with more precise matching
  return listings.filter(listing => 
    (listing.subcategory && listing.subcategory.toLowerCase() === subCategoryPattern) ||
    listing.title.toLowerCase().includes(subCategoryPattern)
  );
}

/**
 * Apply category-specific filtering to listings
 * A unified function to use in route handlers
 */
export function applyCategoryFiltering(
  listings: Listing[],
  type: string | null,
  subcategory: string | null
): Listing[] {
  // First categorize all listings properly
  const categorizedListings = listings.map(categorizeListing);
  
  // If no type filter is required, just return categorized listings
  if (!type) return categorizedListings;
  
  // Words that should never be classified as personal listings
  const nonPersonalKeywords = [
    'dao', 'token', 'nft', 'blockchain', 'crypto', 'workshop', 'design', 'developer', 
    'economics', 'job', 'position', 'hiring', 'business', 'service', 'development',
    'governance', 'platform', 'ui/ux', 'designer', 'engineer', 'architect'
  ];
  
  // For personal listings, apply special filtering to prevent wrong categorization
  if (type === 'personal') {
    const personalPattern = /\b(m4w|w4m|m4m|w4w|m4t|w4t|t4m|t4w|t4t|couple4m|couple4w|couple4couple)\b/i;
    
    // Special strict filtering for personal listings - must have connection pattern AND no business keywords
    const strictlyPersonalListings = categorizedListings.filter(listing => {
      const title = listing.title.toLowerCase();
      
      // Must have a valid connection pattern
      const hasConnectionPattern = personalPattern.test(title);
      
      // Must NOT have any non-personal keywords
      const hasNonPersonalKeywords = nonPersonalKeywords.some(keyword => 
        title.includes(keyword)
      );
      
      return listing.type === type && hasConnectionPattern && !hasNonPersonalKeywords;
    });
    
    // If no subcategory filter is required, return strictly filtered personal listings
    if (!subcategory) return strictlyPersonalListings;
    
    // Apply subcategory filtering with special handling for personal connection types
    return filterListingsBySubcategory(strictlyPersonalListings, type, subcategory);
  } 
  
  // For other listing types, use normal filtering
  const typeFilteredListings = categorizedListings.filter(
    listing => listing.type === type
  );
  
  // If no subcategory filter is required, return type-filtered listings
  if (!subcategory) return typeFilteredListings;
  
  // Apply subcategory filtering for non-personal listings
  return filterListingsBySubcategory(typeFilteredListings, type, subcategory);
}