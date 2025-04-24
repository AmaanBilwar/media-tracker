import MovieGrid from "@/components/movie-grid"
import Navbar from "@/components/navbar"

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <main className="container mx-auto px-4 py-6">
        <MovieGrid movies={[]} />
      </main>
    </div>
  )
}
