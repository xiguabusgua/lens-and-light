import { Request, Response, NextFunction } from 'express';

const MAX_LENGTHS: Record<string, number> = {
  title: 200,
  description: 5000,
  story: 10000,
  bio: 10000,
  camera: 100,
  lens: 100,
  aperture: 20,
  shutter: 30,
  iso: 20,
  location: 200,
  name: 100,
  slug: 100,
  username: 50,
  password: 100,
  email: 200,
  message: 5000,
  cover_description: 500,
};

export function validateInputLengths(req: Request, res: Response, next: NextFunction): void {
  for (const [field, maxLen] of Object.entries(MAX_LENGTHS)) {
    const value = req.body[field];
    if (typeof value === 'string' && value.length > maxLen) {
      res.status(400).json({ error: `字段 "${field}" 超过最大长度限制 ${maxLen} 字符` });
      return;
    }
  }
  next();
}
