'use client';

import { Star } from 'lucide-react';

export interface Review {
  id: string;
  authorName: string;
  authorInitial?: string;
  date: string;
  rating: number;
  text: string;
  avatarColor?: string;
}

interface ReviewsSectionProps {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
}

const MAX_DISPLAY_REVIEWS = 6;

export function ReviewsSection({
  reviews,
  averageRating,
  totalReviews,
}: ReviewsSectionProps) {
  // Only show first 6 reviews
  const displayedReviews = reviews.slice(0, MAX_DISPLAY_REVIEWS);

  return (
    <div className="space-y-6" id="reviews">
      {/* Header */}
      <div>
        <h2
          className="text-[28px] font-[550] leading-9 text-[rgb(20,20,20)] mb-6"
          style={{ fontFamily: 'RoobertPRO, AktivGroteskVF, sans-serif' }}
        >Reviews</h2>

        {/* Rating Summary */}
        <div className="space-y-2">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-7 w-7 ${
                  star <= Math.round(averageRating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'fill-gray-200 text-gray-200'
                }`}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-gray-900">
              {averageRating.toFixed(1)}
            </span>
            <span className="text-lg text-indigo-600 font-medium">
              ({totalReviews.toLocaleString()})
            </span>
          </div>
        </div>
      </div>

      {/* Reviews Grid */}
      {displayedReviews.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {displayedReviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center min-h-[80px] md:min-h-[300px]">
          <p className="text-gray-500">No reviews yet. Be the first to leave a review!</p>
        </div>
      )}

      {/* See All Button */}
      {totalReviews > MAX_DISPLAY_REVIEWS && displayedReviews.length > 0 && (
        <button className="px-6 py-2.5 border border-gray-300 rounded-full text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors">
          See all
        </button>
      )}
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const initial = review.authorInitial || review.authorName.charAt(0).toUpperCase();

  return (
    <div className="space-y-3">
      {/* Author */}
      <div className="flex items-center gap-3">
        {/* Avatar - consistent indigo color */}
        <div className="h-14 w-14 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-xl">
          {initial}
        </div>
        <div>
          <p className="font-medium text-gray-900">{review.authorName}</p>
          <p className="text-sm text-gray-500">{review.date}</p>
        </div>
      </div>

      {/* Rating */}
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= review.rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-gray-200 text-gray-200'
            }`}
          />
        ))}
      </div>

      {/* Text */}
      <p className="text-gray-700 text-sm leading-relaxed">
        {review.text}
        {review.text.length > 150 && (
          <button className="text-indigo-600 font-medium ml-1 hover:underline">
            Read more
          </button>
        )}
      </p>
    </div>
  );
}
