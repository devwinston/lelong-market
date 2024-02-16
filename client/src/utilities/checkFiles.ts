export const checkFiles = (
  files: FileList,
  length: number,
  size: number
): boolean => {
  const checkLength = files.length <= length;
  const checkSize = !Array.from(files).some(
    (file) => file.size > size * 1024 * 1024
  );

  return checkLength && checkSize;
};
