import { get, all, run, transaction } from '../config/database.js';

export interface HeroSlide {
  id: number;
  title: string;
  subtitle: string | null;
  image_url: string;
  description: string | null;
  button_text: string | null;
  button_link: string | null;
  transition_effect: string;
  transition_speed: number;
  autoplay_delay: number;
  sort_order: number;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface CreateHeroSlideInput {
  title: string;
  subtitle?: string;
  image_url: string;
  description?: string;
  button_text?: string;
  button_link?: string;
  transition_effect?: string;
  transition_speed?: number;
  autoplay_delay?: number;
  sort_order?: number;
  is_active?: number;
}

export interface UpdateHeroSlideInput {
  title?: string;
  subtitle?: string;
  image_url?: string;
  description?: string;
  button_text?: string;
  button_link?: string;
  transition_effect?: string;
  transition_speed?: number;
  autoplay_delay?: number;
  sort_order?: number;
  is_active?: number;
}

export class HeroSlideModel {
  static async findAll(params: {
    status?: string;
    sort?: string;
    order?: 'asc' | 'desc';
  }): Promise<HeroSlide[]> {
    const {
      status,
      sort = 'sort_order',
      order = 'asc'
    } = params;

    let whereConditions: string[] = [];
    let whereValues: any[] = [];

    if (status === 'active') {
      whereConditions.push('is_active = 1');
    }

    const whereClause = whereConditions.length > 0
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    const allowedSortFields = ['sort_order', 'created_at', 'updated_at', 'title'];
    const safeSortField = allowedSortFields.includes(sort) ? sort : 'sort_order';
    const safeOrder = order === 'desc' ? 'DESC' : 'ASC';

    const query = `
      SELECT * FROM hero_slides ${whereClause}
      ORDER BY ${safeSortField} ${safeOrder}
    `;

    return all<HeroSlide>(query, whereValues);
  }

  static async findById(id: number): Promise<HeroSlide | undefined> {
    const query = 'SELECT * FROM hero_slides WHERE id = ?';
    return get<HeroSlide>(query, [id]);
  }

  static async create(input: CreateHeroSlideInput): Promise<HeroSlide> {
    const query = `
      INSERT INTO hero_slides (
        title, subtitle, image_url, description,
        button_text, button_link, transition_effect,
        transition_speed, autoplay_delay, sort_order, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await run(query, [
      input.title,
      input.subtitle || null,
      input.image_url,
      input.description || null,
      input.button_text || null,
      input.button_link || null,
      input.transition_effect || 'fade',
      input.transition_speed || 1200,
      input.autoplay_delay || 5000,
      input.sort_order || 0,
      input.is_active !== undefined ? input.is_active : 1
    ]);

    return (await HeroSlideModel.findById(result.lastInsertRowid as number))!;
  }

  static async update(id: number, input: UpdateHeroSlideInput): Promise<HeroSlide | undefined> {
    const existing = await HeroSlideModel.findById(id);
    if (!existing) return undefined;

    const updates: string[] = [];
    const values: any[] = [];

    if (input.title !== undefined) {
      updates.push('title = ?');
      values.push(input.title);
    }
    if (input.subtitle !== undefined) {
      updates.push('subtitle = ?');
      values.push(input.subtitle);
    }
    if (input.image_url !== undefined) {
      updates.push('image_url = ?');
      values.push(input.image_url);
    }
    if (input.description !== undefined) {
      updates.push('description = ?');
      values.push(input.description);
    }
    if (input.button_text !== undefined) {
      updates.push('button_text = ?');
      values.push(input.button_text);
    }
    if (input.button_link !== undefined) {
      updates.push('button_link = ?');
      values.push(input.button_link);
    }
    if (input.transition_effect !== undefined) {
      updates.push('transition_effect = ?');
      values.push(input.transition_effect);
    }
    if (input.transition_speed !== undefined) {
      updates.push('transition_speed = ?');
      values.push(input.transition_speed);
    }
    if (input.autoplay_delay !== undefined) {
      updates.push('autoplay_delay = ?');
      values.push(input.autoplay_delay);
    }
    if (input.sort_order !== undefined) {
      updates.push('sort_order = ?');
      values.push(input.sort_order);
    }
    if (input.is_active !== undefined) {
      updates.push('is_active = ?');
      values.push(input.is_active);
    }

    updates.push('updated_at = NOW()');
    values.push(id);

    const query = `UPDATE hero_slides SET ${updates.join(', ')} WHERE id = ?`;
    await run(query, values);

    return HeroSlideModel.findById(id);
  }

  static async delete(id: number): Promise<boolean> {
    const query = 'DELETE FROM hero_slides WHERE id = ?';
    const result = await run(query, [id]);
    return result.changes > 0;
  }

  static async reorder(orders: { id: number; sort_order: number }[]): Promise<void> {
    await transaction(async (conn) => {
      for (const item of orders) {
        await conn.execute('UPDATE hero_slides SET sort_order = ? WHERE id = ?', [item.sort_order, item.id]);
      }
    });
  }
}
