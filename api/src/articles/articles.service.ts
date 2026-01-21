import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';

@Injectable()
export class ArticlesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.article.findMany({
      where: { published: true },
      include: {
        segments: {
          orderBy: { order: 'asc' },
          include: {
            blank: {
              include: {
                options: true,
              },
            },
          },
        },
        expressions: {
          include: {
            expression: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.article.findUnique({
      where: { id },
      include: {
        segments: {
          orderBy: { order: 'asc' },
          include: {
            blank: {
              include: {
                options: true,
              },
            },
          },
        },
        expressions: {
          include: {
            expression: true,
          },
        },
      },
    });
  }

  async findBySlug(slug: string) {
    // Convert slug to title: "formal-greetings" -> "formal greetings"
    // Then match case-insensitively against stored title "Formal Greetings"
    const titleFromSlug = slug.replace(/-/g, ' ');

    return this.prisma.article.findFirst({
      where: {
        title: {
          equals: titleFromSlug,
          mode: 'insensitive',
        },
        published: true,
      },
      include: {
        segments: {
          orderBy: { order: 'asc' },
          include: {
            blank: {
              include: {
                options: true,
              },
            },
          },
        },
        expressions: {
          include: {
            expression: true,
          },
        },
      },
    });
  }
}