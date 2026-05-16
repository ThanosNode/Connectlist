import { users, listings, payments, sessions, reports } from "@shared/schema";
import { type User, type InsertUser, type Listing, type InsertListing, type Payment, type InsertPayment, type Session, type InsertSession, type Report, type InsertReport } from "@shared/schema";
import { eq, and, gte, desc, asc, sql, or, like, between } from "drizzle-orm";
import bcrypt from "bcrypt";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  validateUserCredentials(email: string, password: string): Promise<User | null>;
  validateSecurityQuestion(userId: number, questionId: string, answer: string): Promise<boolean>;
  updateUserLastLogin(userId: number): Promise<User | undefined>;
  
  // Listing operations
  getListing(id: number): Promise<Listing | undefined>;
  getListings(options: { 
    page?: number; 
    perPage?: number; 
    country?: string; 
    state?: string; 
    city?: string; 
    type?: string;
    isFeatured?: boolean;
  }): Promise<{ listings: Listing[]; hasMore: boolean }>;
  createListing(listing: InsertListing): Promise<Listing>;
  updateListing(id: number, listing: Partial<Listing>): Promise<Listing | undefined>;
  deleteListing(id: number): Promise<boolean>;
  
  // Payment operations
  createPayment(payment: InsertPayment): Promise<Payment>;
  getPayment(id: number): Promise<Payment | undefined>;
  updatePaymentStatus(id: number, status: string, coinbaseChargeId?: string): Promise<Payment | undefined>;
  
  // Session operations
  createSession(session: InsertSession): Promise<Session>;
  getSession(id: string): Promise<Session | undefined>;
  deleteSession(id: string): Promise<boolean>;
  
  // Report operations
  createReport(report: InsertReport): Promise<Report>;
  getReports(listingId: number): Promise<Report[]>;
  updateReportStatus(id: number, status: string): Promise<Report | undefined>;
}

