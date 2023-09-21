const axios = require('axios');
const fs = require('fs');
const { DateTime } = require('luxon');

// Function to log in and retrieve the API header
async function getApiHeader() {
    const authUrl = 'https://app.merchninja.io:8443/user/authenticate';

    const authPayload = {
        'email': 'nefepay680@recutv.com',
        'password': 'sd4mV51UoP'
    };

    try {
        const response = await axios.post(authUrl, authPayload);
        if (response.status === 201) {
            const accessToken = response.data.token;
            const apiHeaders = {
                'authorization': `Bearer ${accessToken}`,
                // Add your other headers for API requests here
            };
            return apiHeaders;
        } else {
            throw new Error(`Failed to authenticate. Status code: ${response.status}`);
        }
    } catch (error) {
        throw new Error('Error during authentication: ' + error.message);
    }
}

// Custom formatting function for numbers
function formatNumber(number, columnName) {
    try {
        if (columnName === 'price') {
            return (number / 100).toFixed(2);
        } else if (columnName === 'reviewCount') {
            return (number / 10).toFixed(1);
        } else {
            return number.toLocaleString();
        }
    } catch (error) {
        return number;
    }
}

// Custom formatting function for dates
function formatDate(dateStr) {
    try {
        if (dateStr !== null) {
            const dateObj = DateTime.fromISO(dateStr);
            return dateObj.toFormat('LLL dd, yyyy');
        } else {
            return '';
        }
    } catch (error) {
        return dateStr;
    }
}

// Function to make API requests using the access token
async function makeApiRequest(apiHeaders) {
    // Define the API URL, headers, and request parameters as in your Python code
    const apiUrl = 'https://app.merchninja.io:8443/product/search';

    // Initialize arrays to store data
    const allData = [];
    const trendsData = [];

    const maxPages = 100; // Set the maximum number of pages to retrieve

    for (let page = 1; page <= maxPages; page++) {
        // Set the page number in the parameters
        const apiParams = {
            "page": page,
            "mp": "COM",
            "type": "SHIRT",
            "text": "",
            "mode": "PHRASE",
            "orderBy": "bsr",
            "orderDirection": "ASC",
            "deleted": false,
            "showOfficial": false,
            "startBsr": 1,
            "endBsr": 1000000
        };

        try {
            // Make a request to the API
            const response = await axios.post(apiUrl, apiParams, { headers: apiHeaders });
            const data = response.data;

            // Check if there's data in the response
            if (!data.items) {
                break;
            }

            // Extract and append data to the 'allData' list and 'trendsData' list
            for (const item of data.items) {
                const reviews = item.reviews;
                const extractedData = {
                    asin: item.asin,
                    dUrl: item.dUrl,
                    imageUrl: item.imageUrl,
                    title: item.title,
                    bullet1: item.bullet1,
                    bullet2: item.bullet2,
                    brand: item.brand,
                    firstDate: formatDate(item.firstDate),
                    updateDate: formatDate(item.updateDate),
                    bsr: formatNumber(item.bsr, 'bsr'),
                    price: formatNumber(item.price, 'price'),
                    sales: formatNumber(item.sales, 'sales'),
                    reviews: formatNumber(item.reviews, 'reviews'),
                    reviewCount: formatNumber(item.reviewCount, 'reviewCount'),
                    avg7bsr: formatNumber(item.avg7bsr, 'avg7bsr'),
                    avg30bsr: formatNumber(item.avg30bsr, 'avg30bsr')
                };
                allData.push(extractedData);

                // Check if reviews are between 1 and 5 for 'trendsData'
                if (reviews !== null && reviews >= 1 && reviews <= 5) {
                    trendsData.push(extractedData);
                }
            }

            // Print the current page number
            console.log(`Processed page ${page}`);

            // Add a delay (optional)
            // await delay(1000); // Add a 1-second delay between requests
        } catch (error) {
            console.error('Error during API request:', error.message);
            break;
        }
    }

    // Convert the list of data to JSON
    const allDataJson = JSON.stringify(allData);
    const trendsDataJson = JSON.stringify(trendsData);

    // Save the complete data and trends data to JSON files
    fs.writeFileSync('Merch.json', allDataJson);
    fs.writeFileSync('trends.json', trendsDataJson);

    console.log('Data saved to Merch.json and trends.json');
}

// Delay function (optional)
async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
    try {
        const apiHeaders = await getApiHeader();
        await makeApiRequest(apiHeaders);
    } catch (error) {
        console.error(error.message);
    }
})();
