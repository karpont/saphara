"use client";

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

export interface FeedPost {
  id: string;
  text?: string;
  mediaUrl?: string;
  likes: number;
  comments: number;
  createdAt: string;
  author: { handle: string; name: string; avatarUrl?: string; verified: boolean; walletAddress?: string };
}
interface FeedPage { items: FeedPost[]; nextCursor: string | null }

/** Sonsuz kaydirmali akis. */
export function useFeed(scope: "all" | "following" = "all") {
  return useInfiniteQuery({
    queryKey: ["feed", scope],
    queryFn: ({ pageParam }) =>
      api.get<FeedPage>(`/feed?limit=20&scope=${scope}${pageParam ? `&cursor=${pageParam}` : ""}`),
    initialPageParam: "" as string,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  });
}

/** Gonderi olustur (basariyla feed'i tazeler). */
export function useCreatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { text?: string; mediaUrl?: string; mediaUrls?: string[]; mediaType?: string }) =>
      api.post<FeedPost>("/posts", body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["feed"] }),
  });
}

/** Begeni (optimistik). */
export function useLikePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post<{ likes: number }>(`/posts/${id}/like`),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["feed"] });
      const prev = qc.getQueryData(["feed"]);
      qc.setQueryData(["feed"], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((pg: FeedPage) => ({
            ...pg,
            items: pg.items.map((p) => (p.id === id ? { ...p, likes: p.likes + 1 } : p)),
          })),
        };
      });
      return { prev };
    },
    onError: (_e, _id, ctx) => ctx?.prev && qc.setQueryData(["feed"], ctx.prev),
  });
}

/** Profil getir. */
export function useProfile(handle: string) {
  return useQuery({
    queryKey: ["profile", handle],
    queryFn: () => api.get<any>(`/users/${handle}`),
    enabled: !!handle,
  });
}

/** Takip et / birak. */
export function useToggleFollow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, follow }: { id: string; follow: boolean }) =>
      follow ? api.post(`/follow/${id}`) : api.del(`/follow/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile"] }),
  });
}

/** Bildirim gecmisi (kalici). */
export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: () => api.get<{ items: any[]; unread: number }>("/notifications"),
    refetchInterval: 30000,
  });
}

export function useMarkNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post("/notifications/read"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

/** Sohbet listesi. */
export function useConversations() {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: () => api.get<{ threads: any[] }>("/conversations"),
  });
}

/** Belirli kullaniciyla mesaj gecmisi. */
export function useChat(withId: string) {
  return useQuery({
    queryKey: ["chat", withId],
    queryFn: () => api.get<{ items: any[] }>(`/messages/${withId}`),
    enabled: !!withId,
  });
}

export function useSendMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { to: string; text: string }) => api.post("/messages", body),
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: ["chat", v.to] }),
  });
}

/** Market ilanlari. */
export function useListings(status = "Listed") {
  return useQuery({
    queryKey: ["listings", status],
    queryFn: () => api.get<{ items: any[] }>(`/listings?status=${status}`),
  });
}

export function useCreateListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { title: string; description?: string; pricePart: string; imageUrl?: string }) =>
      api.post("/listings", body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["listings"] }),
  });
}

/** Zincir uzeri satin alma sonrasi durum senkronu. */
export function useSyncListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, onchainId, status }: { id: string; onchainId?: string; status?: string }) =>
      api.post(`/listings/${id}/sync`, { onchainId, status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["listings"] }),
  });
}

/** Guncel gercek dunya haberleri. */
export function useNews(category = "general", lang = "tr") {
  return useQuery({
    queryKey: ["news", category, lang],
    queryFn: () => api.get<{ items: any[] }>(`/news?category=${category}&lang=${lang}`),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}

/** Yorumlar. */
export function useComments(postId: string) {
  return useQuery({
    queryKey: ["comments", postId],
    queryFn: () => api.get<{ items: any[] }>(`/posts/${postId}/comments`),
    enabled: !!postId,
  });
}
export function useAddComment(postId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (text: string) => api.post(`/posts/${postId}/comments`, { text }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["comments", postId] }),
  });
}

/** Anket oylama. */
export function useVotePoll(pollId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (optionId: string) => api.post(`/polls/options/${optionId}/vote`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["poll-results", pollId] }),
  });
}
export function usePollResults(pollId: string) {
  return useQuery({
    queryKey: ["poll-results", pollId],
    queryFn: () => api.get<{ total: number; options: any[] }>(`/polls/${pollId}/results`),
    enabled: !!pollId,
  });
}

/** Sanal magaza urunleri. */
export function useStore(kind?: string) {
  return useQuery({
    queryKey: ["store", kind ?? "all"],
    queryFn: () => api.get<{ items: any[] }>(`/store${kind ? `?kind=${kind}` : ""}`),
  });
}
export function useInventory() {
  return useQuery({ queryKey: ["inventory"], queryFn: () => api.get<{ items: any[] }>("/inventory") });
}
export function useBuyStoreItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, txHash }: { itemId: string; txHash?: string }) =>
      api.post(`/store/${itemId}/buy`, { txHash }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["inventory"] }); },
  });
}
export function useEquipItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (invId: string) => api.post(`/inventory/${invId}/equip`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["inventory"] }),
  });
}

/** Yer imleri. */
export function useBookmarks() {
  return useQuery({ queryKey: ["bookmarks"], queryFn: () => api.get<{ items: any[] }>("/bookmarks") });
}
export function useToggleBookmark() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, on }: { postId: string; on: boolean }) =>
      on ? api.post(`/bookmarks/${postId}`) : api.del(`/bookmarks/${postId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bookmarks"] }),
  });
}

