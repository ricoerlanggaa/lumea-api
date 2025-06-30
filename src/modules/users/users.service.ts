import { Injectable } from '@nestjs/common';
import { User } from '@/models/user.model';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  getProfile(_id: string): Promise<User | null> {
    return this.usersRepository.findById(_id);
  }
}
