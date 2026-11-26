"use client";
// © Bright Abuu. Haki zote zimehifadhiwa.
// Brand 02b: dirisha la chakula kimoja kwenye menyu ya Standard. Linaonyesha picha, jina na vifurushi
// (Watu 1, Watu 3-4, ...) kupitia ItemPacks ya pamoja, bila kuibadilisha: muonekano unatoka default.css tu.
import { useEffect, useRef } from "react";
import { usePick, useT } from "@/app/_components/Lang";
import type { MenuItem } from "@/lib/menu";
import { ItemPacks } from "../shared/order/ItemPacks";
import { useBackdropClose } from "../shared/order/backdrop";
import { ReviewList } from "../shared/extras/Stars";

export function ItemSheet({ slug, item, onClose }: { slug: string; item: MenuItem; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const backdrop = useBackdropClose(dialog);
  const t = useT();
  const pick = usePick();
  const photo = item.image_urls[0];

  useEffect(() => {
    const d = dialog.current;
    if (d && !d.open) d.showModal();
  }, []);

  return (
    <dialog ref={dialog} className="dm-sheet" aria-labelledby={`dm-sheet-${item.id}`} onClose={onClose} {...backdrop}>
      {photo && (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="dm-sheet-photo" src={photo} alt={item.name} width={800} height={800} />
      )}
      <div className="dm-sheet-body">
        <header className="dm-sheet-head">
          <div>
            <h2 id={`dm-sheet-${item.id}`}>{item.name}</h2>
            {item.tag_sw && <p className="dm-mut">{pick(item.tag_sw, item.tag_en)}</p>}
          </div>
          <button type="button" className="dm-btn dm-close" onClick={() => dialog.current?.close()} aria-label={t("Funga dirisha")}>
            <span aria-hidden="true">&times;</span>
          </button>
        </header>
        <p className="dm-label">{t("Chagua kifurushi")}</p>
        <ItemPacks
          slug={slug}
          itemId={item.id}
          itemName={item.name}
          itemAvailable={item.available}
          options={item.options}
          packs={item.item_packs}
        />
        <p className="dm-label">{t("Rating za wateja")}</p>
        <ReviewList rating={item.rating} />
      </div>
    </dialog>
  );
}
