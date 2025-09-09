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

const fieldsContainer = document.getElementById('fieldsContainer');
const loadingDiv = document.getElementById('loading');
const errorDiv = document.getElementById('error');

// Read config from localStorage
function getCurrencyConfig() {
    const config = JSON.parse(localStorage.getItem('currencyConfig') || '{}');
    const numFields = config.numFields || 3;
    const fields = [];
    for (let i = 0; i < numFields; i++) {
        fields.push(config[`field${i+1}`] || (i === 0 ? 'usd' : i === 1 ? 'dkk' : i === 2 ? 'inr' : 'eur'));
    }
    return fields;
}

// Initialize the popup
let fieldInputs = [];

function renderFields() {
    const fieldCurrencies = getCurrencyConfig();
    fieldsContainer.innerHTML = '';
    fieldInputs = [];
    fieldCurrencies.forEach((currency, idx) => {
        const group = document.createElement('div');
        group.className = 'input-group';
        const label = document.createElement('label');
        label.textContent = `${currency.toUpperCase()} Currency:`;
        label.setAttribute('for', `field${idx}`);
        const input = document.createElement('input');
        input.type = 'number';
        input.id = `field${idx}`;
        input.placeholder = `Enter ${currency.toUpperCase()}`;
        input.min = '0';
        input.step = '0.01';
        input.addEventListener('input', () => handleInput(idx));
        group.appendChild(label);
        group.appendChild(input);
        fieldsContainer.appendChild(group);
        fieldInputs.push(input);
    });
}

// Helper to format INR in Lakh
function formatLakh(value) {
    if (value >= 100000) {
        return (value / 100000).toFixed(2) + ' Lakh';
    }
    return '';
}

// Show Lakh value below INR field if applicable
function updateLakhDisplay() {
    const fieldCurrencies = getCurrencyConfig();
    const inrIdx = fieldCurrencies.findIndex(c => c === 'inr');
    let lakhDiv = document.getElementById('lakhValue');
    if (!lakhDiv) {
        lakhDiv = document.createElement('div');
        lakhDiv.id = 'lakhValue';
        lakhDiv.style = 'color:#007bff; font-size:13px; margin-top:4px;';
        if (inrIdx !== -1 && fieldInputs[inrIdx]) {
            fieldInputs[inrIdx].parentNode.appendChild(lakhDiv);
        }
    }
    if (inrIdx !== -1 && fieldInputs[inrIdx]) {
        const val = parseFloat(fieldInputs[inrIdx].value);
        lakhDiv.textContent = formatLakh(val);
        lakhDiv.style.display = lakhDiv.textContent ? '' : 'none';
    } else {
        lakhDiv.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    renderFields();
    loadExchangeRates();
    updateLakhDisplay();
});

// Listen for config changes in other tabs/windows
window.addEventListener('storage', function(e) {
    if (e.key === 'currencyConfig') {
        renderFields();
        handleInput(0); // Recalculate with new config
        updateLakhDisplay();
    }
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
            'inr': 74.5,
            'dkk': 7.0
        };
        convertCurrency();
    }
}

// Handle input for any field and update the others
function handleInput(changedIdx) {
    const fieldCurrencies = getCurrencyConfig();
    const values = fieldInputs.map(input => parseFloat(input.value));
    if (isNaN(values[changedIdx])) return;
    // Convert input value to USD
    const changedCurrency = fieldCurrencies[changedIdx];
    const changedRate = exchangeRates[changedCurrency] || 1;
    let usdValue = changedCurrency === 'usd' ? values[changedIdx] : values[changedIdx] / changedRate;
    // Update other fields
    fieldInputs.forEach((input, idx) => {
        if (idx === changedIdx) return;
        const rate = exchangeRates[fieldCurrencies[idx]] || 1;
        input.value = (usdValue * rate).toFixed(2);
    });
    updateLakhDisplay();
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