import ContentGrid from "@/components/content-grid"
import { MovieSection } from "@/components/movie-section"

export default function ShowsLoading() {
  return (
    <MovieSection title="Loading...">
      <ContentGrid content={[]} />
    </MovieSection>
  )
}
