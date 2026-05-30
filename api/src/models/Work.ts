import { get, all, run, transaction } from '../config/database.js';
import { Work, CreateWorkInput, UpdateWorkInput, ReorderItem, PaginatedResponse, Tag } from '../types/index.js';

export class WorkModel {
  static async findAll(params: {
    category?: string;
    featured?: string;
    status?: string;
    sort?: string;
    order?: 'asc' | 'desc';
    page?: number;
    limit?: number;
    search?: string;
    tag?: string;
  }): Promise<PaginatedResponse<Work>> {
    const {
      category,
      featured,
      status,
      sort = 'sort_order',
      order = 'asc',
      page = 1,
      limit = 20,
      search,
      tag
    } = params;

    let whereConditions: string[] = [];
    let whereValues: any[] = [];

    if (category && category !== 'all') {
      whereConditions.push('category = ?');
      whereValues.push(category);
    }

    if (featured === 'true') {
      whereConditions.push('featured = 1');
    }

    if (status) {
      whereConditions.push('status = ?');
      whereValues.push(status);
    }

    if (search && search.trim()) {
      whereConditions.push('(title LIKE ? OR description LIKE ?)');
      const searchPattern = `%${search.trim()}%`;
      whereValues.push(searchPattern, searchPattern);
    }

    if (tag && tag.trim()) {
      whereConditions.push(`id IN (
        SELECT wt.work_id FROM work_tags wt
        INNER JOIN tags t ON t.id = wt.tag_id
        WHERE t.slug = ?
      )`);
      whereValues.push(tag.trim());
    }

    const whereClause = whereConditions.length > 0
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    const countQuery = `SELECT COUNT(*) as total FROM works ${whereClause}`;
    const countResult = await get<{ total: number }>(countQuery, whereValues.length > 0 ? whereValues : undefined);
    const total = countResult?.total ?? 0;

    const offset = (page - 1) * limit;
    const allowedSortFields = ['sort_order', 'created_at', 'updated_at', 'title', 'featured'];
    const safeSortField = allowedSortFields.includes(sort) ? sort : 'sort_order';
    const safeOrder = order === 'desc' ? 'DESC' : 'ASC';

    const query = `
      SELECT * FROM works ${whereClause}
      ORDER BY ${safeSortField} ${safeOrder}
      LIMIT ? OFFSET ?
    `;

    const dataParams = [...whereValues, limit, offset];
    const data = await all<Work>(query, dataParams);

    await Promise.all(data.map(async (work) => {
      work.tag_list = await WorkModel.getWorkTags(work.id);
    }));

    return {
      success: true,
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  static async findById(id: number): Promise<Work | undefined> {
    const query = 'SELECT * FROM works WHERE id = ?';
    const work = await get<Work>(query, [id]);
    if (work) {
      work.tag_list = await WorkModel.getWorkTags(work.id);
    }
    return work;
  }

  private static async getWorkTags(workId: number): Promise<Tag[]> {
    const query = `
      SELECT t.* FROM tags t
      INNER JOIN work_tags wt ON wt.tag_id = t.id
      WHERE wt.work_id = ?
      ORDER BY t.name ASC
    `;
    return all<Tag>(query, [workId]);
  }

  static async create(input: CreateWorkInput): Promise<Work> {
    const tagsJson = input.tags ? JSON.stringify(input.tags) : null;

    const query = `
      INSERT INTO works (
        title, category, image_url, description, story,
        camera, lens, aperture, shutter, iso, location, date,
        featured, status, tags
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await run(query, [
      input.title,
      input.category,
      input.image_url,
      input.description || null,
      input.story || null,
      input.camera || null,
      input.lens || null,
      input.aperture || null,
      input.shutter || null,
      input.iso || null,
      input.location || null,
      input.date || null,
      input.featured ? 1 : 0,
      input.status || 'active',
      tagsJson
    ]);

    return (await WorkModel.findById(result.lastInsertRowid as number))!;
  }

  static async update(id: number, input: UpdateWorkInput): Promise<Work | undefined> {
    const existing = await WorkModel.findById(id);
    if (!existing) return undefined;

    const updates: string[] = [];
    const values: any[] = [];

    if (input.title !== undefined) {
      updates.push('title = ?');
      values.push(input.title);
    }
    if (input.category !== undefined) {
      updates.push('category = ?');
      values.push(input.category);
    }
    if (input.image_url !== undefined) {
      updates.push('image_url = ?');
      values.push(input.image_url);
    }
    if (input.thumbnail_url !== undefined) {
      updates.push('thumbnail_url = ?');
      values.push(input.thumbnail_url);
    }
    if (input.description !== undefined) {
      updates.push('description = ?');
      values.push(input.description);
    }
    if (input.story !== undefined) {
      updates.push('story = ?');
      values.push(input.story);
    }
    if (input.camera !== undefined) {
      updates.push('camera = ?');
      values.push(input.camera);
    }
    if (input.lens !== undefined) {
      updates.push('lens = ?');
      values.push(input.lens);
    }
    if (input.aperture !== undefined) {
      updates.push('aperture = ?');
      values.push(input.aperture);
    }
    if (input.shutter !== undefined) {
      updates.push('shutter = ?');
      values.push(input.shutter);
    }
    if (input.iso !== undefined) {
      updates.push('iso = ?');
      values.push(input.iso);
    }
    if (input.location !== undefined) {
      updates.push('location = ?');
      values.push(input.location);
    }
    if (input.date !== undefined) {
      updates.push('date = ?');
      values.push(input.date);
    }
    if (input.featured !== undefined) {
      updates.push('featured = ?');
      values.push(input.featured ? 1 : 0);
    }
    if (input.sort_order !== undefined) {
      updates.push('sort_order = ?');
      values.push(input.sort_order);
    }
    if (input.status !== undefined) {
      updates.push('status = ?');
      values.push(input.status);
    }
    if (input.tags !== undefined) {
      updates.push('tags = ?');
      values.push(JSON.stringify(input.tags));
    }

    updates.push('updated_at = NOW()');
    values.push(id);

    const query = `UPDATE works SET ${updates.join(', ')} WHERE id = ?`;
    await run(query, values);

    return WorkModel.findById(id);
  }

  static async delete(id: number): Promise<boolean> {
    const query = 'DELETE FROM works WHERE id = ?';
    const result = await run(query, [id]);
    return result.changes > 0;
  }

  static async reorder(orders: ReorderItem[]): Promise<void> {
    await transaction(async (conn) => {
      for (const item of orders) {
        await conn.execute('UPDATE works SET sort_order = ? WHERE id = ?', [item.sort_order, item.id]);
      }
    });
  }

  static async getFeatured(): Promise<Work[]> {
    const query = 'SELECT * FROM works WHERE featured = 1 AND status = \'active\' ORDER BY sort_order ASC';
    return all<Work>(query);
  }

  static async getByCategory(category: string): Promise<Work[]> {
    const query = 'SELECT * FROM works WHERE category = ? AND status = \'active\' ORDER BY sort_order ASC';
    return all<Work>(query, [category]);
  }
}
