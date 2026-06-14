type CourseDetailSectionHeaderProps = {
  title: string;
  description?: string;
};

export function CourseDetailSectionHeader({
  title,
  description,
}: CourseDetailSectionHeaderProps) {
  return (
    <header className="space-y-1 border-b border-slate-200 pb-5">
      <h2 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
        {title}
      </h2>
      {description ? (
        <p className="max-w-2xl text-sm leading-relaxed text-slate-500">
          {description}
        </p>
      ) : null}
    </header>
  );
}