export class MemStorage implements IStorage {
  async updateUserLastLogin(userId: number): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (user) {
      // Add lastLogin field if needed
      return {
        ...user,
        lastLogin: new Date()
      };
    }
    return undefined;
  }
  private users: User[] = [];
  private listings: Listing[] = [];
  private payments: Payment[] = [];
  private sessions: Session[] = [];
  private reports: Report[] = [];
  private userIdCounter = 1;
  private listingIdCounter = 1;
  private paymentIdCounter = 1;
  private reportIdCounter = 1;

  constructor() {
    // Add a default admin user
    const now = new Date();
    this.createUser({
      username: "admin",
      email: "admin@example.com",
      password: "Admin123!",
      securityQuestion: "first-pet",
      securityAnswer: "Rover",
      role: "super_admin"
    });

    // Add some example listings
    const userId = 1; // Admin user

    // Create listings with different types
    this.createListing({
      userId,
      title: "Web3 Developer Needed",
      description: "Looking for an experienced Web3 developer to help build a DeFi platform. Must have experience with Solidity, Ethereum, and React.",
      type: "job",
      price: 0,
      status: "active",
      isFeatured: true,
      country: "United States",
      state: "California",
      city: "San Francisco",
      isRemote: true,
      expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days
    });

    this.createListing({
      userId,
      title: "Selling Gaming PC - High Spec",
      description: "High-end gaming PC with RTX 3080, 32GB RAM, i9 processor. Perfect for gaming and crypto mining.",
      type: "personal",
      price: 180000, // $1800.00
      status: "active",
      isFeatured: true,
      country: "United States",
      state: "New York",
      city: "New York City",
      isRemote: false,
      expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    });

    this.createListing({
      userId,
      title: "Blockchain Consulting Services",
      description: "Professional blockchain consulting for startups and enterprises. We help with token design, smart contract audits, and go-to-market strategy.",
      type: "business",
      price: 0,
      status: "active",
      isFeatured: true,
      country: "United Kingdom",
      state: "England",
      city: "London",
      isRemote: false,
      expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    });

    // Add sample personal listings across different regions
    
    // United States - California
    this.createListing({
      userId,
      title: "Looking for Blockchain Study Group",
      description: "Web3 developer seeking like-minded individuals to form a weekly study group. Focus on DeFi protocols and smart contract development. Coffee meetups or virtual sessions.",
      type: "personal",
      price: 0,
      status: "active",
      isFeatured: false,
      country: "United States",
      state: "California",
      city: "San Francisco",
      isRemote: true,
      expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    });
    
    this.createListing({
      userId,
      title: "Crypto Enthusiast Seeking Mentor",
      description: "New to the crypto space and looking for an experienced mentor to help guide me through the initial learning curve. Happy to buy coffee/lunch in exchange for knowledge.",
      type: "personal",
      price: 0,
      status: "active",
      isFeatured: false,
      country: "United States",
      state: "California",
      city: "Los Angeles",
      isRemote: false,
      expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    });
    
    this.createListing({
      userId,
      title: "NFT Artist Looking for Collaborator",
      description: "Digital artist with experience in NFT creation looking for technical partner to help with smart contract deployment and marketing. Revenue share arrangement possible.",
      type: "personal",
      price: 0,
      status: "active",
      isFeatured: false,
      country: "United States",
      state: "California",
      city: "San Diego",
      isRemote: false,
      expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    });
    
    this.createListing({
      userId,
      title: "DAO Governance Study Group",
      description: "Forming a study group to analyze different DAO governance models. Meeting weekly to discuss case studies and potential improvements. All experience levels welcome.",
      type: "personal",
      price: 0,
      status: "active",
      isFeatured: false,
      country: "United States",
      state: "California",
      city: "Oakland",
      isRemote: true,
      expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    });
    
    this.createListing({
      userId,
      title: "Seeking Technical Co-founder for DeFi Startup",
      description: "Experienced product manager with connections in the VC space looking for technical co-founder for DeFi lending platform. Must have Solidity experience.",
      type: "personal",
      price: 0,
      status: "active",
      isFeatured: true,
      country: "United States",
      state: "California",
      city: "San Jose",
      isRemote: false,
      expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    });
    
    // United States - New York
    this.createListing({
      userId,
      title: "Web3 Meetup Organizer Wanted",
      description: "Looking for someone to help organize regular Web3 meetups in NYC. Venue and initial attendee list already established. Need someone with good organizational skills.",
      type: "personal",
      price: 0,
      status: "active",
      isFeatured: false,
      country: "United States",
      state: "New York",
      city: "New York City",
      isRemote: false,
      expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    });
    
    this.createListing({
      userId,
      title: "DeFi Trading Group Forming",
      description: "Looking for serious DeFi traders to form analysis group. Daily discussions on market trends and yield farming opportunities. Must have min 1 year experience.",
      type: "personal",
      price: 0,
      status: "active",
      isFeatured: false,
      country: "United States",
      state: "New York",
      city: "New York City",
      isRemote: true,
      expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    });
    
    this.createListing({
      userId,
      title: "Web3 Legal Study Group",
      description: "Group of legal professionals studying crypto regulations. Meeting biweekly to discuss regulatory changes. Looking for more participants with legal background.",
      type: "personal",
      price: 0,
      status: "active",
      isFeatured: false,
      country: "United States",
      state: "New York",
      city: "Buffalo",
      isRemote: false,
      expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    });
    
    this.createListing({
      userId,
      title: "Seeking Technical Writer for Blockchain Education",
      description: "Working on educational content about blockchain. Need a technical writer who understands the technology and can explain concepts clearly. Paid opportunity.",
      type: "personal",
      price: 0,
      status: "active",
      isFeatured: false,
      country: "United States",
      state: "New York",
      city: "Rochester",
      isRemote: true,
      expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    });
    
    this.createListing({
      userId,
      title: "Crypto Tax Specialist Wanted",
      description: "Looking for accountant or tax specialist with cryptocurrency experience. Need help organizing tax documentation for extensive trading activity.",
      type: "personal",
      price: 0,
      status: "active",
      isFeatured: true,
      country: "United States",
      state: "New York",
      city: "Albany",
      isRemote: false,
      expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    });
    
    // United Kingdom - England
    this.createListing({
      userId,
      title: "London Crypto Traders Meetup",
      description: "Organizing weekly meetups for crypto traders in central London. All experience levels welcome. Focus on education and networking.",
      type: "personal",
      price: 0,
      status: "active",
      isFeatured: false,
      country: "United Kingdom",
      state: "England",
      city: "London",
      isRemote: false,
      expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    });
    
    this.createListing({
      userId,
      title: "Smart Contract Auditor Available",
      description: "Experienced smart contract auditor offering code review services. Can help identify vulnerabilities before deployment. Multiple years of experience in security.",
      type: "personal",
      price: 0,
      status: "active",
      isFeatured: false,
      country: "United Kingdom",
      state: "England",
      city: "Manchester",
      isRemote: true,
      expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    });
    
    this.createListing({
      userId,
      title: "Forming NFT Art Collective",
      description: "Artist looking to form a collective for NFT creation and promotion. Looking for other artists, marketers, and developers to collaborate on projects.",
      type: "personal",
      price: 0,
      status: "active",
      isFeatured: false,
      country: "United Kingdom",
      state: "England",
      city: "Birmingham",
      isRemote: false,
      expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    });
    
    this.createListing({
      userId,
      title: "Blockchain Education for Kids",
      description: "Teacher creating curriculum to introduce blockchain concepts to children. Looking for others interested in educational content creation and review.",
      type: "personal",
      price: 0,
      status: "active",
      isFeatured: false,
      country: "United Kingdom",
      state: "England",
      city: "Liverpool",
      isRemote: true,
      expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    });
    
    this.createListing({
      userId,
      title: "Web3 Book Club Starting",
      description: "Starting a book club focused on Web3, crypto, and decentralization topics. Monthly in-person meetings with online discussions between. All welcome.",
      type: "personal",
      price: 0,
      status: "active",
      isFeatured: true,
      country: "United Kingdom",
      state: "England",
      city: "Leeds",
      isRemote: false,
      expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    });
    
    // United Arab Emirates - Dubai
    this.createListing({
      userId,
      title: "Crypto Networking in Dubai",
      description: "Organizing monthly networking events for crypto enthusiasts in Dubai. Connect with investors, developers, and entrepreneurs in the space.",
      type: "personal",
      price: 0,
      status: "active",
      isFeatured: false,
      country: "United Arab Emirates",
      state: "Dubai",
      city: "Downtown Dubai",
      isRemote: false,
      expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    });
    
    this.createListing({
      userId,
      title: "Looking for Blockchain Legal Expert",
      description: "Startup founder seeking legal expertise on crypto regulations in UAE. Need help with compliance for new exchange platform. Paid consultation.",
      type: "personal",
      price: 0,
      status: "active",
      isFeatured: false,
      country: "United Arab Emirates",
      state: "Dubai",
      city: "Dubai Marina",
      isRemote: false,
      expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    });
    
    this.createListing({
      userId,
      title: "Web3 Developer Community Forming",
      description: "Creating a community of Web3 developers in Dubai. Regular meetups, hackathons, and knowledge sharing sessions. All skill levels welcome.",
      type: "personal",
      price: 0,
      status: "active",
      isFeatured: false,
      country: "United Arab Emirates",
      state: "Dubai",
      city: "Business Bay",
      isRemote: false,
      expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    });
    
    this.createListing({
      userId,
      title: "Crypto OTC Broker Available",
      description: "Experienced OTC broker offering services for large crypto transactions. Institutional background with extensive network. Completely confidential.",
      type: "personal",
      price: 0,
      status: "active",
      isFeatured: false,
      country: "United Arab Emirates",
      state: "Dubai",
      city: "Jumeirah",
      isRemote: true,
      expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    });
    
    this.createListing({
      userId,
      title: "Blockchain for Supply Chain Workshop",
      description: "Organizing educational workshop on blockchain applications in supply chain. Looking for presenters and attendees with industry experience.",
      type: "personal",
      price: 0,
      status: "active",
      isFeatured: true,
      country: "United Arab Emirates",
      state: "Dubai",
      city: "Palm Jumeirah",
      isRemote: false,
      expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    });
    
    // Nigeria - Lagos
    this.createListing({
      userId,
      title: "Crypto Adoption Advocates Needed",
      description: "Working on increasing crypto adoption in Nigeria. Looking for educators and community builders to help with grassroots efforts.",
      type: "personal",
      price: 0,
      status: "active",
      isFeatured: false,
      country: "Nigeria",
      state: "Lagos",
      city: "Victoria Island",
      isRemote: false,
      expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    });
    
    this.createListing({
      userId,
      title: "Blockchain Developers Group",
      description: "Community of blockchain developers in Lagos meeting weekly. Focus on skill development and collaboration on local projects.",
      type: "personal",
      price: 0,
      status: "active",
      isFeatured: false,
      country: "Nigeria",
      state: "Lagos",
      city: "Ikeja",
      isRemote: false,
      expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    });
    
    this.createListing({
      userId,
      title: "P2P Trading Network Forming",
      description: "Building a trusted network for P2P crypto trading. Focused on safety and reliability. Looking for serious participants.",
      type: "personal",
      price: 0,
      status: "active",
      isFeatured: false,
      country: "Nigeria",
      state: "Lagos",
      city: "Lekki",
      isRemote: true,
      expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    });
    
    this.createListing({
      userId,
      title: "DeFi Education Sessions",
      description: "Hosting free educational sessions on DeFi platforms and yield farming. Weekly meetings with hands-on demonstrations.",
      type: "personal",
      price: 0,
      status: "active",
      isFeatured: false,
      country: "Nigeria",
      state: "Lagos",
      city: "Yaba",
      isRemote: false,
      expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    });
    
    this.createListing({
      userId,
      title: "Blockchain for Remittances Project",
      description: "Working on a project to improve remittance services using blockchain. Looking for developers, financial experts, and community connectors.",
      type: "personal",
      price: 0,
      status: "active",
      isFeatured: true,
      country: "Nigeria",
      state: "Lagos",
      city: "Surulere",
      isRemote: true,
      expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    });
    
    // South Korea - Seoul
    this.createListing({
      userId,
      title: "Korean Crypto Community Organizer",
      description: "Building a community of Korean-speaking crypto enthusiasts. Monthly meetups and online forum. Looking for additional organizers.",
      type: "personal",
      price: 0,
      status: "active",
      isFeatured: false,
      country: "South Korea",
      state: "Seoul",
      city: "Gangnam",
      isRemote: false,
      expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    });
    
    this.createListing({
      userId,
      title: "NFT Gaming Guild Recruiting",
      description: "Play-to-earn gaming guild looking for new members. Experience with Axie Infinity and other NFT games preferred. Revenue sharing model.",
      type: "personal",
      price: 0,
      status: "active",
      isFeatured: false,
      country: "South Korea",
      state: "Seoul",
      city: "Hongdae",
      isRemote: true,
      expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    });
    
    this.createListing({
      userId,
      title: "Crypto Tax Compliance Workshop",
      description: "Hosting workshop on navigating crypto tax regulations in South Korea. Led by financial advisors with crypto specialization.",
      type: "personal",
      price: 0,
      status: "active",
      isFeatured: false,
      country: "South Korea",
      state: "Seoul",
      city: "Jongno",
      isRemote: false,
      expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    });
    
    this.createListing({
      userId,
      title: "Smart Contract Translation Help",
      description: "Need help translating smart contract documentation between Korean and English. Ongoing project with competitive compensation.",
      type: "personal",
      price: 0,
      status: "active",
      isFeatured: false,
      country: "South Korea",
      state: "Seoul",
      city: "Myeongdong",
      isRemote: true,
      expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    });
    
    this.createListing({
      userId,
      title: "Web3 Startup Seeking Advisors",
      description: "Korean Web3 startup looking for advisors with industry experience. Need guidance on market strategy and technical architecture.",
      type: "personal",
      price: 0,
      status: "active",
      isFeatured: true,
      country: "South Korea",
      state: "Seoul",
      city: "Itaewon",
      isRemote: false,
      expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    });
    
    // Add a few more regular listings
    for (let i = 1; i <= 5; i++) {
      this.createListing({
        userId,
        title: `Regular Listing ${i}`,
        description: `This is a sample listing #${i} with detailed information about the product or service being offered.`,
        type: i % 3 === 0 ? "job" : i % 3 === 1 ? "personal" : "business",
        price: i * 10000, // $100.00 increments
        status: "active",
        isFeatured: false,
        country: "United States",
        state: "California",
        city: "San Francisco",
        isRemote: i % 2 === 0,
        expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
      });
    }
  }

  // USER OPERATIONS
  async getUser(id: number): Promise<User | undefined> {
    return this.users.find(user => user.id === id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return this.users.find(user => user.email === email);
  }

  async createUser(userData: InsertUser): Promise<User> {
    // Hash the password
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    
    // Hash security answer
    const hashedSecurityAnswer = await bcrypt.hash(userData.securityAnswer, 12);
    
    const now = new Date();
    const user: User = {
      id: this.userIdCounter++,
      username: userData.username,
      email: userData.email,
      password: hashedPassword,
      securityQuestion: userData.securityQuestion,
      securityAnswer: hashedSecurityAnswer,
      role: userData.role || 'user',
      lastLogin: null,
      createdAt: now
    };
    
    this.users.push(user);
    return user;
  }

  async validateUserCredentials(email: string, password: string): Promise<User | null> {
    const user = await this.getUserByEmail(email);
    if (!user) return null;
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return null;
    
    return user;
  }

  async validateSecurityQuestion(userId: number, questionId: string, answer: string): Promise<boolean> {
    const user = await this.getUser(userId);
    if (!user || user.securityQuestion !== questionId) return false;
    
    return bcrypt.compare(answer, user.securityAnswer);
  }

  // LISTING OPERATIONS
  async getListing(id: number): Promise<Listing | undefined> {
    return this.listings.find(listing => listing.id === id);
  }

  async getListings(options: { 
    page?: number; 
    perPage?: number; 
    country?: string; 
    state?: string; 
    city?: string; 
    type?: string;
    isFeatured?: boolean;
  }): Promise<{ listings: Listing[]; hasMore: boolean }> {
    const { 
      page = 1, 
      perPage = 20, 
      country, 
      state, 
      city, 
      type,
      isFeatured
    } = options;
    
    const offset = (page - 1) * perPage;
    
    // Filter listings based on criteria
    let filteredListings = this.listings.filter(listing => {
      const now = new Date();
      
      // Only active and non-expired listings
      if (listing.status !== 'active' || listing.expiresAt < now) {
        return false;
      }
      
      // Apply other filters
      if (country && listing.country !== country) return false;
      if (state && listing.state !== state) return false;
      if (city && listing.city !== city) return false;
      if (type && listing.type !== type) return false;
      if (isFeatured !== undefined && listing.isFeatured !== isFeatured) return false;
      
      return true;
    });
    
    // Sort listings: featured first, then newest
    filteredListings.sort((a, b) => {
      // Featured listings come first
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      
      // If both have same featured status, sort by creation date (newest first)
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
    
    // Apply pagination
    const paginatedListings = filteredListings.slice(offset, offset + perPage);
    const hasMore = filteredListings.length > offset + paginatedListings.length;
    
    return { 
      listings: paginatedListings,
      hasMore
    };
  }

  async createListing(listingData: InsertListing): Promise<Listing> {
    const now = new Date();
    const listing: Listing = {
      id: this.listingIdCounter++,
      userId: listingData.userId,
      title: listingData.title,
      description: listingData.description,
      type: listingData.type,
      subcategory: listingData.subcategory || null,
      price: listingData.price ?? null,
      status: listingData.status || 'active',
      isFeatured: listingData.isFeatured || false,
      isPaid: listingData.isPaid || false,
      isBoosted: listingData.isBoosted || false,
      boostExpiresAt: listingData.boostExpiresAt || null,
      country: listingData.country,
      state: listingData.state,
      city: listingData.city,
      isRemote: listingData.isRemote || false,
      expiresAt: listingData.expiresAt,
      createdAt: now
    };
    
    this.listings.push(listing);
    return listing;
  }

  async updateListing(id: number, listingData: Partial<Listing>): Promise<Listing | undefined> {
    const index = this.listings.findIndex(listing => listing.id === id);
    if (index === -1) return undefined;
    
    this.listings[index] = { ...this.listings[index], ...listingData };
    return this.listings[index];
  }

  async deleteListing(id: number): Promise<boolean> {
    const index = this.listings.findIndex(listing => listing.id === id);
    if (index === -1) return false;
    
    this.listings.splice(index, 1);
    return true;
  }

  // PAYMENT OPERATIONS
  async createPayment(paymentData: InsertPayment): Promise<Payment> {
    const now = new Date();
    const payment: Payment = {
      id: this.paymentIdCounter++,
      userId: paymentData.userId,
      listingId: paymentData.listingId,
      amount: paymentData.amount,
      currency: paymentData.currency || 'USD',
      status: paymentData.status || 'pending',
      paymentType: paymentData.paymentType || 'featured',
      paymentMethod: paymentData.paymentMethod || 'crypto',
      coinbaseChargeId: paymentData.coinbaseChargeId ?? null,
      stripePaymentIntentId: paymentData.stripePaymentIntentId ?? null,
      createdAt: now
    };
    
    this.payments.push(payment);
    return payment;
  }

  async getPayment(id: number): Promise<Payment | undefined> {
    return this.payments.find(payment => payment.id === id);
  }

  async updatePaymentStatus(id: number, status: string, coinbaseChargeId?: string): Promise<Payment | undefined> {
    const index = this.payments.findIndex(payment => payment.id === id);
    if (index === -1) return undefined;
    
    const updateData: Partial<Payment> = { status: status as any };
    if (coinbaseChargeId) {
      updateData.coinbaseChargeId = coinbaseChargeId;
    }
    
    this.payments[index] = { ...this.payments[index], ...updateData };
    return this.payments[index];
  }

  // SESSION OPERATIONS
  async createSession(sessionData: InsertSession): Promise<Session> {
    const session: Session = {
      id: sessionData.id,
      userId: sessionData.userId,
      expiresAt: sessionData.expiresAt
    };
    
    this.sessions.push(session);
    return session;
  }

  async getSession(id: string): Promise<Session | undefined> {
    const now = new Date();
    return this.sessions.find(
      session => session.id === id && session.expiresAt > now
    );
  }

  async deleteSession(id: string): Promise<boolean> {
    const index = this.sessions.findIndex(session => session.id === id);
    if (index === -1) return false;
    
    this.sessions.splice(index, 1);
    return true;
  }

  // REPORT OPERATIONS
  async createReport(reportData: InsertReport): Promise<Report> {
    const now = new Date();
    const report: Report = {
      id: this.reportIdCounter++,
      userId: reportData.userId,
      listingId: reportData.listingId,
      reason: reportData.reason,
      status: reportData.status || 'pending',
      createdAt: now
    };
    
    this.reports.push(report);
    return report;
  }

  async getReports(listingId: number): Promise<Report[]> {
    return this.reports
      .filter(report => report.listingId === listingId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async updateReportStatus(id: number, status: string): Promise<Report | undefined> {
    const index = this.reports.findIndex(report => report.id === id);
    if (index === -1) return undefined;
    
    this.reports[index] = { ...this.reports[index], status };
    return this.reports[index];
  }
}

// Database implementation
import { db } from "./db";

export class DatabaseStorage implements IStorage {
  async updateUserLastLogin(userId: number): Promise<User | undefined> {
    try {
      console.log(`Updating lastLogin for user ID: ${userId}`);
      
      // Update the last_login field directly
      await db
        .update(users)
        .set({ 
          lastLogin: new Date() 
        })
        .where(eq(users.id, userId));
      
      console.log(`lastLogin updated successfully for user ID: ${userId}`);
      
      // Return the updated user
      return await this.getUser(userId);
    } catch (error) {
      console.error("Error updating user last login:", error);
      console.error("Error details:", error instanceof Error ? error.message : String(error));
      return undefined;
    }
  }
  async getUser(id: number): Promise<User | undefined> {
    try {
      // Use a more specific select to avoid issues with missing columns
      const [user] = await db
        .select({
          id: users.id,
          username: users.username,
          email: users.email,
          password: users.password,
          securityQuestion: users.securityQuestion,
          securityAnswer: users.securityAnswer,
          role: users.role,
          createdAt: users.createdAt
        })
        .from(users)
        .where(eq(users.id, id));
      
      if (user) {
        // Add lastLogin field if it's missing
        return {
          ...user, 
          lastLogin: null // Add missing field with default value
        };
      }
      return undefined;
    } catch (error) {
      console.error("Error fetching user by ID:", error);
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      console.log(`Trying to find user by email: ${email}`);
      
      // Use a more specific select that includes lastLogin field
      const [user] = await db
        .select({
          id: users.id,
          username: users.username,
          email: users.email,
          password: users.password,
          securityQuestion: users.securityQuestion,
          securityAnswer: users.securityAnswer,
          role: users.role,
          createdAt: users.createdAt,
          lastLogin: users.lastLogin
        })
        .from(users)
        .where(eq(users.email, email));
      
      if (user) {
        console.log(`User found with email: ${email}, ID: ${user.id}`);
        return user;
      }
      
      console.log(`No user found with email: ${email}`);
      return undefined;
    } catch (error) {
      console.error("Error fetching user by email:", error);
      console.error("Error details:", error instanceof Error ? error.message : String(error));
      return undefined;
    }
  }

  async createUser(userData: InsertUser): Promise<User> {
    // Hash the password
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    
    // Hash security answer
    const hashedSecurityAnswer = await bcrypt.hash(userData.securityAnswer, 12);
    
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        password: hashedPassword,
        securityAnswer: hashedSecurityAnswer
      })
      .returning();
    
    return user;
  }

  async validateUserCredentials(email: string, password: string): Promise<User | null> {
    const user = await this.getUserByEmail(email);
    if (!user) return null;
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return null;
    
    return user;
  }

  async validateSecurityQuestion(userId: number, questionId: string, answer: string): Promise<boolean> {
    const user = await this.getUser(userId);
    if (!user || user.securityQuestion !== questionId) return false;
    
    return bcrypt.compare(answer, user.securityAnswer);
  }

  // LISTING OPERATIONS
  async getListing(id: number): Promise<Listing | undefined> {
    const [listing] = await db.select().from(listings).where(eq(listings.id, id));
    return listing || undefined;
  }

  async getListings(options: { 
    page?: number; 
    perPage?: number; 
    country?: string; 
    state?: string; 
    city?: string; 
    type?: string;
    isFeatured?: boolean;
  }): Promise<{ listings: Listing[]; hasMore: boolean }> {
    const { 
      page = 1, 
      perPage = 20, 
      country, 
      state, 
      city, 
      type,
      isFeatured
    } = options;
    
    const offset = (page - 1) * perPage;
    const now = new Date();
    
    // Build conditions array
    const conditions = [
      eq(listings.status, 'active'),
      gte(listings.expiresAt, now)
    ];
    
    if (country) conditions.push(eq(listings.country, country));
    if (state) conditions.push(eq(listings.state, state));
    if (city) conditions.push(eq(listings.city, city));
    if (type) conditions.push(eq(listings.type, type as any)); // Type cast needed for enum
    if (isFeatured !== undefined) conditions.push(eq(listings.isFeatured, isFeatured));
    
    // Get total count for pagination
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(listings)
      .where(and(...conditions));
    
    // Build query with ordering
    let query = db
      .select()
      .from(listings)
      .where(and(...conditions))
      .orderBy(
        desc(listings.isFeatured),
        desc(listings.createdAt)
      )
      .limit(perPage)
      .offset(offset);
    
    const results = await query;
    
    return {
      listings: results,
      hasMore: count > offset + results.length
    };
  }

  async createListing(listingData: InsertListing): Promise<Listing> {
    const [listing] = await db
      .insert(listings)
      .values(listingData)
      .returning();
    
    return listing;
  }

  async updateListing(id: number, listingData: Partial<Listing>): Promise<Listing | undefined> {
    const [updatedListing] = await db
      .update(listings)
      .set(listingData)
      .where(eq(listings.id, id))
      .returning();
    
    return updatedListing || undefined;
  }

  async deleteListing(id: number): Promise<boolean> {
    try {
      const result = await db
        .delete(listings)
        .where(eq(listings.id, id));
      
      return true; // If no error is thrown, deletion was successful
    } catch (error) {
      console.error("Error deleting listing:", error);
      return false;
    }
  }

  // PAYMENT OPERATIONS
  async createPayment(paymentData: InsertPayment): Promise<Payment> {
    const [payment] = await db
      .insert(payments)
      .values(paymentData)
      .returning();
    
    return payment;
  }

  async getPayment(id: number): Promise<Payment | undefined> {
    const [payment] = await db
      .select()
      .from(payments)
      .where(eq(payments.id, id));
    
    return payment || undefined;
  }

  async updatePaymentStatus(id: number, status: string, coinbaseChargeId?: string): Promise<Payment | undefined> {
    const updateData: any = { status: status as any }; // Type cast for enum
    if (coinbaseChargeId) {
      updateData.coinbaseChargeId = coinbaseChargeId;
    }
    
    const [updatedPayment] = await db
      .update(payments)
      .set(updateData)
      .where(eq(payments.id, id))
      .returning();
    
    return updatedPayment || undefined;
  }

  // SESSION OPERATIONS
  async createSession(sessionData: InsertSession): Promise<Session> {
    const [session] = await db
      .insert(sessions)
      .values(sessionData)
      .returning();
    
    return session;
  }

  async getSession(id: string): Promise<Session | undefined> {
    const [session] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.id, id));
    
    return session || undefined;
  }

  async deleteSession(id: string): Promise<boolean> {
    try {
      await db
        .delete(sessions)
        .where(eq(sessions.id, id));
      
      return true; // If no error is thrown, deletion was successful
    } catch (error) {
      console.error("Error deleting session:", error);
      return false;
    }
  }

  // REPORT OPERATIONS
  async createReport(reportData: InsertReport): Promise<Report> {
    const [report] = await db
      .insert(reports)
      .values(reportData)
      .returning();
    
    return report;
  }

  async getReports(listingId: number): Promise<Report[]> {
    const reportsList = await db
      .select()
      .from(reports)
      .where(eq(reports.listingId, listingId));
    
    return reportsList;
  }

  async updateReportStatus(id: number, status: string): Promise<Report | undefined> {
    const [updatedReport] = await db
      .update(reports)
      .set({ status: status as any }) // Type cast for enum
      .where(eq(reports.id, id))
      .returning();
    
    return updatedReport || undefined;
  }
}

export const storage = new DatabaseStorage();
