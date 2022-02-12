const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const { join } = require("path");
const cors = require("cors");
const jwt = require("express-jwt");
const jwtScope = require('express-jwt-scope');
const jwksRsa = require("jwks-rsa");
const authConfig = require("./src/auth_config.json");
const fetch = require("cross-fetch");
require('dotenv').config()

const app = express();

const port = process.env.PORT || 3001;

app.use(morgan("dev"));
app.use(helmet({
    contentSecurityPolicy: false
  }));
app.use(express.static(join(__dirname, "build")));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (!authConfig.domain || !authConfig.audience) {
  throw new Error(
    "Please make sure that auth_config.json is in place and populated"
  );
}


const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${authConfig.domain}/.well-known/jwks.json`
  }),

  audience: authConfig.audience,
  issuer: `https://${authConfig.domain}/`,
  algorithms: ["RS256"]
});

const checkScopes = jwtScope('update:current_user_metadata');

app.get('/api/test', (req, res) => {
    res.send({msg: "success!"});
});

app.post("/api/member", async (req, res) => {
    // console.log("req: " + JSON.stringify(req.user))
  const user_id = req.body.id;

  // request body for mgmt api access token
  const mReq = await fetch('https://dev-h1uc4uvp.us.auth0.com/oauth/token', {
    headers: {
    "Content-Type": "application/x-www-form-urlencoded",
    },
    method: 'POST',
    body: new URLSearchParams( {
      'grant_type': 'client_credentials',
      'client_id': `${process.env.CLIENTID}`,
      'client_secret': `${process.env.CLIENTSECRET}`,
      'audience': 'https://dev-h1uc4uvp.us.auth0.com/api/v2/',
      'scope': 'read:users read:user_idp_tokens update:users update:users_app_metadata'
    })
  
  });
  const mResp = await mReq.json();
  const mToken = mResp.access_token;
  console.log(mToken)
  const roleReq = await fetch(`https:dev-h1uc4uvp.us.auth0.com/api/v2/users/${user_id}/roles`, {
    headers: {
      "Authorization": `Bearer ${mToken}`,
      "Content-Type": "application/json",
    }
  });
  const roleResp = await roleReq.json();
  // const roleName = roleResp[0].name;
  try {
    if (roleResp[0].name === "member") {
      res.send({msg: "Thank you for already being a member!"});
    }

  } catch (err) {
    // console.log("Caught" + err)
    const roleData = {
      "roles": ["rol_30LzEbh6zy0JOD8y"]
    }
    const addRoleReq = await fetch(`https:dev-h1uc4uvp.us.auth0.com/api/v2/users/${user_id}/roles`, {
      headers: {
        "Authorization": `Bearer ${mToken}`,
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify(roleData)
    });
    const addResp = await addRoleReq.body;
    // console.log(addResp)
    res.send({msg: "The meaning of life can now be yours! ;) Please refresh your browser to place an order!"});
  }

  
});


app.post("/api/external", checkJwt, checkScopes,  async (req, res) => {
  const user_id = req.user.sub
  // console.log("req: " + JSON.stringify(req.user))
  res.send({msg: "Your order has been received!", body: req.body});

  //request body for mgmt api access token
  const mReq = await fetch('https://dev-h1uc4uvp.us.auth0.com/oauth/token', {
    headers: {
    "Content-Type": "application/x-www-form-urlencoded",
    },
    method: 'POST',
    body: new URLSearchParams( {
      'grant_type': 'client_credentials',
      'client_id': `${process.env.CLIENTID}`,
      'client_secret': `${process.env.CLIENTSECRET}`,
      'audience': 'https://dev-h1uc4uvp.us.auth0.com/api/v2/',
      'scope': 'read:users read:user_idp_tokens update:users update:users_app_metadata'
    })
  
  });
  const mResp = await mReq.json();
  const mToken = mResp.access_token
  // define object to hold metadata
  const uMeta = {
    user_metadata: {
      "orders":[req.body]
    }
  }
  // get user to see if user_metadata is present
  const userReq = await fetch(`https:dev-h1uc4uvp.us.auth0.com/api/v2/users/${user_id}?` +
    new URLSearchParams({
      'fields': 'user_metadata',
      'include_fields': true }), {
    headers: {
      "Authorization": `Bearer ${mToken}`,
      "Content-Type": "application/json",
    }
  });
  
  const userResp = await userReq.json()
  // if orders are present push req body to userResp to use in POST
  // if error then provide orders key for req.body value
  console.log(userResp.user_metadata)

  // let ordersPresent = "orders" in userResp.user_metadata ? true : false;
  if (typeof userResp.user_metadata !== 'undefined'){
    userResp.user_metadata.orders.push(req.body)
    const metaAdd = await fetch(`https:dev-h1uc4uvp.us.auth0.com/api/v2/users/${user_id}`, {
      headers: {
        "Authorization": `Bearer ${mToken}`,
        "Content-Type": "application/json",
      },
      method: "PATCH",
      body: JSON.stringify(userResp)
      
    });
    const addResp = await metaAdd.json()
    console.log("add response" + JSON.stringify(addResp)) 

  }else {
    const metaReq = await fetch(`https:dev-h1uc4uvp.us.auth0.com/api/v2/users/${user_id}`, {
      headers: {
        "Authorization": `Bearer ${mToken}`,
        "Content-Type": "application/json",
      },
      method: "PATCH",
      body: JSON.stringify(uMeta)
    });
    const metaResp = await metaReq.json()
    console.log(metaResp)

  }
  


    

   
});

app.get('/*', (req, res) => {
    res.sendFile(join(__dirname, 'build', 'index.html'));
});

// app.listen(port, () => console.log(`Server listening on port ${port}`));
app.listen(port, () => console.log(`API Server listening on port ${port}`));
