// const chromium = require('chrome-aws-lambda');
// const puppeteer = require('puppeteer-core');

const request = require('request');
const cheerio = require('cheerio');

//Our messages to return
const messages = [
  "It's a blue week this week. Prepare your pladtic, paper, clothing, garden waste and food waste for collection",
  "It's a green week this week. Prepare up to 3 black bags, food waste and empty bottles and cans for collection",
  'Well...this is rubbish, something went wrong. Please try again',
];

const url =
  'https://www.colchester.gov.uk/check-my-collection-day/?query=91c6d001-3c27-e711-80fa-5065f38b5681&name=9%20Fairfax%20Road';

request(url, (error, response, html) => {
  if (!error && response.statusCode == 200) {
    const $ = cheerio.load(html);

    const week = $('#cbc-blueweek-greenweek > div > h2');
    if (week.html() === 'BLUE WEEK') {
      console.log(messages[0]);
      return messages[0];
    } else if (week === 'GREEN WEEK') {
      console.log(messages[1]);

      return messages[1];
    }
  } else {
    console.log(messages[3]);

    return messages[3];
  }
});

//LEGACY PUPPETEER CODE
// module.exports = async function getBinDay(postcode) {
//   try {
//     const browser = puppeteer.launch({
//       args: chromium.args,
//       headless: chromium.headless,
//       ignoreHTTPSErrors: true,
//       defaultViewport: chromium.defaultViewport,
//     });
//     console.log('launched browser');
//     const page = await browser.newPage();
//     await page.setRequestInterception(true);
//     page.on('request', (req) => {
//       if (
//         req.resourceType() === 'image' ||
//         req.resourceType() == 'stylesheet' ||
//         req.resourceType() == 'font'
//       ) {
//         req.abort();
//       } else {
//         req.continue();
//       }
//     });
//     await page.goto('https://www.colchester.gov.uk/check-my-collection-day/');
//     await page.waitFor(300);
//     await page.type('.text-input', postcode);
//     await page.keyboard.press('Enter');
//     await page.waitFor(500);
//     await page.click('.select-input');
//     await page.waitFor(300);
//     await page.keyboard.press('ArrowDown');
//     await page.keyboard.press('Enter');
//     await page.keyboard.press('Tab');
//     await page.keyboard.press('Enter');
//     await page.waitForNavigation({ waitUntil: 'networkidle0' });
//     await page.waitFor(500);
//     const week = await page.evaluate(() => {
//       const items = page.querySelectorAll('#cbc-blueweek-greenweek > div > h2');
//       return items[0].innerText;
//     });
//     if (week === 'BLUE WEEK') {
//       return messages[0];
//     } else if (week === 'GREEN WEEK') {
//       return messages[1];
//     }
//   } catch (error) {
//     return 'Well...this is rubbish, something went wrong. Please try again';
//   }
// };
