import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';


@Injectable()
export class StatisticsService {
    constructor(
        private prisma: PrismaService) {}

    async getMain(){
        const ordersCount = await this.prisma.order.count()
        const reviewsCount = await this.prisma.review.count()
        const userCount = await this.prisma.user.count()

        const totalAmount = await this.prisma.order.aggregate({
            _sum: {
                total: true
            }
        })
        
        return [
            {
                name: 'Orders',
                value: ordersCount
            },
            {
                name: 'Reviews',
                value: reviewsCount
            },
            {
                name: 'Users',
                value: userCount
            },
            {
                name: 'Total amount',
                value: totalAmount._sum.total
            },
        ]
    }
}

