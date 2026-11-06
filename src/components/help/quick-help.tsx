"use client";
import { useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { PackageSearch } from "lucide-react";
import dynamic from "next/dynamic";

const TrackingDialog = dynamic(() => import("./tracking-dialog").then((m) => m.TrackingDialog));

export function QuickHelp() {
  const pathname = usePathname();
  // A route change unmounts an open viewer and its timers.
  return <HelpLaunchers key={pathname} />;
}

function HelpLaunchers() {
  const [active, setActive] = useState(false);
  const trackingTrigger = useRef<HTMLButtonElement>(null);
  const close = () => setActive(false);
  return <>
    <div className="mona-quick-help" role="group" aria-label="راهنمای خرید و رهگیری">
      <button ref={trackingTrigger} type="button" onClick={() => setActive(true)} aria-haspopup="dialog" aria-expanded={active} aria-label="رهگیری مرسوله" title="رهگیری مرسوله" className="mona-help-launcher">
        <span className="mona-tracking-icon"><PackageSearch size={20} aria-hidden="true" /></span><span className="caption-4">رهگیری مرسوله</span>
      </button>
    </div>
    {active && <TrackingDialog onClose={close} triggerRef={trackingTrigger} />}
  </>;
}
