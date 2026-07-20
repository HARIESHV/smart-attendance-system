import { Outlet } from 'react-router-dom';

/**
 * AuthLayout wraps public pages (Login, Register).
 * Provides a centered, full-screen background — no sidebar/navbar.
 */
export default function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] bg-hero-gradient">
      <Outlet />
    </div>
  );
}
