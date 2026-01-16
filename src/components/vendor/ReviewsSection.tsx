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

const avatarColors = [
  'bg-purple-500',
  'bg-blue-500',
  'bg-green-500',
  'bg-orange-500',
  'bg-pink-500',
  'bg-teal-500',
];

export function ReviewsSection({
  reviews,
  averageRating,
  totalReviews,
}: ReviewsSectionProps) {
  return (
    <div className="space-y-6" id="reviews">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Reviews</h2>

        {/* Rating Summary */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-6 w-6 ${
                  star <= Math.round(averageRating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'fill-gray-200 text-gray-200'
                }`}
              />
            ))}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-semibold text-gray-900">
              {averageRating.toFixed(1)}
            </span>
            <span className="text-sm text-green-600 font-medium">
              ({totalReviews.toLocaleString()})
            </span>
          </div>
        </div>
      </div>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reviews.map((review, index) => (
          <ReviewCard
            key={review.id}
            review={review}
            avatarColor={review.avatarColor || avatarColors[index % avatarColors.length]}
          />
        ))}
      </div>

      {/* Show More Button */}
      {totalReviews > reviews.length && (
        <button className="text-gray-900 font-medium underline hover:no-underline">
          Show all {totalReviews.toLocaleString()} reviews
        </button>
      )}
    </div>
  );
}

function ReviewCard({
  review,
  avatarColor,
}: {
  review: Review;
  avatarColor: string;
}) {
  const initial = review.authorInitial || review.authorName.charAt(0).toUpperCase();

  return (
    <div className="space-y-3">
      {/* Author */}
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div
          className={`h-10 w-10 rounded-full ${avatarColor} flex items-center justify-center text-white font-medium text-sm`}
        >
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
          <button className="text-green-600 font-medium ml-1 hover:underline">
            Read more
          </button>
        )}
      </p>
    </div>
  );
}
