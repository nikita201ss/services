export const formatPhoneNumber = (phone) => {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 11) {
    // +7 (XXX) XXX-XX-XX
    return `+7 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 9)}-${cleaned.slice(9, 11)}`;
  } else if (cleaned.length === 10) {
    // 8 (XXX) XXX-XX-XX
    return `8 (${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 8)}-${cleaned.slice(8, 10)}`;
  } else if (cleaned.length === 7) {
    // XXX-XX-XX
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 5)}-${cleaned.slice(5, 7)}`;
  }
  
  return phone;
};