import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { ProductService } from './product.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { GetAllProductDto } from './dto/get-all.product.dto';
import { AddProductDto, ProductDto } from './dto/product.dto';
import { CurrentUser } from 'src/auth/decorators/user.decorator';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @UsePipes(new ValidationPipe())
  @Get()
  async getAll(@Query() queryDto: GetAllProductDto){
    return this.productService.getAll(queryDto);
  }

  @Get('similar/:id')
  async getSimilar(@Param('id') id:string){
    return this.productService.getSimilar(+id);
  }
  
  @Get('by-slug/:slug')
  async getProductBySlug(@Param('slug') slug:string){
    return this.productService.bySlug(slug);
  }
  
  @Get('by-category/:categorySlug')
  async getProductsByCategory(@Param('categorySlug') categorySlug:string){
    return this.productService.byCategory(categorySlug);
  }
  
  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Auth('admin')
  @Post()
  async createProduct(@CurrentUser('id') id:number, @Body() dto: AddProductDto){
    return this.productService.create(id, dto);
  }

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Auth('admin')
  @Put(':id')
  async updateProduct(@Param('id') id: string, @Body() dto: ProductDto){
    return this.productService.update(+id, dto);
  }

  @HttpCode(200)
  @Auth('admin')
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.productService.delete(+id);
  }
  
  @Auth('admin')
  @Get(':id')
  async getProduct(@Param('id') id:string){
    return this.productService.byId(+id);
  }
}
