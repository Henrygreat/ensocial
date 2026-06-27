import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomBytes } from 'crypto';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/quicktime'];
const MAX_SIZE_BYTES = 100 * 1024 * 1024; // 100MB

@Injectable()
export class MediaService {
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly publicUrl: string;

  constructor(private readonly config: ConfigService) {
    const accountId = config.get<string>('r2.accountId');
    this.bucket = config.get<string>('r2.bucket') ?? 'ensocial-media';
    this.publicUrl = config.get<string>('r2.publicUrl') ?? '';

    this.s3 = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.get<string>('r2.accessKeyId') ?? '',
        secretAccessKey: config.get<string>('r2.secretAccessKey') ?? '',
      },
    });
  }

  async getUploadUrl(
    orgId: string,
    workspaceId: string,
    filename: string,
    contentType: string,
    size: number,
  ) {
    if (!ALLOWED_TYPES.includes(contentType)) {
      throw new BadRequestException(`File type ${contentType} not allowed`);
    }
    if (size > MAX_SIZE_BYTES) {
      throw new BadRequestException('File exceeds 100MB limit');
    }

    const ext = filename.split('.').pop() ?? 'bin';
    const key = `media/${orgId}/${workspaceId}/${randomBytes(16).toString('hex')}.${ext}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
      ContentLength: size,
    });

    const uploadUrl = await getSignedUrl(this.s3, command, { expiresIn: 3600 });
    const publicFileUrl = `${this.publicUrl}/${key}`;

    return { uploadUrl, key, publicUrl: publicFileUrl };
  }

  async deleteFile(key: string) {
    const command = new DeleteObjectCommand({ Bucket: this.bucket, Key: key });
    await this.s3.send(command);
  }
}
