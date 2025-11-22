import Image from 'next/image';

export default function OptimizedImage({ src, alt, width = 400, height = 200, className }) {
    const imageSrc = src || '/images/blog/filler.webp';

    return (
        <div className={className}>
            <Image
                src={imageSrc}
                alt={alt || ''}
                width={width}
                height={height}
                priority={false}
                loading="lazy"
                quality={75}
                style={{
                    width: '100%',
                    height: 'auto',
                    objectFit: 'cover',
                }}
            />
        </div>
    );
} 