import { Arg, Field, Mutation, ObjectType, Query, Resolver } from 'type-graphql';
import { User } from './entity/User';
import { compare, hash } from 'bcryptjs';

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
    
    @Query(() => [User])
    users() {
        return User.find();
    }

    @Mutation(() => LoginResponse)
    async login(
        @Arg('email', () => String) email: string,
        @Arg('password', () => String) password: string,
    ) {
        const user = await User.findOne({where: {email}})
        if(!user) {
            throw new Error('could not find user')
        }

        const valid = compare(password, user.password)

        if(!valid) {
            throw new Error('bad password')
        }

        // login successfully
        return {

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