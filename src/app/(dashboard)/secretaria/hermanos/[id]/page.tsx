import { HermanoDetailClient } from './HermanoDetailClient';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function HermanoDetailPage({ params }: PageProps) {
    const { id } = await params;
    return <HermanoDetailClient id={id} />;
}
