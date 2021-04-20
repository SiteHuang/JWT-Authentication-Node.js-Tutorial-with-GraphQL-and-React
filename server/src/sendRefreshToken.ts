import {Response} from 'express';

export const sendRefreshToken = (res: Response, token: string) => {
    res.cookie('refreshToken', token, {
        httpOnly: true, // cannot be accessed by JS,
    })
}