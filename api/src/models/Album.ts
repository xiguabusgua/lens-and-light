import { get, all, run } from '../config/database.js';
import { Album, CreateAlbumInput, UpdateAlbumInput, Work } from '../types/index.js';

export class AlbumModel {
  static async findAll(): Promise<Album[]> {
    const query = `
      SELECT a.*, COUNT(aw.work_id) as work_count
      FROM albums a
      LEFT JOIN album_works aw ON aw.album_id = a.id
      GROUP BY a.id
      ORDER BY a.sort_order ASC, a.created_at DESC
    `;
    return await all<Album>(query);
  }

  static async findById(id: number): Promise<Album | undefined> {
    const query = 'SELECT * FROM albums WHERE id = ?';
    return await get<Album>(query, [id]);
  }

  static async findBySlug(slug: string): Promise<Album | undefined> {
    const query = `
      SELECT a.*, COUNT(aw.work_id) as work_count
      FROM albums a
      LEFT JOIN album_works aw ON aw.album_id = a.id
      WHERE a.slug = ?
      GROUP BY a.id
    `;
    return await get<Album>(query, [slug]);
  }

  static async create(input: CreateAlbumInput): Promise<Album> {
    const query = `
      INSERT INTO albums (title, slug, description, cover_url, status, sort_order)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const result = await run(query, [
      input.title,
      input.slug,
      input.description || null,
      input.cover_url || null,
      input.status || 'active',
      input.sort_order || 0
    ]);
    return (await this.findById(result.lastInsertRowid as number))!;
  }

  static async update(id: number, input: UpdateAlbumInput): Promise<Album | undefined> {
    const existing = await this.findById(id);
    if (!existing) return undefined;

    const updates: string[] = [];
    const values: any[] = [];

    if (input.title !== undefined) {
      updates.push('title = ?');
      values.push(input.title);
    }
    if (input.slug !== undefined) {
      updates.push('slug = ?');
      values.push(input.slug);
    }
    if (input.description !== undefined) {
      updates.push('description = ?');
      values.push(input.description);
    }
    if (input.cover_url !== undefined) {
      updates.push('cover_url = ?');
      values.push(input.cover_url);
    }
    if (input.status !== undefined) {
      updates.push('status = ?');
      values.push(input.status);
    }
    if (input.sort_order !== undefined) {
      updates.push('sort_order = ?');
      values.push(input.sort_order);
    }

    if (updates.length === 0) return existing;

    updates.push('updated_at = NOW()');
    values.push(id);

    const query = `UPDATE albums SET ${updates.join(', ')} WHERE id = ?`;
    await run(query, values);
    return await this.findById(id);
  }

  static async delete(id: number): Promise<boolean> {
    const query = 'DELETE FROM albums WHERE id = ?';
    const result = await run(query, [id]);
    return result.changes > 0;
  }

  static async getWorksBySlug(slug: string): Promise<Work[]> {
    const query = `
      SELECT w.* FROM works w
      INNER JOIN album_works aw ON aw.work_id = w.id
      INNER JOIN albums a ON a.id = aw.album_id
      WHERE a.slug = ?
      ORDER BY aw.sort_order ASC
    `;
    return await all<Work>(query, [slug]);
  }

  static async getWorksById(albumId: number): Promise<Work[]> {
    const query = `
      SELECT w.* FROM works w
      INNER JOIN album_works aw ON aw.work_id = w.id
      WHERE aw.album_id = ?
      ORDER BY aw.sort_order ASC
    `;
    return await all<Work>(query, [albumId]);
  }

  static async addWork(albumId: number, workId: number, sortOrder?: number): Promise<boolean> {
    const album = await this.findById(albumId);
    if (!album) return false;

    const work = await get('SELECT * FROM works WHERE id = ?', [workId]);
    if (!work) return false;

    const existing = await get(
      'SELECT * FROM album_works WHERE album_id = ? AND work_id = ?',
      [albumId, workId]
    );
    if (existing) return false;

    const query = `
      INSERT INTO album_works (album_id, work_id, sort_order)
      VALUES (?, ?, ?)
    `;
    await run(query, [albumId, workId, sortOrder ?? 0]);
    return true;
  }

  static async removeWork(albumId: number, workId: number): Promise<boolean> {
    const query = 'DELETE FROM album_works WHERE album_id = ? AND work_id = ?';
    const result = await run(query, [albumId, workId]);
    return result.changes > 0;
  }
}
