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
    'dkk': 'Danish Krone',
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

function populateSelect(select, defaultValue) {
    Object.keys(CURRENCIES).forEach(code => {
        const option = document.createElement('option');
        option.value = code;
        option.textContent = `${code.toUpperCase()} - ${CURRENCIES[code]}`;
        select.appendChild(option);
    });
    select.value = defaultValue;
}

document.addEventListener('DOMContentLoaded', function() {
    const numFieldsSelect = document.getElementById('numFields');
    const saveStatus = document.getElementById('saveStatus');
    const fieldGroups = [
        document.getElementById('fieldGroup1'),
        document.getElementById('fieldGroup2'),
        document.getElementById('fieldGroup3'),
        document.getElementById('fieldGroup4'),
        document.getElementById('fieldGroup5')
    ];
    const currencySelects = [
        document.getElementById('currency1'),
        document.getElementById('currency2'),
        document.getElementById('currency3'),
        document.getElementById('currency4'),
        document.getElementById('currency5')
    ];

    // Load saved config or use defaults
    const config = JSON.parse(localStorage.getItem('currencyConfig') || '{}');
    const numFields = config.numFields || 3;
    numFieldsSelect.value = numFields;
    for (let i = 0; i < 5; i++) {
        populateSelect(currencySelects[i], config[`field${i+1}`] || (i === 0 ? 'usd' : i === 1 ? 'dkk' : i === 2 ? 'inr' : 'eur'));
        fieldGroups[i].style.display = i < numFields ? '' : 'none';
    }

    numFieldsSelect.addEventListener('change', function() {
        const n = parseInt(numFieldsSelect.value);
        for (let i = 0; i < 5; i++) {
            fieldGroups[i].style.display = i < n ? '' : 'none';
        }
    });

    document.getElementById('configForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const n = parseInt(numFieldsSelect.value);
        const configToSave = { numFields: n };
        for (let i = 0; i < n; i++) {
            configToSave[`field${i+1}`] = currencySelects[i].value;
        }
        localStorage.setItem('currencyConfig', JSON.stringify(configToSave));
        saveStatus.style.display = 'block';
        setTimeout(() => saveStatus.style.display = 'none', 1500);
    });
});
