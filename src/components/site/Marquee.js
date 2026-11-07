export default function Marquee({ items, speed = 38, className = '', label = 'Highlights' }) {
  const loop = [...items, ...items];

  return (
    <div className={`ef-marquee ${className}`} aria-label={label}>
      <div className="ef-marquee__track" style={{ animationDuration: `${speed}s` }}>
        {loop.map((item, index) => (
          <span className="ef-marquee__item" key={`${item}-${index}`} aria-hidden={index >= items.length}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
