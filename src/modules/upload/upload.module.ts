import { Module } from "@nestjs/common";
import { S3Module } from "../s3/s3.module";
import { UploadController } from "./upload.controller";

@Module({
  imports : [S3Module],
  controllers : [UploadController],
})

export class UploadModule{}