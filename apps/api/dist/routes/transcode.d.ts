import type { FastifyInstance } from "fastify";
/**
 * Transcoding uclari. Istemci once /transcode/should-server ile karar verir:
 * buyuk dosya → sunucu (bu uclar), kucuk → tarayici (ffmpeg.wasm).
 */
export declare function registerTranscodeRoutes(app: FastifyInstance): Promise<void>;
