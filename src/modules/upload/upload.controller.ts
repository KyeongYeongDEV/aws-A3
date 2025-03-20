import { Controller, Delete, Get, HttpException, Param, Post, Query, UploadedFile, UploadedFiles, UseInterceptors } from "@nestjs/common";
import { S3Service } from "../s3/s3.service";
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";

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

  @Get('presigned-url')
  async getPresignedUrl(@Query('filename') filename : string) {
    return { url : await this.s3Service.getPresignedUrl(filename) };
  }

  @Post('resized')
  @UseInterceptors(FileInterceptor('file')) 
  async uploadResizedImage(
    @UploadedFile() file: Express.Multer.File, 
    @Query('width') width: number,
    @Query('height') height: number,
  ) {
    const fileUrl = await this.s3Service.uploadResizedImage(file, Number(width), Number(height));
    return { url: fileUrl };
  }

  @Delete(':fileName')
  async deleteFile(@Param('fileName') fileName : string) {
    const result = await this.s3Service.deleteFile(fileName);
    if (result) return { message : '파일 삭제 완료' };
    throw new HttpException('삭제 실패', 500);
  }
}