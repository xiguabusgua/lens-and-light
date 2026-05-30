export interface AboutData {
  name: string;
  title: string;
  bio: string;
  philosophy: string;
  avatarUrl: string;
  stats: {
    years: number;
    projects: number;
    clients: number;
    awards: number;
  };
  timeline: Array<{
    year: string;
    title: string;
    description: string;
  }>;
  services: Array<{
    icon: string;
    title: string;
    description: string;
    priceRange: string;
  }>;
}

export const aboutData: AboutData = {
  name: '陈明远',
  title: '视觉叙事者 / Visual Storyteller',
  bio: `从事专业摄影十五年，专注于通过镜头捕捉生命中的诗意瞬间。我相信每张照片都是一个故事的开始，每次快门的按下都是一次与时间的对话。

从人文纪实到商业影像，从自然风光到时尚人像，我始终保持着对光的敏感和对美的追求。作品曾发表于《国家地理》、《VOGUE》等国内外权威媒体，并多次在国际摄影大赛中获奖。

对我而言，摄影不仅是一种技术，更是一种观看世界的方式——它教会我慢下来，去发现那些被忽略的美好，去感受当下最真实的情感流动。`,
  philosophy: '"摄影是在一瞬间内，同时认识到事件本身的意义，以及组织这一事件的形式结构。 —— 亨利·卡蒂埃-布列松"',
  avatarUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Professional%20photographer%20portrait%2C%20middle-aged%20Asian%20man%20with%20camera%2C%20confident%20expression%2C%20studio%20lighting%2C%20editorial%20style%2C%20warm%20tones&image_size=portrait_4_3',
  stats: {
    years: 15,
    projects: 1200,
    clients: 350,
    awards: 28
  },
  timeline: [
    {
      year: '2009',
      title: '开启摄影之路',
      description: '获得第一台单反相机，开始自学摄影，在城市街头记录生活点滴'
    },
    {
      year: '2013',
      title: '成为自由摄影师',
      description: '辞去稳定工作，全身心投入摄影创作，开始承接商业拍摄项目'
    },
    {
      year: '2016',
      title: '首个国际奖项',
      description: '作品《晨曦中的城市》获索尼世界摄影大赛风光类优秀奖'
    },
    {
      year: '2019',
      title: '个人展览举办',
      description: '在上海当代艺术馆举办首次个人摄影展《光之诗篇》，展出作品60幅'
    },
    {
      year: '2022',
      title: '品牌合作拓展',
      description: '与多个国际奢侈品牌建立长期合作关系，将艺术性与商业性完美融合'
    },
    {
      year: '2024',
      title: '新书出版',
      description: '出版摄影集《瞬间的永恒》，收录十年精选作品及创作心得'
    }
  ],
  services: [
    {
      icon: 'UserCircle',
      title: '个人写真',
      description: '为您打造专属形象照，无论是职业形象还是生活纪念，都用独特的视角展现最美的您',
      priceRange: '¥3,000 - ¥8,000'
    },
    {
      icon: 'Building2',
      title: '商业拍摄',
      description: '为企业提供专业的产品、空间、团队形象摄影服务，助力品牌价值提升',
      priceRange: '¥8,000 - ¥30,000'
    },
    {
      icon: 'Calendar',
      title: '活动记录',
      description: '婚礼、发布会、庆典等重大活动的全程影像记录，珍藏每个珍贵瞬间',
      priceRange: '¥5,000 - ¥20,000'
    }
  ]
};
