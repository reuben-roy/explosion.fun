import Image from 'next/image';

export default function OptimizedImage({ src, alt, width = 400, height = 200, className }) {
    return (
        <div className={className}>
            <Image
                src={src}
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