const { default: axios } = require('axios');
const cheerio = require('cheerio');
const schedule = require('node-schedule');
/* eslint-disable max-len */
const nodeHtmlToImage = require('node-html-to-image');
const fs = require('fs');
const express = require('express');

const rule = new schedule.RecurrenceRule();
rule.tz = 'Asia/Ho_Chi_Minh';
rule.minute = 47;
rule.hour = 15;

const app = express();

app.use(express.static('public'));

app.listen('8081', () => {
  console.log('Server is running on port 8080');
})

const DOMAIN = 'https://manufactured-visitor-bread-pavilion.trycloudflare.com';

const convertHtmlToImage = (html, css) => {
  return new Promise((resolve, reject) => {
    const image = `image-${new Date().getTime()}.png`;
    nodeHtmlToImage({
      output: `./public/${image}`,
      html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Document</title>
          <style>
            ${css}
          </style>
      </head>
        <body style="background-color: white;">
          ${html}
        </body>
      </html>
        `,
      puppeteerArgs: { args: ['--no-sandbox', '--disable-setuid-sandbox'] },
    })
      .then(() => {
        resolve({
          status: true,
          image,
        });
      })
      .catch((e) => {
        resolve({
          status: false,
          message: e.message,
        });
      });
  });
};

const deleteImage = (image) => {
  return new Promise((resolve, reject) => {
    fs.unlink(`./public/${image}`, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve({
          status: true,
        });
      }
    });
  });
};


const job = schedule.scheduleJob(rule, crawlXsmb);

async function crawlXsmb() {
    const response = await axios.get('https://xsmn.me/xsmb-sxmb-kqxsmb-xstd-xshn-ket-qua-xo-so-mien-bac.html');
    const $ = cheerio.load(response.data);
    const title = $('.title-bor.clearfix').first() + '';
  const table = $('.extendable.kqmb.colgiai').first() + '';
  const style = $('style').last() + '';
  const result = await convertHtmlToImage(title + table, style);
  if (result.status) {
    await sendMessage(`${DOMAIN}/${result.image}`);
    setTimeout(() => deleteImage(result.image), 5000);
  }
}

async function sendMessage(image) {
    await axios.post('https://chat.googleapis.com/v1/spaces/AAAAKosJBuc/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=LkZ550J53hR-vCzyGT62fEsV6hl4u2wL8sZ8tiKWRFw%3D', {
        "cards": [
            {
              "sections": [
                {
                  "widgets": [
                    {
                      "image": { 
                          "imageUrl": image }
                    },
                    {
                      "buttons": [
                        {
                          "textButton": {
                            "text": "Xem chi tiết",
                            "onClick": {
                              "openLink": {
                                "url": "https://xsmn.me/xsmb-sxmb-kqxsmb-xstd-xshn-ket-qua-xo-so-mien-bac.html"
                              }
                            }
                          }
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
    });
}

crawlXsmb()