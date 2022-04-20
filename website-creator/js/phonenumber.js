
var credentials;
var secretKey;
var accessKey;
var sessionId;
var connect;
var phClaimPhoneNumberTable, phListTable;
var selectedQC;
var selectedId, selectedPhoneNumber;
var phoneList;
var cfList;
var hopList;
var phoneList;
var quickConnectList;
var timerID;
var dlgSourceAccessKey, dlgSourceSecretKey, dlgSourceRegion, dlgInstanceId;
const GCREATE = 'CREATE';
const GMODIFY = 'MODIFY';
const GVOICE = 'VOICE';
const GCHAT = 'CHAT';
const GSTANDARD = 'STANDARD';

// allowed will be CREATE and MODIFY
var currentOperation = GCREATE;

/*$( document ).ready(function() {
    if (!checkCookie()) {
        setAWSConfig(dlgSourceAccessKey, dlgSourceSecretKey, dlgSourceRegion);
        setupAll();
    } else {
        setupAll();
        $( "#configDialog" ).dialog( "open" );
    }
});*/

$( document ).ready(function() {
	dlgSourceRegion = getRegion();
	setupAll();
});	

function setupAll() {
    loadConnectAPIs();
    $( "#createTabs" ).tabs();
        
    $("#listPhoneNumber").click(() => {
        getAllPhoneNumbers();
    });
    
    
    $("#describePhoneNumber").click(() => {
        getPhoneNumberInfo(selectedId);
    });
    
    
    $("#awsConfiguration").click(() => {
        $( "#configDialog" ).dialog( "open" );
    });
    
    $("#btnConfiguration").click(() => {
        if (saveCookie()) {
            $( "#configDialog" ).dialog( "close" );
        } else {
            $( "#configDialog" ).dialog( "open" );
        }
    });
    
    $("#dialog").dialog({
        autoOpen: false,
        modal: true
      });
    
    $("#phClaimDialog").dialog({
        autoOpen: false,
        width: 800,
        modal: true,
        resizable: false,
        height: "auto"        
        
    });

    $("#claimPhoneNumber").click(() => {
        $( "#phClaimDialog" ).dialog( "open" );
        $('#sltPhoneNumbersToClaim').empty();
    });
    
    $("#btnSearchAvailableNumber").click(() => {
        getClaimablePhoneNumbers();
    });
    
    $("#btnClaim").click(() => {
        claimableThePhoneNumber();
    });
    
    $("#btnClaimAndAssociate").click(() => {
        claimablePhoneNumberAndAssociate();
    });
    
    $("#releasePhoneNumber").click(() => {
        releaseSelectedPhoneNumber();
    });

	$("#phAssociateCFDialog").dialog({
        autoOpen: false,
        width: 400,
        modal: true,
        resizable: false,
        height: "auto"        
        
    });

    $("#associatePhoneNumberContactFlow").click(() => {
        $( "#phAssociateCFDialog" ).dialog( "open" );
    });
    
	$("#btnAssociateCF").click(() => {
        associateContactFlowForNumber();
    });
    
    $("#disAssociatePhoneNumberContactFlow").click(() => {
        disAssociatePhoneNumberContactFlow();
    });
    
        
    $("#resultDialog").dialog({
        autoOpen: false,
        modal: true
    });

    
    $('#configDialog').dialog({
        autoOpen: false,
        width: 850,
        modal: true,
        resizable: false,
        height: "auto"        
    });

    $( "#confirmDialog" ).dialog({
        autoOpen: false,
        resizable: false,
        height: "auto",
        width: 400,
        modal: true,
        buttons: {
          "Yes": function() {
            $( this ).dialog( "close" );
          },
          Cancel: function() {
            $( this ).dialog( "close" );
          }
        }
    });
    
    
    phListTable = $('#phListTable').DataTable({
        columnDefs: [
            {
                targets: -1,
                className: 'dt-body-right'
            }
          ],        
        columns: [{title: "Phone Number"},{title: "Type"}, {title: "Country"}],
        select: true,
        paging: false,
        info: false,
        searching: false
    });
     
    phListTable.on( 'select', function ( e, dt, type, indexes ) {
        if ( type === 'row' ) {
            selectedQC = phListTable.rows( indexes ).data()[0][0];
            $('#selectedQC').val(selectedQC);
            for (var i=0; i< phoneList.ListPhoneNumbersSummaryList.length; i++) {
                if (selectedQC === phoneList.ListPhoneNumbersSummaryList[i].PhoneNumber) {
                    selectedId = phoneList.ListPhoneNumbersSummaryList[i].PhoneNumberId;
                    break;
                }
            }
        }
    });

    //getAllPhoneNumbers();
}


