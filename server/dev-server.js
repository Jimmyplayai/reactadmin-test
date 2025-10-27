import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

// 中间件
app.use(cors());
app.use(express.json());

// 模拟数据
const users = [
  {
    id: 1,
    username: "admin",
    password: "admin123",
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

const posts = [
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

// Token 工具
function generateToken(userId) {
  return Buffer.from(JSON.stringify({ userId, exp: Date.now() + 24 * 60 * 60 * 1000 })).toString('base64');
}

function verifyToken(token) {
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    if (decoded.exp < Date.now()) {
      return null;
    }
    return { userId: decoded.userId };
  } catch {
    return null;
  }
}

// 认证中间件
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: '未授权' });
  }

  const token = authHeader.substring(7);
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ message: 'Token 无效或已过期' });
  }

  req.userId = decoded.userId;
  next();
}

// ============ 认证 API ============
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: '请输入用户名和密码' });
  }

  const user = users.find((u) => u.username === username && u.password === password);

  if (!user) {
    return res.status(401).json({ message: '用户名或密码错误' });
  }

  const token = generateToken(user.id);

  return res.status(200).json({
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
    },
  });
});

// ============ Users API ============
app.get('/api/users', authMiddleware, (req, res) => {
  const { _start, _end, _sort, _order, id } = req.query;

  // 单个用户
  if (id) {
    const user = users.find((u) => u.id === Number(id));
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    const { password, ...userWithoutPassword } = user;
    return res.status(200).json(userWithoutPassword);
  }

  // 用户列表
  let result = users.map(({ password, ...user }) => user);

  // 排序
  if (_sort && _order) {
    result.sort((a, b) => {
      if (_order === 'ASC') {
        return a[_sort] > b[_sort] ? 1 : -1;
      } else {
        return a[_sort] < b[_sort] ? 1 : -1;
      }
    });
  }

  // 分页
  const start = Number(_start) || 0;
  const end = Number(_end) || result.length;
  const paginatedResult = result.slice(start, end);

  res.setHeader('Content-Range', `users ${start}-${end}/${result.length}`);
  res.setHeader('Access-Control-Expose-Headers', 'Content-Range');

  return res.status(200).json(paginatedResult);
});

app.post('/api/users', authMiddleware, (req, res) => {
  const newUser = {
    id: users.length + 1,
    ...req.body,
  };
  users.push(newUser);

  const { password, ...userWithoutPassword } = newUser;
  return res.status(201).json(userWithoutPassword);
});

app.put('/api/users', authMiddleware, (req, res) => {
  const { id } = req.query;
  const userIndex = users.findIndex((u) => u.id === Number(id));

  if (userIndex === -1) {
    return res.status(404).json({ message: '用户不存在' });
  }

  users[userIndex] = { ...users[userIndex], ...req.body };

  const { password, ...userWithoutPassword } = users[userIndex];
  return res.status(200).json(userWithoutPassword);
});

app.delete('/api/users', authMiddleware, (req, res) => {
  const { id } = req.query;
  const userIndex = users.findIndex((u) => u.id === Number(id));

  if (userIndex === -1) {
    return res.status(404).json({ message: '用户不存在' });
  }

  const deletedUser = users.splice(userIndex, 1)[0];
  const { password, ...userWithoutPassword } = deletedUser;

  return res.status(200).json(userWithoutPassword);
});

// ============ Posts API ============
app.get('/api/posts', authMiddleware, (req, res) => {
  const { _start, _end, _sort, _order, id } = req.query;

  // 单个帖子
  if (id) {
    const post = posts.find((p) => p.id === Number(id));
    if (!post) {
      return res.status(404).json({ message: '帖子不存在' });
    }
    return res.status(200).json(post);
  }

  // 帖子列表
  let result = [...posts];

  // 排序
  if (_sort && _order) {
    result.sort((a, b) => {
      if (_order === 'ASC') {
        return a[_sort] > b[_sort] ? 1 : -1;
      } else {
        return a[_sort] < b[_sort] ? 1 : -1;
      }
    });
  }

  // 分页
  const start = Number(_start) || 0;
  const end = Number(_end) || result.length;
  const paginatedResult = result.slice(start, end);

  res.setHeader('Content-Range', `posts ${start}-${end}/${result.length}`);
  res.setHeader('Access-Control-Expose-Headers', 'Content-Range');

  return res.status(200).json(paginatedResult);
});

app.post('/api/posts', authMiddleware, (req, res) => {
  const newPost = {
    id: posts.length + 1,
    ...req.body,
  };
  posts.push(newPost);

  return res.status(201).json(newPost);
});

app.put('/api/posts', authMiddleware, (req, res) => {
  const { id } = req.query;
  const postIndex = posts.findIndex((p) => p.id === Number(id));

  if (postIndex === -1) {
    return res.status(404).json({ message: '帖子不存在' });
  }

  posts[postIndex] = { ...posts[postIndex], ...req.body };

  return res.status(200).json(posts[postIndex]);
});

app.delete('/api/posts', authMiddleware, (req, res) => {
  const { id } = req.query;
  const postIndex = posts.findIndex((p) => p.id === Number(id));

  if (postIndex === -1) {
    return res.status(404).json({ message: '帖子不存在' });
  }

  const deletedPost = posts.splice(postIndex, 1)[0];

  return res.status(200).json(deletedPost);
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`\n✅ API 服务器运行在 http://localhost:${PORT}`);
  console.log(`📝 测试账号：`);
  console.log(`   - admin / admin123`);
  console.log(`   - user / user123\n`);
});
