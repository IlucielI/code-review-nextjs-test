interface Product {
  id: string
  name: string
  price: number
}

interface ProductGridProps {
  products: Product[]
}

export default function ProductGrid({ products }: ProductGridProps) {
  // Frontend map for rendering - should NOT trigger false positive
  return (
    <div className="grid">
      {products.map(product => (
        <div key={product.id} className="product-card">
          <h3>{product.name}</h3>
          <p>${product.price}</p>
        </div>
      ))}
    </div>
  )
}
