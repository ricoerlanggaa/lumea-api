import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot({ throttlers: [{ ttl: 60000, limit: 10 }] }),
    MongooseModule.forRoot(process.env.MONGO_URI ?? 'mongodb://localhost:27017/lumea'),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
