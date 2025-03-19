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
      Key : `uploads/${Date.now()}-${file.originalname}`,
      Body : file.buffer,
      ContentType : file.mimetype,
    };

    const result = await this.s3.upload(uploadParams).promise();
    return result.Location;
  }
}