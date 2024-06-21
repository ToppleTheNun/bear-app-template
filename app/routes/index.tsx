import { H1, H2, Lead } from "~/components/typography.tsx";

export default function Index() {
  return (
    <>
      <div className="pb-8 space-y-2">
        <H1>Should I Bomb or Should I Cleave?</H1>
        <Lead>
          If you say that I should Cleave, I think that I would rather leave.
        </Lead>
      </div>
      <section className="hidden md:block">
        <div className="overflow-hidden rounded-lg border bg-background px-4 shadow">
          <div className="flex h-[50vh] flex-col items-center justify-center gap-2">
            <H2>We&apos;re building here</H2>
            <Lead>Hopefully it&apos;ll be neat.</Lead>
          </div>
        </div>
      </section>
    </>
  );
}
