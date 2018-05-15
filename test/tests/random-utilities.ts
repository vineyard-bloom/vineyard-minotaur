import {BigNumber} from 'bignumber.js'

export function getRandomIntInclusive(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive
}

export function getRandomBigNumberInclusive(min: number, max: number): BigNumber {
    min = Math.ceil(min);
    max = Math.floor(max);
    return new BigNumber(Math.floor(Math.random() * (max - min + 1)) + min);
}

export function getRandomString(length: number): string {
    let text = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < length; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

export function getRandomEmail(): string {
    return getRandomString(6).concat("@").concat(getRandomString(4)).concat(".com");
}

export function getRandomZip(): string {
    let toReturn = ""
    for(let i = 0; i < 5; i++){
        toReturn += getRandomIntInclusive(0, 9);
    }
    return toReturn;
}

export function getRandomBool(): boolean {
    return getRandomIntInclusive(0,1) > 0;
}

export function getRandomDateOfBirth(year = getRandomIntInclusive(1920, 1998), month = getRandomIntInclusive(1, 9), day = getRandomIntInclusive(10, 28)): string {
    return "" + year + "-0" + month + "-" + day
}

export function getRandomEnumKey (enumClass: any) {
  const keys = Object.keys(enumClass)
  const total = keys.length
  const half = total / 2

  return Object.keys(enumClass)[getRandomIntInclusive(half, total - 1)]
}

export function getRandomEnumValue (enumClass: any) {
  const key = getRandomEnumKey(enumClass)
  return enumClass[key]
}