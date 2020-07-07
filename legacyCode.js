/* *
 * This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
 * Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
 * session persistence, api calls, and more.
 * */
const Alexa = require('ask-sdk-core');
// i18n library dependency, we use it below in a localisation interceptor
const i18n = require('i18next');
// i18n strings for all supported locales
const languageStrings = require('./languageStrings');

const cheerio = require('cheerio');
const axios = require('axios');

//HELPER FUNCTIONS AND MESSAGES
//Our messages to return
const messages = {
  blueweek:
    "It's a blue week this week. Prepare your plastic, paper, clothing, garden waste and food waste for collection.",
  greenweek:
    "It's a green week this week. Prepare up to 3 black bags, food waste and empty bottles and cans for collection.",
  nextblue:
    'Your collection day has already passed but next week is a blue week.',
  nextgreen:
    'Your collection day has already passed but next week is a green week.',
  error: 'Well...this is rubbish, something went wrong. Please try again',
  collectionday: 'Your collection day is on',
};

//global variables for days
let binDayNum;
const getDayNum = (day) => {
  switch (day) {
    case 'MON':
      return 1;
      break;
    case 'TUE':
      return 2;
      break;
    case 'WED':
      return 3;
      break;
    case 'THU':
      return 4;
      break;
    case 'FRI':
      return 5;
      break;
    case 'SAT':
      return 6;
      break;
    case 'SUN':
      return 7;
      break;
    default:
      return 6;
  }
};

const getDayName = (day) => {
  switch (day) {
    case 1:
      return 'Monday';
      break;
    case 2:
      return 'Tuesday';
      break;
    case 3:
      return 'Wednesday';
      break;
    case 4:
      return 'Thursday';
      break;
    case 5:
      return 'Friday';
      break;
    case 6:
      return 'Saturday';
      break;
    case 7:
      return 'Sunday';
      break;
    default:
      return 'Your bin day is unknown';
  }
};
//END OF HELPER FUNCTIONS

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest'
    );
  },
  async handle(handlerInput) {
    //NOTE THIS CODE IS THE SAME AS BELOW. IF YOU CHANGE ANYTHING REMEMBER TO COPY AND PASTE
    let speakOutput;
    //lets try and get device info
    try {
      const accessToken = this.event.context.System.apiAccessToken;
      const deviceId = this.event.context.System.deviceId;
      const apiEndpoint = this.event.context.System.apiEndpoint;

      const deviceAddressServiceClient = serviceClientFactory.getDeviceAddressServiceClient();
      const address = await deviceAddressServiceClient.getCountryAndPostalCode(
        deviceId
      );
      console.log('we got the address' + address.postalCode);
    } catch (error) {
      console.log('something went wrong');
    }

    //1 - Format our postcode
    let postcode = 'CO2 7EW';
    let postcodeFormatted;
    if (postcode.indexOf(' ') === -1) {
      const back = postcode.slice(postcode.length - 3, postcode.length);
      const front = postcode.slice(0, postcode.length - 3);
      postcodeFormatted = front + ' ' + back;
    } else {
      postcodeFormatted = postcode;
    }

    try {
      let areaData = await axios.get(
        `http://colchester.gov.uk/_odata/LLPG?$filter=(new_postcoide%20eq%20%27${postcodeFormatted}%27)`
      );
      const id = areaData.data.value[0].new_llpgid;
      const name = areaData.data.value[0].new_name;
      binDayNum = getDayNum(areaData.data.value[0].new_newcollectionday);
      const dataUrl = `https://www.colchester.gov.uk/check-my-collection-day/?query=${id}&name=${name}`;
      const { data } = await axios.get(dataUrl);
      const $ = cheerio.load(data);
      const week = $('#cbc-blueweek-greenweek > div > h2');

      //Check if our bin day has passed
      const todayNum = new Date().getDay();
      if (todayNum > binDayNum) {
        //bin day has passed
        if (week.html() === 'BLUE WEEK') {
          //Next week must be green
          speakOutput = `${messages.nextgreen} ${
            messages.collectionday
          } ${getDayName(binDayNum)}`;
        } else {
          //Next week must be blue
          speakOutput = `${messages.nextblue} ${
            messages.collectionday
          } ${getDayName(binDayNum)}`;
          console.log(speakOutput);
        }
      } else {
        //bin day hasn't passed
        if (week.html() === 'BLUE WEEK') {
          speakOutput = `${messages.blueweek} ${
            messages.collectionday
          } ${getDayName(binDayNum)} `;
        } else if (week === 'GREEN WEEK') {
          speakOutput = `${messages.greenweek} ${
            messages.collectionday
          } ${getDayName(binDayNum)} `;
        }
      }
    } catch (error) {
      speakOutput = messages.error;
    }
    //6 - Returning to A
    return handlerInput.responseBuilder.speak(speakOutput).getResponse();
  },
};

