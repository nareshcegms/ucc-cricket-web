import { StoryPicker } from '@/components/matches/StoryPicker';
import { getStories } from '@/lib/data';

export default function MatchesPage() {
  const stories = getStories();

  return (
    <section className="section-block">
      <div className="wrap">
        <p className="eyebrow">Match Stories</p>
        <h1 className="mt-2 text-4xl">What happened out there this week.</h1>
        <p className="mt-3 max-w-2xl text-ink-soft">
          Pick a match date and read the full tale — batting, bowling, and the result.
        </p>
        <div className="mt-10">
          <StoryPicker stories={stories} />
        </div>
      </div>
    </section>
  );
}