/** Gonderiye anket ekleme. */
export function useCreatePoll() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, question, options }: { postId: string; question: string; options: string[] }) =>
      api.post(`/posts/${postId}/poll`, { question, options }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["feed"] }),
  });
}

/** Reels akisi (gercek API). */
export function useReels() {
  return useQuery({ queryKey: ["reels"], queryFn: () => api.get<{ items: any[] }>("/reels") });
}

/** Owner: sahip miyim? */
export function useIsOwner() {
  return useQuery({ queryKey: ["owner-whoami"], queryFn: () => api.get<{ isOwner: boolean }>("/owner/whoami") });
}
/** Owner: gozcu bot raporu. */
export function useBotReport() {
  return useQuery({
    queryKey: ["owner-report"],
    queryFn: () => api.get<any>("/owner/report"),
    refetchInterval: 60000, // dakikada bir tazele
  });
}
/** PART fiyati (acik okuma). */
export function usePartPrice() {
  return useQuery({ queryKey: ["price"], queryFn: () => api.get<{ partUsdRate: number; floor: number }>("/price") });
}
/** Owner: PART fiyati ayarla. */
export function useSetPartPrice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (rate: number) => api.post("/owner/price", { rate }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["price"] }); qc.invalidateQueries({ queryKey: ["store"] }); },
  });
}
/** Owner: kullanici listesi. */
export function useOwnerUsers() {
  return useQuery({ queryKey: ["owner-users"], queryFn: () => api.get<{ users: any[] }>("/owner/users") });
}

/** Aktif story halkalari. */
export function useStories() {
  return useQuery({ queryKey: ["stories"], queryFn: () => api.get<{ rings: any[] }>("/stories"), refetchInterval: 60000 });
}
export function useCreateStory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { mediaUrl: string; mediaType?: string; caption?: string }) => api.post("/stories", body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["stories"] }),
  });
}

/** Kendi profil bilgilerim. */
export function useMe() {
  return useQuery({ queryKey: ["me"], queryFn: () => api.get<any>("/me") });
}
export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { name?: string; bio?: string; avatarUrl?: string }) => api.patch("/me", body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["me"] }); qc.invalidateQueries({ queryKey: ["profile"] }); },
  });
}

// ────── Auth (re-export for convenience) ──────
export { useAuth } from "../features/auth/AuthContext";

// ────── Arama ──────
export function useSearchQuery(query: string, type: "all" | "users" | "posts" = "all") {
  return useQuery({
    queryKey: ["search", query, type],
    queryFn: () => api.get<{ users: any[]; posts: any[]; nextCursor: string | null; total: number }>(
      `/search?q=${encodeURIComponent(query)}&type=${type}`
    ),
    enabled: query.length >= 2,
    staleTime: 30_000,
  });
}

// ────── Bildirim Tercihleri ──────
export function useNotifPrefs() {
  return useQuery({ queryKey: ["notif-prefs"], queryFn: () => api.get<any>("/notifications/settings") });
}
export function useSaveNotifPrefs() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { likes?:boolean; comments?:boolean; follows?:boolean; tips?:boolean; dm?:boolean; reposts?:boolean }) =>
      api.post("/notifications/settings", body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notif-prefs"] }),
  });
}

