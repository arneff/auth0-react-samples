import React, { useState } from "react";
import { Button, Alert } from "reactstrap";
import Highlight from "../components/Highlight";
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import config from "../auth_config.json";
import Loading from "../components/Loading";
import whole from "../assets/whole.png";


export const ExternalApiComponent = () => {
  const appPort = process.env.PORT || 3001;
  const apiOrigin = config.apiOrigin || `http://localhost:${appPort}`;
  const [state, setState] = useState({
    showResult: false,
    apiMessage: "",
    error: null,
  });

  const {
    user,
    getAccessTokenSilently,
    loginWithPopup,
    getAccessTokenWithPopup,
  } = useAuth0();

  const handleConsent = async () => {
    try {
      await getAccessTokenWithPopup({
        scope: 'update:current_user_metadata'
      });
      setState({
        ...state,
        error: null,
      });
    } catch (error) {
      setState({
        ...state,
        error: error.error,
      });
    }

    await callApi();
  };

  const handleLoginAgain = async () => {
    try {
      await loginWithPopup();
      setState({
        ...state,
        error: null,
      });
    } catch (error) {
      setState({
        ...state,
        error: error.error,
      });
    }

    await callApi();
  };

  const eVerify = async () => {
    const responseData = "No Pizza for you! Please verify your email before ordering."

      setState({
        ...state,
        showResult: true,
        apiMessage: responseData,
      });

  }

  const callApi = async () => {
    console.log(user)
     try {
  
      // Get the access token from the Auth0 client
      const token = await getAccessTokenSilently();

      const user = await useAuth0;
      console.log(JSON.stringify(user))
      const date = Date.now();

      //set auth0 user_metadata
      user.user_metadata = user.user_metadata || {};
      user.user_metadata.orders = user.user_metadata.orders || {};
      user.user_metadata.orders = {"date": date, "Pizza": "XL"}
      console.log(user.user_metadata)
      // Make the call to the API, setting the token
      // in the Authorization header
      const response = await fetch(`${apiOrigin}/api/external`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-type": "application/json"

        },
        method: 'POST',
        body: JSON.stringify(user.user_metadata.orders)
      });
  
      // Fetch the JSON result
      const responseStatus = response.status
      let responseData;
      if (responseStatus > 200) {
        // document.getElementById("api-call-result").classList.add('alert-danger');
         responseData = "You need to be a member before ordering!"
         
      } else {
        // document.getElementById("api-call-result").classList.add('alert-success');
        responseData = await response.json();
      }
      setState({
        ...state,
        showResult: true,
        apiMessage: responseData,
      });

  
  } catch (error) {
        setState({
          ...state,
          error: error.error,
        })    
    }
  };

  const handle = (e, fn) => {
    e.preventDefault();
    fn();
  };

  return (
    <>
      <div className="mb-5">
        {state.error === "consent_required" && (
          <Alert color="warning">
            You need to{" "}
            <a
              href="#/"
              class="alert-link"
              onClick={(e) => handle(e, handleConsent)}
            >
              consent to get access to users api
            </a>
          </Alert>
        )}

        {state.error === "login_required" && (
          <Alert color="warning">
            You need to{" "}
            <a
              href="#/"
              class="alert-link"
              onClick={(e) => handle(e, handleLoginAgain)}
            >
              log in again
            </a>
          </Alert>
        )}
        <img className="mb-3 app-logo" src={whole} alt="React logo" width="120" />
        <h1>XL Pizza</h1>
        <p>
          Ping an external API by clicking the button below. This will call the
          external API using valid token with a specific scope.
        </p>
        
        <Button  color="primary" className="mt-5" onClick={user.email_verified? callApi: eVerify} >
          Order
        </Button>
        
      </div>

      <div className="result-block-container">
        {state.showResult && (
          <div className="result-block" data-testid="api-result">
            <h6 className="muted">Result</h6>
            <Highlight>
              <span>{JSON.stringify(state.apiMessage, null, 2)}</span>
            </Highlight>
          </div>
        )}
      </div>
    </>
  );
};

export default withAuthenticationRequired(ExternalApiComponent, {
  onRedirecting: () => <Loading />,
});
