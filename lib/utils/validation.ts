/**
 * 生年月日から18歳以上かどうかを判定する
 */
export function isAdult(birthdate: string): boolean {
  const birth = new Date(birthdate)
  const today = new Date()
  const age18 = new Date(birth.getFullYear() + 18, birth.getMonth(), birth.getDate())
  return today >= age18
}

/**
 * パスワードが8文字以上かどうかを判定する
 */
export function isValidPassword(password: string): boolean {
  return password.length >= 8
}

/**
 * ニックネームが1〜20文字かどうかを判定する
 */
export function isValidNickname(nickname: string): boolean {
  return nickname.length >= 1 && nickname.length <= 20
}
