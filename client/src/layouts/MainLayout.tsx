import { Outlet } from 'react-router-dom';
import Layout from '../components/layout/Layout';

/**
 * MainLayout wraps all authenticated/protected pages.
 * It renders the shared Sidebar + Navbar shell via the existing Layout component.
 */
export default function MainLayout() {
  return <Layout />;
}
