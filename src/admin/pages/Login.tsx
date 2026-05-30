import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AdminInput } from '@/admin/components';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username || !password) {
      setError('请输入用户名和密码');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/login', { username, password });
      localStorage.setItem('admin_token', res.data.token);
      window.location.href = '/admin/dashboard';
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-admin-bg flex items-center justify-center p-5">
      <div className="w-full max-w-[420px] bg-admin-card rounded-2xl border border-admin-border px-10 py-12">
        <div className="text-center mb-8">
          <h1 className="text-[28px] text-admin-accent font-[Georgia,serif] mb-2">Lens & Light</h1>
          <p className="text-xs text-admin-text-dim tracking-[3px] uppercase">管理后台</p>
        </div>

        {error && (
          <div className="bg-red-400/10 border border-red-400/20 text-red-400 px-4 py-3 rounded-lg text-sm mb-5">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <AdminInput
            label="用户名"
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="admin"
            autoComplete="username"
            required
          />

          <AdminInput
            label="密码"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="•••••••••"
            autoComplete="current-password"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-admin-accent hover:bg-admin-accent-hover text-admin-bg border-none rounded-lg text-[13px] font-semibold tracking-widest mt-2 transition-colors disabled:bg-admin-accent-hover disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? '验证中...' : '登 录'}
          </button>
        </form>
      </div>
    </div>
  );
}
