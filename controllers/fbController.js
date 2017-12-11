var express = require('express');
var request = require('request');
var fbService = require('../services/fbService');
var fb_api = require('../routes/fbapi');
var utilMsg = require('../utils/messages');
var util = require('../utils/utils');
var conf = require('../config/config');
var policyDetail = require('../utils/policyData');
var validatePol = require('../services/policyDetailService');
var Q = require('q');
var moment = require('moment');
var sha1 = require('sha1');
var index = 0;
var policyDetailNum = '';
var policyIDTemp = '';
var validPolicy = [];
var policyButtons = [];

function receivedMessage(event) {
    var senderID = event.sender.id;
    var pageId = event.recipient.id;
    var timeOfMessage = event.timestamp;
    var message = event.message;

    var messageId = message.mid;

    var messageText = message.text;
    var messageAttachments = message.attachments;
    if (messageText == undefined) {
        return false;
    } else {
        messageText = messageText.toLowerCase();
    }

    if (messageText == 'hi' || messageText == 'hello' || messageText == 'new') {
        fbService.checkUser(senderID).then(function(resp) {
            if (resp) {
                getUserName(senderID, timeOfMessage);
                fbService.updateQuestionIndex(senderID, "0-null-null");
            } else {
                getUserName(senderID, timeOfMessage);
                fbService.saveUser(senderID);
            }
        });
    } else if (messageText == 'cancel') {
        sendCancelMessage(senderID, "Dear Customer, Your sessioin has been cancelled");
    } else {
        fbService.checkUser(senderID).then(function(resp) {
            if (resp) {
                var newQuestionIndex = resp.questionIndex;
                var indArray = resp.questionIndex.split("-");
                var index = '';
                if (indArray[0] == '4a') {
                    index = '4a';
                } else if (indArray[0] == '4b') {
                    index = '4b';
                } else if (indArray[0] == '4c') {
                    index = '4c'
                } else {
                    index = parseInt(indArray[0]) + 1;
                }
                console.log('index', index);
                if (index == 5) {
                    console.log('messageText', messageText);
                    if (messageText == 'resend') {
                        resendOTP(senderID, timeOfMessage);
                    } else {
                        verifyOTP(senderID, messageText, timeOfMessage, newQuestionIndex);
                    }

                } else if (index == 1 || index == 8) {
                    sendTextMessage(senderID, "You can type \"cancel\" at any point in time to exit conversation or type \"New\" to start new conversation");
                } else {
                    nextQuestion(newQuestionIndex, messageText, senderID, timeOfMessage);
                }

            } else {
                getUserName(senderID);
                fbService.saveUser(senderID);
            }
        });

    }

}

function receivedPostback(messagingEvent) {

    var senderID = messagingEvent.sender.id;
    var pageId = messagingEvent.recipient.id;
    var timeOfMessage = messagingEvent.timestamp;
    var message = messagingEvent.postback.payload;

    // index = index+1;
    if (message == 'get started') {

        fbService.checkUser(senderID).then(function(resp) {
            if (resp) {
                getUserName(senderID, timeOfMessage);
                fbService.updateQuestionIndex(senderID, '0-null-null');
            } else {
                getUserName(senderID, timeOfMessage);
                fbService.saveUser(senderID);
            }
        });

    }

    var msgArr = message.split("-");
    console.log("msgArr", msgArr[0]);
    console.log("msgArr[1]=", msgArr[1]);

    fbService.checkUser(senderID).then(function(resp) {
        if (resp) {
            var questionIndex = resp.questionIndex;
            var index = questionIndex.split("-");
            var newQIndex = '4b-' + msgArr[1] + '-otp';
            if (message == '0-NP-null') {
                if (index[0] == '4b') {
                    nextQuestion(newQIndex, message, senderID, timeOfMessage);
                } else {
                    nextQuestion("1-NP-PolicyID", message, senderID, timeOfMessage);
                }

            } else if (message == '0-PS-null') {
                if (index[0] == '4b') {
                    nextQuestion(newQIndex, message, senderID, timeOfMessage);
                } else {
                    nextQuestion("1-PS-PolicyID", message, senderID, timeOfMessage);
                }
            } else if (message == '0-FV-null') {
                if (index[0] == '4b') {
                    nextQuestion(newQIndex, message, senderID, timeOfMessage);
                } else {
                    nextQuestion("1-FV-PolicyID", message, senderID, timeOfMessage);
                }
            } else if (message == '0-PP-null') {
                if (index[0] == '4b') {
                    nextQuestion(newQIndex, message, senderID, timeOfMessage);
                } else {
                    nextQuestion("1-PP-PolicyID", message, senderID, timeOfMessage);
                }
            } else if (message == '0-TAP-null') {
                if (index[0] == '4b') {
                    nextQuestion(newQIndex, message, senderID, timeOfMessage);
                } else {
                    nextQuestion("1-TAP-PolicyID", message, senderID, timeOfMessage);
                }
            } else if (msgArr[0] == 'Multi') {
                //var questionIndex = resp.questionIndex;
                nextQuestion(questionIndex, msgArr[1], senderID, timeOfMessage);
            }
        }
    });

}

