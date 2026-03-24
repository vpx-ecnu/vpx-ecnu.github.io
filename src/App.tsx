import { Suspense, lazy, type ReactNode } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Layout } from "./components/layout/layout";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const About = lazy(() => import("./pages/About"));
const Projects = lazy(() => import("./pages/Projects"));
const Publications = lazy(() => import("./pages/Publications"));
const People = lazy(() => import("./pages/People"));
const Activities = lazy(() => import("./pages/Activities"));
const Join = lazy(() => import("./pages/Join"));
const Intranet = lazy(() => import("./pages/Intranet"));
const StudioNews = lazy(() => import("./pages/StudioNews"));

const RouteFallback = () => (
  <div className="container px-4 py-12 text-sm text-muted-foreground md:px-6">
    Loading page...
  </div>
);

const RoutedPage = ({ children }: { children: ReactNode }) => (
  <Layout>
    <Suspense fallback={<RouteFallback />}>{children}</Suspense>
  </Layout>
);

const App = () => (
  <>
    <Toaster />
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Layout>
              <Index />
            </Layout>
          }
        />
        <Route
          path="/about"
          element={
            <RoutedPage>
              <About />
            </RoutedPage>
          }
        />
        <Route
          path="/projects"
          element={
            <RoutedPage>
              <Projects />
            </RoutedPage>
          }
        />
        <Route
          path="/publications"
          element={
            <RoutedPage>
              <Publications />
            </RoutedPage>
          }
        />
        <Route
          path="/people"
          element={
            <RoutedPage>
              <People />
            </RoutedPage>
          }
        />
        <Route
          path="/activities"
          element={
            <RoutedPage>
              <Activities />
            </RoutedPage>
          }
        />
        <Route
          path="/join"
          element={
            <RoutedPage>
              <Join />
            </RoutedPage>
          }
        />
        <Route
          path="/intranet"
          element={
            <RoutedPage>
              <Intranet />
            </RoutedPage>
          }
        />
        <Route
          path="/studio/news"
          element={
            <RoutedPage>
              <StudioNews />
            </RoutedPage>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </>
);

export default App;