// ────── KVKK ──────
export function useConsentRecord() {
  return useQuery({ queryKey: ["consent"], queryFn: () => api.get<any>("/privacy/consent") });
}
export function useSaveConsent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { analytics: boolean; marketing: boolean }) => api.post("/privacy/consent", body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["consent"] }),
  });
}
export function useRequestDeletion() {
  return useMutation({ mutationFn: () => api.post("/me/delete-request") });
}

// ────── Trending ──────
export function useTrending() {
  return useQuery({
    queryKey: ["trending"],
    queryFn: () => api.get<{ hashtags: any[]; posts: any[] }>("/trending"),
    staleTime: 5 * 60_000,
    refetchInterval: 5 * 60_000,
  });
}

// ────── Repost ──────
export function useRepost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, on }: { id: string; on: boolean }) =>
      on ? api.post(`/posts/${id}/repost`) : api.del(`/posts/${id}/repost`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["feed"] }),
  });
}

// ────── Kullanıcı Gönderileri / Reels ──────
export function useUserPosts(handle: string) {
  return useInfiniteQuery({
    queryKey: ["user-posts", handle],
    queryFn: ({ pageParam }) =>
      api.get<{ items: any[]; nextCursor: string | null }>(
        `/users/${handle}/posts?limit=12${pageParam ? `&cursor=${pageParam}` : ""}`
      ),
    initialPageParam: "" as string,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    enabled: !!handle,
  });
}
export function useUserReels(handle: string) {
  return useInfiniteQuery({
    queryKey: ["user-reels", handle],
    queryFn: ({ pageParam }) =>
      api.get<{ items: any[]; nextCursor: string | null }>(
        `/users/${handle}/reels?limit=12${pageParam ? `&cursor=${pageParam}` : ""}`
      ),
    initialPageParam: "" as string,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    enabled: !!handle,
  });
}

