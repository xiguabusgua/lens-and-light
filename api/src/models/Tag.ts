import db from '../config/database.js';
import { Tag, CreateTagInput, UpdateTagInput } from '../types/index.js';

export class TagModel {
  static findAll(search?: string): Tag[] {
    let query = 'SELECT * FROM tags';
    let values: any[] = [];

    if (search) {
      query += ' WHERE name LIKE ? OR slug LIKE ?';
      values = [`%${search}%`, `%${search}%`];
    }

    query += ' ORDER BY usage_count DESC, name ASC';
    return db.prepare(query).all(...values) as Tag[];
  }

  static findById(id: number): Tag | undefined {
    const query = 'SELECT * FROM tags WHERE id = ?';
    return db.prepare(query).get(id) as Tag | undefined;
  }

  static findByName(name: string): Tag | undefined {
    const query = 'SELECT * FROM tags WHERE name = ?';
    return db.prepare(query).get(name) as Tag | undefined;
  }

  static findBySlug(slug: string): Tag | undefined {
    const query = 'SELECT * FROM tags WHERE slug = ?';
    return db.prepare(query).get(slug) as Tag | undefined;
  }

  static create(input: CreateTagInput): Tag | null {
    const existing = this.findByName(input.name);
    if (existing) return null;

    const query = `
      INSERT INTO tags (name, slug, usage_count)
      VALUES (?, ?, 0)
    `;
    try {
      const result = db.prepare(query).run(input.name, input.slug);
      return this.findById(result.lastInsertRowid as number)!;
    } catch {
      return null;
    }
  }

  static update(id: number, input: UpdateTagInput): Tag | undefined {
    const existing = this.findById(id);
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
    db.prepare(query).run(...values);
    return this.findById(id);
  }

  static delete(id: number): boolean {
    const query = 'DELETE FROM tags WHERE id = ?';
    const result = db.prepare(query).run(id);
    return result.changes > 0;
  }

  static getWorkTags(workId: number): Tag[] {
    const query = `
      SELECT t.* FROM tags t
      INNER JOIN work_tags wt ON wt.tag_id = t.id
      WHERE wt.work_id = ?
      ORDER BY t.name ASC
    `;
    return db.prepare(query).all(workId) as Tag[];
  }

  static setWorkTags(workId: number, tagIds: number[]): void {
    const deleteQuery = 'DELETE FROM work_tags WHERE work_id = ?';
    const insertQuery = 'INSERT OR IGNORE INTO work_tags (work_id, tag_id) VALUES (?, ?)';

    const transaction = db.transaction(() => {
      db.prepare(deleteQuery).run(workId);
      for (const tagId of tagIds) {
        db.prepare(insertQuery).run(workId, tagId);
      }
    });

    transaction();
  }

  static incrementUsageCount(id: number): void {
    const query = 'UPDATE tags SET usage_count = usage_count + 1 WHERE id = ?';
    db.prepare(query).run(id);
  }

  static decrementUsageCount(id: number): void {
    const query = 'UPDATE tags SET usage_count = MAX(0, usage_count - 1) WHERE id = ?';
    db.prepare(query).run(id);
  }
}