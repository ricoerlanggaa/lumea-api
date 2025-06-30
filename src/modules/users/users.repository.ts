import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '@/models/user.model';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}

  findById(_id: string): Promise<User | null> {
    return this.userModel.findById(_id).exec();
  }

  findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).select('+password').exec();
  }

  async create(data: Partial<User>): Promise<User> {
    const hashedPassword = data.password && (await bcrypt.hash(data.password, 10));
    const formattedPhoneNumber = this.formatPhoneNumber(data.phoneNumber);
    const user = new this.userModel({
      ...data,
      phoneNumber: formattedPhoneNumber,
      password: hashedPassword,
    });
    return user.save();
  }

  private formatPhoneNumber(phoneNumber: string = ''): string {
    const cleaned = phoneNumber.replace(/\D/g, '');
    if (cleaned.startsWith('0')) return '+62' + cleaned.slice(1);
    if (cleaned.startsWith('8')) return '+62' + cleaned;
    if (cleaned.startsWith('62')) return '+' + cleaned;
    return phoneNumber;
  }
}
