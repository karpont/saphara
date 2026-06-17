export interface TranscodeJob {
    id: string;
    inputPath: string;
    outputPath: string;
    preset: "reel" | "hd" | "sd" | "audio";
    status: "queued" | "processing" | "done" | "error";
    progress: number;
    error?: string;
}
/** Esik (MB) — bunun ustu sunucuda islenir, alti tarayicida. */
export declare const SERVER_TRANSCODE_THRESHOLD_MB = 50;
export declare function enqueueTranscode(input: string, output: string, preset: TranscodeJob["preset"]): TranscodeJob;
export declare function getJob(id: string): TranscodeJob | undefined;
