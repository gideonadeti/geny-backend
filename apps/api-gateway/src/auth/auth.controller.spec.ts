import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthRequest } from '@app/interfaces';

describe('AuthController', () => {
  let controller: AuthController;
  let mockAuthService: { signIn: jest.Mock };

  beforeEach(async () => {
    mockAuthService = {
      signIn: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  describe('signIn', () => {
    it('should call authService.signIn with correct arguments', async () => {
      const user = { id: '123', email: 'test@example.com' };
      const req = { user } as AuthRequest;
      const res = {} as Response;
      const expected = { accessToken: 'abc', user };

      mockAuthService.signIn.mockResolvedValue(expected);

      const result = await controller.signIn(req, res);

      expect(mockAuthService.signIn).toHaveBeenCalledTimes(1);
      expect(mockAuthService.signIn).toHaveBeenCalledWith(user, res);
      expect(result).toBe(expected);
    });
  });
});
