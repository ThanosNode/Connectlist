import { pool } from '../server/db';
import { PostgresError } from '@neondatabase/serverless';

interface State {
  name: string;
  cities: string[];
}

interface Category {
  type: string;
  titles: string[];
}

const states: State[] = [
  { name: 'New York', cities: ['New York City', 'Buffalo', 'Rochester', 'Syracuse', 'Albany'] },
  { name: 'California', cities: ['San Francisco', 'Los Angeles', 'San Diego', 'San Jose', 'Sacramento'] },
  { name: 'Alabama', cities: ['Birmingham', 'Montgomery', 'Mobile', 'Huntsville', 'Tuscaloosa'] },
  { name: 'Florida', cities: ['Miami', 'Orlando', 'Tampa', 'Jacksonville', 'Fort Lauderdale'] },
  { name: 'Maryland', cities: ['Baltimore', 'Annapolis', 'Rockville', 'Silver Spring', 'Frederick'] },
  { name: 'Massachusetts', cities: ['Boston', 'Cambridge', 'Worcester', 'Springfield', 'Lowell'] },
  { name: 'Colorado', cities: ['Denver', 'Boulder', 'Colorado Springs', 'Fort Collins', 'Aurora'] },
  { name: 'Connecticut', cities: ['Hartford', 'New Haven', 'Stamford', 'Bridgeport', 'Waterbury'] }
];

// Personal Listings Categories and subcategories
const personalCategories: Category[] = [
  { 
    type: 'web3 enthusiasts', 
    titles: [
      'Hosting Weekly Web3 Meetup',
      'Looking for Web3 Study Group',
      'Web3 Hackathon Team Formation',
      'NFT Collection Showcase Gathering',
      'Seeking Web3 Gaming Partners',
      'Local Crypto Traders Meetup',
      'DAO Community Building Group',
      'Web3 Book Club Starting',
      'Web3 Workshop Facilitator Needed',
      'DeFi Learning Circle Starting'
    ]
  },
  { 
    type: 'crypto mentors', 
    titles: [
      'Offering Crypto Trading Mentorship',
      'DeFi Mentor Available for Beginners',
      'NFT Creation Mentorship',
      'Smart Contract Development Tutor',
      'Crypto Tax and Accounting Help',
      'Web3 Security Practices Mentor',
      'DAO Governance Consultant',
      'Technical Analysis Coaching',
      'Token Economics Advisor',
      'Crypto Portfolio Management Guide'
    ]
  },
  { 
    type: 'nft artists', 
    titles: [
      'NFT Artist Looking for Collaboration',
      'Creating Custom NFT Artwork',
      'NFT Collection Opening Soon',
      'Web3 Artist Seeking Gallery Space',
      'Metaverse Art Installation',
      'Animated NFT Creator Available',
      'AI-Generated Art NFT Collection',
      'NFT Portrait Commissions',
      'Blockchain Art Workshop Host',
      'Interactive NFT Experience Creator'
    ]
  },
  { 
    type: 'dao members', 
    titles: [
      'Recruiting for New Investment DAO',
      'Social Impact DAO Seeking Members',
      'NFT Collector DAO Formation',
      'DAO Governance Workshop',
      'Protocol DAO Contributors Needed',
      'Creator DAO Seeking Artists',
      'Local Community DAO Launch',
      'Service DAO Looking for Developers',
      'DeFi DAO Participation Opportunity',
      'Education DAO Content Contributors'
    ]
  },
  { 
    type: 'blockchain developers', 
    titles: [
      'Solidity Developer Seeking Projects',
      'Full Stack Web3 Developer Available',
      'Smart Contract Auditor For Hire',
      'Frontend dApp Developer',
      'Web3 Backend Integration Specialist',
      'ZK Rollup Developer Looking for Team',
      'Blockchain Architecture Consultant',
      'Layer 2 Solutions Engineer',
      'DeFi Protocol Developer',
      'Cross-chain Bridge Developer'
    ]
  }
];