function getUserName(userId, timeOfMessage) {
    var getInfoUserAPI = ' https://graph.facebook.com/v2.6/' + userId + '?fields=first_name,last_name,profile_pic,locale,timezone,gender&access_token=' + conf.token;

    request({
        uri: getInfoUserAPI,
        method: 'GET',

    }, function(error, response, body) {

        if (!error && response.statusCode == 200) {
            var jsonData = JSON.parse(body);
            var welcomeMessage = utilMsg.messages.greeting;
            //console.log('jsonData',jsonData);
            jsonData.first_name = jsonData.first_name || '';
            jsonData.last_name = jsonData.last_name || '';
            var result = welcomeMessage.replace("#userName#", jsonData.first_name + " " + jsonData.last_name);
            var currentDate = moment(timeOfMessage).add(6, 'hours').subtract(30, 'minutes');
            var hours = currentDate.hours();
            if (hours < 12) {
                result = result.replace("#greet#", "Good morning");
            } else if (hours >= 12 && hours < 17) {
                result = result.replace("#greet#", "Good afternoon");
            } else if (hours >= 17 && hours <= 24) {
                result = result.replace("#greet#", "Good evening");
            }
            console.log("aaaaaaa");
            return sendTextMessage(userId, result)
                .then(function() {
                    console.log("bbbbbb");
                    return startConversation(userId, utilMsg.messages.buttonMessage);
                })
                .then(function() {
                    console.log("ccccccc");
                    return nextOption(userId, "...");
                })
                .then(function() {
                    console.log("ddddd");
                    return sendTextMessage(userId, "You can type \"Cancel\" at any point in time to exit the conversation or Type \"New\" to start new conversation.");
                });
        } else {
            console.error("Unable to send message1.");
        }
    });
}

function startConversation(userId, messageText) {
    var deferred = Q.defer();
    var messageData = {
        recipient: {
            id: userId
        },
        message: {
            attachment: {
                type: "template",
                payload: {
                    template_type: "generic",
                    elements: [{
                        title: messageText,
                        buttons: [{
                                type: "postback",
                                title: "Next Due Date",
                                payload: "0-NP-null",
                            },
                            {
                                type: "postback",
                                title: "Policy Status",
                                payload: "0-PS-null"
                            },
                            {
                                type: "postback",
                                title: "Fund Value",
                                payload: "0-FV-null",
                            }
                        ],
                    }]
                }
            }
        }
    };
    callSendAPI(messageData).then(function() {
        deferred.resolve(messageData);
    });
    return deferred.promise;
}


function nextOption(userId, messageText) {
    var deferred = Q.defer();

    var messageData = {
        recipient: {
            id: userId
        },
        message: {
            attachment: {
                type: "template",
                payload: {
                    template_type: "button",
                    text: messageText,
                    buttons: [{
                            type: "postback",
                            title: "Pay Premium",
                            payload: "0-PP-null",
                        },
                        {
                            type: "postback",
                            title: "Total Amt. Paid",
                            payload: "0-TAP-null"
                        }
                    ]
                }
            }
        }
    };
    callSendAPI(messageData).then(function() {
        deferred.resolve(messageData);
    });
    return deferred.promise;

}


