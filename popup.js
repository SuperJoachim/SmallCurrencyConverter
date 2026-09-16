const RATE_CACHE_TTL_MS = 12 * 60 * 60 * 1000;
const API_URLS = [
    'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json',
    'https://api.fawazahmed0.github.io/currency-api/v1/currencies/usd.json'
];
const FALLBACK_RATES = {
    usd: 1,
    eur: 0.85,
    gbp: 0.73,
    jpy: 110,
    aud: 1.35,
    cad: 1.25,
    chf: 0.92,
    cny: 6.45,
    inr: 74.5,
    dkk: 7,
    krw: 1290
};

let currentConfig = normalizeConfig();
let exchangeRates = null;
let fieldInputs = [];
let formattedValueElements = [];
let inputsEnabled = false;
let errorTimeoutId = null;

const fieldsContainer = document.getElementById('fieldsContainer');
const loadingDiv = document.getElementById('loading');
const errorDiv = document.getElementById('error');

function getFractionDigits(currencyCode) {
    return ['jpy', 'krw'].includes(currencyCode) ? 0 : 2;
}

function getRate(currencyCode) {
    if (currencyCode === 'usd') {
        return 1;
    }

    const rate = exchangeRates?.[currencyCode];
    if (typeof rate !== 'number' || !Number.isFinite(rate) || rate <= 0) {
        throw new Error(`Missing exchange rate for ${currencyCode.toUpperCase()}.`);
    }

    return rate;
}

function formatInputValue(value, currencyCode) {
    return value.toFixed(getFractionDigits(currencyCode));
}

function formatCurrencyPreview(value, currencyCode) {
    try {
        return new Intl.NumberFormat(undefined, {
            style: 'currency',
            currency: currencyCode.toUpperCase(),
            minimumFractionDigits: getFractionDigits(currencyCode),
            maximumFractionDigits: getFractionDigits(currencyCode)
        }).format(value);
    } catch (error) {
        return `${currencyCode.toUpperCase()} ${formatInputValue(value, currencyCode)}`;
    }
}

function setInputsEnabled(enabled) {
    inputsEnabled = enabled;
    fieldInputs.forEach((input) => {
        input.disabled = !enabled;
    });
}

function showLoading(show, message = 'Loading exchange rates...') {
    loadingDiv.textContent = message;
    loadingDiv.hidden = !show;
}

function hideError() {
    if (errorTimeoutId) {
        clearTimeout(errorTimeoutId);
        errorTimeoutId = null;
    }
    errorDiv.hidden = true;
    errorDiv.textContent = '';
}

function showError(message, durationMs = 5000) {
    hideError();
    errorDiv.textContent = message;
    errorDiv.hidden = false;

    if (durationMs > 0) {
        errorTimeoutId = setTimeout(() => {
            errorDiv.hidden = true;
            errorDiv.textContent = '';
            errorTimeoutId = null;
        }, durationMs);
    }
}

function renderFields(valueByCurrency = {}) {
    fieldsContainer.innerHTML = '';
    fieldInputs = [];
    formattedValueElements = [];

    currentConfig.fields.forEach((currencyCode, index) => {
        const group = document.createElement('div');
        group.className = 'input-group';

        const label = document.createElement('label');
        label.setAttribute('for', `field${index}`);
        label.textContent = `${currencyCode.toUpperCase()} Amount`;

        const input = document.createElement('input');
        input.type = 'number';
        input.id = `field${index}`;
        input.placeholder = `Enter ${currencyCode.toUpperCase()} amount`;
        input.inputMode = 'decimal';
        input.step = 'any';
        input.disabled = !inputsEnabled;
        input.addEventListener('input', () => handleInput(index));

        if (Object.prototype.hasOwnProperty.call(valueByCurrency, currencyCode)) {
            input.value = valueByCurrency[currencyCode];
        }

        const formattedValue = document.createElement('div');
        formattedValue.className = 'formatted-value';

        group.appendChild(label);
        group.appendChild(input);
        group.appendChild(formattedValue);

        if (currencyCode === 'inr') {
            const lakhValue = document.createElement('div');
            lakhValue.id = 'lakhValue';
            lakhValue.className = 'lakh-value';
            lakhValue.hidden = true;
            group.appendChild(lakhValue);
        }

        fieldsContainer.appendChild(group);
        fieldInputs.push(input);
        formattedValueElements.push(formattedValue);
    });

    updateAllFormattedValues();
    updateLakhDisplay();
}

function captureValuesByCurrency() {
    return currentConfig.fields.reduce((values, currencyCode, index) => {
        const input = fieldInputs[index];
        if (input && input.value !== '') {
            values[currencyCode] = input.value;
        }
        return values;
    }, {});
}

function clearDerivedValues(preservedIndex) {
    fieldInputs.forEach((input, index) => {
        if (index !== preservedIndex) {
            input.value = '';
        }
    });
}

function getFirstFilledInputIndex() {
    return fieldInputs.findIndex((input) => input.value !== '');
}

function updateFieldFormattedValue(index) {
    const input = fieldInputs[index];
    const formattedValue = formattedValueElements[index];
    const currencyCode = currentConfig.fields[index];
    const parsedValue = Number.parseFloat(input.value);

    if (Number.isNaN(parsedValue)) {
        formattedValue.textContent = '';
        return;
    }

    formattedValue.textContent = formatCurrencyPreview(parsedValue, currencyCode);
}

function updateAllFormattedValues() {
    fieldInputs.forEach((_, index) => updateFieldFormattedValue(index));
}

