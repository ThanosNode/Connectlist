import { faker } from '@faker-js/faker';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';

// Configure Neon to use WebSockets
neonConfig.webSocketConstructor = ws;

// Define categories for each type
const categories = {
  personal: [
    "web3 enthusiasts",
    "crypto mentors",
    "nft artists",
    "dao members",
    "blockchain developers"
  ],
  job: [
    "development",
    "design",
    "marketing",
    "community management",
    "technical writing"
  ],
  business: [
    "consulting",
    "token design",
    "smart contract audit",
    "community building",
    "marketing services"
  ]
};

// Define locations - US states
const states = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", 
  "Colorado", "Connecticut", "Delaware", "Florida", "Georgia",
  "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", 
  "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", 
  "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", 
  "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", 
  "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", 
  "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", 
  "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", 
  "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"
];

// Generate a title for a specific category type and subcategory
function generateTitle(type, subcategory) {
  const titles = {
    personal: [
      `${subcategory} looking for collaboration`,
      `Experienced ${subcategory} available for networking`,
      `${subcategory} seeking partners for project`,
      `Connect with ${subcategory} for knowledge sharing`,
      `${subcategory} community gathering`
    ],
    job: [
      `${subcategory} opportunity in Web3 startup`,
      `Senior ${subcategory} role available`,
      `Remote ${subcategory} position open`,
      `Contract work for ${subcategory} specialist`,
      `${subcategory} internship with blockchain focus`
    ],
    business: [
      `${subcategory} services for Web3 projects`,
      `Professional ${subcategory} for crypto startups`,
      `${subcategory} consultation available`,
      `${subcategory} agency specializing in DeFi`,
      `${subcategory} support for NFT projects`
    ]
  };
  
  const categoryTitles = titles[type];
  return categoryTitles[Math.floor(Math.random() * categoryTitles.length)];
}

// Generate a description for a specific category type and subcategory
function generateDescription(type, subcategory) {
  const descriptions = {
    personal: [
      `Experienced ${subcategory} looking to connect with like-minded individuals in the Web3 space. ${faker.lorem.paragraph()}`,
      `${subcategory} with 3+ years experience seeking collaboration opportunities. ${faker.lorem.paragraph()}`,
      `Passionate about blockchain and eager to share knowledge as a ${subcategory}. ${faker.lorem.paragraph()}`,
      `${subcategory} interested in meeting others for potential project partnerships. ${faker.lorem.paragraph()}`,
      `Active ${subcategory} in the crypto community looking to expand network. ${faker.lorem.paragraph()}`
    ],
    job: [
      `We're seeking a talented ${subcategory} professional to join our Web3 team. ${faker.lorem.paragraph()}`,
      `Remote position open for experienced ${subcategory} specialists with blockchain knowledge. ${faker.lorem.paragraph()}`,
      `Growing crypto startup needs ${subcategory} expertise. Competitive compensation. ${faker.lorem.paragraph()}`,
      `Contract opportunity for ${subcategory} work on an innovative DeFi platform. ${faker.lorem.paragraph()}`,
      `Entry-level position available for ${subcategory} enthusiasts looking to break into Web3. ${faker.lorem.paragraph()}`
    ],
    business: [
      `Professional ${subcategory} services tailored for blockchain projects. ${faker.lorem.paragraph()}`,
      `Experienced in providing ${subcategory} for Web3 startups and established protocols. ${faker.lorem.paragraph()}`,
      `Offering specialized ${subcategory} consultation for DeFi and NFT projects. ${faker.lorem.paragraph()}`,
      `${subcategory} agency with proven track record in the crypto space. ${faker.lorem.paragraph()}`,
      `Strategic ${subcategory} solutions for Web3 business growth and development. ${faker.lorem.paragraph()}`
    ]
  };
  
  const categoryDescriptions = descriptions[type];
  return categoryDescriptions[Math.floor(Math.random() * categoryDescriptions.length)];
}

// Create a listing record
function createListingObject(userId, type, subcategory, state) {
  const title = generateTitle(type, subcategory);
  const description = generateDescription(type, subcategory);
  
  // Set price based on category
  let price = 0;
  if (type === 'job') {
    price = Math.floor(Math.random() * 100000) + 50000; // Salary between 50k-150k
  } else if (type === 'business') {
    price = Math.floor(Math.random() * 5000) + 500; // Business service price between 500-5500
  } else if (Math.random() > 0.7) { // 30% of personal listings have a price
    price = Math.floor(Math.random() * 1000) + 50; // Personal items between 50-1050
  }
  
  const isRemote = type === 'job' && Math.random() > 0.5; // 50% of jobs are remote
  const isFeatured = Math.random() > 0.9; // 10% chance to be featured
  const status = isFeatured ? 'featured' : 'active';
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
  
  return {
    user_id: userId,
    title,
    description,
    type,
    price,
    status,
    is_featured: isFeatured,
    country: 'United States',
    state,
    city: 'All Cities', // Using "All Cities" for state-level listings
    is_remote: isRemote,
    expires_at: expiresAt,
    created_at: new Date()
  };
}

// Main function to insert listings
async function insertListings() {
  console.log('Starting to insert sample listings...');
  
  // Connect to the database
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    // User ID for the sample listings
    const userId = 1;
    let count = 0;
    
    // For each state, create 5 listings for each subcategory in each category type
    for (const state of states) {
      // For each category type
      for (const [type, subcategories] of Object.entries(categories)) {
        // For each subcategory
        for (const subcategory of subcategories) {
          // Create 5 listings per state/subcategory combination
          const numListings = 5;
          
          for (let i = 0; i < numListings; i++) {
            const listing = createListingObject(userId, type, subcategory, state);
            
            // Insert the listing
            const query = `
              INSERT INTO listings (
                user_id, title, description, type, price, status, is_featured, 
                country, state, city, is_remote, expires_at, created_at
              ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
              )
            `;
            
            const values = [
              listing.user_id,
              listing.title,
              listing.description,
              listing.type,
              listing.price,
              listing.status,
              listing.is_featured,
              listing.country,
              listing.state,
              listing.city,
              listing.is_remote,
              listing.expires_at,
              listing.created_at
            ];
            
            await pool.query(query, values);
            count++;
            
            if (count % 100 === 0) {
              console.log(`Inserted ${count} listings so far...`);
            }
          }
        }
      }
      console.log(`Completed listings for ${state}`);
    }
    
    console.log(`Successfully inserted ${count} sample listings!`);
  } catch (error) {
    console.error('Error inserting listings:', error);
  } finally {
    await pool.end();
  }
}

// Run the script
insertListings().catch(console.error);