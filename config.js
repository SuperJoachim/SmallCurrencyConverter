function populateSelect(select) {
    select.innerHTML = '';

    Object.entries(CURRENCIES).forEach(([code, name]) => {
        const option = document.createElement('option');
        option.value = code;
        option.textContent = `${code.toUpperCase()} - ${name}`;
        select.appendChild(option);
    });
}

function updateVisibleFieldGroups(fieldGroups, visibleCount) {
    fieldGroups.forEach((group, index) => {
        group.hidden = index >= visibleCount;
    });
}

let saveStatusTimeoutId = null;

function showSaveStatus(saveStatus, message, isError = false) {
    if (saveStatusTimeoutId) {
        window.clearTimeout(saveStatusTimeoutId);
    }

    saveStatus.textContent = message;
    saveStatus.classList.toggle('error-text', isError);
    saveStatus.hidden = false;

    saveStatusTimeoutId = window.setTimeout(() => {
        saveStatus.hidden = true;
        saveStatus.classList.remove('error-text');
        saveStatusTimeoutId = null;
    }, isError ? 2500 : 1500);
}

function hasDuplicateCurrencies(selectedCurrencies) {
    return new Set(selectedCurrencies).size !== selectedCurrencies.length;
}

async function initConfigPage() {
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

    currencySelects.forEach((select) => populateSelect(select));

    let storedConfig;
    try {
        storedConfig = await getStoredConfig();
    } catch (error) {
        console.warn('Unable to read saved configuration, using defaults:', error);
        storedConfig = normalizeConfig();
    }

    numFieldsSelect.value = String(storedConfig.numFields);

    currencySelects.forEach((select, index) => {
        select.value = storedConfig.fields[index] || getDefaultCurrencyForIndex(index);
    });
    updateVisibleFieldGroups(fieldGroups, storedConfig.numFields);

    numFieldsSelect.addEventListener('change', () => {
        const visibleCount = Number.parseInt(numFieldsSelect.value, 10);
        updateVisibleFieldGroups(fieldGroups, visibleCount);
    });

    document.getElementById('configForm').addEventListener('submit', async (event) => {
        event.preventDefault();

        const visibleCount = Number.parseInt(numFieldsSelect.value, 10);
        const selectedCurrencies = currencySelects
            .slice(0, visibleCount)
            .map((select) => select.value);

        if (hasDuplicateCurrencies(selectedCurrencies)) {
            showSaveStatus(saveStatus, 'Please choose different currencies for each field.', true);
            return;
        }

        try {
            await storageSet({
                [STORAGE_KEYS.CONFIG]: createConfigForStorage(selectedCurrencies)
            });

            showSaveStatus(saveStatus, 'Saved!');
        } catch (error) {
            console.error('Failed to save configuration:', error);
            showSaveStatus(saveStatus, 'Could not save configuration.', true);
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initConfigPage().catch((error) => {
        console.error('Failed to initialize config page:', error);
    });
});
