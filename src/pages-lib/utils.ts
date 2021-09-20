import moment from "moment";

export function currency(input: number) {
    var formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      
        // These options are needed to round to whole numbers if that's what you want.
        minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
        maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
    });

    return formatter.format(input).replace(',', '.');
}

/**
 * @param format momentjs compatible format. Defaults to DD/MM/YY
 */
export function date(input: string | Date, format: string = 'DD/MM/YY') {
    return moment(input).format(format);
}
