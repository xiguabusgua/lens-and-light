import { get, all, run, transaction } from '../config/database.js';
import { Tag, CreateTagInput, UpdateTagInput } from '../types/index.js';

export class TagModel {
  static async findAll(search?: string): Promise<Tag[]> {
    let query = 'SELECT * FROM tags';
    let values: any[] = [];

    if (search) {
      query += ' WHERE name LIKE ? OR slug LIKE ?';
      values = [`%${search}%`, `%${search}%`];
    }

    query += ' ORDER BY usage_count DESC, name ASC';
    return all<Tag>(query, values.length > 0 ? values : undefined);
  }

  static async findById(id: number): Promise<Tag | undefined> {
    const query = 'SELECT * FROM tags WHERE id = ?';
    return get<Tag>(query, [id]);
  }

  static async findByName(name: string): Promise<Tag | undefined> {
    const query = 'SELECT * FROM tags WHERE name = ?';
    return get<Tag>(query, [name]);
  }

  static async findBySlug(slug: string): Promise<Tag | undefined> {
    const query = 'SELECT * FROM tags WHERE slug = ?';
    return get<Tag>(query, [slug]);
  }

  static async create(input: CreateTagInput): Promise<Tag | null> {
    const existing = await TagModel.findByName(input.name);
    if (existing) return null;

    const query = `
      INSERT INTO tags (name, slug, usage_count)
      VALUES (?, ?, 0)
    `;
    try {
      const result = await run(query, [input.name, input.slug]);
      return (await TagModel.findById(result.lastInsertRowid as number))!;
    } catch {
      return null;
    }
  }

  static async update(id: number, input: UpdateTagInput): Promise<Tag | undefined> {
    const existing = await TagModel.findById(id);
    if (!existing) return undefined;

    const updates: string[] = [];
    const values: any[] = [];

    if (input.name !== undefined) {
      updates.push('name = ?');
      values.push(input.name);
    }
    if (input.slug !== undefined) {
      updates.push('slug = ?');
      values.push(input.slug);
    }

    if (updates.length === 0) return existing;

    values.push(id);
    const query = `UPDATE tags SET ${updates.join(', ')} WHERE id = ?`;
    await run(query, values);
    return TagModel.findById(id);
  }

  static async delete(id: number): Promise<boolean> {
    const query = 'DELETE FROM tags WHERE id = ?';
    const result = await run(query, [id]);
    return result.changes > 0;
  }

  static async getWorkTags(workId: number): Promise<Tag[]> {
    const query = `
      SELECT t.* FROM tags t
      INNER JOIN work_tags wt ON wt.tag_id = t.id
      WHERE wt.work_id = ?
      ORDER BY t.name ASC
    `;
    return all<Tag>(query, [workId]);
  }

  static async setWorkTags(workId: number, tagIds: number[]): Promise<void> {
    await transaction(async (conn) => {
      await conn.execute('DELETE FROM work_tags WHERE work_id = ?', [workId]);
      for (const tagId of tagIds) {
        await conn.execute('INSERT IGNORE INTO work_tags (work_id, tag_id) VALUES (?, ?)', [workId, tagId]);
      }
    });
  }

  static async incrementUsageCount(id: number): Promise<void> {
    const query = 'UPDATE tags SET usage_count = usage_count + 1 WHERE id = ?';
    await run(query, [id]);
  }

  static async decrementUsageCount(id: number): Promise<void> {
    const query = 'UPDATE tags SET usage_count = GREATEST(0, usage_count - 1) WHERE id = ?';
    await run(query, [id]);
  }
}
