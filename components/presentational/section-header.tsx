interface SectionHeaderProps {
  title: string
  highlight?: string
  description: string
  className?: string
}

export function SectionHeader({ title, highlight, description, className = "" }: SectionHeaderProps) {
  return (
    <div className={`mb-16 ${className}`}>
      <h2 className="text-2xl md:text-3xl font-semibold mb-4">
        {title} {highlight && <span className="text-primary">{highlight}</span>}
      </h2>
      <p className="text-xl text-muted-foreground max-w-2xl">
        {description}
      </p>
    </div>
  )
}