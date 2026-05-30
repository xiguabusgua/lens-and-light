import db from '../config/database.js';
import { Album, CreateAlbumInput, UpdateAlbumInput, Work } from '../types/index.js';

export class AlbumModel {
  static findAll(): Album[] {
    const query = `
      SELECT a.*, COUNT(aw.work_id) as work_count
      FROM albums a
      LEFT JOIN album_works aw ON aw.album_id = a.id
      GROUP BY a.id
      ORDER BY a.sort_order ASC, a.created_at DESC
    `;
    return db.prepare(query).all() as Album[];
  }

  static findById(id: number): Album | undefined {
    const query = 'SELECT * FROM albums WHERE id = ?';
    return db.prepare(query).get(id) as Album | undefined;
  }

  static findBySlug(slug: string): Album | undefined {
    const query = `
      SELECT a.*, COUNT(aw.work_id) as work_count
      FROM albums a
      LEFT JOIN album_works aw ON aw.album_id = a.id
      WHERE a.slug = ?
      GROUP BY a.id
    `;
    return db.prepare(query).get(slug) as Album | undefined;
  }

  static create(input: CreateAlbumInput): Album {
    const query = `
      INSERT INTO albums (title, slug, description, cover_url, status, sort_order)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const result = db.prepare(query).run(
      input.title,
      input.slug,
      input.description || null,
      input.cover_url || null,
      input.status || 'active',
      input.sort_order || 0
    );
    return this.findById(result.lastInsertRowid as number)!;
  }

  static update(id: number, input: UpdateAlbumInput): Album | undefined {
    const existing = this.findById(id);
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

    updates.push("updated_at = datetime('now')");
    values.push(id);

    const query = `UPDATE albums SET ${updates.join(', ')} WHERE id = ?`;
    db.prepare(query).run(...values);
    return this.findById(id);
  }

  static delete(id: number): boolean {
    const query = 'DELETE FROM albums WHERE id = ?';
    const result = db.prepare(query).run(id);
    return result.changes > 0;
  }

  static getWorksBySlug(slug: string): Work[] {
    const query = `
      SELECT w.* FROM works w
      INNER JOIN album_works aw ON aw.work_id = w.id
      INNER JOIN albums a ON a.id = aw.album_id
      WHERE a.slug = ?
      ORDER BY aw.sort_order ASC
    `;
    return db.prepare(query).all(slug) as Work[];
  }

  static getWorksById(albumId: number): Work[] {
    const query = `
      SELECT w.* FROM works w
      INNER JOIN album_works aw ON aw.work_id = w.id
      WHERE aw.album_id = ?
      ORDER BY aw.sort_order ASC
    `;
    return db.prepare(query).all(albumId) as Work[];
  }

  static addWork(albumId: number, workId: number, sortOrder?: number): boolean {
    const album = this.findById(albumId);
    if (!album) return false;

    const work = db.prepare('SELECT * FROM works WHERE id = ?').get(workId);
    if (!work) return false;

    const existing = db.prepare(
      'SELECT * FROM album_works WHERE album_id = ? AND work_id = ?'
    ).get(albumId, workId);
    if (existing) return false;

    const query = `
      INSERT INTO album_works (album_id, work_id, sort_order)
      VALUES (?, ?, ?)
    `;
    db.prepare(query).run(albumId, workId, sortOrder ?? 0);
    return true;
  }

  static removeWork(albumId: number, workId: number): boolean {
    const query = 'DELETE FROM album_works WHERE album_id = ? AND work_id = ?';
    const result = db.prepare(query).run(albumId, workId);
    return result.changes > 0;
  }
}
