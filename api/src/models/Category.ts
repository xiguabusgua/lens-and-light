import db from '../config/database.js';
import { Category, CreateCategoryInput, UpdateCategoryInput } from '../types/index.js';

export class CategoryModel {
  static findAll(): Category[] {
    const query = `
      SELECT c.*, COUNT(w.id) as work_count
      FROM categories c
      LEFT JOIN works w ON w.category = c.slug
      GROUP BY c.id
      ORDER BY c.sort_order ASC
    `;
    return db.prepare(query).all() as Category[];
  }

  static findById(id: number): Category | undefined {
    const query = 'SELECT * FROM categories WHERE id = ?';
    return db.prepare(query).get(id) as Category | undefined;
  }

  static findBySlug(slug: string): Category | undefined {
    const query = 'SELECT * FROM categories WHERE slug = ?';
    return db.prepare(query).get(slug) as Category | undefined;
  }

  static create(input: CreateCategoryInput): Category {
    const query = `
      INSERT INTO categories (name, slug, description, icon, sort_order)
      VALUES (?, ?, ?, ?, ?)
    `;
    const result = db.prepare(query).run(
      input.name,
      input.slug,
      input.description || null,
      input.icon || 'Grid3X3',
      input.sort_order || 0
    );
    return this.findById(result.lastInsertRowid as number)!;
  }

  static update(id: number, input: UpdateCategoryInput): Category | undefined {
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
    if (input.description !== undefined) {
      updates.push('description = ?');
      values.push(input.description);
    }
    if (input.icon !== undefined) {
      updates.push('icon = ?');
      values.push(input.icon);
    }
    if (input.sort_order !== undefined) {
      updates.push('sort_order = ?');
      values.push(input.sort_order);
    }

    if (updates.length === 0) return existing;

    values.push(id);
    const query = `UPDATE categories SET ${updates.join(', ')} WHERE id = ?`;
    db.prepare(query).run(...values);
    return this.findById(id);
  }

  static delete(id: number): boolean {
    const query = 'DELETE FROM categories WHERE id = ?';
    const result = db.prepare(query).run(id);
    return result.changes > 0;
  }
}