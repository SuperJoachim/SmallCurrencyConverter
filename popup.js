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

// DOM elements
const amountInput = document.getElementById('amount');
const fromCurrencySelect = document.getElementById('fromCurrency');
const toCurrencySelect = document.getElementById('toCurrency');
const resultDiv = document.getElementById('result');
const resultText = document.getElementById('resultText');
const loadingDiv = document.getElementById('loading');
const errorDiv = document.getElementById('error');

// Initialize the popup
document.addEventListener('DOMContentLoaded', function() {
    populateCurrencySelects();
    loadExchangeRates();
    
    // Add event listeners
    amountInput.addEventListener('input', convertCurrency);
    fromCurrencySelect.addEventListener('change', convertCurrency);
    toCurrencySelect.addEventListener('change', convertCurrency);
});

// Populate currency select options
function populateCurrencySelects() {
    Object.keys(CURRENCIES).forEach(code => {
        const option1 = new Option(`${code.toUpperCase()} - ${CURRENCIES[code]}`, code);
        const option2 = new Option(`${code.toUpperCase()} - ${CURRENCIES[code]}`, code);
        
        fromCurrencySelect.appendChild(option1);
        toCurrencySelect.appendChild(option2);
    });
    
    // Set default values
    fromCurrencySelect.value = 'usd';
    toCurrencySelect.value = 'eur';
}

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
                continue;
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

// Convert currency
function convertCurrency() {
    const amount = parseFloat(amountInput.value);
    const fromCurrency = fromCurrencySelect.value;
    const toCurrency = toCurrencySelect.value;
    
    if (!amount || amount <= 0 || !fromCurrency || !toCurrency) {
        resultText.textContent = 'Enter amount and select currencies';
        return;
    }
    
    if (fromCurrency === toCurrency) {
        resultText.textContent = `${amount.toFixed(2)} ${fromCurrency.toUpperCase()}`;
        return;
    }
    
    try {
        let convertedAmount = 0;
        
        if (fromCurrency === 'usd') {
            // Converting from USD to another currency
            convertedAmount = amount * (exchangeRates[toCurrency] || 1);
        } else if (toCurrency === 'usd') {
            // Converting to USD from another currency
            convertedAmount = amount / (exchangeRates[fromCurrency] || 1);
        } else {
            // Converting between two non-USD currencies
            const usdAmount = amount / (exchangeRates[fromCurrency] || 1);
            convertedAmount = usdAmount * (exchangeRates[toCurrency] || 1);
        }
        
        resultText.textContent = `${convertedAmount.toFixed(2)} ${toCurrency.toUpperCase()}`;
        
    } catch (error) {
        console.error('Error converting currency:', error);
        resultText.textContent = 'Error in conversion';
    }
}

// Show/hide loading indicator
function showLoading(show) {
    loadingDiv.style.display = show ? 'block' : 'none';
    resultDiv.style.display = show ? 'none' : 'block';
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