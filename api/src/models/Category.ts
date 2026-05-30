import { get, all, run } from '../config/database.js';
import { Category, CreateCategoryInput, UpdateCategoryInput } from '../types/index.js';

export class CategoryModel {
  static async findAll(): Promise<Category[]> {
    const query = `
      SELECT c.*, COUNT(w.id) as work_count
      FROM categories c
      LEFT JOIN works w ON w.category = c.slug
      GROUP BY c.id
      ORDER BY c.sort_order ASC
    `;
    return await all<Category>(query);
  }

  static async findById(id: number): Promise<Category | undefined> {
    const query = 'SELECT * FROM categories WHERE id = ?';
    return await get<Category>(query, [id]);
  }

  static async findBySlug(slug: string): Promise<Category | undefined> {
    const query = 'SELECT * FROM categories WHERE slug = ?';
    return await get<Category>(query, [slug]);
  }

  static async create(input: CreateCategoryInput): Promise<Category> {
    const query = `
      INSERT INTO categories (name, slug, description, icon, sort_order)
      VALUES (?, ?, ?, ?, ?)
    `;
    const result = await run(query, [
      input.name,
      input.slug,
      input.description || null,
      input.icon || 'Grid3X3',
      input.sort_order || 0
    ]);
    return (await this.findById(result.lastInsertRowid as number))!;
  }

  static async update(id: number, input: UpdateCategoryInput): Promise<Category | undefined> {
    const existing = await this.findById(id);
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
    await run(query, values);
    return await this.findById(id);
  }

  static async delete(id: number): Promise<boolean> {
    const query = 'DELETE FROM categories WHERE id = ?';
    const result = await run(query, [id]);
    return result.changes > 0;
  }
}
