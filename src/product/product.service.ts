import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { returnProductObject, returnProductObjectFullest } from './return-product.object';
import { AddProductDto, ProductDto } from './dto/product.dto';
import { generateSlug } from 'utils/generate-slug';
import { EnumProductSort, GetAllProductDto } from './dto/get-all.product.dto';
import { PaginationService } from 'src/pagination/pagination.service';
import { Prisma } from '@prisma/client';
import { CategoryService } from 'src/category/category.service';
import { convertToNumber} from 'utils/convert-to-number';

@Injectable()
export class ProductService {
    constructor(
        private prisma: PrismaService,
        private paginationService: PaginationService,
        private categoryService: CategoryService
    ) {}

    async getAll(dto: GetAllProductDto = {}) {
        const { perPage, skip } = this.paginationService.getPagination(dto);

        let productIds: number[] | undefined;
        if (dto.ratings) {
            const minRating = +dto.ratings; 
            productIds = await this.getProductIdsByAverageRating(minRating);
        }

        const filters = this.createFilter(dto, productIds);

        const products = await this.prisma.product.findMany({
            where: filters,
            orderBy: this.getSortOption(dto.sort),
            skip,
            take: perPage,
            select: returnProductObject
        });

        return {
            products,
            length: await this.prisma.product.count({
                where: filters
            })
        };
    }

    private createFilter(
        dto: GetAllProductDto,
        productIds?: number[]
    ): Prisma.ProductWhereInput {
        const filters: Prisma.ProductWhereInput[] = [];

        if (dto.searchTerm) {
            filters.push(this.getSearchTermFilter(dto.searchTerm));
        }

        if (productIds) {
            filters.push({
                id: { in: productIds }
            });
        }

        if (dto.minPrice || dto.maxPrice) {
            filters.push(this.getPriceFilter(
                convertToNumber(dto.minPrice),
                convertToNumber(dto.maxPrice)
            ));
        }

        if (dto.categoryId) {
            filters.push(this.getCategoryFilter(+dto.categoryId));
        }

        return filters.length ? { AND: filters } : {};
    }

    private getSortOption(
        sort: EnumProductSort
    ): Prisma.ProductOrderByWithRelationInput[] {
        switch (sort) {    
            case EnumProductSort.LOW_PRICE:
                return [{ price: 'asc'}]
            case EnumProductSort.HIGH_PRICE:
                return [{price: 'desc'}]
            case EnumProductSort.OLDEST:
                return [{createdAt: 'asc'}]
            default:
                return [{createdAt: 'desc'}]
        }
    }

    private getSearchTermFilter(searchTerm: string): Prisma.ProductWhereInput {
        return  {
            OR: [
                {
                    category: {
                        name: {
                            contains: searchTerm,
                            mode: 'insensitive'
                        }
                    }
                },
                {
                    name: {
                        contains:searchTerm,
                        mode: 'insensitive'
                    }
                },
                {
                    description: {
                        contains: searchTerm,
                        mode: 'insensitive'
                    } 
                }
        ]
        }
    }

    private async getProductIdsByAverageRating(minRating: number): Promise<number[]> {
        const productsWithAverageRating = await this.prisma.product.findMany({
            select: {
                id: true,
                reviews: {
                    select: {
                        rating: true
                    }
                }
            }
        });

        const filteredProductIds = productsWithAverageRating
            .map(product => {
                const ratings = product.reviews.map(review => review.rating);
                const averageRating = this.calculateAverageRating(ratings);
                return {
                    id: product.id,
                    averageRating
                };
            })
            .filter(product => product.averageRating >= minRating)
            .map(product => product.id);

        return filteredProductIds;
    }

    private calculateAverageRating(ratings: number[]): number {
        if (ratings.length === 0) 
            return 0; 
        const average = (ratings.reduce((acc, rating) => acc + rating, 0)) / ratings.length
        return Math.max(average)
    }


    private getPriceFilter(minPrice?: number, maxPrice?: number): Prisma.ProductWhereInput{
        let priceFilter: Prisma.IntFilter | undefined = undefined  

        if(minPrice) {
            priceFilter = {
                ...priceFilter,
                gte: minPrice
            }
        }

        if(maxPrice) {
            priceFilter = {
                ...priceFilter,
                lte: maxPrice
            }
        }

        return {
            price: priceFilter
        }
    }

    private getCategoryFilter(categoryId: number): Prisma.ProductWhereInput{
        return {
            categoryId
        }
    }


    async byId(id:number) {
        const product = await this.prisma.product.findUnique({
        where: {
            id
        },
        select: returnProductObjectFullest
        })

        if(!product) {
           throw new NotFoundException('Product not found')
        }

        return product;
    }

    async bySlug(slug:string) {
        const product = await this.prisma.product.findUnique({
        where: {
            slug
        },
        select: returnProductObjectFullest
        })

        if(!product) {
           throw new NotFoundException('Product not found')
        }

        return product;
    }
    
    async byCategory(categorySlug:string) {
        const products = await this.prisma.product.findMany({
        where: {
            category: {
                slug: categorySlug
            }
        },
        select: returnProductObjectFullest
        })

        if(!products) {
           throw new NotFoundException('Products not found')
        }

        return products;
    }

    async getSimilar(id:number) {
        const currentProduct = await this.byId(id)

        if (!currentProduct) {
            throw new NotFoundException('Current product not found!')
        }

        const products = await this.prisma.product.findMany({
            where: {
                category: {
                    name: currentProduct.category.name
                },
                NOT: {
                    id: currentProduct.id
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            select: returnProductObject
        })

        return products
    }

    async create(userId:number, dto:AddProductDto) {     
        const {name, price, description, slug, categoryId, images} = dto
        
        return await this.prisma.product.create({
            data: {
                name,
                price,
                description,
                slug,
                images,
                user: {
                    connect: {
                        id: userId
                    }
                },
                category: {
                    connect: {
                        id: categoryId
                    }
                }
            }
        })
    }


    async update(id: number, dto:ProductDto) {
        const {description, name, price, images, categoryId} = dto
        
        await this.categoryService.byId(categoryId)

        return this.prisma.product.update({
            where: {
                id
            },
            data: {
                description,
                name,
                price,
                images,
                slug: generateSlug(name),
                category: {
                    connect: {
                        id: categoryId
                    }
                }
            }
        })
    }

    async delete(id: number) {
        return this.prisma.product.delete({
            where: {
                id
            }
        })
    }
}
