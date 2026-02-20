import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import StarRating from './StarRating';
import { Send } from 'lucide-react';

export default function ReviewForm({ onSubmit, loading }) {
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0) return;
    onSubmit({ rating, review_text: reviewText });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label className="mb-2 block">Tanga amanota</Label>
        <StarRating rating={rating} onRatingChange={setRating} size="xl" />
      </div>

      <div>
        <Label className="mb-2 block">Andika igitekerezo cyawe (optional)</Label>
        <Textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="Sobanura uburambe bwawe..."
          rows={4}
        />
      </div>

      <Button 
        type="submit" 
        disabled={rating === 0 || loading}
        className="w-full bg-emerald-600 hover:bg-emerald-700"
      >
        {loading ? (
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
        ) : (
          <>
            <Send className="w-4 h-4 mr-2" />
            Ohereza Review
          </>
        )}
      </Button>
    </form>
  );
}