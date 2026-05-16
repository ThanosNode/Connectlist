import { type User, type InsertUser, type Listing, type InsertListing, type Payment, type InsertPayment, type Session, type InsertSession, type Report, type InsertReport } from "@shared/schema";
import { eq, and, gte, desc, asc, sql, or, like, between } from "drizzle-orm";
import bcrypt from "bcrypt";
import { users, listings, payments, sessions, reports } from "@shared/schema";
import { db } from "./db";

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

// In-memory implementation (for testing/development)
export class MemStorage implements IStorage {
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
    this.createUser({
      username: 'admin',
      email: 'admin@example.com',
      password: 'admin123',
      securityQuestion: 'first-pet',
      securityAnswer: 'fido',
      role: 'super_admin',
    }).catch(console.error);
  }
  
  // USER OPERATIONS
  async getUser(id: number): Promise<User | undefined> {
    return this.users.find(user => user.id === id);
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return this.users.find(user => user.email.toLowerCase() === email.toLowerCase());
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
      lastLogin: now,
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
  
  async updateUserLastLogin(userId: number): Promise<User | undefined> {
    const userIndex = this.users.findIndex(user => user.id === userId);
    if (userIndex === -1) return undefined;
    
    this.users[userIndex] = {
      ...this.users[userIndex],
      lastLogin: new Date()
    };
    
    return this.users[userIndex];
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
    const now = new Date();
    
    // Filter active listings
    let filteredListings = this.listings.filter(listing => 
      listing.status === 'active' && 
      new Date(listing.expiresAt) >= now
    );
    
    // Apply filters
    if (country) {
      filteredListings = filteredListings.filter(listing => listing.country === country);
    }
    
    if (state) {
      filteredListings = filteredListings.filter(listing => listing.state === state);
    }
    
    if (city) {
      filteredListings = filteredListings.filter(listing => listing.city === city);
    }
    
    if (type) {
      filteredListings = filteredListings.filter(listing => listing.type === type);
    }
    
    if (isFeatured !== undefined) {
      filteredListings = filteredListings.filter(listing => listing.isFeatured === isFeatured);
    }
    
    // Sort by creation date (newest first)
    filteredListings.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    
    const paginatedListings = filteredListings.slice(offset, offset + perPage);
    
    return {
      listings: paginatedListings,
      hasMore: offset + paginatedListings.length < filteredListings.length
    };
  }
  
  async createListing(listingData: InsertListing): Promise<Listing> {
    const now = new Date();
    
    const listing: Listing = {
      id: this.listingIdCounter++,
      ...listingData,
      isFeatured: false,
      isPaid: false,
      isBoosted: false,
      boostExpiresAt: null,
      status: 'active',
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
      ...paymentData,
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
      ...sessionData
    };
    
    this.sessions.push(session);
    return session;
  }
  
  async getSession(id: string): Promise<Session | undefined> {
    return this.sessions.find(session => session.id === id);
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
export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
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
  
  async updateUserLastLogin(userId: number): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({ lastLogin: new Date() })
      .where(eq(users.id, userId))
      .returning();
    
    return updatedUser || undefined;
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
    
    // Get paginated results
    const query = db
      .select()
      .from(listings)
      .where(and(...conditions))
      .orderBy(
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
      
      return true;
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
    return db
      .select()
      .from(reports)
      .where(eq(reports.listingId, listingId))
      .orderBy(desc(reports.createdAt));
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