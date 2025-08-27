import CryptoJS from "crypto-js"

export const Decrypt = async({plainText, secretKey}) =>{
  return CryptoJS.AES.decrypt(plainText, secretKey).toString(CryptoJS.enc.Utf8)
}