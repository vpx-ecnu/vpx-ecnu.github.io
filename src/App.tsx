import { Suspense, lazy } from "react";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { DelayedRouteFallback } from "@/components/layout/route-fallback";
import { routeModuleLoaders } from "@/lib/route-preload";
import { Layout } from "./components/layout/layout";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const About = lazy(routeModuleLoaders.about);
const Projects = lazy(routeModuleLoaders.projects);
const Publications = lazy(routeModuleLoaders.publications);
const People = lazy(routeModuleLoaders.people);
const Activities = lazy(routeModuleLoaders.activities);
const Join = lazy(routeModuleLoaders.join);
const Intranet = lazy(routeModuleLoaders.intranet);
const StudioNews = lazy(routeModuleLoaders.studioNews);

const LayoutShell = () => (
  <Layout>
    <Suspense fallback={<DelayedRouteFallback />}>
      <Outlet />
    </Suspense>
  </Layout>
);

const App = () => (
  <>
    <Toaster />
    <BrowserRouter>
      <Routes>
        <Route element={<LayoutShell />}>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/publications" element={<Publications />} />
          <Route path="/people" element={<People />} />
          <Route path="/activities" element={<Activities />} />
          <Route path="/join" element={<Join />} />
          <Route path="/intranet" element={<Intranet />} />
          <Route path="/studio/news" element={<StudioNews />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </>
);

export default App;
