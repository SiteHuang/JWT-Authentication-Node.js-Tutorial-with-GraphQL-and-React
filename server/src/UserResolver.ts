import { Arg, Ctx, Field, Mutation, ObjectType, Query, Resolver, UseMiddleware } from 'type-graphql';
import { User } from './entity/User';
import { compare, hash } from 'bcryptjs';
import { MyContext } from './MyContext';
import { createAccessToken, createRefreshToken } from './auth';
import { isAuth } from './isAuth';

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
    @UseMiddleware(isAuth)
    bye(
        @Ctx() {payload}: MyContext
    ) {
        return `your user id is: ${payload?.userId}`;
    }
    
    @Query(() => [User])
    users() {
        return User.find();
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

        ctx.res.cookie('mycookie', createRefreshToken(user), {
            httpOnly: true, // cannot be accessed by JS,
        })

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