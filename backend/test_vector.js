import { VectorDbService } from './src/services/vectorDb.service.js';

async function main() {
  console.log("Testing ChromaDB v3 with custom embedding function...");
  
  try {
    await VectorDbService.addJobEmbedding(
      'test-job-123', 
      'Senior React Developer JavaScript TypeScript Node.js', 
      { title: 'Test Job' }
    );
    console.log("✅ Job embedding stored successfully!");
    
    await VectorDbService.addCandidateEmbedding(
      'test-candidate-123',
      'I am a senior React developer with 5 years of JavaScript TypeScript experience',
      { name: 'Test Candidate' }
    );
    console.log("✅ Candidate embedding stored successfully!");
    
    const similarity = await VectorDbService.getCandidateSimilarity(
      'test-candidate-123',
      'Senior React Developer JavaScript TypeScript Node.js'
    );
    console.log(`✅ Similarity score: ${Math.round(similarity * 100)}%`);
    
  } catch (e) {
    console.error("❌ Error:", e);
  }
}

main();