//questions
function nextQuestion(questionIndex, payload, recipientId, timeOfMessage) {
    var indexArray = questionIndex.split("-");
    var qIndex = '';
    if (indexArray[0] == '4a') {
        qIndex = '4a';
    } else if (indexArray[0] == '4b') {
        qIndex = '4b';
    } else if (indexArray[0] == '4c') {
        qIndex = '4c';
    } else {
        qIndex = parseInt(indexArray[0]) + 1;
    }


    console.log('qIndex', qIndex);
    if (qIndex == 2) {
        var messageData = {
            recipient: {
                id: recipientId
            },
            message: {
                text: "Please provide your 8 digit policy number or 10 digit Mobile number."
            }
        }
        var newQuestionIndex = "2-" + indexArray[1] + "-" + indexArray[2];
        fbService.updateQuestionIndex(recipientId, newQuestionIndex);

        callSendAPI(messageData);
    } else if (qIndex == 3) {
        if (util.validatePolicyNumber(payload)) {
            var newQuestionIndex = "3-" + indexArray[1] + "-DOB";
            fbService.updateQuestionIndex(recipientId, newQuestionIndex);
            fbService.saveResponse(recipientId, newQuestionIndex, payload);
            var messageData = {
                recipient: {
                    id: recipientId
                },
                message: {
                    text: "Please provide Date of Birth in DD-MM-YYYY format"
                }
            }

            callSendAPI(messageData);
        } else {
            var messageData = {
                recipient: {
                    id: recipientId
                },
                message: {
                    text: "Please provide a valid policy number or mobile number."
                }
            }
            callSendAPI(messageData);
        }
    } else if (qIndex == 4) {

        if (util.validateDOB(payload)) {
            var newQuestionIndex = "4-" + indexArray[1] + "-OTP";
            var messageData = {
                recipient: {
                    id: recipientId
                },
                message: {
                    text: "Please enter OTP received on your registered mobile number to validate . If you don't receive an OTP in next 1 minute please enter RESEND"
                }
            }
            fbService.saveResponse(recipientId, newQuestionIndex, payload).then(function(data) {
                fbService.getPolicyData(recipientId, indexArray[1]).then(function(resp) {
                    validatePol.validatePolicy(resp).then(function(res) {
                        if (res) {
                            if (res.result.recordset.length > 1) {
                                console.log("more than one policy");
                                var msg = "Please select any one of your following policies:";
                                policyButtons = [];
                                for (var i in res.result.recordset) {
                                    var pol = {};
                                    pol.type = "postback";
                                    pol.title = res.result.recordset[i]["Policy Number"];
                                    pol.payload = "Multi-" + res.result.recordset[i]["Policy Number"];
                                    policyButtons.push(pol);
                                }
                                for (var i in res.result.recordset) {
                                    validPolicy.push(res.result.recordset[i]["Policy Number"]);
                                }
                                policyDetailNum = res.result.recordset[0]["Mobile number"]
                                var newQIndex = "4a-" + indexArray[1] + "-OTP";
                                fbService.updateQuestionIndex(recipientId, newQIndex);
                                //nextQuestion(newQIndex,"verified",recipientId);
                                dynamicPolicyButton(recipientId, policyButtons);

                            } else {
                                console.log("length not verified");
                                var policyData = res.result.recordset[0];
                                policyIDTemp = policyData["Policy Number"];
                                policyDetailNum = policyData["Mobile number"];
                                fbService.savaPolicyNo(recipientId, policyIDTemp);
                                fbService.getVerification(recipientId, policyIDTemp).then(function(exist) {
                                    if (exist) {
                                        var newQIndex = "4-" + indexArray[1] + "-OTP";
                                        nextQuestion(newQIndex, "verified", recipientId);
                                        fbService.updateQuestionIndex(recipientId, newQuestionIndex);

                                    } else {
                                        generateOtp(recipientId, policyDetailNum, timeOfMessage).then(function(res) {
                                            callSendAPI(messageData);
                                            fbService.saveVerification(recipientId, policyIDTemp);
                                            fbService.updateQuestionIndex(recipientId, newQuestionIndex);
                                        }, function(err) {
                                            sendTextMessage(recipientId, JSON.stringify(err));
                                        });
                                    }
                                });
                            }

                        } else {

                            var newQuestionIndex = "2-" + indexArray[1] + "-policyID";
                            fbService.updateQuestionIndex(recipientId, newQuestionIndex);
                            console.log("npnp");
                            return sendTextMessage(recipientId, 'We are not able to validate your information in our records, please check the information provided and try again')
                                .then(function() {
                                    return sendTextMessage(recipientId, 'Please provide your 8 digit policy number or 10 digit Mobile number.');
                                });
                            //sendTextMessage(recipientId,'We are not able to validate your information in our records, please check the information provided and try again');

                        }
                    }, function(err) {
                        sendTextMessage(recipientId, JSON.stringify(err));
                        sendTextMessage(recipientId, 'We are not able to validate your information in our records, please check the information provided and try again');
                        var newQuestionIndex = "2-" + indexArray[1] + "-policyID";
                        fbService.updateQuestionIndex(recipientId, newQuestionIndex);
                    });
                });
            });

        } else {
            var messageData = {
                recipient: {
                    id: recipientId
                },
                message: {
                    text: "Please provide valid DOB in DD-MM-YYYY format"
                }
            }
            callSendAPI(messageData);
        }

    } else if (qIndex == '4a') {
        console.log("policyId temp", policyIDTemp);
        console.log(validPolicy);
        policyIDTemp = '';
        console.log("policyId temp", policyIDTemp);
        for (var i in validPolicy) {
            if (payload == validPolicy[i]) {
                policyIDTemp = payload;
            }
        }
        // var policyButton = [];

        // for (var i in validPolicy) {
        //     var pol = {};
        //     pol.type = "postback";
        //     pol.title = validPolicy[i];
        //     pol.payload = "Multi-" + validPolicy[i];
        //     policyButton.push(pol);
        // }
        console.log("policyButton",policyButtons);
        if (policyIDTemp) {
            var newQIndex = "4-" + indexArray[1] + "-OTP";
            fbService.savaPolicyNo(recipientId, policyIDTemp);
            fbService.getVerification(recipientId, policyIDTemp).then(function(exist) {
                if (exist) {
                    fbService.updateQuestionIndex(recipientId, newQIndex);
                    console.log("newQIndex", newQIndex);
                    nextQuestion(newQIndex, "verified", recipientId);
                } else {
                    generateOtp(recipientId, policyDetailNum, timeOfMessage).then(function(res) {
                        sendTextMessage(recipientId, "Please enter OTP received on your registered mobile number to validate . If you don't receive an OTP in next 1 minute please enter RESEND");
                        fbService.saveVerification(recipientId, policyIDTemp);
                        fbService.updateQuestionIndex(recipientId, newQIndex);
                    }, function(err) {
                        sendTextMessage(recipientId, JSON.stringify(err));
                    });
                }
            });

        } else {

            var newQuestionIndex = "4a-" + indexArray[1] + "-policyID";
            fbService.updateQuestionIndex(recipientId, newQuestionIndex);
            console.log("npnp");
            console.log("policy button ->", policyButtons);
            dynamicPolicyButton(recipientId, policyButtons);
            // return sendTextMessage(recipientId, 'We are not able to validate your information in our records, please check the information provided and try again')
            //     .then(function() {
            //         return sendTextMessage(recipientId, 'Please provide your 8 digit policy number or 10 digit Mobile number.');
            //     });
        }
    } else if (qIndex == '4b') {
        var newQIndex = "4c-" + indexArray[1] + "-VOTP"
        console.log("newQ", newQIndex);
        sendTextMessage(recipientId, 'Do you want the details for same policy number(Yes/No)');
        fbService.updateQuestionIndex(recipientId, newQIndex);

    } else if (qIndex == '4c') {
        if (payload == 'yes' || payload == 'y') {
            var newQIndex = '5-' + indexArray[1] + 'VOTP';
            fbService.updateQuestionIndex(recipientId, newQIndex);
            console.log('policyIDTemp', policyIDTemp);
            fbService.getpolicyNo(recipientId).then(function(result) {
                if (result) {
                    console.log("result->", result.policyNo);
                    validatePol.getPolicyInformation(result.policyNo).then(function(res) { //sendTextMessage(recipientId,JSON.stringify(res));
                        //console.log('final r', JSON.stringify(res));
                        var policyInfoObj = res;
                        console.log('policyInfoObj-4c', policyInfoObj);
                        console.log('indexArray[1] -4c', indexArray[1]);
                        if (indexArray[1] == 'NP') {
                            nextDueData(recipientId, indexArray[1], policyInfoObj);
                        } else if (indexArray[1] == 'PS') {
                            policyStatusData(recipientId, indexArray[1], policyInfoObj);
                        } else if (indexArray[1] == 'FV') {
                            fundValueData(recipientId, indexArray[1], policyInfoObj);
                        } else if (indexArray[1] == 'PP') {
                            payPremium(recipientId, indexArray[1], policyInfoObj);
                        } else if (indexArray[1] == 'TAP') {
                            totalAmtPaidData(recipientId, indexArray[1], policyInfoObj);
                        }
                    }, function(err) {
                        console.log(err);

                    });
                } else {
                    console.log("no data found");
                }

            });

        } else if (payload == 'no' || payload == 'n') {
            var newQIndex = '1-' + indexArray[1] + '-policyId';
            console.log("4c-no")
            fbService.updateQuestionIndex(recipientId, newQIndex);
            nextQuestion(newQIndex, "newPolicy", recipientId, timeOfMessage);
        } else {
            var newQuestionIndex = "4c-" + indexArray[1] + "-VOTP";
            fbService.updateQuestionIndex(recipientId, newQuestionIndex);
            var messageData = {
                recipient: {
                    id: recipientId
                },
                message: {
                    text: "Please reply (yes/no)"
                }
            }
            callSendAPI(messageData);
        }
    } else if (qIndex == 5) {
        console.log('payload is', payload);
        if (payload == "verified") {
            var newQuestionIndex = "5-" + indexArray[1] + "-VOTP";
            fbService.updateQuestionIndex(recipientId, newQuestionIndex);
            console.log('policyIDTemp', policyIDTemp);
            validatePol.getPolicyInformation(policyIDTemp).then(function(res) {
                //sendTextMessage(recipientId,JSON.stringify(res));
                //console.log('final r', JSON.stringify(res));
                var policyInfoObj = res;
                console.log('policyInfoObj', policyInfoObj);
                console.log('indexArray[1]', indexArray[1]);
                if (indexArray[1] == 'NP') {
                    nextDueData(recipientId, indexArray[1], policyInfoObj);
                } else if (indexArray[1] == 'PS') {
                    policyStatusData(recipientId, indexArray[1], policyInfoObj);
                } else if (indexArray[1] == 'FV') {
                    fundValueData(recipientId, indexArray[1], policyInfoObj);
                } else if (indexArray[1] == 'PP') {
                    payPremium(recipientId, indexArray[1], policyInfoObj);
                } else if (indexArray[1] == 'TAP') {
                    totalAmtPaidData(recipientId, indexArray[1], policyInfoObj);
                }
            }, function(err) {
                console.log(err);

            });

        } else if (payload == "not verified") {
            var messageData = {
                recipient: {
                    id: recipientId
                },
                message: {
                    text: "We are not able to verify your OTP in our records. Please provide OTP sent to your registered mobile number"
                }
            }
            callSendAPI(messageData);
        } else if (payload == "time out") {
            var messageData = {
                recipient: {
                    id: recipientId
                },
                message: {
                    text: "Timed out .\nPlease provide your policy number or mobile number again"
                }
            }
            var newQuestionIndex = "2-" + indexArray[1] + "-policyID";
            fbService.updateQuestionIndex(recipientId, newQuestionIndex);
            callSendAPI(messageData);
        }
    } else if (qIndex == 6) {
        var newQuestionIndex = "6-" + indexArray[1] + "-RES";
        fbService.updateQuestionIndex(recipientId, newQuestionIndex);
        var messageData = {
            recipient: {
                id: recipientId
            },
            message: {
                text: "Can I help you with any other service request? (Yes/No)"
            }
        }
        callSendAPI(messageData);
    } else if (qIndex == 7) {
        if (payload == 'yes' || payload == 'y') {
            startConversation(recipientId, utilMsg.messages.buttonMessage).then(function(resp) {
                nextOption(recipientId, "...");
            });
            fbService.updateQuestionIndex(recipientId, "4b-null-null");

        } else if (payload == 'no' || payload == 'n' || payload == 'cancel') {
            var newQuestionIndex = "7-" + indexArray[1] + "-COMP";
            fbService.updateQuestionIndex(recipientId, newQuestionIndex);
            var thanksText = utilMsg.messages.thankyouMessage;
            var queryText = utilMsg.messages.queryMessage;
            sendTextMessage(recipientId, thanksText).then(function(resp) {
                sendCancelMessage(recipientId, "Dear Customer, Your sessioin has been cancelled");

            });
        } else {
            var newQuestionIndex = "6-" + indexArray[1] + "-RES";
            fbService.updateQuestionIndex(recipientId, newQuestionIndex);
            var messageData = {
                recipient: {
                    id: recipientId
                },
                message: {
                    text: "Please reply (yes/no)"
                }
            }
            callSendAPI(messageData);
        }
    }
}

