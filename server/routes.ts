import express, { type Request, Response } from "express";
import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import WebSocket from "ws";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertCourtSchema, 
  insertBookingSchema, 
  insertTimeSlotSchema,
  insertPlayerRequestSchema,
  insertChatSchema,
  insertReviewSchema
} from "@shared/schema";
import * as bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import session from "express-session";
import MemoryStore from 'memorystore';

const SECRET_KEY = process.env.JWT_SECRET || "badminton-hub-secret-key";
const SessionStore = MemoryStore(session);

import { PgStorage } from "./pg-storage";

export async function registerRoutes(app: Express, useDatabase = false): Promise<Server> {
  // Sử dụng PostgreSQL nếu có kết nối, ngược lại sử dụng lưu trữ trong bộ nhớ
  const storageInstance = useDatabase ? new PgStorage() : storage;
  // Configure session middleware
  app.use(session({
    secret: SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    store: new SessionStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Auth middleware
  const authenticate = async (req: Request, res: Response, next: any) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const decoded = jwt.verify(token, SECRET_KEY) as { userId: number };
      
      const user = await storageInstance.getUser(decoded.userId);
      if (!user) {
        return res.status(401).json({ message: "Invalid user" });
      }
      
      req.body.userId = user.id;
      next();
    } catch (error) {
      return res.status(401).json({ message: "Invalid token" });
    }
  };

  // Auth routes
  const authRouter = express.Router();
  
  authRouter.post("/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username or email already exists
      const existingUser = await storageInstance.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already taken" });
      }
      
      const existingEmail = await storageInstance.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already in use" });
      }
      
      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
      
      // Create user with hashed password
      const newUser = await storageInstance.createUser({
        ...userData,
        password: hashedPassword
      });
      
      // Generate token
      const token = jwt.sign({ userId: newUser.id }, SECRET_KEY, {
        expiresIn: "24h"
      });
      
      // Remove password from response
      const { password, ...userWithoutPassword } = newUser;
      
      res.status(201).json({
        user: userWithoutPassword,
        token
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  authRouter.post("/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const user = await storageInstance.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // Generate token
      const token = jwt.sign({ userId: user.id }, SECRET_KEY, {
        expiresIn: "24h"
      });
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      
      res.status(200).json({
        user: userWithoutPassword,
        token
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  authRouter.get("/me", authenticate, async (req, res) => {
    try {
      const userId = req.body.userId;
      const user = await storageInstance.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      res.status(200).json(userWithoutPassword);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Courts router
  const courtsRouter = express.Router();
  
  courtsRouter.get("/", async (req, res) => {
    try {
      const { location, date, time } = req.query;
      
      let courts;
      if (location || date || time) {
        courts = await storageInstance.searchCourts({
          location: location as string,
          date: date ? new Date(date as string) : undefined,
          timeRange: time as string
        });
      } else {
        courts = await storageInstance.getAllCourts();
      }
      
      res.status(200).json(courts);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  courtsRouter.get("/:id", async (req, res) => {
    try {
      const courtId = parseInt(req.params.id);
      const court = await storageInstance.getCourt(courtId);
      
      if (!court) {
        return res.status(404).json({ message: "Court not found" });
      }
      
      res.status(200).json(court);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  courtsRouter.post("/", authenticate, async (req, res) => {
    try {
      const userId = req.body.userId;
      const user = await storageInstance.getUser(userId);
      
      if (!user || !user.isCourtOwner) {
        return res.status(403).json({ message: "Only court owners can create courts" });
      }
      
      const courtData = insertCourtSchema.parse({
        ...req.body,
        ownerId: userId
      });
      
      const newCourt = await storageInstance.createCourt(courtData);
      res.status(201).json(newCourt);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  courtsRouter.put("/:id", authenticate, async (req, res) => {
    try {
      const courtId = parseInt(req.params.id);
      const userId = req.body.userId;
      
      const court = await storageInstance.getCourt(courtId);
      if (!court) {
        return res.status(404).json({ message: "Court not found" });
      }
      
      if (court.ownerId !== userId) {
        return res.status(403).json({ message: "You can only update your own courts" });
      }
      
      const updatedCourt = await storageInstance.updateCourt(courtId, req.body);
      res.status(200).json(updatedCourt);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  courtsRouter.delete("/:id", authenticate, async (req, res) => {
    try {
      const courtId = parseInt(req.params.id);
      const userId = req.body.userId;
      
      const court = await storageInstance.getCourt(courtId);
      if (!court) {
        return res.status(404).json({ message: "Court not found" });
      }
      
      if (court.ownerId !== userId) {
        return res.status(403).json({ message: "You can only delete your own courts" });
      }
      
      const deleted = await storageInstance.deleteCourt(courtId);
      if (deleted) {
        res.status(200).json({ message: "Court deleted successfully" });
      } else {
        res.status(400).json({ message: "Failed to delete court" });
      }
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Time Slots router
  const timeSlotsRouter = express.Router();
  
  timeSlotsRouter.get("/:courtId/:date", async (req, res) => {
    try {
      const courtId = parseInt(req.params.courtId);
      const date = new Date(req.params.date);
      
      const timeSlots = await storageInstance.getTimeSlotsByCourtAndDate(courtId, date);
      res.status(200).json(timeSlots);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  timeSlotsRouter.post("/", authenticate, async (req, res) => {
    try {
      const userId = req.body.userId;
      
      // Check if user is the court owner
      const court = await storageInstance.getCourt(req.body.courtId);
      if (!court || court.ownerId !== userId) {
        return res.status(403).json({ message: "Only court owners can create time slots" });
      }
      
      const timeSlotData = insertTimeSlotSchema.parse(req.body);
      const newTimeSlot = await storageInstance.createTimeSlot(timeSlotData);
      
      res.status(201).json(newTimeSlot);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Bookings router
  const bookingsRouter = express.Router();
  
  bookingsRouter.get("/user", authenticate, async (req, res) => {
    try {
      const userId = req.body.userId;
      const bookings = await storageInstance.getUserBookings(userId);
      
      // Enrich with court details
      const enrichedBookings = await Promise.all(
        bookings.map(async (booking) => {
          const court = await storageInstance.getCourt(booking.courtId);
          return {
            ...booking,
            court
          };
        })
      );
      
      res.status(200).json(enrichedBookings);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  bookingsRouter.get("/court/:courtId", authenticate, async (req, res) => {
    try {
      const courtId = parseInt(req.params.courtId);
      const userId = req.body.userId;
      
      // Check if user is the court owner
      const court = await storageInstance.getCourt(courtId);
      if (!court || court.ownerId !== userId) {
        return res.status(403).json({ message: "You can only view bookings for your own courts" });
      }
      
      const bookings = await storageInstance.getCourtBookings(courtId);
      
      // Enrich with user details (excluding password)
      const enrichedBookings = await Promise.all(
        bookings.map(async (booking) => {
          const user = await storageInstance.getUser(booking.userId);
          const { password, ...userWithoutPassword } = user || {};
          return {
            ...booking,
            user: userWithoutPassword
          };
        })
      );
      
      res.status(200).json(enrichedBookings);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  bookingsRouter.post("/", authenticate, async (req, res) => {
    try {
      const userId = req.body.userId;
      
      const bookingData = insertBookingSchema.parse({
        ...req.body,
        userId
      });
      
      // Check if the time slot is available
      const timeSlots = await storageInstance.getTimeSlotsByCourtAndDate(
        bookingData.courtId,
        new Date(bookingData.date)
      );
      
      const requestedStartTime = new Date(bookingData.startTime).getTime();
      const requestedEndTime = new Date(bookingData.endTime).getTime();
      
      // Find matching time slot
      const matchingSlot = timeSlots.find(slot => {
        const slotStart = new Date(slot.startTime).getTime();
        const slotEnd = new Date(slot.endTime).getTime();
        return slotStart === requestedStartTime && slotEnd === requestedEndTime;
      });
      
      if (!matchingSlot) {
        return res.status(400).json({ message: "No matching time slot found" });
      }
      
      if (matchingSlot.isBooked) {
        return res.status(400).json({ message: "This time slot is already booked" });
      }
      
      // Create booking
      const newBooking = await storageInstance.createBooking(bookingData);
      
      // Mark time slot as booked
      await storageInstance.updateTimeSlotBookedStatus(matchingSlot.id, true);
      
      res.status(201).json(newBooking);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  bookingsRouter.patch("/:id/status", authenticate, async (req, res) => {
    try {
      const bookingId = parseInt(req.params.id);
      const { status } = req.body;
      const userId = req.body.userId;
      
      if (!["pending", "confirmed", "cancelled", "completed"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const booking = await storageInstance.getBooking(bookingId);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      // Check if user is authorized (either the booker or the court owner)
      const court = await storageInstance.getCourt(booking.courtId);
      if (!court) {
        return res.status(404).json({ message: "Court not found" });
      }
      
      const isAuthorized = userId === booking.userId || userId === court.ownerId;
      if (!isAuthorized) {
        return res.status(403).json({ message: "Not authorized to update this booking" });
      }
      
      const updatedBooking = await storageInstance.updateBookingStatus(bookingId, status);
      
      // Update time slot if booking is cancelled
      if (status === "cancelled") {
        const timeSlots = await storageInstance.getTimeSlotsByCourtAndDate(
          booking.courtId,
          new Date(booking.date)
        );
        
        const bookingStartTime = new Date(booking.startTime).getTime();
        const bookingEndTime = new Date(booking.endTime).getTime();
        
        const matchingSlot = timeSlots.find(slot => {
          const slotStart = new Date(slot.startTime).getTime();
          const slotEnd = new Date(slot.endTime).getTime();
          return slotStart === bookingStartTime && slotEnd === bookingEndTime;
        });
        
        if (matchingSlot) {
          await storageInstance.updateTimeSlotBookedStatus(matchingSlot.id, false);
        }
      }
      
      res.status(200).json(updatedBooking);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Player Requests router
  const playerRequestsRouter = express.Router();
  
  playerRequestsRouter.get("/", async (req, res) => {
    try {
      const requests = await storageInstance.getAllPlayerRequests();
      
      // Enrich with user details (excluding password)
      const enrichedRequests = await Promise.all(
        requests.map(async (request) => {
          const user = await storageInstance.getUser(request.userId);
          const { password, ...userWithoutPassword } = user || {};
          return {
            ...request,
            user: userWithoutPassword
          };
        })
      );
      
      res.status(200).json(enrichedRequests);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  playerRequestsRouter.get("/user", authenticate, async (req, res) => {
    try {
      const userId = req.body.userId;
      const requests = await storageInstance.getPlayerRequestsByUser(userId);
      res.status(200).json(requests);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  playerRequestsRouter.post("/", authenticate, async (req, res) => {
    try {
      const userId = req.body.userId;
      
      const requestData = insertPlayerRequestSchema.parse({
        ...req.body,
        userId
      });
      
      const newRequest = await storageInstance.createPlayerRequest(requestData);
      res.status(201).json(newRequest);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  playerRequestsRouter.patch("/:id/status", authenticate, async (req, res) => {
    try {
      const requestId = parseInt(req.params.id);
      const { status } = req.body;
      const userId = req.body.userId;
      
      if (!["active", "fulfilled", "expired"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const request = await storageInstance.getPlayerRequest(requestId);
      if (!request) {
        return res.status(404).json({ message: "Player request not found" });
      }
      
      // Only the creator can update the status
      if (request.userId !== userId) {
        return res.status(403).json({ message: "Not authorized to update this request" });
      }
      
      const updatedRequest = await storageInstance.updatePlayerRequestStatus(requestId, status);
      res.status(200).json(updatedRequest);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Reviews router
  const reviewsRouter = express.Router();
  
  reviewsRouter.get("/court/:courtId", async (req, res) => {
    try {
      const courtId = parseInt(req.params.courtId);
      const reviews = await storageInstance.getCourtReviews(courtId);
      
      // Enrich with user details (excluding password)
      const enrichedReviews = await Promise.all(
        reviews.map(async (review) => {
          const user = await storageInstance.getUser(review.userId);
          const { password, ...userWithoutPassword } = user || {};
          return {
            ...review,
            user: userWithoutPassword
          };
        })
      );
      
      res.status(200).json(enrichedReviews);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  reviewsRouter.post("/", authenticate, async (req, res) => {
    try {
      const userId = req.body.userId;
      
      const reviewData = insertReviewSchema.parse({
        ...req.body,
        userId
      });
      
      // Check if user has already reviewed this court
      const existingReview = await storageInstance.getReviewByUserAndCourt(userId, reviewData.courtId);
      if (existingReview) {
        return res.status(400).json({ message: "You have already reviewed this court" });
      }
      
      const newReview = await storageInstance.createReview(reviewData);
      res.status(201).json(newReview);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  // Create WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  // WebSocket connections map
  const connections = new Map<number, WebSocket>();

  wss.on('connection', (ws: WebSocket) => {
    let userId: number | null = null;

    ws.on('message', async (message: string) => {
      try {
        const data = JSON.parse(message);

        if (data.type === 'auth') {
          // Authenticate user via token
          try {
            const decoded = jwt.verify(data.token, SECRET_KEY) as { userId: number };
            userId = decoded.userId;
            connections.set(userId, ws);
            ws.send(JSON.stringify({ type: 'auth', success: true }));
          } catch (error) {
            ws.send(JSON.stringify({ type: 'auth', success: false, message: 'Invalid token' }));
          }
        } else if (data.type === 'message' && userId) {
          // Handle chat message
          if (!data.receiverId || !data.content) {
            ws.send(JSON.stringify({ 
              type: 'error', 
              message: 'Missing receiverId or content' 
            }));
            return;
          }

          // Store message in database
          const chatMessage = await storageInstance.createChatMessage({
            senderId: userId,
            receiverId: data.receiverId,
            message: data.content,
            read: false
          });

          // Send to recipient if online
          const receiverWs = connections.get(data.receiverId);
          if (receiverWs && receiverWs.readyState === WebSocket.OPEN) {
            receiverWs.send(JSON.stringify({
              type: 'message',
              message: {
                id: chatMessage.id,
                senderId: chatMessage.senderId,
                content: chatMessage.message,
                sentAt: chatMessage.sentAt
              }
            }));
          }

          // Confirm to sender
          ws.send(JSON.stringify({
            type: 'messageSent',
            messageId: chatMessage.id
          }));
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
      }
    });

    ws.on('close', () => {
      if (userId) {
        connections.delete(userId);
      }
    });
  });

  // Register routes
  app.use("/api/auth", authRouter);
  app.use("/api/courts", courtsRouter);
  app.use("/api/time-slots", timeSlotsRouter);
  app.use("/api/bookings", bookingsRouter);
  app.use("/api/player-requests", playerRequestsRouter);
  app.use("/api/reviews", reviewsRouter);

  // Chat messages API route
  app.get("/api/chat/:receiverId", authenticate, async (req, res) => {
    try {
      const senderId = req.body.userId;
      const receiverId = parseInt(req.params.receiverId);
      
      const messages = await storageInstance.getChatMessages(senderId, receiverId);
      
      // Mark messages from receiver as read
      await storageInstance.markChatMessagesAsRead(receiverId, senderId);
      
      res.status(200).json(messages);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  return httpServer;
}
