import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { FrontLayout } from "@/components/FrontLayout";

const Home = lazy(() => import("@/pages/Home"));
const Portfolio = lazy(() => import("@/pages/Portfolio"));
const Gallery = lazy(() => import("@/pages/Gallery"));
const WorkDetail = lazy(() => import("@/pages/WorkDetail"));
const About = lazy(() => import("@/pages/About"));
const Albums = lazy(() => import("@/pages/Albums"));
const AlbumDetail = lazy(() => import("@/pages/AlbumDetail"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const AdminApp = lazy(() => import("@/admin/App"));

function PageLoader() {
  return (
    <div className="min-h-screen bg-primary flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <HelmetProvider>
      <Router>
        <ScrollToTop />
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/admin/*" element={<AdminApp />} />
              <Route element={<FrontLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/portfolio" element={<Portfolio />} />
                <Route path="/portfolio/:category" element={<Portfolio />} />
                <Route path="/gallery/:id" element={<Gallery />} />
                <Route path="/work/:id" element={<WorkDetail />} />
                <Route path="/albums" element={<Albums />} />
                <Route path="/albums/:slug" element={<AlbumDetail />} />
                <Route path="/about" element={<About />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </Router>
    </HelmetProvider>
  );
}