//next payment due date service
function nextDueData(recipientId, category, policyInfo) {
    var nextDueDate = util.convertDate(policyInfo["Premium Due Date"]);
    //var nextDueAmt = util.convertCurrency(policyInfo["Premium Due Amount"]);
    var nextDueAmt = policyInfo["Premium Due Amount"];

    var nextDueMsg = utilMsg.messages.nextDueMessage;
    var messageData = nextDueMsg.replace("#policyid#", policyIDTemp);
    var dueDateMsg = messageData.replace("#dueDate#", nextDueDate);
    var newMsg = dueDateMsg.replace("#dueAmount#", nextDueAmt);

    sendTextMessage(recipientId, newMsg).then(function(resp) {
        setTimeout(function() {
            console.log("timed out");
            var newQuestion = "5-" + category + "-DATA";
            nextQuestion(newQuestion, "next", recipientId, 1);
        }, 10000);

    });
}

//fund value service
function fundValueData(recipientId, category, policyInfo) {
    var fundVAlueMsg = utilMsg.messages.fundValueMessage;
    var messageData = fundVAlueMsg.replace("#policyid#", policyIDTemp);

    sendTextMessage(recipientId, messageData).then(function(resp) {
        setTimeout(function() {
            console.log("timed out");
            var newQuestion = "5-" + category + "-DATA";
            nextQuestion(newQuestion, "next", recipientId, 1);
        }, 10000);

    });
}

