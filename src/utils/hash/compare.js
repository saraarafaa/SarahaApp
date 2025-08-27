import bcrypt from 'bcrypt'

export const compareValue = async({plainText, cipherText}) =>{
  return bcrypt.compareSync(plainText, cipherText)
}