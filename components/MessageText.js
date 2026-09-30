const LINK_PATTERN = /(\[[^\]]+\]\(https?:\/\/[^)\s]+\)|https?:\/\/[^\s]+)/g;

export default function MessageText({ content = '', className = '' }) {
  const parts = content.split(LINK_PATTERN);
  let offset = 0;
  return (
    <span className={className}>
      {parts.map((part) => {
        const partOffset = offset;
        offset += part.length;
        const markdown = part.match(/^\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)$/);
        const href =
          markdown?.[2] || (part.startsWith('http') ? part.replace(/[),.!?]+$/, '') : '');
        if (!href) return part;
        return (
          <a
            href={href}
            key={`${href}-${partOffset}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-current underline underline-offset-2"
          >
            {markdown?.[1] || href}
          </a>
        );
      })}
    </span>
  );
}
