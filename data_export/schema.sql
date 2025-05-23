-- Cấu trúc cơ sở dữ liệu BadmintonHub
\n-- Cấu trúc bảng users
                                Table "public.users"
     Column     |  Type   | Collation | Nullable |              Default              
----------------+---------+-----------+----------+-----------------------------------
 id             | integer |           | not null | nextval('users_id_seq'::regclass)
 username       | text    |           | not null | 
 password       | text    |           | not null | 
 email          | text    |           | not null | 
 name           | text    |           | not null | 
 bio            | text    |           |          | 
 location       | text    |           |          | 
 skill_level    | text    |           |          | 
 is_court_owner | boolean |           |          | false
 avatar_url     | text    |           |          | 
Indexes:
    "users_pkey" PRIMARY KEY, btree (id)
    "users_email_key" UNIQUE CONSTRAINT, btree (email)
    "users_username_key" UNIQUE CONSTRAINT, btree (username)
Referenced by:
    TABLE "bookings" CONSTRAINT "bookings_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id)
    TABLE "chats" CONSTRAINT "chats_receiver_id_fkey" FOREIGN KEY (receiver_id) REFERENCES users(id)
    TABLE "chats" CONSTRAINT "chats_sender_id_fkey" FOREIGN KEY (sender_id) REFERENCES users(id)
    TABLE "courts" CONSTRAINT "courts_owner_id_fkey" FOREIGN KEY (owner_id) REFERENCES users(id)
    TABLE "player_requests" CONSTRAINT "player_requests_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id)
    TABLE "reviews" CONSTRAINT "reviews_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id)

\n-- Cấu trúc bảng courts
                                Table "public.courts"
     Column     |  Type   | Collation | Nullable |              Default               
----------------+---------+-----------+----------+------------------------------------
 id             | integer |           | not null | nextval('courts_id_seq'::regclass)
 name           | text    |           | not null | 
 location       | text    |           | not null | 
 description    | text    |           | not null | 
 image_url      | text    |           | not null | 
 price_per_hour | integer |           | not null | 
 owner_id       | integer |           | not null | 
 amenities      | text[]  |           |          | 
 rating         | real    |           |          | 
Indexes:
    "courts_pkey" PRIMARY KEY, btree (id)
Foreign-key constraints:
    "courts_owner_id_fkey" FOREIGN KEY (owner_id) REFERENCES users(id)
Referenced by:
    TABLE "bookings" CONSTRAINT "bookings_court_id_fkey" FOREIGN KEY (court_id) REFERENCES courts(id)
    TABLE "reviews" CONSTRAINT "reviews_court_id_fkey" FOREIGN KEY (court_id) REFERENCES courts(id)
    TABLE "time_slots" CONSTRAINT "time_slots_court_id_fkey" FOREIGN KEY (court_id) REFERENCES courts(id)

\n-- Cấu trúc bảng bookings
                                         Table "public.bookings"
   Column    |            Type             | Collation | Nullable |               Default                
-------------+-----------------------------+-----------+----------+--------------------------------------
 id          | integer                     |           | not null | nextval('bookings_id_seq'::regclass)
 court_id    | integer                     |           | not null | 
 date        | date                        |           | not null | 
 start_time  | timestamp without time zone |           | not null | 
 end_time    | timestamp without time zone |           | not null | 
 user_id     | integer                     |           | not null | 
 total_price | integer                     |           | not null | 
 status      | text                        |           | not null | 'pending'::text
Indexes:
    "bookings_pkey" PRIMARY KEY, btree (id)
Foreign-key constraints:
    "bookings_court_id_fkey" FOREIGN KEY (court_id) REFERENCES courts(id)
    "bookings_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id)

\n-- Cấu trúc bảng time_slots
                                        Table "public.time_slots"
   Column   |            Type             | Collation | Nullable |                Default                 
------------+-----------------------------+-----------+----------+----------------------------------------
 id         | integer                     |           | not null | nextval('time_slots_id_seq'::regclass)
 court_id   | integer                     |           | not null | 
 date       | date                        |           | not null | 
 start_time | timestamp without time zone |           | not null | 
 end_time   | timestamp without time zone |           | not null | 
 is_booked  | boolean                     |           |          | false
Indexes:
    "time_slots_pkey" PRIMARY KEY, btree (id)
Foreign-key constraints:
    "time_slots_court_id_fkey" FOREIGN KEY (court_id) REFERENCES courts(id)

\n-- Cấu trúc bảng player_requests
                              Table "public.player_requests"
   Column   |  Type   | Collation | Nullable |                   Default                   
------------+---------+-----------+----------+---------------------------------------------
 id         | integer |           | not null | nextval('player_requests_id_seq'::regclass)
 user_id    | integer |           | not null | 
 date       | date    |           | not null | 
 location   | text    |           | not null | 
 time_range | text    |           | not null | 
 message    | text    |           |          | 
 status     | text    |           |          | 'active'::text
Indexes:
    "player_requests_pkey" PRIMARY KEY, btree (id)
Foreign-key constraints:
    "player_requests_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id)

\n-- Cấu trúc bảng chats
                                         Table "public.chats"
   Column    |            Type             | Collation | Nullable |              Default              
-------------+-----------------------------+-----------+----------+-----------------------------------
 id          | integer                     |           | not null | nextval('chats_id_seq'::regclass)
 sender_id   | integer                     |           | not null | 
 receiver_id | integer                     |           | not null | 
 message     | text                        |           | not null | 
 sent_at     | timestamp without time zone |           | not null | now()
 read        | boolean                     |           |          | false
Indexes:
    "chats_pkey" PRIMARY KEY, btree (id)
Foreign-key constraints:
    "chats_receiver_id_fkey" FOREIGN KEY (receiver_id) REFERENCES users(id)
    "chats_sender_id_fkey" FOREIGN KEY (sender_id) REFERENCES users(id)

\n-- Cấu trúc bảng reviews
                                        Table "public.reviews"
   Column   |            Type             | Collation | Nullable |               Default               
------------+-----------------------------+-----------+----------+-------------------------------------
 id         | integer                     |           | not null | nextval('reviews_id_seq'::regclass)
 court_id   | integer                     |           | not null | 
 user_id    | integer                     |           | not null | 
 rating     | integer                     |           | not null | 
 comment    | text                        |           |          | 
 created_at | timestamp without time zone |           | not null | now()
Indexes:
    "reviews_pkey" PRIMARY KEY, btree (id)
Foreign-key constraints:
    "reviews_court_id_fkey" FOREIGN KEY (court_id) REFERENCES courts(id)
    "reviews_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id)

