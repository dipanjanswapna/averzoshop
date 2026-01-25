import { getFirebaseAdminApp, firestore } from '@/firebase/server';
import type { Metadata, ResolvingMetadata } from 'next';
import type { Product } from '@/types/product';

type Props = {
  params: { id: string }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  try {
    const { id } = params;
    getFirebaseAdminApp();
    const productRef = firestore().collection('products').doc(id);
    const productSnap = await productRef.get();

    if (!productSnap.exists) {
      return {
        title: 'Product Not Found',
        description: 'The requested product does not exist.',
      }
    }

    const product = productSnap.data() as Product;
    const previousImages = (await parent).openGraph?.images || [];

    const title = product.metaTitle || `${product.name} - Averzo`;
    const description = product.metaDescription || product.description.substring(0, 150) || 'Discover amazing products on Averzo.';

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: [product.image, ...previousImages],
      },
    }
  } catch (error) {
    console.error("Error generating metadata for product:", error);
    return {
      title: 'Error',
      description: 'Could not load product details.',
    }
  }
}

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
