import Header from "../components/Header";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-gray-900 text-[#BABABA]">
      <Header />
      <section className="p-8">
        <h2 className="text-3xl font-bold text-purple-900 mb-4">Welcome to your profile</h2>
        <p className="text-gray-400">
          This will show your current progress, personal stats, and saved routines.
        </p>
      </section>
    </main>
  );
}