async function disAssociatePhoneNumberContactFlow() {
    try {
        handleWindow(true, '');
        var contactFlowId =  $('#sltContactFlowToAssociate').val();
        let sa = await  disassociatePhoneNumberContactFlow (selectedId, dlgInstanceId);
        console.log(sa);
        handleWindow(false, '');
        showResults("Successfully disassociated flow from the selected number");
    } catch(e) {
        console.log(e);        
        handleWindow(false, '');
        showResults(e);
    }
    
}

async function associateContactFlowForNumber() {
    try {
        handleWindow(true, '');
        var contactFlowId =  $('#sltContactFlowToAssociate').val();
        let sa = await associatePhoneNumberContactFlow(selectedId, dlgInstanceId, contactFlowId);
        console.log(sa);
        $( "#phAssociateCFDialog" ).dialog( "close" );
        handleWindow(false, '');
        showResults("Successfully associated flow to the selected number");
        
    } catch(e) {
        console.log(e);        
        handleWindow(false, '');
        showResults(e);
    }
    
}


async function releaseSelectedPhoneNumber() {
    try {
        handleWindow(true, '');
        var resp = await releasePhoneNumber(selectedId);
        console.log(resp);
        getAllPhoneNumbers();
        handleWindow(false, '');
        showResults("Successfully released the selected number from your instance");
        
    } catch(e) {
        console.log(e);        
        handleWindow(false, '');
        showResults(e);
    }
    
}

async function claimableThePhoneNumber() {
    try {
        handleWindow(true, '');
        var phoneNumber = $('#sltPhoneNumbersToClaim').val();
        var phoneNumberDescription = $('#txtDescription').val();

        var resp = await claimPhoneNumber(dlgInstanceId, phoneNumber, phoneNumberDescription);
        console.log(resp);
        getAllPhoneNumbers();
        handleWindow(false, '');
        $( "#phClaimDialog" ).dialog( "close" );
        
    } catch(e) {
        console.log(e);        
        handleWindow(false, '');
        showResults(e);
    }
    
}

async function claimablePhoneNumberAndAssociate() {
    try {
        handleWindow(true, '');
        var phoneNumber = $('#sltPhoneNumbersToClaim').val();
        var phoneNumberDescription = $('#txtDescription').val();
		var contactFlowId = $('#sltContactFlowToAssociate').val();
        var resp = await claimPhoneNumber(dlgInstanceId, phoneNumber, phoneNumberDescription);
        console.log(resp);
        resp = associatePhoneNumberContactFlow(resp.PhoneNumberId, dlgInstanceId, contactFlowId);
        getAllPhoneNumbers();
        handleWindow(false, '');
        $( "#phClaimDialog" ).dialog( "close" );
    } catch(e) {
        console.log(e);        
        handleWindow(false, '');
        showResults(e);
    }
    
}