// Job Listings Categories and subcategories
const jobCategories: Category[] = [
  { 
    type: 'development', 
    titles: [
      'Senior Solidity Engineer Needed',
      'Frontend Developer with Web3 Experience',
      'Smart Contract Developer - Remote',
      'Full Stack Blockchain Engineer',
      'React Developer for NFT Marketplace',
      'Rust Developer for Layer 1 Protocol',
      'Mobile dApp Engineer',
      'Web3 Infrastructure Developer',
      'Junior Blockchain Developer',
      'Crypto Wallet Developer'
    ]
  },
  { 
    type: 'design', 
    titles: [
      'UI/UX Designer for Web3 Platform',
      'NFT Artist and Designer',
      'Blockchain Product Designer',
      '3D Artist for Metaverse',
      'Web3 Brand Identity Designer',
      'NFT Collection Creative Director',
      'dApp Interface Designer',
      'Crypto Dashboard UX Specialist',
      'Metaverse Environment Designer',
      'Tokenomics Visualization Designer'
    ]
  },
  { 
    type: 'marketing', 
    titles: [
      'Crypto Marketing Specialist',
      'NFT Launch Marketing Manager',
      'Web3 Growth Hacker',
      'DeFi Content Strategist',
      'Blockchain Project PR Manager',
      'Social Media Manager for NFT Project',
      'Token Launch Marketing Lead',
      'Web3 SEO Specialist',
      'Community Growth Strategist',
      'Influencer Relations Manager'
    ]
  },
  { 
    type: 'community management', 
    titles: [
      'Discord Manager for NFT Project',
      'DAO Community Manager',
      'Telegram Community Moderator',
      'Web3 Community Builder',
      'NFT Community Engagement Specialist',
      'DeFi Protocol Ambassador',
      'Community Analytics Specialist',
      'Web3 Events Coordinator',
      'Multilingual Community Manager',
      'Gaming Guild Community Lead'
    ]
  },
  { 
    type: 'content creation', 
    titles: [
      'Web3 Technical Writer',
      'Blockchain Video Content Creator',
      'Crypto Podcast Host',
      'NFT Project Storyteller',
      'DeFi Educational Content Writer',
      'Web3 Explainer Animation Artist',
      'Technical Documentation Specialist',
      'Crypto Newsletter Writer',
      'Metaverse Reporter',
      'Web3 Graphic Content Creator'
    ]
  }
];

// Business Listings Categories and subcategories
const businessCategories: Category[] = [
  { 
    type: 'consulting', 
    titles: [
      'Blockchain Strategy Consulting',
      'Crypto Tax Advisory Firm',
      'Web3 Business Development Consultant',
      'DeFi Integration Consultancy',
      'NFT Launch Strategy Consulting',
      'Tokenomics Design Services',
      'DAO Structure Advisory',
      'Web3 Legal Compliance Consulting',
      'Blockchain Implementation Strategist',
      'Metaverse Business Consultant'
    ]
  },
  { 
    type: 'token design', 
    titles: [
      'Token Economics Design Services',
      'Sustainable Tokenomics Development',
      'Governance Token System Design',
      'Utility Token Strategy Development',
      'Token Distribution Planning',
      'Token Incentive Mechanism Modeling',
      'Security Token Design Services',
      'NFT Royalty Structure Design',
      'Token Vesting Strategy Services',
      'Multitoken Economy Design'
    ]
  },
  { 
    type: 'smart contract audit', 
    titles: [
      'Smart Contract Security Audit',
      'DeFi Protocol Code Review',
      'NFT Contract Vulnerability Testing',
      'Blockchain Security Consulting',
      'Smart Contract Optimization Service',
      'Runtime Verification Services',
      'Formal Verification Specialists',
      'Gas Optimization Audit',
      'Smart Contract Pentesting',
      'VAPT for Crypto Projects'
    ]
  },
  { 
    type: 'community building', 
    titles: [
      'Web3 Community Development Agency',
      'NFT Community Growth Specialists',
      'DAO Bootstrapping Service',
      'Discord Server Setup and Management',
      'Web3 Engagement Strategy Consultancy',
      'Community Analytics and Insights',
      'Ambassador Program Development',
      'Governance Participation Strategy',
      'Community Retention Consultancy',
      'Multi-platform Community Building'
    ]
  },
  { 
    type: 'marketing services', 
    titles: [
      'Crypto Marketing Agency',
      'NFT Launch Promotion Services',
      'Web3 Growth Marketing Firm',
      'Crypto Influencer Marketing Agency',
      'Token Launch Marketing Services',
      'DeFi User Acquisition Specialists',
      'Web3 Content Marketing Agency',
      'Blockchain PR Firm',
      'NFT Collection Marketing Package',
      'DAO Marketing Solutions'
    ]
  }
];