// ────── Reklam Yönetimi ──────
export function useAdsFeed(limit = 3) {
  return useQuery({
    queryKey: ["ads-feed", limit],
    queryFn: () => api.get<{ items: any[] }>(`/ads/feed?limit=${limit}`),
    staleTime: 60_000,
  });
}
export function useMyCampaigns() {
  return useQuery({ queryKey: ["my-campaigns"], queryFn: () => api.get<{ items: any[] }>("/ads/campaigns") });
}
export function useCampaignDetail(id: string) {
  return useQuery({
    queryKey: ["campaign", id],
    queryFn: () => api.get<any>(`/ads/campaigns/${id}`),
    enabled: !!id,
  });
}
export function useCreateCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: any) => api.post<any>("/ads/campaigns", body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-campaigns"] }),
  });
}
export function useCampaignAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: "pause" | "resume" | "end" }) =>
      api.post(`/ads/campaigns/${id}/${action}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-campaigns"] }),
  });
}

// ────── Mesaj Reaksiyonu + Okundu ──────
export function useReactMessage() {
  return useMutation({
    mutationFn: ({ id, emoji }: { id: string; emoji: string }) => api.post(`/messages/${id}/react`, { emoji }),
  });
}
export function useMarkMessageSeen() {
  return useMutation({
    mutationFn: (id: string) => api.patch(`/messages/${id}/seen`, {}),
  });
}

// ────── Rozetler ──────
export function useMyBadges() {
  return useQuery({ queryKey: ["my-badges"], queryFn: () => api.get<{ badges: any[] }>("/me/badges") });
}
export function useUserBadges(handle: string) {
  return useQuery({
    queryKey: ["badges", handle],
    queryFn: () => api.get<{ badges: any[] }>(`/badges/${handle}`),
    enabled: !!handle,
  });
}

// ────── Analytics ──────
export function useMyAnalytics() {
  return useQuery({
    queryKey: ["analytics-me"],
    queryFn: () => api.get<{
      followers: number; followerDelta7d: number; impressions: number;
      totalLikes: number; earningsPart: number; earningsUsdt: string;
      series: { date: string; likes: number; comments: number; reposts: number; views: number }[];
    }>("/analytics/me"),
    staleTime: 2 * 60_000,
    refetchInterval: 2 * 60_000,
  });
}
export function useFollowerSeries() {
  return useQuery({
    queryKey: ["analytics-followers"],
    queryFn: () => api.get<{ date: string; count: number }[]>("/analytics/followers"),
    staleTime: 5 * 60_000,
  });
}

// ────── Piyasa Verileri (PART + BNB + Kripto) ──────
export function usePartMarketData() {
  return useQuery({
    queryKey: ["part-market"],
    queryFn: () => api.get<any>("/market-data/part"),
    staleTime: 60_000,
    refetchInterval: 60_000,
  });
}
export function useBnbData() {
  return useQuery({
    queryKey: ["bnb-data"],
    queryFn: () => api.get<any>("/market-data/bnb"),
    staleTime: 60_000,
    refetchInterval: 60_000,
  });
}
export function useTopCrypto() {
  return useQuery({
    queryKey: ["top-crypto"],
    queryFn: () => api.get<{ items: any[] }>("/market-data/crypto"),
    staleTime: 60_000,
  });
}
export function useMarketSummary() {
  return useQuery({
    queryKey: ["market-summary"],
    queryFn: () => api.get<any>("/market-data/summary"),
    staleTime: 60_000,
    refetchInterval: 2 * 60_000,
  });
}
export function useSuggestedUsers() {
  return useQuery({
    queryKey: ["suggested-users"],
    queryFn: () => api.get<{ users: any[] }>("/users/suggested"),
    staleTime: 5 * 60_000,
  });
}

export function useSearchUsers(q: string) {
  return useQuery({
    queryKey: ["search-users", q],
    queryFn: () => api.get<{ users: any[] }>(`/search?type=users&q=${encodeURIComponent(q)}`),
    enabled: q.trim().length >= 2,
    staleTime: 30_000,
  });
}

// ────── NFT ──────
export function useNftCollections(status?: string) {
  return useQuery({
    queryKey: ["nft-collections", status ?? "all"],
    queryFn: () => api.get<{ collections: any[] }>(`/nft/collections${status ? `?status=${status}` : ""}`),
    staleTime: 60_000,
  });
}
export function useNftCollection(id: string) {
  return useQuery({
    queryKey: ["nft-collection", id],
    queryFn: () => api.get<any>(`/nft/collections/${id}`),
    enabled: !!id,
  });
}
export function useNftCollectionTokens(id: string, listed?: boolean) {
  return useQuery({
    queryKey: ["nft-tokens", id, listed],
    queryFn: () => api.get<{ tokens: any[] }>(`/nft/collections/${id}/tokens${listed ? "?listed=true" : ""}`),
    enabled: !!id,
  });
}
export function useMintNft() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ collectionId, quantity, useWhitelist }: { collectionId: string; quantity: number; useWhitelist?: boolean }) =>
      api.post<any>(`/nft/collections/${collectionId}/mint`, { quantity, useWhitelist }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["nft-collections"] });
      qc.invalidateQueries({ queryKey: ["my-nfts"] });
    },
  });
}
export function useWhitelistCheck(collectionId: string) {
  return useQuery({
    queryKey: ["whitelist-check", collectionId],
    queryFn: () => api.get<{ whitelisted: boolean; remaining: number; slots: number; used: number }>(`/nft/collections/${collectionId}/whitelist`),
    enabled: !!collectionId,
  });
}
export function useWhitelistApply() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (collectionId: string) => api.post<any>(`/nft/collections/${collectionId}/whitelist/apply`),
    onSuccess: (_d, id) => qc.invalidateQueries({ queryKey: ["whitelist-check", id] }),
  });
}
export function useMyNfts() {
  return useQuery({ queryKey: ["my-nfts"], queryFn: () => api.get<{ tokens: any[] }>("/nft/my") });
}
export function useNftMarketplace(rarity?: string) {
  return useQuery({
    queryKey: ["nft-marketplace", rarity ?? "all"],
    queryFn: () => api.get<{ tokens: any[] }>(`/nft/marketplace${rarity ? `?rarity=${rarity}` : ""}`),
    staleTime: 30_000,
  });
}
export function useListNft() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ tokenId, price }: { tokenId: string; price: number }) =>
      api.post<any>(`/nft/tokens/${tokenId}/list`, { price }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["my-nfts"] }); qc.invalidateQueries({ queryKey: ["nft-marketplace"] }); },
  });
}
export function useBuyNft() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (tokenId: string) => api.post<any>(`/nft/tokens/${tokenId}/buy`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["nft-marketplace"] }); qc.invalidateQueries({ queryKey: ["my-nfts"] }); },
  });
}

// ────── DAO ──────
export function useDaoProposals(status?: string) {
  return useQuery({
    queryKey: ["dao-proposals", status ?? "all"],
    queryFn: () => api.get<{ proposals: any[] }>(`/dao/proposals${status ? `?status=${status}` : ""}`),
    staleTime: 30_000,
  });
}
export function useDaoProposal(id: string) {
  return useQuery({
    queryKey: ["dao-proposal", id],
    queryFn: () => api.get<any>(`/dao/proposals/${id}`),
    enabled: !!id,
  });
}
export function useCreateDaoProposal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { title: string; description: string; type?: string; endsAt: string; tags?: string[]; treasuryAmount?: number }) =>
      api.post<any>("/dao/proposals", body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dao-proposals"] }),
  });
}
export function useVoteProposal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, vote, reason }: { id: string; vote: "for" | "against" | "abstain"; reason?: string }) =>
      api.post<any>(`/dao/proposals/${id}/vote`, { vote, reason }),
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ["dao-proposal", v.id] });
      qc.invalidateQueries({ queryKey: ["dao-proposals"] });
    },
  });
}
export function useMyDaoVote(proposalId: string) {
  return useQuery({
    queryKey: ["my-dao-vote", proposalId],
    queryFn: () => api.get<{ voted: boolean; vote: any }>(`/dao/proposals/${proposalId}/my-vote`),
    enabled: !!proposalId,
  });
}
export function useDaoStats() {
  return useQuery({ queryKey: ["dao-stats"], queryFn: () => api.get<any>("/dao/stats"), staleTime: 60_000 });
}

// ────── Referral ──────
export function useMyReferral() {
  return useQuery({ queryKey: ["my-referral"], queryFn: () => api.get<any>("/referral/my") });
}
export function useApplyReferral() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (referralCode: string) => api.post<any>("/referral/apply", { referralCode }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-referral"] }),
  });
}
export function useClaimReferral() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<any>("/referral/claim"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-referral"] }),
  });
}
export function useReferralLeaderboard() {
  return useQuery({
    queryKey: ["referral-leaderboard"],
    queryFn: () => api.get<{ leaderboard: any[] }>("/referral/leaderboard"),
    staleTime: 5 * 60_000,
  });
}
export function useReferralStats() {
  return useQuery({
    queryKey: ["referral-stats"],
    queryFn: () => api.get<any>("/referral/stats"),
    staleTime: 5 * 60_000,
  });
}

// ─── Staking ────────────────────────────────────────────────────────────────
export function useStakingPools() {
  return useQuery({
    queryKey: ["staking-pools"],
    queryFn: () => api.get<{ pools: any[]; active: boolean; message: string }>("/staking/pools"),
    staleTime: 10 * 60_000,
  });
}
export function useStakingStats() {
  return useQuery({
    queryKey: ["staking-stats"],
    queryFn: () => api.get<{ totalTvl: number; totalStakers: number; avgApy: number; active: boolean; earlyAccessCount: number }>("/staking/stats"),
    staleTime: 5 * 60_000,
  });
}
export function useMyStakingNotify() {
  return useQuery({
    queryKey: ["staking-my-notify"],
    queryFn: () => api.get<{ registered: boolean; position: number | null; total: number }>("/staking/my-notify"),
    staleTime: 60_000,
  });
}
export function useRegisterStakingNotify() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<{ ok: boolean; registered: boolean; alreadyRegistered: boolean; position: number; total: number }>("/staking/notify", {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["staking-my-notify"] });
      qc.invalidateQueries({ queryKey: ["staking-stats"] });
    },
  });
}
export function useMyStakingPositions() {
  return useQuery({
    queryKey: ["staking-positions"],
    queryFn: () => api.get<{ positions: any[]; active: boolean }>("/staking/my-positions"),
    staleTime: 30_000,
  });
}

export function useMarketAnalysis() {
  return useQuery({
    queryKey: ["market-analysis"],
    queryFn:  () => api.get<{
      sentiment: string;
      sentimentScore: number;
      fearGreedValue: number;
      fearGreedLabel: string;
      topHeadlines: string[];
      summary: string;
      marketNote: string;
    }>("/news/market-analysis"),
    staleTime:       10 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
  });
}

export function useStakingTiers() {
  return useQuery({
    queryKey: ["staking-tiers"],
    queryFn:  () => api.get<{ tiers: any[] }>("/staking/tiers"),
    staleTime: 60 * 60 * 1000,
  });
}

export function useNftInfo() {
  return useQuery({
    queryKey: ["nft-info"],
    queryFn:  () => api.get<any>("/nft/info"),
    staleTime: 60 * 60 * 1000,
  });
}

export function useAdsPricing() {
  return useQuery({
    queryKey: ["ads-pricing"],
    queryFn:  () => api.get<any>("/ads/pricing"),
    staleTime: 60 * 60 * 1000,
  });
}

export function useLaunchpadInfo() {
  return useQuery({
    queryKey: ["launchpad-info"],
    queryFn:  () => api.get<any>("/launchpad/info"),
    staleTime: 60 * 60 * 1000,
  });
}