async function getAllPhoneNumbers() {
    try {
		loadConnectAPIs();
		dlgInstanceId = getInstanceId();
        handleWindow(true, '');
        var phCountryCode = ["US", "AU", "FR"];
        var phNumberTypes = ["TOLL_FREE", "DID"];
        phoneList = await listPhoneNumbersV2(dlgInstanceId, 1000, null, phCountryCode, phNumberTypes, null);
        console.log(phoneList);

        formatJSON(phoneList, '#rpFormatted');
        phListTable.clear();
        for (var i=0; i< phoneList.ListPhoneNumbersSummaryList.length; i++) {
            var value = phoneList.ListPhoneNumbersSummaryList[i];
           	phListTable.row.add([value.PhoneNumber, value.PhoneNumberType, value.PhoneNumberCountryCode ]);
        }
        phListTable.draw();
 		var cfList = await listContactFlows(dlgInstanceId);
        console.log(cfList);

		$('#sltContactFlowToAssociate').empty();
	    for(var i=0; i < cfList.ContactFlowSummaryList.length; i++){
	    	var j = cfList.ContactFlowSummaryList[i];
	    	if(j.ContactFlowType === "CONTACT_FLOW") {
	    			$('#sltContactFlowToAssociate').append('<option selected value="' +  j.Id + '">' + j.Name +'</option>');
	    	}
	    }       
        handleWindow(false, '');
    } catch(e) {
        console.log(e);        
        handleWindow(false, '');
        showResults(e);
    }
    
}

async function getClaimablePhoneNumbers() {
    try {
        handleWindow(true, '');
        var phoneNumberCountryCode = $('#sltCountry').val();
        var phoneNumberType = $('#sltPhoneNumberType').val();
        let sa = await searchAvailablePhoneNumbers(dlgInstanceId, phoneNumberCountryCode, phoneNumberType, null, 10, null);
        console.log(sa);
        formatJSON(sa, '#rpFormatted');
		$('#sltPhoneNumbersToClaim').empty();
	    for(var i=0; i < sa.AvailableNumbersList.length; i++){
	    	var j = sa.AvailableNumbersList[i];
   			$('#sltPhoneNumbersToClaim').append('<option selected value="' +  j.PhoneNumber + '">' + j.PhoneNumber +'</option>');
	    }        
		
       /* var cfList = await listContactFlows(dlgInstanceId);
        console.log(cfList);

		$('#sltContactFlowToAssociate').empty();
	    for(var i=0; i < cfList.ContactFlowSummaryList.length; i++){
	    	var j = cfList.ContactFlowSummaryList[i];
	    	if(j.ContactFlowType === "CONTACT_FLOW") {
	    			$('#sltContactFlowToAssociate').append('<option selected value="' +  j.Id + '">' + j.Name +'</option>');
	    	}
	    }*/        
        handleWindow(false, '');
    } catch(e) {
        console.log(e);        
        handleWindow(false, '');
        showResults(e);
    }
    
}

async function getPhoneNumberInfo(phId) {
    try {
        handleWindow(true, '');
        var ph = await describePhoneNumber(phId);
        console.log(ph);
        formatJSON(ph, '#rpFormatted');
        handleWindow(false, '');
    } catch(e) {
        console.log(e);        
        handleWindow(false, '');
        showResults(e);
    }
    
}

const searchAvailablePhoneNumbers = (targetArn, phoneNumberCountryCode, phoneNumberType, phoneNumberPrefix, maxResults, nextToken ) => {
    return new Promise((resolve,reject) => {
           var params = {TargetArn : targetArn, PhoneNumberCountryCode : phoneNumberCountryCode,
           		PhoneNumberType : phoneNumberType, PhoneNumberPrefix : phoneNumberPrefix, MaxResults : maxResults,
           		NextToken : nextToken};       
           console.log(params);
           connect.searchAvailablePhoneNumbers(params, function (err, res) {        
                if (err) 
                     reject(err);
                 else 
                    resolve(res);
            });
        });
    }

