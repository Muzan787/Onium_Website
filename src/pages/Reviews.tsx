import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase, Product, Review } from '../lib/supabase';
import { describeTitle } from '../lib/productInfo';
import SEO from '../components/SEO';
import PageIntro from '../components/PageIntro';
import Stars from '../components/Stars';
import ReviewForm from '../components/ReviewForm';

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [submittedAs, setSubmittedAs] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      supabase.from('reviews').select('*').eq('is_approved', true).order('created_at', { ascending: false }),
      supabase.from('products').select('*').order('created_at'),
    ]).then(([reviewResult, productResult]) => {
      setReviews(reviewResult.data ?? []);
      setProducts(productResult.data ?? []);
      setIsLoading(false);
    });
  }, []);

  const productsById = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);
  const average = reviews.length ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

  return (
    <div>
      <SEO title="Reviews" description="What customers say about Onium cleaning products." />
      <PageIntro title="Reviews" lede="What customers say about Onium, in their own words.">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-5">
          {reviews.length > 0 && (
            <div className="flex items-center gap-4">
              <span className="font-display font-extrabold text-6xl leading-none tabular">{average.toFixed(1)}</span>
              <div>
                <Stars rating={average} className="w-5 h-5" />
                <p className="mt-1 text-sm text-white/90">
                  <span className="sr-only">Rated {average.toFixed(1)} out of 5, </span>
                  from {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                </p>
              </div>
            </div>
          )}
          <a
            href="#write"
            className="inline-flex items-center justify-center min-h-[52px] px-7 rounded-full bg-white text-primary-700 font-semibold hover:bg-primary-50 transition-colors"
          >
            Write a review
          </a>
        </div>
      </PageIntro>

      <div className="container mx-auto px-4 py-12 md:py-20">
        {isLoading ? (
          <ul aria-busy="true" aria-label="Loading reviews" className="grid gap-4 md:grid-cols-2 animate-pulse">
            {[0, 1, 2, 3].map((i) => (
              <li key={i} className="h-44 rounded-3xl bg-ink/[0.06]" />
            ))}
          </ul>
        ) : reviews.length === 0 ? (
          <p className="text-[17px] text-ink/70">No reviews yet. Yours could be the first.</p>
        ) : (
          <ul className="grid gap-4 md:block md:columns-2 md:gap-5">
            {reviews.map((review) => {
              const product = review.product_id ? productsById.get(review.product_id) : undefined;
              return (
                <li key={review.id} className="rounded-3xl bg-white p-6 md:p-8 flex flex-col md:mb-5 md:break-inside-avoid">
                  <div className="flex items-center gap-2">
                    <Stars rating={review.rating} />
                    <span className="sr-only">Rated {review.rating} out of 5</span>
                  </div>
                  <blockquote dir="auto" className="mt-4 font-display font-bold text-ink text-xl md:text-2xl leading-snug tracking-tight">
                    {review.comment}
                  </blockquote>
                  {review.image_url && (
                    <img
                      src={review.image_url}
                      alt={`Photo from ${review.customer_name}`}
                      loading="lazy"
                      className="mt-5 w-full max-h-72 rounded-2xl object-cover"
                    />
                  )}
                  <div className="mt-auto pt-6 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <p className="font-semibold text-ink">{review.customer_name}</p>
                    <time dateTime={review.created_at} className="text-sm text-ink/70">
                      {new Date(review.created_at).toLocaleDateString('en-PK', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </time>
                  </div>
                  {product && (
                    <Link
                      to={`/product/${product.slug}`}
                      state={{ product }}
                      className="mt-1 self-start inline-flex items-center min-h-11 text-sm font-semibold text-primary-700 underline underline-offset-4 decoration-primary-700/30 hover:decoration-primary-700"
                    >
                      On {describeTitle(product).name}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <section id="write" aria-labelledby="write-heading" className="bg-white border-t border-ink/10">
        <div className="container mx-auto px-4 py-12 md:py-20 md:grid md:grid-cols-12 md:gap-12">
          <div className="md:col-span-5">
            <h2 id="write-heading" className="font-display font-extrabold text-ink text-[32px] md:text-5xl leading-none">
              Write a review
            </h2>
            <p className="mt-4 text-[17px] text-ink/70">
              Tell other customers how it went. We read every review before it goes up.
            </p>
          </div>
          <div className="md:col-span-7 mt-8 md:mt-0">
            {submittedAs ? (
              <p role="status" className="rounded-2xl bg-leaf-50 text-leaf-800 px-5 py-4 text-[16px] font-medium">
                Thanks, {submittedAs}. Your review will show here once we've checked it.
              </p>
            ) : (
              <ReviewForm products={products} onSubmitted={setSubmittedAs} />
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
