import { pipeline, FeatureExtractionPipeline, env } from '@xenova/transformers';
import path from 'path';
import fs from 'fs';

/**
 * Embedding Service Interface
 */
export interface IEmbeddingService {
  /**
   * Embed a single text string
   */
  embed(text: string): Promise<number[]>;

  /**
   * Embed multiple text strings in batch (performance optimized)
   */
  embedBatch(texts: string[]): Promise<number[][]>;

  /**
   * Get the dimensions of the embedding model
   */
  getDimensions(): number;

  /**
   * Get model information
   */
  getModelInfo(): ModelInfo;
}

export interface ModelInfo {
  name: string;
  version: string;
  dimensions: number;
  maxTokens: number;
}

export class XenovaEmbeddingService implements IEmbeddingService {
  private extractor: FeatureExtractionPipeline | null = null;
  private readonly modelId = 'Xenova/all-MiniLM-L6-v2';
  private initPromise: Promise<void> | null = null;

  /**
   * Lazy load the model (initialize on first call)
   */
  private async ensureInitialized(): Promise<void> {
    if (this.extractor) return;

    if (!this.initPromise) {
      this.initPromise = this.initialize();
    }

    await this.initPromise;
  }

  private async initialize(): Promise<void> {
    console.log(`[EmbeddingService] Loading model: ${this.modelId}...`);
    const start = Date.now();

    // Configure local path
    // Try to find 'models' directory relative to this file
    // src/core/embedding-service.ts -> ../../models
    // dist/core/embedding-service.js -> ../../models
    const projectRoot = path.resolve(__dirname, '../../');
    const localModelDir = path.join(projectRoot, 'models');
    const modelPath = path.join(localModelDir, this.modelId);

    // Check if local model exists
    if (fs.existsSync(modelPath)) {
        console.log(`[EmbeddingService] Found local model at: ${modelPath}`);
        env.localModelPath = localModelDir;
        env.allowRemoteModels = false; // Force local usage
    } else {
        console.log(`[EmbeddingService] Local model not found, attempting remote download...`);
        // Use default behavior (remote download to cache)
    }

    this.extractor = await pipeline(
      'feature-extraction',
      this.modelId,
      {
        quantized: true,
        // @ts-ignore
        progress_callback: (progress: any) => {
          if (progress.status === 'downloading') {
            console.log(`[EmbeddingService] Downloading: ${progress.file} (${progress.progress}%)`);
          }
        }
      }
    );

    console.log(`[EmbeddingService] Model loaded in ${Date.now() - start}ms`);
  }

  async embed(text: string): Promise<number[]> {
    await this.ensureInitialized();
    if (!this.extractor) throw new Error('Model failed to initialize');

    // Preprocess text
    const cleaned = this.cleanText(text);

    // Generate embedding
    const output = await this.extractor(cleaned, {
      pooling: 'mean',      // Mean pooling
      normalize: true       // L2 normalization
    });

    // Convert to regular array
    return Array.from(output.data as Float32Array);
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    await this.ensureInitialized();
    if (!this.extractor) throw new Error('Model failed to initialize');

    const cleaned = texts.map(t => this.cleanText(t));

    // Batch inference
    const output = await this.extractor(cleaned, {
      pooling: 'mean',
      normalize: true
    });

    // Split results by batch
    const dim = this.getDimensions();
    const results: number[][] = [];

    // output.data is a flattened Float32Array of all embeddings
    for (let i = 0; i < texts.length; i++) {
      const start = i * dim;
      const end = start + dim;
      // @ts-ignore
      results.push(Array.from(output.data.slice(start, end)));
    }

    return results;
  }

  getDimensions(): number {
    return 384;  // all-MiniLM-L6-v2 fixed dimensions
  }

  getModelInfo(): ModelInfo {
    return {
      name: 'all-MiniLM-L6-v2',
      version: 'ONNX',
      dimensions: 384,
      maxTokens: 256
    };
  }

  /**
   * Text cleaning (remove noise, improve quality)
   */
  private cleanText(text: string): string {
    return text
      .trim()
      .replace(/\s+/g, ' ')           // Merge excess whitespace
      .substring(0, 500);             // Truncate overly long text (model specific)
  }
}
