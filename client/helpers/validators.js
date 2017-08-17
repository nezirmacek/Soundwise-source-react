/**
 * Created by developer on 08.08.17.
 */
import * as CONFIG from '../config/regexp_config';

export function minLengthValidator (limit, value) {
    return value.length < limit && `Minimal length is ${limit}` || '';
}

export function maxLengthValidator (limit, value) {
    return value.length > limit && `Maximal length is ${limit} characters` || '';
}

export function minValidator (limit, value) {
    return numberValidator(value) || (+value < limit && `Minimal value is ${limit}`) || '';
}

export function maxValidator (limit, value) {
    return numberValidator(value) || (+value > limit && `Maximal value is ${limit}`) || '';
}

// type validators

export function numberValidator (value) {
    return isNaN(+value) && 'Must be a number' || '';
}

export function emailValidator (value) {
    return !value.match(CONFIG.email) && 'Must be an email' || '';
}
