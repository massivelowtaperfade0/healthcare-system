import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import 'dotenv/config'

@Injectable()
export class StorageService {
    private s3Client: S3Client;

    constructor() {
        this.s3Client = new S3Client({
            endpoint: process.env.S3_ENDPOINT,
            forcePathStyle: true,
            region: process.env.S3_REGION,
            credentials: {
                accessKeyId: process.env.S3_ACCESS_KEY ?? "",
                secretAccessKey: process.env.S3_SECRET_KEY ?? "",
            }
        });
    }

    // generate path to upload
    generateKey(
        organizationId: string, 
        patientId: string,
        fileName: string
    ) : string {
        const timestamp = Date.now();
        return `org_${organizationId}/patient_$${patientId}/${timestamp}-${fileName}`;
    }

    async getUploadUrl(fileKey: string, contentType: string): Promise<string> {
        try {
            const command = new PutObjectCommand({
                Bucket: process.env.S3_BUCKET_NAME,
                Key: fileKey,
                ContentType: contentType,
            });

            return await getSignedUrl(this.s3Client, command, { expiresIn: 300 });
        } catch (err) {
            throw new InternalServerErrorException('Count not generate upload URL');
        }
    }

    async getDownloadUrl(fileKey: string) {
        try {
            const command = new GetObjectCommand({
                Bucket: process.env.S3_BUCKET_NAME,
                Key: fileKey,
            });

            return await getSignedUrl(this.s3Client, command, {expiresIn: 3600});
        } catch (err) {
            throw new InternalServerErrorException("Could not generate download URL");
        }
    }
    
}
