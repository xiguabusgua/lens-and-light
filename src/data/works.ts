export interface Work {
  id: number;
  title: string;
  category: 'portrait' | 'landscape' | 'street' | 'commercial';
  imageUrl: string;
  thumbnailUrl: string;
  description: string;
  story: string;
  technical: {
    camera: string;
    lens: string;
    aperture: string;
    shutter: string;
    iso: number;
    location: string;
    date: string;
  };
  featured: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export const works: Work[] = [
  {
    id: 1,
    title: '晨曦中的城市',
    category: 'landscape',
    imageUrl: 'https://picsum.photos/seed/photo1/1920/1280',
    thumbnailUrl: 'https://picsum.photos/seed/photo1/1920/1280',
    description: '清晨五点的城市天际线，第一缕阳光穿透云层，为钢铁森林镀上金色',
    story: '这张作品拍摄于2024年春，当时我在上海陆家嘴等待了三个小时，只为捕捉这转瞬即逝的晨光时刻。当第一缕阳光从东方升起，整个城市仿佛从沉睡中苏醒，那种震撼无法用言语形容。',
    technical: {
      camera: 'Sony A7R V',
      lens: '24-70mm f/2.8',
      aperture: 'f/8',
      shutter: '1/250s',
      iso: 100,
      location: '上海陆家嘴',
      date: '2024-03-15'
    },
    featured: true,
    tags: ['城市', '日出', '建筑'],
    createdAt: '2024-01-10T08:30:00',
    updatedAt: '2024-03-15T08:30:00'
  },
  {
    id: 2,
    title: '时光肖像',
    category: 'portrait',
    imageUrl: 'https://picsum.photos/seed/photo2/1280/1920',
    thumbnailUrl: 'https://picsum.photos/seed/photo2/1280/1920',
    description: '岁月在脸上留下的每一道痕迹，都是生命最美的诗行',
    story: '这是一位退休教师，她用一生的时间培育了无数学生。拍摄时她告诉我："皱纹不是衰老的标志，而是微笑留下的印记。"这句话让我重新思考美的定义。',
    technical: {
      camera: 'Canon EOS R5',
      lens: '85mm f/1.2',
      aperture: 'f/2.0',
      shutter: '1/200s',
      iso: 200,
      location: '北京胡同',
      date: '2024-02-20'
    },
    featured: true,
    tags: ['人像', '情感', '故事'],
    createdAt: '2024-02-01T10:00:00',
    updatedAt: '2024-02-20T10:00:00'
  },
  {
    id: 3,
    title: '雨后街头',
    category: 'street',
    imageUrl: 'https://picsum.photos/seed/photo3/1920/1280',
    thumbnailUrl: 'https://picsum.photos/seed/photo3/1920/1280',
    description: '雨后的街道如镜面般倒映着城市的霓虹与匆忙的人影',
    story: '一场突如其来的夏雨，让平凡的街角变成了光影的舞台。我喜欢在这种天气出门拍摄，因为雨水会给一切增添诗意和层次感。',
    technical: {
      camera: 'Leica Q3',
      lens: '28mm f/1.7',
      aperture: 'f/2.8',
      shutter: '1/125s',
      iso: 800,
      location: '成都太古里',
      date: '2024-06-12'
    },
    featured: false,
    tags: ['街头', '雨天', '都市'],
    createdAt: '2024-06-05T14:20:00',
    updatedAt: '2024-06-12T14:20:00'
  },
  {
    id: 4,
    title: '山间云海',
    category: 'landscape',
    imageUrl: 'https://picsum.photos/seed/photo4/1920/1280',
    thumbnailUrl: 'https://picsum.photos/seed/photo4/1920/1280',
    description: '站在山巅俯瞰云海翻涌，仿佛置身于天地之间',
    story: '凌晨三点起床，徒步两小时到达观景台。当太阳升起的那一刻，所有的疲惫都值得了。大自然永远是最好的老师，教会我们谦卑和敬畏。',
    technical: {
      camera: 'Nikon Z8',
      lens: '14-24mm f/2.8',
      aperture: 'f/11',
      shutter: '1/60s',
      iso: 200,
      location: '黄山光明顶',
      date: '2024-04-08'
    },
    featured: true,
    tags: ['自然', '云海', '日出'],
    createdAt: '2024-04-01T03:00:00',
    updatedAt: '2024-04-08T03:00:00'
  },
  {
    id: 5,
    title: '时尚剪影',
    category: 'commercial',
    imageUrl: 'https://picsum.photos/seed/photo5/1280/1920',
    thumbnailUrl: 'https://picsum.photos/seed/photo5/1280/1920',
    description: '光与影的游戏中，轮廓讲述着最动人的故事',
    story: '为某高端时装品牌拍摄的广告大片。我们选择了极简主义风格，只用一束逆光勾勒出服装的线条美。有时候，少即是多。',
    technical: {
      camera: 'Hasselblad X2D 100C',
      lens: '90mm f/2.5',
      aperture: 'f/4',
      shutter: '1/160s',
      iso: 50,
      location: '上海摄影棚',
      date: '2024-05-22'
    },
    featured: false,
    tags: ['时尚', '商业', '艺术'],
    createdAt: '2024-05-15T09:00:00',
    updatedAt: '2024-05-22T09:00:00'
  },
  {
    id: 6,
    title: '童年记忆',
    category: 'portrait',
    imageUrl: 'https://picsum.photos/seed/photo6/1280/1920',
    thumbnailUrl: 'https://picsum.photos/seed/photo6/1280/1920',
    description: '纯真的笑容是世间最珍贵的宝藏，值得我们用心守护',
    story: '在家乡的小巷里偶遇这个正在玩耍的小女孩，她的笑容让我想起了自己的童年。我请求她的父母允许我为她拍一张照片，他们欣然同意了。',
    technical: {
      camera: 'Sony A7R V',
      lens: '50mm f/1.4',
      aperture: 'f/2.0',
      shutter: '1/500s',
      iso: 400,
      location: '苏州老巷',
      date: '2024-07-03'
    },
    featured: true,
    tags: ['人像', '儿童', '纯真'],
    createdAt: '2024-07-01T16:45:00',
    updatedAt: '2024-07-03T16:45:00'
  },
  {
    id: 7,
    title: '夜色霓虹',
    category: 'street',
    imageUrl: 'https://picsum.photos/seed/photo7/1920/1280',
    thumbnailUrl: 'https://picsum.photos/seed/photo7/1920/1280',
    description: '当夜幕降临，城市换上了另一副面孔——绚烂而神秘',
    story: '深圳的科技园在夜晚展现出完全不同的一面。霓虹灯、车流光轨、玻璃幕墙的倒影，构成了一幅赛博朋克风格的画面。我用慢门记录下这座不夜城的脉搏。',
    technical: {
      camera: 'Canon EOS R5',
      lens: '16-35mm f/2.8',
      aperture: 'f/11',
      shutter: '10s',
      iso: 100,
      location: '深圳南山',
      date: '2024-08-15'
    },
    featured: false,
    tags: ['夜景', '城市', '长曝光'],
    createdAt: '2024-08-10T20:00:00',
    updatedAt: '2024-08-15T20:00:00'
  },
  {
    id: 8,
    title: '产品艺术',
    category: 'commercial',
    imageUrl: 'https://picsum.photos/seed/photo8/1280/1280',
    thumbnailUrl: 'https://picsum.photos/seed/photo8/1280/1280',
    description: '每一个细节都经过精心雕琢，呈现产品的极致美感',
    story: '为瑞士手表品牌拍摄的系列产品之一。产品摄影不仅是展示商品，更是传递品牌价值和工匠精神。我们花费了一整天时间调整光线角度和构图。',
    technical: {
      camera: 'Phase One XF IQ4',
      lens: '120mm Macro f/4',
      aperture: 'f/8',
      shutter: '1/125s',
      iso: 50,
      location: '上海专业影棚',
      date: '2024-09-10'
    },
    featured: false,
    tags: ['产品', '商业', '精致'],
    createdAt: '2024-09-05T11:00:00',
    updatedAt: '2024-09-10T11:00:00'
  },
  {
    id: 9,
    title: '秋日私语',
    category: 'landscape',
    imageUrl: 'https://picsum.photos/seed/photo9/1920/1280',
    thumbnailUrl: 'https://picsum.photos/seed/photo9/1920/1280',
    description: '秋天的色彩是大自然最慷慨的馈赠，层林尽染如梦似幻',
    story: '每年秋天我都会去九寨沟采风。今年的运气特别好，赶上了最好的红叶季。湖水倒映着彩林，就像一幅会呼吸的油画。',
    technical: {
      camera: 'Nikon Z8',
      lens: '24-120mm f/4',
      aperture: 'f/8',
      shutter: '1/180s',
      iso: 200,
      location: '九寨沟',
      date: '2024-10-18'
    },
    featured: true,
    tags: ['秋天', '湖泊', '自然'],
    createdAt: '2024-10-15T07:30:00',
    updatedAt: '2024-10-18T07:30:00'
  },
  {
    id: 10,
    title: '匠人之心',
    category: 'portrait',
    imageUrl: 'https://picsum.photos/seed/photo10/1280/1920',
    thumbnailUrl: 'https://picsum.photos/seed/photo10/1280/1920',
    description: '专注的眼神诉说着对技艺的执着与热爱',
    story: '景德镇的一位老陶艺师，他已经做了五十年瓷器。拍摄时他正在拉坯，那双布满皱纹的手手仿佛有生命一般。他说："做陶就像做人，要耐得住寂寞。" ',
    technical: {
      camera: 'Sony A7R V',
      lens: '35mm f/1.4',
      aperture: 'f/2.8',
      shutter: '1/160s',
      iso: 800,
      location: '景德镇陶瓷工坊',
      date: '2024-11-05'
    },
    featured: false,
    tags: ['匠人', '传统', '专注'],
    createdAt: '2024-11-01T13:00:00',
    updatedAt: '2024-11-05T13:00:00'
  }
];

export const getWorksByCategory = (category: string): Work[] => {
  if (category === 'all') return works;
  return works.filter(work => work.category === category);
};

export const getFeaturedWorks = (): Work[] => {
  return works.filter(work => work.featured);
};

export const getWorkById = (id: number): Work | undefined => {
  return works.find(work => work.id === id);
};

export const getCategoryName = (category: string): string => {
  const map: Record<string, string> = { portrait: '人像', landscape: '风景', street: '街拍', commercial: '商业' };
  return map[category] || category;
};