const listPhoneNumbersV2 = (targetArn, maxResults, nextToken, phoneNumberCountryCodes, phoneNumberTypes, phoneNumberPrefix) => {
    return new Promise((resolve,reject) => {
           var params = {TargetArn : targetArn, MaxResults : maxResults, NextToken : nextToken, 
           				PhoneNumberCountryCodes : phoneNumberCountryCodes, PhoneNumberTypes : phoneNumberTypes,
           				PhoneNumberPrefix : phoneNumberPrefix};       
           console.log(params);
           connect.listPhoneNumbersV2(params, function (err, res) {        
                if (err) 
                     reject(err);
                 else 
                    resolve(res);
            });
        });
    }

const listPhoneNumbers = (instanceId ) => {
    return new Promise((resolve,reject) => {
           var params = {InstanceId : instanceId};       
           console.log(params);
           connect.listPhoneNumbers(params, function (err, res) {        
                if (err) 
                     reject(err);
                 else 
                    resolve(res);
            });
        });
    }

const describePhoneNumber = (phoneNumberId ) => {
    return new Promise((resolve,reject) => {
           var params = {PhoneNumberId : phoneNumberId};       
           console.log(params);
           connect.describePhoneNumber(params, function (err, res) {        
                if (err) 
                     reject(err);
                 else 
                    resolve(res);
            });
        });
    }

const listContactFlows = (instanceId) => {
    return new Promise((resolve,reject) => {
           var params = {InstanceId : instanceId};       
           console.log(params);
           connect.listContactFlows(params, function (err, res) {        
                if (err) 
                     reject(err);
                 else 
                    resolve(res);
            });
        });
    }

const claimPhoneNumber = (targetArn, phoneNumber, phoneNumberDescription) => {
    return new Promise((resolve,reject) => {
           var params = {TargetArn : targetArn, PhoneNumber : phoneNumber, PhoneNumberDescription : phoneNumberDescription};       
           console.log(params);
           connect.claimPhoneNumber(params, function (err, res) {        
                if (err) 
                     reject(err);
                 else 
                    resolve(res);
            });
        });
    }

const associatePhoneNumberContactFlow = (phoneNumberId, instanceId, contactFlowId) => {
    return new Promise((resolve,reject) => {
           var params = {PhoneNumberId : phoneNumberId, InstanceId : instanceId, ContactFlowId : contactFlowId};       
           console.log(params);
           connect.associatePhoneNumberContactFlow(params, function (err, res) {        
                if (err) 
                     reject(err);
                 else 
                    resolve(res);
            });
        });
    }

const releasePhoneNumber = (phoneNumberId) => {
    return new Promise((resolve,reject) => {
           var params = {PhoneNumberId : phoneNumberId};       
           console.log(params);
           connect.releasePhoneNumber(params, function (err, res) {        
                if (err) 
                     reject(err);
                 else 
                    resolve(res);
            });
        });
    }

const disassociatePhoneNumberContactFlow = (phoneNumberId, instanceId) => {
    return new Promise((resolve,reject) => {
           var params = {PhoneNumberId : phoneNumberId, InstanceId : instanceId};       
           console.log(params);
           connect.disassociatePhoneNumberContactFlow(params, function (err, res) {        
                if (err) 
                     reject(err);
                 else 
                    resolve(res);
            });
        });
    }



function showResults(message){
    $('#resultSpan').text(message);
    $("#resultDialog").dialog("open");
}

function loadConnectAPIs() {
	//connect = new AWS.Connect({ region: "us-west-2", endpoint: "https://91am9nwnzk.execute-api.us-west-2.amazonaws.com/Prod" }, {apiVersion: '2017-08-08'});
	//connect = new AWS.Connect({ region: "us-west-2", endpoint: "https://1i6i97swl3.execute-api.us-west-2.amazonaws.com/Prod" }, {apiVersion: '2017-08-08'});
	//connect = new AWS.Connect({ region: "us-west-2", endpoint: "https://connect-gamma.us-west-2.amazonaws.com" }, {apiVersion: '2017-08-08'});
	connect = new AWS.Connect({ region: dlgSourceRegion});
}


