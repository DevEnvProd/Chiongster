import { CategoryCard } from './category-card'

export function CategorySection() {
  const categories = [
    { title: 'Happy hour', image: '/placeholder.svg?height=200&width=200&text=Happy+Hour' },
    { title: 'Activities', image: '/placeholder.svg?height=200&width=200&text=Activities' },
  ].filter(category => category.image)

  const categories2 = [
    { title: 'Exclusive For Men', image: '/placeholder.svg?height=200&width=200&text=Exclusive+For+Men' },
    { title: 'Ladies Night', image: '/placeholder.svg?height=200&width=200&text=Ladies+Night' },
    { title: 'Classy Chill', image: '/placeholder.svg?height=200&width=200&text=Classy+Chill' },
  ].filter(category => category.image)

  return (
    <section className="space-y-6 p-2">
      <div className="space-y-1 text-center">
        <p className="text-[#FFD54A] text-base font-medium">Find Your Perfect Place</p>
        <h2 className="text-3xl font-bold text-white font-futura">CHOOSE YOUR VIBE</h2>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {categories.map((category) => (
          <CategoryCard
            key={category.title}
            title={category.title}
            image={category.image}
            className="bg-zinc-900 text-white rounded-lg overflow-hidden shadow-lg"
          />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-4">
        {categories2.map((category) => (
          <CategoryCard
            key={category.title}
            title={category.title}
            image={category.image}
            className="bg-zinc-900 text-white rounded-lg overflow-hidden shadow-lg"
          />
        ))}
      </div>
    </section>
  )
}

