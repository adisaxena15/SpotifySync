import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Homepage from './pages/Homepage';
import ErrorPage from './pages/ErrorPage';
import SongList from './pages/SongList.jsx';
import Credentials from './pages/Credentials.jsx';

const router = createBrowserRouter([
  {
    path:'/',
    element:<Homepage />,
    errorElement: <ErrorPage />
  },
  {
    path:'/form_submission',
    element:<SongList />,
    errorElement: <ErrorPage /> 
  },
  {
    path:'/credentials',
    element: <Credentials />,
    errorElement: <ErrorPage />
  }
])

function App() {
  return (
    <RouterProvider router={router} />
  );
}

export default App;
