interface CategoryCardProps {
  title: string
  image: string
}

export function CategoryCard({ title, image }: CategoryCardProps) {
  return (
    <div className="relative h-28 overflow-hidden rounded-lg">
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/20 z-10" />
      <img
        src={image}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="relative z-20 h-full flex flex-col justify-end items-center text-center p-3">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
      </div>
    </div>
  )
}

