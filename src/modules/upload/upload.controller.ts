import { Controller, Get, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { S3Service } from "../s3/s3.service";
import { FileInterceptor } from "@nestjs/platform-express";

@Controller('upload')
export class UploadController {
  constructor(private s3Service : S3Service) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file : Express.Multer.File) {
    const fileUrl = await this.s3Service.uploadFile(file);
    return { url : fileUrl };
  }

  @Get('all')
  async getAllFiles() {
    const files = await this.s3Service.getAllFiles();
    return { files };
  }

  @Get('folder')
  async getAllFilesFromFolder() {
    const folderName = 'testUpload';
    const files = await this.s3Service.getAllFilesFromFolder(folderName);
    return { files };
  }
}