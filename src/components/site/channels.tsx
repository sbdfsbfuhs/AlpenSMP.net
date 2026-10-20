import { useEffect, useState } from "react";
import { DEFAULT_CHANNELS, loadPublicChannels, type Channel } from "@/lib/alpen/channels";

function ChannelMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path fill="currentColor" d="M10 8.6v6.8l6-3.4-6-3.4z" />
    </svg>
  );
}

export function ChannelLinks({ place = "hero" }: { place?: "hero" | "footer" }) {
  const [items, setItems] = useState<Channel[]>(DEFAULT_CHANNELS);
  useEffect(() => {
    let stop = false;
    void loadPublicChannels().then((rows) => {
      if (!stop) setItems(rows);
    });
    return () => {
      stop = true;
    };
  }, []);
  if (!items.length) return null;
  if (place === "footer") {
    return (
      <>
        {items.map((item) => (
          <li key={`${item.platform}-${item.url}`}>
            <a className="hover:text-brand" href={item.url} target="_blank" rel="noopener noreferrer">
              {item.label}
            </a>
          </li>
        ))}
      </>
    );
  }
  return (
    <>
      {items.map((item) => (
        <a
          key={`${item.platform}-${item.url}`}
          className="btn-channel"
          data-platform={item.platform}
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          <ChannelMark />
          <span>{item.label}</span>
        </a>
      ))}
    </>
  );
}
