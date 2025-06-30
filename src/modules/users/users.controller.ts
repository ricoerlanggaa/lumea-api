import { Controller, Get } from '@nestjs/common';
import { UserRequest } from '@/common/decorators/user-request.decorator';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  async getProfile(@UserRequest() user: { _id: string }) {
    const result = await this.usersService.getProfile(user._id);
    return { message: 'Successfully retrieve user profile', data: result };
  }
}
