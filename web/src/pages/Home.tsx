import React from 'react'
import { useUsersQuery } from '../generated/graphql';

interface Props {

}
export const Home: React.FC<Props> =() => {
    const {data, loading, error} = useUsersQuery({
        fetchPolicy: 'network-only', // not read from cache
    })


    return (
        <div>
            <h1>Home</h1>
            {loading ? (
                <div>
                    <br/>loading...<br/>
                </div>
            ) : (
                <div>
                    <h3>Users:</h3>
                    <ul>
                        {data?.users.map(e => {
                            return <li key={e.id}>{e.id} : {e.email}</li>
                        })}
                    </ul>
                </div>
            )}
        </div>
    );
}