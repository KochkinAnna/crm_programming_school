import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PasswordService {
  private salt: number;

  constructor() {
    this.salt = parseInt(process.env.SALT, 10);
  }

  // Hashes the provided password using bcrypt
  // Хешує наданий пароль за допомогою bcrypt
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.salt);
  }

  // Compares the provided password with a hashed password using bcrypt
  // Порівнює наданий пароль з хешованим паролем за допомогою bcrypt
  async comparePasswords(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
}