//total amount paid service
function totalAmtPaidData(recipientId, category, policyInfo) {
    //var totalAmtPaid = util.convertCurrency(policyInfo["Amount Deposited in Policy Till"]);
    var totalAmtPaid = policyInfo["Amount Deposited in Policy Till"];

    var tapMsg = utilMsg.messages.totalAmtMessage;
    var messageData = tapMsg.replace("#policyid#", policyIDTemp);
    var totalAmtMsg = messageData.replace("#totalAmt#", totalAmtPaid);

    sendTextMessage(recipientId, totalAmtMsg).then(function(resp) {
        setTimeout(function() {
            console.log("timed out");
            var newQuestion = "5-" + category + "-DATA";
            nextQuestion(newQuestion, "next", recipientId, 1);
        }, 10000);

    });
}

//policy status servicepolicyInfo
function policyStatusData(recipientId, category, policyInfo) {
    var polMsg = policyInfo["Policy status"];
    var msg = utilMsg.messages.policyStatusMessage;
    var messageData = msg.replace("#policyid#", policyIDTemp);
    var messageDataNew = messageData.replace("#policyStat#", polMsg);

    sendTextMessage(recipientId, messageDataNew).then(function(resp) {
        setTimeout(function() {
            console.log("timed out");
            var newQuestion = "5-" + category + "-DATA";
            nextQuestion(newQuestion, "next", recipientId, 1);
        }, 10000);

    });
}