// Description templates for different listing types
function generatePersonalDescription(subcategory: string, title: string): string {
  const descriptions: Record<string, string[]> = {
    'web3 enthusiasts': [
      `Looking to connect with other Web3 enthusiasts in the area! I'm organizing weekly meetups to discuss the latest developments in blockchain technology, NFTs, and DeFi.

- Regular meetings every Thursday at local coworking spaces
- All knowledge levels welcome from beginners to experts
- Focus on practical applications and real-world use cases
- Open discussions and networking opportunities

Contact me at sarah.blockchain@example-mail.org to join our growing community!`,

      `Passionate about Web3 and looking for study partners to dive deeper into blockchain technology together. I have intermediate knowledge of Ethereum and smart contracts.

- Flexible meeting schedule (virtual or in-person)
- Currently focused on smart contract development
- Willing to share resources and learning materials
- Looking for consistent, committed participants

Email jason.crypto@privacy-mail.com if you're interested in joining our learning circle.`,

      `Forming a team for the upcoming Global Web3 Hackathon! Looking for developers, designers, and blockchain enthusiasts to collaborate on building a DeFi application.

- Hackathon dates: June 15-18, 2025
- Need Solidity developers, UI/UX designers, and project managers
- Remote participation with daily video calls
- Prior hackathon experience helpful but not required

If interested, please contact alex.web3@secure-connect.net with your skills and availability.`
    ],
    'crypto mentors': [
      `Experienced crypto trader offering personalized mentorship for beginners and intermediate traders. I specialize in technical analysis and risk management strategies.

- One-on-one sessions tailored to your goals
- 4+ years of crypto trading experience
- Focus on sustainable strategies, not get-rich-quick schemes
- Weekly check-ins and trading plan development

Sessions start at $75/hr. Contact michael.trades@cryptomentor-mail.com for more information.`,

      `DeFi specialist available to guide newcomers through the complex world of decentralized finance. Learn how to safely navigate lending protocols, yield farming, and liquidity pools.

- Custom learning path based on your risk tolerance
- Step-by-step guidance for securing your assets
- Education on protocol risks and smart contract security
- Regular sessions to review and optimize your strategy

Email elena.defi@mentor-example.com to schedule a free 30-minute consultation.`,

      `Smart contract development tutor with 5 years of experience in Solidity. I can help you understand blockchain fundamentals and guide you through building your first dApps.

- Structured curriculum from basics to advanced topics
- Code reviews and best practices guidance
- Security-focused development techniques
- Project-based learning approach

Contact david.solidity@blockchain-tutor.org to discuss your learning goals.`
    ],
    'nft artists': [
      `Digital artist specializing in 3D animated NFTs looking for collaborators for an upcoming collection. My style combines cyberpunk aesthetics with natural elements.

- Planning a 100-piece collection launch in July
- Need help with smart contract implementation
- Revenue share model for collaborators
- Portfolio available upon request

Email maya.artist@nftcreators-mail.net to discuss collaboration opportunities.`,

      `Creating custom NFT artwork for collectors and projects. My specialty is hand-drawn illustration with a focus on sci-fi and fantasy themes.

- Commissions open for individual pieces or full collections
- Experience with major marketplaces (OpenSea, Foundation)
- Custom metadata and trait implementation
- Full commercial rights included

View samples and contact at ryan.digital@artist-connect.com`,

      `Metaverse art installation designer seeking virtual gallery space. I create immersive 3D experiences that blend interactive elements with traditional art forms.

- Previous exhibitions in Decentraland and Cryptovoxels
- Looking for established metaverse galleries or DAOs
- Installations include interactive elements and sound design
- Specialized in attracting visitor engagement

Contact sophia.virtual@metaverse-studio.org to discuss exhibition opportunities.`
    ],
    'dao members': [
      `Recruiting committed members for our new investment DAO focused on early-stage Web3 projects. We're building a community of analysts and enthusiasts to evaluate and fund promising projects.

- Minimum contribution: 0.5 ETH equivalent
- Democratic governance system
- Focus on DeFi and infrastructure projects
- Weekly investment proposals and voting

To learn more about our mission and membership, email thomas.dao@investment-collective.net`,

      `Social impact DAO seeking passionate members to help direct funding toward climate action and sustainability projects on-chain.

- No minimum contribution required (governance token earned through participation)
- Currently 120+ active members globally
- Bi-weekly governance calls and continuous forum discussions
- Technical and non-technical contributors welcome

Join us by contacting olivia.impact@climate-dao.org with a brief introduction.`,

      `DAO Governance Workshop forming to study and implement effective on-chain governance systems. Looking for members interested in improving voting mechanisms and proposal processes.

- Monthly workshop sessions (virtual)
- Collaborative research and documentation
- Case studies of successful and failed governance systems
- Goal to publish open-source governance templates

Email marcus.governance@dao-workshop.com if you're interested in advancing DAO governance.`
    ],
    'blockchain developers': [
      `Senior Solidity developer available for smart contract development and auditing. Specializing in DeFi protocols and token standards with a focus on gas optimization.

- 5+ years of Ethereum development experience
- Previously worked on major DeFi protocols
- Security-first approach with comprehensive testing
- Available for part-time contracts or advisory roles

Contact nathan.sol@developer-mail.net to discuss your project requirements.`,

      `Full stack Web3 developer seeking collaborative projects. My expertise includes Ethereum, IPFS, The Graph, and React/Node.js for frontend/backend.

- Experience building NFT marketplaces and DeFi interfaces
- Strong understanding of wallet integrations and transaction flows
- Clean, well-documented code with comprehensive testing
- Available for remote contract work

Email jennifer.dev@web3builders.org with project details or collaboration ideas.`,

      `ZK Rollup specialist looking to join a team working on Layer 2 scaling solutions. I have hands-on experience with zkSync, StarkNet, and custom zk implementation.

- Deep understanding of zero-knowledge proofs
- Experience optimizing for L2 environments
- Background in cryptography and distributed systems
- Available for full-time positions or consulting

Reach out to daniel.zk@privacy-compute.com to discuss potential collaboration.`
    ]
  };

  // Return a random description from the appropriate category, or a generic one if not found
  if (descriptions[subcategory]) {
    return descriptions[subcategory][Math.floor(Math.random() * descriptions[subcategory].length)];
  }
  
  return `Looking to connect with others interested in ${subcategory}. I have experience in this area and want to share knowledge and collaborate on projects.

- Regular meetups to discuss latest trends
- Open to beginners and experts alike
- Focus on practical skills and networking
- Virtual and in-person options available

Contact me at user${Math.floor(Math.random() * 1000)}@example-domain.com for more details!`;
}

