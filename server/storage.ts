import {
  users, courts, bookings, timeSlots, playerRequests, chats, reviews,
  type User, type InsertUser,
  type Court, type InsertCourt,
  type Booking, type InsertBooking,
  type TimeSlot, type InsertTimeSlot,
  type PlayerRequest, type InsertPlayerRequest,
  type Chat, type InsertChat,
  type Review, type InsertReview
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;

  // Court operations
  getCourt(id: number): Promise<Court | undefined>;
  getCourtsByOwner(ownerId: number): Promise<Court[]>;
  createCourt(court: InsertCourt): Promise<Court>;
  updateCourt(id: number, court: Partial<InsertCourt>): Promise<Court | undefined>;
  deleteCourt(id: number): Promise<boolean>;
  searchCourts(params: {
    location?: string;
    date?: Date;
    timeRange?: string;
  }): Promise<Court[]>;
  getAllCourts(): Promise<Court[]>;

  // Booking operations
  getBooking(id: number): Promise<Booking | undefined>;
  getUserBookings(userId: number): Promise<Booking[]>;
  getCourtBookings(courtId: number): Promise<Booking[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBookingStatus(id: number, status: string): Promise<Booking | undefined>;

  // TimeSlot operations
  getTimeSlotsByCourtAndDate(courtId: number, date: Date): Promise<TimeSlot[]>;
  createTimeSlot(timeSlot: InsertTimeSlot): Promise<TimeSlot>;
  updateTimeSlotBookedStatus(id: number, isBooked: boolean): Promise<TimeSlot | undefined>;

  // Player request operations
  getPlayerRequest(id: number): Promise<PlayerRequest | undefined>;
  getAllPlayerRequests(): Promise<PlayerRequest[]>;
  getPlayerRequestsByUser(userId: number): Promise<PlayerRequest[]>;
  createPlayerRequest(request: InsertPlayerRequest): Promise<PlayerRequest>;
  updatePlayerRequestStatus(id: number, status: string): Promise<PlayerRequest | undefined>;

  // Chat operations
  getChatMessages(senderId: number, receiverId: number): Promise<Chat[]>;
  createChatMessage(message: InsertChat): Promise<Chat>;
  markChatMessagesAsRead(senderId: number, receiverId: number): Promise<boolean>;

  // Review operations
  getCourtReviews(courtId: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  getReviewByUserAndCourt(userId: number, courtId: number): Promise<Review | undefined>;
  updateCourtRating(courtId: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private courts: Map<number, Court>;
  private bookings: Map<number, Booking>;
  private timeSlots: Map<number, TimeSlot>;
  private playerRequests: Map<number, PlayerRequest>;
  private chats: Map<number, Chat>;
  private reviews: Map<number, Review>;
  
  private userIdCounter: number;
  private courtIdCounter: number;
  private bookingIdCounter: number;
  private timeSlotIdCounter: number;
  private playerRequestIdCounter: number;
  private chatIdCounter: number;
  private reviewIdCounter: number;

  constructor() {
    this.users = new Map();
    this.courts = new Map();
    this.bookings = new Map();
    this.timeSlots = new Map();
    this.playerRequests = new Map();
    this.chats = new Map();
    this.reviews = new Map();
    
    this.userIdCounter = 1;
    this.courtIdCounter = 1;
    this.bookingIdCounter = 1;
    this.timeSlotIdCounter = 1;
    this.playerRequestIdCounter = 1;
    this.chatIdCounter = 1;
    this.reviewIdCounter = 1;

    // Seed with some initial data
    this.seedData();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...userData, id };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const existingUser = this.users.get(id);
    if (!existingUser) {
      return undefined;
    }
    const updatedUser = { ...existingUser, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Court operations
  async getCourt(id: number): Promise<Court | undefined> {
    return this.courts.get(id);
  }

  async getCourtsByOwner(ownerId: number): Promise<Court[]> {
    return Array.from(this.courts.values()).filter(
      (court) => court.ownerId === ownerId
    );
  }

  async createCourt(courtData: InsertCourt): Promise<Court> {
    const id = this.courtIdCounter++;
    const court: Court = { ...courtData, id };
    this.courts.set(id, court);
    return court;
  }

  async updateCourt(id: number, courtData: Partial<InsertCourt>): Promise<Court | undefined> {
    const existingCourt = this.courts.get(id);
    if (!existingCourt) {
      return undefined;
    }
    const updatedCourt = { ...existingCourt, ...courtData };
    this.courts.set(id, updatedCourt);
    return updatedCourt;
  }

  async deleteCourt(id: number): Promise<boolean> {
    return this.courts.delete(id);
  }

  async searchCourts(params: {
    location?: string;
    date?: Date;
    timeRange?: string;
  }): Promise<Court[]> {
    let filteredCourts = Array.from(this.courts.values());
    
    if (params.location) {
      filteredCourts = filteredCourts.filter(
        (court) => court.location.toLowerCase().includes(params.location!.toLowerCase())
      );
    }
    
    // Additional filtering by date and time can be implemented
    // when combined with the timeSlots data
    
    return filteredCourts;
  }

  async getAllCourts(): Promise<Court[]> {
    return Array.from(this.courts.values());
  }

  // Booking operations
  async getBooking(id: number): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }

  async getUserBookings(userId: number): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(
      (booking) => booking.userId === userId
    );
  }

  async getCourtBookings(courtId: number): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(
      (booking) => booking.courtId === courtId
    );
  }

  async createBooking(bookingData: InsertBooking): Promise<Booking> {
    const id = this.bookingIdCounter++;
    const booking: Booking = { ...bookingData, id };
    this.bookings.set(id, booking);
    return booking;
  }

  async updateBookingStatus(id: number, status: string): Promise<Booking | undefined> {
    const existingBooking = this.bookings.get(id);
    if (!existingBooking) {
      return undefined;
    }
    const updatedBooking = { ...existingBooking, status };
    this.bookings.set(id, updatedBooking);
    return updatedBooking;
  }

  // TimeSlot operations
  async getTimeSlotsByCourtAndDate(courtId: number, date: Date): Promise<TimeSlot[]> {
    const dateStr = date.toISOString().split('T')[0];
    return Array.from(this.timeSlots.values()).filter(
      (slot) => {
        const slotDateStr = new Date(slot.date).toISOString().split('T')[0];
        return slot.courtId === courtId && slotDateStr === dateStr;
      }
    );
  }

  async createTimeSlot(timeSlotData: InsertTimeSlot): Promise<TimeSlot> {
    const id = this.timeSlotIdCounter++;
    const timeSlot: TimeSlot = { ...timeSlotData, id };
    this.timeSlots.set(id, timeSlot);
    return timeSlot;
  }

  async updateTimeSlotBookedStatus(id: number, isBooked: boolean): Promise<TimeSlot | undefined> {
    const existingTimeSlot = this.timeSlots.get(id);
    if (!existingTimeSlot) {
      return undefined;
    }
    const updatedTimeSlot = { ...existingTimeSlot, isBooked };
    this.timeSlots.set(id, updatedTimeSlot);
    return updatedTimeSlot;
  }

  // Player request operations
  async getPlayerRequest(id: number): Promise<PlayerRequest | undefined> {
    return this.playerRequests.get(id);
  }

  async getAllPlayerRequests(): Promise<PlayerRequest[]> {
    return Array.from(this.playerRequests.values()).filter(
      request => request.status === 'active'
    );
  }

  async getPlayerRequestsByUser(userId: number): Promise<PlayerRequest[]> {
    return Array.from(this.playerRequests.values()).filter(
      (request) => request.userId === userId
    );
  }

  async createPlayerRequest(requestData: InsertPlayerRequest): Promise<PlayerRequest> {
    const id = this.playerRequestIdCounter++;
    const playerRequest: PlayerRequest = { ...requestData, id };
    this.playerRequests.set(id, playerRequest);
    return playerRequest;
  }

  async updatePlayerRequestStatus(id: number, status: string): Promise<PlayerRequest | undefined> {
    const existingRequest = this.playerRequests.get(id);
    if (!existingRequest) {
      return undefined;
    }
    const updatedRequest = { ...existingRequest, status };
    this.playerRequests.set(id, updatedRequest);
    return updatedRequest;
  }

  // Chat operations
  async getChatMessages(senderId: number, receiverId: number): Promise<Chat[]> {
    return Array.from(this.chats.values()).filter(
      (chat) => 
        (chat.senderId === senderId && chat.receiverId === receiverId) ||
        (chat.senderId === receiverId && chat.receiverId === senderId)
    ).sort((a, b) => a.sentAt.getTime() - b.sentAt.getTime());
  }

  async createChatMessage(messageData: InsertChat): Promise<Chat> {
    const id = this.chatIdCounter++;
    const chat: Chat = { 
      ...messageData, 
      id, 
      sentAt: new Date() 
    };
    this.chats.set(id, chat);
    return chat;
  }

  async markChatMessagesAsRead(senderId: number, receiverId: number): Promise<boolean> {
    const messages = Array.from(this.chats.values()).filter(
      (chat) => chat.senderId === senderId && chat.receiverId === receiverId && !chat.read
    );
    
    for (const message of messages) {
      message.read = true;
      this.chats.set(message.id, message);
    }
    
    return true;
  }

  // Review operations
  async getCourtReviews(courtId: number): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(
      (review) => review.courtId === courtId
    );
  }

  async createReview(reviewData: InsertReview): Promise<Review> {
    const id = this.reviewIdCounter++;
    const review: Review = { 
      ...reviewData, 
      id, 
      createdAt: new Date() 
    };
    this.reviews.set(id, review);
    
    // Update court rating
    await this.updateCourtRating(reviewData.courtId);
    
    return review;
  }

  async getReviewByUserAndCourt(userId: number, courtId: number): Promise<Review | undefined> {
    return Array.from(this.reviews.values()).find(
      (review) => review.userId === userId && review.courtId === courtId
    );
  }

  async updateCourtRating(courtId: number): Promise<void> {
    const reviews = await this.getCourtReviews(courtId);
    if (reviews.length === 0) {
      return;
    }
    
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const avgRating = Math.round(totalRating / reviews.length);
    
    const court = await this.getCourt(courtId);
    if (court) {
      await this.updateCourt(courtId, { rating: avgRating });
    }
  }

  // Seed initial data
  private seedData() {
    // Create sample users
    const user1: InsertUser = {
      username: "johndoe",
      password: "$2b$10$X/hX5KV5qhxGww4KGe3H7ebp1b3eBW8vRh9/poSJm.bVxW4.yMQZy", // "password123"
      email: "john@example.com",
      name: "John Doe",
      bio: "Avid badminton player for 5 years",
      location: "Quận 1, TP. Hồ Chí Minh",
      skillLevel: "intermediate",
      isCourtOwner: false,
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&h=100&q=80"
    };

    const user2: InsertUser = {
      username: "janedoe",
      password: "$2b$10$X/hX5KV5qhxGww4KGe3H7ebp1b3eBW8vRh9/poSJm.bVxW4.yMQZy", // "password123"
      email: "jane@example.com",
      name: "Jane Doe",
      bio: "Professional badminton coach",
      location: "Quận 7, TP. Hồ Chí Minh",
      skillLevel: "advanced",
      isCourtOwner: true,
      avatarUrl: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&h=100&q=80"
    };

    this.createUser(user1).then(user => {
      // Create sample player requests
      this.createPlayerRequest({
        userId: user.id,
        location: "Quận 1, TP. Hồ Chí Minh",
        date: new Date(new Date().setDate(new Date().getDate() + 2)),
        timeRange: "18:00 - 20:00",
        message: "Looking for a friendly game",
        status: "active"
      });
    });

    this.createUser(user2).then(owner => {
      // Create sample courts
      this.createCourt({
        name: "Green Galaxy Badminton",
        description: "Modern badminton facility with professional courts and amenities",
        location: "Quận 1, TP. Hồ Chí Minh",
        imageUrl: "https://images.unsplash.com/photo-1615117972428-28de67cda58e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80",
        pricePerHour: 150000,
        ownerId: owner.id,
        amenities: ["Máy lạnh", "Nhà vệ sinh", "Căn tin"],
        rating: 5
      }).then(court => {
        // Create time slots for the court
        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);
        
        // Create slots for today
        for (let hour = 9; hour < 22; hour++) {
          const startTime = new Date(today);
          startTime.setHours(hour, 0, 0);
          const endTime = new Date(today);
          endTime.setHours(hour + 1, 0, 0);
          
          this.createTimeSlot({
            courtId: court.id,
            date: today,
            startTime,
            endTime,
            isBooked: Math.random() > 0.7 // Randomly mark some as booked
          });
        }
        
        // Create slots for tomorrow
        for (let hour = 9; hour < 22; hour++) {
          const startTime = new Date(tomorrow);
          startTime.setHours(hour, 0, 0);
          const endTime = new Date(tomorrow);
          endTime.setHours(hour + 1, 0, 0);
          
          this.createTimeSlot({
            courtId: court.id,
            date: tomorrow,
            startTime,
            endTime,
            isBooked: Math.random() > 0.7 // Randomly mark some as booked
          });
        }
      });

      this.createCourt({
        name: "Olympic Sports Center",
        description: "Large sports center with multiple badminton courts",
        location: "Quận 7, TP. Hồ Chí Minh",
        imageUrl: "https://pixabay.com/get/g1b8ddd6e5e99bdcc243b4b029d0d336dec5e88d476bde6bdda00ee6656c0a117023bc6c97a44cae846ef30b80eccdc15f1ae8afb93b957add2d60b7b12be057f_1280.jpg",
        pricePerHour: 180000,
        ownerId: owner.id,
        amenities: ["5 sân", "Máy lạnh", "Phòng thay đồ"],
        rating: 4
      });

      this.createCourt({
        name: "Victory Badminton Club",
        description: "Exclusive club with high-quality badminton courts",
        location: "Quận 3, TP. Hồ Chí Minh",
        imageUrl: "https://images.unsplash.com/photo-1521537634581-0dced2fee2ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80",
        pricePerHour: 200000,
        ownerId: owner.id,
        amenities: ["Quốc tế", "HLV", "Cho thuê vợt"],
        rating: 5
      });

      this.createCourt({
        name: "Sunshine Badminton",
        description: "Community sports center with several badminton courts",
        location: "Quận 5, TP. Hồ Chí Minh",
        imageUrl: "https://pixabay.com/get/g3f5d02da5377bc0eae8b21e60c1214d596252090705ae4f9879c92a389c7f26d87e444dc9e71b5e778d6fa13abd2d6931ba2093f5b391482d3fb6905ff12deca_1280.jpg",
        pricePerHour: 120000,
        ownerId: owner.id,
        amenities: ["Giá rẻ", "3 sân", "Bãi đỗ xe"],
        rating: 4
      });
    });

    // Create additional users for player matching feature
    this.createUser({
      username: "minhanh",
      password: "$2b$10$X/hX5KV5qhxGww4KGe3H7ebp1b3eBW8vRh9/poSJm.bVxW4.yMQZy", // "password123"
      email: "minhanh@example.com",
      name: "Minh Anh",
      bio: "Casual badminton player looking for partners",
      location: "Quận 3, TP. Hồ Chí Minh",
      skillLevel: "intermediate",
      isCourtOwner: false,
      avatarUrl: "https://images.unsplash.com/photo-1554151228-14d9def656e4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&h=100&q=80"
    });

    this.createUser({
      username: "hoangnam",
      password: "$2b$10$X/hX5KV5qhxGww4KGe3H7ebp1b3eBW8vRh9/poSJm.bVxW4.yMQZy", // "password123"
      email: "hoangnam@example.com",
      name: "Hoàng Nam",
      bio: "Competitive badminton player with 10 years experience",
      location: "Quận 7, TP. Hồ Chí Minh",
      skillLevel: "advanced",
      isCourtOwner: false,
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&h=100&q=80"
    });

    this.createUser({
      username: "thutrang",
      password: "$2b$10$X/hX5KV5qhxGww4KGe3H7ebp1b3eBW8vRh9/poSJm.bVxW4.yMQZy", // "password123"
      email: "thutrang@example.com",
      name: "Thu Trang",
      bio: "Beginner looking to improve badminton skills",
      location: "Quận 1, TP. Hồ Chí Minh",
      skillLevel: "beginner",
      isCourtOwner: false,
      avatarUrl: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&h=100&q=80"
    });
  }
}

export const storage = new MemStorage();
