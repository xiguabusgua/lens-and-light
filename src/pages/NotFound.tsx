import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Camera, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        className="text-center max-w-lg"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
          className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-accent/10 mb-8"
        >
          <Camera size={44} className="text-accent" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h1 className="font-display text-7xl lg:text-9xl font-bold text-accent mb-4">
            404
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="font-display text-2xl lg:text-3xl text-secondary mb-4">
            页面未找到
          </h2>
          <p className="font-body text-secondary/50 text-lg leading-relaxed mb-10">
            你正在寻找的页面可能已被移动、删除<br />
            或者从未存在过
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-accent text-primary font-ui text-sm uppercase tracking-wider rounded-sm hover:bg-accent-light transition-colors duration-300 shadow-lg hover:shadow-accent/25"
          >
            <ArrowLeft size={16} />
            回到首页
          </Link>
          <Link
            to="/portfolio"
            className="inline-flex items-center gap-2 px-8 py-4 border-2 border-surface-light text-secondary/70 font-ui text-sm uppercase tracking-wider rounded-sm hover:border-accent hover:text-accent transition-all duration-300"
          >
            浏览作品集
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
