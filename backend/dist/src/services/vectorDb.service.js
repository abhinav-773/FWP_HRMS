import { ChromaClient } from 'chromadb';
import { pipeline, env } from '@xenova/transformers';
env.allowLocalModels = true;
env.useBrowserCache = false;
const chroma = new ChromaClient({
    path: process.env.CHROMA_URL || "http://localhost:8000"
});
// We use Xenova/Transformers.js for local embeddings (no API key required)
let extractor = null;
// Custom embedding function compatible with ChromaDB v3
class XenovaEmbeddingFunction {
    async generate(texts) {
        await VectorDbService.initialize();
        const results = [];
        for (const text of texts) {
            const output = await extractor(text, { pooling: 'mean', normalize: true });
            results.push(Array.from(output.data));
        }
        return results;
    }
}
const embeddingFunction = new XenovaEmbeddingFunction();
export class VectorDbService {
    static async initialize() {
        if (!extractor) {
            console.log("Loading embedding model (this may take a minute on first run)...");
            extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
            console.log("Embedding model loaded.");
        }
    }
    static async getEmbedding(text) {
        await this.initialize();
        const output = await extractor(text, { pooling: 'mean', normalize: true });
        return Array.from(output.data);
    }
    static async getCollection(collectionName) {
        // ChromaDB v3 API: use embeddingFunction parameter
        return await chroma.getOrCreateCollection({
            name: collectionName,
            embeddingFunction: embeddingFunction,
            metadata: { "hnsw:space": "cosine" }
        });
    }
    static async addJobEmbedding(jobId, text, metadata) {
        const collection = await this.getCollection('jobs');
        const embedding = await this.getEmbedding(text);
        await collection.upsert({
            ids: [jobId],
            embeddings: [embedding],
            metadatas: [metadata],
            documents: [text]
        });
    }
    static async addCandidateEmbedding(candidateId, text, metadata) {
        const collection = await this.getCollection('candidates');
        const embedding = await this.getEmbedding(text);
        await collection.upsert({
            ids: [candidateId],
            embeddings: [embedding],
            metadatas: [metadata],
            documents: [text]
        });
    }
    static async searchCandidates(jobText, limit = 10) {
        const collection = await this.getCollection('candidates');
        const queryEmbedding = await this.getEmbedding(jobText);
        return await collection.query({
            queryEmbeddings: [queryEmbedding],
            nResults: limit,
        });
    }
    static async getCandidateSimilarity(candidateId, jobText) {
        try {
            await this.initialize();
            // Get the candidate's stored embedding by ID
            const collection = await this.getCollection('candidates');
            const candidateData = await collection.get({
                ids: [candidateId],
                include: ['embeddings']
            });
            if (!candidateData.embeddings || candidateData.embeddings.length === 0) {
                console.warn(`No embedding found for candidate ${candidateId}`);
                return 0;
            }
            const candidateEmbedding = candidateData.embeddings[0];
            // Compute the job text embedding
            const jobEmbedding = await this.getEmbedding(jobText);
            if (!jobEmbedding)
                return 0;
            // Compute cosine similarity manually
            const dotProduct = candidateEmbedding.reduce((sum, val, i) => sum + val * (jobEmbedding[i] ?? 0), 0);
            const magA = Math.sqrt(candidateEmbedding.reduce((sum, val) => sum + val * val, 0));
            const magB = Math.sqrt(jobEmbedding.reduce((sum, val) => sum + val * val, 0));
            if (magA === 0 || magB === 0)
                return 0;
            return dotProduct / (magA * magB);
        }
        catch (err) {
            console.warn("ChromaDB similarity query failed:", err);
        }
        return 0;
    }
}
//# sourceMappingURL=vectorDb.service.js.map