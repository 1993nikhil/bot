var express = require('express');
var request = require('request');
var fb_api = require('../routes/fbapi');
var Policy = require('../models/policyDetailModel');
var conf = require('../config/config');
//var dataAccessCtrl = require('../controllers/dataAccessLayerController');
var util = require('../utils/utils');
var Q = require('q');

// function getPolicyDetail(policyId){
//   var deferred=Q.defer();
//   Policy.findOne({policyNo:policyId}, function(err,data){
//     if(err){
//       deferred.reject(err);
//       console.log("error1");
//     }else{
//       deferred.resolve(data);
//       console.log("Data");
//       console.log(data);
//     }
//   });
//   return deferred.promise; 
// }

var policyDataMock = {
    "err": null,
    "result": {
        "recordsets": [
            [{
                "Policy_Number": "00426202",
                "Premium Due Date": "2018-06-13T00:00:00.000Z",
                "Premium Due Amount": 365,
                "Policy status": "In Force",
                "Amount Deposited in Policy Till": 711.75,
                "Last_Payment_date": "2017-07-07T00:00:00.000Z"
            }]
        ],
        "recordset": [{
            "Policy_Number": "00425653",
            "Premium Due Date": "2018-06-13T00:00:00.000Z",
            "Premium Due Amount": 365,
            "Policy status": "In Force",
            "Amount Deposited in Policy Till": 711.75,
            "Last_Payment_date": "2017-07-07T00:00:00.000Z"
        }, {
            "Policy_Number": "10101010",
            "Premium Due Date": "2018-08-16T00:00:00.000Z",
            "Premium Due Amount": 766,
            "Policy status": "In Force",
            "Amount Deposited in Policy Till": 1711,
            "Last_Payment_date": "2017-07-07T00:00:00.000Z"
        }, {
            "Policy_Number": "11114444",
            "Premium Due Date": "2018-06-23T00:00:00.000Z",
            "Premium Due Amount": 565,
            "Policy status": "In Force",
            "Amount Deposited in Policy Till": 911.75,
            "Last_Payment_date": "2017-07-07T00:00:00.000Z"
        }],
        "output": {},
        "rowsAffected": [
            1
        ]
    }
}

var policyIDMock = {
    "err": null,
    "result": {
        "recordsets": [
            [{
                "Policy Number": "00425653",
                "First_name": "PramodVasudevan",
                "Last_Name": "Pillai",
                "DOB": "1979-04-05T00:00:00.000Z",
                "Application_No": "ON00000044",
                "Mobile number": "8002848962",
                "Policy issue date": "2016-06-10T00:00:00.000Z"
            }]
        ],
        "recordset": [{
            "Policy Number": "10101010",
            "First_name": "PramodVasudevan",
            "Last_Name": "Pillai",
            "DOB": "1979-04-05T00:00:00.000Z",
            "Application_No": "ON00000044",
            "Mobile number": "8002848962",
            "Policy issue date": "2016-06-10T00:00:00.000Z"
        }],
        "output": {},
        "rowsAffected": [
            1
        ]
    }
}

var policyMock = {
    "err": null,
    "result": {
        "recordsets": [
            [{
                "Policy Number": "00425653",
                "First_name": "PramodVasudevan",
                "Last_Name": "Pillai",
                "DOB": "1979-04-05T00:00:00.000Z",
                "Application_No": "ON00000044",
                "Mobile number": "8002848962",
                "Policy issue date": "2016-06-10T00:00:00.000Z"
            }]
        ],
        "recordset": [{
            "Policy Number": "10101010",
            "First_name": "PramodVasudevan",
            "Last_Name": "Pillai",
            "DOB": "1979-04-05T00:00:00.000Z",
            "Application_No": "ON00000044",
            "Mobile number": "8002848962",
            "Policy issue date": "2016-06-10T00:00:00.000Z"
        }, {
            "Policy Number": "00425653",
            "First_name": "PramodVasudevan",
            "Last_Name": "Pillai",
            "DOB": "1979-04-05T00:00:00.000Z",
            "Application_No": "ON00000044",
            "Mobile number": "8002848962",
            "Policy issue date": "2016-06-10T00:00:00.000Z"
        }, {
            "Policy Number": "11114444",
            "First_name": "PramodVasudevan",
            "Last_Name": "Pillai",
            "DOB": "1979-04-05T00:00:00.000Z",
            "Application_No": "ON00000044",
            "Mobile number": "8002848962",
            "Policy issue date": "2016-06-10T00:00:00.000Z"
        }],
        "output": {},
        "rowsAffected": [
            1
        ]
    }
}

function validatePolicy(response) {

    var deferred = Q.defer();
    try {
        if (response.policyNo != '') {
            if(response.policyNo=='10101010'){
              deferred.resolve(policyIDMock);
            }else{
              deferred.resolve();
            }
            
            // dataAccessCtrl.validateByPolicyNo(response).then(function(res){
            //     var policyData = res.result.recordset[0];
            //     if(policyData){
            //        if(response.dob==util.convertDate(policyData["DOB"])){
            //           deferred.resolve(res);
            //        }     
            //        else{
            //           deferred.resolve();
            //         } 
            //     }else{
            //       deferred.resolve();
            //     }              
            // }); 
        } else {
            if(response.mobileNo=='8002848962'){
              deferred.resolve(policyMock);
            }
            else{
              deferred.resolve();
            }
                
            // dataAccessCtrl.validateByMobile(response).then(function(res){
            //     var policyData = res.result.recordset[0];
            //     if(policyData){
            //        if(response.dob==util.convertDate(policyData["DOB"])){
            //           deferred.resolve(res);
            //        }     
            //        else{
            //           deferred.resolve();
            //         } 
            //     }else{
            //       deferred.resolve();
            //     }
            // });
        }
    } catch (e) {
        deferred.reject();
    }
    return deferred.promise;
}

function getPolicyInformation(policyNo) {
    var deferred = Q.defer();
    try {
        var policyData = policyDataMock.result.recordset;
        for (var i in policyData) {
            if (policyNo == policyData[i]["Policy_Number"]) {
                deferred.resolve(policyData[i])
            }
        }

        // dataAccessCtrl.getPolicyInfo(policyNo).then(function(res){
        //    deferred.resolve(res); 
        // });
    } catch (e) {
        deferred.reject();
    }
    return deferred.promise;
}

module.exports = {
    validatePolicy: validatePolicy,
    getPolicyInformation: getPolicyInformation
};