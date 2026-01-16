'use client';

import { Star } from 'lucide-react';

export interface ReviewFresha {
  id: string;
  author: {
    name: string;
    avatar?: string;
  };
  rating: number;
  date: string;
  content: string;
  serviceName?: string;
}

interface ReviewsGridFreshaProps {
  reviews: ReviewFresha[];
  averageRating: number;
  totalReviews: number;
}

export function ReviewsGridFresha({
  reviews,
  averageRating,
  totalReviews,
}: ReviewsGridFreshaProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-4xl font-bold text-gray-900">{averageRating.toFixed(1)}</span>
          <div className="flex flex-col">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    star <= Math.round(averageRating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'fill-gray-200 text-gray-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-500">{totalReviews} reviews</span>
          </div>
        </div>
      </div>

      {/* Reviews Grid - 2 columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                {/* Avatar */}
                {review.author.avatar ? (
                  <img
                    src={review.author.avatar}
                    alt={review.author.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600">
                    {getInitials(review.author.name)}
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900">{review.author.name}</p>
                  <p className="text-xs text-gray-500">{formatDate(review.date)}</p>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-3.5 w-3.5 ${
                      star <= review.rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'fill-gray-200 text-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Content */}
            <p className="text-gray-600 text-sm leading-relaxed">{review.content}</p>

            {/* Service tag */}
            {review.serviceName && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <span className="text-xs text-gray-500">
                  Service: <span className="text-gray-700">{review.serviceName}</span>
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Load more */}
      {totalReviews > reviews.length && (
        <div className="text-center pt-4">
          <button className="px-6 py-2.5 border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            Show more reviews
          </button>
        </div>
      )}
    </div>
  );
}
