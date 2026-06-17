export interface InitUpload {
    uploadId: string;
    key: string;
    s3UploadId: string;
}
/** Cok parcali yuklemeyi baslatir, S3 uploadId doner. */
export declare function initMultipart(userId: string, ext: string, contentType: string): Promise<InitUpload>;
/** Belirli parca icin imzali PUT URL uretir (5 dk gecerli). */
export declare function signPartUrl(key: string, s3UploadId: string, partNumber: number): Promise<string>;
/** Tum parcalar yuklendikten sonra yuklemeyi tamamlar; nihai URL doner. */
export declare function completeMultipart(key: string, s3UploadId: string, parts: {
    ETag: string;
    PartNumber: number;
}[]): Promise<{
    url: string;
}>;
/** Hata/iptal durumunda yarim yuklemeyi temizler. */
export declare function abortMultipart(key: string, s3UploadId: string): Promise<void>;
