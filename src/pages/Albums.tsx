import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Camera, Loader2, Calendar, Image } from 'lucide-react';
import axios from 'axios';
import { getFullImageUrl, type ApiAlbum } from '@/lib/utils';
import ResponsiveImage from '@/components/ResponsiveImage';

interface Album extends ApiAlbum {
  work_count: number;
}

export default function Albums() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/albums')
      .then(res => {
        setAlbums(res.data.data || []);
      })
      .catch(err => {
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-primary">
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl lg:text-7xl font-semibold text-secondary font-serif mb-6">相册集</h1>
            <p className="text-xl lg:text-2xl italic text-secondary/70 font-serif">每一组作品都是一段完整的视觉叙事</p>
            <div className="w-16 h-[1px] bg-accent mx-auto mt-8" />
          </motion.div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 size={32} className="text-accent animate-spin" />
            </div>
          ) : albums.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {albums.map((album, index) => (
                <motion.div
                  key={album.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Link to={`/albums/${album.slug}`}>
                    <div className="group relative overflow-hidden rounded-lg bg-primary-light border border-surface hover:border-accent/50 transition-all duration-300">
                      {album.cover_url ? (
                        <div className="aspect-[4/3] overflow-hidden">
                          <ResponsiveImage
                            src={album.cover_url}
                            alt={album.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                        </div>
                      ) : (
                        <div className="aspect-[4/3] flex items-center justify-center bg-primary-light">
                          <Camera size={48} className="text-surface" />
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <h3 className="text-xl font-display text-white mb-2">{album.title}</h3>
                        {album.description && (
                          <p className="text-sm text-white/70 mb-3 line-clamp-2">{album.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-white/50">
                          <span className="flex items-center gap-1">
                            <Image size={12} /> {album.work_count} 个作品
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar size={12} /> {new Date(album.created_at).toLocaleDateString('zh-CN')}
                          </span>
                        </div>
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
              <p className="text-lg text-secondary/50 italic font-serif mb-2">暂无相册</p>
              <p className="text-sm text-secondary/30 tracking-wide">还没有创建任何相册集</p>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}
