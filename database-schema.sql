-- MySQL Schema 設計
-- 對應前端型別定義，未來可直接用 Prisma 或手寫 SQL 實作

-- 使用者表
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  avatar_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 對話表
CREATE TABLE conversations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 對話參與者表（多對多關係）
CREATE TABLE conversation_participants (
  id INT PRIMARY KEY AUTO_INCREMENT,
  conversation_id INT NOT NULL,
  user_id INT NOT NULL,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_participant (conversation_id, user_id),
  INDEX idx_conversation_id (conversation_id),
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 訊息表
CREATE TABLE messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  conversation_id INT NOT NULL,
  sender_id INT NULL, -- NULL 表示系統訊息
  type ENUM('text', 'system') NOT NULL DEFAULT 'text',
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_conversation_created (conversation_id, created_at),
  INDEX idx_sender_id (sender_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 訊息反應表
CREATE TABLE message_reactions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  message_id INT NOT NULL,
  user_id INT NOT NULL,
  type ENUM('like', 'love', 'laugh') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_reaction (message_id, user_id, type),
  INDEX idx_message_id (message_id),
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 查詢範例：

-- 1. 取得對話列表（包含最後訊息）
-- SELECT 
--   c.id,
--   c.created_at,
--   u.id as other_user_id,
--   u.name as other_user_name,
--   u.avatar_url as other_user_avatar,
--   m.content as last_message_content,
--   m.created_at as last_message_time,
--   m.type as last_message_type
-- FROM conversations c
-- INNER JOIN conversation_participants cp1 ON c.id = cp1.conversation_id AND cp1.user_id = 1
-- INNER JOIN conversation_participants cp2 ON c.id = cp2.conversation_id AND cp2.user_id != 1
-- INNER JOIN users u ON cp2.user_id = u.id
-- LEFT JOIN (
--   SELECT conversation_id, content, created_at, type,
--          ROW_NUMBER() OVER (PARTITION BY conversation_id ORDER BY created_at DESC) as rn
--   FROM messages
-- ) m ON c.id = m.conversation_id AND m.rn = 1
-- ORDER BY COALESCE(m.created_at, c.created_at) DESC;

-- 2. 取得聊天室資料（訊息 + 反應）
-- SELECT 
--   m.*,
--   JSON_ARRAYAGG(
--     JSON_OBJECT(
--       'id', mr.id,
--       'userId', mr.user_id,
--       'type', mr.type
--     )
--   ) as reactions
-- FROM messages m
-- LEFT JOIN message_reactions mr ON m.id = mr.message_id
-- WHERE m.conversation_id = ?
-- GROUP BY m.id
-- ORDER BY m.created_at ASC;
