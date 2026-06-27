import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { MeiliSearch } from 'meilisearch';
import { ConfigService } from '@nestjs/config';

interface PostDocument {
  id: string;
  content: string;
  status: string;
  workspaceId: string;
  platforms: string[];
  publishedAt?: string;
  createdAt: string;
}

@Injectable()
export class SearchService implements OnModuleInit {
  private readonly logger = new Logger(SearchService.name);
  private readonly client: MeiliSearch;

  constructor(private readonly config: ConfigService) {
    this.client = new MeiliSearch({
      host: config.get<string>('meilisearch.url') ?? 'http://localhost:7700',
      apiKey: config.get<string>('meilisearch.masterKey'),
    });
  }

  async onModuleInit() {
    try {
      await this.setupIndexes();
    } catch (error) {
      this.logger.warn('Meilisearch not available, search disabled', error);
    }
  }

  private async setupIndexes() {
    await this.client.createIndex('posts', { primaryKey: 'id' });

    const postsIndex = this.client.index('posts');
    await postsIndex.updateSettings({
      searchableAttributes: ['content'],
      filterableAttributes: ['workspaceId', 'status', 'platforms'],
      sortableAttributes: ['publishedAt', 'createdAt'],
      displayedAttributes: ['id', 'content', 'status', 'workspaceId', 'platforms', 'publishedAt', 'createdAt'],
    });
  }

  async indexPost(post: PostDocument) {
    try {
      const index = this.client.index('posts');
      await index.addDocuments([post]);
    } catch (error) {
      this.logger.warn('Failed to index post', error);
    }
  }

  async deletePostFromIndex(postId: string) {
    try {
      const index = this.client.index('posts');
      await index.deleteDocument(postId);
    } catch (error) {
      this.logger.warn('Failed to delete post from index', error);
    }
  }

  async searchPosts(query: string, workspaceId: string, filters?: { status?: string }) {
    try {
      const index = this.client.index('posts');
      const filterParts = [`workspaceId = "${workspaceId}"`];
      if (filters?.status) filterParts.push(`status = "${filters.status}"`);

      const results = await index.search(query, {
        filter: filterParts.join(' AND '),
        limit: 20,
        sort: ['createdAt:desc'],
      });

      return results;
    } catch (error) {
      this.logger.warn('Search failed, falling back to empty results', error);
      return { hits: [], estimatedTotalHits: 0 };
    }
  }
}
