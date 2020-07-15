const axios = require('axios');
const cheerio = require('cheerio');
const messages = {
  welcome: 'Welcome to the Colchester Waste Collection Skill.',
  greenweek:
    "It's a green week this week. Prepare your plastic, paper, clothing, garden waste and food waste for collection.",
  blueweek:
    "It's a blue week this week. Prepare up to 3 black bags, food waste and empty bottles and cans for collection.",
  nextblue:
    'Your collection day has already passed but next week is a blue week.',
  nextgreen:
    'Your collection day has already passed but next week is a green week.',
  error: 'Well...this is rubbish, something went wrong. Please try again',
  collectionday: 'Your usual collection day is ',
  API_FAILURE:
    'There was an error with the Alexa Customer Profile API. Please try again.',
  goodbye: 'Bye! Thanks for using the Sample Alexa Customer Profile API Skill!',
  unhandled: "This skill doesn't support that. Please ask something else.",
  help: 'You can use this skill by asking something like: whats my name?',
  stop: 'Bye! Thanks for using the Sample Alexa Customer Profile API Skill!',
  permissions:
    'For this skill to work you need to allow it to use your postcode from the Alexa app',
  postcode:
    'Please check your Alexa device has a Colchester based postcode set up',
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

const testfunc = async () => {
  let speakOutput;
  let postcodeFormatted = 'CO2 7EW';
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
  console.log(week.html());

  //Check if our bin day has passed
  const todayNum = new Date().getDay();
  if (todayNum > binDayNum) {
    //bin day has passed
    if (week.html() === 'BLUE WEEK') {
      //Next week must be green
      speakOutput = `${messages.welcome} ${messages.nextgreen} ${
        messages.collectionday
      } ${getDayName(binDayNum)}`;
    } else {
      //Next week must be blue
      speakOutput = `${messages.welcome} ${messages.nextblue} ${
        messages.collectionday
      } ${getDayName(binDayNum)}`;
      console.log(speakOutput);
    }
  } else {
    //bin day hasn't passed
    if (week.html() === 'BLUE WEEK') {
      speakOutput = `${messages.welcome} ${messages.blueweek} ${
        messages.collectionday
      } ${getDayName(binDayNum)} `;
    } else if (week === 'GREEN WEEK') {
      speakOutput = `${messages.welcome} ${messages.greenweek} ${
        messages.collectionday
      } ${getDayName(binDayNum)} `;
    }
  }
  //Finally we need to return our speak output to the user
  console.log(speakOutput);
};

testfunc();
