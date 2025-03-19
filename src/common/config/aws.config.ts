import { ConfigModule } from '@nestjs/config'

export const AwsConfigModule = ConfigModule.forRoot({
  isGlobal : true,
});