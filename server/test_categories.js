// This is a simple test script to verify our categories/filtering system
const { categorizeListing, filterListingsBySubcategory, applyCategoryFiltering } = require('./category_service');

// Sample listings for testing
const sampleListings = [
  {
    id: 1,
    title: "Web3 Developer Needed M4W",
    description: "Looking for a blockchain developer for our crypto project",
    type: "job",
  },
  {
    id: 2,
    title: "M4W seeking connection in San Francisco",
    description: "I'm new to the area and looking to meet new people",
    type: "personal",
  },
  {
    id: 3,
    title: "M4W NSA FWB in Los Angeles - casual encounter",
    description: "Looking for a casual hookup, no strings attached",
    type: "personal", // Should be recategorized as 'casual'
  },
  {
    id: 4,
    title: "Blockchain Study Group - Weekly Meetups",
    description: "Join our community of Web3 enthusiasts",
    type: "job", // Should be recategorized as 'community'
  }
];

// Test category detection
console.log("Testing category detection:");
sampleListings.forEach(listing => {
  const detectedType = categorizeListing(listing);
  console.log(`Listing ${listing.id}: "${listing.title}"`);
  console.log(`  Original type: ${listing.type}`);
  console.log(`  Detected type: ${detectedType}`);
  console.log();
});

// Test filtering by subcategory
console.log("Testing subcategory filtering:");
const m4wFilter = filterListingsBySubcategory(sampleListings, 'personal', 'M4W');
console.log(`M4W personal listings found: ${m4wFilter.length}`);
m4wFilter.forEach(listing => console.log(`  - ${listing.title}`));

// Test complete category+subcategory filtering
console.log("\nTesting complete filtering:");
const personalListings = applyCategoryFiltering(sampleListings, 'personal');
console.log(`Personal listings found: ${personalListings.length}`);
personalListings.forEach(listing => console.log(`  - ${listing.title}`));

const casualListings = applyCategoryFiltering(sampleListings, 'casual');
console.log(`\nCasual listings found: ${casualListings.length}`);
casualListings.forEach(listing => console.log(`  - ${listing.title}`));

const communityListings = applyCategoryFiltering(sampleListings, 'community');
console.log(`\nCommunity listings found: ${communityListings.length}`);
communityListings.forEach(listing => console.log(`  - ${listing.title}`));