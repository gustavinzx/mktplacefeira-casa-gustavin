export function validateCPF(cpf: string): boolean {
  cpf = cpf.replace(/[^\d]+/g, '');
  if (cpf.length !== 11 || !!cpf.match(/(\d)\1{10}/)) return false;
  
  const cpfArr = cpf.split('').map(el => +el);
  const rest = (count: number) => (
    cpfArr.slice(0, count - 12)
      .reduce((soma, el, index) => (soma + el * (count - index)), 0) * 10
  ) % 11 % 10;

  return rest(10) === cpfArr[9] && rest(11) === cpfArr[10];
}

export function validateCNPJ(cnpj: string): boolean {
  cnpj = cnpj.replace(/[^\d]+/g, '');
  if (cnpj.length !== 14 || !!cnpj.match(/(\d)\1{13}/)) return false;

  const size = cnpj.length - 2;
  const numbers = cnpj.substring(0, size);
  const digits = cnpj.substring(size);
  let sum = 0;
  let pos = size - 7;

  for (let i = size; i >= 1; i--) {
    sum += +numbers.charAt(size - i) * pos--;
    if (pos < 2) pos = 9;
  }

  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== +digits.charAt(0)) return false;

  const size2 = size + 1;
  const numbers2 = cnpj.substring(0, size2);
  let sum2 = 0;
  let pos2 = size2 - 7;

  for (let i = size2; i >= 1; i--) {
    sum2 += +numbers2.charAt(size2 - i) * pos2--;
    if (pos2 < 2) pos2 = 9;
  }

  let result2 = sum2 % 11 < 2 ? 0 : 11 - (sum2 % 11);
  return result2 === +digits.charAt(1);
}