function formatLakh(value) {
    if (!Number.isFinite(value) || value < 100000) {
        return '';
    }

    return `${(value / 100000).toFixed(2)} Lakh`;
}

function updateLakhDisplay() {
    const inrIndex = currentConfig.fields.findIndex((currencyCode) => currencyCode === 'inr');
    const lakhDiv = document.getElementById('lakhValue');

    if (!lakhDiv || inrIndex === -1) {
        return;
    }

    const inrValue = Number.parseFloat(fieldInputs[inrIndex]?.value);
    const lakhText = formatLakh(inrValue);
    lakhDiv.textContent = lakhText;
    lakhDiv.hidden = !lakhText;
}

function convertFromField(changedIndex) {
    const sourceInput = fieldInputs[changedIndex];
    const sourceValue = Number.parseFloat(sourceInput.value);

    if (Number.isNaN(sourceValue)) {
        clearDerivedValues(changedIndex);
        updateAllFormattedValues();
        updateLakhDisplay();
        return;
    }

    const sourceCurrency = currentConfig.fields[changedIndex];
    const usdValue = sourceCurrency === 'usd' ? sourceValue : sourceValue / getRate(sourceCurrency);

    fieldInputs.forEach((input, index) => {
        if (index === changedIndex) {
            return;
        }

        const targetCurrency = currentConfig.fields[index];
        const convertedValue = targetCurrency === 'usd' ? usdValue : usdValue * getRate(targetCurrency);
        input.value = formatInputValue(convertedValue, targetCurrency);
    });

    updateAllFormattedValues();
    updateLakhDisplay();
}

function handleInput(changedIndex) {
    hideError();

    if (!exchangeRates) {
        return;
    }

    try {
        convertFromField(changedIndex);
    } catch (error) {
        console.error('Error converting currency:', error);
        showError(error.message || 'Unable to convert with the current exchange rates.');
    }
}

function isValidRateCache(cache) {
    return Boolean(
        cache &&
        typeof cache === 'object' &&
        typeof cache.timestamp === 'number' &&
        cache.rates &&
        typeof cache.rates === 'object'
    );
}

async function fetchExchangeRates() {
    for (const url of API_URLS) {
        try {
            const response = await fetch(url, { cache: 'no-store' });
            if (!response.ok) {
                continue;
            }

            const data = await response.json();
            const usdRates = data.usd || data;
            if (usdRates && typeof usdRates === 'object') {
                return { usd: 1, ...usdRates };
            }
        } catch (error) {
            console.warn('Fetch failed for', url, error);
        }
    }

    throw new Error('Failed to fetch exchange rates from all configured endpoints.');
}

function applyRates(rates) {
    exchangeRates = { usd: 1, ...rates };
    setInputsEnabled(true);

    const firstFilledInputIndex = getFirstFilledInputIndex();
    if (firstFilledInputIndex !== -1) {
        try {
            convertFromField(firstFilledInputIndex);
        } catch (error) {
            console.error('Error applying exchange rates:', error);
            showError(error.message || 'Unable to convert with the current exchange rates.');
        }
        return;
    }

    updateAllFormattedValues();
    updateLakhDisplay();
}

async function loadExchangeRates() {
    showLoading(true);
    hideError();

    let cachedRateEntry = null;

    try {
        const result = await storageGet(STORAGE_KEYS.EXCHANGE_RATE_CACHE);
        cachedRateEntry = result[STORAGE_KEYS.EXCHANGE_RATE_CACHE] || null;
    } catch (error) {
        console.warn('Unable to read cached exchange rates:', error);
    }

    const hasCachedRates = isValidRateCache(cachedRateEntry);
    const cacheIsFresh = hasCachedRates && (Date.now() - cachedRateEntry.timestamp) < RATE_CACHE_TTL_MS;

    if (cacheIsFresh) {
        applyRates(cachedRateEntry.rates);
        showLoading(false);
        return;
    }

    try {
        const liveRates = await fetchExchangeRates();
        applyRates(liveRates);

        try {
            await storageSet({
                [STORAGE_KEYS.EXCHANGE_RATE_CACHE]: {
                    base: 'usd',
                    timestamp: Date.now(),
                    rates: liveRates
                }
            });
        } catch (cacheError) {
            console.warn('Unable to cache exchange rates:', cacheError);
        }
    } catch (error) {
        console.error('Error loading exchange rates:', error);

        if (hasCachedRates) {
            applyRates(cachedRateEntry.rates);
            showError('Could not refresh live rates. Using cached rates.', 4000);
        } else {
            applyRates(FALLBACK_RATES);
            showError('Could not load live rates. Using built-in fallback rates.', 5000);
        }
    } finally {
        showLoading(false);
    }
}

async function handleConfigChange() {
    const savedValues = captureValuesByCurrency();
    currentConfig = await getStoredConfig();
    renderFields(savedValues);

    if (exchangeRates) {
        const firstFilledInputIndex = getFirstFilledInputIndex();
        if (firstFilledInputIndex !== -1) {
            handleInput(firstFilledInputIndex);
        }
    }
}

async function init() {
    try {
        currentConfig = await getStoredConfig();
    } catch (error) {
        console.warn('Unable to read saved configuration, using defaults:', error);
        currentConfig = normalizeConfig();
        showError('Could not read saved configuration. Using defaults.', 4000);
    }

    renderFields();
    setInputsEnabled(false);
    await loadExchangeRates();
}

document.addEventListener('DOMContentLoaded', init);
chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local' && changes[STORAGE_KEYS.CONFIG]) {
        handleConfigChange().catch((error) => {
            console.error('Error applying updated configuration:', error);
            showError('Could not refresh the configured currencies.');
        });
    }
});
