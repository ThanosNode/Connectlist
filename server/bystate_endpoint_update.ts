// Updated code for the /api/listings/byState endpoint
app.get('/api/listings/byState', async (req, res) => {
  try {
    const { country, state, city, type, subcategory } = req.query;

    if (!state) {
      return res.status(400).json({ error: "State parameter is required" });
    }
    
    // Get listings with location filtering
    const { listings, hasMore } = await storage.getListings({
      country: country as string | undefined,
      state: state as string,
      city: city as string | undefined,
      // Don't filter by type at database level so we can use our custom categorization
      perPage: 50 // Get more listings for state pages
    });
    
    // Use our improved category service to handle all filtering 
    const filteredListings = applyCategoryFiltering(
      listings, 
      type as string || null, 
      subcategory as string || null
    );
    
    console.log(`State listings: country=${country}, state=${state}, city=${city}, type=${type}, subcategory=${subcategory}, found=${filteredListings.length} listings`);
    
    res.status(200).json({ 
      listings: filteredListings, 
      hasMore: filteredListings.length < listings.length ? false : hasMore 
    });
  } catch (error) {
    console.error("Error fetching state listings:", error);
    res.status(500).json({ error: "Failed to fetch state listings" });
  }
});