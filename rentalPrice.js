
const BASE_PRICES = {
    Compact: 25,
    Electric: 35,
    Cabrio: 50,
    Racer: 100,
};

function normalizeType(type) {
    if (!type) return 'Unknown';
    const t = String(type).toLowerCase();
    switch (t) {
        case 'compact':
            return 'Compact';
        case 'electric':
            return 'Electric';
        case 'cabrio':
            return 'Cabrio';
        case 'racer':
            return 'Racer';
        default:
            return 'Unknown';
    }
}

function getDays(pickupDate, dropoffDate) {
    const oneDay = 24 * 60 * 60 * 1000;
    const first = new Date(pickupDate);
    const second = new Date(dropoffDate);
    const diff = Math.abs((second - first) / oneDay);
    return Math.max(1, Math.round(diff) + 1);
}

function isHighSeason(pickupDate, dropoffDate) {
    const pickup = new Date(pickupDate);
    const dropoff = new Date(dropoffDate);

    // months are 0-based (0 = January)
    const start = 4; // May
    const end = 10; // November

    const p = pickup.getMonth();
    const d = dropoff.getMonth();

    return (
        (p >= start && p <= end) ||
        (d >= start && d <= end) ||
        (p < start && d > end)
    );
}
function parseToLocalDate(input) {
    if (!input) return new Date(NaN);
    if (input instanceof Date) return new Date(input.getFullYear(), input.getMonth(), input.getDate());
    if (typeof input === 'number') {
        const d = new Date(input);
        return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    }
    // Try ISO YYYY-MM-DD first to avoid timezone parsing quirks
    const iso = String(input).trim();
    const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (m) {
        return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    }
    const d = new Date(input);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function countWeekendDays(pickupDate, dropoffDate) {
    const start = parseToLocalDate(pickupDate);
    const end = parseToLocalDate(dropoffDate);
    let count = 0;
    const current = new Date(start);
    // iterate inclusive
    while (current <= end) {
        const d = current.getDay(); // 0 = Sunday, 6 = Saturday
        if (d === 0 || d === 6) count += 1;
        current.setDate(current.getDate() + 1);
    }
    return count;
}

function calculatePrice({ pickup, dropoff, pickupDate, dropoffDate, type, age }) {
    const carClass = normalizeType(type);
    if (age < 18) {
        return { success: false, message: 'Driver too young - cannot quote the price' };
    }
    if (age <= 21 && carClass !== 'Compact') {
        return { success: false, message: 'Drivers 21 y/o or less can only rent Compact vehicles' };
    }

    const days = getDays(pickupDate, dropoffDate);
    let perDay = BASE_PRICES[carClass] ?? 0;
    const high = isHighSeason(pickupDate, dropoffDate);

    if (carClass === 'Racer' && age <= 25 && high) {
        perDay *= 1.5;
    }

    if (high) {
        perDay *= 1.15;
    }

    // weekend surcharge: 10% per weekend day
    const weekendDays = countWeekendDays(pickupDate, dropoffDate);
    const WEEKEND_SURCHARGE = 0.1;

    let total = perDay * days + perDay * WEEKEND_SURCHARGE * weekendDays;
    // debug: expose weekendDays in result for test validation if needed
    // console.log('DEBUG weekendDays:', weekendDays);
    if (days > 10 && !high) {
        total *= 0.9; // 10% discount for long low-season rentals
    }

    return {
        success: true,
        carClass,
        days,
        weekendDays,
        perDay: Number(perDay.toFixed(2)),
        total: Number(total.toFixed(2)),
    };
}

exports.calculatePrice = calculatePrice;
exports.countWeekendDays = countWeekendDays;
exports.parseToLocalDate = parseToLocalDate;