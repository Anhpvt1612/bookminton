import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@shared/schema";
import dotenv from "dotenv";
dotenv.config();



// Tạo kết nối đến cơ sở dữ liệu PostgreSQL
const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
export const db = drizzle(client, { schema });

export async function initDatabase() {
  console.log("Đang kết nối đến cơ sở dữ liệu PostgreSQL...");
  try {
    // Kiểm tra kết nối
    const result = await client`SELECT NOW()`;
    console.log("Đã kết nối thành công đến PostgreSQL:", result[0].now);
    
    // Khởi tạo migration - tạo bảng nếu chưa tồn tại
    await initTables();
    
    // Tạo dữ liệu mẫu nếu chưa có
    await seedSampleData();
    
    return true;
  } catch (error) {
    console.error("Lỗi khi kết nối đến PostgreSQL:", error);
    return false;
  }
}

async function initTables() {
  try {
    // Tạo bảng users
    await client`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        bio TEXT,
        location TEXT,
        skill_level TEXT,
        is_court_owner BOOLEAN DEFAULT FALSE,
        avatar_url TEXT
      )
    `;
    
    // Tạo bảng courts
    await client`
      CREATE TABLE IF NOT EXISTS courts (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        location TEXT NOT NULL,
        description TEXT NOT NULL,
        image_url TEXT NOT NULL,
        price_per_hour INTEGER NOT NULL,
        owner_id INTEGER NOT NULL REFERENCES users(id),
        amenities TEXT[],
        rating REAL
      )
    `;
    
    // Tạo bảng bookings
    await client`
      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        court_id INTEGER NOT NULL REFERENCES courts(id),
        date DATE NOT NULL,
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP NOT NULL,
        user_id INTEGER NOT NULL REFERENCES users(id),
        total_price INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending'
      )
    `;
    
    // Tạo bảng time_slots
    await client`
      CREATE TABLE IF NOT EXISTS time_slots (
        id SERIAL PRIMARY KEY,
        court_id INTEGER NOT NULL REFERENCES courts(id),
        date DATE NOT NULL,
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP NOT NULL,
        is_booked BOOLEAN DEFAULT FALSE
      )
    `;
    
    // Tạo bảng player_requests
    await client`
      CREATE TABLE IF NOT EXISTS player_requests (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        date DATE NOT NULL,
        location TEXT NOT NULL,
        time_range TEXT NOT NULL,
        message TEXT,
        status TEXT DEFAULT 'active'
      )
    `;
    
    // Tạo bảng chats
    await client`
      CREATE TABLE IF NOT EXISTS chats (
        id SERIAL PRIMARY KEY,
        sender_id INTEGER NOT NULL REFERENCES users(id),
        receiver_id INTEGER NOT NULL REFERENCES users(id),
        message TEXT NOT NULL,
        sent_at TIMESTAMP NOT NULL DEFAULT NOW(),
        read BOOLEAN DEFAULT FALSE
      )
    `;
    
    // Tạo bảng reviews
    await client`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        court_id INTEGER NOT NULL REFERENCES courts(id),
        user_id INTEGER NOT NULL REFERENCES users(id),
        rating INTEGER NOT NULL,
        comment TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;
    
    console.log("Đã khởi tạo cấu trúc cơ sở dữ liệu thành công");
  } catch (error) {
    console.error("Lỗi khi khởi tạo cấu trúc cơ sở dữ liệu:", error);
    throw error;
  }
}

// Hàm tạo dữ liệu mẫu
async function seedSampleData() {
  try {
    // Kiểm tra xem đã có người dùng nào chưa
    const existingUsers = await client`SELECT * FROM users LIMIT 1`;
    if (existingUsers.length === 0) {
      console.log("Tạo dữ liệu người dùng mẫu...");
      
      // Tạo người dùng mẫu
      const bcrypt = await import('bcrypt');
      const hashedPassword = await bcrypt.hash("password123", 10);
      
      // Tạo người dùng thường
      const user1 = await client`
        INSERT INTO users (username, password, email, name, bio, location, skill_level, is_court_owner)
        VALUES ('user1', ${hashedPassword}, 'user1@example.com', 'Người Dùng 1', 'Tôi là người chơi cầu lông từ năm 2020', 'Quận 1, TP.HCM', 'intermediate', false)
        RETURNING *
      `;
      
      // Tạo chủ sân
      const user2 = await client`
        INSERT INTO users (username, password, email, name, bio, location, skill_level, is_court_owner)
        VALUES ('owner1', ${hashedPassword}, 'owner1@example.com', 'Chủ Sân 1', 'Chủ sân cầu lông với 5 năm kinh nghiệm', 'Quận 7, TP.HCM', 'advanced', true)
        RETURNING *
      `;
      
      // Tạo sân mẫu
      if (user2.length > 0) {
        console.log("Tạo dữ liệu sân cầu lông mẫu...");
        
        const court1 = await client`
          INSERT INTO courts (name, location, description, image_url, price_per_hour, owner_id, amenities, rating)
          VALUES (
            'Green Galaxy Badminton',
            'Quận 7, TP.HCM',
            'Sân cầu lông cao cấp với 8 sân tiêu chuẩn quốc tế, ánh sáng tốt và điều hòa nhiệt độ.',
            'https://example.com/court1.jpg',
            150000,
            ${user2[0].id},
            ARRAY['Phòng thay đồ', 'WiFi miễn phí', 'Chỗ đậu xe', 'Quầy nước'],
            4.5
          )
          RETURNING *
        `;
        
        const court2 = await client`
          INSERT INTO courts (name, location, description, image_url, price_per_hour, owner_id, amenities, rating)
          VALUES (
            'Sunshine Badminton Center',
            'Quận 3, TP.HCM',
            'Trung tâm cầu lông hiện đại với 5 sân, dịch vụ cho thuê vợt và bán cầu.',
            'https://example.com/court2.jpg',
            120000,
            ${user2[0].id},
            ARRAY['Phòng thay đồ', 'Quầy bán dụng cụ', 'Máy lạnh'],
            4.2
          )
          RETURNING *
        `;
        
        // Tạo time slots
        if (court1.length > 0) {
          console.log("Tạo dữ liệu time slots mẫu...");
          
          // Tạo time slots cho sân 1 trong 7 ngày tới
          const today = new Date();
          
          for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(today.getDate() + i);
            const dateStr = date.toISOString().split('T')[0]; // Format: YYYY-MM-DD
            
            // Tạo các slot từ 7:00 đến 22:00, mỗi slot 1 giờ
            for (let hour = 7; hour < 22; hour++) {
              const startTime = new Date(date);
              startTime.setHours(hour, 0, 0, 0);
              
              const endTime = new Date(date);
              endTime.setHours(hour + 1, 0, 0, 0);
              
              await client`
                INSERT INTO time_slots (court_id, date, start_time, end_time, is_booked)
                VALUES (
                  ${court1[0].id},
                  ${dateStr},
                  ${startTime.toISOString()},
                  ${endTime.toISOString()},
                  false
                )
              `;
            }
          }
        }
        
        // Tạo yêu cầu tìm người chơi
        if (user1.length > 0) {
          console.log("Tạo dữ liệu yêu cầu tìm người chơi mẫu...");
          
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          const tomorrowStr = tomorrow.toISOString().split('T')[0];
          
          await client`
            INSERT INTO player_requests (user_id, date, location, time_range, message, status)
            VALUES (
              ${user1[0].id},
              ${tomorrowStr},
              'Quận 1, TP. Hồ Chí Minh',
              'evening',
              'Tìm bạn đánh cầu lông vào tối mai, trình độ trung bình.',
              'active'
            )
          `;
        }
      }
      
      console.log("Đã tạo dữ liệu mẫu thành công!");
    } else {
      console.log("Đã có dữ liệu người dùng, bỏ qua bước tạo dữ liệu mẫu.");
    }
  } catch (error) {
    console.error("Lỗi khi tạo dữ liệu mẫu:", error);
  }
}