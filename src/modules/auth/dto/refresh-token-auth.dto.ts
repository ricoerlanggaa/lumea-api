import { IsJWT, IsNotEmpty } from 'class-validator';

export class RefreshTokenAuthDto {
  @IsJWT()
  @IsNotEmpty()
  refreshToken: string;
}
