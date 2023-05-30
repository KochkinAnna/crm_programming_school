import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PasswordService {
  private salt: number;

  constructor() {
    this.salt = parseInt(process.env.SALT, 10);
  }

  async hashPassword(password: string) {
    return bcrypt.hash(password, this.salt);
  }

  async comparePasswords(password: string, hashedPassword: string) {
    return bcrypt.compare(password, hashedPassword);
  }
}