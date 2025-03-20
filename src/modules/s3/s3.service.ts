import { Injectable } from "@nestjs/common";
import { S3 } from 'aws-sdk';
import { ConfigService } from "@nestjs/config";
import { resizeImage } from "src/common/utils/file.util";
import * as sharp from "sharp";

@Injectable()
export class S3Service {
  private s3 : S3;
  private bucketName : string;

  constructor(private readonly configService : ConfigService) {
    this.s3 = new S3({
      accessKeyId : this.configService.get<string>('AWS_ACCESS_KEY_ID'),
      secretAccessKey : this.configService.get<string>('AWS_SECRET_ACCESS_KEY'),
      region : this.configService.get<string>('AWS_REGION'),
    });

    this.bucketName = this.configService.get<string>('AWS_S3_BUCKET_NAME') || 'null';
  }

  async uploadFile(file : Express.Multer.File) : Promise<string> {
    const uploadParams = {
      Bucket : this.bucketName,
      Key : `testUpload/${Date.now()}-${file.originalname}`,
      Body : file.buffer,
      ContentType : file.mimetype,
    };

    const result = await this.s3.upload(uploadParams).promise();
    return result.Location;
  }

  async getAllFiles() : Promise<string[]> {
    const params = {
      Bucket : this.bucketName,
    };

    try{
      // listObjectsV2를 내 버킷 안에 있는 모든 파일 목록을 가져올 수 있다.
      // data.Contents에 목록이 있다.
      const data  = await this.s3.listObjectsV2(params).promise();
      const files = data.Contents?.map((item) => {
        return `https://${this.bucketName}.s3.${this.s3.config.region}.amazonaws.com/${item.Key}`;
      }) || [];

      return files;
    } catch (error) {
      console.error('❌ S3 목록 조회 오류 : ', error);
      throw error;
    }
  }

  async getAllFilesFromFolder(folder : string) : Promise<string[]> {
    const params = {
      Bucket : this.bucketName,
      Prefix : folder,
    }

    try {
      const data = await this.s3.listObjectsV2(params).promise();
      const filse = data.Contents?.map((item) => {
        return `https://${this.bucketName}.s3.${this.s3.config.region}.amazonaws.com/${item.Key}`;
      }) || [];

      return filse;
    } catch (error) {
      console.error('❌ S3 목록 조회 오류', error);
      throw error;
    }
  }

  async deleteFile(fileName : string) : Promise<boolean> {
    const params = {
      Bucket : this.bucketName,
      Key : fileName,
    }

    try {
      await this.s3.deleteObject(params).promise();
      return true;
    } catch (error) {
      console.error('❌ 파일 삭제 오류 : ', error);
      return false;
    }
  }

  // 만료 시간이 지나면 url에 들어가도 사진이 안 보임
  async getPresignedUrl(fileName : string, expriresIn = 5) : Promise<string> {
    const params = {
      Bucket : this.bucketName,
      Key : fileName,
      Expires : expriresIn,
    };

    try {
      const url = this.s3.getSignedUrl('getObject', params);
      return url;
    } catch (error) {
      console.error('❌ Presigned URL 생성 오류 : ', error);
      throw error;
    }
  }

  // 애플 M시리즈칩을 사용하고 있다면 아래를 설치해야 함
  // brew install vips
  async uploadResizedImage(file: Express.Multer.File, width: number, height: number): Promise<string> {
    const resizedBuffer = await sharp(file.buffer)
      .resize(width, height)
      .toBuffer();

    const uploadParams = {
      Bucket: this.bucketName,
      Key: `uploads/resized-${Date.now()}-${file.originalname}`,
      Body: resizedBuffer,
      ContentType: file.mimetype,
    };

    const result = await this.s3.upload(uploadParams).promise();
    return result.Location;
  }
}