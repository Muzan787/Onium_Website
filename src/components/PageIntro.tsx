import { ReactNode } from 'react';

interface PageIntroProps {
  title: string;
  lede?: ReactNode;
  children?: ReactNode;
}

/**
 * The opening band of the content pages. Same logo blue as the header and the
 * homepage hero, so every page starts in the brand's colour.
 */
export default function PageIntro({ title, lede, children }: PageIntroProps) {
  return (
    <section className="bg-primary-600 text-white">
      <div className="container mx-auto px-4 pt-10 pb-12 md:pt-16 md:pb-20">
        <h1 className="max-w-3xl font-extrabold text-[44px] md:text-7xl leading-[0.95]">{title}</h1>
        {lede && <p className="mt-4 max-w-xl text-[17px] md:text-xl text-white/90 leading-relaxed">{lede}</p>}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}
