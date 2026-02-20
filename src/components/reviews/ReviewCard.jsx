import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import StarRating from './StarRating';
import { format } from 'date-fns';

export default function ReviewCard({ review }) {
  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
  };

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100">
      <div className="flex items-start gap-3">
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-emerald-100 text-emerald-700 text-sm">
            {getInitials(review.reviewer_name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="font-semibold text-gray-900">{review.reviewer_name}</span>
            <span className="text-xs text-gray-400">
              {format(new Date(review.created_date), 'dd/MM/yyyy')}
            </span>
          </div>
          <StarRating rating={review.rating} readonly size="sm" />
          {review.review_text && (
            <p className="text-gray-600 mt-2 text-sm">{review.review_text}</p>
          )}
        </div>
      </div>
    </div>
  );
}