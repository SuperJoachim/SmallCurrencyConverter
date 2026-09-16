const CURRENCIES = Object.freeze({
    usd: 'US Dollar',
    eur: 'Euro',
    gbp: 'British Pound',
    jpy: 'Japanese Yen',
    aud: 'Australian Dollar',
    cad: 'Canadian Dollar',
    chf: 'Swiss Franc',
    cny: 'Chinese Yuan',
    inr: 'Indian Rupee',
    dkk: 'Danish Krone',
    krw: 'South Korean Won',
    mxn: 'Mexican Peso',
    nzd: 'New Zealand Dollar',
    sek: 'Swedish Krona',
    nok: 'Norwegian Krone',
    sgd: 'Singapore Dollar',
    thb: 'Thai Baht',
    try: 'Turkish Lira',
    rub: 'Russian Ruble',
    zar: 'South African Rand',
    brl: 'Brazilian Real'
});

const DEFAULT_FIELDS = Object.freeze(['usd', 'dkk', 'inr']);
const MIN_FIELDS = 2;
const MAX_FIELDS = 5;
const STORAGE_KEYS = Object.freeze({
    CONFIG: 'currencyConfig',
    EXCHANGE_RATE_CACHE: 'exchangeRateCache'
});

function getDefaultCurrencyForIndex(index) {
    return DEFAULT_FIELDS[index] || 'eur';
}

function normalizeCurrencyCode(value) {
    const code = typeof value === 'string' ? value.toLowerCase() : '';
    return Object.prototype.hasOwnProperty.call(CURRENCIES, code) ? code : '';
}

function normalizeConfig(config = {}) {
    const requestedNumFields = Number.parseInt(config.numFields, 10);
    const numFields = Number.isInteger(requestedNumFields)
        ? Math.min(MAX_FIELDS, Math.max(MIN_FIELDS, requestedNumFields))
        : DEFAULT_FIELDS.length;

    const fields = [];
    for (let index = 0; index < numFields; index += 1) {
        const savedCurrency = normalizeCurrencyCode(config[`field${index + 1}`]);
        fields.push(savedCurrency || getDefaultCurrencyForIndex(index));
    }

    return { numFields, fields };
}

function createConfigForStorage(fields) {
    const sanitizedFields = fields
        .slice(0, MAX_FIELDS)
        .map((field, index) => normalizeCurrencyCode(field) || getDefaultCurrencyForIndex(index));

    const config = { numFields: sanitizedFields.length };
    sanitizedFields.forEach((field, index) => {
        config[`field${index + 1}`] = field;
    });

    return config;
}

function storageGet(keys) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(keys, (result) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
                return;
            }
            resolve(result);
        });
    });
}

function storageSet(items) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.set(items, () => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
                return;
            }
            resolve();
        });
    });
}

async function getStoredConfig() {
    const result = await storageGet(STORAGE_KEYS.CONFIG);
    return normalizeConfig(result[STORAGE_KEYS.CONFIG]);
}
