import 'dotenv/config';
import "reflect-metadata";
// import {User} from "./entity/User";
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from "type-graphql";
import { UserResolver } from "./UserResolver";
import { createConnection } from "typeorm";
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { verify } from 'jsonwebtoken';
import {User} from './entity/User';
import { createAccessToken, createRefreshToken } from './generateTokens';
import { sendRefreshToken } from './sendRefreshToken';


(async () => {
    const app = express();
    app.use(cors({
        origin: 'http://localhost:3000', // frontend url that allows requests
        credentials: true,
    }))
    app.use(cookieParser());

    app.get('/', (_req, res) => {
        res.send('hello')
    })

    // handle refreshing refresh token
    app.post("/refresh_token", async (req, res) => {
        // get refresh token from cookie
        const token = req.cookies.refreshToken;
        if(!token) {
            return res.send({ok: false, accessToken: ''})
        }
        // token is not expired
        let payload = null;
        try {
            // verify refresh token from cookie
            payload = verify(token, process.env.REFRESH_TOKEN_SECRET!) as any;
        } catch (error) {
            console.log(error)
            return res.send({ok: false, accessToken: ''})
        }
        // token is valid and we can send back an access token
        const user = await User.findOne({id: payload.userId});

        if (!user) {
            return res.send({ ok: false, accessToken: ''})
        }

        // Verify the token version is matched
        if(user.tokenVersion !== payload.tokenVersion) {
            return res.send({ ok: false, accessToken: ''})
        }

        // recreate a refreshToken and send through cookies
        // refreshToken is expired in 7d, so we renew the refreshToken
        sendRefreshToken(res, createRefreshToken(user));

        // we create an access token and send through data
        return res.send({ok: true, accessToken: createAccessToken(user)})
    })

    await createConnection();

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [UserResolver]
        }),
        // pass res to graphql through context of Apollo
        context: ({ req, res }) => ({ req, res })
    })

    apolloServer.applyMiddleware({ app, cors: false })

    const server = app.listen(4000, () => {
        console.log('express server started');
    })

    //   Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
        console.log(`Error: ${err}`);
        // Close server & exit process
        server.close(() => process.exit(1));
    });
})();

// createConnection().then(async connection => {

//     console.log("Inserting a new user into the database...");
//     const user = new User();
//     user.firstName = "Timber";
//     user.lastName = "Saw";
//     user.age = 25;
//     await connection.manager.save(user);
//     console.log("Saved a new user with id: " + user.id);

//     console.log("Loading users from the database...");
//     const users = await connection.manager.find(User);
//     console.log("Loaded users: ", users);

//     console.log("Here you can setup and run express/koa/any other framework.");

// }).catch(error => console.log(error));
