const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
app.use(express.json());
app.use(express.static('public'));

async function getSfmcAccessToken(clientId, clientSecret, authUrl) {
  const resp = await axios.post(authUrl, {
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret
  });
  return resp.data.access_token;
}

async function getSubscriberFromDE(accessToken, deName, lookupKey, lookupValue, restBaseUrl) {
  const url = `${restBaseUrl}/data/v1/customobjectdata/key/${encodeURIComponent(deName)}/rowset?$filter=${encodeURIComponent(lookupKey)} eq '${lookupValue}'`;
  const resp = await axios.get(url, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  return resp.data.items && resp.data.items.length > 0 ? resp.data.items[0].values : null;
}

app.post('/execute', async (req, res) => {
  try {
    const inArgs = req.body.inArguments[0];
    const contactKey = inArgs.ContactKey;

    const SFMC2_CLIENT_ID = 'SFMC2_CLIENT_ID';
    const SFMC2_CLIENT_SECRET = 'SFMC2_CLIENT_SECRET';
    const SFMC2_AUTH_URL = 'https://YOUR_SFMC2_SUBDOMAIN.auth.marketingcloudapis.com/v2/token';
    const SFMC2_REST_BASEURL = 'https://YOUR_SFMC2_SUBDOMAIN.rest.marketingcloudapis.com';
    const DE_NAME = 'YourDataExtensionName';
    const LOOKUP_KEY = 'SubscriberKey';

    const accessToken = await getSfmcAccessToken(SFMC2_CLIENT_ID, SFMC2_CLIENT_SECRET, SFMC2_AUTH_URL);
    const subscriber = await getSubscriberFromDE(accessToken, DE_NAME, LOOKUP_KEY, contactKey, SFMC2_REST_BASEURL);

    res.status(200).json({
      outArguments: [{ subscriberDetails: subscriber }],
      execute: true
    });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

app.listen(3000, () => console.log('Custom JB Activity app listening on port 3000'));
