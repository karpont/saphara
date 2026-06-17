"use client";

import { useState } from "react";
import {
  Search, Shield, Grid3x3, List, Zap, Star, Sparkles,
  ShoppingBag, Plus, Minus, CheckCircle, Clock, Tag
} from "lucide-react";
import {
  useNftCollections, useMintNft, useWhitelistApply, useWhitelistCheck,
  useMyNfts, useNftMarketplace, useBuyNft, useAuth,
} from "../../hooks/useApi";

const RARITY_COLOR: Record<string, string> = {
  legendary: "#f59e0b",
  epic:      "#a855f7",
  rare:      "#3b82f6",
  uncommon:  "#22c55e",
  common:    "#6b7280",
};

function WhitelistBtn({ collectionId }: { collectionId: string }) {
  const apply = useWhitelistApply();
  const { data, isLoading } = useWhitelistCheck(collectionId);

  if (isLoading) return null;
  if (data?.whitelisted) {
    return (
      <span className="nft-wl-chip wl-ok">
        <CheckCircle size={12} /> Whitelist: {data.remaining} hak kaldı
      </span>
    );
  }
  return (
    <button
      className="nft-wl-btn"
      disabled={apply.isPending}
      onClick={(e) => { e.stopPropagation(); apply.mutate(collectionId); }}
    >
      {apply.isPending ? "Kaydediliyor…" : apply.isSuccess ? "✓ Kaydoldun!" : "Whitelist'e Gir"}
    </button>
  );
}