function handleWindow(openClose, text) {
    if(openClose == true) {
        $( "#dialog" ).dialog( "open" );
    } else {
        $( "#dialog" ).dialog( "close" );
    }

    if(text.length>1) {
        $('#waitingSpan').text(text);
    } else {
        $('#waitingSpan').text('    Waiting for server to respond');
    }
}

function setAWSConfig(accessKey, secretKey, rgn) {

    AWS.config.update({
        accessKeyId: accessKey, secretAccessKey: secretKey, region: rgn
    });    
    AWS.config.credentials.get(function (err) {
        if (err)
            console.log(err);
        else {
            credentials = AWS.config.credentials;
            getSessionToken();
        }
    });
    
}

function formatJSON(data, element) {
    $(element).html(prettyPrintJson.toHtml(data));
}


function getSessionToken() {
    var sts = new AWS.STS();
    sts.getSessionToken(function (err, data) {
      if (err) console.log("Error getting credentials");
      else {
          secretKey = data.Credentials.SecretAccessKey;
          accessKey = data.Credentials.AccessKeyId;
          sessionId = data.Credentials.SessionToken;
      }
    });
}

function clear_form_elements(ele) {
    $(':input',ele)
      .not(':button, :submit, :reset')
      .val('')
      .prop('checked', false)
      .prop('selected', false);
}

function saveCookie() {
    dlgSourceAccessKey=$("#dlgSourceAccessKey").val();
    dlgSourceSecretKey=$("#dlgSourceSecretKey").val();
    dlgSourceRegion=$("#dlgSourceRegion").val();
    dlgInstanceId = $("#dlgInstanceId").val();
    if(!checkAllMandatoryFields()) {
        setCookie("dlgSourceAccessKey", dlgSourceAccessKey,100);
        setCookie("dlgSourceSecretKey", dlgSourceSecretKey,100 );
        setCookie("dlgSourceRegion", dlgSourceRegion,100);
        setCookie("dlgInstanceId", dlgInstanceId,100);
        $('#spnAWSMessage').text('');
        setAWSConfig(dlgSourceAccessKey, dlgSourceSecretKey, dlgSourceRegion);
        return true;
    }else{
        $('#spnAWSMessage').text('All fields are mandatory and cannot be whitespaces or null');        
        return false;
    }
}

function getCookie(c_name)
{
    var i,x,y,ARRcookies=document.cookie.split(";");
    for (i=0;i<ARRcookies.length;i++)
    {
      x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
      y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
      x=x.replace(/^\s+|\s+$/g,"");
      if (x===c_name)
        {
          return unescape(y);
        }
     }
}

function setCookie(c_name,value,exdays)
{
    var exdate=new Date();
    exdate.setDate(exdate.getDate() + exdays);
    var c_value=escape(value) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());
    document.cookie=c_name + "=" + c_value;
}

function checkCookie()
{
    dlgSourceAccessKey=getCookie("dlgSourceAccessKey");
    dlgSourceSecretKey=getCookie("dlgSourceSecretKey");
    dlgSourceRegion=getCookie("dlgSourceRegion");
    dlgInstanceId=getCookie("dlgInstanceId");
    $('#dlgSourceAccessKey').val(dlgSourceAccessKey);
    $('#dlgSourceSecretKey').val(dlgSourceSecretKey);
    $('#dlgSourceRegion').val(dlgSourceRegion);
    $('#dlgInstanceId').val(dlgInstanceId);
    
    return checkAllMandatoryFields();
}

function checkAllMandatoryFields() {
    if(isBlank(dlgSourceAccessKey) || dlgSourceAccessKey.isEmpty() || 
            isBlank(dlgSourceSecretKey) || dlgSourceSecretKey.isEmpty() || 
            isBlank(dlgSourceRegion) || dlgSourceRegion.isEmpty() ||
            isBlank(dlgInstanceId) || dlgInstanceId.isEmpty()
            ) {
        return true;
    }else
        return false;
}

function isBlank(str) {
    return (!str || /^\s*$/.test(str));
}

String.prototype.isEmpty = function() {
    return (this.length === 0 || !this.trim());
};