import { faker } from '@faker-js/faker';
import fs from 'fs';

// Define categories and subcategories
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

// Define locations - major states and cities
const locations = [
  { country: "United States", state: "California", cities: ["San Francisco", "Los Angeles", "San Diego", "San Jose", "Sacramento"] },
  { country: "United States", state: "New York", cities: ["New York City", "Buffalo", "Rochester", "Syracuse", "Albany"] },
  { country: "United States", state: "Texas", cities: ["Austin", "Houston", "Dallas", "San Antonio", "Fort Worth"] },
  { country: "United States", state: "Florida", cities: ["Miami", "Orlando", "Tampa", "Jacksonville", "Fort Lauderdale"] },
  { country: "United States", state: "Illinois", cities: ["Chicago", "Springfield", "Rockford", "Naperville", "Peoria"] },
  { country: "United States", state: "Pennsylvania", cities: ["Philadelphia", "Pittsburgh", "Allentown", "Erie", "Reading"] },
  { country: "United States", state: "Ohio", cities: ["Columbus", "Cleveland", "Cincinnati", "Toledo", "Akron"] },
  { country: "United States", state: "Georgia", cities: ["Atlanta", "Savannah", "Athens", "Augusta", "Columbus"] },
  { country: "United States", state: "North Carolina", cities: ["Charlotte", "Raleigh", "Greensboro", "Durham", "Winston-Salem"] },
  { country: "United States", state: "Michigan", cities: ["Detroit", "Grand Rapids", "Ann Arbor", "Lansing", "Flint"] }
];

// Generate a title for a specific category/subcategory
function generateTitle(category, subcategory) {
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
  
  const categoryTitles = titles[category];
  return categoryTitles[Math.floor(Math.random() * categoryTitles.length)];
}

// Generate a description
function generateDescription(category, subcategory) {
  const descriptions = {
    personal: [
      `Experienced ${subcategory} looking to connect with like-minded individuals in the Web3 space. ${faker.lorem.paragraph(2)}`,
      `${subcategory} with 3+ years experience seeking collaboration opportunities. ${faker.lorem.paragraph(2)}`,
      `Passionate about blockchain and eager to share knowledge as a ${subcategory}. ${faker.lorem.paragraph(2)}`,
      `${subcategory} interested in meeting others for potential project partnerships. ${faker.lorem.paragraph(2)}`,
      `Active ${subcategory} in the crypto community looking to expand network. ${faker.lorem.paragraph(2)}`
    ],
    job: [
      `We're seeking a talented ${subcategory} professional to join our Web3 team. ${faker.lorem.paragraph(2)}`,
      `Remote position open for experienced ${subcategory} specialists with blockchain knowledge. ${faker.lorem.paragraph(2)}`,
      `Growing crypto startup needs ${subcategory} expertise. Competitive compensation. ${faker.lorem.paragraph(2)}`,
      `Contract opportunity for ${subcategory} work on an innovative DeFi platform. ${faker.lorem.paragraph(2)}`,
      `Entry-level position available for ${subcategory} enthusiasts looking to break into Web3. ${faker.lorem.paragraph(2)}`
    ],
    business: [
      `Professional ${subcategory} services tailored for blockchain projects. ${faker.lorem.paragraph(2)}`,
      `Experienced in providing ${subcategory} for Web3 startups and established protocols. ${faker.lorem.paragraph(2)}`,
      `Offering specialized ${subcategory} consultation for DeFi and NFT projects. ${faker.lorem.paragraph(2)}`,
      `${subcategory} agency with proven track record in the crypto space. ${faker.lorem.paragraph(2)}`,
      `Strategic ${subcategory} solutions for Web3 business growth and development. ${faker.lorem.paragraph(2)}`
    ]
  };
  
  const categoryDescriptions = descriptions[category];
  return categoryDescriptions[Math.floor(Math.random() * categoryDescriptions.length)];
}

// Generate SQL INSERT statement for a listing
function generateInsertStatement(userId, category, subcategory, location) {
  const title = generateTitle(category, subcategory);
  const description = generateDescription(category, subcategory);
  
  // Set price based on category
  let price = 0;
  if (category === 'job') {
    price = Math.floor(Math.random() * 100000) + 50000; // Salary between 50k-150k
  } else if (category === 'business') {
    price = Math.floor(Math.random() * 5000) + 500; // Business service price between 500-5500
  } else if (Math.random() > 0.7) { // 30% of personal listings have a price
    price = Math.floor(Math.random() * 1000) + 50; // Personal items between 50-1050
  }
  
  const isRemote = category === 'job' && Math.random() > 0.5; // 50% of jobs are remote
  const isFeatured = Math.random() > 0.9; // 10% chance to be featured
  const status = isFeatured ? 'featured' : 'active';
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days from now
  
  return `
INSERT INTO listings (
  user_id, title, description, type, price, status, is_featured, country, state,
  city, is_remote, expires_at, created_at
) VALUES (
  ${userId}, 
  '${title.replace(/'/g, "''")}',
  '${description.replace(/'/g, "''")}',
  '${category}',
  ${price},
  '${status}',
  ${isFeatured},
  '${location.country}',
  '${location.state}',
  '${location.city}',
  ${isRemote},
  '${expiresAt}',
  NOW()
);`;
}

// Main function to generate SQL for sample listings
function generateListingsSQL() {
  console.log('Generating SQL for sample listings...');
  
  // We'll use user ID 1 as our creator for simplicity
  const userId = 1;
  
  // Start building the SQL file
  let sql = '';
  let count = 0;
  const samplesPerCombination = 5; // Create 5 listings per city/subcategory
  
  // Generate SQL for each category, subcategory, and location
  for (const categoryKey of Object.keys(categories)) {
    const subcategories = categories[categoryKey];
    
    for (const subcategory of subcategories) {
      for (const location of locations) {
        for (const city of location.cities) {
          // Create sample listings per city/subcategory combination
          for (let i = 0; i < samplesPerCombination; i++) {
            sql += generateInsertStatement(
              userId,
              categoryKey,
              subcategory,
              {
                country: location.country,
                state: location.state,
                city: city
              }
            );
            count++;
          }
        }
      }
    }
  }
  
  // Output to file
  fs.writeFileSync('scripts/sample-listings.sql', sql);
  
  console.log(`Generated SQL for ${count} sample listings in scripts/sample-listings.sql`);
}

// Run the script
generateListingsSQL();