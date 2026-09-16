# SmallCurrencyConverter

A Google Chrome extension for quickly converting between multiple currencies with live exchange rates.

## Features

- Multi-field popup with 2 to 5 configurable currencies
- Live exchange rates with cache-first loading for faster popup opens
- Fallback to cached or built-in rates if the API is temporarily unavailable
- Dedicated configuration page for choosing which currencies appear
- Localized formatted previews for converted values
- INR lakh helper for large Indian Rupee amounts

## Installation

1. Download or clone this repository.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** in the top right corner.
4. Click **Load unpacked** and select the extension folder.
5. The Currency Converter icon should appear in your toolbar.

## Usage

1. Click the Currency Converter icon in your Chrome toolbar.
2. Enter an amount in any visible field.
3. The other configured currencies update automatically.
4. Click the ⚙️ icon to open the configuration page.
5. Choose how many fields you want and which currencies they use.
6. Save the configuration and reopen the popup if needed.

## Supported Currencies

- USD (US Dollar)
- EUR (Euro)
- GBP (British Pound)
- JPY (Japanese Yen)
- AUD (Australian Dollar)
- CAD (Canadian Dollar)
- CHF (Swiss Franc)
- CNY (Chinese Yuan)
- DKK (Danish Krone)
- INR (Indian Rupee)
- KRW (South Korean Won)
- MXN (Mexican Peso)
- NZD (New Zealand Dollar)
- SEK (Swedish Krona)
- NOK (Norwegian Krone)
- SGD (Singapore Dollar)
- THB (Thai Baht)
- TRY (Turkish Lira)
- RUB (Russian Ruble)
- ZAR (South African Rand)
- BRL (Brazilian Real)

## Technical Notes

- Configuration is stored in `chrome.storage.local`.
- Exchange rates are cached for 12 hours.
- If live rates cannot be fetched, the extension falls back to cached or built-in rates instead of failing silently.
