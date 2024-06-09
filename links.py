from enum import Enum


class CheckType(Enum):
    AVAILABILITY = 1
    EBAY_PRICE_THRESHOLD = 2


links = [
    {
        "url": "https://gear.bethesda.net/products/fallout-nuka-grape-glass-bottle-cap",
        "alias": "Grape Glass Bottle",
        "type": CheckType.AVAILABILITY,
        "is_available": None,
        "text_when_unavailable": "Notify Me When Available",
    },
    {
        "url": "https://gear.bethesda.net/products/fallout-nuka-cola-glass-bottle-cap",
        "alias": "Nuka Cola Glass Bottle",
        "type": CheckType.AVAILABILITY,
        "is_available": None,
        "text_when_unavailable": "Notify Me When Available",
    },
    {
        "url": "https://gear.bethesda.net/products/fallout-bottle-cap-series-nuka-cola-with-collectible-tin",
        "alias": "Nuka Cola Caps Tin",
        "type": CheckType.AVAILABILITY,
        "is_available": None,
        "text_when_unavailable": "Notify Me When Available",
    },
    {
        "url": "https://gear.bethesda.net/products/fallout-nuka-cola-quantum-glass-bottle-and-cap",
        "alias": "Quantum Glass Bottle",
        "type": CheckType.AVAILABILITY,
        "is_available": None,
        "text_when_unavailable": "Notify Me When Available",
    },
    {
        "url": "https://gear.bethesda.net/products/fallout-nuka-quantum-bottle-caps-with-collectible-tin",
        "alias": "Quantum Bottle Caps Tin",
        "type": CheckType.AVAILABILITY,
        "is_available": None,
        "text_when_unavailable": "sNotify Me When Available",
    },
    {
        "url": "https://gear.bethesda.net/products/fallout-nuka-cherry-glass-bottle-cap",
        "alias": "Cherry Glass Bottle",
        "type": CheckType.AVAILABILITY,
        "is_available": None,
        "text_when_unavailable": "Notify Me When Available",
    },
    {
        "url": "https://gear.bethesda.net/products/fallout-bottle-cap-series-nuka-cherry-with-collectible-tin",
        "alias": "Cherry Caps Tin",
        "type": CheckType.AVAILABILITY,
        "is_available": None,
        "text_when_unavailable": "Notify Me When Available",
    },
    {
        "url": "https://gear.bethesda.net/products/fallout-nuka-cola-wild-glass-bottle-and-cap",
        "alias": "Wild Glass Bottle",
        "type": CheckType.AVAILABILITY,
        "is_available": None,
        "text_when_unavailable": "Notify Me When Available",
    },
    {
        "url": "https://gear.bethesda.net/products/fallout-bottle-cap-series-nuka-wild-with-collectible-tin",
        "alias": "Wild Caps Tin",
        "type": CheckType.AVAILABILITY,
        "is_available": None,
        "text_when_unavailable": "Notify Me When Available",
    },
    {
        "url": "https://www.ebay.com/sch/i.html?_from=R40&_nkw=Psyduck+286+psa+7&_sacat=0&_sop=15&rt=nc&LH_BIN=1",
        "alias": "Psyduck 286 PSA 7",
        "type": CheckType.EBAY_PRICE_THRESHOLD,
        "is_available": None,
        "threshold": 270,
        "found_price": None,
    },
    {
        "url": "https://www.ebay.com/sch/i.html?_from=R40&_nkw=Psyduck+286+psa+8&_sacat=0&_sop=15&rt=nc&LH_BIN=1",
        "alias": "Psyduck 286 PSA 8",
        "type": CheckType.EBAY_PRICE_THRESHOLD,
        "is_available": None,
        "threshold": 270,
        "found_price": None,
    },
    {
        "url": "https://www.ebay.com/sch/i.html?_from=R40&_nkw=Psyduck+286+psa+9&_sacat=0&_sop=15&rt=nc&LH_BIN=1",
        "alias": "Psyduck 286 PSA 9",
        "type": CheckType.EBAY_PRICE_THRESHOLD,
        "is_available": None,
        "threshold": 300,
        "found_price": None,
    },
    {
        "url": "https://www.ebay.com/sch/i.html?_from=R40&_nkw=Psyduck+286+psa+10&_sacat=0&_sop=15&rt=nc&LH_BIN=1",
        "alias": "Psyduck 286 PSA 10",
        "type": CheckType.EBAY_PRICE_THRESHOLD,
        "is_available": None,
        "threshold": 500,
        "found_price": None,
    },
    {
        "url": "https://www.ebay.com/sch/i.html?_from=R40&_nkw=Cramorant+226+psa+9&_sacat=0&_sop=15&rt=nc&LH_BIN=1",
        "alias": "Cramorant 226 PSA 9",
        "type": CheckType.EBAY_PRICE_THRESHOLD,
        "is_available": None,
        "threshold": 70,
        "found_price": None,
    },
    {
        "url": "https://www.ebay.com/sch/i.html?_from=R40&_nkw=Cramorant+226+psa+10&_sacat=0&_sop=15&rt=nc&LH_BIN=1",
        "alias": "Cramorant 226 PSA 10",
        "type": CheckType.EBAY_PRICE_THRESHOLD,
        "is_available": None,
        "threshold": 900,
        "found_price": None,
    },
    {
        "url": "https://www.ebay.com/sch/i.html?_from=R40&_nkw=pikachu+227%2Fs-p+psa+9&_sacat=0&_sop=15&rt=nc&LH_BIN=1",
        "alias": "Pikachu 227 PSA 9",
        "type": CheckType.EBAY_PRICE_THRESHOLD,
        "is_available": None,
        "threshold": 2700,
        "found_price": None,
    },
    {
        "url": "https://www.ebay.com/sch/i.html?_from=R40&_nkw=pikachu+227%2Fs-p+psa10&_sacat=0&rt=nc&_odkw=pikachu+227%2Fs-p+psa+10&_osacat=0&LH_BIN=1&_sop=15",
        "alias": "Pikachu 227 PSA 10",
        "type": CheckType.EBAY_PRICE_THRESHOLD,
        "is_available": None,
        "threshold": 320,
        "found_price": None,
    },
]
