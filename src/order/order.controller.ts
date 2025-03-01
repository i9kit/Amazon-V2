import { Body, Controller, Get, HttpCode, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { OrderService } from './order.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { CurrentUser } from 'src/auth/decorators/user.decorator';
import { OrderDto } from './order.dto';
import { PaymentStatusDto } from './payment-status.dto';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Auth('admin')
  @Get()
  getAll(){
    return this.orderService.getAll()
  }  
  
  @Auth()
  @Get('by-user')
  getByUserId(@CurrentUser('id') userId:number){
    return this.orderService.getByUserId(userId)
  }

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Auth()
  @Post()
  placeOrder(@Body() dto: OrderDto, @CurrentUser('id') userId:number) {
    return this.orderService.placeOrder(dto, userId)
  }

  @HttpCode(200)
  @Post('status')
  async updateStatus(@Body() dto: PaymentStatusDto) {
    return this.orderService.updateStatus(dto)
  }
}
