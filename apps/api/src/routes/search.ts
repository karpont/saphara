import type { FastifyInstance } from "fastify";
import { prisma } from "../db/client";

export async function registerSearchRoutes(app: FastifyInstance) {

  /* ── Tam arama (kullanıcı, gönderi, hashtag, NFT, blog) ─────── */
  app.get("/search", async (req) => {
    const { q = "", type = "all", limit = "20", cursor } =
      req.query as { q?: string; type?: string; limit?: string; cursor?: string };

    if (!q.trim()) return { users: [], posts: [], hashtags: [], collections: [], blogs: [], total: 0 };

    const take = Math.min(Number(limit), 50);
    const term = q.trim();
    const termLower = term.toLowerCase().replace(/^#/, "");

    const [users, posts, hashtags, collections, blogs] = await Promise.all([

      /* Kullanıcılar */
      (type === "all" || type === "users") ? prisma.user.findMany({
        where: {
          deletionRequestedAt: null,
          OR: [
            { handle: { contains: term, mode: "insensitive" } },
            { name:   { contains: term, mode: "insensitive" } },
            { bio:    { contains: term, mode: "insensitive" } },
          ],
        },
        take: type === "users" ? take : 8,
        select: {
          id: true, handle: true, name: true, avatarUrl: true,
          verified: true, bio: true,
          _count: { select: { followers: true, posts: true } },
        },
      }) : Promise.resolve([]),

      /* Gönderiler */
      (type === "all" || type === "posts") ? prisma.post.findMany({
        where: {
          text: { contains: term, mode: "insensitive" },
          author: { deletionRequestedAt: null },
        },
        take: type === "posts" ? take : 12,
        ...(cursor && type === "posts" ? { skip: 1, cursor: { id: cursor } } : {}),
        orderBy: { createdAt: "desc" },
        include: {
          author: { select: { handle: true, name: true, avatarUrl: true, verified: true } },
        },
      }) : Promise.resolve([]),

      /* Hashtag'ler */
      (type === "all" || type === "hashtags") ? prisma.hashtag.findMany({
        where: { tag: { contains: termLower, mode: "insensitive" } },
        orderBy: { postCount: "desc" },
        take: type === "hashtags" ? take : 8,
        select: { id: true, tag: true, postCount: true },
      }) : Promise.resolve([]),

      /* NFT Koleksiyonlar */
      (type === "all" || type === "nft") ? prisma.nftCollection.findMany({
        where: {
          OR: [
            { name:        { contains: term, mode: "insensitive" } },
            { symbol:      { contains: term, mode: "insensitive" } },
            { description: { contains: term, mode: "insensitive" } },
          ],
        },
        take: type === "nft" ? take : 5,
        select: {
          id: true, name: true, symbol: true, imageUrl: true,
          status: true, minted: true, maxSupply: true, royaltyPct: true,
          creator: { select: { handle: true, name: true, avatarUrl: true, verified: true } },
        },
      }) : Promise.resolve([]),

      /* Blog yazıları */
      (type === "all" || type === "blog") ? prisma.blogPost.findMany({
        where: {
          published: true,
          OR: [
            { title:   { contains: term, mode: "insensitive" } },
            { excerpt: { contains: term, mode: "insensitive" } },
            { content: { contains: term, mode: "insensitive" } },
          ],
        },
        take: type === "blog" ? take : 5,
        orderBy: { views: "desc" },
        select: {
          id: true, slug: true, title: true, excerpt: true,
          coverUrl: true, category: true, readingMins: true,
          likes: true, views: true, createdAt: true,
          author: { select: { handle: true, name: true, avatarUrl: true, verified: true } },
        },
      }) : Promise.resolve([]),
    ]);

    const nextCursor = (type === "posts" && posts.length === take)
      ? (posts as any[])[posts.length - 1]?.id ?? null
      : null;

    return {
      users,
      posts,
      hashtags,
      collections,
      blogs,
      nextCursor,
      total: users.length + posts.length + hashtags.length + collections.length + blogs.length,
    };
  });

  /* ── Önerilen aramalar / trending queries ───────────────────── */
  app.get("/search/suggestions", async () => {
    const [topHashtags, topPosts] = await Promise.all([
      prisma.hashtag.findMany({
        orderBy: { postCount: "desc" },
        take: 10,
        select: { tag: true, postCount: true },
      }),
      prisma.post.findMany({
        where: { mediaType: { in: ["video", "image"] } },
        orderBy: { likes: "desc" },
        take: 5,
        select: { id: true, text: true },
      }),
    ]);

    return {
      trendingHashtags: topHashtags,
      suggestedQueries: topPosts.map((p: any) => {
        const tags = (p.text?.match(/#[\wÀ-ɏ]+/g) ?? []).slice(0, 2);
        return tags;
      }).flat().slice(0, 8),
    };
  });
}
