import dotenv from 'dotenv';
dotenv.config({ path: `${process.cwd()}/.env` });

import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'lens_light',
  waitForConnections: true,
  connectionLimit: 10,
  charset: 'utf8mb4',
});

export async function getConnection() {
  return pool.getConnection();
}

export async function query(sql: string, params?: any[]) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

export async function get<T = any>(sql: string, params?: any[]): Promise<T | undefined> {
  const rows = await query(sql, params) as T[];
  return rows[0];
}

export async function all<T = any>(sql: string, params?: any[]): Promise<T[]> {
  return query(sql, params) as Promise<T[]>;
}

export async function run(sql: string, params?: any[]): Promise<{ changes: number; lastInsertRowid: number }> {
  const [result] = await pool.execute(sql, params) as [mysql.ResultSetHeader, any];
  return { changes: result.affectedRows, lastInsertRowid: result.insertId };
}

export async function transaction<T>(fn: (conn: mysql.PoolConnection) => Promise<T>): Promise<T> {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const result = await fn(conn);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export { pool };

export async function initializeDatabase(): Promise<void> {
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS works (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(200) NOT NULL,
      category VARCHAR(100) NOT NULL DEFAULT 'landscape',
      image_url VARCHAR(1000) NOT NULL,
      thumbnail_url VARCHAR(1000),
      description TEXT,
      story TEXT,
      camera VARCHAR(100),
      lens VARCHAR(100),
      aperture VARCHAR(20),
      shutter VARCHAR(30),
      iso INT,
      location VARCHAR(200),
      date VARCHAR(50),
      featured TINYINT DEFAULT 0,
      sort_order INT DEFAULT 0,
      status VARCHAR(20) DEFAULT 'active',
      tags TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL UNIQUE,
      slug VARCHAR(100) NOT NULL UNIQUE,
      description TEXT,
      icon VARCHAR(50) DEFAULT 'Grid3X3',
      sort_order INT DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS tags (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL UNIQUE,
      slug VARCHAR(100) NOT NULL UNIQUE,
      usage_count INT DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS work_tags (
      work_id INT NOT NULL,
      tag_id INT NOT NULL,
      PRIMARY KEY (work_id, tag_id),
      FOREIGN KEY (work_id) REFERENCES works(id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS albums (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(200) NOT NULL,
      slug VARCHAR(100) NOT NULL UNIQUE,
      description TEXT,
      cover_url VARCHAR(1000),
      status VARCHAR(20) DEFAULT 'active',
      sort_order INT DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS album_works (
      album_id INT NOT NULL,
      work_id INT NOT NULL,
      sort_order INT DEFAULT 0,
      PRIMARY KEY (album_id, work_id),
      FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE CASCADE,
      FOREIGN KEY (work_id) REFERENCES works(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS admin_settings (
      \`key\` VARCHAR(100) PRIMARY KEY,
      value TEXT NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS hero_slides (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(200) NOT NULL,
      subtitle VARCHAR(200),
      image_url VARCHAR(1000) NOT NULL,
      description TEXT,
      button_text VARCHAR(100),
      button_link VARCHAR(1000),
      transition_effect VARCHAR(50) DEFAULT 'fade',
      transition_speed INT DEFAULT 1200,
      autoplay_delay INT DEFAULT 5000,
      sort_order INT DEFAULT 0,
      is_active TINYINT DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  try { await pool.execute('CREATE INDEX idx_works_category ON works(category)'); } catch {}
  try { await pool.execute('CREATE INDEX idx_works_featured ON works(featured)'); } catch {}
  try { await pool.execute('CREATE INDEX idx_works_status ON works(status)'); } catch {}
  try { await pool.execute('CREATE INDEX idx_works_sort_order ON works(sort_order)'); } catch {}
  try { await pool.execute('CREATE INDEX idx_works_created_at ON works(created_at)'); } catch {}
  try { await pool.execute('CREATE INDEX idx_work_tags_tag_id ON work_tags(tag_id)'); } catch {}
  try { await pool.execute('CREATE INDEX idx_album_works_work_id ON album_works(work_id)'); } catch {}

  const [worksRow] = await pool.execute('SELECT COUNT(*) as count FROM works') as [any[], any];
  if (worksRow[0].count === 0) {
    const works = [
      ['晨曦中的城市', 'landscape', 'https://picsum.photos/seed/photo1/1920/1280', '清晨五点的城市天际线，第一缕阳光穿透云层，为钢铁森林镀上金色', '这张作品拍摄于2024年春，当时我在上海陆家嘴等待了三个小时，只为捕捉这转瞬即逝的晨光时刻。当第一缕阳光从东方升起，整个城市仿佛从沉睡中苏醒，那种震撼无法用言语形容。', 'Sony A7R V', '24-70mm f/2.8', 'f/8', '1/250s', 100, '上海陆家嘴', '2024-03-15', 1, 1, 'active', '["城市","日出","建筑"]'],
      ['时光肖像', 'portrait', 'https://picsum.photos/seed/photo2/1280/1920', '岁月在脸上留下的每一道痕迹，都是生命最美的诗行', '这是一位退休教师，她用一生的时间培育了无数学生。拍摄时她告诉我："皱纹不是衰老的标志，而是微笑留下的印记。"这句话让我重新思考美的定义。', 'Canon EOS R5', '85mm f/1.2', 'f/2.0', '1/200s', 200, '北京胡同', '2024-02-20', 1, 2, 'active', '["人像","情感","故事"]'],
      ['雨后街头', 'street', 'https://picsum.photos/seed/photo3/1920/1280', '雨后的街道如镜面般倒映着城市的霓虹与匆忙的人影', '一场突如其来的夏雨，让平凡的街角变成了光影的舞台。我喜欢在这种天气出门拍摄，因为雨水会给一切增添诗意和层次感。', 'Leica Q3', '28mm f/1.7', 'f/2.8', '1/125s', 800, '成都太古里', '2024-06-12', 0, 3, 'active', '["街头","雨天","都市"]'],
      ['山间云海', 'landscape', 'https://picsum.photos/seed/photo4/1920/1280', '站在山巅俯瞰云海翻涌，仿佛置身于天地之间', '凌晨三点起床，徒步两小时到达观景台。当太阳升起的那一刻，所有的疲惫都值得了。大自然永远是最好的老师，教会我们谦卑和敬畏。', 'Nikon Z8', '14-24mm f/2.8', 'f/11', '1/60s', 200, '黄山光明顶', '2024-04-08', 1, 4, 'active', '["自然","云海","日出"]'],
      ['时尚剪影', 'commercial', 'https://picsum.photos/seed/photo5/1280/1920', '光与影的游戏中，轮廓讲述着最动人的故事', '为某高端时装品牌拍摄的广告大片。我们选择了极简主义风格，只用一束逆光勾勒出服装的线条美。有时候，少即是多。', 'Hasselblad X2D 100C', '90mm f/2.5', 'f/4', '1/160s', 50, '上海摄影棚', '2024-05-22', 0, 5, 'active', '["时尚","商业","艺术"]'],
      ['童年记忆', 'portrait', 'https://picsum.photos/seed/photo6/1280/1920', '纯真的笑容是世间最珍贵的宝藏，值得我们用心守护', '在家乡的小巷里偶遇这个正在玩耍的小女孩，她的笑容让我想起了自己的童年。我请求她的父母允许我为她拍一张照片，他们欣然同意了。', 'Sony A7R V', '50mm f/1.4', 'f/2.0', '1/500s', 400, '苏州老巷', '2024-07-03', 1, 6, 'active', '["人像","儿童","纯真"]'],
      ['夜色霓虹', 'street', 'https://picsum.photos/seed/photo7/1920/1280', '当夜幕降临，城市换上了另一副面孔——绚烂而神秘', '深圳的科技园在夜晚展现出完全不同的一面。霓虹灯、车流光轨、玻璃幕墙的倒影，构成了一幅赛博朋克风格的画面。我用慢门记录下这座不夜城的脉搏。', 'Canon EOS R5', '16-35mm f/2.8', 'f/11', '10s', 100, '深圳南山', '2024-08-15', 0, 7, 'active', '["夜景","城市","长曝光"]'],
      ['产品艺术', 'commercial', 'https://picsum.photos/seed/photo8/1280/1280', '每一个细节都经过精心雕琢，呈现产品的极致美感', '为瑞士手表品牌拍摄的系列产品之一。产品摄影不仅是展示商品，更是传递品牌价值和工匠精神。我们花费了一整天时间调整光线角度和构图。', 'Phase One XF IQ4', '120mm Macro f/4', 'f/8', '1/125s', 50, '上海专业影棚', '2024.09-10', 0, 8, 'active', '["产品","商业","精致"]'],
      ['秋日私语', 'landscape', 'https://picsum.photos/seed/photo9/1920/1280', '秋天的色彩是大自然最慷慨的馈赠，层林尽染如梦似幻', '每年秋天我都会去九寨沟采风。今年的运气特别好，赶上了最好的红叶季。湖水倒映着彩林，就像一幅会呼吸的油画。', 'Nikon Z8', '24-120mm f/4', 'f/8', '1/180s', 200, '九寨沟', '2024-10-18', 1, 9, 'active', '["秋天","湖泊","自然"]'],
      ['匠人之心', 'portrait', 'https://picsum.photos/seed/photo10/1280/1920', '专注的眼神诉说着对技艺的执着与热爱', '景德镇的一位老陶艺师，他已经做了五十年瓷器。拍摄时他正在拉坯，那双布满皱纹的手仿佛有生命一般。他说："做陶就像做人，要耐得住寂寞。"', 'Sony A7R V', '35mm f/1.4', 'f/2.8', '1/160s', 800, '景德镇陶瓷工坊', '2024-11-05', 0, 10, 'active', '["匠人","传统","专注"]']
    ];
    for (const w of works) {
      await pool.execute(
        'INSERT INTO works (title, category, image_url, description, story, camera, lens, aperture, shutter, iso, location, date, featured, sort_order, status, tags) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        w
      );
    }
  }

  const [catRow] = await pool.execute('SELECT COUNT(*) as count FROM categories') as [any[], any];
  if (catRow[0].count === 0) {
    const cats = [
      ['风光', 'landscape', '自然风光、城市景观、山川湖海等壮美风景', 'Mountain', 1],
      ['人像', 'portrait', '人物肖像、情感表达、生活瞬间', 'User', 2],
      ['街拍', 'street', '街头纪实、城市生活、人文抓拍', 'Camera', 3],
      ['商业', 'commercial', '商业广告、产品展示、品牌宣传', 'Briefcase', 4],
      ['纪实', 'documentary', '新闻纪实、社会记录、历史瞬间', 'Grid3X3', 5]
    ];
    for (const c of cats) {
      await pool.execute('INSERT INTO categories (name, slug, description, icon, sort_order) VALUES (?, ?, ?, ?, ?)', c);
    }
  }

  const [tagRow] = await pool.execute('SELECT COUNT(*) as count FROM tags') as [any[], any];
  if (tagRow[0].count === 0) {
    const tags = [
      ['城市', 'city', 3], ['日出', 'sunrise', 2], ['自然', 'nature', 2],
      ['人像', 'portrait-tag', 2], ['街头', 'street', 1], ['夜景', 'nightscape', 1],
      ['建筑', 'architecture', 1], ['商业', 'commercial-tag', 2], ['艺术', 'art', 1],
      ['情感', 'emotion', 1], ['长曝光', 'long-exposure', 1], ['产品', 'product', 1],
      ['纪实', 'documentary-tag', 1], ['风光', 'landscape-tag', 1], ['人文', 'humanities', 1]
    ];
    for (const t of tags) {
      await pool.execute('INSERT INTO tags (name, slug, usage_count) VALUES (?, ?, ?)', t);
    }
    const links: [number, number][] = [
      [1,1],[1,2],[1,7],[2,4],[2,10],[2,13],[3,5],[3,6],[3,8],
      [4,3],[4,2],[4,14],[5,8],[5,9],[5,12],[6,4],[6,15],[6,10],
      [7,6],[7,1],[7,11],[8,12],[8,8],[8,9],[9,3],[9,14],[9,2],
      [10,13],[10,15],[10,10]
    ];
    for (const [wid, tid] of links) {
      await pool.execute('INSERT IGNORE INTO work_tags (work_id, tag_id) VALUES (?, ?)', [wid, tid]);
    }
  }

  const [albumRow] = await pool.execute('SELECT COUNT(*) as count FROM albums') as [any[], any];
  if (albumRow[0].count === 0) {
    const albums = [
      ['四季风光', 'seasons', '记录春夏秋冬四季轮回中的绝美风光', 'https://picsum.photos/seed/photo4/1920/1280', 'active', 1],
      ['人间烟火', 'human-life', '街头巷尾的人间百态', 'https://picsum.photos/seed/photo3/1920/1280', 'active', 2],
      ['光影肖像', 'portraits', '用光影讲述人物的故事', 'https://picsum.photos/seed/photo2/1280/1920', 'active', 3]
    ];
    for (const a of albums) {
      await pool.execute('INSERT INTO albums (title, slug, description, cover_url, status, sort_order) VALUES (?, ?, ?, ?, ?, ?)', a);
    }
    const awLinks = [[1,1,1],[1,4,2],[1,9,3],[2,3,1],[2,7,2],[2,10,3],[3,2,1],[3,6,2],[3,5,3]];
    for (const [aid, wid, so] of awLinks) {
      await pool.execute('INSERT INTO album_works (album_id, work_id, sort_order) VALUES (?, ?, ?)', [aid, wid, so]);
    }
  }

  const [heroRow] = await pool.execute('SELECT COUNT(*) as count FROM hero_slides') as [any[], any];
  if (heroRow[0].count === 0) {
    const heroSlides = [
      ['晨曦中的城市', 'LIGHT', 'https://picsum.photos/seed/photo1/1920/1280', '清晨五点的城市天际线，第一缕阳光穿透云层，为钢铁森林镀上金色', '探索更多', '/portfolio', 'fade', 1200, 5000, 1, 1],
      ['时光肖像', 'TIME', 'https://picsum.photos/seed/photo2/1280/1920', '岁月在脸上留下的每一道痕迹，都是生命最美的诗行', '探索更多', '/portfolio', 'slide', 1000, 5000, 2, 1],
      ['山间云海', 'NATURE', 'https://picsum.photos/seed/photo4/1920/1280', '站在山巅俯瞰云海翻涌，仿佛置身于天地之间', '探索更多', '/portfolio', 'fade', 1200, 5000, 3, 1]
    ];
    for (const h of heroSlides) {
      await pool.execute(
        'INSERT INTO hero_slides (title, subtitle, image_url, description, button_text, button_link, transition_effect, transition_speed, autoplay_delay, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        h
      );
    }
  }

  console.log('✅ MySQL 数据库初始化完成');
}

export default pool;
