export declare class VectorDbService {
    static initialize(): Promise<void>;
    static getEmbedding(text: string): Promise<number[]>;
    static getCollection(collectionName: string): Promise<import("chromadb").Collection>;
    static addJobEmbedding(jobId: string, text: string, metadata: any): Promise<void>;
    static addCandidateEmbedding(candidateId: string, text: string, metadata: any): Promise<void>;
    static searchCandidates(jobText: string, limit?: number): Promise<import("chromadb").QueryResult<import("chromadb").Metadata>>;
    static getCandidateSimilarity(candidateId: string, jobText: string): Promise<number>;
}
//# sourceMappingURL=vectorDb.service.d.ts.map