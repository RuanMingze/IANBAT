import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';
import { CdnEmbed } from './components/CdnEmbed';
import { CdnDocs } from './pages/CdnDocs';
import { CdnDemo } from './pages/CdnDemo';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/cdn',
    element: <CdnEmbed />,
  },
  {
    path: '/cdn/docs',
    element: <CdnDocs />,
  },
  {
    path: '/cdn/demo',
    element: <CdnDemo />,
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