function generateJobDescription(subcategory: string, title: string): string {
  const descriptions: Record<string, string[]> = {
    'development': [
      `Our blockchain startup is seeking a Senior Solidity Engineer to help build and maintain our DeFi protocol. This is a full-time remote position with competitive compensation.

Requirements:
- 3+ years of experience with Ethereum and Solidity
- Strong understanding of DeFi concepts and security best practices
- Experience with testing frameworks (Hardhat, Truffle, Foundry)
- Knowledge of ERC standards and optimization techniques

We offer competitive salary, token incentives, and flexible working hours.
Apply with your resume and GitHub profile to careers@defi-protocol-example.com`,

      `Fast-growing NFT marketplace looking for a Frontend Developer with Web3 experience to join our team. Help us build intuitive interfaces for our NFT trading platform.

Requirements:
- Experience with React, TypeScript, and CSS frameworks
- Familiarity with Web3.js or Ethers.js
- Understanding of wallet integration and transaction flows
- Previous work on dApps or Web3 projects

Remote position with possibility for relocation. Salary range $90-120K depending on experience.
Apply to hiring@nft-market-example.org`,

      `Layer 1 blockchain protocol seeking Rust Developers to work on core infrastructure components. You'll be working on consensus mechanisms and network optimization.

Requirements:
- Strong Rust programming skills
- Understanding of distributed systems
- Knowledge of cryptography fundamentals
- Experience with blockchain architecture a plus

Competitive compensation with both salary and token grants.
Send your application to dev-hiring@chain-protocol-example.com`
    ],
    'design': [
      `NFT project seeking UI/UX Designer with experience in Web3 interfaces. Help us create an intuitive and engaging experience for our NFT marketplace.

Requirements:
- Portfolio demonstrating UI/UX design for web applications
- Understanding of Web3 user flows and wallet interactions
- Proficiency in Figma, Sketch, or similar design tools
- Experience with responsive design and accessibility

Compensation includes base salary and NFTs from our collection.
Send portfolio and resume to design@nft-studio-example.com`,

      `Established DeFi protocol looking for a Product Designer to improve our interface and user experience. You'll work closely with our development and product teams.

Requirements:
- 3+ years of product design experience
- Understanding of financial interfaces and data visualization
- Experience designing complex web applications
- Knowledge of Web3 products and user behaviors

Competitive salary with token incentives. Remote position with flexible hours.
Apply with portfolio to careers@defi-app-example.org`,

      `Metaverse startup seeking 3D Artists to design virtual environments and assets. Help us build immersive spaces for social and commercial activities.

Requirements:
- Portfolio showing 3D modeling and environment design
- Experience with Unity, Unreal Engine, or similar tools
- Understanding of optimization for web-based 3D experiences
- Interest in virtual worlds and blockchain technology

Full-time position with equity options. Location flexible.
Contact hiring@metaverse-company-example.net with your portfolio`
    ],
    'marketing': [
      `Crypto startup seeking experienced Marketing Specialist to lead our go-to-market strategy. You'll be responsible for brand development and user acquisition.

Requirements:
- 3+ years of marketing experience, preferably in tech or crypto
- Understanding of crypto community dynamics
- Experience with social media campaigns and community building
- Data-driven approach to marketing

Competitive salary with token incentives and flexible working arrangements.
Apply to marketing@crypto-startup-example.com`,

      `NFT collection looking for a Launch Marketing Manager to coordinate our upcoming mint. This is a 3-month contract with possibility for extension.

Requirements:
- Previous experience with NFT or token launches
- Strong understanding of NFT marketplace dynamics
- Ability to coordinate Discord, Twitter, and influencer campaigns
- Analytics-focused approach to tracking campaign performance

Generous base compensation plus performance bonuses.
Send your application to launch@nft-project-example.org`,

      `DeFi protocol seeking Content Strategist to develop educational materials and marketing content. Help us explain complex financial concepts to our users.

Requirements:
- Strong writing skills with samples demonstrating technical communication
- Understanding of DeFi concepts and blockchain technology
- Experience creating multi-channel content strategies
- Ability to work with technical teams to extract and simplify information

Remote position with competitive compensation package.
Contact us at jobs@defi-protocol-example.net`
    ],
    'community management': [
      `NFT project seeking Discord Manager to build and moderate our growing community. You'll be the primary point of contact for our 10,000+ member server.

Requirements:
- Experience managing Discord communities, preferably in crypto/NFT space
- Understanding of Discord bots, security, and moderation tools
- Excellent communication skills and conflict resolution abilities
- Ability to organize events and engagement activities

Compensation includes salary and NFTs from our collection.
Apply to community@nft-project-example.com`,

      `DAO looking for Community Manager to increase participation and governance engagement. Help us build a vibrant, active community around our protocol.

Requirements:
- Experience with community building in Web3
- Understanding of DAO governance and participation mechanisms
- Excellent written and verbal communication
- Ability to create and execute engagement strategies

Remote position with token-based compensation structure.
Contact dao-jobs@protocol-example.org with your experience`,

      `Web3 gaming guild seeking Community Builder to recruit and manage players. You'll help coordinate our scholarship program and gaming tournaments.

Requirements:
- Experience with gaming communities
- Understanding of play-to-earn mechanics
- Excellent organizational and communication skills
- Knowledge of Discord management and event coordination

Competitive compensation with revenue sharing opportunities.
Email careers@gaming-guild-example.net to apply`
    ],
    'content creation': [
      `Blockchain project seeking Technical Writer to create documentation and educational materials. Help us make our technology accessible to developers and users.

Requirements:
- Strong technical writing skills with portfolio examples
- Understanding of blockchain technology and smart contracts
- Ability to translate complex concepts into clear documentation
- Experience with developer documentation a plus

Remote position with competitive salary.
Send writing samples to docs@blockchain-project-example.com`,

      `Crypto education platform looking for Video Content Creator to produce explainer videos and tutorials. You'll be responsible for the full production process.

Requirements:
- Portfolio of video content, preferably educational
- Ability to explain complex topics visually
- Experience with video editing and production
- Knowledge of cryptocurrency and blockchain basics

Full-time position with performance-based bonuses.
Apply with samples to content@crypto-education-example.org`,

      `Web3 startup seeking Podcast Host/Producer for weekly industry analysis show. You'll interview guests and cover the latest developments in the space.

Requirements:
- Previous podcasting or audio production experience
- Strong interviewing skills and industry knowledge
- Ability to research and prepare compelling episodes
- Technical audio production capabilities

Remote contract position with competitive per-episode rate.
Contact media@web3-startup-example.net with samples of your work`
    ]
  };

  // Return a random description from the appropriate category, or a generic one if not found
  if (descriptions[subcategory]) {
    return descriptions[subcategory][Math.floor(Math.random() * descriptions[subcategory].length)];
  }
  
  return `We're hiring for a ${title} position at our growing Web3 company. This role offers competitive compensation and the opportunity to work with cutting-edge blockchain technology.

Requirements:
- Experience in ${subcategory} with knowledge of blockchain/crypto
- Strong communication and collaboration skills
- Ability to work in a fast-paced startup environment
- Passion for decentralized technology and its applications

Remote-friendly with flexible hours. Compensation includes base salary and token incentives.
Apply to careers@web3-company-example.com with your resume and cover letter.`;
}

