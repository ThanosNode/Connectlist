// Updated filtering logic for personals and casual encounters
  
// For byState endpoint - part 1
if (subcategory) {
  const subCategoryPattern = String(subcategory).toLowerCase();
  
  // For personals or casual encounters, we need more specific filtering based on connection types
  if (type === 'personal' || type === 'casual') {
    // For personal/casual connection types (M4W, W4M, etc.), look for exact patterns in title
    const connectionPattern = new RegExp(`\\b${subCategoryPattern}\\b`, 'i');
    filteredListings = filteredListings.filter(
      listing => connectionPattern.test(listing.title.toLowerCase())
    );
    console.log(`Filtering ${type} by connection pattern "${subCategoryPattern}", found ${filteredListings.length} listings`);
  } else {
    // For other types, use the subcategory field if available, otherwise fall back to title
    filteredListings = filteredListings.filter(listing => 
      (listing.subcategory && listing.subcategory.toLowerCase() === subCategoryPattern) ||
      listing.title.toLowerCase().includes(subCategoryPattern)
    );
  }
}

// For second occurrence - for the search endpoint
if (subcategory) {
  const subCategoryPattern = String(subcategory).toLowerCase();
  
  // For personals or casual encounters, we need more specific filtering based on connection types
  if (type === 'personal' || type === 'casual') {
    // For personal/casual connection types (M4W, W4M, etc.), look for exact patterns in title
    const connectionPattern = new RegExp(`\\b${subCategoryPattern}\\b`, 'i');
    filteredListings = filteredListings.filter(
      listing => connectionPattern.test(listing.title.toLowerCase())
    );
    console.log(`Filtering ${type} by connection pattern "${subCategoryPattern}", found ${filteredListings.length} listings`);
  } else {
    // For other types, use the subcategory field if available, otherwise fall back to title
    filteredListings = filteredListings.filter(listing => 
      (listing.subcategory && listing.subcategory.toLowerCase() === subCategoryPattern) ||
      listing.title.toLowerCase().includes(subCategoryPattern)
    );
  }
}// Updated code for the /api/listings/search endpoint
app.get('/api/listings/search', async (req, res) => {
  try {
    const { state, type, subcategory, query, country, city } = req.query;
    
    // For URL path-based searches, default to California if state not provided
    const searchState = state ? (state as string) : "California";
    
    // Get listings with all available filters
    const { listings, hasMore } = await storage.getListings({
      country: country as string | undefined,
      state: searchState,
      city: city as string | undefined,
      // Remove the type filter from the database query so we can use our custom categorization
      perPage: 100 // Get more listings for search pages
    });
    
    // Use our improved category service to do all the filtering in one step
    // It handles proper type categorization, subcategory filtering, and pattern matching
    const filteredListings = applyCategoryFiltering(
      listings, 
      type as string || null, 
      subcategory as string || null
    );
    
    // Log the results of our filtering
    console.log(`Search results: country=${country}, state=${searchState}, city=${city}, type=${type}, subcategory=${subcategory}, query=${query}, found=${filteredListings.length} listings`);
    
    res.status(200).json({ 
      listings: filteredListings, 
      hasMore: filteredListings.length < listings.length ? false : hasMore 
    });
  } catch (error) {
    console.error("Error during search:", error);
    res.status(500).json({ error: "Failed to perform search" });
  }
});