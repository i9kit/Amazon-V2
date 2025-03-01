import { Prisma } from "@prisma/client";
import { ArrayMinSize, IsNumber, IsOptional, IsString } from "class-validator";

export class ProductDto implements Prisma.ProductUpdateInput {
    @IsString()
    name:string

    @IsNumber()
    price: number
    
    @IsOptional()
    @IsString()
    description?: string 

    @IsString({each:true})
    @ArrayMinSize(1)
    images: string[]

    @IsNumber()
    categoryId: number
}

export class AddProductDto implements Prisma.ProductCreateInput {
    @IsString()
    name:string

    @IsNumber()
    price: number;

    @IsOptional()
    @IsString()
    description: string;

    @IsString()
    @IsOptional()
    slug: string;

    @IsNumber()
    categoryId: number

    @IsString({each:true})
    @ArrayMinSize(1)
    @IsOptional()
    images: string[]
}