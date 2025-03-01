import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { PrismaService } from 'src/prisma.service';
import { PaginationModule } from 'src/pagination/pagination.module';
import { PaginationService } from 'src/pagination/pagination.service';
import { CategoryModule } from 'src/category/category.module';
import { CategoryService } from 'src/category/category.service';


@Module({
  controllers: [ProductController],
  imports: [PaginationModule, CategoryModule],
  providers: [ProductService, PrismaService, PaginationService, CategoryService]
})
export class ProductModule {}
