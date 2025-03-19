import { Injectable } from "@nestjs/common";
import { S3 } from 'aws-sdk';
import { ConfigService } from "@nestjs/config";

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
      console.error('❌S3 목록 조회 오류 : ', error);
      throw error;
    }
  }
}