export const GetCurrencies = (codes: string[]): (Currency | undefined)[] => {
    return codes.map(c => GetCurrency(c));
}

export const GetCurrency = (code: string): Currency | undefined => {
    return Currencies.find(c => c.code.toLowerCase() == code.toLowerCase());
}

export class Currency {
    objectId?: string;
    countries?: string[];
    code!: string;
    name!: string;
    symbol?: string;
    number?: string;
    digits?: number;
}

export const Currencies: Currency[] = [
    {
        "objectId": "c73OLFK7l9",
        "countries": [
            "Australia",
            "Christmas Island",
            "Cocos (Keeling) Islands (The)",
            "Heard Island And Mcdonald Islands",
            "Kiribati",
            "Nauru",
            "Norfolk Island",
            "Tuvalu"
        ],
        "code": "AUD",
        "name": "Australian Dollar",
        "symbol": "$",
        "number": "036",
        "digits": 2
    },
    {
        "objectId": "O1bOL2sdzt",
        "countries": [
            "Brazil"
        ],
        "code": "BRL",
        "name": "Brazilian Real",
        "symbol": "R$",
        "number": "986",
        "digits": 2
    },
    {
        "objectId": "g0zyxvGaNy",
        "countries": [
            "Bulgaria"
        ],
        "code": "BGN",
        "name": "Bulgarian Lev",
        "symbol": "лB",
        "number": "975",
        "digits": 2
    },
    {
        "objectId": "KWAIdDAvUN",
        "countries": [
            "Canada"
        ],
        "code": "CAD",
        "name": "Canadian Dollar",
        "symbol": "$",
        "number": "124",
        "digits": 2
    },
    {
        "objectId": "mPLHH6McWn",
        "countries": [
            "China"
        ],
        "code": "CNY",
        "name": "Chinese Yuan",
        "symbol": "¥",
        "number": "156",
        "digits": 2
    },
    {
        "objectId": "8cxN2JYCUv",
        "countries": [
            "Croatia"
        ],
        "code": "HRK",
        "name": "Croatian Kruna",
        "symbol": "kn",
        "number": "191",
        "digits": 2
    },
    {
        "objectId": "M51AYLvGnB",
        "countries": [
            "Czechia"
        ],
        "code": "CZK",
        "name": "Czech Koruna",
        "symbol": "Kč",
        "number": "203",
        "digits": 2
    },
    {
        "objectId": "12WF2DlLBo",
        "countries": [
            "Denmark",
            "Faroe Islands (The)",
            "Greenland"
        ],
        "code": "DKK",
        "name": "Danish Krone",
        "symbol": "kr",
        "number": "208",
        "digits": 2
    },
    {
        "objectId": "vMA1Yy9ZnH",
        "countries": [
            "Andorra",
            "Austria",
            "Belgium",
            "Cyprus",
            "Estonia",
            "European Union",
            "Finland",
            "France",
            "French Guiana",
            "French Southern Territories (The)",
            "Germany",
            "Greece",
            "Guadeloupe",
            "Holy See (The)",
            "Ireland",
            "Italy",
            "Latvia",
            "Lithuania",
            "Luxembourg",
            "Malta",
            "Martinique",
            "Mayotte",
            "Monaco",
            "Montenegro",
            "Netherlands (The)",
            "Portugal",
            "Réunion",
            "Saint Barthélemy",
            "Saint Martin (French Part)",
            "Saint Pierre And Miquelon",
            "San Marino",
            "Slovakia",
            "Slovenia",
            "Spain",
            "Åland Islands"
        ],
        "code": "EUR",
        "name": "Euro",
        "symbol": "€",
        "number": "978",
        "digits": 2
    },
    {
        "objectId": "sp5CtJveOd",
        "countries": [
            "Hong Kong"
        ],
        "code": "HKD",
        "name": "Hong Kong Dollar",
        "symbol": "$",
        "number": "344",
        "digits": 2
    },
    {
        "objectId": "TV2vBHzGjp",
        "countries": [
            "Hungary"
        ],
        "code": "HUF",
        "name": "Hungarian Forint",
        "symbol": "Ft",
        "number": "348",
        "digits": 2
    },
    {
        "objectId": "WeBzZwRtwN",
        "countries": [
            "Bhutan",
            "India"
        ],
        "code": "INR",
        "name": "Indian Rupee",
        "symbol": "₨",
        "number": "356",
        "digits": 2
    },
    {
        "objectId": "t3CBIeE2QP",
        "countries": [
            "Indonesia"
        ],
        "code": "IDR",
        "name": "Indonesian Rupiah",
        "symbol": "Rp",
        "number": "360",
        "digits": 2
    },
    {
        "objectId": "qYRQkxPQAe",
        "countries": [
            "Israel"
        ],
        "code": "ILS",
        "name": "Israeli Shekel",
        "symbol": "₪",
        "number": "376",
        "digits": 2
    },
    {
        "objectId": "snFU4HpfRT",
        "countries": [
            "Japan"
        ],
        "code": "JPY",
        "name": "Japanese Yen",
        "symbol": "¥",
        "number": "392",
        "digits": 0
    },
    {
        "objectId": "zlUNo5tpFF",
        "countries": [
            "Korea (The Republic Of)"
        ],
        "code": "KRW",
        "name": "Korean Won",
        "symbol": "₩",
        "number": "410",
        "digits": 0
    },
    {
        "objectId": "2H1P3LLxYJ",
        "code": "LVL",
        "name": "Latvian Lat",
        "symbol": "Ls"
    },
    {
        "objectId": "oCBUychpve",
        "code": "LTL",
        "name": "Lithuanian Litas",
        "symbol": "Lt"
    },
    {
        "objectId": "55lEsRJQI4",
        "countries": [
            "Malaysia"
        ],
        "code": "MYR",
        "name": "Malaysian Ringgit",
        "symbol": "RM",
        "number": "458",
        "digits": 2
    },
    {
        "objectId": "RXBuUv0lAd",
        "countries": [
            "Mexico"
        ],
        "code": "MXN",
        "name": "Mexican Peso",
        "symbol": "$",
        "number": "484",
        "digits": 2
    },
    {
        "objectId": "uEogXWRJgr",
        "countries": [
            "Cook Islands (The)",
            "New Zealand",
            "Niue",
            "Pitcairn",
            "Tokelau"
        ],
        "code": "NZD",
        "name": "New Zealand Dollar",
        "symbol": "$",
        "number": "554",
        "digits": 2
    },
    {
        "objectId": "6XMXePWblU",
        "countries": [
            "Bouvet Island",
            "Norway",
            "Svalbard And Jan Mayen"
        ],
        "code": "NOK",
        "name": "Norwegian Krone",
        "symbol": "kr",
        "number": "578",
        "digits": 2
    },
    {
        "objectId": "6z6Glv3LZA",
        "countries": [
            "Philippines (The)"
        ],
        "code": "PHP",
        "name": "Philippine Peso",
        "symbol": "₱",
        "number": "608",
        "digits": 2
    },
    {
        "objectId": "ZdUOSh0QI6",
        "countries": [
            "Poland"
        ],
        "code": "PLN",
        "name": "Polish Zloty",
        "symbol": "zł",
        "number": "985",
        "digits": 2
    },
    {
        "objectId": "riDd8Lkhsw",
        "countries": [
            "Romania"
        ],
        "code": "RON",
        "name": "Romanian New Leu",
        "symbol": "lei",
        "number": "946",
        "digits": 2
    },
    {
        "objectId": "DcVKo9Ojv5",
        "countries": [
            "Russian Federation (The)"
        ],
        "code": "RUB",
        "name": "Russian Ruble",
        "symbol": "руб",
        "number": "643",
        "digits": 2
    },
    {
        "objectId": "tBj7JXEnO9",
        "countries": [
            "Singapore"
        ],
        "code": "SGD",
        "name": "Singaporean Dollar",
        "symbol": "$",
        "number": "702",
        "digits": 2
    },
    {
        "objectId": "loU9SOoRol",
        "countries": [
            "Lesotho",
            "Namibia",
            "South Africa"
        ],
        "code": "ZAR",
        "name": "South African Rand",
        "symbol": "R",
        "number": "710",
        "digits": 2
    },
    {
        "objectId": "OkauKZGxXk",
        "countries": [
            "Sweden"
        ],
        "code": "SEK",
        "name": "Swedish Krona",
        "symbol": "kr",
        "number": "752",
        "digits": 2
    },
    {
        "objectId": "5BOKzLCh7R",
        "countries": [
            "Liechtenstein",
            "Switzerland"
        ],
        "code": "CHF",
        "name": "Swiss Franc",
        "symbol": "CHF",
        "number": "756",
        "digits": 2
    },
    {
        "objectId": "ld7myjUVwR",
        "countries": [
            "Thailand"
        ],
        "code": "THB",
        "name": "Thai Baht",
        "symbol": "฿",
        "number": "764",
        "digits": 2
    },
    {
        "objectId": "G4IxyJYO8Q",
        "countries": [
            "Turkey"
        ],
        "code": "TRY",
        "name": "Turkish Lira",
        "symbol": "₤",
        "number": "949",
        "digits": 2
    },
    {
        "objectId": "Dnx35cmKrl",
        "countries": [
            "Guernsey",
            "Isle Of Man",
            "Jersey",
            "United Kingdom Of Great Britain And Northern Ireland (The)"
        ],
        "code": "GBP",
        "name": "UK Pound",
        "symbol": "£",
        "number": "826",
        "digits": 2
    },
    {
        "objectId": "TDd0lQEmfH",
        "countries": [
            "American Samoa",
            "Bonaire, Sint Eustatius And Saba",
            "British Indian Ocean Territory (The)",
            "Ecuador",
            "El Salvador",
            "Guam",
            "Haiti",
            "Marshall Islands (The)",
            "Micronesia (Federated States Of)",
            "Northern Mariana Islands (The)",
            "Palau",
            "Panama",
            "Puerto Rico",
            "Timor-Leste",
            "Turks And Caicos Islands (The)",
            "United States Minor Outlying Islands (The)",
            "United States Of America (The)",
            "Virgin Islands (British)",
            "Virgin Islands (U.S.)"
        ],
        "code": "USD",
        "name": "US Dollar",
        "symbol": "$",
        "number": "840",
        "digits": 2
    }
]