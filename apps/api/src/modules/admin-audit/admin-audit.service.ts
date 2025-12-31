import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminAuditService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.adminAuditLog.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        actor: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
      take: 200,
    });
  }
}
