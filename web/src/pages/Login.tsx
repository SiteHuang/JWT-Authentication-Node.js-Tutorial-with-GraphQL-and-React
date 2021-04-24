import React, { useState } from 'react';
import { RouteComponentProps } from 'react-router';
import { useLoginMutation } from '../generated/graphql';

export const Login: React.FC<RouteComponentProps> =({
    // control + space to see all options
    history
}) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [login] = useLoginMutation()
    
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log('form submitted');
        const response = await login({
            variables: {
                email,
                password
            }
        })

        history.push('/')

        console.log(response);
    }
    return (
        <div>
            <h1>Login</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <input type="text" value={email} placeholder='email' onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div>
                    <input type="password" value={password} placeholder='password' onChange={(e) => setPassword(e.target.value)} />
                </div>
                <button type="submit">Submit</button>
            </form>
        </div>
    );
}