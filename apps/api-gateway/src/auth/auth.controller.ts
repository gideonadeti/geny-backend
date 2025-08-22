import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { Response } from 'express';

import { AuthService } from './auth.service';
import { SignUpDto } from './dtos/sign-up.dto';
import { SignInDto } from './dtos/sign-in.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { RefreshJwtAuthGuard } from './guards/refresh-jwt.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UserId } from './decorators/user-id.decorator';
import { AuthRequest } from '@app/interfaces';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-up')
  signUp(@Body() signUpDto: SignUpDto, @Res() res: Response) {
    return this.authService.signUp(signUpDto, res);
  }

  @ApiBody({ type: SignInDto })
  @UseGuards(LocalAuthGuard)
  @Post('sign-in')
  signIn(@Req() req: AuthRequest, @Res() res: Response) {
    return this.authService.signIn(req.user, res);
  }

  @UseGuards(RefreshJwtAuthGuard)
  @Post('refresh-token')
  refreshToken(@Req() req: AuthRequest) {
    return this.authService.refreshToken(req);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('sign-out')
  signOut(@UserId() userId: string, @Res() res: Response) {
    return this.authService.signOut(userId, res);
  }
}
