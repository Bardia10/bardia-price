export const formatPrice = (price: number) =>
  `${Math.round(price / 10).toLocaleString()} تومان`;
