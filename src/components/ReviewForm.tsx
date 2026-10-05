import { ChangeEvent, FormEvent, useEffect, useId, useState } from 'react';
import toast from 'react-hot-toast';
import { ImagePlus, Star, X } from 'lucide-react';
import { supabase, Product } from '../lib/supabase';
import { describeTitle } from '../lib/productInfo';
import Field from './Field';

interface ReviewFormProps {
  /** Ties the review to a product. Omit to let the customer pick one. */
  productId?: string;
  /** Products to choose from when there is no fixed product. */
  products?: Product[];
  /** Called with the reviewer's first name once the review is saved. */
  onSubmitted: (firstName: string) => void;
  className?: string;
}

/** Review form shared by product pages and the Reviews page. New reviews wait for approval. */
export default function ReviewForm({ productId, products = [], onSubmitted, className = '' }: ReviewFormProps) {
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [chosenProduct, setChosenProduct] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fieldId = useId();

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  const handlePhoto = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setPhoto(file);
    setPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    let imageUrl: string | null = null;
    if (photo) {
      const body = new FormData();
      body.append('file', photo);
      body.append('upload_preset', 'OniumReviews');
      try {
        const response = await fetch('https://api.cloudinary.com/v1_1/dztldh7o2/image/upload', { method: 'POST', body });
        imageUrl = (await response.json()).secure_url ?? null;
      } catch (error) {
        // The review is still worth posting without its photo.
        console.error('Review photo upload failed:', error);
      }
    }

    const { error } = await supabase.from('reviews').insert([
      {
        customer_name: name.trim(),
        rating,
        comment: comment.trim(),
        image_url: imageUrl,
        product_id: productId ?? (chosenProduct || null),
      },
    ]);
    setIsSubmitting(false);

    if (error) {
      toast.error("Couldn't post your review. Check your connection and try again.");
      return;
    }
    onSubmitted(name.trim().split(/\s+/)[0]);
  };

  return (
    <form onSubmit={handleSubmit} className={`grid gap-5 ${className}`}>
      <Field id={`${fieldId}-name`} label="Your name">
        {(props) => (
          <input {...props} type="text" required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
        )}
      </Field>

      {!productId && products.length > 0 && (
        <Field id={`${fieldId}-product`} label="Which product?" optional>
          {(props) => (
            <select {...props} value={chosenProduct} onChange={(e) => setChosenProduct(e.target.value)}>
              <option value="">Onium in general</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {describeTitle(product).name}
                </option>
              ))}
            </select>
          )}
        </Field>
      )}

      <fieldset>
        <legend className="text-sm font-semibold text-ink">Your rating</legend>
        <div className="mt-1 flex items-center">
          {[1, 2, 3, 4, 5].map((n) => (
            <label key={n} className="relative w-11 h-11 grid place-items-center cursor-pointer">
              <input
                type="radio"
                name={`${fieldId}-rating`}
                value={n}
                checked={rating === n}
                onChange={() => setRating(n)}
                className="peer sr-only"
              />
              <span className="sr-only">
                {n} {n === 1 ? 'star' : 'stars'}
              </span>
              <Star
                aria-hidden
                className={`w-7 h-7 rounded-sm peer-focus-visible:ring-2 peer-focus-visible:ring-primary-600 ${
                  n <= rating ? 'text-accent-500' : 'text-ink/15'
                }`}
                fill="currentColor"
                strokeWidth={0}
              />
            </label>
          ))}
          <span className="ml-2 text-sm text-ink/70 tabular">{rating} out of 5</span>
        </div>
      </fieldset>

      <Field id={`${fieldId}-comment`} label="Your review" multiline>
        {(props) => (
          <textarea
            {...props}
            required
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="How did it work for you?"
          />
        )}
      </Field>

      <div className="flex items-center gap-4">
        <label className="inline-flex items-center gap-2 min-h-11 px-4 rounded-full border border-dashed border-ink/25 text-sm font-semibold text-ink cursor-pointer hover:bg-surface transition-colors focus-within:ring-2 focus-within:ring-primary-600">
          <input type="file" accept="image/*" onChange={handlePhoto} className="sr-only" />
          <ImagePlus className="w-[18px] h-[18px]" aria-hidden />
          {photo ? 'Change photo' : 'Add a photo'}
          <span className="font-normal text-ink/70">(optional)</span>
        </label>
        {preview && (
          <div className="relative">
            <img src={preview} alt="Your photo" className="w-14 h-14 rounded-xl object-cover" />
            <button
              type="button"
              onClick={() => {
                setPhoto(null);
                setPreview(null);
              }}
              aria-label="Remove photo"
              className="absolute -top-3 -right-3 w-11 h-11 grid place-items-center"
            >
              <span className="w-6 h-6 rounded-full bg-ink text-white grid place-items-center">
                <X className="w-3.5 h-3.5" aria-hidden />
              </span>
            </button>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="justify-self-start min-h-12 px-8 rounded-full bg-primary-600 text-white font-semibold hover:bg-primary-700 disabled:opacity-60 transition-colors"
      >
        {isSubmitting ? 'Posting…' : 'Post review'}
      </button>
    </form>
  );
}
