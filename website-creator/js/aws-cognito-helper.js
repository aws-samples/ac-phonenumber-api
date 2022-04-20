	console.log("Authenticating User");
  	var cognitoRegion = getRegion();
 	var cognitoUserPoolId = getCognitoUserPoolId();
 	var cognitoClientId = getCognitoClientId();
    var userName ;
    var pass ;
 	var userNameInPool;	
    var idTokenForAPI;
 	var authenticationData ;
 	var cognitoIdentityPoolId = getCognitoIdentityPoolId(); 
    var authenticationDetails ;
    var poolData;
    var userPool ;
    var userData ;
    var cognitoUser ;

 function authenticateUser(){
 	 
	userName = $.trim($('#userName').val());
	pass = $.trim($('#password').val());	
	userNameInPool = userName;
 	authenticationData = {
 			Username : userName,
 			Password : pass,
 		};
 	authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);
    poolData = { UserPoolId : cognitoUserPoolId,
            ClientId : cognitoClientId
        };
    userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
    userData = {
            Username : userNameInPool,
            Pool : userPool
        };
    cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
 	
 	console.log(authenticationDetails);
 	console.log(cognitoUser);
     cognitoUser.authenticateUser(authenticationDetails, {
         onSuccess: function (result) {
 			console.log(result);
 			console.log('Successfully logged in to user pool, now logging into identity pool');
             var accessToken = result.getAccessToken().getJwtToken();
             /* Use the idToken for Logins Map when Federating User Pools with identity pools or when passing through an Authorization Header to an API Gateway Authorizer*/
             var idToken = result.idToken.jwtToken;
             idTokenForAPI = idToken;
 			var logins = {};
 			logins["cognito-idp." + cognitoRegion + ".amazonaws.com/" + cognitoUserPoolId] = result.getIdToken().getJwtToken();
 			var params = {
 				IdentityPoolId: cognitoIdentityPoolId,
 				Logins: logins
 			};
 			AWS.config.region = cognitoRegion;
 			AWSCognito.config.region = cognitoRegion;
 			//AWS.config.credentials.clearCachedId();
 			AWS.config.credentials = new AWS.CognitoIdentityCredentials(params);
 			AWS.config.credentials.get(function(refreshErr) {
 				if(refreshErr) {
 					console.error('Failed to login', refreshErr);
 				}
 				else {
 					console.log('Success logged into identity pool');
 					dialog.dialog( "close" ); 					
 					//getAllUsers(); 					
					getAllPhoneNumbers();
 				}
 			});

         },

         onFailure: function(err) {
        	 console.log('Error while authenticating', err);        	 
    	    if(err.code == "NotAuthorizedException"){
    	    	$("#err1").html("Invalid username/password");
    	    	$('#err1').css('color', 'red');    	    	
    	    }    
    	    if(err.code == "UserNotFoundException"){
    	    	console.log('User is not confirmed, please contact your administrator');    	    	
    	    	$("#err1").html("Invalid username/password");
    	    	$('#err1').css('color', 'red');
    	    }
 			if(err.code == "PasswordResetRequiredException"){
    	    	console.log('User needs to reset password');
				dialog.dialog( "close" );
				$( "#dialog-form2" ).css("visibility", "visible");
				$( "#divPasswordPasscode" ).css("visibility", "visible");	
				$("#err2").html("Reset your password with the passcode that you received");
    	    	$('#err2').css('color', 'red');    								
				dialog2.dialog( "open" );
			}			
         },
 		 newPasswordRequired: function(userAttributes, requiredAttributes){
 			console.log('Complete New Password Challenge');
 			dialog.dialog( "close" );
 			$( "#dialog-form2" ).css("visibility", "visible")
 			dialog2.dialog( "open" ); 			
 			
 		 }
     });
 }

 function completeNewPasswordChallenge(){
	 var attributesData = {};
	 console.log('Changing password');
	 var password = $.trim($('#password2').val());
	 var passcode = $.trim($('#passcode').val());
	 
	 if(passcode.length === 0 && isBlank(passcode) && passcode.isEmpty() ){
		 cognitoUser.completeNewPasswordChallenge(password, attributesData, {
		      onSuccess: (result) => {
		          console.log("NEW PASSWORD COMPLETED: ");
		          console.log(result);
		          dialog2.dialog( "close" );
		          location.reload();
		        },
		        onFailure: (err) => {
		          console.log(err);
		        }
		   });
	} else {
		if(handleConfirmForgetPassword(userName, password, passcode) === true) {
				location.reload();		
		} else {
			$("#err2").html("Could not forget password, please contact admin");
    		$('#err2').css('color', 'red');
		}
	}	
	 
 }

async function handleConfirmForgetPassword(username, password, passcode) {
	try {
	 	console.log('Changing password with passcode');
        var resp = await confirmForgetPassword(username, password, passcode);
        console.log(resp);
		location.reload();	
        return true;

	} catch(e) {
		console.log(e);
		return false;
	}		
}

async function handleForgetPassword(username) {
	try {
        var resp = await forgotPassword(username);
        console.log(resp);
        return true;

	} catch(e) {
		console.log(e);
		return false;
	}	
}

const forgotPassword = (username) => {
    return new Promise((resolve,reject) => {
           cognitoUser.forgotPassword(username, function (err, res) {        
                if (err) 
                     reject(err);
                 else 
                    resolve(res);
            });
        });
    }
 
 
const confirmForgetPassword = (username, password, confirmationCode) => {
    return new Promise((resolve,reject) => {
		AWS.config.region = cognitoRegion;	
		var cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider();
		var params = {
		  ClientId: getCognitoClientId(), /* required */
		  ConfirmationCode: confirmationCode, /* required */
		  Password: password, /* required */
		  Username: username
		};
		cognitoidentityserviceprovider.confirmForgotPassword(params, function (err, data) {
			if (err) 
				reject(err); 
		  	else     
		  		resolve(data);           
		});
      });
    }

 
 function changePassword(){
	var pass2 = $.trim($('#password2').val());
 	cognitoUser.changePassword(pass2, pass2, function(err, result) {
         if (err) {
             console.log(err)
             return;
         }
         console.log('call result: ' + result);
     });
 }