//pay premium service
function payPremium(recipientId, category) {

    var messageData = utilMsg.messages.payPremiumMessage;

    sendPayPremiumMessage(recipientId, messageData).then(function(resp) {
        setTimeout(function() {
            console.log("timed out");
            var newQuestion = "5-" + category + "-DATA";
            nextQuestion(newQuestion, "next", recipientId, 1);
        }, 10000);

    });
}

function generateOtp(recipientId, mobileNo, timeOfMessage) {
    var data = {
        recipientId: recipientId,
        mobileNo: mobileNo,
        timeOfMessage: timeOfMessage
    }
    //sendTextMessage(recipientId,JSON.stringify(data));
    var deferred = Q.defer();
    try {
        var min = 100000;
        var max = 999999;
        var otp = Math.floor(Math.random() * (max - min + 1)) + min;
        fbService.saveOtp(recipientId, otp, mobileNo, timeOfMessage);
        //sendTextMessage(recipientId,otp);
        deferred.resolve(otp);

    } catch (e) {
        sendTextMessage(recipientId, "Error");
        deferred.reject(e);

    }
    return deferred.promise;
}


//resend otp
function resendOTP(recipientId, timeOfMessage) {
    fbService.getOtp(recipientId, policyDetailNum).then(function(res) {
        fbService.saveOtp(recipientId, res.otp, res.mobileNo, timeOfMessage);
        sendTextMessage(recipientId, 'OTP has been Successfully resend to your registered number.');
    });
    // generateOtp(recipientId,policyDetail.policy.mobile,timeOfMessage).then(function(resp){
    //   sendTextMessage(recipientId,'OTP has been Successfully resend to your registered number.');
    // });
}

