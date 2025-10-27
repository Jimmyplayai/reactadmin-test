// 模拟数据库
// 实际项目中应该连接真实数据库（如 PostgreSQL, MongoDB 等）

export interface User {
  id: number;
  username: string;
  password: string; // 实际项目中应该存储加密后的密码
  email: string;
  name: string;
}

export interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
}

// 模拟用户数据
export const users: User[] = [
  {
    id: 1,
    username: "admin",
    password: "admin123", // 实际应该使用 bcrypt 加密
    email: "admin@example.com",
    name: "管理员",
  },
  {
    id: 2,
    username: "user",
    password: "user123",
    email: "user@example.com",
    name: "普通用户",
  },
];

// 模拟帖子数据
export const posts: Post[] = [
  {
    id: 1,
    title: "Hello World",
    body: "This is my first post",
    userId: 1,
  },
  {
    id: 2,
    title: "Second Post",
    body: "This is my second post",
    userId: 1,
  },
  {
    id: 3,
    title: "User Post",
    body: "Post from regular user",
    userId: 2,
  },
];

// 生成 JWT Token 的简单实现
// 实际项目中应该使用 jsonwebtoken 库
export function generateToken(userId: number): string {
  return Buffer.from(JSON.stringify({ userId, exp: Date.now() + 24 * 60 * 60 * 1000 })).toString('base64');
}

// 验证 Token
export function verifyToken(token: string): { userId: number } | null {
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    if (decoded.exp < Date.now()) {
      return null; // Token 过期
    }
    return { userId: decoded.userId };
  } catch {
    return null;
  }
}
