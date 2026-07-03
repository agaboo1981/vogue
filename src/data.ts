export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  color: string;
  material: string;
  image: string;
  imageAlt: string;
  signal: string;
};

export const products: Product[] = [
  {
    id: 'linen-dress',
    name: 'Atelier Linen Dress',
    category: 'Dresses',
    price: 168,
    color: 'Undyed flax',
    material: 'Organic European linen',
    image:
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&fm=jpg&q=82&w=900',
    imageAlt: 'Model wearing a red linen dress in soft studio light',
    signal: 'Traceable mill',
  },
  {
    id: 'canvas-jacket',
    name: 'Compact Canvas Jacket',
    category: 'Outerwear',
    price: 214,
    color: 'Mineral black',
    material: 'Recycled cotton canvas',
    image:
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&fm=jpg&q=82&w=900',
    imageAlt: 'Structured neutral canvas jacket on a model',
    signal: 'Repairable hardware',
  },
  {
    id: 'court-sneaker',
    name: 'Plant Court Sneaker',
    category: 'Footwear',
    price: 132,
    color: 'Bone',
    material: 'Corn-based vegan leather',
    image:
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&fm=jpg&q=82&w=900',
    imageAlt: 'White low profile sneakers suspended on a warm background',
    signal: 'Low-waste sole',
  },
  {
    id: 'grain-tote',
    name: 'Grain Market Tote',
    category: 'Accessories',
    price: 248,
    color: 'Cedar',
    material: 'Vegetable-tanned leather',
    image:
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&fm=jpg&q=82&w=900',
    imageAlt: 'Brown leather tote bag against a minimal wall',
    signal: 'Lifetime repair',
  },
];

export const heroImages = [
  'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&fm=jpg&q=82&w=1800',
  'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&fm=jpg&q=82&w=1000',
  'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&fm=jpg&q=82&w=900',
];

export const productGallery = [
  products[0].image,
  'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&fm=jpg&q=82&w=900',
  'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&fm=jpg&q=82&w=900',
  'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&fm=jpg&q=82&w=900',
];
