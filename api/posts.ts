import type { VercelRequest, VercelResponse } from '@vercel/node';
import { posts, verifyToken } from './db.js';

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
    console.error('Posts API error:', error);
    return res.status(500).json({
      message: '服务器错误',
      error: error.message
    });
  }
}

// 获取帖子列表（支持分页、排序、过滤）
function handleGet(req: VercelRequest, res: VercelResponse) {
  const { _start, _end, _sort, _order, id } = req.query;

  // 如果有 id 参数，返回单个帖子
  if (id) {
    const post = posts.find((p) => p.id === Number(id));
    if (!post) {
      return res.status(404).json({ message: '帖子不存在' });
    }
    return res.status(200).json(post);
  }

  // 返回帖子列表
  let result = [...posts];

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
  res.setHeader('Content-Range', `posts ${start}-${end}/${result.length}`);
  res.setHeader('Access-Control-Expose-Headers', 'Content-Range');

  return res.status(200).json(paginatedResult);
}

// 创建帖子
function handlePost(req: VercelRequest, res: VercelResponse) {
  const newPost = {
    id: posts.length + 1,
    ...req.body,
  };
  posts.push(newPost);

  return res.status(201).json(newPost);
}

// 更新帖子
function handlePut(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;
  const postIndex = posts.findIndex((p) => p.id === Number(id));

  if (postIndex === -1) {
    return res.status(404).json({ message: '帖子不存在' });
  }

  posts[postIndex] = { ...posts[postIndex], ...req.body };

  return res.status(200).json(posts[postIndex]);
}

// 删除帖子
function handleDelete(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;
  const postIndex = posts.findIndex((p) => p.id === Number(id));

  if (postIndex === -1) {
    return res.status(404).json({ message: '帖子不存在' });
  }

  const deletedPost = posts.splice(postIndex, 1)[0];

  return res.status(200).json(deletedPost);
}
