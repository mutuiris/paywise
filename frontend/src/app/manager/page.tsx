import { Metadata } from 'next';
import { ManagerSidebar, ManagerHeader } from '@/components/manager';

export const metadata: Metadata = {
  title: 'Manager — ImaraPay',
  description: 'Manager portal with sidebar and header.',
};

export default function ManagerPage() {
  return (
    <div className="flex min-h-screen bg-canvas">
      {/* Manager Sidebar */}
      <ManagerSidebar />

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Manager Header */}
        <ManagerHeader />

        {/* Page Container */}
        <main className="flex-1 p-6" />
      </div>
    </div>
  );
}