function generateBusinessDescription(subcategory: string, title: string): string {
  const descriptions: Record<string, string[]> = {
    'consulting': [
      `Our blockchain consulting firm specializes in helping businesses integrate Web3 technologies into their existing operations. We offer comprehensive strategy development and implementation support.

Services include:
- Blockchain integration assessment and roadmap development
- Technical architecture planning and vendor selection
- Smart contract design and implementation guidance
- Regulatory compliance advisory

Contact michael.consultant@blockchain-advisors-example.com for a free initial consultation.`,

      `Crypto tax advisory firm providing specialized accounting services for crypto investors, traders, and businesses. We help navigate the complex tax implications of digital asset transactions.

Our services include:
- Transaction history analysis and tax lot optimization
- DeFi and staking income calculation
- NFT and mining tax guidance
- Audit preparation and representation

Rates start at $150/hour. Contact tax@crypto-accounting-example.org to schedule a consultation.`,

      `Web3 business development consultancy helping startups go from concept to market. We specialize in tokenomics, go-to-market strategy, and fundraising preparation.

Our approach includes:
- Competitive landscape analysis
- Token utility and economic model design
- Community building strategy
- Investor pitch preparation and introductions

Email partners@web3-consultants-example.net to discuss how we can help your project succeed.`
    ],
    'token design': [
      `Token economics design firm specializing in sustainable tokenomics models for Web3 projects. Our data-driven approach creates balanced token systems that align incentives across stakeholders.

Our services include:
- Utility and governance token design
- Token distribution and vesting strategy
- Economic simulation and stress testing
- Ongoing optimization and adaptation

Contact design@tokenomics-experts-example.com for a consultation on your token model.`,

      `Governance token specialists helping DAOs create effective decision-making systems. We design custom governance frameworks tailored to your community's needs.

Services include:
- Governance mechanism design
- Voting system implementation
- Proposal process optimization
- Progressive decentralization planning

Email governance@dao-design-example.org to discuss your DAO's needs.`,

      `Token incentive mechanism modeling service for DeFi protocols. We help optimize yield structures, liquidity mining programs, and staking rewards.

Our approach includes:
- Agent-based economic modeling
- Competitive analysis of incentive structures
- Liquidity flow optimization
- Sustainability and inflation management

Contact models@defi-tokenomics-example.net for a data-driven token design consultation.`
    ],
    'smart contract audit': [
      `Smart contract security firm offering comprehensive audits for DeFi protocols, NFT projects, and custom blockchain applications. Our team of security researchers finds vulnerabilities before hackers do.

Our audit process includes:
- Manual code review by expert auditors
- Automated vulnerability scanning
- Economic attack vector analysis
- Formal verification for critical functions

Contact security@smartcontract-auditors-example.com for audit pricing and availability.`,

      `DeFi protocol code review specialists with experience auditing AMMs, lending protocols, and yield aggregators. We've secured over $500M in TVL through our audit services.

Our audit includes:
- Comprehensive vulnerability assessment
- Gas optimization recommendations
- Best practices implementation
- Post-deployment monitoring options

Email audit@defi-security-example.org to secure your protocol before launch.`,

      `Blockchain security consulting focusing on smart contract penetration testing and vulnerability assessment. We simulate real-world attacks to find weaknesses in your code.

Services include:
- Red team security assessments
- Custom exploit development
- Economic security analysis
- Remediation guidance and verification

Contact security@blockchain-pentest-example.net for a security evaluation of your project.`
    ],
    'community building': [
      `Web3 community development agency specialized in building engaged communities around blockchain projects. We handle everything from strategy to day-to-day management.

Our services include:
- Community strategy development
- Discord and Telegram setup and moderation
- Content calendar and engagement programming
- Ambassador program development and management

Contact growth@community-builders-example.com to discuss your community needs.`,

      `NFT community growth specialists helping collections build valuable long-term communities. Our approach focuses on authentic engagement and sustainable growth.

Services include:
- Pre-mint community building
- Post-mint engagement strategy
- Holder retention programs
- Community analytics and optimization

Email community@nft-growth-example.org for a consultation on your NFT community.`,

      `DAO bootstrapping service helping new decentralized organizations build active, contributing communities. We specialize in transitioning from centralized to community governance.

Our approach includes:
- Initial contributor recruitment
- Governance structure implementation
- Working group formation and coordination
- Knowledge base and onboarding systems

Contact bootstrap@dao-services-example.net to discuss your DAO's community needs.`
    ],
    'marketing services': [
      `Crypto marketing agency providing comprehensive marketing services for Web3 projects. We specialize in community growth, brand development, and user acquisition.

Our services include:
- Social media management and growth
- Content strategy and creation
- Influencer partnerships and PR
- Community-building campaigns

Contact marketing@crypto-agency-example.com for a tailored marketing proposal.`,

      `NFT launch promotion specialists with experience launching over 50 successful collections. We handle all aspects of pre-mint and launch marketing.

Our NFT marketing packages include:
- Community building and Discord growth
- Whitelist management and engagement
- Influencer and partnership strategy
- Launch day coordination

Email launch@nft-marketing-example.org to discuss your collection's launch strategy.`,

      `Web3 growth marketing firm specializing in user acquisition for DeFi protocols and dApps. Our data-driven approach focuses on sustainable growth and user retention.

Services include:
- Acquisition funnel optimization
- Analytics implementation and tracking
- A/B testing and conversion rate optimization
- Retention and activation campaigns

Contact growth@web3-marketing-example.net for a growth strategy consultation.`
    ]
  };

  // Return a random description from the appropriate category, or a generic one if not found
  if (descriptions[subcategory]) {
    return descriptions[subcategory][Math.floor(Math.random() * descriptions[subcategory].length)];
  }
  
  return `Professional ${subcategory} services for Web3 projects and blockchain businesses. Our team of experts helps clients navigate the complex landscape of decentralized technology.

Our services include:
- Strategic consulting and implementation guidance
- Technical expertise in blockchain integration
- Custom solutions tailored to your project's needs
- Ongoing support and optimization

Contact us at info@${subcategory.replace(/\s+/g, '-')}-example.com to discuss how we can help your business succeed in the Web3 ecosystem.`;
}

