import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';

import { ApiGatewayModule } from './../src/api-gateway.module';

describe('ApiGatewayController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ApiGatewayModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should sign in an existing user and return tokens', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/sign-in')
      .send({
        email: 'fortor@gmail.com',
        password: 'Family?',
      })
      .expect(201);

    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('user');
  });
});
