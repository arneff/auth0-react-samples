import React, { useState } from "react";
import { Button, Alert } from "reactstrap";
import Highlight from "../components/Highlight";
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import config from "../auth_config.json";
import Loading from "../components/Loading";
import badge from "../assets/member.png";

// const { apiOrigin = "http://localhost:3001" } = config;
const appPort = process.env.API_PORT || 3001;
const apiOrigin = config.appOrigin || `http://localhost:${appPort}`;



export const ExternalMemberComponent = () => {
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

    await callMember();
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

    await callMember();
  };

  const eVerify = async () => {
    const responseData = "Please verify your email before becoming a member."

      setState({
        ...state,
        showResult: true,
        apiMessage: responseData,
      });

  }

  const callMember = async () => {
    // const userId = user.sub
    const data = {
        "id": user.sub
    }
    console.log(data)
     try {
  

      // Get the access token from the Auth0 client
      const token = await getAccessTokenSilently();

      // Make the call to the API, setting the token
      // in the Authorization header
      const response = await fetch(`${apiOrigin}/api/member`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-type": "application/json"

        },
        method: 'POST',
        body: JSON.stringify(data)
      });
  
      // Fetch the JSON result
      console.log(response)
      const responseStatus = response.status
      let responseData;
      if (responseStatus > 200) {
        // document.getElementById("api-call-result").classList.add('alert-danger');
         responseData = response
         
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
        <img className="mb-3 app-logo" src={badge} alt="React logo" width="120" />
        <h1>Verify Your Membership!</h1>
        <p>
          Ping an external API by clicking the button below to assign your user
          the member role needed to place orders!
        </p>
        
        <Button  color="primary" className="mt-5" onClick={user.email_verified? callMember: eVerify} >
          Join Now!
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

export default withAuthenticationRequired(ExternalMemberComponent, {
  onRedirecting: () => <Loading />,
});
