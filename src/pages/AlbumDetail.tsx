import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Image, Loader2, Camera } from 'lucide-react';
import axios from 'axios';
import { getFullImageUrl, getCategoryLabel, getResponsiveImage, type ApiWork, type ApiAlbum } from '@/lib/utils';

interface Album extends ApiAlbum {}

interface Work extends ApiWork {}

export default function AlbumDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [album, setAlbum] = useState<Album | null>(null);
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    Promise.all([
      axios.get(`/api/albums/${slug}`),
      axios.get(`/api/albums/${slug}/works`)
    ])
      .then(([albumRes, worksRes]) => {
        setAlbum(albumRes.data.data || null);
        setWorks(worksRes.data.data || []);
      })
      .catch(err => {
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <Loader2 size={32} className="text-accent animate-spin" />
      </div>
    );
  }

  if (!album) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl text-secondary font-serif mb-4">相册不存在</h2>
          <Link to="/albums" className="text-accent hover:underline">
            返回相册列表
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary">
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/albums"
            className="inline-flex items-center gap-2 text-secondary/60 hover:text-accent transition-colors mb-12"
          >
            <ArrowLeft size={16} />
            <span>返回相册列表</span>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-16"
          >
            <h1 className="text-5xl lg:text-6xl font-semibold text-secondary font-serif mb-4">{album.title}</h1>
            {album.description && (
              <p className="text-xl text-secondary/70 font-serif italic mb-6">{album.description}</p>
            )}
            <div className="flex items-center gap-4 text-sm text-secondary/50">
              <span className="flex items-center gap-1">
                <Image size={14} /> {works.length} 个作品
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={14} /> {new Date(album.created_at).toLocaleDateString('zh-CN')}
              </span>
            </div>
            <div className="w-16 h-[1px] bg-accent mt-8" />
          </motion.div>

          {works.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {works.map((work, index) => (
                <motion.div
                  key={work.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Link to={`/work/${work.id}`}>
                    <div className="group relative overflow-hidden rounded-lg bg-primary-light border border-surface hover:border-accent/50 transition-all duration-300">
                      <div className="aspect-[4/3] overflow-hidden">
                        <img
                          {...getResponsiveImage(work.thumbnail_url || work.image_url)}
                          alt={work.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <span className="inline-block px-2 py-1 text-[10px] uppercase tracking-wider text-accent border border-accent/30 rounded-sm mb-2">
                          {getCategoryLabel(work.category)}
                        </span>
                        <h3 className="text-lg font-display text-white">{work.title}</h3>
                        {work.description && (
                          <p className="text-xs text-white/60 mt-1 line-clamp-2">{work.description}</p>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-32"
            >
              <div className="w-20 h-20 rounded-full border border-surface flex items-center justify-center mb-6">
                <Camera size={28} className="text-surface" />
              </div>
              <p className="text-lg text-secondary/50 italic font-serif mb-2">该相册暂无作品</p>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}
