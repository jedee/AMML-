import { RouterProvider } from '@tanstack/react-router';
import { router } from './router';
import { AmmlProvider } from './lib/amml/store';

export default function App() {
  return (
    <AmmlProvider>
      <RouterProvider router={router} />
    </AmmlProvider>
  );
}
