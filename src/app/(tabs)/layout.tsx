import TabBar from '@/components/TabBar';

export default function TabsLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-surface pb-20">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 pb-10 pt-6">
        {children}
      </div>
      <TabBar />
    </div>
  );
}