// Function to generate price based on listing type
function generatePrice(type: string, subcategory: string): number {
  if (type === 'personal') {
    // Some personal listings are free, others have a price
    if (subcategory === 'crypto mentors' || Math.random() < 0.3) {
      return Math.floor(Math.random() * 30) * 10; // $0-$290 in $10 increments
    }
    return 0; // Free
  } else if (type === 'job') {
    // Jobs don't typically list prices
    return 0;
  } else if (type === 'business') {
    // Business services have higher prices
    if (subcategory === 'smart contract audit') {
      return Math.floor(Math.random() * 50) * 100 + 1000; // $1000-$6000
    }
    return Math.floor(Math.random() * 20) * 50 + 100; // $100-$1050 in $50 increments
  }
  
  return 0;
}

interface Listing {
  userId: number;
  title: string;
  description: string;
  type: string;
  price: number;
  country: string;
  state: string;
  city: string;
  isRemote: boolean;
  isFeatured: boolean;
  status: string;
  expiresAt: string;
  createdAt: string;
}

// Function to create listing object for database insertion
function createListingObject(title: string, description: string, type: string, subcategory: string, state: string, city: string): Listing {
  const price = generatePrice(type, subcategory);
  const isRemote = Math.random() < 0.5; // 50% chance of being remote
  const isFeatured = Math.random() < 0.15; // 15% chance of being featured
  
  const now = new Date();
  const expiresAt = new Date();
  expiresAt.setDate(now.getDate() + 30); // Listings expire after 30 days
  
  return {
    userId: 1, // Assuming user ID 1 is our default user
    title: title,
    description: description,
    type: type,
    price: price,
    country: 'United States',
    state: state,
    city: city,
    isRemote: isRemote,
    isFeatured: isFeatured,
    status: 'active',
    expiresAt: expiresAt.toISOString(),
    createdAt: now.toISOString()
  };
}

