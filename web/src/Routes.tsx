import React from 'react';
import {BrowserRouter, Switch, Route} from 'react-router-dom';
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";

const Routes: React.FC = () => {
    return (
    <BrowserRouter>
        <Switch>
            <Route path="/" component={Home} />
            <Route path="/" component={Register} />
            <Route path="/" component={Login} />
        </Switch>
    </BrowserRouter>
    );
}

export default Routes;
