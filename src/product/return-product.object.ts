import { Prisma } from "@prisma/client";
import { returnCategoryObject } from 'src/category/return-category.object';
import { returnReviewObject } from 'src/review/return-review.object';

export const returnProductObject: Prisma.ProductSelect = {
    images:true,
    description:true,
    id:true,
    name:true,
    price:true,
    createdAt:true,
    slug:true,
    reviews: {
        select: returnReviewObject,
        orderBy: {
            createdAt: 'desc'
        }
    },
    category: {
        select: returnCategoryObject
    }
}

export const returnProductObjectFullest: Prisma.ProductSelect = {
    ...returnProductObject
}