// Function to generate and insert listings
async function insertListings() {
  const client = await pool.connect();
  let totalListings = 0;
  
  try {
    await client.query('BEGIN');
    
    // For each state and city
    for (const state of states) {
      console.log(`Creating listings for ${state.name}...`);
      
      for (const city of state.cities) {
        // Personal listings
        for (const category of personalCategories) {
          for (let i = 0; i < 2; i++) { // Create 2 listings per subcategory per city
            const titleIndex = Math.floor(Math.random() * category.titles.length);
            const title = category.titles[titleIndex];
            const description = generatePersonalDescription(category.type, title);
            
            const listing = createListingObject(title, description, 'personal', category.type, state.name, city);
            
            await client.query(`
              INSERT INTO listings (
                user_id, title, description, type, price, country, state, city, 
                is_remote, is_featured, status, expires_at, created_at
              ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
              )
            `, [
              listing.userId, listing.title, listing.description, listing.type, 
              listing.price, listing.country, listing.state, listing.city, 
              listing.isRemote, listing.isFeatured, listing.status, 
              listing.expiresAt, listing.createdAt
            ]);
            
            totalListings++;
          }
        }
        
        // Job listings
        for (const category of jobCategories) {
          for (let i = 0; i < 2; i++) { // Create 2 listings per subcategory per city
            const titleIndex = Math.floor(Math.random() * category.titles.length);
            const title = category.titles[titleIndex];
            const description = generateJobDescription(category.type, title);
            
            const listing = createListingObject(title, description, 'job', category.type, state.name, city);
            
            await client.query(`
              INSERT INTO listings (
                user_id, title, description, type, price, country, state, city, 
                is_remote, is_featured, status, expires_at, created_at
              ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
              )
            `, [
              listing.userId, listing.title, listing.description, listing.type, 
              listing.price, listing.country, listing.state, listing.city, 
              listing.isRemote, listing.isFeatured, listing.status, 
              listing.expiresAt, listing.createdAt
            ]);
            
            totalListings++;
          }
        }
        
        // Business listings
        for (const category of businessCategories) {
          for (let i = 0; i < 2; i++) { // Create 2 listings per subcategory per city
            const titleIndex = Math.floor(Math.random() * category.titles.length);
            const title = category.titles[titleIndex];
            const description = generateBusinessDescription(category.type, title);
            
            const listing = createListingObject(title, description, 'business', category.type, state.name, city);
            
            await client.query(`
              INSERT INTO listings (
                user_id, title, description, type, price, country, state, city, 
                is_remote, is_featured, status, expires_at, created_at
              ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
              )
            `, [
              listing.userId, listing.title, listing.description, listing.type, 
              listing.price, listing.country, listing.state, listing.city, 
              listing.isRemote, listing.isFeatured, listing.status, 
              listing.expiresAt, listing.createdAt
            ]);
            
            totalListings++;
          }
        }
      }
    }
    
    await client.query('COMMIT');
    console.log(`Successfully created ${totalListings} listings!`);
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating listings:', error);
  } finally {
    client.release();
  }
}

// Run the insertion function
insertListings().then(() => {
  console.log('Script completed!');
  pool.end();
}).catch(err => {
  console.error('Script failed:', err);
  pool.end();
});