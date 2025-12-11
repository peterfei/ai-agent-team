import { IEmbeddingService, ModelInfo } from '../../src/core/embedding-service';

export class MockEmbeddingService implements IEmbeddingService {
  async embed(text: string): Promise<number[]> {
    const dim = 384;
    const vector = new Array(dim).fill(0);
    
    if (text.toLowerCase().includes('apple') || text.toLowerCase().includes('fruit')) {
      vector[0] = 0.9;
    } else if (text.toLowerCase().includes('car') || text.toLowerCase().includes('vehicle')) {
      vector[1] = 0.9;
    } else if (text.toLowerCase().includes('banana')) {
      vector[2] = 0.9;
    } else if (text.toLowerCase().includes('healthy') || text.toLowerCase().includes('snack')) {
      vector[0] = 0.8;
      vector[2] = 0.8;
    } else if (text.toLowerCase().includes('problem') || text.toLowerCase().includes('transport')) {
      vector[1] = 0.8;
    } else {
      vector[3] = 0.9;
    }
    
    const norm = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
    return vector.map(v => v / norm);
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    return Promise.all(texts.map(t => this.embed(t)));
  }

  getDimensions(): number {
    return 384;
  }

  getModelInfo(): ModelInfo {
    return {
      name: 'mock-embedding-model',
      version: '1.0',
      dimensions: 384,
      maxTokens: 256,
    };
  }
}