function verifyOTP(recipientId, payload, otpTime, questionIndex) {
    console.log(recipientId, payload, otpTime, questionIndex);
    fbService.getOtp(recipientId, policyDetailNum).then(function(resp) {
        console.log('otp module', JSON.stringify(resp));
        if (otpTime < resp.expireTime) {
            // var otpNum = parseInt(payload);
            // var hashOtp = sha1(otpNum);
            if (resp.otp === payload) {
                console.log("aaaa");
                nextQuestion(questionIndex, "verified", recipientId);
            } else {
                console.log("aabbbbbbbbaa");
                nextQuestion(questionIndex, "not verified", recipientId);
            }
        } else {
            console.log("ccccc");
            nextQuestion(questionIndex, "time out", recipientId);
        }
    });

}


function dynamicPolicyButton(userId, policyButtons) {
    console.log("userid",userId);
    console.log("button -->",policyButtons);
    var messageDataPolicy = {
        recipient: {
            id: userId
        },
        message: {
            attachment: {
                type: "template",
                payload: {
                    template_type: "button",
                    text: "Please select any one of your policy:",
                    buttons: policyButtons
                }
            }
        }
    };

    callSendAPI(messageDataPolicy);
}

//cancel message
function sendCancelMessage(sender, messageText) {
    var messageData = {
        recipient: {
            id: sender
        },
        message: {
            attachment: {
                type: "template",
                payload: {
                    template_type: "generic",
                    elements: [{
                        title: messageText,
                        subtitle: "if you wish to continue please click below",
                        buttons: [{
                            type: "postback",
                            title: "START AGAIN",
                            payload: "get started"
                        }]
                    }]
                }
            }
        }
    };
    callSendAPI(messageData);
}



//send message
function sendTextMessage(sender, messageText) {
    var deferred = Q.defer();
    var messageData = {
        recipient: {
            id: sender
        },
        message: {
            text: messageText
        }
    };
    callSendAPI(messageData).then(function(res) {
        deferred.resolve();
    });
    return deferred.promise;
}


function callSendAPI(messageData) {
    var deferred = Q.defer();
    request({
        uri: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: conf.token },
        method: 'POST',
        json: messageData
    }, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            var recipientId = body.recipient_id;
            var messageId = body.message_id;
            deferred.resolve();
        } else {
            console.error("Unable to send message.");
            console.log("unable to send error-",error);
            console.log("response.status->",response.statusCode);
            deferred.resolve();
        }
    });
    return deferred.promise;
}

//send premium message
function sendPayPremiumMessage(sender, messageText) {
    var deferred = Q.defer();
    var messageData = {
        recipient: {
            id: sender
        },
        message: {
            attachment: {
                type: "template",
                payload: {
                    template_type: "button",
                    text: messageText,
                    buttons: [{
                        type: "web_url",
                        title: "Click to Pay",
                        url: "https://www.dhflpramerica.com/PolicyPaymentLogin#pnlView",
                    }]
                }
            }
        }
    };
    callSendAPI(messageData).then(function(res) {
        deferred.resolve();
    });
    return deferred.promise;
}



module.exports = {
    receivedMessage: receivedMessage,
    receivedPostback: receivedPostback
};