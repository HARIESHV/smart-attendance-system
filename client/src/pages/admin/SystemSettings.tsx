import { Settings } from 'lucide-react';

export default function SystemSettings() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="page-header">
        <h1 className="page-title flex items-center gap-3">
          <Settings className="text-primary-500" />
          System Settings
        </h1>
        <p className="page-subtitle">Configure system-wide settings</p>
      </div>
      <div className="glass-card p-8 text-center text-gray-500">
        <Settings size={48} className="mx-auto mb-4 text-gray-300" />
        <p className="text-lg font-medium">System Settings</p>
        <p className="text-sm mt-1">Configuration options will appear here.</p>
      </div>
    </div>
  );
}
