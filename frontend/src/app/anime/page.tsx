import DashboardLayout from "@/components/dashboard-layout"
import MovieGrid from "@/components/movie-grid"

export default function AnimePage() {
  return (
    <DashboardLayout>
      <div className="py-6">
        <h1 className="text-2xl font-bold mb-6">Anime</h1>
        <MovieGrid category="all" limit={24} />
      </div>
    </DashboardLayout>
  )
}
