export const getBenchmarkDisplayName = (fullName: string, showClass: boolean): string => {
  if (showClass || !fullName.includes('.')) {
    return fullName;
  }
  return fullName.substring(fullName.lastIndexOf('.') + 1);
};
