import { Module } from "@nestjs/common";
import { AwsConfigModule } from "./common/config/aws.config";
import { UploadModule } from "./modules/upload/upload.module";

@Module({
  imports : [AwsConfigModule, UploadModule],
})

export class AppModule{}