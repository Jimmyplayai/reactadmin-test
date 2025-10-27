import type { VercelRequest, VercelResponse } from '@vercel/node';
import { users, verifyToken } from './db';

export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Range');

  // 处理 OPTIONS 请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // 验证 token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: '未授权' });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: 'Token 无效或已过期' });
    }

    // 处理不同的 HTTP 方法
    switch (req.method) {
      case 'GET':
        return handleGet(req, res);
      case 'POST':
        return handlePost(req, res);
      case 'PUT':
        return handlePut(req, res);
      case 'DELETE':
        return handleDelete(req, res);
      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('Users API error:', error);
    return res.status(500).json({
      message: '服务器错误',
      error: error.message
    });
  }
}

// 获取用户列表（支持分页、排序、过滤）
function handleGet(req: VercelRequest, res: VercelResponse) {
  const { _start, _end, _sort, _order, id } = req.query;

  // 如果有 id 参数，返回单个用户
  if (id) {
    const user = users.find((u) => u.id === Number(id));
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    // 不返回密码
    const { password, ...userWithoutPassword } = user;
    return res.status(200).json(userWithoutPassword);
  }

  // 返回用户列表
  let result = users.map(({ password, ...user }) => user);

  // 排序
  if (_sort && _order) {
    const sortField = _sort as string;
    const sortOrder = _order as string;
    result.sort((a: any, b: any) => {
      if (sortOrder === 'ASC') {
        return a[sortField] > b[sortField] ? 1 : -1;
      } else {
        return a[sortField] < b[sortField] ? 1 : -1;
      }
    });
  }

  // 分页
  const start = Number(_start) || 0;
  const end = Number(_end) || result.length;
  const paginatedResult = result.slice(start, end);

  // React Admin 需要 Content-Range 头来处理分页
  res.setHeader('Content-Range', `users ${start}-${end}/${result.length}`);
  res.setHeader('Access-Control-Expose-Headers', 'Content-Range');

  return res.status(200).json(paginatedResult);
}

// 创建用户
function handlePost(req: VercelRequest, res: VercelResponse) {
  const newUser = {
    id: users.length + 1,
    ...req.body,
  };
  users.push(newUser);

  const { password, ...userWithoutPassword } = newUser;
  return res.status(201).json(userWithoutPassword);
}

// 更新用户
function handlePut(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;
  const userIndex = users.findIndex((u) => u.id === Number(id));

  if (userIndex === -1) {
    return res.status(404).json({ message: '用户不存在' });
  }

  users[userIndex] = { ...users[userIndex], ...req.body };

  const { password, ...userWithoutPassword } = users[userIndex];
  return res.status(200).json(userWithoutPassword);
}

// 删除用户
function handleDelete(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;
  const userIndex = users.findIndex((u) => u.id === Number(id));

  if (userIndex === -1) {
    return res.status(404).json({ message: '用户不存在' });
  }

  const deletedUser = users.splice(userIndex, 1)[0];
  const { password, ...userWithoutPassword } = deletedUser;

  return res.status(200).json(userWithoutPassword);
}
