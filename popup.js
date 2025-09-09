// Common currency codes and names
const CURRENCIES = {
    'usd': 'US Dollar',
    'eur': 'Euro',
    'gbp': 'British Pound',
    'jpy': 'Japanese Yen',
    'aud': 'Australian Dollar',
    'cad': 'Canadian Dollar',
    'chf': 'Swiss Franc',
    'cny': 'Chinese Yuan',
    'inr': 'Indian Rupee',
    'krw': 'South Korean Won',
    'mxn': 'Mexican Peso',
    'nzd': 'New Zealand Dollar',
    'sek': 'Swedish Krona',
    'nok': 'Norwegian Krone',
    'sgd': 'Singapore Dollar',
    'thb': 'Thai Baht',
    'try': 'Turkish Lira',
    'rub': 'Russian Ruble',
    'zar': 'South African Rand',
    'brl': 'Brazilian Real'
};

let exchangeRates = {};

// DOM elements for new UI
const usdInput = document.getElementById('usd');
const dkkInput = document.getElementById('dkk');
const inrInput = document.getElementById('inr');
const loadingDiv = document.getElementById('loading');
const errorDiv = document.getElementById('error');

// Initialize the popup
document.addEventListener('DOMContentLoaded', function() {
    loadExchangeRates();
    usdInput.addEventListener('input', () => handleInput('usd'));
    dkkInput.addEventListener('input', () => handleInput('dkk'));
    inrInput.addEventListener('input', () => handleInput('inr'));
});

// No need to populate selects for new UI

// Load exchange rates from the API
async function loadExchangeRates() {
    try {
        showLoading(true);
        hideError();
        
        // Try different API endpoints based on the GitHub repository structure
        const apiUrls = [
            'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json',
            'https://api.fawazahmed0.github.io/currency-api/v1/currencies/usd.json'
        ];
        
        let data = null;
        for (const url of apiUrls) {
            try {
                const response = await fetch(url);
                if (response.ok) {
                    data = await response.json();
                    break;
                }
            } catch (e) {
                console.warn('Fetch failed for', url, e);
            }
        }
        
        if (!data) {
            throw new Error('Failed to fetch exchange rates');
        }
        
        // Store the USD-based rates
        exchangeRates = data.usd || data;
        showLoading(false);
        convertCurrency();
        
    } catch (error) {
        console.error('Error loading exchange rates:', error);
        showLoading(false);
        showError();
        
        // Fallback to some basic rates if API fails
        exchangeRates = {
            'eur': 0.85,
            'gbp': 0.73,
            'jpy': 110.0,
            'aud': 1.35,
            'cad': 1.25,
            'chf': 0.92,
            'cny': 6.45,
            'inr': 74.5
        };
        convertCurrency();
    }
}

// Handle input for one of the three fields and update the others
function handleInput(changedField) {
    const dkkRate = exchangeRates['dkk'] || 7.0;
    const inrRate = exchangeRates['inr'] || 74.5;

    let usd = parseFloat(usdInput.value);
    let dkk = parseFloat(dkkInput.value);
    let inr = parseFloat(inrInput.value);

    // Prevent recursion by only updating other fields
    if (changedField === 'usd' && !isNaN(usd)) {
        dkkInput.value = (usd * dkkRate).toFixed(2);
        inrInput.value = (usd * inrRate).toFixed(2);
    } else if (changedField === 'dkk' && !isNaN(dkk)) {
        usdInput.value = (dkk / dkkRate).toFixed(2);
        inrInput.value = ((dkk / dkkRate) * inrRate).toFixed(2);
    } else if (changedField === 'inr' && !isNaN(inr)) {
        usdInput.value = (inr / inrRate).toFixed(2);
        dkkInput.value = ((inr / inrRate) * dkkRate).toFixed(2);
    }
}

// Show/hide loading indicator
function showLoading(show) {
    loadingDiv.style.display = show ? 'block' : 'none';
}

// Show/hide error message
function showError() {
    errorDiv.style.display = 'block';
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 3000);
}

function hideError() {
    errorDiv.style.display = 'none';
}