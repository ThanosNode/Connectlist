import { pool } from '../server/db.ts';

// States that we need to add
const states = [
  { name: 'Colorado', cities: ['Denver', 'Boulder', 'Colorado Springs'] },
  { name: 'Connecticut', cities: ['Hartford', 'New Haven', 'Stamford'] },
  { name: 'Maryland', cities: ['Baltimore', 'Annapolis', 'Rockville'] },
  { name: 'Massachusetts', cities: ['Boston', 'Cambridge', 'Worcester'] }
];

// Sample titles per category
const titles = {
  personal: [
    'Web3 Meetup Organizing',
    'NFT Artist Looking for Collaboration',
    'Crypto Traders Discussion Group',
    'Looking for Web3 Study Partners',
    'DAO Governance Workshop',
    'Blockchain Developer Seeking Projects',
    'DeFi Learning Circle Starting',
    'Metaverse Land Development Group',
    'Crypto Tax Study Group',
    'NFT Collection Planning Team'
  ],
  job: [
    'Senior Solidity Engineer Needed',
    'Web3 Content Creator Wanted',
    'NFT Marketing Manager Position',
    'Blockchain Community Manager',
    'Smart Contract Auditor Opening',
    'DeFi Protocol Developer Needed',
    'UI/UX Designer for NFT Platform',
    'Web3 Technical Writer',
    'Crypto Project Manager',
    'DAO Operations Lead'
  ],
  business: [
    'Smart Contract Audit Services',
    'Web3 Marketing Agency',
    'Blockchain Consulting Firm',
    'NFT Launch Strategy Services',
    'Token Design and Economics',
    'DeFi Protocol Development',
    'Web3 Community Building Agency',
    'Crypto Tax Advisory Services',
    'Metaverse Development Company',
    'DAO Formation and Management'
  ]
};

// Sample descriptions per category
const descriptions = {
  personal: [
    `Looking to connect with other Web3 enthusiasts in the area! I'm organizing weekly meetups to discuss the latest developments in blockchain technology, NFTs, and DeFi.

- Regular meetings every Thursday at local coworking spaces
- All knowledge levels welcome from beginners to experts
- Focus on practical applications and real-world use cases
- Open discussions and networking opportunities

Contact me at sarah.blockchain@example-mail.org to join our growing community!`,

    `Digital artist specializing in 3D animated NFTs looking for collaborators for an upcoming collection. My style combines cyberpunk aesthetics with natural elements.

- Planning a 100-piece collection launch in July
- Need help with smart contract implementation
- Revenue share model for collaborators
- Portfolio available upon request

Email maya.artist@nftcreators-mail.net to discuss collaboration opportunities.`,

    `Forming a team for the upcoming Global Web3 Hackathon! Looking for developers, designers, and blockchain enthusiasts to collaborate on building a DeFi application.

- Hackathon dates: June 15-18, 2025
- Need Solidity developers, UI/UX designers, and project managers
- Remote participation with daily video calls
- Prior hackathon experience helpful but not required

If interested, please contact alex.web3@secure-connect.net with your skills and availability.`
  ],
  job: [
    `Our blockchain startup is seeking a Senior Solidity Engineer to help build and maintain our DeFi protocol. This is a full-time remote position with competitive compensation.

Requirements:
- 3+ years of experience with Ethereum and Solidity
- Strong understanding of DeFi concepts and security best practices
- Experience with testing frameworks (Hardhat, Truffle, Foundry)
- Knowledge of ERC standards and optimization techniques

We offer competitive salary, token incentives, and flexible working hours.
Apply with your resume and GitHub profile to careers@defi-protocol-example.com`,

    `NFT project seeking Discord Manager to build and moderate our growing community. You'll be the primary point of contact for our 10,000+ member server.

Requirements:
- Experience managing Discord communities, preferably in crypto/NFT space
- Understanding of Discord bots, security, and moderation tools
- Excellent communication skills and conflict resolution abilities
- Ability to organize events and engagement activities

Compensation includes salary and NFTs from our collection.
Apply to community@nft-project-example.com`,

    `Crypto education platform looking for Video Content Creator to produce explainer videos and tutorials. You'll be responsible for the full production process.

Requirements:
- Portfolio of video content, preferably educational
- Ability to explain complex topics visually
- Experience with video editing and production
- Knowledge of cryptocurrency and blockchain basics

Full-time position with performance-based bonuses.
Apply with samples to content@crypto-education-example.org`
  ],
  business: [
    `Smart contract security firm offering comprehensive audits for DeFi protocols, NFT projects, and custom blockchain applications. Our team of security researchers finds vulnerabilities before hackers do.

Our audit process includes:
- Manual code review by expert auditors
- Automated vulnerability scanning
- Economic attack vector analysis
- Formal verification for critical functions

Contact security@smartcontract-auditors-example.com for audit pricing and availability.`,

    `Token economics design firm specializing in sustainable tokenomics models for Web3 projects. Our data-driven approach creates balanced token systems that align incentives across stakeholders.

Our services include:
- Utility and governance token design
- Token distribution and vesting strategy
- Economic simulation and stress testing
- Ongoing optimization and adaptation

Contact design@tokenomics-experts-example.com for a consultation on your token model.`,

    `Web3 community development agency specialized in building engaged communities around blockchain projects. We handle everything from strategy to day-to-day management.

Our services include:
- Community strategy development
- Discord and Telegram setup and moderation
- Content calendar and engagement programming
- Ambassador program development and management

Contact growth@community-builders-example.com to discuss your community needs.`
  ]
};

// Function to create a listing
async function createListing(type, state, city) {
  const titleList = titles[type];
  const descriptionList = descriptions[type];
  
  const title = titleList[Math.floor(Math.random() * titleList.length)];
  const description = descriptionList[Math.floor(Math.random() * descriptionList.length)];
  
  const price = type === 'personal' ? Math.floor(Math.random() * 200) :
               type === 'business' ? Math.floor(Math.random() * 2000) + 500 : 0;
  
  const isRemote = Math.random() > 0.5;
  const isFeatured = Math.random() > 0.85;
  
  const now = new Date();
  const expiresAt = new Date();
  expiresAt.setDate(now.getDate() + 30);
  
  return {
    userId: 1,
    title,
    description,
    type,
    price,
    country: 'United States',
    state,
    city,
    isRemote,
    isFeatured,
    status: 'active',
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString()
  };
}

// Function to insert listings
async function insertStateListings() {
  const client = await pool.connect();
  let totalCreated = 0;
  
  try {
    await client.query('BEGIN');
    
    for (const state of states) {
      console.log(`Adding listings for ${state.name}...`);
      
      for (const city of state.cities) {
        // Add 10 listings for each type in each city
        for (const type of ['personal', 'job', 'business']) {
          for (let i = 0; i < 10; i++) {
            const listing = await createListing(type, state.name, city);
            
            await client.query(`
              INSERT INTO listings (
                user_id, title, description, type, price, country, state, city, 
                is_remote, is_featured, status, created_at, expires_at
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            `, [
              listing.userId, listing.title, listing.description, listing.type,
              listing.price, listing.country, listing.state, listing.city,
              listing.isRemote, listing.isFeatured, listing.status,
              listing.createdAt, listing.expiresAt
            ]);
            
            totalCreated++;
          }
        }
      }
    }
    
    await client.query('COMMIT');
    console.log(`Successfully created ${totalCreated} listings`);
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating listings:', error);
  } finally {
    client.release();
  }
}

// Run the script
insertStateListings()
  .then(() => {
    console.log('All done!');
    pool.end();
  })
  .catch(err => {
    console.error('Script failed:', err);
    pool.end();
  });