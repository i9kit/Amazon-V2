import {faker} from '@faker-js/faker';
import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { AuthDto } from './dto/auth.dto';
import { hash, verify } from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { UserService } from 'src/user/user.service';


@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService, 
        private jwt: JwtService, 
        private userService : UserService
    ){}


    async login(dto : AuthDto){
        const user = await this.validateUser(dto)
        const tokens = await this.issueTokens(user.id)

        return {user: this.returnUserFields(user),
            ...tokens}
    }

    async getNewTokens(refreshToken: string){
        const result = await this.jwt.verifyAsync(refreshToken)

        if(!result) throw new UnauthorizedException('Invalid refresh token')

        const user = await this.userService.byId(result.id, {
             isAdmin: true
        })

        const tokens = await this.issueTokens(user.id)

        return {user: this.returnUserFields(user),
            ...tokens}
    }

    async register(dto: AuthDto){
        const oldUser = await this.prisma.user.findUnique({
            where: {
                email: dto.email
            }
        })

        if(oldUser) 
            throw new BadRequestException('User already exists');

        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                name: faker.person.firstName(),
                avatarPath: faker.image.avatar(), 
                phone: faker.string.numeric('+7 (###) ###-##-##'),
                password: await hash(dto.password)
            }
        })

        const tokens = await this.issueTokens(user.id)

        return {
            user: this.returnUserFields(user),
            ...tokens
        }
    }

    private async issueTokens(userId: number ){
        const data = {id: userId}

        const accessToken = this.jwt.sign(data, {
            expiresIn: '1h',
        })

        const refreshToken = this.jwt.sign(data, {
            expiresIn: "7d",
        })

        return {accessToken, refreshToken}
    }

    private returnUserFields(user: Partial<User>){
        return{
            id: user.id,
            email: user.email,
            isAdmin: user.isAdmin
        }
    }

    private async validateUser(dto: AuthDto) {
        const user = await this.prisma.user.findUnique({
            where: {
                email: dto.email
            }
        })
        if(!user) 
            throw new NotFoundException('User not found');

        const isValid = await verify(user.password, dto.password)

        if(!isValid) throw new UnauthorizedException('Invalid password')

        return user
    }
}




	
