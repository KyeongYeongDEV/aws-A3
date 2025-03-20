import { Controller, Delete, Get, HttpException, Param, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
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

  @Delete(':fileName')
  async deleteFile(@Param('fileName') fileName : string) {
    const result = await this.s3Service.deleteFile(fileName);
    if (result) return { message : '파일 삭제 완료' };
    throw new HttpException('삭제 실패', 500);
  }
}