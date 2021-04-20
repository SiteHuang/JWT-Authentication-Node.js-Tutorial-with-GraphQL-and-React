import { Arg, Ctx, Field, Int, Mutation, ObjectType, Query, Resolver, UseMiddleware } from 'type-graphql';
import { User } from './entity/User';
import { compare, hash } from 'bcryptjs';
import { MyContext } from './MyContext';
import { createAccessToken, createRefreshToken } from './generateTokens';
import { isAuth } from './isAuth';
import { sendRefreshToken } from './sendRefreshToken';
import { getConnection } from 'typeorm';

@ObjectType()
class LoginResponse {
    @Field()
    accessToken: string
}

@Resolver()
export class UserResolver {
    @Query(() => String)
    hello() {
        return "hi";
    }
    
    @Query(() => String)
    @UseMiddleware(isAuth) //middleware authentication
    bye(
        @Ctx() {payload}: MyContext
    ) {
        return `your user id is: ${payload?.userId}`;
    }
    
    @Query(() => [User])
    users() {
        return User.find();
    }

    // increment the version number of db
    @Mutation(() => Boolean)
    async revokeRefreshTokensForUser(
        @Arg('userId', () => Int) userId : number
    ) {
        await getConnection().getRepository(User).increment({
            id: userId
        }, "tokenVersion", 1)

        return true;
    }

    // Return Promise as LoginResponse type
    @Mutation(() => LoginResponse)
    async login(
        @Arg('email', () => String) email: string,
        @Arg('password', () => String) password: string,
        @Ctx() ctx: MyContext, // access to context
    ): Promise<LoginResponse> {
        const user = await User.findOne({where: {email}})
        if(!user) {
            throw new Error('could not find user')
        }

        const valid = await compare(password, user.password)

        if(!valid) {
            throw new Error('bad password')
        }

        // login successfully
        sendRefreshToken(ctx.res, createRefreshToken(user))

        return {
            accessToken: createAccessToken(user)
        }
    }

    @Mutation(() => Boolean)
    async register(
        @Arg('email', () => String) email: string,
        @Arg('password', () => String) password: string,
    ) {
        const hashedPassword = await hash(password, 12)
        try {
            await User.insert({
                email,
                password: hashedPassword,
            })
        } catch (error) {
            console.log(error);
            return false;
        }
        
        return true;
    }
}