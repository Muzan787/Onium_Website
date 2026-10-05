import { forwardRef, MouseEvent, RefObject } from 'react';
import { Link, LinkProps, useNavigate } from 'react-router-dom';
import { Product } from '../lib/supabase';
import { canMorph, morphFrom } from '../lib/morph';

interface ProductLinkProps extends Omit<LinkProps, 'to' | 'state'> {
  product: Product;
  /** The photo that flies into the product page when this link is followed. */
  photo: RefObject<HTMLElement>;
}

/**
 * A link to a product page that hands the product over in history state, so
 * the page can draw itself straight away instead of waiting on the network,
 * and that morphs the card's photo into the page's photo where supported.
 */
const ProductLink = forwardRef<HTMLAnchorElement, ProductLinkProps>(function ProductLink(
  { product, photo, onClick, ...rest },
  ref,
) {
  const navigate = useNavigate();
  const to = `/product/${product.slug}`;
  const state = { product };

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || !photo.current || !canMorph(event)) return;
    event.preventDefault();
    morphFrom(photo.current, () => navigate(to, { state }));
  };

  return <Link ref={ref} to={to} state={state} onClick={handleClick} {...rest} />;
});

export default ProductLink;
