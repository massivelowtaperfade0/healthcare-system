import { Module } from '@nestjs/common';
import { AttachmentService } from './attachment.service';
import { AttachmentController } from './attachment.controller';
import { StorageService } from 'src/storage/storage.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [AttachmentController],
  providers: [AttachmentService, StorageService, PrismaService],
})
export class AttachmentModule {}
