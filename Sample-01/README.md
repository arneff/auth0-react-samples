# Pizza42 

## Live Exmple
<https://pizza42-express.herokuapp.com/>

## Challenges 
- Choose the Single-Page App (SPA) option from the Auth0 documentation website
(https://auth0.com/docs). SPAs are commonly used by Auth0 customers.
- Choose a JavaScript framework option. 
    - React application [Auth0 React SDK](https://github.com/auth0/auth0-react)
- Complete the [Login](https://github.com/arneff/auth0-react-samples/blob/d1027816292860a8908422da29cb50eb4a4177b6/Sample-01/src/components/NavBar.js#L85-L94) 
- Call an API 
    - [ExternalAPI](https://github.com/arneff/auth0-react-samples/blob/master/Sample-01/src/views/ExternalApi.js) Requires both a users email to be verified and for the user to be assigned a "member" role before an order can be placed.
    - [ExternalMember](https://github.com/arneff/auth0-react-samples/blob/master/Sample-01/src/views/ExternalMember.js) Assigns the "member" role to the user. Browser refresh required to order pizza.
- Sign in with either email / password or a social identity provider such as Google.
    - Using Actions to link accounts with the same email providing the user flexibility for login option.
    - Implemented as outlined in this Auth0 community [post](https://community.auth0.com/t/account-linking-through-actions/68940/3)
- [email_verified](https://github.com/arneff/auth0-react-samples/blob/d1027816292860a8908422da29cb50eb4a4177b6/Sample-01/src/views/ExternalApi.js#L170-L172) required before an order can be placed. Users with unverified emails can still login.
- The API endpoint ([/api/external](https://github.com/arneff/auth0-react-samples/blob/d1027816292860a8908422da29cb50eb4a4177b6/Sample-01/api-server.js#L104)) servicing the orders request must require a valid token as well as a specific scope ([update:current_user_metadata](https://github.com/arneff/auth0-react-samples/blob/d1027816292860a8908422da29cb50eb4a4177b6/Sample-01/api-server.js#L45)) for the operation to complete.
- After an order is placed, save the order to the user’s Auth0 profile for future reference.
    - Implemented via the [Auth0_Management_API](https://github.com/arneff/auth0-react-samples/blob/d1027816292860a8908422da29cb50eb4a4177b6/Sample-01/api-server.js#L133-L174)
- Add the order history of a user to their ID token when they login
    - Implemented with Actions

    ```javascript
    exports.onExecutePostLogin = async (event, api) => {
      const namespace = 'https://p42.com';
      if (event.authorization) {
        api.idToken.setCustomClaim(`${namespace}/orders`, event.user.user_metadata);
      }
    }
    ```

## Configure credentials
The project needs to be configured with your Auth0 domain and client ID in order for the authentication flow to work.

To do this, first copy src/auth_config.json.example into a new file in the same folder called src/auth_config.json, and replace the values with your own Auth0 application credentials, and optionally the base URLs of your application and API:

```JSON
{
  "domain": "{YOUR AUTH0 DOMAIN}",
  "clientId": "{YOUR AUTH0 CLIENT ID}",
  "audience": "{YOUR AUTH0 API_IDENTIFIER}",
  "appOrigin": "{OPTIONAL: THE BASE URL OF YOUR APPLICATION (default: http://localhost:3000)}",
  "apiOrigin": "{OPTIONAL: THE BASE URL OF YOUR API (default: http://localhost:3001)}"
}
```

## Environment Variables
This project utizlizes the Auth0 Management API and will requires a set of secondary credentials to be read from a ```.env``` file within the Sample-01 directory.
```bash
CLIENTSECRET=xxxxyyyyxxxxx
CLIENTID=xxxxyyyyxxxxx
AUDIENCE=https://{YOUR_DOMAIN}.auth0.com/api/v2/
```

## Project setup

Use `npm` to install the project dependencies:

```bash
npm install
```

### Compile and hot-reload for development

This compiles and serves the React app and starts the backend API server on port 3001.

```bash
npm run dev
```

## Deployment

### Compiles and minifies for production

```bash
npm run build
```

### Docker build

To build and run the Docker image, run `exec.sh`, or `exec.ps1` on Windows.

### Run your tests

```bash
npm run test
```



## License

This project is licensed under the MIT license. See the [LICENSE](../LICENSE) file for more info.
