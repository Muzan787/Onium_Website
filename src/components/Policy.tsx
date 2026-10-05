import { ReactNode } from 'react';

/** The three facts most people come to a policy page for, before the detail. */
export function AtAGlance({ items }: { items: { label: string; value: string; note?: string }[] }) {
  return (
    <dl className="grid grid-cols-1 sm:grid-cols-3 border-y border-ink/10 divide-y sm:divide-y-0 sm:divide-x divide-ink/10">
      {items.map(({ label, value, note }) => (
        <div key={label} className="py-5 sm:px-6 sm:first:pl-0">
          <dt className="text-sm text-ink/70">{label}</dt>
          <dd className="mt-1 font-display font-extrabold text-ink text-2xl md:text-3xl leading-tight">{value}</dd>
          {note && <dd className="mt-1 text-sm text-ink/70">{note}</dd>}
        </div>
      ))}
    </dl>
  );
}

/** A titled section of policy prose, set at a readable measure. */
export function PolicySection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="py-10 border-b border-ink/10 last:border-b-0 md:grid md:grid-cols-12 md:gap-12">
      <h2 className="md:col-span-4 font-display font-extrabold text-ink text-2xl md:text-3xl leading-tight">{title}</h2>
      <div className="md:col-span-8 mt-4 md:mt-0 max-w-prose text-[17px] leading-relaxed text-ink/80 space-y-4 [&_strong]:text-ink [&_strong]:font-semibold [&_ul]:space-y-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:space-y-3 [&_ol]:list-decimal [&_ol]:pl-5 marker:text-ink/50">
        {children}
      </div>
    </section>
  );
}
