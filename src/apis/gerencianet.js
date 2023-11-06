const axios = require('axios');
const fs = require('fs');
const path = require('path');
const https = require('https');


const cert = fs.readFileSync(
    path.resolve(__dirname, `../../certs/${process.env.GN_CERT}`)
);

const agent = new https.Agent({
    pfx: cert,
    passphrase: ''  
});

const authenticate = ({clientID, clientSecret}) => {
    const credentials = Buffer.from(
        `${clientID}:${clientSecret}`
    ).toString('base64');

    return axios({
        method: 'POST',
        url: `${process.env.GN_ENDPOINT}/oauth/token`,
        headers: {
            Authorization: `Basic ${credentials}`,
            'Content-Type': 'application/json'
        },
        httpsAgent: agent,
        data: {
            grant_type: 'client_credentials'
        }
    });
}

const GNRequest = async (credentials) => {
    const authResponse = await authenticate(credentials);
    const accessToken = authResponse.data?.access_token;

    return axios.create({
        baseURL: process.env.GN_ENDPOINT,
        httpsAgent: agent,
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        }
    });
} 

const authenticateCard = ({clientID, clientSecret}) => {
    const credentials = Buffer.from(
        `${clientID}:${clientSecret}`
    ).toString('base64');

    return axios({
        method: 'POST',
        url: `https://cobrancas-h.api.efipay.com.br/v1/authorize`,
        headers: {
            Authorization: `Basic ${credentials}`,
            'Content-Type': 'application/json'
        },
        httpsAgent: agent,
        data: {
            grant_type: 'client_credentials'
        }
    });
}

const GNRequestCard = async (credentials) => {
    const authResponse = await authenticateCard(credentials);
    const accessToken = authResponse.data?.access_token;

    return axios.create({
        baseURL: 'https://cobrancas-h.api.efipay.com.br',
        httpsAgent: agent,
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        }
    });
} 

module.exports = { GNRequest, GNRequestCard };