function MintModal({ col, onClose }: { col: any; onClose: () => void }) {
  const [qty, setQty] = useState(1);
  const [useWl, setUseWl] = useState(false);
  const { data: wl } = useWhitelistCheck(col.id);
  const mint = useMintNft();

  const price = useWl && wl?.whitelisted
    ? Number(col.whitelistPrice ?? col.mintPrice)
    : Number(col.mintPrice);
  const total = price * qty;
  const commission = total * 0.025;

  const canWl = wl?.whitelisted && (wl.remaining ?? 0) > 0;
  const remaining = col.maxSupply - col.minted;

  function handleMint() {
    mint.mutate(
      { collectionId: col.id, quantity: qty, useWhitelist: useWl && canWl },
      { onSuccess: () => { setTimeout(onClose, 1500); } }
    );
  }

  return (
    <div className="nft-modal-overlay" onClick={onClose}>
      <div className="nft-modal" onClick={(e) => e.stopPropagation()}>
        <button className="nft-modal-close" onClick={onClose}>✕</button>

        <div className="mint-modal-top">
          <img src={col.imageUrl} alt={col.name} className="mint-col-img" />
          <div className="mint-col-info">
            <div className="mint-col-name">{col.name}</div>
            <div className="mint-col-sym">{col.symbol} · {col.chain}</div>
            <div className="mint-supply">{col.minted}/{col.maxSupply} basıldı — {remaining} kaldı</div>
          </div>
        </div>

        <div className="mint-body">
          {canWl && (
            <label className="mint-wl-toggle">
              <input type="checkbox" checked={useWl} onChange={(e) => setUseWl(e.target.checked)} />
              <span>Whitelist fiyatı kullan ({col.whitelistPrice} PART)</span>
              <span className="mint-wl-save">%{Math.round((1 - Number(col.whitelistPrice) / Number(col.mintPrice)) * 100)} indirim</span>
            </label>
          )}

          <div className="mint-qty-row">
            <span className="mint-qty-label">Miktar (maks {Math.min(col.maxPerWallet, remaining)})</span>
            <div className="mint-qty-ctrl">
              <button onClick={() => setQty(q => Math.max(1, q - 1))} disabled={qty <= 1}><Minus size={14} /></button>
              <span>{qty}</span>
              <button onClick={() => setQty(q => Math.min(Math.min(col.maxPerWallet, remaining, 5), q + 1))} disabled={qty >= Math.min(col.maxPerWallet, remaining, 5)}><Plus size={14} /></button>
            </div>
          </div>

          <div className="mint-price-breakdown">
            <div className="mint-pb-row"><span>Birim fiyat</span><strong>{price} PART</strong></div>
            <div className="mint-pb-row"><span>Miktar</span><strong>× {qty}</strong></div>
            <div className="mint-pb-row"><span>Platform komisyonu</span><strong className="muted">{commission.toFixed(2)} PART</strong></div>
            <div className="mint-pb-row total"><span>Toplam</span><strong className="accent">{total} PART</strong></div>
          </div>

          {mint.isSuccess && (
            <div className="mint-success">
              <CheckCircle size={18} /> {qty} NFT başarıyla mint edildi!
            </div>
          )}
          {mint.isError && (
            <div className="mint-error">{(mint.error as any)?.message ?? "Mint başarısız"}</div>
          )}

          <button
            className="mint-btn"
            disabled={mint.isPending || mint.isSuccess || remaining <= 0}
            onClick={handleMint}
          >
            {remaining <= 0 ? "Tükendi" :
             mint.isPending ? "Mint ediliyor…" :
             mint.isSuccess ? "✓ Mint edildi!" :
             `Mint Et — ${total} PART`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function NFTPage() {
  const [search, setSearch]   = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [tab, setTab]         = useState<"collections" | "marketplace" | "my">("collections");
  const [mintTarget, setMintTarget] = useState<any>(null);

  const { data: colData, isLoading: colLoading } = useNftCollections();
  const { data: mpData,  isLoading: mpLoading  } = useNftMarketplace();
  const { data: myData,  isLoading: myLoading  } = useMyNfts();
  const buyNft = useBuyNft();
  const { isAuthed } = useAuth();

  const collections = colData?.collections ?? [];
  const mpTokens    = mpData?.tokens ?? [];
  const myTokens    = myData?.tokens ?? [];

  const filtered = collections.filter((c: any) =>
    !search ||
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.symbol.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="nft-page">
      <header className="topbar"><h1>NFT</h1></header>

      {/* Tabs */}
      <div className="nft-tabs">
        <button className={tab === "collections" ? "on" : ""} onClick={() => setTab("collections")}>Koleksiyonlar</button>
        <button className={tab === "marketplace" ? "on" : ""} onClick={() => setTab("marketplace")}>Pazaryeri</button>
        {isAuthed && <button className={tab === "my" ? "on" : ""} onClick={() => setTab("my")}>NFT'lerim</button>}
      </div>

      {/* ── Collections tab ── */}
      {tab === "collections" && (
        <>
          <div className="nft-controls">
            <div className="nft-search-wrap">
              <Search size={15} />
              <input className="nft-search" placeholder="Koleksiyon ara…" value={search}
                onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="nft-view-btns">
              <button className={viewMode === "grid" ? "on" : ""} onClick={() => setViewMode("grid")}><Grid3x3 size={16} /></button>
              <button className={viewMode === "list" ? "on" : ""} onClick={() => setViewMode("list")}><List size={16} /></button>
            </div>
          </div>

          {colLoading && <div className="nft-loading">Koleksiyonlar yükleniyor…</div>}

          {viewMode === "grid" ? (
            <div className="nft-grid">
              {filtered.map((c: any) => (
                <div key={c.id} className="nft-card">
                  <div className="nft-card-cover">
                    <img src={c.bannerUrl ?? c.imageUrl} alt={c.name} loading="lazy" />
                    {c.creator?.verified && <span className="nft-verified-badge"><Shield size={10} /> Doğrulandı</span>}
                    <span className={`nft-status-badge s-${c.status}`}>{
                      c.status === "active" ? "Aktif" :
                      c.status === "soldout" ? "Tükendi" :
                      c.status === "upcoming" ? "Yakında" : c.status
                    }</span>
                  </div>
                  <div className="nft-card-body">
                    <div className="nft-card-head">
                      <img src={c.imageUrl} alt={c.name} className="nft-card-avatar" />
                      <div>
                        <div className="nft-card-name">{c.name}</div>
                        <div className="nft-card-sym">{c.symbol} · {c.chain}</div>
                      </div>
                    </div>
                    <p className="nft-card-desc">{c.description?.slice(0, 80)}…</p>
                    <div className="nft-card-stats">
                      <div className="nft-cs">
                        <span className="nft-cs-l">Mint</span>
                        <span className="nft-cs-v">{c.mintPrice} P</span>
                      </div>
                      <div className="nft-cs">
                        <span className="nft-cs-l">Basılan</span>
                        <span className="nft-cs-v">{c.minted}/{c.maxSupply}</span>
                      </div>
                      <div className="nft-cs">
                        <span className="nft-cs-l">Royalty</span>
                        <span className="nft-cs-v">%{c.royaltyPct}</span>
                      </div>
                    </div>
                    <div className="nft-card-actions">
                      {isAuthed && c.status === "active" && (
                        <button className="nft-mint-btn" onClick={() => setMintTarget(c)}>
                          <Zap size={13} /> Mint Et
                        </button>
                      )}
                      {isAuthed && <WhitelistBtn collectionId={c.id} />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="nft-list">
              <div className="nft-list-hdr">
                <span>#</span><span>Koleksiyon</span><span>Mint</span><span>Basılan</span><span>Durum</span>
              </div>
              {filtered.map((c: any, i: number) => (
                <div key={c.id} className="nft-list-row">
                  <span className="rank">{i + 1}</span>
                  <div className="nft-lr-name">
                    <img src={c.imageUrl} alt={c.name} />
                    <div>
                      <div>{c.name}</div>
                      <small>{c.symbol}</small>
                    </div>
                  </div>
                  <span>{c.mintPrice} PART</span>
                  <span>{c.minted}/{c.maxSupply}</span>
                  <span className={`s-${c.status}`}>{c.status}</span>
                </div>
              ))}
            </div>
          )}

          {/* Mint CTA */}
          <div className="nft-mint-cta">
            <Sparkles size={22} style={{ color: "var(--accent)" }} />
            <h3>Kendi NFT Koleksiyonunu Oluştur</h3>
            <p>Saphara'da BSC mainnet üzerinde koleksiyonunuzu listeleyin. Whitelist kaydı, royalty ayarı ve otomatik basım sistemi.</p>
            <a href="/launchpad/apply" className="nft-mc-btn">Başvuru Yap</a>
          </div>
        </>
      )}

      {/* ── Marketplace tab ── */}
      {tab === "marketplace" && (
        <div className="nft-mp">
          <div className="nft-mp-header">
            <h2>NFT Pazaryeri</h2>
            <span className="nft-mp-count">{mpTokens.length} ilan · %2.5 komisyon</span>
          </div>

          {mpLoading && <div className="nft-loading">Yükleniyor…</div>}
          {!mpLoading && mpTokens.length === 0 && (
            <div className="nft-empty">
              <ShoppingBag size={40} style={{ opacity: .2 }} />
              <p>Henüz satışta NFT yok</p>
              <span>NFT'lerinizi "NFT'lerim" sekmesinden satışa çıkarabilirsiniz.</span>
            </div>
          )}

          <div className="nft-mp-grid">
            {mpTokens.map((t: any) => (
              <div key={t.id} className="nft-mp-card">
                <div className="nft-mp-img-wrap">
                  <img src={t.imageUrl} alt={t.name} loading="lazy" />
                  <span className="nft-rarity-tag" style={{ background: RARITY_COLOR[t.rarity] + "22", color: RARITY_COLOR[t.rarity] }}>
                    <Star size={9} /> {t.rarity}
                  </span>
                </div>
                <div className="nft-mp-body">
                  <div className="nft-mp-name">{t.name}</div>
                  <div className="nft-mp-col">{t.collection?.name}</div>
                  <div className="nft-mp-owner">@{t.owner?.handle}</div>
                  <div className="nft-mp-price">
                    <Tag size={12} /> {t.listingPrice} PART
                  </div>
                  {isAuthed && (
                    <button
                      className="nft-buy-btn"
                      disabled={buyNft.isPending}
                      onClick={() => buyNft.mutate(t.id)}
                    >
                      Satın Al
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── My NFTs tab ── */}
      {tab === "my" && isAuthed && (
        <div className="nft-my">
          {myLoading && <div className="nft-loading">Yükleniyor…</div>}
          {!myLoading && myTokens.length === 0 && (
            <div className="nft-empty">
              <Zap size={40} style={{ opacity: .2 }} />
              <p>Henüz NFT'niz yok</p>
              <span>Koleksiyonlar sekmesinden mint edin.</span>
            </div>
          )}
          <div className="nft-my-grid">
            {myTokens.map((t: any) => (
              <div key={t.id} className="nft-my-card">
                <img src={t.imageUrl} alt={t.name} loading="lazy" />
                <div className="nft-my-info">
                  <div className="nft-my-name">{t.name}</div>
                  <div className="nft-my-col">{t.collection?.name}</div>
                  <div className="nft-my-rarity" style={{ color: RARITY_COLOR[t.rarity] }}>
                    <Star size={10} /> {t.rarity}
                  </div>
                  {t.listed ? (
                    <div className="nft-my-listed">
                      <Tag size={11} /> {t.listingPrice} PART'a satışta
                    </div>
                  ) : (
                    <div className="nft-my-actions">
                      <span className="nft-my-date">
                        <Clock size={10} /> {new Date(t.mintedAt).toLocaleDateString("tr-TR")}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mint modal */}
      {mintTarget && <MintModal col={mintTarget} onClose={() => setMintTarget(null)} />}

      <style>{`
        .nft-page { max-width:1100px;margin:0 auto;padding-bottom:80px; }

        .nft-tabs { display:flex;gap:4px;padding:8px 20px 16px;border-bottom:1px solid var(--border); }
        .nft-tabs button { padding:8px 18px;border-radius:10px;border:none;background:transparent;color:var(--muted);font-size:14px;font-weight:600;cursor:pointer;transition:all .15s; }
        .nft-tabs button.on { background:var(--surface-2);color:var(--text); }

        .nft-controls { display:flex;gap:10px;padding:16px 20px;align-items:center; }
        .nft-search-wrap { flex:1;display:flex;align-items:center;gap:8px;background:var(--surface);border:1.5px solid var(--border);border-radius:10px;padding:8px 12px;color:var(--muted); }
        .nft-search { flex:1;background:none;border:none;outline:none;color:var(--text);font-size:14px; }
        .nft-view-btns { display:flex;background:var(--surface-2);border-radius:10px;overflow:hidden; }
        .nft-view-btns button { padding:9px 12px;border:none;background:transparent;color:var(--muted);cursor:pointer;transition:all .15s; }
        .nft-view-btns button.on { background:var(--surface);color:var(--text); }
        .nft-loading { text-align:center;padding:60px 20px;color:var(--muted); }

        .nft-grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:16px;padding:0 20px; }
        .nft-card { background:var(--surface);border:1.5px solid var(--border);border-radius:16px;overflow:hidden; }
        .nft-card-cover { position:relative;height:130px;overflow:hidden; }
        .nft-card-cover img { width:100%;height:100%;object-fit:cover; }
        .nft-verified-badge { position:absolute;top:8px;right:8px;display:flex;align-items:center;gap:4px;background:rgba(59,130,246,.85);color:#fff;font-size:9px;font-weight:700;padding:3px 7px;border-radius:99px; }
        .nft-status-badge { position:absolute;top:8px;left:8px;font-size:9px;font-weight:700;padding:3px 7px;border-radius:99px; }
        .nft-status-badge.s-active { background:rgba(34,197,94,.15);color:#22c55e; }
        .nft-status-badge.s-soldout { background:rgba(229,72,77,.15);color:#e5484d; }
        .nft-status-badge.s-upcoming { background:rgba(240,180,41,.15);color:var(--accent); }
        .nft-card-body { padding:12px; }
        .nft-card-head { display:flex;align-items:center;gap:10px;margin-bottom:8px; }
        .nft-card-avatar { width:34px;height:34px;border-radius:10px;border:2px solid var(--border); }
        .nft-card-name { font-size:14px;font-weight:700; }
        .nft-card-sym { font-size:11px;color:var(--muted); }
        .nft-card-desc { font-size:12px;color:var(--muted);line-height:1.5;margin-bottom:10px; }
        .nft-card-stats { display:grid;grid-template-columns:repeat(3,1fr);gap:4px;margin-bottom:10px; }
        .nft-cs { background:var(--surface-2);border-radius:8px;padding:5px 8px;text-align:center; }
        .nft-cs-l { display:block;font-size:9px;color:var(--muted);text-transform:uppercase; }
        .nft-cs-v { display:block;font-size:12px;font-weight:700;margin-top:2px; }
        .nft-card-actions { display:flex;gap:8px;align-items:center;flex-wrap:wrap; }
        .nft-mint-btn { display:flex;align-items:center;gap:5px;padding:7px 14px;border-radius:8px;background:var(--accent);color:#1a1300;font-size:12px;font-weight:700;border:none;cursor:pointer; }
        .nft-wl-btn { padding:6px 12px;border-radius:8px;background:var(--surface-2);border:1.5px solid var(--border);color:var(--text);font-size:11px;font-weight:600;cursor:pointer;transition:all .15s; }
        .nft-wl-btn:hover { border-color:var(--accent); }
        .nft-wl-chip { display:flex;align-items:center;gap:4px;font-size:11px;font-weight:600;padding:5px 10px;border-radius:8px; }
        .nft-wl-chip.wl-ok { background:rgba(34,197,94,.1);color:#22c55e; }

        .nft-list { margin:0 20px; }
        .nft-list-hdr { display:grid;grid-template-columns:36px 1fr repeat(3,120px);gap:8px;padding:8px 12px;font-size:11px;font-weight:700;color:var(--muted);text-transform:uppercase;border-bottom:1px solid var(--border); }
        .nft-list-row { display:grid;grid-template-columns:36px 1fr repeat(3,120px);gap:8px;padding:12px;border-bottom:1px solid var(--border);align-items:center;font-size:13px; }
        .nft-list-row .rank { color:var(--muted);font-weight:700;text-align:center; }
        .nft-lr-name { display:flex;align-items:center;gap:10px; }
        .nft-lr-name img { width:32px;height:32px;border-radius:8px;border:1px solid var(--border); }
        .nft-lr-name small { display:block;font-size:11px;color:var(--muted); }
        .s-active { color:#22c55e;font-weight:700; }
        .s-soldout { color:#e5484d;font-weight:700; }
        .s-upcoming { color:var(--accent);font-weight:700; }

        .nft-mint-cta { position:relative;margin:32px 20px 0;border-radius:20px;background:linear-gradient(135deg,rgba(240,180,41,.06),rgba(63,185,80,.04));border:1px solid rgba(240,180,41,.15);text-align:center;padding:36px 24px; }
        .nft-mint-cta h3 { font-size:20px;font-weight:900;margin:10px 0 8px; }
        .nft-mint-cta p { font-size:14px;color:var(--muted);max-width:440px;margin:0 auto 20px;line-height:1.7; }
        .nft-mc-btn { display:inline-flex;padding:12px 28px;border-radius:12px;background:var(--accent);color:#1a1300;font-size:14px;font-weight:800;text-decoration:none; }

        .nft-mp { padding:0 20px; }
        .nft-mp-header { display:flex;align-items:center;justify-content:space-between;margin-bottom:16px; }
        .nft-mp-header h2 { font-size:18px;font-weight:800; }
        .nft-mp-count { font-size:12px;color:var(--muted); }
        .nft-mp-grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:14px; }
        .nft-mp-card { background:var(--surface);border:1.5px solid var(--border);border-radius:14px;overflow:hidden;transition:border-color .15s; }
        .nft-mp-card:hover { border-color:var(--accent); }
        .nft-mp-img-wrap { position:relative;height:180px; }
        .nft-mp-img-wrap img { width:100%;height:100%;object-fit:cover; }
        .nft-rarity-tag { position:absolute;bottom:8px;left:8px;display:flex;align-items:center;gap:3px;font-size:9px;font-weight:700;padding:3px 8px;border-radius:99px;backdrop-filter:blur(4px); }
        .nft-mp-body { padding:12px; }
        .nft-mp-name { font-size:13px;font-weight:700; }
        .nft-mp-col { font-size:11px;color:var(--muted); }
        .nft-mp-owner { font-size:11px;color:var(--muted);margin-bottom:8px; }
        .nft-mp-price { display:flex;align-items:center;gap:5px;font-size:14px;font-weight:800;color:var(--accent);margin-bottom:10px; }
        .nft-buy-btn { width:100%;padding:9px;border-radius:10px;background:var(--accent);color:#1a1300;font-size:13px;font-weight:700;border:none;cursor:pointer; }

        .nft-empty { display:flex;flex-direction:column;align-items:center;gap:10px;padding:80px 20px;text-align:center;color:var(--muted); }
        .nft-empty p { font-size:16px;font-weight:700; }
        .nft-empty span { font-size:13px; }

        .nft-my { padding:0 20px; }
        .nft-my-grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:14px;margin-top:16px; }
        .nft-my-card { background:var(--surface);border:1.5px solid var(--border);border-radius:14px;overflow:hidden; }
        .nft-my-card img { width:100%;height:180px;object-fit:cover; }
        .nft-my-info { padding:12px; }
        .nft-my-name { font-size:13px;font-weight:700; }
        .nft-my-col { font-size:11px;color:var(--muted);margin-bottom:4px; }
        .nft-my-rarity { display:flex;align-items:center;gap:4px;font-size:11px;font-weight:700;margin-bottom:6px; }
        .nft-my-listed { display:flex;align-items:center;gap:5px;font-size:11px;color:var(--accent);font-weight:600; }
        .nft-my-actions { display:flex;align-items:center;justify-content:space-between; }
        .nft-my-date { display:flex;align-items:center;gap:4px;font-size:11px;color:var(--muted); }

        .nft-modal-overlay { position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:1000;display:flex;align-items:center;justify-content:center;padding:16px; }
        .nft-modal { background:var(--surface);border:1px solid var(--border);border-radius:20px;width:100%;max-width:460px;overflow:hidden;position:relative; }
        .nft-modal-close { position:absolute;top:12px;right:12px;background:rgba(0,0,0,.5);border:none;color:#fff;cursor:pointer;width:28px;height:28px;border-radius:50%;font-size:13px;z-index:2;display:flex;align-items:center;justify-content:center; }

        .mint-modal-top { display:flex;gap:14px;padding:20px;border-bottom:1px solid var(--border); }
        .mint-col-img { width:72px;height:72px;border-radius:12px;object-fit:cover;border:2px solid var(--border); }
        .mint-col-name { font-size:16px;font-weight:800; }
        .mint-col-sym { font-size:12px;color:var(--muted); }
        .mint-supply { font-size:12px;color:var(--muted);margin-top:4px; }

        .mint-body { padding:20px;display:flex;flex-direction:column;gap:14px; }
        .mint-wl-toggle { display:flex;align-items:center;gap:10px;background:var(--surface-2);border-radius:10px;padding:10px 14px;cursor:pointer;font-size:13px; }
        .mint-wl-toggle input { accent-color:var(--accent); }
        .mint-wl-save { margin-left:auto;font-size:11px;font-weight:700;color:#22c55e; }

        .mint-qty-row { display:flex;align-items:center;justify-content:space-between; }
        .mint-qty-label { font-size:13px;color:var(--muted); }
        .mint-qty-ctrl { display:flex;align-items:center;gap:12px; }
        .mint-qty-ctrl button { width:32px;height:32px;border-radius:8px;background:var(--surface-2);border:1.5px solid var(--border);color:var(--text);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:16px; }
        .mint-qty-ctrl button:disabled { opacity:.3;cursor:not-allowed; }
        .mint-qty-ctrl span { font-size:18px;font-weight:700;min-width:24px;text-align:center; }

        .mint-price-breakdown { background:var(--surface-2);border-radius:12px;padding:12px 16px;display:flex;flex-direction:column;gap:6px; }
        .mint-pb-row { display:flex;justify-content:space-between;font-size:13px; }
        .mint-pb-row span { color:var(--muted); }
        .mint-pb-row .muted { color:var(--muted); }
        .mint-pb-row.total { border-top:1px solid var(--border);margin-top:4px;padding-top:8px;font-size:15px; }
        .mint-pb-row.total .accent { color:var(--accent); }

        .mint-success { display:flex;align-items:center;gap:8px;background:rgba(34,197,94,.1);color:#22c55e;border-radius:10px;padding:10px 14px;font-size:13px;font-weight:600; }
        .mint-error { background:rgba(229,72,77,.1);color:#e5484d;border-radius:10px;padding:10px 14px;font-size:13px; }
        .mint-btn { width:100%;padding:14px;border-radius:12px;background:var(--accent);color:#1a1300;font-size:15px;font-weight:800;border:none;cursor:pointer;transition:opacity .15s; }
        .mint-btn:disabled { opacity:.5;cursor:not-allowed; }

        @media(max-width:600px){
          .nft-grid { grid-template-columns:1fr 1fr; }
          .nft-mp-grid,.nft-my-grid { grid-template-columns:1fr 1fr; }
          .nft-list-hdr,.nft-list-row { grid-template-columns:28px 1fr repeat(2,90px); }
        }
      `}</style>
    </div>
  );
}