const GetBinDay_Handler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return (
      request.type === 'IntentRequest' && request.intent.name === 'GetBinDay'
    );
  },
  async handle(handlerInput) {
    let speakOutput;

    //First get the info from the request
    const deviceId =
      handlerInput.requestEnvelope.context.System.device.deviceId;
    console.log(deviceId);
    const apiendpoint = handlerInput.requestEnvelope.context.System.apiEndpoint;
    const accesstoken =
      handlerInput.requestEnvelope.context.System.apiAccessToken;

    const reqConfig = {
      method: 'get',
      url: `${apiEndpoint}/v1/devices/${deviceId}/settings/address/countryAndPostalCode
      `,
      headers: { Authorization: `Bearer ${accesstoken}` },
    };
    let deviceInfo = await axios(reqConfig);
    console.log(deviceInfo);
    //1 - Format our postcode
    let postcode = 'CO2 7EW';
    let postcodeFormatted;
    if (postcode.indexOf(' ') === -1) {
      const back = postcode.slice(postcode.length - 3, postcode.length);
      const front = postcode.slice(0, postcode.length - 3);
      postcodeFormatted = front + ' ' + back;
    } else {
      postcodeFormatted = postcode;
    }

    try {
      let areaData = await axios.get(
        `http://colchester.gov.uk/_odata/LLPG?$filter=(new_postcoide%20eq%20%27${postcodeFormatted}%27)`
      );
      const id = areaData.data.value[0].new_llpgid;
      const name = areaData.data.value[0].new_name;
      binDayNum = getDayNum(areaData.data.value[0].new_newcollectionday);
      const dataUrl = `https://www.colchester.gov.uk/check-my-collection-day/?query=${id}&name=${name}`;
      const { data } = await axios.get(dataUrl);
      const $ = cheerio.load(data);
      const week = $('#cbc-blueweek-greenweek > div > h2');

      //Check if our bin day has passed
      const todayNum = new Date().getDay();
      if (todayNum > binDayNum) {
        //bin day has passed
        if (week.html() === 'BLUE WEEK') {
          //Next week must be green
          speakOutput = `${messages.nextgreen} ${
            messages.collectionday
          } ${getDayName(binDayNum)}`;
        } else {
          //Next week must be blue
          speakOutput = `${messages.nextblue} ${
            messages.collectionday
          } ${getDayName(binDayNum)}`;
          console.log(speakOutput);
        }
      } else {
        //bin day hasn't passed
        if (week.html() === 'BLUE WEEK') {
          speakOutput = `${messages.blueweek} ${
            messages.collectionday
          } ${getDayName(binDayNum)} `;
        } else if (week === 'GREEN WEEK') {
          speakOutput = `${messages.greenweek} ${
            messages.collectionday
          } ${getDayName(binDayNum)} `;
        }
      }
    } catch (error) {
      speakOutput = messages.error;
    }

    //6 - Returning to A
    return handlerInput.responseBuilder.speak(speakOutput).getResponse();
  },
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent'
    );
  },
  handle(handlerInput) {
    const speakOutput = handlerInput.t('HELP_MSG');

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  },
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      (Alexa.getIntentName(handlerInput.requestEnvelope) ===
        'AMAZON.CancelIntent' ||
        Alexa.getIntentName(handlerInput.requestEnvelope) ===
          'AMAZON.StopIntent')
    );
  },
  handle(handlerInput) {
    const speakOutput = handlerInput.t('GOODBYE_MSG');

    return handlerInput.responseBuilder.speak(speakOutput).getResponse();
  },
};
/* *
 * FallbackIntent triggers when a customer says something that doesn’t map to any intents in your skill
 * It must also be defined in the language model (if the locale supports it)
 * This handler can be safely added but will be ingnored in locales that do not support it yet
 * */
const FallbackIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) ===
        'AMAZON.FallbackIntent'
    );
  },
  handle(handlerInput) {
    const speakOutput = handlerInput.t('FALLBACK_MSG');

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  },
};
/* *
 * SessionEndedRequest notifies that a session was ended. This handler will be triggered when a currently open
 * session is closed for one of the following reasons: 1) The user says "exit" or "quit". 2) The user does not
 * respond or says something that does not match an intent defined in your voice model. 3) An error occurs
 * */
const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) ===
      'SessionEndedRequest'
    );
  },
  handle(handlerInput) {
    console.log(
      `~~~~ Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`
    );
    // Any cleanup logic goes here.
    return handlerInput.responseBuilder.getResponse(); // notice we send an empty response
  },
};
/* *
 * The intent reflector is used for interaction model testing and debugging.
 * It will simply repeat the intent the user said. You can create custom handlers for your intents
 * by defining them above, then also adding them to the request handler chain below
 * */
const IntentReflectorHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
    );
  },
  handle(handlerInput) {
    const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
    const speakOutput = handlerInput.t('REFLECTOR_MSG', {
      intentName: intentName,
    });

    return (
      handlerInput.responseBuilder
        .speak(speakOutput)
        //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
        .getResponse()
    );
  },
};
/**
 * Generic error handling to capture any syntax or routing errors. If you receive an error
 * stating the request handler chain is not found, you have not implemented a handler for
 * the intent being invoked or included it in the skill builder below
 * */
const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    const speakOutput = handlerInput.t('ERROR_MSG');
    console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  },
};

// This request interceptor will bind a translation function 't' to the handlerInput
const LocalisationRequestInterceptor = {
  process(handlerInput) {
    i18n
      .init({
        lng: Alexa.getLocale(handlerInput.requestEnvelope),
        resources: languageStrings,
      })
      .then((t) => {
        handlerInput.t = (...args) => t(...args);
      });
  },
};
/**
 * This handler acts as the entry point for your skill, routing all request and response
 * payloads to the handlers above. Make sure any new handlers or interceptors you've
 * defined are included below. The order matters - they're processed top to bottom
 * */
exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    LaunchRequestHandler,
    GetBinDay_Handler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    FallbackIntentHandler,
    SessionEndedRequestHandler,
    IntentReflectorHandler
  )
  .addErrorHandlers(ErrorHandler)
  .addRequestInterceptors(LocalisationRequestInterceptor)
  .withCustomUserAgent('sample/hello-world/v1.2')
  .lambda();
